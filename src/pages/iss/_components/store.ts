import { create } from "zustand";
import { findPasses, type Observer, type Pass } from "./passes";
import type { SatRec } from "satellite.js";
import { useMemo } from "react";

enum DoplerDirection {
  Rx,
  Tx,
}

type State = {
  position: Observer | null;
  minAltitude: number;
  doppler: {
    freq: number;
    step: number;
    direction: DoplerDirection;
  } | null;

  selectedPass: string | null;
  passes: Pass[] | null;
  record: SatRec | null;
};

type Actions = {
  setPosition: (lat: number, lon: number, alt: number) => void;
  loadPositionFromLocalStorage: () => void;
  setDoppler: (freq: number, step: number, direction: DoplerDirection) => void;
  loadDopplerFromLocalStorage: () => void;
  selectPass: (id: string | null) => void;
  calculatePasses: (record: SatRec, position: Observer, time: number) => void;
  setSateliteRecord: (record: SatRec | null) => void;
};

type IssStore = State & Actions;

export const useIssStore = create<IssStore>()((set, get) => ({
  position: null,
  doppler: null,
  selectedPass: null,
  passes: null,
  record: null,
  minAltitude: 10,

  setPosition: (lat: number, lon: number, alt: number) => {
    set({
      position: { latitude: lat, longitude: lon, altitudeMeters: alt },
    });

    localStorage.setItem("station_position", JSON.stringify({ lat, lon, alt }));
  },
  loadPositionFromLocalStorage: () => {
    const storedPosition = localStorage.getItem("station_position");
    if (storedPosition) {
      try {
        const { lat, lon, alt } = JSON.parse(storedPosition);
        set({
          position: { latitude: lat, longitude: lon, altitudeMeters: alt },
        });
      } catch {
        /* Ignore JSON parse errors */
      }
    }
  },
  setDoppler: (freq: number, step: number, direction: DoplerDirection) => {
    set({
      doppler: { freq, step, direction },
    });

    localStorage.setItem(
      "station_doppler",
      JSON.stringify({ freq, step, direction }),
    );
  },
  loadDopplerFromLocalStorage: () => {
    const storedDoppler = localStorage.getItem("station_doppler");
    if (storedDoppler) {
      try {
        const { freq, step, direction } = JSON.parse(storedDoppler);
        set({
          doppler: { freq, step, direction },
        });
      } catch {
        /* Ignore JSON parse errors */
      }
    }
  },
  selectPass: (id: string | null) => {
    set({
      selectedPass: id,
    });
  },
  calculatePasses: (record: SatRec, position: Observer, time: number) => {
    if (!record || !position) return;
    const startTime = time - 20 * 60_000; // Start 20 minutes earlier
    const hours = 48 + 1 / 3; // Add 1/3 margin to capture any passes at the edge of the period
    try {
      const passes = findPasses(
        record,
        position,
        startTime,
        get().minAltitude,
        hours,
      );
      set({ passes });
    } catch {
      set({ passes: null });
    }
  },
  setSateliteRecord: (record) => {
    set({
      record,
    });
  },
}));

export const usePassInfo = (now: number) => {
  const allPasses = useIssStore((store) => store.passes);
  const passes = useMemo(
    () => (allPasses ?? []).filter((p) => p.end > now),
    [allPasses, now],
  );
  const nextPass = passes[0]; // TODO: Support selecting a specific pass
  const active = !!nextPass && nextPass.start <= now;
  return { passes, nextPass, active };
};
