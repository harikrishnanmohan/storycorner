import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export const convertToLocalDate = (date: string) => {
  // Convert the UTC date string to a Day.js object
  const utcDateTime = dayjs.utc(date);

  // Convert the UTC date to the client's local timezone
  const localDateTime = utcDateTime.local();

  // Format the local date and time as a string
  return dayjs().to(dayjs(localDateTime));
};
