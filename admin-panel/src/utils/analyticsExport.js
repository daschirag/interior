import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PERIOD_LABELS } from "./chartSetup";

const FOOTER_H = 18;
const HEADER_H = 40;
const MARGIN = 15;

function captureChart(chartRef) {
  const chart = chartRef?.current;
  if (!chart?.canvas) return null;
  chart.update("none");
  return chart.toBase64Image("image/png", 1);
}

function addChartPage(doc, drawHeader, title, subtitle, imageData, pageWidth, pageHeight) {
  doc.addPage();
  drawHeader();
  let y = HEADER_H + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(28, 46, 74);
  doc.text(title, MARGIN, y);
  y += 7;

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(subtitle, MARGIN, y);
    y += 8;
  }

  if (!imageData) {
    doc.setFontSize(10);
    doc.text("No chart data available for this period.", MARGIN, y + 10);
    return;
  }

  const maxW = pageWidth - MARGIN * 2;
  const maxH = pageHeight - y - FOOTER_H - 8;
  doc.addImage(imageData, "PNG", MARGIN, y, maxW, maxH);
}

export function exportAnalyticsCSV(summary, leads, period) {
  const exportDate = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  let csv = "Vinayak Interiors Analytics Report\n\n";
  csv += `Report Period,${PERIOD_LABELS[period]}\n`;
  csv += `Exported On,${exportDate}\n\n`;
  csv += "Metric,Value\n";
  csv += `Page Views,${summary.pageViews}\n`;
  csv += `Unique Visitors,${summary.uniqueVisitors}\n`;
  csv += `Form Starts,${summary.formStarts}\n`;
  csv += `Form Submits,${summary.formSubmits}\n`;
  csv += `Enquiries Received,${summary.totalLeads}\n`;
  csv += `Conversion Rate,${summary.conversionRate}%\n\n`;
  csv += "Recent Enquiries\n";
  csv += "Name,Email,Phone,City,Space,Style,Submitted\n";

  leads.forEach((lead) => {
    csv += `"${lead.name}","${lead.email}",="\t${lead.phone}","${lead.city || ""}","${lead.space_type || ""}","${lead.style || ""}","${new Date(lead.created_at).toLocaleString()}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportAnalyticsPDF(
  summary,
  leads,
  period,
  chartRefs,
  meta = {},
) {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const right = pageWidth - MARGIN;

  const colors = {
    primary: [28, 46, 74],
    accent: [52, 110, 200],
    text: [45, 45, 45],
    border: [220, 220, 220],
    gray: [120, 120, 120],
  };

  const generatedOn = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  function drawHeader() {
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, HEADER_H, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...colors.primary);
    doc.text("VINAYAK INTERIORS", pageWidth / 2, 16, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...colors.accent);
    doc.text("Website Analytics Report", pageWidth / 2, 24, { align: "center" });
    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, HEADER_H - 2, right, HEADER_H - 2);
  }

  function drawFooter() {
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...colors.border);
      doc.line(MARGIN, pageHeight - FOOTER_H, right, pageHeight - FOOTER_H);
      doc.setFontSize(8);
      doc.setTextColor(...colors.gray);
      doc.text("Vinayak Interiors Admin Dashboard", MARGIN, pageHeight - 8);
      doc.text(`Page ${i} of ${pages}`, right, pageHeight - 8, { align: "right" });
    }
  }

  // Page 1 — summary
  drawHeader();
  let y = HEADER_H + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.primary);
  doc.text("REPORT SUMMARY", MARGIN, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...colors.text);
  doc.text(`Period: ${PERIOD_LABELS[period]}`, MARGIN, y);
  y += 5;
  doc.text(`Generated: ${generatedOn}`, MARGIN, y);
  if (meta.selectedRegionLabel) {
    y += 5;
    doc.text(`Region focus: ${meta.selectedRegionLabel}`, MARGIN, y);
  }
  y += 8;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "grid",
    head: [["Metric", "Value"]],
    body: [
      ["Page Views", summary.pageViews],
      ["Unique Visitors", summary.uniqueVisitors],
      ["Form Starts", summary.formStarts],
      ["Form Submits", summary.formSubmits],
      ["Enquiries Received", summary.totalLeads],
      ["Conversion Rate", `${summary.conversionRate}%`],
    ],
    headStyles: { fillColor: colors.primary, textColor: [255, 255, 255], fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Chart pages — one chart per page, full safe area
  const charts = [
    {
      ref: chartRefs.traffic,
      title: "WEBSITE TRAFFIC",
      subtitle: "Daily page views and form submissions",
    },
    {
      ref: chartRefs.funnel,
      title: "CONVERSION FUNNEL",
      subtitle: "Views → starts → submits → enquiries (same period)",
    },
    {
      ref: chartRefs.region,
      title: "KARNATAKA REGIONS",
      subtitle: "North · South · Coastal · Malnad — click regions in dashboard for districts",
    },
    {
      ref: chartRefs.pages,
      title: "MOST VISITED PAGES",
      subtitle: "Which pages customers view most",
    },
    {
      ref: chartRefs.device,
      title: "DEVICE SPLIT",
      subtitle: "Mobile vs desktop visitors",
    },
    {
      ref: chartRefs.peak,
      title: "PEAK VISIT HOURS",
      subtitle: "When customers browse the site",
    },
  ];

  for (const chart of charts) {
    addChartPage(
      doc,
      drawHeader,
      chart.title,
      chart.subtitle,
      captureChart(chart.ref),
      pageWidth,
      pageHeight,
    );
  }

  // Enquiries table
  doc.addPage();
  drawHeader();
  y = HEADER_H + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...colors.primary);
  doc.text("RECENT ENQUIRIES", MARGIN, y);

  autoTable(doc, {
    startY: y + 6,
    margin: { left: MARGIN, right: MARGIN },
    theme: "grid",
    head: [["Name", "Email", "Phone", "City", "Space", "Style", "Submitted"]],
    body: leads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone,
      lead.city || "—",
      lead.space_type || "—",
      lead.style || "—",
      new Date(lead.created_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]),
    headStyles: { fillColor: colors.primary, textColor: [255, 255, 255], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 40 },
      3: { cellWidth: 22 },
      6: { cellWidth: 26 },
    },
  });

  drawFooter();
  doc.save(`analytics-${period}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
