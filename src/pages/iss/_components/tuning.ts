import type { SatRec } from "satellite.js";
import { dopplerAt, tunedFrequency, type Observer, type Pass } from "./passes";

export function tuningSchedule(
  record: SatRec,
  observer: Observer,
  pass: Pass,
  nominal: number,
  step: number,
  uplink: boolean,
) {
  const rows: { time: number; tuned: number }[] = [];
  for (let time = pass.start; time <= pass.end; time += 1000) {
    const { tuned } = tunedFrequency(
      nominal,
      step,
      dopplerAt(record, observer, time),
      uplink,
    );
    if (rows.at(-1)?.tuned !== tuned) rows.push({ time, tuned });
  }
  return rows;
}
