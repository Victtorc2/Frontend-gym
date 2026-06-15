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
      border: type === "info" ? "none" : "1px solid rgba(255,255,255,0.08)",
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
export const Card = ({ children, style, className }) => (
  <div className={className} style={{
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "1.25rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
    ...style,
  }}>
    {children}
  </div>
);

// ─── Row (Card con efecto hover, para listas) ──────────────────────────────────
export const Row = ({ children, style }) => (
  <Card className="row-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, ...style }}>
    {children}
  </Card>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar = ({ children, size = 38, color }) => (
  <div style={{
    width: size, height: size,
    borderRadius: "50%",
    background: color || "linear-gradient(135deg, #FFD600, #FF9900)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.36,
    fontWeight: 700,
    color: "#111",
    flexShrink: 0,
    fontFamily: "'Barlow Condensed', sans-serif",
  }}>
    {children}
  </div>
);

// ─── PageHeader ───────────────────────────────────────────────────────────────
export const PageHeader = ({ icon, title, subtitle, actions }) => (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: "1.75rem",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {icon && (
        <div style={{
          width: 44, height: 44,
          background: "linear-gradient(135deg, #FFD600 0%, #FF9900 100%)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(255,214,0,0.35)",
        }}>
          <i className={`ti ti-${icon}`} style={{ fontSize: 22, color: "#111" }} />
        </div>
      )}
      <div>
        <h2 style={{
          margin: 0,
          fontSize: 28,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          color: C.text,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          lineHeight: 1.15,
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ margin: "2px 0 0", fontSize: 13, color: C.textSec }}>{subtitle}</p>
        )}
      </div>
    </div>
    {actions && (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {actions}
      </div>
    )}
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color = "#FFD600", dark = false }) => (
  <div style={{
    background: dark ? "#111111" : C.bg,
    border: dark ? "none" : `1px solid ${C.border}`,
    borderRadius: 16,
    padding: "1.25rem 1.4rem",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{ position: "absolute", right: -10, bottom: -14, opacity: dark ? 0.08 : 0.07 }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: 76, color: dark ? "#fff" : color }} />
    </div>
    <div style={{
      width: 36, height: 36,
      background: dark ? "rgba(255,255,255,0.08)" : `${color}22`,
      borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: 18, color }} />
    </div>
    <div>
      <div style={{
        fontSize: 28,
        fontWeight: 800,
        fontFamily: "'Barlow Condensed', sans-serif",
        color: dark ? "#fff" : C.text,
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: dark ? "rgba(255,255,255,0.55)" : C.textSec,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginTop: 4,
        fontFamily: "'Barlow Condensed', sans-serif",
      }}>
        {label}
      </div>
    </div>
  </div>
);

// ─── DetailField ──────────────────────────────────────────────────────────────
export const DetailField = ({ label, value }) => (
  <div>
    <div style={{
      fontSize: 11,
      color: C.textSec,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: 4,
      fontFamily: "'Barlow Condensed', sans-serif",
    }}>
      {label}
    </div>
    <div style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{value}</div>
  </div>
);

// ─── FilterSelect ─────────────────────────────────────────────────────────────
export const FilterSelect = ({ children, style, ...props }) => (
  <select
    {...props}
    style={{
      padding: "8px 12px",
      borderRadius: 8,
      border: `1.5px solid ${C.borderSec}`,
      background: C.bgSec,
      color: C.text,
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      outline: "none",
      transition: "border-color 0.15s",
      ...style,
    }}
    onFocus={e => e.target.style.borderColor = "#FFD600"}
    onBlur={e => e.target.style.borderColor = C.borderSec}
  >
    {children}
  </select>
);

// ─── FilterInput ──────────────────────────────────────────────────────────────
export const FilterInput = ({ style, ...props }) => (
  <input
    {...props}
    style={{
      padding: "8px 12px",
      borderRadius: 8,
      border: `1.5px solid ${C.borderSec}`,
      background: C.bgSec,
      color: C.text,
      fontSize: 13,
      outline: "none",
      transition: "border-color 0.15s",
      ...style,
    }}
    onFocus={e => e.target.style.borderColor = "#FFD600"}
    onBlur={e => e.target.style.borderColor = C.borderSec}
  />
);

// ─── Btn ──────────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, type = "button", variant = "default", loading, disabled, style, className }) => {
  const styles = {
    default: { background: C.bgSec, color: C.text, border: `1px solid ${C.borderSec}` },
    primary: { background: "#FFD600", color: "#111", border: "none", fontWeight: 700 },
    danger:  { background: "#f87171", color: "#1a1a1a", border: "none", fontWeight: 700 },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
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
        background: C.bgSec,
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
        background: C.bgSec,
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
    ? [C.success, C.successText, "rgba(74, 222, 128, 0.35)"]
    : [C.danger, C.dangerText, "rgba(248, 113, 113, 0.35)"];
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
      background: "rgba(255, 214, 0, 0.12)",
      borderRadius: 12,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: 28, color: "#FFD600" }} />
    </div>
    <p style={{ margin: 0, fontSize: 14 }}>{text}</p>
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, width = 500 }) => (
  <div style={{
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(2px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "1rem",
  }}>
    <div style={{
      background: C.bg,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
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
