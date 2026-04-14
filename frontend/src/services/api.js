import axios from 'axios';

const API_URL = 'http://localhost:4000';
const FASTAPI_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { emailid: email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  sendOtp: async (emailid) => {
    const response = await api.post(`/auth/send-otp/${emailid}`);
    return response.data;
  },

  verifyOtp: async (emailid, otp) => {
    const response = await api.post(`/auth/verify-otp/${emailid}`, { otp });
    return response.data;
  },

  resetPassword: async (emailid, newPassword) => {
    const response = await api.post(`/auth/reset-password/${emailid}`, { newPassword });
    return response.data;
  },
};

// Interview Services
export const interviewService = {
  startInterview: async (interviewData) => {
    const response = await api.post('/interviews/start', interviewData);
    return response.data;
  },

  submitAnswer: async (interviewId, audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await api.post(`/interviews/${interviewId}/answer`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return response.data;
  },

  completeInterview: async (interviewId) => {
    const response = await api.post(`/interviews/${interviewId}/complete`);
    return response.data;
  },

  getInterviewHistory: async () => {
    const response = await api.get('/interviews/history');
    return response.data;
  },
};

// Resume Services
export const resumeService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getResumeAnalysis: async () => {
    const response = await api.get('/resumes/analysis');
    return response.data;
  },

  getResumeHistory: async () => {
    const response = await api.get('/resumes/history');
    return response.data;
  },
};

// User Services
export const userService = {
  getProfile: async (email) => {
    const response = await api.get(`/users/view-profile/${email}`);
    return response.data;
  },

  updateProfile: async (email, userData) => {
    const response = await api.put(`/users/edit-profile/${email}`, userData);
    return response.data;
  },
};

// FastAPI Direct Services (if needed)
export const fastAPIService = {
  // Interview related
  setInterviewType: async (type) => {
    const response = await axios.post(`${FASTAPI_URL}/set_interview_type`, { interview_type: type });
    return response.data;
  },

  setDifficulty: async (difficulty) => {
    const response = await axios.post(`${FASTAPI_URL}/set_difficulty`, { difficulty });
    return response.data;
  },

  setPosition: async (position) => {
    const response = await axios.post(`${FASTAPI_URL}/set_position`, { position });
    return response.data;
  },

  // Resume related
  analyzeResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${FASTAPI_URL}/analyze_resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFirstQuestion: async () => {
    // Fetch the introduction audio from /first_question
    const response = await axios.get(`${FASTAPI_URL}/first_question`, {
      responseType: 'arraybuffer', // Expect audio response
    });
    return response;
  },

  getFeedback: async () => {
    const response = await axios.get(`${FASTAPI_URL}/feedback`);
    return response;
  },

  getFeedbackHeatmap: async () => {
    const response = await axios.get(`${FASTAPI_URL}/feedback_heatmap`);
    return response;
  },
};

export const getNotifications = async (token) => {
  return axios.get(`${API_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const markNotificationAsRead = async (id, token) => {
  return axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};