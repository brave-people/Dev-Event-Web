import { getEventsApi } from 'lib/api/handler';
import useSWR from 'swr';

const useEvents = () => {
  const { data: events, error } = useSWR(`/front/v1/events/current`, getEventsApi);

  return {
    events: events,
    isLoading: !error && !events,
    isError: error,
  };
};

export { useEvents };
