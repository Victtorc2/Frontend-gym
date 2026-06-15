export const C = {
  bg: "var(--color-background-primary)",
  bgSec: "var(--color-background-secondary)",
  bgTert: "var(--color-background-tertiary)",
  border: "var(--color-border-tertiary)",
  borderSec: "var(--color-border-secondary)",
  text: "var(--color-text-primary)",
  textSec: "var(--color-text-secondary)",
  info: "var(--color-background-info)",
  infoText: "var(--color-text-info)",
  success: "var(--color-background-success)",
  successText: "var(--color-text-success)",
  danger: "var(--color-background-danger)",
  dangerText: "var(--color-text-danger)",
  warning: "var(--color-background-warning)",
  warningText: "var(--color-text-warning)",
};

export const statusBadgeType = {
  activo: "success",
  activa: "success",
  inactivo: "neutral",
  inactiva: "neutral",
  vencida: "warning",
  pendiente: "danger",
  aprobado: "success",
  denegado: "danger",
};

const heatColors = {
  BAJA:  { bg: "rgba(74, 222, 128, 0.12)", border: "#4ade80", text: "#86efac" },
  MEDIA: { bg: "rgba(255, 214, 0, 0.10)",  border: "#FFD600", text: "#FFD600" },
  ALTA:  { bg: "rgba(248, 113, 113, 0.14)", border: "#f87171", text: "#fca5a5" },
};
export const heatColor = (nivel) => heatColors[nivel] || { bg: C.bgSec, border: C.border, text: C.textSec };
