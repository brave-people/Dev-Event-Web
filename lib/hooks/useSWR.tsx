import { getEventsApi, getMyEventApi, getMonthlyEventApi, getTagsApi, getUserApi } from 'lib/api/handler';
import { Calender } from 'model/calender';
import { EventResponse, MyEventGetProps, Event } from 'model/event';
import useSWR from 'swr';

const useScheduledEvents = (fallbackData?: EventResponse[]) => {
  const { data: events, error } = useSWR(`/front/v2/events/current`, getEventsApi, {
    fallbackData: fallbackData ?? fallbackData,
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateIfStale: false,
  });

  return {
    scheduledEvents: events,
    isLoading: !error && !events,
    isError: error,
  };
};

const useMonthlyEvent = ({ param, fallbackData }: { param: Calender; fallbackData: Event[] }) => {
  const { data: events, error } = useSWR(`/front/v2/events/${param.year}/${param.month}`, getMonthlyEventApi, {
    fallbackData: fallbackData ?? fallbackData,
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateIfStale: false,
  });
  return {
    monthlyEvent: events,
    isLoading: !error && !events,
    isError: error,
  };
};

const useMyEvent = (param: MyEventGetProps, isLoginIn: boolean) => {
  const { data: myEvent, error } = useSWR(isLoginIn ? [`/front/v1/favorite/events`, param] : null, getMyEventApi, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateIfStale: false,
  });
  return {
    myEvent: myEvent,
    isLoading: !error && !myEvent,
    isError: error,
  };
};

const useTags = () => {
  const { data: tags, error } = useSWR(`/front/v1/events/tags`, getTagsApi, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateIfStale: false,
  });
  return {
    tags: tags,
    isLoading: !error && !tags,
    isError: error,
  };
};

const useUser = () => {
  const { data: user, error } = useSWR(`/front/v1/users/profile`, getUserApi, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateIfStale: false,
  });
  return {
    user: user,
    isLoading: !error && !user,
    isError: error,
  };
};

export { useScheduledEvents, useMonthlyEvent, useTags, useUser, useMyEvent };
