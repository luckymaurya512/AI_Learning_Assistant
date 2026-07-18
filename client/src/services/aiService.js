import axiosInstance from '../utils/axiosInstance';
import { AI_ENDPOINTS } from '../utils/apiPaths';

const aiService = {
  sendMessage: async (documentId, message) => {
    const res = await axiosInstance.post(AI_ENDPOINTS.CHAT, { documentId, message });
    return res.data;
  },
  getChatHistory: async (documentId) => {
    const res = await axiosInstance.get(AI_ENDPOINTS.CHAT_HISTORY(documentId));
    return res.data;
  },
  clearChatHistory: async (documentId) => {
    const res = await axiosInstance.delete(AI_ENDPOINTS.CLEAR_CHAT(documentId));
    return res.data;
  },
  getSummary: async (documentId) => {
    const res = await axiosInstance.post(AI_ENDPOINTS.SUMMARY, { documentId });
    return res.data;
  },
  explainConcept: async (documentId, concept) => {
    const res = await axiosInstance.post(AI_ENDPOINTS.EXPLAIN, { documentId, concept });
    return res.data;
  },
  generateFlashcards: async (documentId, count) => {
    const res = await axiosInstance.post(AI_ENDPOINTS.GENERATE_FLASHCARDS, { documentId, count });
    return res.data;
  },
  generateQuiz: async (documentId, questionCount) => {
    const res = await axiosInstance.post(AI_ENDPOINTS.GENERATE_QUIZ, { documentId, questionCount });
    return res.data;
  }
};

export default aiService;
