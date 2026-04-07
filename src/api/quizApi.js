import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Assuming your Laravel backend is on port 8000

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getQuestions = async () => {
  try {
    const response = await apiClient.get('/questions');
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const submitResults = async (results) => {
  try {
    const response = await apiClient.post('/results', results);
    return response.data;
  } catch (error) {
    console.error('Error submitting results:', error);
    throw error;
  }
};
