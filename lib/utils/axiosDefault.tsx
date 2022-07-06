import axios from 'axios';
import { handleError } from 'lib/api/error';
import { regenerateAccessToken } from 'lib/api/post';

const requestArray = [];
const axiosDefault = axios.create({
  baseURL: `${process.env.BASE_SERVER_URL}`,
});

axiosDefault.interceptors.request.use(
  async (config) => {
    return config;
  },

  (err) => {
    return Promise.reject(err);
  }
);

axiosDefault.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const config = error.config;
    requestArray.push(config);
    if (requestArray.length === 1) {
      handleError(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default axiosDefault;
