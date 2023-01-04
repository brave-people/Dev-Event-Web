import { AxiosResponse } from 'axios';
import axiosInstanceWithToken from 'lib/api/axiosInstanceWithToken';
import { AuthProp, SignUpProps, SignUpResponse, TokenProp, TokenResponse } from 'model/auth';
import { MyEventPostProps, MyEventResponse } from 'model/event';
import axiosInstance from 'lib/api/axiosInstance';

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

export const loginByEmail = async (url: string, data: AuthProp): Promise<TokenResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.post(`${process.env.BASE_SERVER_URL}${url}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const signUpByEmail = async (url: string, data: SignUpProps): Promise<SignUpResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.post(`${process.env.BASE_SERVER_URL}${url}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};
