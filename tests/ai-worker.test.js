"use strict";
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

let handler;
let upstreamRequest = null;
let upstreamResponse = new Response(
  JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }),
  { status: 200 }
);
const context = {
  console,
  JSON,
  Response,
  Request,
  URL,
  fetch: async (_url, init) => {
    upstreamRequest = init;
    return upstreamResponse;
  },
  Deno: { serve(value) { handler = value; } }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/worker.js', 'utf8'), context, { filename: 'js/worker.js' });

async function request(method, body) {
  return handler(new Request('https://worker.test/', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  }));
}

(async () => {
  let response = await request('POST', { model: 'test', messages: [] });
  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).code, 'OWN_API_KEY_REQUIRED');
  assert.strictEqual(upstreamRequest, null);

  response = await request('POST', { model: 'test', messages: [], userApiKey: '   ' });
  assert.strictEqual(response.status, 400);
  assert.strictEqual(upstreamRequest, null);

  response = await request('POST', {
    provider: 'tooken',
    model: 'test-model',
    messages: [{ role: 'user', content: 'hello' }],
    userApiKey: '  personal-key  '
  });
  assert.strictEqual(response.status, 200);
  assert.strictEqual(upstreamRequest.headers.Authorization, 'Bearer personal-key');
  const forwardedBody = JSON.parse(upstreamRequest.body);
  assert.strictEqual(forwardedBody.model, 'test-model');
  assert.strictEqual(Object.hasOwn(forwardedBody, 'provider'), false);
  assert.strictEqual(Object.hasOwn(forwardedBody, 'userApiKey'), false);
  assert.strictEqual(response.headers.get('Access-Control-Allow-Origin'), '*');

  response = await request('GET');
  assert.strictEqual(response.status, 405);

  console.log('ai-worker: PASS');
})().catch(error => { console.error(error); process.exitCode = 1; });
