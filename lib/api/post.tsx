import { AxiosResponse } from 'axios';
import axiosInstanceWithToken from 'lib/api/axiosInstanceWithToken';
import { TokenProp, TokenResponse } from 'model/auth';
import { MyEventPostProps, MyEventResponse } from 'model/event';

export const createMyEventApi = async (url: string, data: MyEventPostProps): Promise<MyEventResponse> => {
  try {
    const response: AxiosResponse = await axiosInstanceWithToken.post(`${process.env.BASE_SERVER_URL}${url}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const regenerateAccessToken = async (url: string, data: TokenProp): Promise<TokenResponse> => {
  try {
    const response: AxiosResponse = await axiosInstanceWithToken.post(`${process.env.BASE_SERVER_URL}${url}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};
