const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();
    return null;
  }

  if (!res.ok) throw new Error(`Error en ${path}: ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export async function login(password) {
  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error('Contraseña incorrecta');
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data.token;
}

export function getTransactions(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/api/transactions${query ? `?${query}` : ''}`);
}

export function getSummary(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/api/summary${query ? `?${query}` : ''}`);
}

export function deleteTransaction(id) {
  return request(`/api/transactions/${id}`, { method: 'DELETE' });
}
