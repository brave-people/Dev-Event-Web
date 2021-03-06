import { AxiosResponse } from 'axios';
import axiosInstance from 'lib/utils/axiosInstance';
import { TokenProp, TokenResponse } from 'model/auth';
import { MyEventPostProps, MyEventResponse } from 'model/event';

export const createMyEventApi = async (url: string, data: MyEventPostProps): Promise<MyEventResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.post(`${process.env.BASE_SERVER_URL}${url}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const regenerateAccessToken = async (url: string, data: TokenProp): Promise<TokenResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.post(`${process.env.BASE_SERVER_URL}${url}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};
