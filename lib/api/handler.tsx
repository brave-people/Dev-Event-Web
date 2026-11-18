import { Event, EventResponse, MyEvent, MyEventGetProps } from 'model/event';
import { User } from 'model/auth';
import { AxiosResponse } from 'axios';
import axiosInstanceWithToken from 'lib/api/axiosInstanceWithToken';
import axiosInstance from 'lib/api/axiosInstance';
import { TopBanner } from 'model/banner';
import { usableBanners } from 'lib/utils/banner/topBanner';

export const getEventsApi = async (url: string): Promise<EventResponse[]> => {
  try {
    const response: AxiosResponse = await axiosInstance.get(
      `${process.env.BASE_SERVER_URL}${url}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const getMonthlyEventApi = async (url: string): Promise<Event[]> => {
  try {
    const response: AxiosResponse = await axiosInstance.get(
      `${process.env.BASE_SERVER_URL}${url}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const getMyEventApi = async (
  url: string,
  param: MyEventGetProps
): Promise<MyEvent[]> => {
  try {
    const response: AxiosResponse = await axiosInstanceWithToken.get(
      `${process.env.BASE_SERVER_URL}${url}`,
      {
        params: param,
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const getUserApi = async (url: string): Promise<User> => {
  try {
    const response: AxiosResponse = await axiosInstanceWithToken.get(
      `${process.env.BASE_SERVER_URL}${url}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

// 배너는 없어도 되는 것이라 4xx·5xx가 axiosInstance의 오류 알림(alert)을 타지 않게 validateStatus를 준다.
export const getTopBannersApi = async (url: string): Promise<TopBanner[]> => {
  const response: AxiosResponse = await axiosInstance.get(
    `${process.env.BASE_SERVER_URL}${url}`,
    { validateStatus: () => true }
  );
  if (response.status !== 200) throw response;
  return usableBanners(response.data);
};
