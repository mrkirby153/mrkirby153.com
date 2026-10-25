import { useEffect, useMemo, useRef, useState } from "react";
import * as satellite from "satellite.js";
import { calculate, ISS_CATNR, useCelestrackElements } from "./orbit";
import { useShallow } from "zustand/shallow";
import {
  findPasses,
  lookAt,
  rangeRate,
  tunedFrequency,
  type Observer,
} from "./passes";
import { useIssStore } from "./store";
import PassCountdownClock from "./PassCountdownClock";

const date = (ms: number) =>
  new Date(ms).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

type GeoLocating =
  | {
      loading: true;
    }
  | {
      loading: false;
      error: string;
    }
  | {
      loading: false;
      position: {
        lat: number;
        lon: number;
        alt: number;
      };
    };

export default function IssTracker() {
  const { data, error, refresh, isValidating, cachedAt, saved } =
    useCelestrackElements(ISS_CATNR);

  const loadDoplerFromStorage = useIssStore(
    (store) => store.loadDopplerFromLocalStorage,
  );
  const loadPositionFromStorage = useIssStore(
    (store) => store.loadPositionFromLocalStorage,
  );
  const { observer, setObserver } = useIssStore(
    useShallow((store) => ({
      observer: store.position,
      setObserver: store.setPosition,
    })),
  );

  const setSateliteRecord = useIssStore((store) => store.setSateliteRecord);
  const satelliteRecord = useIssStore((store) => store.record);
  const calculatePasses = useIssStore((store) => store.calculatePasses);

  const [geolocating, setGeolocating] = useState<GeoLocating | null>(null);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Load stored data (if any)
    loadDoplerFromStorage();
    loadPositionFromStorage();
  }, []);

  useEffect(() => {
    if (!geolocating) return;
    if (geolocating.loading == false) {
      if ("position" in geolocating) {
        const pos = geolocating.position;
        setObserver(pos.lat, pos.lon, pos.alt);
      }
    }
  }, [geolocating]);

  useEffect(() => {
    try {
      const record = data?.[0] ? satellite.json2satrec(data[0]) : null;
      setSateliteRecord(record);
    } catch {
      setSateliteRecord(null);
    }
  }, [data, setSateliteRecord]);

  useEffect(() => {
    if (!satelliteRecord || !observer) return;
    calculatePasses(satelliteRecord, observer, now);
  }, [satelliteRecord, observer, calculatePasses, now]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function geolocate() {
    setGeolocating({ loading: true });
    try {
      if (!navigator.geolocation) {
        setGeolocating({
          loading: false,
          error: "Geolocation is not supported by this browser.",
        });
        return;
      }
      const p = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 15_000,
          maximumAge: 60_000,
          enableHighAccuracy: true,
        });
      });
      setGeolocating({
        loading: false,
        position: {
          lat: p.coords.latitude,
          lon: p.coords.longitude,
          alt: p.coords.altitude ?? 0,
        },
      });
    } catch (e) {
      setGeolocating({
        loading: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
  return (
    <div>
      <button onClick={geolocate}>Geolocate</button>
      <PassCountdownClock now={now} />
    </div>
  );
}
