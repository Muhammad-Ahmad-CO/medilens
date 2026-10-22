import { jsPDF } from "jspdf";
import type { ScanResult } from "@/components/VerdictCard";
import { VERDICT_COPY } from "@/lib/verdict";

/** Client-side PDF report for pharmacists (no server needed). */
export function downloadPdfReport(result: ScanResult) {
  const doc = new jsPDF();
  const { verdict, label, drug } = result;
  const copy = VERDICT_COPY[verdict.level];
  let y = 20;

  doc.setFontSize(18);
  doc.text("MediLens — Scan Report", 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 12;

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Verdict: ${copy.title}`, 14, y);
  y += 8;
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(copy.advice, 180), 14, y);
  y += 18;

  doc.setFontSize(12);
  doc.text("Findings:", 14, y);
  y += 7;
  doc.setFontSize(10);
  for (const r of verdict.reasons) {
    const lines = doc.splitTextToSize("• " + r, 180);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 2;
  }
  y += 4;

  doc.setFontSize(12);
  doc.text("Label reading:", 14, y);
  y += 7;
  doc.setFontSize(10);
  const rows: [string, string][] = [
    ["Drug", label.drugName ?? "—"],
    ["Manufacturer", label.manufacturer ?? "—"],
    ["Batch", label.batchNumber ?? "—"],
    ["Expiry", label.expiryDate ?? "—"],
    ["Database", drug ? (drug.source === "local" ? "Local DB" : "openFDA") : "No match"],
    ["Confidence", `${Math.round(verdict.confidence * 100)}%`],
  ];
  for (const [k, v] of rows) {
    doc.text(`${k}: ${v}`, 14, y);
    y += 6;
  }
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(doc.splitTextToSize("Disclaimer: " + verdict.disclaimer, 180), 14, y);

  doc.save(`medilens-report-${Date.now()}.pdf`);
}
