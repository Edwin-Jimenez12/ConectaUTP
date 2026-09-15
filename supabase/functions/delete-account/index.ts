import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return json({ error: 'Sesión no autorizada.' }, 401);
  }

  try {
    const url = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data, error } = await userClient.auth.getUser();
    if (error || !data.user) return json({ error: 'Sesión no autorizada.' }, 401);

    const admin = createClient(url, serviceRoleKey);
    const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
    if (deleteError) return json({ error: 'No se pudo eliminar la cuenta.' }, 500);
    return json({ success: true }, 200);
  } catch {
    return json({ error: 'No se pudo procesar la solicitud.' }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
