// AI proxy. Requests must include the user's own provider API key.
const TOOKEN_URL = 'https://tooken.club/v1/chat/completions';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Client-Version',
  'Access-Control-Max-Age': '86400'
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS }
  });
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Только POST' }, 405);

  let body;
  try {
    body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('invalid_request');
  } catch {
    return json({ error: 'Некорректный JSON запрос' }, 400);
  }

  const userApiKey = typeof body.userApiKey === 'string' ? body.userApiKey.trim() : '';
  if (!userApiKey) {
    return json({
      error: 'Для AI нужен личный API-ключ.',
      code: 'OWN_API_KEY_REQUIRED'
    }, 400);
  }
  if (userApiKey.length > 512) {
    return json({ error: 'Некорректный API-ключ.', code: 'INVALID_API_KEY' }, 400);
  }

  delete body.provider;
  delete body.userApiKey;

  try {
    const upstream = await fetch(TOOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...CORS }
    });
  } catch (error) {
    console.error('AI provider request failed:', error);
    return json({ error: 'Не удалось связаться с AI service' }, 502);
  }
});
