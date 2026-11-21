import axios from 'axios';
import axiosInstance from 'lib/api/axiosInstance';
import { loginByEmail } from 'lib/api/post';

jest.mock('axios', () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock('lib/api/axiosInstance', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));
jest.mock('lib/api/axiosInstanceWithToken', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

const serverPost = axiosInstance.post as jest.Mock;
const webPost = axios.post as jest.Mock;
const originalBase = process.env.BASE_SERVER_URL;

beforeEach(() => {
  serverPost.mockReset();
  webPost.mockReset();
  process.env.BASE_SERVER_URL = 'http://api.test';
});

afterEach(() => {
  if (originalBase === undefined) delete process.env.BASE_SERVER_URL;
  else process.env.BASE_SERVER_URL = originalBase;
});

const USER = { user_id: 'me', password: 'secret-pw' };
const TOKENS = {
  access_token: 'access',
  refresh_token: 'refresh',
  access_token_expired_at: 1,
  refresh_token_expired_at: 2,
};

describe('loginByEmail (#377)', () => {
  it('아이디·비밀번호는 API 서버로 바로 보낸다', async () => {
    serverPost.mockResolvedValue({ status: 200, data: TOKENS });
    webPost.mockResolvedValue({ status: 200, data: { status_code: 200 } });

    await loginByEmail('/front/v1/users/login', USER);

    expect(serverPost).toHaveBeenCalledTimes(1);
    expect(serverPost.mock.calls[0][0]).toBe(
      'http://api.test/front/v1/users/login'
    );
    expect(serverPost.mock.calls[0][1]).toEqual(USER);
  });

  it('웹 서버(/api/login)에는 토큰만 보내고 비밀번호는 보내지 않는다', async () => {
    serverPost.mockResolvedValue({ status: 200, data: TOKENS });
    webPost.mockResolvedValue({ status: 200, data: { status_code: 200 } });

    await loginByEmail('/front/v1/users/login', USER);

    expect(webPost).toHaveBeenCalledTimes(1);
    expect(webPost.mock.calls[0][0]).toBe('/api/login');
    expect(webPost.mock.calls[0][1]).toEqual({
      access_token: 'access',
      refresh_token: 'refresh',
    });
    expect(JSON.stringify(webPost.mock.calls)).not.toContain('secret-pw');
  });

  it('API 서버가 거절하면 응답을 그대로 던지고 /api/login은 부르지 않는다', async () => {
    const rejected = { status: 400, data: { status: 'AUTH_400_01' } };
    serverPost.mockResolvedValue(rejected);

    await expect(loginByEmail('/front/v1/users/login', USER)).rejects.toBe(
      rejected
    );
    expect(webPost).not.toHaveBeenCalled();
  });

  it('쿠키 심기(/api/login)가 실패하면 그 응답을 던진다', async () => {
    const failed = { status: 400, data: {} };
    serverPost.mockResolvedValue({ status: 200, data: TOKENS });
    webPost.mockResolvedValue(failed);

    await expect(loginByEmail('/front/v1/users/login', USER)).rejects.toBe(
      failed
    );
  });

  it('응답이 없으면(네트워크 오류) undefined를 던진다', async () => {
    serverPost.mockRejectedValue(new Error('network'));

    await expect(
      loginByEmail('/front/v1/users/login', USER)
    ).rejects.toBeUndefined();
  });
});
