import { Event, EventDate } from "model/event";
import { DateUtil } from 'lib/utils/dateUtil';

export const getEventEndDate = (EventDate: EventDate) => {
  if (EventDate.use_start_date_time_yn && EventDate.use_end_date_time_yn) {
    return EventDate.end_date_time;
  }
  if (EventDate.use_start_date_time_yn && !EventDate.use_end_date_time_yn) {
    return EventDate.start_date_time;
  }
  if (!EventDate.use_start_date_time_yn && EventDate.use_end_date_time_yn) {
    return EventDate.end_date_time;
  }
  return EventDate.end_date_time;
};

export const checkEventDone = ({ endDate }: { endDate: string }) => {
  return DateUtil.isDone(endDate);
};

export const handleUndefined = (
  jobGroups: string | undefined,
  eventType: string | undefined,
  location: string | undefined,
  coast: string | undefined,
) => {
  if (jobGroups === undefined && eventType === undefined && location === undefined && coast === undefined)
    return (true);
  return (false);
}

export const checkCondition = (
  jobGroups: string | undefined,
  eventType: string | undefined,
  location: string | undefined,
  coast: string | undefined,
  event: Event
  ) => {
  const eventTag = event.tags;
  if (handleUndefined(jobGroups, eventType, location, coast))
    return (true);
  for (let i = 0; i < eventTag.length; i++) {
    if (jobGroups !== undefined && jobGroups.includes(eventTag[i].tag_name))
      return (true);
    if (eventType !== undefined && eventType === eventTag[i].tag_name)
      return (true);
    if (location !== undefined && location === eventTag[i].tag_name)
      return (true);
    if (coast !== undefined && coast === eventTag[i].tag_name)
      return (true);
    }
  return (false);
}

export const checkDate = (
  date: string | undefined,
  event: Event
) => {
  if (date === undefined || date === "전체")
    return (true);
  if (date.split('년')[0] === event.start_date_time.split('-')[0] ||
    date.split('년')[0] === event.end_date_time.split('-')[0]) {
    if (date.split('년')[1].split('월')[0].trim() === event.start_date_time.split('-')[1].trim() ||
    date.split('년')[1].split('월')[0].trim() === event.end_date_time.split('-')[1].trim())
      return (true);
  }
  return (false);
}
