"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import type { AnalyticsData } from "@/app/admin/page";

interface ExportButtonsProps {
  data: AnalyticsData;
}

export default function ExportButtons({ data }: ExportButtonsProps) {
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // ── CSV Export ─────────────────────────────────────────────────
  const handleCSVExport = async () => {
    setExportingCSV(true);
    try {
      const sections: string[] = [];

      // Stats section
      sections.push("=== PLATFORM STATS ===");
      sections.push("Metric,Value");
      sections.push(`Total Users,${data.stats.totalUsers}`);
      sections.push(`Service Providers,${data.stats.totalProviders}`);
      sections.push(`Total Bookings,${data.stats.totalBookings}`);
      sections.push(`Active Bookings,${data.stats.activeBookings}`);
      sections.push(`This Month Bookings,${data.stats.thisMonthBookings}`);
      sections.push(`Categories,${data.stats.totalCategories}`);
      sections.push(`Total Reviews,${data.stats.totalReviews}`);
      sections.push("");

      // Booking Trends
      sections.push("=== BOOKING TRENDS ===");
      sections.push("Date,Total,Completed,Cancelled");
      for (const t of data.bookingTrends) {
        sections.push(`${t.date},${t.total},${t.completed},${t.cancelled}`);
      }
      sections.push("");

      // User Growth
      sections.push("=== USER GROWTH ===");
      sections.push("Month,Seekers,Providers,Total");
      for (const g of data.userGrowth) {
        sections.push(`${g.month},${g.seekers},${g.providers},${g.total}`);
      }
      sections.push("");

      // Popular Categories
      sections.push("=== POPULAR CATEGORIES ===");
      sections.push("Rank,Category,Bookings");
      data.popularCategories.forEach((cat, i) => {
        sections.push(`${i + 1},${cat.name},${cat.bookings}`);
      });
      sections.push("");

      // Status Distribution
      sections.push("=== BOOKING STATUS DISTRIBUTION ===");
      sections.push("Status,Count");
      for (const s of data.statusDistribution) {
        sections.push(`${s.status},${s.count}`);
      }

      const csv = sections.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-report-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
    } finally {
      setExportingCSV(false);
    }
  };

  // ── PDF Export ─────────────────────────────────────────────────
  const handlePDFExport = async () => {
    setExportingPDF(true);
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      const autoTableModule = await import("jspdf-autotable");

      const doc = new jsPDF();
      const autoTable = autoTableModule.default;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129); // emerald
      doc.text("Platform Analytics Report", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

      // Stats Table
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text("Platform Overview", 14, 42);

      autoTable(doc, {
        startY: 46,
        head: [["Metric", "Value"]],
        body: [
          ["Total Users", data.stats.totalUsers.toLocaleString()],
          ["Service Providers", data.stats.totalProviders.toLocaleString()],
          ["Total Bookings", data.stats.totalBookings.toLocaleString()],
          ["Active Bookings", data.stats.activeBookings.toLocaleString()],
          ["This Month Bookings", data.stats.thisMonthBookings.toLocaleString()],
          ["Categories", data.stats.totalCategories.toLocaleString()],
          ["Total Reviews", data.stats.totalReviews.toLocaleString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 },
      });

      // Popular Categories Table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let currentY = (doc as any).lastAutoTable?.finalY || 100;
      currentY += 12;

      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text("Popular Categories", 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Rank", "Category", "Bookings"]],
        body: data.popularCategories.map((cat, i) => [
          `#${i + 1}`,
          cat.name,
          cat.bookings.toLocaleString(),
        ]),
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 },
      });

      // Status Distribution Table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (doc as any).lastAutoTable?.finalY || 160;
      currentY += 12;

      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text("Booking Status Distribution", 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Status", "Count"]],
        body: data.statusDistribution.map((s) => [
          s.status.replace(/_/g, " "),
          s.count.toLocaleString(),
        ]),
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 },
      });

      // Booking Trends Table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (doc as any).lastAutoTable?.finalY || 200;
      currentY += 12;

      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text("Booking Trends", 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Date", "Total", "Completed", "Cancelled"]],
        body: data.bookingTrends.map((t) => [
          t.date,
          t.total.toString(),
          t.completed.toString(),
          t.cancelled.toString(),
        ]),
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 },
      });

      // User Growth Table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentY = (doc as any).lastAutoTable?.finalY || 200;
      currentY += 12;

      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text("User Growth", 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        head: [["Month", "Seekers", "Providers", "Total"]],
        body: data.userGrowth.map((g) => [
          g.month,
          g.seekers.toString(),
          g.providers.toString(),
          g.total.toString(),
        ]),
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 },
      });

      doc.save(`analytics-report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-lg mb-4">Export Reports</h3>
      <p className="text-sm text-slate-500 mb-4">
        Download analytics data as CSV or a formatted PDF report.
      </p>
      <div className="flex gap-4">
        <button
          onClick={handleCSVExport}
          disabled={exportingCSV}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {exportingCSV ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Export CSV
        </button>
        <button
          onClick={handlePDFExport}
          disabled={exportingPDF}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {exportingPDF ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
          Export PDF
        </button>
      </div>
    </div>
  );
}
