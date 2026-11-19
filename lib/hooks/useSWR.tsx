import {
  getEventsApi,
  getMyEventApi,
  getMonthlyEventApi,
  getTopBannersApi,
  getUserApi,
} from 'lib/api/handler';
import { TopBanner } from 'model/banner';
import { TOP_BANNER_PATH } from 'lib/utils/banner/topBanner';
import { Calender } from 'model/calender';
import { EventResponse, MyEventGetProps, Event } from 'model/event';
import useSWR from 'swr';

const useScheduledEvents = (fallbackData?: EventResponse[], enabled = true) => {
  const { data: events, error } = useSWR(
    enabled ? `/front/v2/events/current` : null,
    getEventsApi,
    {
      fallbackData: fallbackData ?? fallbackData,
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: false,
    }
  );

  return {
    scheduledEvents: events,
    isLoading: enabled && !error && !events,
    isError: error,
  };
};

const useMonthlyEvent = ({
  param,
  fallbackData,
}: {
  param: Calender | null;
  fallbackData?: Event[];
}) => {
  const { data: events, error } = useSWR(
    param ? `/front/v2/events/${param.year}/${param.month}` : null,
    getMonthlyEventApi,
    {
      fallbackData,
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: false,
    }
  );
  return {
    monthlyEvent: events,
    isLoading: !!param && !error && !events,
    isError: error,
  };
};

const useMyEvent = (param: MyEventGetProps, isLoginIn: boolean) => {
  const { data: myEvent, error } = useSWR(
    isLoginIn ? [`/front/v1/favorite/events`, param] : null,
    getMyEventApi,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      revalidateIfStale: false,
    }
  );
  return {
    myEvent: myEvent,
    isLoading: !error && !myEvent,
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

const useTopBanners = (fallbackData?: TopBanner[]) => {
  const { data, error } = useSWR(TOP_BANNER_PATH, getTopBannersApi, {
    fallbackData,
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateIfStale: false,
  });
  return {
    topBanners: data ?? [],
    isLoading: !error && !data,
    isError: error,
  };
};

export {
  useScheduledEvents,
  useMonthlyEvent,
  useUser,
  useMyEvent,
  useTopBanners,
};
