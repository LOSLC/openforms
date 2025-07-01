import { api, LoginRequest, RegisterRequest, MessageResponse, User } from '../api';

export const authService = {
  login: async (data: LoginRequest): Promise<MessageResponse> => {
    return api.post('api/v1/auth/login', { json: data }).json();
  },

  register: async (data: RegisterRequest): Promise<MessageResponse> => {
    return api.post('api/v1/auth/register', { json: data }).json();
  },

  logout: async (): Promise<MessageResponse> => {
    return api.post('api/v1/auth/logout').json();
  },

  getCurrentUser: async (): Promise<User> => {
    return api.get('api/v1/auth/me').json();
  },
};
