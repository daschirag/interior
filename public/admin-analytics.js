const REFRESH_INTERVAL = 60000;
const API_BASE = "http://localhost:5000/api";
let currentFilter = "all";
let trafficChart;
let funnelChart;
let analyticsSummary = {};
let recentLeads = [];

function apiFetch(path, options) {
  const token = localStorage.getItem("token");
  const headers = Object.assign({}, options && options.headers);
  if (token) headers.Authorization = "Bearer " + token;
  return fetch(API_BASE + path, Object.assign({}, options, { headers: headers }));
}

function updateLastUpdated() {
  const element = document.getElementById("lastUpdated");

  if (!element) return;

  const now = new Date();

  const formatted = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  element.textContent = formatted.replace(",", " •");
}

async function loadAnalytics() {
  console.time("Analytics API");

  try {
    const response = await apiFetch(
      `/analytics/summary?period=${currentFilter}`,
    );

    console.timeLog("Analytics API", "Response received");

    const result = await response.json();
    analyticsSummary = result.data;

    console.timeLog("Analytics API", "JSON parsed");

    document.getElementById("pageViews").textContent = result.data.pageViews;
    document.getElementById("uniqueVisitors").textContent =
      result.data.uniqueVisitors;
    document.getElementById("formStarts").textContent = result.data.formStarts;
    document.getElementById("formSubmits").textContent =
      result.data.formSubmits;
    document.getElementById("totalLeads").textContent = result.data.totalLeads;
    document.getElementById("conversionRate").textContent =
      result.data.conversionRate + "%";
    // Create / Update Charts
    loadTrafficChart();
    renderFunnelChart(result.data);

    updateLastUpdated();

    console.timeEnd("Analytics API");
  } catch (error) {
    console.error(error);
  }
}
async function loadTrafficChart() {
  try {
    const response = await apiFetch(
      `/analytics/trends?period=${currentFilter}`,
    );

    const result = await response.json();

    if (!result.success) return;

    const labels = result.data.map((item) =>
      new Date(item.event_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
    );

    const pageViews = result.data.map((item) => Number(item.page_views));

    const formSubmits = result.data.map((item) => Number(item.form_submits));

    renderTrafficChart(labels, pageViews, formSubmits);
  } catch (error) {
    console.error("Traffic Chart Error:", error);
  }
}
async function loadRecentLeads() {
  try {
    const response = await apiFetch("/contact/recent-leads");

    if (!response.ok) {
      throw new Error("Failed to fetch recent leads");
    }

    const result = await response.json();
    recentLeads = result.data;

    const leadsBody = document.getElementById("leadsBody");

    leadsBody.innerHTML = "";

    // Empty State
    if (result.data.length === 0) {
      leadsBody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-state">
            <div class="empty-title">
              No enquiries yet
            </div>

            <div class="empty-subtitle">
              Customer enquiries will appear here once someone submits the contact form.
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Populate Leads
    result.data.forEach((lead) => {
      leadsBody.innerHTML += `
        <tr>
          <td style="padding:16px;border-top:1px solid var(--line)">
            ${lead.name}
          </td>

          <td style="padding:16px;border-top:1px solid var(--line)">
            ${lead.email}
          </td>

          <td style="padding:16px;border-top:1px solid var(--line)">
            ${lead.phone}
          </td>

          <td style="padding:16px;border-top:1px solid var(--line)">
            ${new Date(lead.created_at).toLocaleString()}
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Leads Error:", error);
  }
}
function renderTrafficChart(labels, pageViews, formSubmits) {
  if (trafficChart) trafficChart.destroy();

  trafficChart = new Chart(document.getElementById("trafficChart"), {
    type: "line",

    data: {
      labels: labels,

      datasets: [
        {
          label: "Page Views",
          data: pageViews,
          borderColor: "#52AAFF",
          backgroundColor: "rgba(82,170,255,.12)",
          fill: "origin",
          tension: 0.45,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "#52AAFF",
          pointBorderColor: "#52AAFF",
          borderWidth: 3,
        },

        {
          label: "Form Submits",
          data: formSubmits,
          borderColor: "#66C6A8",
          backgroundColor: "rgba(102,198,168,.10)",
          fill: "origin",
          tension: 0.45,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#66C6A8",
          pointBorderColor: "#66C6A8",
        
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: "easeOutQuart",
      },

      plugins: {
        legend: {
          labels: {
            color: "#DCE4F2",
            font: {
              size: 13,
              weight: "600",
            },
          },
        },

        tooltip: {
          backgroundColor: "#111827",
          titleColor: "#ffffff",
          bodyColor: "#DCE4F2",
          borderColor: "#52AAFF",
          borderWidth: 1,
          padding: 12,
        },
      },

      scales: {
        x: {
          ticks: {
            color: "#9EA9BD",
            maxTicksLimit: 7,
          },

          grid: {
            color: "rgba(255,255,255,.06)",
          },
        },

        y: {
          beginAtZero: true,
          ticks: {
            color: "#9EA9BD",
            precision: 0,
          },
          grid: {
            color: "rgba(255,255,255,.06)",
          },
        },
      },
    },
  });
}
function renderFunnelChart(data) {
  if (funnelChart) funnelChart.destroy();

  funnelChart = new Chart(document.getElementById("funnelChart"), {
    type: "bar",

    plugins: [ChartDataLabels],

    data: {
      labels: ["Views", "Starts", "Submits", "Leads"],

      datasets: [
        {
          data: [
            data.pageViews,
            data.formStarts,
            data.formSubmits,
            data.totalLeads,
          ],

          backgroundColor: ["#52AAFF", "#66C6A8", "#E9B44C", "#9B7EDE"],

          borderRadius: 8,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: "easeOutQuart",
      },

      plugins: {
        legend: {
          display: false,
        },

        datalabels: {
          color: "#ffffff",
          anchor: "end",
          align: "top",
          font: {
            size: 13,
            weight: "bold",
          },
          formatter: (value) => value,
        },
      },

      scales: {
        x: {
          ticks: {
            color: "#9EA9BD",
          },
          grid: {
            color: "rgba(255,255,255,.06)",
          },
        },

        y: {
          beginAtZero: true,
          ticks: {
            color: "#9EA9BD",
          },
          grid: {
            color: "rgba(255,255,255,.06)",
          },
        },
      },
    },
  });
}
function exportCSV() {
  const periodLabels = {
    today: "Today",
    7: "Last 7 Days",
    30: "Last 30 Days",
    all: "All Time",
  };

  const exportDate = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  let csv = "Vinayak Interiors Analytics Report\n\n";
  csv += `Report Period,${periodLabels[currentFilter]}\n`;
  csv += `Exported On,${exportDate}\n\n`;

  csv += "Metric,Value\n";
  csv += `Page Views,${analyticsSummary.pageViews}\n`;
  csv += `Unique Visitors,${analyticsSummary.uniqueVisitors}\n`;
  csv += `Form Starts,${analyticsSummary.formStarts}\n`;
  csv += `Form Submits,${analyticsSummary.formSubmits}\n`;
  csv += `Enquiries Received,${analyticsSummary.totalLeads}\n`;
  csv += `Conversion Rate,${analyticsSummary.conversionRate}%\n\n`;

  csv += "Recent Enquiries\n";
  csv += "Name,Email,Phone,Submitted\n";

  recentLeads.forEach((lead) => {
    csv += `"${lead.name}","${lead.email}",="\t${lead.phone}","${new Date(
      lead.created_at,
    ).toLocaleString()}"\n`;
  });

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `analytics-${currentFilter}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
async function exportPDF() {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();

  const LEFT = 15;
  const RIGHT = PAGE_WIDTH - 15;

  const COLORS = {
    primary: [28, 46, 74],
    accent: [52, 110, 200],
    text: [45, 45, 45],
    light: [240, 240, 240],
    border: [220, 220, 220],
    gray: [120, 120, 120],
  };

  const periodLabels = {
    today: "Today",
    7: "Last 7 Days",
    30: "Last 30 Days",
    all: "All Time",
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
    doc.rect(0, 0, PAGE_WIDTH, 38, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    doc.setTextColor(...COLORS.primary);

    doc.text("VINAYAK INTERIORS", PAGE_WIDTH / 2, 17, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.accent);

    doc.text("Website Analytics Report", PAGE_WIDTH / 2, 25, {
      align: "center",
    });

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.gray);

    

    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.5);

    doc.line(LEFT, 36, RIGHT, 36);
  }

  function drawFooter() {
    const pages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);

      doc.setDrawColor(...COLORS.border);

      doc.line(LEFT, PAGE_HEIGHT - 12, RIGHT, PAGE_HEIGHT - 12);

      doc.setFontSize(8);

      doc.setTextColor(...COLORS.gray);

      doc.text(
        "Generated by Vinayak Interiors Analytics Dashboard",
        LEFT,
        PAGE_HEIGHT - 6,
      );

      doc.text(`Page ${i} of ${pages}`, RIGHT, PAGE_HEIGHT - 6, {
        align: "right",
      });
    }
  }

  function section(title, y) {
    doc.setFont("helvetica", "bold");

    doc.setFontSize(15);

    doc.setTextColor(...COLORS.accent);

    doc.text(title, LEFT, y);

    doc.setDrawColor(...COLORS.border);

    
  }

  function addChart(chart, x, y, w, h) {
    const image = chart.canvas.toDataURL("image/png");

    doc.addImage(image, "PNG", x, y, w, h);
  }
  trafficChart.update("none");
  funnelChart.update("none");

  await new Promise((resolve) => requestAnimationFrame(resolve));
  drawHeader();

  let currentY = 46;
  // ======================================================
  // REPORT INFORMATION
  // ======================================================

  // ======================================================
  // REPORT INFORMATION CARD
  // ======================================================

  doc.setFillColor(248, 249, 252);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(LEFT, currentY - 2, 155, 30, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.primary);

  doc.text("REPORT INFORMATION", LEFT + 5, currentY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.text);

  doc.text("Reporting Period", LEFT + 5, currentY + 12);
  doc.text(":", LEFT + 45, currentY + 12);
  doc.text(periodLabels[currentFilter] || "All Time", LEFT + 50, currentY + 12);

  doc.text("Generated On", LEFT + 5, currentY + 19);
  doc.text(":", LEFT + 45, currentY + 19);
  doc.text(generatedOn, LEFT + 50, currentY + 19);

  doc.text("Prepared By", LEFT + 5, currentY + 26);
  doc.text(":", LEFT + 45, currentY + 26);
  doc.text("Vinayak Interiors Analytics Dashboard", LEFT + 50, currentY + 26);

  currentY += 38;
 currentY += 4;
  // ======================================================
  // KPI SUMMARY
  // ======================================================

  section("PERFORMANCE METRICS", currentY);

  currentY += 6;

  doc.autoTable({
    startY: currentY,

    margin: {
      left: 20,
      right: 20,
    },

    theme: "grid",

    tableWidth: "auto",

    head: [["Performance Metric", "Result"]],

    body: [
      ["Page Views", analyticsSummary.pageViews],

      ["Unique Visitors", analyticsSummary.uniqueVisitors],

      ["Form Starts", analyticsSummary.formStarts],

      ["Form Submits", analyticsSummary.formSubmits],

      ["Enquiries Received", analyticsSummary.totalLeads],

      ["Conversion Rate", analyticsSummary.conversionRate + "%"],
    ],

    styles: {
      fontSize: 10,

      cellPadding: 4,

      textColor: COLORS.text,

      lineColor: COLORS.border,

      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: COLORS.primary,

      textColor: [255, 255, 255],

      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 248, 252],
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 170,
      },

      1: {
        cellWidth: 70,
        halign: "center",
      },
    },
  });

 
  // ======================================================
  // PAGE 2 - WEBSITE TRAFFIC
  // ======================================================

  doc.addPage();
  drawHeader();

  currentY = 46;

  section("WEBSITE TRAFFIC", currentY);

  currentY += 8;

  addChart(trafficChart, LEFT, currentY, PAGE_WIDTH - LEFT * 2, 130);

  // Move below the chart
  currentY += 138;

  

  // ======================================================
  // PAGE 3 - CONVERSION FUNNEL
  // ======================================================

  doc.addPage();
  drawHeader();

  currentY = 46;

  section("CONVERSION FUNNEL", currentY);

  currentY += 8;

  addChart(funnelChart, LEFT, currentY, PAGE_WIDTH - LEFT * 2, 130);

  // Move below the chart
  currentY += 138;

  
  // ======================================================
  // PAGE 4 - RECENT ENQUIRIES
  // ======================================================

  doc.addPage();
  drawHeader();

  currentY = 46;

  section("RECENT CUSTOMER ENQUIRIES", currentY);

  currentY += 6;

  const leadsData =
    recentLeads.length > 0
      ? recentLeads.map((lead) => [
          lead.name,

          lead.email,

          lead.phone,

          new Date(lead.created_at).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        ])
      : [["No enquiries available", "", "", ""]];
  doc.autoTable({
    startY: currentY,

    margin: {
      left: LEFT,
      right: LEFT,
      bottom: 20,
    },

    head: [["Name", "Email", "Phone", "Submitted"]],

    body: leadsData,

    theme: "grid",

    styles: {
      fontSize: 10.5,

      cellPadding: 5,

      textColor: COLORS.text,

      lineColor: COLORS.border,

      lineWidth: 0.2,

      overflow: "linebreak",
    },

    headStyles: {
      fillColor: COLORS.primary,

      textColor: [255, 255, 255],

      fontStyle: "bold",
      
      fontSize: 11,
    },

    alternateRowStyles: {
      fillColor: [248, 249, 251],
    },

    columnStyles: {
      0: { cellWidth: 40 },

      1: { cellWidth: 85 },

      2: { cellWidth: 40 },

      3: { cellWidth: 65 },
    },
  });

  // =====================================
  // FOOTERS
  // =====================================

  drawFooter();

  // =====================================
  // SAVE PDF
  // =====================================

  doc.save(`analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
document.getElementById("dateFilter").addEventListener("change", (e) => {
  currentFilter = e.target.value;

  loadAnalytics();
  loadRecentLeads();
});
document.getElementById("exportCsvBtn").addEventListener("click", exportCSV);
document.getElementById("exportPdfBtn").addEventListener("click", exportPDF);
// Initial load
loadAnalytics();
loadRecentLeads();

// Auto refresh every 60 seconds
//setInterval(() => {
 // loadAnalytics();
 //loadRecentLeads();
//}, REFRESH_INTERVAL);
