import axios from 'axios';

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

axiosInstance.interceptors.response.use(); //토큰 만료 시 리프레시 토큰 재발급

export default axiosInstance;
