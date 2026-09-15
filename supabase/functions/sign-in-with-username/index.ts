import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { username, password } = await request.json();
    if (typeof username !== 'string' || typeof password !== 'string') {
      return json({ error: 'Username y contraseña son obligatorios.' }, 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    const normalizedUsername = username.trim().toLowerCase();
    const { data: profile, error: profileError } = await admin
      .from('profiles').select('id').eq('username', normalizedUsername).maybeSingle();
    if (profileError || !profile) return json({ error: 'Credenciales inválidas.' }, 401);

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id);
    if (userError || !userData.user?.email) return json({ error: 'Credenciales inválidas.' }, 401);

    const authApiKey = request.headers.get('apikey')
      ?? Deno.env.get('SUPABASE_ANON_KEY')
      ?? '';
    const authResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: authApiKey,
        },
        body: JSON.stringify({
          email: userData.user.email,
          password,
        }),
      },
    );
    const session = await authResponse.json();
    if (!authResponse.ok || !session.access_token || !session.refresh_token) {
      return json({ error: 'Credenciales inválidas.' }, 401);
    }

    return json(session, 200);
  } catch {
    return json({ error: 'No se pudo iniciar sesión.' }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
