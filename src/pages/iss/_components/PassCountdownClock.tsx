import { usePassInfo } from "./store";

type Props = {
  now: number;
};

type ClockProps = {
  target: number | null;
};

function countdown(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function Clock({ target }: ClockProps) {
  if (target === null) return null;
  const value = countdown(target);

  return (
    <div aria-live="off" aria-label={`Countdown: ${value}`}>
      {value}
    </div>
  );
}

export default function PassCountdownClock({ now }: Props) {
  const { active, nextPass } = usePassInfo(now);
  const countdownTarget = nextPass
    ? active
      ? nextPass.end
      : nextPass.start
    : null;
  return (
    <section data-active={active}>
      <h2>{active ? "Pass active · time remaining" : "Next pass in"}</h2>
      <Clock target={countdownTarget === null ? null : countdownTarget - now} />
      <div>
        <p>Pass Duration</p>
        <strong>
          {nextPass ? countdown(nextPass.end - nextPass.start) : "--:--:--"}
        </strong>
      </div>
    </section>
  );
}
