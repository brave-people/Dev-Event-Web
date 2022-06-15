import axios from 'axios';
import { regenerateAccessToken } from 'lib/api/post';

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

    if (error.response.status === 400) {
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
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
