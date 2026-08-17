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
    // 네트워크 오류·타임아웃은 response 가 없다. error.response.data 접근 전에 빠져나가야 한다.
    if (!error.response) {
      return Promise.reject(error);
    }

    const config = error.config;
    requestArray.push(config);
    if (requestArray.length === 1) {
      // handleError 가 던져도 큐가 막히지 않도록 반드시 shift 한다.
      try {
        handleError(error.response.data);
      } finally {
        requestArray.shift();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
