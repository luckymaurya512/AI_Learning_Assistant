import axiosInstance from '../utils/axiosInstance';
import { DOCUMENT_ENDPOINTS } from '../utils/apiPaths';

const documentService = {
  uploadDocument: async (formData) => {
    const res = await axiosInstance.post(DOCUMENT_ENDPOINTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },
  getDocuments: async () => {
    const res = await axiosInstance.get(DOCUMENT_ENDPOINTS.LIST);
    return res.data;
  },
  getDocument: async (id) => {
    const res = await axiosInstance.get(DOCUMENT_ENDPOINTS.DETAILS(id));
    return res.data;
  },
  deleteDocument: async (id) => {
    const res = await axiosInstance.delete(DOCUMENT_ENDPOINTS.DELETE(id));
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await axiosInstance.get(DOCUMENT_ENDPOINTS.DASHBOARD_STATS);
    return res.data;
  }
};

export default documentService;
