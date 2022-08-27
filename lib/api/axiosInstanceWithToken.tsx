import axios from 'axios';
import { handleError } from 'lib/api/error';
import { regenerateAccessToken } from 'lib/api/post';

const requestArray = [];
const axiosInstanceWithToken = axios.create({
  baseURL: `${process.env.BASE_SERVER_URL}`,
});

axiosInstanceWithToken.interceptors.request.use(
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

axiosInstanceWithToken.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const config = error.config;
    requestArray.push(config);
    if (requestArray.length === 1) {
      if (error.response.data.status_code === 400 && error.response.data.status === 'TOKEN_400_02') {
        const { data } = await axios.post(`/api/getRefreshToken`);
        if (data) {
          const result = await regenerateAccessToken('/admin/v1/token/refresh', {
            refresh_token: data.refresh_token,
          });

          if (result.access_token) {
            const response = await axios.post('/api/autoLogin', { param: { result } });
            config.headers['Authorization'] = result.access_token;
            if (response.status === 200) {
              return axios.request(config);
            }
          }
        }
      } else {
        handleError(error.response.data);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstanceWithToken;
