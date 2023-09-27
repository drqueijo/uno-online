import dayjs, { Dayjs } from "dayjs";

export const DATE_FORMAT = "DD/MM/YY";

export function formatDate(date: Date | undefined) {
  if (!date) return "";
  return dayjs(date).format(DATE_FORMAT);
}

export function isoDate(date: Dayjs) {
  return date.toISOString();
}
