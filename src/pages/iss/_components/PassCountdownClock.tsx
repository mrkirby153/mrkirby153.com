import { useIssStore, useLiveTracking, usePassInfo } from "./store";
import { countdown, date, heading, muted, section } from "./presentation";

export default function PassCountdownClock(_props: { now?: number } = {}) {
  const now = useIssStore((s) => s.now);
  const observer = useIssStore((s) => s.position);
  const record = useIssStore((s) => s.record);
  const minimum = useIssStore((s) => s.minAltitude);
  const error = useIssStore((s) => s.predictionError);
  const doppler = useIssStore((s) => s.doppler);
  const { nextPass, active } = usePassInfo();
  const live = useLiveTracking();
  const target = nextPass ? (active ? nextPass.end : nextPass.start) : null;
  return (
    <section
      className={`${section} text-center ${active ? "rounded bg-green-500/5" : ""}`}
      aria-labelledby="pass-countdown-heading"
    >
      <h2
        id="pass-countdown-heading"
        className={`${heading} ${active ? "text-green-700 dark:text-green-300" : ""}`}
      >
        {active ? "Pass active · time remaining" : "Next pass in"}
      </h2>
      {nextPass && target !== null && now !== null ? (
        <>
          <div
            role="timer"
            aria-live="off"
            aria-label={
              active
                ? "Time remaining in the active pass"
                : "Time until the next pass"
            }
            className="my-2 font-mono text-[clamp(2.5rem,9vw,5rem)] leading-tight font-bold tabular-nums"
          >
            {countdown(target - now)}
          </div>
          {active && (
            <div className="mx-auto my-4 max-w-lg rounded border border-neutral-500/30 p-3">
              <p className={muted}>
                {doppler.direction === "tx"
                  ? "Transmit / uplink"
                  : "Receive / downlink"}{" "}
                · Doppler tuning
              </p>
              {live?.tuning ? (
                <>
                  <p className="font-mono text-3xl font-semibold">
                    {(live.tuning.tuned / 1e6).toFixed(6)} MHz
                  </p>
                  <p className={muted}>
                    {doppler.step} kHz steps · Exact correction{" "}
                    {(
                      (live.tuning.exact - Number(doppler.freq) * 1e6) /
                      1000
                    ).toFixed(2)}{" "}
                    kHz
                  </p>
                </>
              ) : (
                <p>
                  Enter a valid frequency and tuning step below to show live
                  tuning.
                </p>
              )}
            </div>
          )}
          <p>
            Duration:{" "}
            <strong className="font-mono">
              {countdown(nextPass.end - nextPass.start)}
            </strong>
            {nextPass.ongoing || nextPass.truncated ? " (partial window)" : ""}
          </p>
          <p>
            {date(nextPass.start)} to {date(nextPass.end)}
          </p>
          <p className={muted}>
            {nextPass.truncated && active
              ? "Countdown ends at the prediction window boundary"
              : ""}
          </p>
        </>
      ) : (
        <p className={muted}>
          {!observer
            ? "Set your station location below to start the countdown."
            : !record
              ? "Waiting for orbital elements."
              : (error ??
                (now === null
                  ? "Calculating…"
                  : `No passes above ${minimum}° in the next 48 hours.`))}
        </p>
      )}
    </section>
  );
}
