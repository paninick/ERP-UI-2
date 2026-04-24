import {create} from 'zustand';
import client from '@/api/client';

interface UserInfo {
  userId: number;
  username: string;
  nickname: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  login: (username: string, password: string, code?: string, uuid?: string) => Promise<void>;
  logout: () => void;
  getInfo: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,

  login: async (username, password, code, uuid) => {
    const res: any = await client.post('/login', { username, password, code, uuid });
    const token = res.token;
    localStorage.setItem('token', token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  getInfo: async () => {
    const res: any = await client.get('/getInfo');
    set({
      user: {
        userId: res.user.userId,
        username: res.user.userName,
        nickname: res.user.nickName,
        roles: res.roles,
        permissions: res.permissions,
      },
    });
  },
}));
