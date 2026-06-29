const REFRESH_INTERVAL = 60000;
let currentFilter = "all";
let trafficChart;
let funnelChart;
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
    const response = await fetch(
      `http://localhost:5000/api/analytics/summary?period=${currentFilter}`,
    );

    console.timeLog("Analytics API", "Response received");

    const result = await response.json();

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
    const response = await fetch(
      `http://localhost:5000/api/analytics/trends?period=${currentFilter}`,
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
    const response = await fetch(
      "http://localhost:5000/api/contact/recent-leads",
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recent leads");
    }

    const result = await response.json();

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
document.getElementById("dateFilter").addEventListener("change", (e) => {
  currentFilter = e.target.value;

  loadAnalytics();
  loadRecentLeads();
});
// Initial load
loadAnalytics();
loadRecentLeads();

// Auto refresh every 60 seconds
setInterval(() => {
  loadAnalytics();
  loadRecentLeads();
}, REFRESH_INTERVAL);
