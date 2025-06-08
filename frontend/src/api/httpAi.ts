import axios from 'axios';

const httpAi = axios.create({
  baseURL: process.env.REACT_APP_AI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default httpAi;
