import { supabase } from './supabase';

export async function hasAdminRole(userId: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  return !error && data?.role === 'admin';
}
