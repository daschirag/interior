async function loadAnalytics() {
  try {
    const response = await fetch("http://localhost:5000/api/analytics/summary");

    const result = await response.json();

    document.getElementById("pageViews").textContent = result.data.pageViews;

    document.getElementById("uniqueVisitors").textContent =
      result.data.uniqueVisitors;

    document.getElementById("formStarts").textContent = result.data.formStarts;

    document.getElementById("formSubmits").textContent =
      result.data.formSubmits;
  } catch (error) {
    console.error("Analytics Error:", error);
  }
}

async function loadRecentLeads() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/contact/recent-leads",
    );

    const result = await response.json();

    const leadsBody = document.getElementById("leadsBody");

    leadsBody.innerHTML = "";

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
        </tr>
      `;
    });
  } catch (error) {
    console.error("Leads Error:", error);
  }
}

loadAnalytics();
loadRecentLeads();

