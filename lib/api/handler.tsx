import { Event, EventResponse, MyEvent, MyEventGetProps } from 'model/event';
import { TagResponse } from 'model/tag';
import { User } from 'model/auth';
import { AxiosResponse } from 'axios';
import axiosInstanceWithToken from 'lib/api/axiosInstanceWithToken';
import axiosInstance from 'lib/api/axiosInstance';

export const getEventsApi = async (url: string): Promise<EventResponse[]> => {
  try {
    const response: AxiosResponse = await axiosInstance.get(`${process.env.BASE_SERVER_URL}${url}`);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const getMonthlyEventApi = async (url: string): Promise<Event[]> => {
  try {
    const response: AxiosResponse = await axiosInstance.get(`${process.env.BASE_SERVER_URL}${url}`);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const getTagsApi = async (url: string): Promise<TagResponse[]> => {
  try {
    const response: AxiosResponse = await axiosInstance.get(`${process.env.BASE_SERVER_URL}${url}`);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const getMyEventApi = async (url: string, param: MyEventGetProps): Promise<MyEvent[]> => {
  try {
    const response: AxiosResponse = await axiosInstanceWithToken.get(`${process.env.BASE_SERVER_URL}${url}`, {
      params: param,
    });
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const getUserApi = async (url: string): Promise<User> => {
  try {
    const response: AxiosResponse = await axiosInstanceWithToken.get(`${process.env.BASE_SERVER_URL}${url}`);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};
