import { useIssStore, useLiveTracking } from "./store";
import { button, heading, muted, section } from "./presentation";

export default function OrbitalStatus() {
  const now = useIssStore((s) => s.now);
  const record = useIssStore((s) => s.record);
  const refreshing = useIssStore((s) => s.refreshing);
  const refresh = useIssStore((s) => s.refreshElements);
  const cachedAt = useIssStore((s) => s.cachedAt);
  const saved = useIssStore((s) => s.saved);
  const epoch = useIssStore((s) => s.epoch);
  const error = useIssStore((s) => s.orbitalError);
  const live = useLiveTracking();
  const epochTime = epoch
    ? Date.parse(epoch.endsWith("Z") ? epoch : `${epoch}Z`)
    : null;
  return (
    <section className={section}>
      <h2 className={heading}>Current position</h2>
      <p className={muted}>
        As Of: {now === null ? "Connecting…" : new Date(now).toLocaleString()}
      </p>
      {live?.position ? (
        <dl className="my-4 flex flex-wrap gap-x-8 gap-y-4">
          {[
            ["Latitude", `${live.position.lat.toFixed(2)}°`],
            ["Longitude", `${live.position.lon.toFixed(2)}°`],
            ["Altitude", `${live.position.alt.toFixed(1)} km`],
          ].map(([name, value]) => (
            <div key={name}>
              <dt className={muted}>{name}</dt>
              <dd className="font-mono text-xl">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p role="status">
          {record
            ? "Unable to calculate position."
            : error
              ? "Unable to load orbital elements."
              : "Loading orbital elements…"}
        </p>
      )}
      {live?.look && (
        <p className="mt-3" aria-live="off">
          Azimuth {live.look.azimuth.toFixed(0)}° · Elevation{" "}
          {live.look.elevation.toFixed(1)}° · Range {live.look.range.toFixed(0)}{" "}
          km
        </p>
      )}
      <button
        className={`${button} my-3`}
        disabled={refreshing}
        onClick={() => void refresh(true)}
      >
        {refreshing ? "Refreshing…" : "Refresh orbital elements"}
      </button>
      {cachedAt !== null && (
        <p className={muted}>
          Downloaded {new Date(cachedAt).toLocaleString()}.{" "}
          {saved
            ? "Saved in this browser."
            : "Orbital elements could not be saved in this browser."}
        </p>
      )}
      {error && (
        <p role="alert">
          {record
            ? "Refresh failed; using the last loaded elements."
            : "Unable to download orbital elements. Use Refresh to try again."}
        </p>
      )}
      {epochTime !== null && (
        <p className={muted}>
          Element epoch: {new Date(epochTime).toLocaleString()} (local time).
          {now !== null && Math.abs(now - epochTime) > 48 * 60 * 60_000 && (
            <strong>
              {" "}
              Elements are over two days old; predictions may be less accurate.
            </strong>
          )}
        </p>
      )}
    </section>
  );
}
