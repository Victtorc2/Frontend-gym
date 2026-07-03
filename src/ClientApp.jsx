import Layout from "./components/Layout";
import api from "./services/api";
import MiPerfilView from "./views/cliente/MiPerfilView";
import MiMembresiaView from "./views/cliente/MiMembresiaView";
import MisPagosView from "./views/cliente/MisPagosView";
import MiAsistenciaView from "./views/cliente/MiAsistenciaView";
import MiHorarioRecomendadoView from "./views/cliente/MiHorarioRecomendadoView";
import MiPlanView from "./views/cliente/MiPlanView";
import MisComentariosView from "./views/cliente/MisComentariosView";
import MaquinasClienteView from "./views/cliente/MaquinasClienteView";
import ReservasView from "./views/cliente/ReservasView";

const NAV = [
  { id: "perfil",     icon: "user",            label: "Mi Perfil" },
  { id: "membresia",  icon: "id-badge",        label: "Mi Membresía" },
  { id: "pagos",      icon: "cash",            label: "Mis Pagos" },
  { id: "asistencia", icon: "activity",        label: "Mi Asistencia" },
  { id: "maquinas",   icon: "barbell",         label: "Máquinas" },
  { id: "horario",    icon: "clock-bolt",      label: "Horario Recomendado" },
  { id: "plan",       icon: "clipboard-check", label: "Mi Plan" },
  { id: "reservas",   icon: "calendar-plus",   label: "Reservar Máquina" },
  { id: "comentarios", icon: "message-2",      label: "Comentarios" },
];

const VIEWS = {
  perfil:      <MiPerfilView />,
  membresia:   <MiMembresiaView />,
  pagos:       <MisPagosView />,
  asistencia:  <MiAsistenciaView />,
  maquinas:    <MaquinasClienteView />,
  horario:     <MiHorarioRecomendadoView />,
  plan:        <MiPlanView />,
  reservas:    <ReservasView />,
  comentarios: <MisComentariosView />,
};

export default function ClientApp({ auth, logout }) {
  const handleLogout = async () => {
    try { await api.post("/api/cliente/logout"); } catch { /* sesión ya inválida */ }
    logout();
  };

  return <Layout nav={NAV} views={VIEWS} auth={auth} logout={handleLogout} />;
}
