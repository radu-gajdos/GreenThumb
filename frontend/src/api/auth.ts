import axios from "axios";
import authentificatedHttp from "./http";

const API_URL = process.env.REACT_APP_API_URL;

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface TwoFactorCredentials {
  token: string;
  rememberMe: boolean;
}

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await http.post(`${API_URL}/auth/login`, credentials);
    return response;
  },

  verify2FA: async (credentials: TwoFactorCredentials) => {
    const tempToken = localStorage.getItem('tempToken');
    const response = await http.post(`${API_URL}/auth/verify-2fa`, credentials, {
      headers: { Authorization: `Bearer ${tempToken}` }
    });
    return response.data;
  },

  logout: async () => {
    const response = await http.post(`${API_URL}/auth/logout`);
    return response.data;
  },

  me: async () => {
    const response = await authentificatedHttp.post(`${API_URL}/auth/me`);
    return response.data;
  }
};