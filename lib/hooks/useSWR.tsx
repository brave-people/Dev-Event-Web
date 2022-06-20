import { getEventsApi, getMyEventApi, getMonthlyEventApi, getTagsApi, getUserApi } from 'lib/api/handler';
import { Calender } from 'model/calender';
import { MyEventGetProps } from 'model/event';
import useSWR from 'swr';

const useScheduledEvents = () => {
  const { data: events, error } = useSWR(`/front/v1/events/current`, getEventsApi, {
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

const useMonthlyEvent = ({ param }: { param: Calender }) => {
  const { data: events, error } = useSWR(`/front/v1/events/${param.year}/${param.month}`, getMonthlyEventApi, {
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
