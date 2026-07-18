export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  PROFILE: '/auth/profile'
};

export const DOCUMENT_ENDPOINTS = {
  UPLOAD: '/documents/upload',
  LIST: '/documents',
  DETAILS: (id) => `/documents/${id}`,
  DELETE: (id) => `/documents/${id}`,
  DASHBOARD_STATS: '/documents/dashboard/stats'
};

export const FLASHCARD_ENDPOINTS = {
  LIST: '/flashcards',
  CREATE: '/flashcards',
  TOGGLE_FAVORITE: (id) => `/flashcards/${id}/favorite`,
  DELETE: (id) => `/flashcards/${id}`
};

export const QUIZ_ENDPOINTS = {
  LIST: '/quizzes',
  DETAILS: (id) => `/quizzes/${id}`,
  SUBMIT: (id) => `/quizzes/${id}/submit`,
  DELETE: (id) => `/quizzes/${id}`
};

export const AI_ENDPOINTS = {
  CHAT: '/ai/chat',
  CHAT_HISTORY: (docId) => `/ai/chat/${docId}`,
  CLEAR_CHAT: (docId) => `/ai/chat/${docId}`,
  SUMMARY: '/ai/summary',
  EXPLAIN: '/ai/explain',
  GENERATE_FLASHCARDS: '/ai/generate-flashcards',
  GENERATE_QUIZ: '/ai/generate-quiz'
};
