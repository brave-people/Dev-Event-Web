import axios from 'axios';
import { regenerateAccessToken } from 'lib/api/post';
import router from 'next/router';

const axiosInstance = axios.create({
  baseURL: `${process.env.BASE_SERVER_URL}`,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const { data } = await axios.post(`/api/getToken`);
    config.headers = {
      Authorization: `${data.access_token}`,
      Accept: 'application/json',
    };
    return config;
  },

  (err) => {
    return Promise.reject(err);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const config = error.config;
    if (error.response.data.status === 'TOKEN_400_02') {
      const { data } = await axios.post(`/api/getRefreshToken`);
      if (data) {
        const result = await regenerateAccessToken('/admin/v1/token/refresh', { refresh_token: data.refresh_token });

        if (result.access_token) {
          const response = await axios.post('/api/autoLogin', { param: { result } });
          config.headers['Authorization'] = result.access_token;
          if (response.status === 200) {
            return axios.request(config);
          }
        }
      }
    } else if (error.response.data.status_code === 400) {
      const response = await axios.post('/api/logout');
      if (response.status === 200) {
        router.push('/');
      }
    } else if (
      error.response.data.status === 'AUTH_500_00' ||
      error.response.data.status === 'AUTH_500_02' ||
      error.response.data.status === 'AUTH_500_03'
    ) {
      alert('인증에 문제가 발생하였습니다.');
      const response = await axios.post('/api/logout');
      router.push('/');
    } else {
      console.log(error.response);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
