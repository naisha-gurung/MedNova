import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mednova_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || 'Something went wrong';

    if (status === 401) {
      // Expired / invalid token — clear and redirect to login
      localStorage.removeItem('mednova_token');
      if (window.location.pathname !== '/login') window.location.href = '/login';

    } else if (status === 403) {
      // Role not authorized — show once here, mark as handled so
      // component-level catches don't show a second generic toast
      toast.error('You are not authorized to perform this action');
      error._toasted = true;

    } else if (status >= 500) {
      // Server error — show the actual server message (not a generic string),
      // mark as handled so component catches don't double-toast
      toast.error(`Server error: ${msg}`);
      error._toasted = true;
    }

    // Always reject so callers can still react (e.g. stop spinners)
    return Promise.reject(error);
  }
);

export default api;