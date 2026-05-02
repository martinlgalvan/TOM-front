const RAW_TARGET = String(
  process.env.API_PROXY_TARGET ||
  process.env.VITE_API_BASE ||
  'https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app'
).trim().replace(/\/+$/, '');

const UPSTREAM_ORIGIN = RAW_TARGET.endsWith('/api')
  ? RAW_TARGET.slice(0, -4)
  : RAW_TARGET;

function buildUpstreamUrl(req) {
  const parts = Array.isArray(req.query?.path)
    ? req.query.path
    : req.query?.path
      ? [req.query.path]
      : [];

  const upstreamUrl = new URL(`/api/${parts.join('/')}`, UPSTREAM_ORIGIN);

  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === 'path') continue;

    if (Array.isArray(value)) {
      value.forEach((entry) => upstreamUrl.searchParams.append(key, entry));
      continue;
    }

    if (value !== undefined) {
      upstreamUrl.searchParams.set(key, value);
    }
  }

  return upstreamUrl;
}

function copyRequestHeaders(req) {
  const headers = new Headers();
  const blocked = new Set([
    'host',
    'connection',
    'content-length',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-port',
    'x-forwarded-proto',
  ]);

  for (const [key, value] of Object.entries(req.headers || {})) {
    if (!value || blocked.has(key.toLowerCase())) continue;

    if (Array.isArray(value)) {
      value.forEach((entry) => headers.append(key, entry));
      continue;
    }

    headers.set(key, value);
  }

  return headers;
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(chunks.length ? Buffer.concat(chunks) : null));
    req.on('error', reject);
  });
}

async function getRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;

  if (req.body === undefined) {
    return readRawBody(req);
  }

  if (Buffer.isBuffer(req.body) || typeof req.body === 'string') {
    return req.body;
  }

  if (req.body === null) return null;

  return JSON.stringify(req.body);
}

function copyResponseHeaders(upstreamResponse, res) {
  const setCookies = typeof upstreamResponse.headers.getSetCookie === 'function'
    ? upstreamResponse.headers.getSetCookie()
    : [];

  if (setCookies.length) {
    res.setHeader('set-cookie', setCookies);
  }

  upstreamResponse.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'set-cookie' || lower === 'content-length' || lower === 'transfer-encoding') {
      return;
    }

    res.setHeader(key, value);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const upstreamUrl = buildUpstreamUrl(req);
    const headers = copyRequestHeaders(req);
    const body = await getRequestBody(req);

    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });

    copyResponseHeaders(upstreamResponse, res);

    const buffer = Buffer.from(await upstreamResponse.arrayBuffer());
    res.status(upstreamResponse.status).send(buffer);
  } catch (error) {
    console.error('[API PROXY] Request failed:', error);
    res.status(502).json({ message: 'Proxy error', error: error?.message || 'Unknown error' });
  }
}
