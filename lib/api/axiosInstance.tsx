import axios from 'axios';
import { handleError } from 'lib/api/error';

const requestArray = new Array();
const axiosInstance = axios.create({
  baseURL: `${process.env.BASE_SERVER_URL}`,
});

axiosInstance.interceptors.request.use(
  async (config) => {
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
    requestArray.push(config);
    if (requestArray.length === 1) {
      handleError(error.response.data);
      requestArray.shift();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
