export const API_BASE = "http://localhost:8000";

// Construye la URL absoluta de un recurso servido por el backend (ej. foto de máquina).
export const mediaUrl = (path) => (path ? `${API_BASE}${path}` : null);

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
  del: (path) => api.request("DELETE", path),

  // Subida de archivos (multipart). No fija Content-Type: el navegador pone el boundary.
  async upload(path, file, field = "file") {
    const form = new FormData();
    form.append(field, file);
    const headers = {};
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: form });
    if (res.status === 401) { api.setToken(null); localStorage.removeItem("gym_user"); }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al subir el archivo");
    return data;
  },
};

export default api;
