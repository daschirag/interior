import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PERIOD_LABELS } from "./chartSetup";

const MARGIN = 14;
const FOOTER_H = 14;
const HEADER_H = 36;

const COLORS = {
  primary: [28, 46, 74],
  accent: [52, 110, 200],
  text: [45, 45, 45],
  muted: [100, 116, 139],
  border: [226, 232, 240],
  cardBg: [248, 250, 252],
  white: [255, 255, 255],
};

const PRINT_TICK = "#475569";
const PRINT_GRID = "#e2e8f0";
const PRINT_LEGEND = "#1c2e4a";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadImageSize(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function fitBox(imgW, imgH, maxW, maxH) {
  const scale = Math.min(maxW / imgW, maxH / imgH, 1);
  return { width: imgW * scale, height: imgH * scale };
}

/** Temporarily switch chart to print-friendly colours, capture on white, restore. */
function captureChartForPrint(chartRef) {
  const chart = chartRef?.current;
  if (!chart?.canvas) return null;

  const opts = chart.options;
  const saved = {
    legend: opts?.plugins?.legend?.labels?.color,
    xTicks: opts?.scales?.x?.ticks?.color,
    xGrid: opts?.scales?.x?.grid?.color,
    yTicks: opts?.scales?.y?.ticks?.color,
    yGrid: opts?.scales?.y?.grid?.color,
  };

  if (opts?.plugins?.legend?.labels) {
    opts.plugins.legend.labels.color = PRINT_LEGEND;
  }
  ["x", "y"].forEach((axis) => {
    const scale = opts?.scales?.[axis];
    if (!scale) return;
    if (scale.ticks) scale.ticks.color = PRINT_TICK;
    if (scale.grid) scale.grid.color = PRINT_GRID;
  });

  chart.update("none");

  const source = chart.canvas;
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = source.width;
  exportCanvas.height = source.height;
  const ctx = exportCanvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  ctx.drawImage(source, 0, 0);

  if (opts?.plugins?.legend?.labels && saved.legend != null) {
    opts.plugins.legend.labels.color = saved.legend;
  }
  ["x", "y"].forEach((axis) => {
    const scale = opts?.scales?.[axis];
    if (!scale) return;
    if (scale.ticks && saved[`${axis}Ticks`] != null) {
      scale.ticks.color = saved[`${axis}Ticks`];
    }
    if (scale.grid && saved[`${axis}Grid`] != null) {
      scale.grid.color = saved[`${axis}Grid`];
    }
  });
  chart.update("none");

  return exportCanvas.toDataURL("image/png");
}

function drawPageHeader(doc, pageWidth, subtitle) {
  doc.setFillColor(...COLORS.cardBg);
  doc.rect(0, 0, pageWidth, HEADER_H, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primary);
  doc.text("Vinayak Interiors", MARGIN, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.accent);
  doc.text(subtitle || "Website Analytics Report", MARGIN, 21);
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, HEADER_H - 3, pageWidth - MARGIN, HEADER_H - 3);
}

function drawPageFooter(doc, pageWidth, pageHeight, pageNum, totalPages) {
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, pageHeight - FOOTER_H, pageWidth - MARGIN, pageHeight - FOOTER_H);
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("Vinayak Interiors · Admin Analytics", MARGIN, pageHeight - 6);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - MARGIN, pageHeight - 6, {
    align: "right",
  });
}

function drawMetricCards(doc, summary, x, y, contentWidth) {
  const cards = [
    { label: "Page Views", value: summary.pageViews },
    { label: "Unique Visitors", value: summary.uniqueVisitors },
    { label: "Form Starts", value: summary.formStarts },
    { label: "Form Submits", value: summary.formSubmits },
    { label: "Enquiries", value: summary.totalLeads },
    { label: "Conversion", value: `${summary.conversionRate}%` },
  ];

  const cols = 3;
  const gap = 4;
  const cardW = (contentWidth - gap * (cols - 1)) / cols;
  const cardH = 22;

  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = x + col * (cardW + gap);
    const cy = y + row * (cardH + gap);

    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(cx, cy, cardW, cardH, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(card.label, cx + 4, cy + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.primary);
    doc.text(String(card.value), cx + 4, cy + 17);
  });

  return y + Math.ceil(cards.length / cols) * (cardH + gap) + 6;
}

async function addChartPage(doc, opts) {
  const { title, subtitle, imageData, orientation, drawHeader } = opts;

  doc.addPage("a4", orientation);
  drawHeader();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = HEADER_H + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text(title, MARGIN, y);
  y += 6;

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    const lines = doc.splitTextToSize(subtitle, pageWidth - MARGIN * 2);
    doc.text(lines, MARGIN, y);
    y += lines.length * 4 + 4;
  }

  const maxW = pageWidth - MARGIN * 2;
  const maxH = pageHeight - y - FOOTER_H - 6;

  if (!imageData) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.muted);
    doc.text("No chart data for this period.", MARGIN, y + 8);
    return;
  }

  const { width: imgW, height: imgH } = await loadImageSize(imageData);
  const fitted = fitBox(imgW, imgH, maxW, maxH);
  const imgX = MARGIN + (maxW - fitted.width) / 2;
  const imgY = y + (maxH - fitted.height) / 2;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(imgX - 2, imgY - 2, fitted.width + 4, fitted.height + 4, 2, 2, "S");
  doc.addImage(imageData, "PNG", imgX, imgY, fitted.width, fitted.height);
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
  await sleep(120);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let pageWidth = doc.internal.pageSize.getWidth();
  let pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;

  const generatedOn = new Date().toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const reportSubtitle = `Website Analytics · ${PERIOD_LABELS[period]}`;

  function headerPortrait() {
    pageWidth = doc.internal.pageSize.getWidth();
    pageHeight = doc.internal.pageSize.getHeight();
    drawPageHeader(doc, pageWidth, reportSubtitle);
  }

  function headerLandscape() {
    pageWidth = doc.internal.pageSize.getWidth();
    pageHeight = doc.internal.pageSize.getHeight();
    drawPageHeader(doc, pageWidth, reportSubtitle);
  }

  // —— Page 1: Executive summary ——
  headerPortrait();
  let y = HEADER_H + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.primary);
  doc.text("Executive Summary", MARGIN, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.text);
  doc.text(`Report period: ${PERIOD_LABELS[period]}`, MARGIN, y);
  y += 5;
  doc.text(`Generated: ${generatedOn}`, MARGIN, y);
  if (meta.selectedRegionLabel) {
    y += 5;
    doc.text(`Region focus: ${meta.selectedRegionLabel}`, MARGIN, y);
  }
  y += 10;

  y = drawMetricCards(doc, summary, MARGIN, y, contentWidth);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "striped",
    head: [["Metric", "Value", "Notes"]],
    body: [
      ["Page Views", String(summary.pageViews), "Total page loads on the public site"],
      ["Unique Visitors", String(summary.uniqueVisitors), "Distinct visitor sessions"],
      ["Form Starts", String(summary.formStarts), "Contact form opened"],
      ["Form Submits", String(summary.formSubmits), "Form completed and sent"],
      ["Enquiries Received", String(summary.totalLeads), "Stored in admin CRM"],
      ["Conversion Rate", `${summary.conversionRate}%`, "Enquiries ÷ page views"],
    ],
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontSize: 9,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      textColor: COLORS.text,
      lineColor: COLORS.border,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold" },
      1: { cellWidth: 22, halign: "right" },
      2: { cellWidth: "auto", textColor: COLORS.muted },
    },
    alternateRowStyles: { fillColor: COLORS.cardBg },
  });

  const charts = [
    {
      ref: chartRefs.traffic,
      title: "Website Traffic",
      subtitle: "Daily page views and form submissions over the selected period.",
    },
    {
      ref: chartRefs.funnel,
      title: "Conversion Funnel",
      subtitle: "How visitors move from page views to enquiries.",
    },
    {
      ref: chartRefs.region,
      title: "Karnataka Regions",
      subtitle: "Visitor and enquiry activity by region (North, South, Coastal, Malnad).",
    },
    {
      ref: chartRefs.pages,
      title: "Most Visited Pages",
      subtitle: "Which pages on the site receive the most traffic.",
    },
    {
      ref: chartRefs.device,
      title: "Device Split",
      subtitle: "Mobile vs desktop vs tablet visitors.",
    },
    {
      ref: chartRefs.peak,
      title: "Peak Visit Hours",
      subtitle: "When visitors browse the site during the day.",
    },
  ];

  const chartImages = charts.map((c) => ({
    ...c,
    imageData: captureChartForPrint(c.ref),
  }));

  for (const chart of chartImages) {
    await addChartPage(doc, {
      title: chart.title,
      subtitle: chart.subtitle,
      imageData: chart.imageData,
      orientation: "landscape",
      drawHeader: headerLandscape,
    });
  }

  // —— Enquiries (portrait, readable table) ——
  doc.addPage("a4", "portrait");
  headerPortrait();
  pageWidth = doc.internal.pageSize.getWidth();

  y = HEADER_H + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.primary);
  doc.text("Recent Enquiries", MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `${leads.length} contact form submission${leads.length === 1 ? "" : "s"} · newest first`,
    MARGIN,
    y,
  );

  const enquiryRows =
    leads.length === 0
      ? [["—", "—", "—", "—", "No enquiries in this period"]]
      : leads.map((lead) => [
          lead.name || "—",
          [lead.email, lead.phone].filter(Boolean).join("\n") || "—",
          [lead.city, lead.space_type].filter(Boolean).join(" · ") || "—",
          lead.style || "—",
          new Date(lead.created_at).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        ]);

  autoTable(doc, {
    startY: y + 4,
    margin: { left: MARGIN, right: MARGIN },
    theme: "striped",
    head: [["Name", "Contact", "City · Space", "Style", "Submitted"]],
    body: enquiryRows,
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontSize: 9,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: { top: 3.5, right: 3, bottom: 3.5, left: 3 },
      overflow: "linebreak",
      cellWidth: "wrap",
      textColor: COLORS.text,
      lineColor: COLORS.border,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: "bold" },
      1: { cellWidth: 48 },
      2: { cellWidth: 38 },
      3: { cellWidth: 28 },
      4: { cellWidth: 30 },
    },
    alternateRowStyles: { fillColor: COLORS.cardBg },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        headerPortrait();
      }
    },
  });

  if (leads.some((l) => l.message)) {
    const finalY = (doc.lastAutoTable?.finalY || y) + 10;
    if (finalY < pageHeight - 40) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.primary);
      doc.text("Customer messages", MARGIN, finalY);
      let msgY = finalY + 6;
      leads.slice(0, 8).forEach((lead) => {
        if (!lead.message) return;
        if (msgY > pageHeight - FOOTER_H - 20) return;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...COLORS.text);
        doc.text(`${lead.name}:`, MARGIN, msgY);
        msgY += 4;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.muted);
        const lines = doc.splitTextToSize(lead.message, contentWidth);
        doc.text(lines.slice(0, 3), MARGIN, msgY);
        msgY += lines.slice(0, 3).length * 4 + 6;
      });
    }
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    pageWidth = doc.internal.pageSize.getWidth();
    pageHeight = doc.internal.pageSize.getHeight();
    drawPageFooter(doc, pageWidth, pageHeight, i, totalPages);
  }

  doc.save(`vinayak-analytics-${period}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
