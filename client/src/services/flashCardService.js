import axiosInstance from '../utils/axiosInstance';
import { FLASHCARD_ENDPOINTS } from '../utils/apiPaths';

const flashCardService = {
  getFlashcards: async (documentId = '', favorite = false) => {
    const params = {};
    if (documentId) params.documentId = documentId;
    if (favorite) params.favorite = 'true';
    
    const res = await axiosInstance.get(FLASHCARD_ENDPOINTS.LIST, { params });
    return res.data;
  },
  createFlashcard: async (question, answer, documentId) => {
    const res = await axiosInstance.post(FLASHCARD_ENDPOINTS.CREATE, { question, answer, documentId });
    return res.data;
  },
  toggleFavorite: async (id) => {
    const res = await axiosInstance.put(FLASHCARD_ENDPOINTS.TOGGLE_FAVORITE(id));
    return res.data;
  },
  deleteFlashcard: async (id) => {
    const res = await axiosInstance.delete(FLASHCARD_ENDPOINTS.DELETE(id));
    return res.data;
  }
};

export default flashCardService;
