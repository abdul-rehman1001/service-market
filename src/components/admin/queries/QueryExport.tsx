"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AdminQuery, QueryStatistics } from "@/app/admin/queries/page";

interface QueryExportProps {
  queries: AdminQuery[];
  statistics: QueryStatistics;
}

export default function QueryExport({ queries, statistics }: QueryExportProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const statusLabel = (s: string) =>
    s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase();

  const typeLabel = (t: string) =>
    t === "SERVICE_ISSUE"
      ? "Service Issue"
      : t.charAt(0) + t.slice(1).toLowerCase();

  /* ---------- CSV ---------- */
  const exportCSV = () => {
    setExporting("csv");
    try {
      const headers = [
        "Query #",
        "User",
        "Email",
        "Role",
        "Subject",
        "Type",
        "Status",
        "Booking ID",
        "Created",
        "Replied",
        "Resolved",
      ];

      const rows = queries.map((q) => [
        q.queryNumber,
        `${q.user.firstName} ${q.user.lastName}`,
        q.user.email,
        q.user.role,
        `"${q.subject.replace(/"/g, '""')}"`,
        typeLabel(q.queryType),
        statusLabel(q.status),
        q.bookingId || "",
        formatDate(q.createdAt),
        q.repliedAt ? formatDate(q.repliedAt) : "",
        q.resolvedAt ? formatDate(q.resolvedAt) : "",
      ]);

      const csvContent =
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `queries-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  /* ---------- PDF ---------- */
  const exportPDF = () => {
    setExporting("pdf");
    try {
      const doc = new jsPDF({ orientation: "landscape" });

      // Title
      doc.setFontSize(18);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text("Query & Complaint Report", 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

      // Statistics summary
      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text("Statistics Overview", 14, 35);

      autoTable(doc, {
        startY: 38,
        head: [["Total", "Open", "In Progress", "Resolved", "Closed", "Avg Response"]],
        body: [
          [
            statistics.total,
            statistics.open,
            statistics.inProgress,
            statistics.resolved,
            statistics.closed,
            statistics.avgResponseTimeHours > 0
              ? `${statistics.avgResponseTimeHours}h`
              : "N/A",
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 10 },
      });

      // Queries table
      const tableY =
        (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
          ?.finalY ?? 55;

      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text("Query Details", 14, tableY + 10);

      autoTable(doc, {
        startY: tableY + 14,
        head: [
          [
            "Query #",
            "User",
            "Email",
            "Subject",
            "Type",
            "Status",
            "Created",
          ],
        ],
        body: queries.map((q) => [
          q.queryNumber,
          `${q.user.firstName} ${q.user.lastName}`,
          q.user.email,
          q.subject.length > 40 ? q.subject.slice(0, 40) + "…" : q.subject,
          typeLabel(q.queryType),
          statusLabel(q.status),
          formatDate(q.createdAt),
        ]),
        theme: "striped",
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          3: { cellWidth: 60 },
        },
      });

      doc.save(
        `queries-report-${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportCSV}
        disabled={exporting !== null || queries.length === 0}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <FileSpreadsheet size={16} />
        {exporting === "csv" ? "Exporting…" : "CSV"}
      </button>
      <button
        onClick={exportPDF}
        disabled={exporting !== null || queries.length === 0}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <FileDown size={16} />
        {exporting === "pdf" ? "Exporting…" : "PDF"}
      </button>
    </div>
  );
}
