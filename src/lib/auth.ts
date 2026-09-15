import { supabase } from './supabase';

export async function signInWithIdentifier(identifier: string, password: string) {
  const normalizedIdentifier = identifier.trim();

  if (normalizedIdentifier.includes('@')) {
    return supabase.auth.signInWithPassword({
      email: normalizedIdentifier,
      password,
    });
  }

  const { data, error } = await supabase.functions.invoke('sign-in-with-username', {
    body: { username: normalizedIdentifier.toLowerCase(), password },
  });

  if (error) {
    const response = (error as { context?: Response }).context;
    const body = response ? await response.json().catch(() => null) : null;
    throw new Error(body?.error || 'No se pudo iniciar sesión con ese username.');
  }
  if (!data?.access_token || !data?.refresh_token) {
    throw new Error('La función de inicio de sesión no devolvió una sesión válida.');
  }

  return supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
}
