const API_BASE = "http://localhost:8000";

const api = {
  // El token se inicializa desde localStorage para mantener la sesión tras un refresh.
  token: localStorage.getItem("gym_token") || null,

  setToken(token) {
    this.token = token || null;
    if (token) localStorage.setItem("gym_token", token);
    else localStorage.removeItem("gym_token");
  },

  async request(method, path, body) {
    const headers = { "Content-Type": "application/json" };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    // Sesión expirada o inválida: limpiamos credenciales locales.
    if (res.status === 401) {
      api.setToken(null);
      localStorage.removeItem("gym_user");
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error en la solicitud");
    return data;
  },
  get: (path) => api.request("GET", path),
  post: (path, body) => api.request("POST", path, body),
  put: (path, body) => api.request("PUT", path, body),
  patch: (path, body) => api.request("PATCH", path, body),
};

export default api;
