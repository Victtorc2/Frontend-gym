import { C } from "../styles/colors";

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, type = "info" }) => {
  const map = {
    info:    ["#FFD600", "#111111"],
    success: [C.success, C.successText],
    danger:  [C.danger,  C.dangerText],
    warning: [C.warning, C.warningText],
    neutral: [C.bgSec,   C.textSec],
  };
  const [bg, color] = map[type] || map.info;
  return (
    <span style={{
      background: bg,
      color,
      fontSize: 11,
      padding: "3px 9px",
      borderRadius: 4,
      fontWeight: 700,
      whiteSpace: "nowrap",
      fontFamily: "'Barlow Condensed', sans-serif",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ estado }) => {
  if (!estado) return null;
  const map = { activo:"success", activa:"success", inactivo:"neutral", inactiva:"neutral", vencida:"warning", pendiente:"danger", aprobado:"success", denegado:"danger" };
  return <Badge type={map[estado] || "neutral"}>{estado}</Badge>;
};

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style }) => (
  <div style={{
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "1.25rem",
    ...style,
  }}>
    {children}
  </div>
);

// ─── Btn ──────────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, type = "button", variant = "default", loading, disabled, style }) => {
  const styles = {
    default: { background: C.bg, color: C.text, border: `1px solid ${C.borderSec}` },
    primary: { background: "#FFD600", color: "#111", border: "none", fontWeight: 700 },
    danger:  { background: C.danger, color: C.dangerText, border: "none" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s",
        ...styles[variant],
        ...style,
      }}
    >
      {loading && <i className="ti ti-loader" style={{ animation: "spin 1s linear infinite" }} />}
      {children}
    </button>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = ({ label, id, error, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && (
      <label htmlFor={id} style={{
        fontSize: 12,
        color: C.textSec,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontFamily: "'Barlow Condensed', sans-serif",
      }}>
        {label}
      </label>
    )}
    <input
      id={id}
      style={{
        padding: "9px 12px",
        borderRadius: 8,
        border: `1.5px solid ${error ? "var(--color-border-danger)" : C.borderSec}`,
        background: C.bg,
        color: C.text,
        fontSize: 14,
        outline: "none",
        transition: "border-color 0.15s",
      }}
      onFocus={e => e.target.style.borderColor = "#FFD600"}
      onBlur={e => e.target.style.borderColor = error ? "var(--color-border-danger)" : C.borderSec}
      {...props}
    />
    {error && <span style={{ fontSize: 12, color: C.dangerText }}>{error}</span>}
  </div>
);

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = ({ label, id, children, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && (
      <label htmlFor={id} style={{
        fontSize: 12,
        color: C.textSec,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontFamily: "'Barlow Condensed', sans-serif",
      }}>
        {label}
      </label>
    )}
    <select
      id={id}
      style={{
        padding: "9px 12px",
        borderRadius: 8,
        border: `1.5px solid ${C.borderSec}`,
        background: C.bg,
        color: C.text,
        fontSize: 14,
      }}
      {...props}
    >
      {children}
    </select>
  </div>
);

// ─── Alert ────────────────────────────────────────────────────────────────────
export const Alert = ({ type = "danger", children }) => {
  const [bg, color, border] = type === "success"
    ? [C.success, C.successText, "#a5d6a7"]
    : [C.danger, C.dangerText, "#ef9a9a"];
  return (
    <div style={{
      background: bg,
      color,
      border: `1px solid ${border}`,
      padding: "10px 14px",
      borderRadius: 8,
      fontSize: 13,
      marginTop: 8,
    }}>
      {children}
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
    <div style={{
      width: 36,
      height: 36,
      border: "3px solid #FFD600",
      borderTopColor: "transparent",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: "center", padding: "3rem 1rem", color: C.textSec }}>
    <div style={{
      width: 56, height: 56,
      background: "#FFF9C4",
      borderRadius: 12,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: 28, color: "#F5C800" }} />
    </div>
    <p style={{ margin: 0, fontSize: 14 }}>{text}</p>
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, width = 500 }) => (
  <div style={{
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(2px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "1rem",
  }}>
    <div style={{
      background: C.bg,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      width: "100%", maxWidth: width,
      maxHeight: "90vh", overflow: "auto",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 1.25rem",
        borderBottom: `1px solid ${C.border}`,
        background: "#FFD600",
        borderRadius: "16px 16px 0 0",
      }}>
        <h2 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 800,
          fontFamily: "'Barlow Condensed', sans-serif",
          color: "#111",
          letterSpacing: "0.02em",
        }}>
          {title?.toUpperCase()}
        </h2>
        <button onClick={onClose} style={{
          background: "rgba(0,0,0,0.1)",
          border: "none",
          cursor: "pointer",
          color: "#111",
          fontSize: 16,
          padding: "4px 8px",
          borderRadius: 6,
        }}>
          <i className="ti ti-x" />
        </button>
      </div>
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </div>
  </div>
);
