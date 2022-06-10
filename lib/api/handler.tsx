import { EventResponse } from 'model/event';
import { TagResponse } from 'model/tag';
import { User } from 'model/auth';
import axios, { AxiosResponse } from 'axios';
import axiosInstance from 'lib/utils/axiosInstance';

export const getEventsApi = async (url: string): Promise<EventResponse[]> => {
  try {
    const response: AxiosResponse = await axios.get(`${process.env.BASE_SERVER_URL}${url}`);
    return response.data;
  } catch (error: any) {
    return error.response;
  }
};

export const getMonthlyEventApi = async (url: string): Promise<Event[]> => {
  try {
    const response: AxiosResponse = await axios.get(`${process.env.BASE_SERVER_URL}${url}`);
    return response.data;
  } catch (error: any) {
    return error.response;
  }
};

export const getTagsApi = async (url: string): Promise<TagResponse[]> => {
  try {
    const response: AxiosResponse = await axios.get(`${process.env.BASE_SERVER_URL}${url}`);
    return response.data;
  } catch (error: any) {
    return error.response;
  }
};

export const getUserApi = async (url: string): Promise<User> => {
  try {
    const response: AxiosResponse = await axiosInstance.get(`${process.env.BASE_SERVER_URL}${url}`);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};
