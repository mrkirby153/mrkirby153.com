import { useIssStore, usePassInfo } from "./store";
import {
  button,
  cell,
  date,
  heading,
  muted,
  section,
  table,
} from "./presentation";

export default function UpcomingPasses() {
  const observer = useIssStore((s) => s.position);
  const record = useIssStore((s) => s.record);
  const error = useIssStore((s) => s.predictionError);
  const minimum = useIssStore((s) => s.minAltitude);
  const select = useIssStore((s) => s.selectPass);
  const { passes, pass } = usePassInfo();
  return (
    <section className={section}>
      <h2 className={heading}>Upcoming radio passes</h2>
      <p className={muted}>
        Next 48 hours · All times in your browser’s local time zone · Includes
        daylight and eclipsed passes
      </p>
      {!observer ? (
        <p>Set your station location to calculate passes.</p>
      ) : !record ? (
        <p>Orbital elements are unavailable. Use Refresh above to try again.</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : !passes.length ? (
        <p>No passes above {minimum}° in the next 48 hours.</p>
      ) : (
        <div className="my-4 overflow-x-auto">
          <table className={table}>
            <caption className="sr-only">
              Predicted ISS radio passes above {minimum} degrees
            </caption>
            <thead>
              <tr>
                {[
                  "Start / AOS",
                  "Peak",
                  "End / LOS",
                  "Max elevation",
                  "Tuning",
                ].map((title) => (
                  <th scope="col" key={title} className={cell}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {passes.map((p) => (
                <tr key={p.id}>
                  <td className={cell}>
                    {p.ongoing ? "In progress" : date(p.start)}
                  </td>
                  <td className={cell}>{date(p.peak)}</td>
                  <td className={cell}>
                    {date(p.end)}
                    {p.truncated ? " (window ends)" : ""}
                  </td>
                  <td className={cell}>{p.maxElevation.toFixed(1)}°</td>
                  <td className={cell}>
                    <button
                      className={button}
                      aria-pressed={pass?.id === p.id}
                      aria-label={`View tuning for pass at ${date(p.start)}`}
                      onClick={() => select(p.id)}
                    >
                      {pass?.id === p.id ? "Selected" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className={muted}>
        AOS and LOS use your chosen elevation threshold. Terrain, antenna
        coverage, and radio availability affect whether a contact is possible.
        An ongoing pass shows its remaining peak.
      </p>
    </section>
  );
}
