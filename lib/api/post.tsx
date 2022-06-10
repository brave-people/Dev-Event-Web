import { AxiosResponse } from 'axios';
import axiosInstance from 'lib/utils/axiosInstance';
import { MyEventPostProps } from 'model/event';

export const createMyEventApi = async (url: string, data: MyEventPostProps): Promise<Response> => {
  try {
    const response: AxiosResponse = await axiosInstance.post(`${process.env.BASE_SERVER_URL}${url}`, data);
    return response.data;
  } catch (error: any) {
    return error.response;
  }
};
