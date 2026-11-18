import { DateUtil } from 'lib/utils/dateUtil';
import { Event, EventDate } from 'model/event';

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
  coast: string | undefined
) => {
  if (
    (jobGroups === 'undefined' ||
      jobGroups === undefined ||
      jobGroups.length === 0) &&
    eventType === undefined &&
    location === undefined &&
    coast === undefined
  )
    return true;
  return false;
};

export const checkCondition = (
  jobGroups: string | undefined,
  eventType: string | undefined,
  location: string | undefined,
  coast: string | undefined,
  event: Event
) => {
  const eventTag = event.tags;
  if (handleUndefined(jobGroups, eventType, location, coast)) return true;
  for (let i = 0; i < eventTag.length; i++) {
    const tagName = eventTag[i].tag_name?.trim();
    if (jobGroups !== undefined && jobGroups.includes(tagName)) return true;
    if (eventType !== undefined && eventType === tagName) return true;
    if (location !== undefined && location === tagName) return true;
    if (coast !== undefined && coast === tagName) return true;
  }
  return false;
};
