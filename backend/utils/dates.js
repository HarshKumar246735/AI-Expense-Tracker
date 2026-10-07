const ApiError = require("./ApiError");

const DAY = 24 * 60 * 60 * 1000;
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const toISODate = (d) => new Date(d).toISOString().slice(0, 10);

// month is 1-12. end is exclusive.
function monthRange(year, month) {
  return { start: new Date(Date.UTC(year, month - 1, 1)), end: new Date(Date.UTC(year, month, 1)) };
}

function currentMonthRange(now = new Date()) {
  return monthRange(now.getUTCFullYear(), now.getUTCMonth() + 1);
}

function startOfTodayUTC(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Converts inclusive startDate/endDate query values into { start, end(exclusive) }.
function rangeFromQuery({ startDate, endDate } = {}, fallback = null) {
  if (!startDate && !endDate) return fallback;
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(new Date(endDate).getTime() + DAY) : new Date("2999-01-01T00:00:00Z");
  if (start >= end) throw new ApiError(400, "Start date must be before end date");
  return { start, end };
}

// The period right before `range` (previous calendar month for whole months, otherwise same length).
function previousRange({ start, end }) {
  const monthIndex = (d) => d.getUTCFullYear() * 12 + d.getUTCMonth();
  const isWholeMonth =
    start.getUTCDate() === 1 && end.getUTCDate() === 1 && monthIndex(end) - monthIndex(start) === 1;
  if (isWholeMonth) {
    const prevStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1));
    return { range: { start: prevStart, end: start }, label: "last month" };
  }
  const length = end.getTime() - start.getTime();
  return { range: { start: new Date(start.getTime() - length), end: start }, label: "the previous period" };
}

const daysInUTCMonth = (year, monthIndex) => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

// anchorDay keeps monthly/yearly schedules on the original day (e.g. 31st -> 28th -> 31st)
function addInterval(date, frequency, anchorDay) {
  const d = new Date(date);
  switch (frequency) {
    case "daily":
      return new Date(d.getTime() + DAY);
    case "weekly":
      return new Date(d.getTime() + 7 * DAY);
    case "monthly": {
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      return new Date(Date.UTC(y, m, Math.min(anchorDay, daysInUTCMonth(y, m))));
    }
    case "yearly": {
      const y = d.getUTCFullYear() + 1;
      const m = d.getUTCMonth();
      return new Date(Date.UTC(y, m, Math.min(anchorDay, daysInUTCMonth(y, m))));
    }
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }
}

module.exports = {
  DAY,
  MONTH_NAMES,
  toISODate,
  monthRange,
  currentMonthRange,
  startOfTodayUTC,
  rangeFromQuery,
  previousRange,
  addInterval,
};
