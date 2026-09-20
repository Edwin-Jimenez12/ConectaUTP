import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/profile';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setProfile(null);
        setIsLoading(Boolean(data.session));
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setIsAdmin(false);
        setProfile((currentProfile) => {
          if (nextSession && currentProfile?.id === nextSession.user.id) {
            return currentProfile;
          }
          return null;
        });
        setIsLoading(Boolean(nextSession));
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let isActive = true;

    void supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (isActive && data) setProfile(data as Profile);
      });

    return () => {
      isActive = false;
    };
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let isActive = true;
    void supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (isActive) {
          setIsAdmin(data?.role === 'admin');
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [session]);

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.hash = '#inicio';
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isAdmin,
        isLoading,
        signOut,
        updateProfile: setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
