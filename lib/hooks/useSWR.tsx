import { getEventsApi, getMonthlyEventApi, getTagsApi } from 'lib/api/handler';
import { Calender } from 'model/calender';
import useSWR from 'swr';

const useScheduledEvents = () => {
  const { data: events, error } = useSWR(`/front/v1/events/current`, getEventsApi);

  return {
    scheduledEvents: events,
    isLoading: !error && !events,
    isError: error,
  };
};

const useMonthlyEvent = ({ param }: { param: Calender }) => {
  const { data: events, error } = useSWR(`/front/v1/events/${param.year}/${param.month}`, getMonthlyEventApi);
  return {
    monthlyEvent: events,
    isLoading: !error && !events,
    isError: error,
  };
};

const useTags = () => {
  const { data: tags, error } = useSWR(`/front/v1/events/tags`, getTagsApi);
  return {
    tags: tags,
    isLoading: !error && !tags,
    isError: error,
  };
};
export { useScheduledEvents, useMonthlyEvent, useTags };
