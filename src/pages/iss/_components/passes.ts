import * as satellite from "satellite.js";

export type Observer = {
  latitude: number;
  longitude: number;
  altitudeMeters: number;
};

export type Pass = {
  id: string;
  start: number;
  peak: number;
  end: number;
  maxElevation: number;
  ongoing: boolean;
  truncated: boolean;
};

export function lookAt(
  record: satellite.SatRec,
  observer: Observer,
  ms: number,
) {
  const time = new Date(ms);
  const state = satellite.propagate(record, time);
  if (!state) throw new Error("Unable to propagate orbital elements.");

  const position = satellite.eciToEcf(state.position, satellite.gstime(time));

  const observerGd = {
    latitude: satellite.degreesToRadians(observer.latitude),
    longitude: satellite.degreesToRadians(observer.longitude),
    height: observer.altitudeMeters / 1000,
  };

  const look = satellite.ecfToLookAngles(observerGd, position);
  return {
    elevation: satellite.radiansToDegrees(look.elevation),
    azimuth: satellite.radiansToDegrees(look.azimuth),
    range: look.rangeSat,
  };
}
export function rangeRate(
  record: satellite.SatRec,
  observer: Observer,
  ms: number,
) {
  return (
    lookAt(record, observer, ms + 500).range -
    lookAt(record, observer, ms - 500).range
  );
}
export function tunedFrequency(
  nominal: number,
  step: number,
  rate: number,
  uplink: boolean,
) {
  const factor = 1 - rate / 299792.458;
  const exact = uplink ? nominal / factor : nominal * factor;
  return {
    exact,
    tuned: nominal + Math.round((exact - nominal) / step) * step,
  };
}

const SEARCH_TOLERANCE = 250;
const SEARCH_STEP_INTERVAL_MS = 5000;

export function findPasses(
  record: satellite.SatRec,
  observer: Observer,
  start: number,
  minimum: number,
  hours = 48,
): Pass[] {
  const durationMs = hours * 60 * 60 * 1000;
  const end = start + durationMs;

  const elevation = (t: number) => lookAt(record, observer, t).elevation;

  function crossing(a: number, b: number) {
    const above = elevation(a) >= minimum;
    while (b - a > SEARCH_TOLERANCE) {
      // Binary search to find the crossing time within SEARCH_TOLERANCE
      const mid = (a + b) / 2;
      if (elevation(mid) >= minimum === above) a = mid;
      else b = mid;
    }
    // Return the midpoint of the final interval as the crossing time
    return (a + b) / 2;
  }

  function finish(
    a: number,
    b: number,
    ongoing: boolean,
    truncated: boolean,
  ): Pass {
    let lo = a,
      hi = b;
    // Use ternary search to find the peak elevation within the interval [lo, hi]
    while (hi - lo > SEARCH_TOLERANCE) {
      const x = lo + (hi - lo) / 3,
        y = hi - (hi - lo) / 3;
      if (elevation(x) < elevation(y)) lo = x;
      else hi = y;
    }
    const peak = (lo + hi) / 2;
    return {
      id: `${a}-${b}-${peak}`,
      start: a,
      end: b,
      peak,
      maxElevation: elevation(peak),
      ongoing,
      truncated,
    };
  }

  const passes: Pass[] = [];
  let previous = start,
    wasAbove = elevation(start) >= minimum;

  let passStart: number | null = wasAbove ? start : null;
  let ongoing = wasAbove;

  // Check for passes within a given time ramge. This loop steps through in time intervals of SEARCH_STEP_INTERVAL_MS
  for (
    let t = start + SEARCH_STEP_INTERVAL_MS;
    t <= end;
    t += SEARCH_STEP_INTERVAL_MS
  ) {
    // Determine if the satellite is above the minimum elevation at the current time step
    const above = elevation(t) >= minimum;
    if (above && !wasAbove) {
      // Satellite has just risen above the minimum elevation, find the exact crossing time
      passStart = crossing(previous, t);
      ongoing = false;
    }
    if (!above && wasAbove && passStart !== null) {
      // Satellite has crossed below the minimum elevation, find the exact crossing time
      passes.push(finish(passStart, crossing(previous, t), ongoing, false));
      passStart = null;
    }
    previous = t;
    wasAbove = above;
  }
  // Finish out any ongoing pass
  if (passStart !== null) passes.push(finish(passStart, end, ongoing, true));
  return passes;
}
