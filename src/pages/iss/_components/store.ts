import { create } from "zustand";
import { useMemo } from "react";
import { json2satrec, type SatRec } from "satellite.js";
import { calculate, ISS_CATNR } from "./orbit";
import {
  findPasses,
  lookAt,
  dopplerAt,
  tunedFrequency,
  type Observer,
  type Pass,
} from "./passes";
import { fetcher } from "./utils";

export type Doppler = { freq: string; step: string; direction: "rx" | "tx" };
type State = {
  now: number | null;
  position: Observer | null;
  minAltitude: number;
  doppler: Doppler;
  selectedPass: string | null;
  passes: Pass[];
  record: SatRec | null;
  predictionTime: number | null;
  predictionError: string | null;
  orbitalError: string | null;
  epoch: string | null;
  cachedAt: number | null;
  saved: boolean;
  refreshing: boolean;
  locating: boolean;
  locationError: string | null;
};
type Actions = {
  initialize: () => void;
  tick: () => void;
  refreshElements: (force?: boolean) => Promise<void>;
  setPosition: (lat: number, lon: number, alt: number) => void;
  locate: () => Promise<void>;
  setMinimumAltitude: (value: number) => void;
  setDoppler: (value: Partial<Doppler>) => void;
  selectPass: (id: string | null) => void;
  calculatePasses: (
    record?: SatRec,
    position?: Observer,
    time?: number,
  ) => void;
  // Kept for the saved refactor reference.
  setSateliteRecord: (record: SatRec | null) => void;
  loadPositionFromLocalStorage: () => void;
  loadDopplerFromLocalStorage: () => void;
};

const CACHE_KEY = `iss:elements:v1:${ISS_CATNR}`;
const CACHE_MAX_AGE = 12 * 60 * 60_000;
const RETRY_DELAY = 60 * 60_000;
let lastAttempt = 0;
function readStored(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}
function saveStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function validPosition(lat: number, lon: number, alt: number) {
  return (
    Number.isFinite(lat) &&
    Math.abs(lat) <= 90 &&
    Number.isFinite(lon) &&
    Math.abs(lon) <= 180 &&
    Number.isFinite(alt) &&
    alt >= -500 &&
    alt <= 10000
  );
}
function parseElements(data: Awaited<ReturnType<typeof fetcher>>) {
  const record = json2satrec(data[0]);
  if (!Number.isFinite(record.no) || !calculate(record, new Date()))
    throw new Error("Invalid orbital elements.");
  return { record, epoch: String(data[0].EPOCH) };
}

export const useIssStore = create<State & Actions>()((set, get) => ({
  now: null,
  position: null,
  minAltitude: 10,
  doppler: { freq: "437.800", step: "5", direction: "rx" },
  selectedPass: null,
  passes: [],
  record: null,
  predictionTime: null,
  predictionError: null,
  orbitalError: null,
  epoch: null,
  cachedAt: null,
  saved: false,
  refreshing: false,
  locating: false,
  locationError: null,
  initialize: () => {
    set({ now: Date.now() });
    get().loadPositionFromLocalStorage();
    get().loadDopplerFromLocalStorage();
    const cache = readStored(CACHE_KEY) as {
      data?: unknown;
      savedAt?: number;
    } | null;
    if (
      cache &&
      Number.isFinite(cache.savedAt) &&
      cache.savedAt! <= Date.now()
    ) {
      try {
        const data = cache.data as Awaited<ReturnType<typeof fetcher>>;
        if (!Array.isArray(data) || !data[0]?.EPOCH)
          throw new Error("Invalid cache");
        set({ ...parseElements(data), cachedAt: cache.savedAt, saved: true });
      } catch {
        /* Ignore invalid cached elements. */
      }
    }
    get().calculatePasses();
    void get().refreshElements();
  },
  tick: () => {
    const now = Date.now();
    set({ now });
    const state = get();
    if (
      state.record &&
      state.position &&
      (state.predictionTime === null ||
        now - state.predictionTime >= 60 * 60_000)
    )
      state.calculatePasses();
    if (
      !state.refreshing &&
      now - lastAttempt >= (state.orbitalError ? RETRY_DELAY : 60_000)
    )
      void state.refreshElements();
  },
  refreshElements: async (force = false) => {
    const { refreshing, record, cachedAt } = get();
    if (
      refreshing ||
      (!force && record && cachedAt && Date.now() - cachedAt < CACHE_MAX_AGE)
    )
      return;
    lastAttempt = Date.now();
    set({ refreshing: true });
    try {
      const data = await fetcher(
        `https://celestrak.org/NORAD/elements/gp.php?CATNR=${ISS_CATNR}&FORMAT=JSON`,
      );
      const elements = parseElements(data);
      const savedAt = Date.now();
      const saved = saveStored(CACHE_KEY, { data, savedAt });
      set({ ...elements, cachedAt: savedAt, saved, orbitalError: null });
      get().calculatePasses();
    } catch (error) {
      set({
        orbitalError: error instanceof Error ? error.message : String(error),
      });
    } finally {
      set({ refreshing: false });
    }
  },
  setPosition: (lat, lon, alt) => {
    if (!validPosition(lat, lon, alt)) {
      set({
        locationError:
          "Enter valid coordinates and an altitude between -500 and 10,000 m.",
      });
      return;
    }
    set({
      position: { latitude: lat, longitude: lon, altitudeMeters: alt },
      locationError: null,
      selectedPass: null,
    });
    saveStored("station_position", { lat, lon, alt });
    get().calculatePasses();
  },
  loadPositionFromLocalStorage: () => {
    const value = readStored("station_position") as {
      lat: number;
      lon: number;
      alt: number;
    } | null;
    if (value && validPosition(value.lat, value.lon, value.alt))
      set({
        position: {
          latitude: value.lat,
          longitude: value.lon,
          altitudeMeters: value.alt,
        },
      });
  },
  loadDopplerFromLocalStorage: () => {
    const value = readStored("station_doppler") as {
      freq: unknown;
      step: unknown;
      direction: unknown;
    } | null;
    if (
      value &&
      Number(value.freq) > 0 &&
      Number(value.step) > 0 &&
      Number.isFinite(Number(value.freq)) &&
      Number.isFinite(Number(value.step))
    ) {
      set({
        doppler: {
          freq: String(value.freq),
          step: String(value.step),
          direction:
            value.direction === "tx" || value.direction === 1 ? "tx" : "rx",
        },
      });
    }
  },
  locate: async () => {
    if (get().locating) return;
    set({ locating: true, locationError: null });
    try {
      if (!navigator.geolocation)
        throw new Error("Geolocation is not supported by this browser.");
      const { coords } = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 15_000,
            maximumAge: 60_000,
            enableHighAccuracy: true,
          }),
      );
      get().setPosition(
        coords.latitude,
        coords.longitude,
        coords.altitude ?? 0,
      );
    } catch (error) {
      set({
        locationError:
          error instanceof Error
            ? error.message
            : "Unable to determine your location. Enter coordinates manually.",
      });
    } finally {
      set({ locating: false });
    }
  },
  setMinimumAltitude: (minAltitude) => {
    if (!Number.isFinite(minAltitude) || minAltitude < 0 || minAltitude > 90)
      return;
    set({ minAltitude, selectedPass: null });
    get().calculatePasses();
  },
  setDoppler: (value) => {
    const doppler = { ...get().doppler, ...value };
    set({ doppler });
    saveStored("station_doppler", doppler);
  },
  selectPass: (selectedPass) => set({ selectedPass }),
  setSateliteRecord: (record) => {
    set({ record });
    get().calculatePasses();
  },
  calculatePasses: (
    record = get().record ?? undefined,
    position = get().position ?? undefined,
    time = get().now ?? Date.now(),
  ) => {
    if (!record || !position) {
      set({ passes: [], predictionError: null, predictionTime: null });
      return;
    }
    try {
      const passes = findPasses(
        record,
        position,
        time - 20 * 60_000,
        get().minAltitude,
        48 + 1 / 3,
      );
      // Preserve selection across periodic prediction refreshes despite refined timestamps.
      const old = get().passes.find((p) => p.id === get().selectedPass);
      const selectedPass = old
        ? (passes.find(
            (p) => p.start < old.end && p.end > old.start && p.end > time,
          )?.id ?? null)
        : null;
      set({
        passes,
        predictionError: null,
        predictionTime: time,
        selectedPass,
      });
    } catch {
      set({
        passes: [],
        predictionError:
          "Unable to predict passes with these orbital elements.",
        predictionTime: time,
        selectedPass: null,
      });
    }
  },
}));

export function usePassInfo(nowOverride?: number) {
  const allPasses = useIssStore((s) => s.passes);
  const clock = useIssStore((s) => s.now);
  const selected = useIssStore((s) => s.selectedPass);
  const now = nowOverride ?? clock;
  const passes = useMemo(
    () =>
      now === null
        ? []
        : allPasses.filter(
            (p) => p.end > now && p.start < now + 48 * 60 * 60_000,
          ),
    [allPasses, now],
  );
  const nextPass = passes[0];
  const pass = passes.find((p) => p.id === selected) ?? nextPass;
  return {
    passes,
    nextPass,
    pass,
    active: !!nextPass && now !== null && nextPass.start <= now,
  };
}

export function useLiveTracking() {
  const record = useIssStore((s) => s.record);
  const observer = useIssStore((s) => s.position);
  const now = useIssStore((s) => s.now);
  const doppler = useIssStore((s) => s.doppler);
  return useMemo(() => {
    if (!record || now === null) return null;
    try {
      const position = calculate(record, new Date(now));
      const look = observer ? lookAt(record, observer, now) : null;
      const factor = observer ? dopplerAt(record, observer, now) : null;
      const tuning =
        factor !== null && validRadio(doppler)
          ? tunedFrequency(
              Number(doppler.freq) * 1e6,
              Number(doppler.step) * 1000,
              factor,
              doppler.direction === "tx",
            )
          : null;
      return { position, look, factor, tuning };
    } catch {
      return null;
    }
  }, [record, observer, now, doppler]);
}
export function validRadio(doppler: Doppler) {
  return (
    Number.isFinite(Number(doppler.freq)) &&
    Number(doppler.freq) > 0 &&
    Number.isFinite(Number(doppler.step)) &&
    Number(doppler.step) > 0
  );
}
