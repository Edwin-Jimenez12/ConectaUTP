const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const destinationEmail = 'conectautp507@gmail.com';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await request.json();
    const firstName = cleanText(body.firstName, 60);
    const lastName = cleanText(body.lastName, 60);
    const email = cleanText(body.email, 255);
    const feedback = cleanText(body.feedback, 3000);

    if (body.website) return json({ success: true }, 200);
    if (!firstName || !lastName || !feedback || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Completa todos los campos correctamente.' }, 400);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FEEDBACK_FROM_EMAIL');
    if (!resendApiKey || !fromEmail) return json({ error: 'El servicio de correo no está configurado.' }, 500);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [destinationEmail],
        reply_to: email,
        subject: `Nueva opinión de ${firstName} ${lastName}`,
        html: `<h2>Nueva opinión sobre ConectaUTP</h2><p><strong>Nombre:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p><p><strong>Correo:</strong> ${escapeHtml(email)}</p><p><strong>Opinión:</strong></p><p>${escapeHtml(feedback).replaceAll('\n', '<br />')}</p>`,
      }),
    });

    if (!emailResponse.ok) return json({ error: 'No se pudo enviar la opinión.' }, 502);
    return json({ success: true }, 200);
  } catch {
    return json({ error: 'No se pudo procesar la opinión.' }, 500);
  }
});

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
