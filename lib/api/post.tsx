import axios, { AxiosResponse } from 'axios';
import axiosInstanceWithToken from 'lib/api/axiosInstanceWithToken';
import {
  AuthProp,
  SignUpProps,
  SignUpResponse,
  TokenProp,
  TokenResponse,
} from 'model/auth';
import { MyEventPostProps, MyEventResponse } from 'model/event';
import axiosInstance from 'lib/api/axiosInstance';

export const createMyEventApi = async (
  url: string,
  data: MyEventPostProps
): Promise<MyEventResponse> => {
  try {
    const response: AxiosResponse = await axiosInstanceWithToken.post(
      `${process.env.BASE_SERVER_URL}${url}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const regenerateAccessToken = async (
  url: string,
  data: TokenProp
): Promise<TokenResponse> => {
  try {
    const response: AxiosResponse = await axiosInstanceWithToken.post(
      `${process.env.BASE_SERVER_URL}${url}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

// 로그인·가입의 실패(틀린 비밀번호, 이미 있는 아이디 등)는 로그인 창이 창 안에 보여 준다.
// 그래서 validateStatus로 4xx·5xx도 받아 axiosInstance 인터셉터의 알림·로그아웃·/ 이동을 타지 않게 하고,
// 2xx가 아니면 응답을 그대로 던진다(받는 쪽: components/common/modal/login/loginFlow.ts의 authFailure).
const acceptAll = { validateStatus: () => true };
const isSuccess = (response: AxiosResponse) =>
  response.status >= 200 && response.status < 300;

// 이메일 로그인. API 서버가 아니라 같은 웹 서버의 /api/login(pages/api/login.ts)을 부른다.
// 그 라우트가 토큰을 바로 httpOnly 쿠키로 심으므로 브라우저는 토큰을 받지 않는다 (#377).
// axiosInstance는 baseURL이 API 서버라서 쓰지 않는다.
export const loginByEmail = async (data: AuthProp): Promise<void> => {
  let response: AxiosResponse;
  try {
    response = await axios.post('/api/login', data, acceptAll);
  } catch (error: any) {
    throw error?.response; // 응답이 없으면(네트워크 오류) undefined
  }
  if (!isSuccess(response)) throw response;
};

export const signUpByEmail = async (
  url: string,
  data: SignUpProps
): Promise<SignUpResponse> => {
  let response: AxiosResponse;
  try {
    response = await axiosInstance.post(
      `${process.env.BASE_SERVER_URL}${url}`,
      data,
      acceptAll
    );
  } catch (error: any) {
    throw error?.response; // 응답이 없으면(네트워크 오류) undefined
  }
  if (!isSuccess(response)) throw response;
  return response.data;
};
