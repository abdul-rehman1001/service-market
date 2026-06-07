"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AdminQuery, QueryStatistics } from "@/app/admin/queries/page";

interface QueryExportProps {
  queries: AdminQuery[];
  statistics: QueryStatistics;
}

const PDF_GREEN: [number, number, number] = [16, 185, 129];

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
    t === "SERVICE_ISSUE" ? "Service Issue" : t.charAt(0) + t.slice(1).toLowerCase();

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

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

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

  const exportPDF = () => {
    setExporting("pdf");
    try {
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(18);
      doc.setTextColor(...PDF_GREEN);
      doc.text("Query & Complaint Report", 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

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
        headStyles: { fillColor: PDF_GREEN },
        styles: { fontSize: 10 },
      });

      const tableY =
        (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 55;

      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text("Query Details", 14, tableY + 10);

      autoTable(doc, {
        startY: tableY + 14,
        head: [["Query #", "User", "Email", "Subject", "Type", "Status", "Created"]],
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
        headStyles: { fillColor: PDF_GREEN },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          3: { cellWidth: 60 },
        },
      });

      doc.save(`queries-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={exportCSV}
        disabled={exporting !== null || queries.length === 0}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#F5F7F8] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {exporting === "csv" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={16} className="text-[#059669]" />
        )}
        {exporting === "csv" ? "Exporting…" : "Export CSV"}
      </button>
      <button
        type="button"
        onClick={exportPDF}
        disabled={exporting !== null || queries.length === 0}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#10B981] px-3.5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all duration-200 hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {exporting === "pdf" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileDown size={16} />
        )}
        {exporting === "pdf" ? "Exporting…" : "Export PDF"}
      </button>
    </div>
  );
}
