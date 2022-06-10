import { AxiosResponse } from 'axios';
import axiosInstance from 'lib/utils/axiosInstance';
import { MyEventDeleteProps } from 'model/event';

export const deleteMyEventApi = async (url: string, data: MyEventDeleteProps): Promise<Response> => {
  try {
    const response: AxiosResponse = await axiosInstance.delete(`${process.env.BASE_SERVER_URL}${url}`, { data: data });
    return response.data;
  } catch (error: any) {
    return error.response;
  }
};
