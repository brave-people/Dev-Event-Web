import { AxiosResponse } from 'axios';
import axiosInstanceWithToken from 'lib/api/axiosInstanceWithToken';
import { DeleteAccountResponse } from 'model/auth';
import { MyEventDeleteProps, MyEventResponse } from 'model/event';

export const deleteMyEventApi = async (url: string, data: MyEventDeleteProps): Promise<MyEventResponse> => {
  try {
    const response: AxiosResponse = await axiosInstanceWithToken.delete(`${process.env.BASE_SERVER_URL}${url}`, {
      data: data,
    });
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const deleteAccountApi = async (url: string): Promise<DeleteAccountResponse> => {
  try {
    const response: AxiosResponse = await axiosInstanceWithToken.delete(`${process.env.BASE_SERVER_URL}${url}`);
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};
