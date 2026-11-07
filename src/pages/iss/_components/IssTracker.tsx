import { useEffect } from "react";
import { useIssStore } from "./store";
import PassCountdownClock from "./PassCountdownClock";
import OrbitalStatus from "./OrbitalStatus";
import StationSettings from "./StationSettings";
import UpcomingPasses from "./UpcomingPasses";
import DopplerTuning from "./DopplerTuning";
import { muted } from "./presentation";

export default function IssTracker() {
  const initialize = useIssStore((s) => s.initialize);
  const tick = useIssStore((s) => s.tick);
  useEffect(() => {
    initialize();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [initialize, tick]);
  return (
    <div className="mt-6 pb-12">
      <PassCountdownClock />
      <OrbitalStatus />
      <StationSettings />
      <UpcomingPasses />
      <DopplerTuning />
      <p className={`${muted} mt-4`}>
        Orbital data from{" "}
        <a className="underline" href="https://celestrak.org/NORAD/elements/">
          CelesTrak
        </a>
        , propagated locally with SGP4. Check{" "}
        <a
          className="underline"
          href="https://www.ariss.org/current-status-of-iss-stations.html"
        >
          ARISS station status
        </a>{" "}
        for active modes and frequencies.
      </p>
    </div>
  );
}
