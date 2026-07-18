import axiosInstance from '../utils/axiosInstance';
import { QUIZ_ENDPOINTS } from '../utils/apiPaths';

const quizService = {
  getQuizzes: async (documentId = '') => {
    const params = {};
    if (documentId) params.documentId = documentId;
    
    const res = await axiosInstance.get(QUIZ_ENDPOINTS.LIST, { params });
    return res.data;
  },
  getQuizDetails: async (id) => {
    const res = await axiosInstance.get(QUIZ_ENDPOINTS.DETAILS(id));
    return res.data;
  },
  submitQuizAnswers: async (id, answers) => {
    const res = await axiosInstance.post(QUIZ_ENDPOINTS.SUBMIT(id), { answers });
    return res.data;
  },
  deleteQuiz: async (id) => {
    const res = await axiosInstance.delete(QUIZ_ENDPOINTS.DELETE(id));
    return res.data;
  }
};

export default quizService;
