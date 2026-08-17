import { AxiosResponse } from 'axios';
import axiosInstance from 'lib/api/axiosInstance';
import {
  HostDetail,
  HostEventsParams,
  HostEventsResponse,
  HostListParams,
  HostListResponse,
} from 'model/host';

// 기본값은 실서버. 목업을 보려면 .env 에 NEXT_PUBLIC_USE_HOST_MOCK=true 를 명시한다.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_HOST_MOCK === 'true';

export const getHostListApi = async (
  url: string,
  params?: HostListParams
): Promise<HostListResponse> => {
  if (USE_MOCK) {
    // 목업 fixture 가 실서버 번들에 섞이지 않도록 분기 안에서만 동적 로드한다 (WEB-033).
    const { getMockHostList } = await import('lib/mock/hosts');
    return getMockHostList(params);
  }
  try {
    const response: AxiosResponse<HostListResponse> = await axiosInstance.get(
      `${process.env.BASE_SERVER_URL}${url}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    // 네트워크 오류 등 response 가 없는 경우 undefined 를 throw 하지 않도록 원본 에러를 넘긴다.
    throw error.response ?? error;
  }
};

export const getHostDetailApi = async (url: string): Promise<HostDetail> => {
  if (USE_MOCK) {
    const { getMockHostDetail } = await import('lib/mock/hosts');
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
    // 네트워크 오류 등 response 가 없는 경우 undefined 를 throw 하지 않도록 원본 에러를 넘긴다.
    throw error.response ?? error;
  }
};

export const getHostEventsApi = async (
  url: string,
  params?: HostEventsParams
): Promise<HostEventsResponse> => {
  if (USE_MOCK) {
    const { getMockHostEvents } = await import('lib/mock/hosts');
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
    // 네트워크 오류 등 response 가 없는 경우 undefined 를 throw 하지 않도록 원본 에러를 넘긴다.
    throw error.response ?? error;
  }
};
