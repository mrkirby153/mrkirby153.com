import { useMemo } from "react";
import { useIssStore, useLiveTracking, usePassInfo, validRadio } from "./store";
import { tuningSchedule } from "./tuning";
import {
  cell,
  control,
  date,
  fields,
  heading,
  label,
  muted,
  section,
  table,
} from "./presentation";

export default function DopplerTuning() {
  const doppler = useIssStore((s) => s.doppler);
  const setDoppler = useIssStore((s) => s.setDoppler);
  const record = useIssStore((s) => s.record);
  const observer = useIssStore((s) => s.position);
  const minimum = useIssStore((s) => s.minAltitude);
  const live = useLiveTracking();
  const { pass } = usePassInfo();
  const valid = validRadio(doppler);
  const schedule = useMemo(() => {
    if (!record || !observer || !pass || !valid)
      return { rows: [], error: null };
    try {
      return {
        rows: tuningSchedule(
          record,
          observer,
          pass,
          Number(doppler.freq) * 1e6,
          Number(doppler.step) * 1000,
          doppler.direction === "tx",
        ),
        error: null,
      };
    } catch {
      return { rows: [], error: "Unable to calculate the tuning schedule." };
    }
  }, [record, observer, pass, doppler, valid]);
  return (
    <section className={section}>
      <h2 className={heading}>Doppler tuning</h2>
      <p>
        Enter the nominal frequency. Receive and transmit corrections are
        calculated separately.
      </p>
      <div className={fields}>
        <label className={label}>
          Frequency (MHz)
          <input
            className={control}
            type="number"
            min="0.001"
            step="any"
            value={doppler.freq}
            onChange={(e) => setDoppler({ freq: e.target.value })}
          />
        </label>
        <label className={label}>
          Tuning step (kHz)
          <input
            className={control}
            type="number"
            min="0.001"
            step="any"
            value={doppler.step}
            onChange={(e) => setDoppler({ step: e.target.value })}
          />
        </label>
        <label className={label}>
          Direction
          <select
            className={control}
            value={doppler.direction}
            onChange={(e) =>
              setDoppler({ direction: e.target.value === "tx" ? "tx" : "rx" })
            }
          >
            <option className="bg-white text-neutral-900" value="rx">
              Receive / downlink
            </option>
            <option className="bg-white text-neutral-900" value="tx">
              Transmit / uplink
            </option>
          </select>
        </label>
      </div>
      {!valid && (
        <p role="alert">Enter a positive frequency and tuning step.</p>
      )}
      {live?.tuning && (
        <p>
          Live tuning:{" "}
          <strong className="font-mono">
            {(live.tuning.tuned / 1e6).toFixed(6)} MHz
          </strong>{" "}
          · Exact correction{" "}
          {((live.tuning.exact - Number(doppler.freq) * 1e6) / 1000).toFixed(2)}{" "}
          kHz · {live.factor! > 1 ? "Approaching" : "Receding"}
        </p>
      )}
      {pass && valid && (
        <>
          <h3 className="mt-4 mb-2 font-semibold">Tuning schedule</h3>
          {schedule.error ? (
            <p role="alert">{schedule.error}</p>
          ) : (
            <div className="my-4 overflow-x-auto">
              <table className={table}>
                <caption className="sr-only">
                  Frequency changes for the selected pass
                </caption>
                <thead>
                  <tr>
                    <th className={cell} scope="col">
                      Time
                    </th>
                    <th className={cell} scope="col">
                      {doppler.direction === "tx" ? "Transmit" : "Receive"}{" "}
                      frequency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.rows.map((row) => (
                    <tr key={row.time}>
                      <td className={cell}>{date(row.time)}</td>
                      <td className={`${cell} font-mono`}>
                        {(row.tuned / 1e6).toFixed(6)} MHz
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className={muted}>Through {date(pass.end)}</p>
        </>
      )}
    </section>
  );
}
