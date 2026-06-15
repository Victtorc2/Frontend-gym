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
  yellow: "#FFD600",
  black: "#111111",
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
  BAJA:  { bg: "#e8f5e9", border: "#4caf50", text: "#2e7d32" },
  MEDIA: { bg: "#fff8e1", border: "#FFD600", text: "#8a6d00" },
  ALTA:  { bg: "#ffebee", border: "#e53935", text: "#c62828" },
};
export const heatColor = (nivel) => heatColors[nivel] || { bg: C.bgSec, border: C.border, text: C.textSec };
