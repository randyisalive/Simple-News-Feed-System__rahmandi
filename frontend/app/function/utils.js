export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export async function apiFetch(path, opts = {}) {
  const headers = opts.headers || {};
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  headers["Content-Type"] = "application/json";
  const res = await fetch(path, { ...opts, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || json.error || "API error");
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}
