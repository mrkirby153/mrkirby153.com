import useSwr from "swr";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetcher } from "./utils";
import * as satellite from "satellite.js";

export const ISS_CATNR = "25544";

export type SatellitePosition = {
  lat: number;
  lon: number;
  alt: number;
};

// Version the key so future cache formats can change safely.
const CACHE_VERSION = 1;
const CACHE_MAX_AGE = 12 * 60 * 60 * 1000;
const RETRY_DELAY = 60 * 60 * 1000;
const cacheKey = (object: string) => `iss:elements:v${CACHE_VERSION}:${object}`;

function readCache(object: string) {
  try {
    const saved = localStorage.getItem(cacheKey(object));
    if (!saved) return null;
    const cache = JSON.parse(saved);
    if (
      Array.isArray(cache.data) &&
      cache.data[0]?.EPOCH &&
      Number.isFinite(Number(cache.data[0]?.MEAN_MOTION)) &&
      Number.isFinite(cache.savedAt) &&
      cache.savedAt <= Date.now()
    )
      return cache;
  } catch {
    // Could not read or parse the cache. Ignore
  }
  return null;
}

export function useCelestrackElements(object: string) {
  const [ready, setReady] = useState(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  // Tracks if the elements were saved to local storage
  const [saved, setSaved] = useState(false);

  const forceRefresh = useRef(false);
  const lastAttempt = useRef(0);
  const memoryCache = useRef<ReturnType<typeof readCache>>(null);
  const [initialData, setInitialData] = useState<
    Awaited<ReturnType<typeof fetcher>> | undefined
  >(undefined);

  useEffect(() => {
    const cache = readCache(object);
    memoryCache.current = cache;
    setInitialData(cache?.data);
    setCachedAt(cache?.savedAt ?? null);
    lastAttempt.current = 0;
    setReady(true);
  }, [object]);

  const load = useCallback(
    async (url: string) => {
      const cache = readCache(object) ?? memoryCache.current;
      if (
        !forceRefresh.current &&
        cache &&
        Date.now() - cache.savedAt < CACHE_MAX_AGE
      ) {
        setCachedAt(cache.savedAt);
        return cache.data;
      }
      lastAttempt.current = Date.now();
      const data = await fetcher(url);
      const savedAt = Date.now();
      memoryCache.current = { data, savedAt };
      setCachedAt(savedAt);
      try {
        localStorage.setItem(
          cacheKey(object),
          JSON.stringify({ data, savedAt }),
        );
        setSaved(true);
      } catch (e) {
        console.error("Unable to save elements to local storage.", e);
      }
      return data;
    },
    [object],
  );

  const result = useSwr(
    ready
      ? `https://celestrak.org/NORAD/elements/gp.php?CATNR=${object}&FORMAT=JSON`
      : null,
    load,
    {
      fallbackData: initialData,
      // Polling checks local cache age; downloads occur only after expiry.
      refreshInterval: 60_000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    },
  );

  // SWR stops interval revalidation after an error. Retry failed automatic
  // downloads at most hourly, rather than on every render or focus change.
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      if (
        result.error &&
        !result.isValidating &&
        Date.now() - lastAttempt.current >= RETRY_DELAY
      )
        void result.mutate();
    }, 60_000);
    return () => clearInterval(id);
  }, [ready, result.error, result.isValidating, result.mutate]);

  async function refresh() {
    if (!ready || result.isValidating || forceRefresh.current) return;
    forceRefresh.current = true;
    try {
      await result.mutate();
    } finally {
      forceRefresh.current = false;
    }
  }
  return { ...result, refresh, cachedAt, saved };
}

export function calculate(
  elements: satellite.SatRec,
  time: Date,
): SatellitePosition | null {
  const state = satellite.propagate(elements, time);
  if (!state) {
    // Could not propagate the satellite position
    return null;
  }
  const gmst = satellite.gstime(time);
  const geographic = satellite.eciToGeodetic(state.position, gmst);
  const lat = satellite.degreesLat(geographic.latitude);
  const lon = satellite.degreesLong(geographic.longitude);
  return { lat, lon, alt: geographic.height };
}
