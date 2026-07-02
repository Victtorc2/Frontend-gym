import Layout from "./components/Layout";
import DashboardView from "./views/DashboardView";
import ClientesView from "./views/ClientesView";
import MembresiasView from "./views/MembresiasView";
import AsistenciasView from "./views/AsistenciasView";
import ClientesDiariosView from "./views/ClientesDiariosView";
import PagosView from "./views/PagosView";
import SegmentacionView from "./views/SegmentacionView";
import RecomendacionesView from "./views/RecomendacionesView";
import RecomendarClienteView from "./views/RecomendarClienteView";
import MaquinasView from "./views/MaquinasView";
import RutinasView from "./views/RutinasView";
import DemandaView from "./views/DemandaView";
import ComentariosView from "./views/ComentariosView";
import ReportesView from "./views/ReportesView";

const NAV = [
  { id: "dashboard",       icon: "layout-dashboard", label: "Dashboard" },
  { id: "clientes",        icon: "users",             label: "Clientes" },
  { id: "membresias",      icon: "id-badge",          label: "Membresías" },
  { id: "asistencias",     icon: "activity",          label: "Asistencias" },
  { id: "diarios",         icon: "user-dollar",       label: "Clientes Diarios" },
  { id: "pagos",           icon: "cash",              label: "Pagos" },
  { id: "segmentacion",    icon: "chart-pie",         label: "Segmentación" },
  { id: "recomendaciones", icon: "clock-bolt",        label: "Horarios Recomendados" },
  { id: "recomendar",      icon: "user-star",         label: "Recomendar a Cliente" },
  { id: "maquinas",        icon: "barbell",           label: "Máquinas" },
  { id: "rutinas",         icon: "clipboard-list",    label: "Rutinas" },
  { id: "demanda",         icon: "chart-histogram",   label: "Demanda" },
  { id: "comentarios",     icon: "message-2",         label: "Comentarios" },
  { id: "reportes",        icon: "chart-bar",         label: "Reportes" },
];

const VIEWS = {
  dashboard:       <DashboardView />,
  clientes:        <ClientesView />,
  membresias:      <MembresiasView />,
  asistencias:     <AsistenciasView />,
  diarios:         <ClientesDiariosView />,
  pagos:           <PagosView />,
  segmentacion:    <SegmentacionView />,
  recomendaciones: <RecomendacionesView />,
  recomendar:      <RecomendarClienteView />,
  maquinas:        <MaquinasView />,
  rutinas:         <RutinasView />,
  demanda:         <DemandaView />,
  comentarios:     <ComentariosView />,
  reportes:        <ReportesView />,
};

export default function AdminApp({ auth, logout }) {
  return <Layout nav={NAV} views={VIEWS} auth={auth} logout={logout} />;
}
