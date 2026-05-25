import { AxiosResponse } from 'axios';
import axiosInstance from 'lib/api/axiosInstance';
import {
  getMockHostDetail,
  getMockHostEvents,
  getMockHostList,
} from 'lib/mock/hosts';
import {
  HostDetail,
  HostEventsParams,
  HostEventsResponse,
  HostListParams,
  HostListResponse,
} from 'model/host';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_HOST_MOCK !== 'false';

export const getHostListApi = async (
  url: string,
  params?: HostListParams
): Promise<HostListResponse> => {
  if (USE_MOCK) return getMockHostList(params);
  try {
    const response: AxiosResponse<HostListResponse> = await axiosInstance.get(
      `${process.env.BASE_SERVER_URL}${url}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const getHostDetailApi = async (url: string): Promise<HostDetail> => {
  if (USE_MOCK) {
    const match = url.match(/\/hosts\/(\d+)/);
    const hostId = match ? Number(match[1]) : 0;
    return getMockHostDetail(hostId);
  }
  try {
    const response: AxiosResponse<HostDetail> = await axiosInstance.get(
      `${process.env.BASE_SERVER_URL}${url}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const getHostEventsApi = async (
  url: string,
  params?: HostEventsParams
): Promise<HostEventsResponse> => {
  if (USE_MOCK) {
    const match = url.match(/\/hosts\/(\d+)\/events/);
    const hostId = match ? Number(match[1]) : 0;
    return getMockHostEvents(hostId, params);
  }
  try {
    const response: AxiosResponse<HostEventsResponse> = await axiosInstance.get(
      `${process.env.BASE_SERVER_URL}${url}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};
