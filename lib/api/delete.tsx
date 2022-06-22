import { AxiosResponse } from 'axios';
import axiosInstance from 'lib/utils/axiosInstance';
import { DeleteAccountResponse } from 'model/auth';
import { MyEventDeleteProps, MyEventResponse } from 'model/event';

export const deleteMyEventApi = async (url: string, data: MyEventDeleteProps): Promise<MyEventResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.delete(`${process.env.BASE_SERVER_URL}${url}`, { data: data });
    return response.data;
  } catch (error: any) {
    alert('내 이벤트 해제가 실패했습니다.');
    throw error.response;
  }
};

export const deleteAccountApi = async (url: string): Promise<DeleteAccountResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.delete(`${process.env.BASE_SERVER_URL}${url}`);
    return response.data;
  } catch (error: any) {
    alert('탈퇴를 실패했습니다.');

    throw error.response;
  }
};
