const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    let message = 'Request failed';
    try { const data = await res.json(); message = data.error || message; } catch {}
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  put: (path, body) => request(path, { method: 'PUT', body })
};