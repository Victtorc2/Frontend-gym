import { useState } from "react";
import api from "./services/api";
import LoginView from "./views/LoginView";
import AdminApp from "./AdminApp";
import ClientApp from "./ClientApp";

export default function App() {
  // Restaura la sesión guardada (token + datos del usuario) tras un refresh.
  const [auth, setAuth] = useState(() => {
    if (!api.token) return null;
    try {
      const stored = localStorage.getItem("gym_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const logout = () => {
    api.setToken(null);
    localStorage.removeItem("gym_user");
    setAuth(null);
  };

  if (!auth) return <LoginView onLogin={setAuth} />;

  if (auth.rol === "cliente") return <ClientApp auth={auth} logout={logout} />;

  return <AdminApp auth={auth} logout={logout} />;
}
