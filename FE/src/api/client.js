import axios from 'axios';

let accessToken = null; // kept in memory only, never localStorage
export const setAccessToken = (token) => {
  accessToken = token;
};

const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Only one refresh at a time: the backend rotates the refresh token,
// so two parallel refreshes would invalidate each other.
let refreshPromise = null;
export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post('/api/v1/auth/refresh', null, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const NO_RETRY = ['/auth/login', '/auth/signup', '/auth/refresh'];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const skip = NO_RETRY.some((p) => original?.url?.includes(p));

    if (error.response?.status === 401 && original && !original._retry && !skip) {
      original._retry = true;
      try {
        await refreshAccessToken();
        return api(original); // retry with the new token
      } catch (e) {
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.error || fallback;

export default api;
