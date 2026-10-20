import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});


api.interceptors.request.use((config) => {
  const token = Cookies.get('drivo.token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


let isRefreshing = false;
let failedRequestsQueue: any[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {


    if (error.response?.status === 401) {
      const originalConfig = error.config;


      if (!originalConfig.url.includes('/refresh') && !originalConfig._retry) {
        originalConfig._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = Cookies.get('drivo.refreshToken');

          if (!refreshToken) {
            window.location.href = '/';
            return Promise.reject(error);
          }

          try {

            const response = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${refreshToken}`
                }
              }
            );


            const { access_token, refresh_token: newRefreshToken } = response.data;


            Cookies.set('drivo.token', access_token);
            if (newRefreshToken) {
               Cookies.set('drivo.refreshToken', newRefreshToken);
            }


            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;


            failedRequestsQueue.forEach((req) => req.onSuccess(access_token));
            failedRequestsQueue = [];


            originalConfig.headers.Authorization = `Bearer ${access_token}`;
            return api(originalConfig);

          } catch (refreshError) {

            failedRequestsQueue.forEach((req) => req.onFailure(refreshError));
            failedRequestsQueue = [];

            Cookies.remove('drivo.token');
            Cookies.remove('drivo.refreshToken');
            window.location.href = '/';

            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers.Authorization = `Bearer ${token}`;
                resolve(api(originalConfig));
              },
              onFailure: (err: any) => reject(err),
            });
          });
        }
      }
    }
    return Promise.reject(error);
  }
);
