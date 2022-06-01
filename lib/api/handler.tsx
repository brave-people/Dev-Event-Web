import { EventResponse } from 'model/event';
import axios, { AxiosResponse } from 'axios';

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
