// Utilidades de exportación de reportes a Excel (.xlsx) y PDF.
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const fmt = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  if (typeof v === "object") return JSON.stringify(v);
  return v;
};

const titleize = (k) => String(k).replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

const slug = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const stamp = () => new Date().toISOString().slice(0, 10);

// Separa un objeto de datos en escalares (indicadores) y arreglos (tablas).
const split = (data) => {
  const scalars = Object.entries(data).filter(([, v]) => typeof v !== "object" || v === null);
  const arrays = Object.entries(data).filter(([, v]) => Array.isArray(v) && v.length > 0);
  return { scalars, arrays };
};

// ── Excel ────────────────────────────────────────────────────────────────────
export function reportToExcel(title, data) {
  const { scalars, arrays } = split(data);
  const wb = XLSX.utils.book_new();

  if (scalars.length) {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Indicador", "Valor"],
      ...scalars.map(([k, v]) => [titleize(k), fmt(v)]),
    ]);
    ws["!cols"] = [{ wch: 32 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws, "Resumen");
  }

  arrays.forEach(([k, rows]) => {
    const cols = Object.keys(rows[0]);
    const aoa = [cols.map(titleize), ...rows.map((r) => cols.map((c) => fmt(r[c])))];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = cols.map(() => ({ wch: 18 }));
    // Nombre de hoja: máx 31 chars y sin caracteres inválidos
    const name = titleize(k).replace(/[\\/?*[\]:]/g, "").slice(0, 31) || "Datos";
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  if (!wb.SheetNames.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Sin datos"]]), "Reporte");
  }
  XLSX.writeFile(wb, `reporte-${slug(title)}-${stamp()}.xlsx`);
}

// ── PDF ──────────────────────────────────────────────────────────────────────
export function reportToPDF(title, data) {
  const { scalars, arrays } = split(data);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Encabezado
  doc.setFillColor(255, 214, 0);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("GYMWARRIOR", 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(titleize(title), 196, 13, { align: "right" });

  doc.setTextColor(120);
  doc.setFontSize(9);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 27);

  let y = 33;

  if (scalars.length) {
    autoTable(doc, {
      startY: y,
      head: [["Indicador", "Valor"]],
      body: scalars.map(([k, v]) => [titleize(k), fmt(v)]),
      theme: "grid",
      headStyles: { fillColor: [255, 214, 0], textColor: 20, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 2.5 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  arrays.forEach(([k, rows]) => {
    const cols = Object.keys(rows[0]);
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${titleize(k)} (${rows.length})`, 14, y);
    y += 3;
    autoTable(doc, {
      startY: y,
      head: [cols.map(titleize)],
      body: rows.map((r) => cols.map((c) => fmt(r[c]))),
      theme: "striped",
      headStyles: { fillColor: [23, 24, 28], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 7.5, cellPadding: 2, overflow: "linebreak" },
      alternateRowStyles: { fillColor: [250, 250, 247] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  });

  if (!scalars.length && !arrays.length) {
    doc.setTextColor(120);
    doc.text("Sin datos disponibles.", 14, y);
  }

  doc.save(`reporte-${slug(title)}-${stamp()}.pdf`);
}
