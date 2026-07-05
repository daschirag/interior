export const INDIA_TIME_ZONE = "Asia/Kolkata";

export function formatIndiaDateTime(value, { withLabel = true } = {}) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const formatted = date.toLocaleString("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return withLabel ? `${formatted} IST` : formatted;
}
