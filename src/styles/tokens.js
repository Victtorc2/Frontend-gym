// Token de colores que mapean a las CSS custom properties del tema
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

// Mapa de estado → variante de badge
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
