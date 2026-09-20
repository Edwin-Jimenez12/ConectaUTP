import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '../types/profile';

export interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (profile: Profile) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
