export const INDIA_TIME_ZONE = "Asia/Kolkata";

const IST_LOCALE_OPTIONS = {
  timeZone: INDIA_TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
};

/** True when the string has no explicit UTC / offset marker. */
function lacksTimezone(value) {
  return !/[zZ]$|[+-]\d{2}:\d{2}$|[+-]\d{4}$/.test(value.trim());
}

/**
 * Parse DB/API timestamps as UTC when no timezone is present.
 * Postgres TIMESTAMP (no tz) and ISO strings without "Z" are otherwise
 * interpreted as browser-local time, which shows UTC wall-clock labeled "IST".
 */
export function parseUtcTimestamp(value) {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value !== "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (lacksTimezone(trimmed)) {
    const normalized = trimmed.includes("T")
      ? trimmed
      : trimmed.replace(" ", "T");
    const date = new Date(`${normalized}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a UTC instant for display in Indian Standard Time. */
export function formatIST(utcTimestamp, { withLabel = true } = {}) {
  const date = parseUtcTimestamp(utcTimestamp);
  if (!date) return "—";

  const formatted = date.toLocaleString("en-IN", IST_LOCALE_OPTIONS);
  return withLabel ? `${formatted} IST` : formatted;
}

/** @deprecated Use formatIST — kept for existing imports. */
export function formatIndiaDateTime(value, options) {
  return formatIST(value, options);
}
