import { createContext } from 'react';
import type { PublicUser } from '../types/api';

export type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  apiBase: string;
  refreshUser: () => Promise<PublicUser | null>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
