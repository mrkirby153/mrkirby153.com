import { useIssStore, useLiveTracking } from "./store";
import {
  button,
  control,
  fields,
  heading,
  label,
  section,
} from "./presentation";

export default function StationSettings() {
  const observer = useIssStore((s) => s.position);
  const setPosition = useIssStore((s) => s.setPosition);
  const locating = useIssStore((s) => s.locating);
  const error = useIssStore((s) => s.locationError);
  const locate = useIssStore((s) => s.locate);
  const minimum = useIssStore((s) => s.minAltitude);
  const setMinimum = useIssStore((s) => s.setMinimumAltitude);
  const live = useLiveTracking();
  return (
    <section className={section}>
      <h2 className={heading}>Your station</h2>
      <button
        className={`${button} mt-3`}
        onClick={() => void locate()}
        disabled={locating}
      >
        {locating ? "Finding location…" : "Use my location"}
      </button>
      {error && <p role="alert">{error}</p>}
      <form
        key={
          observer
            ? `${observer.latitude},${observer.longitude},${observer.altitudeMeters}`
            : "manual"
        }
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setPosition(
            Number(data.get("latitude")),
            Number(data.get("longitude")),
            Number(data.get("altitude")),
          );
        }}
      >
        <div className={fields}>
          <label className={label}>
            Latitude (°)
            <input
              className={control}
              name="latitude"
              type="number"
              min="-90"
              max="90"
              step="any"
              required
              defaultValue={observer?.latitude}
              placeholder="47.6062"
            />
          </label>
          <label className={label}>
            Longitude (°)
            <input
              className={control}
              name="longitude"
              type="number"
              min="-180"
              max="180"
              step="any"
              required
              defaultValue={observer?.longitude}
              placeholder="-122.3321"
            />
          </label>
          <label className={label}>
            Altitude (m)
            <input
              className={control}
              name="altitude"
              type="number"
              min="-500"
              max="10000"
              step="any"
              required
              defaultValue={observer?.altitudeMeters ?? 0}
            />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-3">
          Minimum elevation
          <select
            className={control}
            value={minimum}
            onChange={(e) => setMinimum(Number(e.target.value))}
          >
            {[0, 5, 10, 15, 20, 30].map((n) => (
              <option className="bg-white text-neutral-900" key={n} value={n}>
                {n}°
              </option>
            ))}
          </select>
        </label>
        <button className={button} type="submit">
          Calculate passes
        </button>
      </form>
    </section>
  );
}
