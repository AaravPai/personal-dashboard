const APP_TIME_ZONE = "America/Indiana/Indianapolis";

function getZonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    second: map.second,
  };
}

export function getCurrentDateInAppTimeZone() {
  const now = getZonedParts(new Date());
  return `${now.year}-${now.month}-${now.day}`;
}

export function getCurrentDateTimeInAppTimeZone() {
  const now = getZonedParts(new Date());
  return `${now.year}-${now.month}-${now.day}T${now.hour}:${now.minute}:${now.second}`;
}

export function normalizeLocalTimestamp(value: string) {
  return value.replace(" ", "T").slice(0, 19);
}

export function isOverdueInAppTimeZone(dueAt: string | null) {
  if (!dueAt) return false;

  return normalizeLocalTimestamp(dueAt) < getCurrentDateTimeInAppTimeZone();
}

export function formatLocalTimestamp(value: string | null) {
  if (!value) return "No due date";

  const normalized = normalizeLocalTimestamp(value);
  const [datePart, timePart] = normalized.split("T");

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour24, minute] = timePart.split(":").map(Number);

  const tempDate = new Date(year, month - 1, day, hour24, minute);

  return tempDate.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}