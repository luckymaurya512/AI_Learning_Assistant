import axiosInstance from '../utils/axiosInstance';
import { AUTH_ENDPOINTS } from '../utils/apiPaths';

const authService = {
  login: async (email, password) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, { email, password });
    return res.data;
  },
  register: async (username, email, password) => {
    const res = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, { username, email, password });
    return res.data;
  },
  getProfile: async () => {
    const res = await axiosInstance.get(AUTH_ENDPOINTS.PROFILE);
    return res.data;
  }
};

export default authService;
