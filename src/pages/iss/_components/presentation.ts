export const section = "border-t border-neutral-500/30 py-6";
export const heading = "mb-2 text-2xl font-semibold";
export const muted = "text-sm opacity-70";
export const control =
  "rounded border border-neutral-500/50 bg-transparent px-3 py-2 text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";
export const button = `${control} cursor-pointer hover:bg-neutral-500/10 aria-pressed:bg-neutral-500/20 disabled:cursor-wait disabled:opacity-50`;
export const fields = "my-4 grid gap-4 sm:grid-cols-3";
export const label = "flex min-w-0 flex-col gap-1";
export const cell =
  "whitespace-nowrap border-b border-neutral-500/25 px-3 py-2";
export const table = "w-full text-left text-sm";
export function date(ms: number) {
  return new Date(ms).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}
export function countdown(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
