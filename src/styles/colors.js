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
  BAJA:  { bg: "rgba(34, 197, 94, 0.10)",  border: "#22c55e", text: "#15803d" },
  MEDIA: { bg: "rgba(255, 214, 0, 0.16)",  border: "#FFD600", text: "#9a7400" },
  ALTA:  { bg: "rgba(239, 68, 68, 0.10)",  border: "#ef4444", text: "#b91c1c" },
};
export const heatColor = (nivel) => heatColors[nivel] || { bg: C.bgSec, border: C.border, text: C.textSec };
