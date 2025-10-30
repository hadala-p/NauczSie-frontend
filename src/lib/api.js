const parseJson = async (res) => {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
};

export const Api = (baseUrl) => {
  const url = (path) => `${baseUrl.replace(/\/$/, '')}${path}`;
  // Read OpenAI key from localStorage under 'nauczsie_openai_key'
  const headers = (token) => {
    const openaiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('nauczsie_openai_key') : null;
    const h = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    if (openaiKey) h['X-OpenAI-Key'] = openaiKey;
    return h;
  };

  return {
    health: async () => {
      const r = await fetch(url('/health'));
      return await parseJson(r);
    },
    categories: async () => {
      const r = await fetch(url('/categories'));
      return await parseJson(r);
    },
    register: async (payload) => {
      const r = await fetch(url('/register'), { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
      return { ok: r.ok, status: r.status, body: await parseJson(r) };
    },
    login: async (payload) => {
      const r = await fetch(url('/token'), { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
      return { ok: r.ok, status: r.status, body: await parseJson(r) };
    },
    logout: async (token) => {
      const r = await fetch(url('/logout'), { method: 'POST', headers: headers(token) });
      return { ok: r.ok, status: r.status, body: await parseJson(r) };
    },
    me: async (token) => {
      const r = await fetch(url('/user/me'), { headers: headers(token) });
      return { ok: r.ok, status: r.status, body: await parseJson(r) };
    },
    updateLangs: async (token, payload) => {
      const r = await fetch(url('/user/langs'), { method: 'PUT', headers: headers(token), body: JSON.stringify(payload) });
      return { ok: r.ok, status: r.status, body: await parseJson(r) };
    },
    generate: async (token, categoryId) => {
      const r = await fetch(url(`/categories/${categoryId}/generate`), { method: 'POST', headers: headers(token) });
      return { ok: r.ok, status: r.status, body: await parseJson(r) };
    },
    myWords: async (token) => {
      const r = await fetch(url('/words'), { headers: headers(token) });
      return { ok: r.ok, status: r.status, body: await parseJson(r) };
    },
  };
};
