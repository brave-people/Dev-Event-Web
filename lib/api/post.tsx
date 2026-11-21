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

// 2xx면 응답을, 아니면 응답을 그대로 던진다
const sendAccepting = async (
  send: () => Promise<AxiosResponse>
): Promise<AxiosResponse> => {
  let response: AxiosResponse;
  try {
    response = await send();
  } catch (error: any) {
    throw error?.response; // 응답이 없으면(네트워크 오류) undefined
  }
  if (!isSuccess(response)) throw response;
  return response;
};

// 아이디 로그인 (#377).
// 1. 아이디·비밀번호는 지금처럼 API 서버로 바로 보낸다(웹 서버 Vercel을 거치지 않음).
// 2. 받은 토큰은 주소에 싣지 않고 /api/login(pages/api/login.ts) 요청 본문으로 넘겨 httpOnly 쿠키로 심는다.
// /api/login은 같은 웹 서버라서 baseURL이 API 서버인 axiosInstance 대신 axios로 부른다.
export const loginByEmail = async (
  url: string,
  data: AuthProp
): Promise<void> => {
  const login = await sendAccepting(() =>
    axiosInstance.post(`${process.env.BASE_SERVER_URL}${url}`, data, acceptAll)
  );
  const { access_token, refresh_token } = login.data as TokenResponse;
  await sendAccepting(() =>
    axios.post('/api/login', { access_token, refresh_token }, acceptAll)
  );
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
