/* global Chart */
let viewsChart;
let eventsChart;
let trafficVolumeChart;
let statusCodesChart;

let currentSiteId = "overview";
let currentView = "view-overview";
let eventsCurrentPage = 1;
let eventsFilterType = "all";

function getTheme() {
  return localStorage.getItem("theme") || "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  updateChartColors();
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme attribute (no chart update yet)
  const initialTheme = getTheme();
  document.documentElement.setAttribute("data-theme", initialTheme);

  try {
    initCharts();
    // Now apply theme colors to initialized charts
    setTheme(initialTheme);
  } catch (err) {
    console.error(
      "Failed to initialize charts. Chart.js may be blocked or failed to load.",
      err,
    );
  }

  const siteSelect = document.getElementById("siteSelect");
  currentSiteId = siteSelect.value;

  // Initial load
  fetchViewData();

  // On change
  siteSelect.addEventListener("change", (e) => {
    currentSiteId = e.target.value;
    // reset events page
    eventsCurrentPage = 1;
    document.getElementById("logExplorerBody").innerHTML =
      '<tr><td colspan="5">Loading...</td></tr>';
    fetchViewData();
  });

  // Theme Toggle
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = getTheme();
      const newTheme = currentTheme === "light" ? "dark" : "light";
      setTheme(newTheme);
    });
  }

  // Navigation Logic
  const navItems = document.querySelectorAll("[data-target]");
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = item.getAttribute("data-target");
      switchTab(targetId);
    });
  });

  // Events filter
  const eventFilter = document.getElementById("eventFilterType");
  if (eventFilter) {
    eventFilter.addEventListener("change", (e) => {
      eventsFilterType = e.target.value;
      eventsCurrentPage = 1;
      document.getElementById("logExplorerBody").innerHTML =
        '<tr><td colspan="5">Loading...</td></tr>';
      fetchEventsData();
    });
  }

  // Load More Logs
  const loadMoreBtn = document.getElementById("loadMoreLogsBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      eventsCurrentPage++;
      fetchEventsData(true);
    });
  }

  // Logout logic
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Clear the session cookie and redirect
      document.cookie =
        "wio-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
    });
  }
});

function switchTab(targetId) {
  if (currentView === targetId) return;
  currentView = targetId;

  // Hide all view sections
  document.querySelectorAll(".view-section").forEach((section) => {
    section.classList.remove("active");
    section.classList.add("hidden");
  });

  // Remove active state from all nav items
  document.querySelectorAll("[data-target]").forEach((item) => {
    item.classList.remove("active");
  });

  // Show target section
  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.classList.remove("hidden");
    targetSection.classList.add("active");
  }

  // Add active state to corresponding nav items
  document.querySelectorAll(`[data-target="${targetId}"]`).forEach((item) => {
    item.classList.add("active");
  });

  fetchViewData();
}

async function fetchViewData() {
  if (currentView === "view-overview") {
    await fetchOverviewData();
  } else if (currentView === "view-traffic") {
    await fetchTrafficData();
  } else if (currentView === "view-events") {
    if (eventsCurrentPage === 1) {
      await fetchEventsData();
    }
  }
}

async function fetchOverviewData() {
  try {
    const url =
      currentSiteId === "overview"
        ? "/api/metrics/overview"
        : `/api/metrics/${currentSiteId}`;
    const response = await fetch(url);
    const data = await response.json();

    updateKPIs(data);
    updateOverviewTables(data);
    updateOverviewCharts(data);
  } catch (e) {
    console.error("Failed to fetch overview data", e);
  }
}

async function fetchTrafficData() {
  try {
    const url = `/api/metrics/traffic/${currentSiteId}`;
    const response = await fetch(url);
    const data = await response.json();

    updateTrafficTables(data);
    updateTrafficCharts(data);
  } catch (e) {
    console.error("Failed to fetch traffic data", e);
  }
}

async function fetchEventsData(append = false) {
  try {
    const url = `/api/metrics/events/${currentSiteId}?page=${eventsCurrentPage}&type=${eventsFilterType}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    updateEventsTable(data, append);
  } catch (e) {
    console.error("Failed to fetch events data", e);
    const logExplorerBody = document.getElementById("logExplorerBody");
    if (logExplorerBody) {
      let errorMsg = e.message;
      if (
        errorMsg.includes("NetworkError") ||
        errorMsg.includes("Failed to fetch")
      ) {
        errorMsg +=
          " (This is usually caused by an Ad Blocker blocking analytics traffic. Please disable it for this site.)";
      }
      logExplorerBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error loading events: ${escapeHTML(errorMsg)}</td></tr>`;
    }
  }
}

function formatNumber(num) {
  if (num === undefined || num === null) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

function updateKPIs(data) {
  const kpiValues = document.querySelectorAll(".kpi-value");
  const kpiSubs = document.querySelectorAll(".kpi-sub");
  if (kpiValues.length >= 3) {
    kpiValues[0].textContent = formatNumber(data.totalEvents);
    kpiValues[1].textContent = formatNumber(data.activeConnections);
    kpiValues[2].textContent = (data.avgResponseTime || 0) + "ms";

    if (data.totalEventsTrend) {
      kpiSubs[0].textContent = data.totalEventsTrend + " vs 24h";
      kpiSubs[0].className =
        "kpi-sub " +
        (data.totalEventsTrend.startsWith("-")
          ? "kpi-negative"
          : "kpi-positive");
    } else {
      kpiSubs[0].textContent = "Not enough data";
      kpiSubs[0].className = "kpi-sub kpi-muted";
    }

    if (data.activeConnectionsTrend) {
      kpiSubs[1].textContent = data.activeConnectionsTrend + " vs hour";
      kpiSubs[1].className =
        "kpi-sub " +
        (data.activeConnectionsTrend.startsWith("-")
          ? "kpi-negative"
          : "kpi-positive");
    } else {
      kpiSubs[1].textContent = "Not enough data";
      kpiSubs[1].className = "kpi-sub kpi-muted";
    }

    if (data.avgResponseTimeTrend) {
      kpiSubs[2].textContent = data.avgResponseTimeTrend + " vs hour";
      kpiSubs[2].className =
        "kpi-sub " +
        (data.avgResponseTimeTrend.startsWith("-")
          ? "kpi-positive"
          : "kpi-negative");
    } else {
      kpiSubs[2].textContent = "Not enough data";
      kpiSubs[2].className = "kpi-sub kpi-muted";
    }
  }
}

function escapeHTML(str) {
  if (!str) return "";
  return str
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderEventRow(row) {
  const date = new Date(row.time).toLocaleString();

  let contentObj = row.content;
  if (typeof contentObj === "string") {
    try {
      contentObj = JSON.parse(contentObj);
    } catch {
      contentObj = {};
    }
  }

  let eventType =
    row.msg === "incoming request" || row.msg === "request completed"
      ? "API_REQUEST"
      : row.msg;
  if (contentObj && contentObj.event) eventType = contentObj.event;
  if (!eventType) eventType = "UNKNOWN";

  let resource = "-";
  if (contentObj && contentObj.req && contentObj.req.url) {
    resource = contentObj.req.url;
  } else if (contentObj && contentObj.wsEvent) {
    resource = "ws: " + contentObj.wsEvent;
  } else if (
    eventType === "ai_prompt" &&
    contentObj &&
    contentObj.promptLength !== undefined
  ) {
    resource = `prompt: ${contentObj.promptLength} chars`;
  }

  let status = "-";
  let statusClass = "";
  if (contentObj && contentObj.res && contentObj.res.statusCode) {
    const code = contentObj.res.statusCode;
    status = `${code}`;
    statusClass = code < 400 ? "success" : "error";
  } else if (contentObj && contentObj.error) {
    status = "ERROR";
    statusClass = "error";
  } else if (eventType === "ai_prompt") {
    status = contentObj.success ? "OK" : "ERROR";
    statusClass = contentObj.success ? "success" : "error";
  } else if (eventType.startsWith("ws_") || eventType === "platform_restart") {
    status = "OK";
    statusClass = "success";
  }

  let duration =
    contentObj && contentObj.responseTime
      ? `${Math.round(contentObj.responseTime)}ms`
      : "-";
  let safeResource = resource ? resource.toString() : "-";

  return `
    <tr>
        <td>${escapeHTML(date)}</td>
        <td>${escapeHTML(eventType)}</td>
        <td title="${escapeHTML(safeResource)}">${escapeHTML(safeResource).substring(0, 40)}${safeResource.length > 40 ? "..." : ""}</td>
        <td><span class="status-badge ${statusClass}">${escapeHTML(status)}</span></td>
        <td>${escapeHTML(duration)}</td>
    </tr>
    `;
}

function updateOverviewTables(data) {
  const topPathsBody = document.getElementById("topPathsBody");
  const recentEventsBody = document.getElementById("recentEventsBody");

  if (data.topPaths && data.topPaths.length > 0) {
    topPathsBody.innerHTML = data.topPaths
      .map(
        (row) => `
            <tr>
                <td title="${escapeHTML(row.path)}">${escapeHTML(row.path || "/").substring(0, 30)}${row.path?.length > 30 ? "..." : ""}</td>
                <td>${formatNumber(row.total_hits)}</td>
                <td>${Math.round(row.avg_response || 0)}</td>
                <td>-</td>
            </tr>
        `,
      )
      .join("");
  } else {
    topPathsBody.innerHTML = '<tr><td colspan="4">No data available</td></tr>';
  }

  if (data.recentEvents && data.recentEvents.length > 0) {
    recentEventsBody.innerHTML = data.recentEvents
      .slice(0, 10)
      .map(renderEventRow)
      .join("");
  } else {
    recentEventsBody.innerHTML =
      '<tr><td colspan="5">No data available</td></tr>';
  }
}

function updateTrafficTables(data) {
  const allPathsBody = document.getElementById("allPathsBody");

  if (data.allPaths && data.allPaths.length > 0) {
    allPathsBody.innerHTML = data.allPaths
      .map(
        (row) => `
            <tr>
                <td title="${escapeHTML(row.path)}">${escapeHTML(row.path || "/")}</td>
                <td>${formatNumber(row.total_hits)}</td>
                <td>${Math.round(row.avg_response || 0)}</td>
                <td>${Math.round(row.max_response || 0)}</td>
            </tr>
        `,
      )
      .join("");
  } else {
    allPathsBody.innerHTML = '<tr><td colspan="4">No data available</td></tr>';
  }
}

function updateEventsTable(data, append) {
  const logExplorerBody = document.getElementById("logExplorerBody");
  const loadMoreBtn = document.getElementById("loadMoreLogsBtn");

  let html = "";
  if (data.events && data.events.length > 0) {
    html = data.events.map(renderEventRow).join("");
    if (data.events.length < 50) {
      if (loadMoreBtn) loadMoreBtn.style.display = "none";
    } else {
      if (loadMoreBtn) loadMoreBtn.style.display = "inline-block";
    }
  } else {
    if (!append) html = '<tr><td colspan="5">No data available</td></tr>';
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
  }

  if (append) {
    logExplorerBody.insertAdjacentHTML("beforeend", html);
  } else {
    logExplorerBody.innerHTML =
      html || '<tr><td colspan="5">No data available</td></tr>';
  }
}

function updateOverviewCharts(data) {
  if (!viewsChart || !eventsChart) return;

  if (data.pageViews && data.pageViews.length > 0) {
    const pvData = [...data.pageViews].reverse();
    viewsChart.data.labels = pvData.map((r) =>
      new Date(r.hour).toLocaleTimeString([], { hour: "2-digit" }),
    );
    viewsChart.data.datasets[0].data = pvData.map((r) => r.count);
  } else {
    viewsChart.data.labels = [];
    viewsChart.data.datasets[0].data = [];
  }
  viewsChart.update();

  if (data.eventCounts && data.eventCounts.length > 0) {
    const evData = [...data.eventCounts].reverse();
    eventsChart.data.labels = evData.map((r) =>
      new Date(r.day).toLocaleDateString([], { weekday: "short" }),
    );
    eventsChart.data.datasets[0].data = evData.map((r) => r.count);
  } else {
    eventsChart.data.labels = [];
    eventsChart.data.datasets[0].data = [];
  }
  eventsChart.update();
}

function updateTrafficCharts(data) {
  if (!trafficVolumeChart || !statusCodesChart) return;

  if (data.trafficVolume && data.trafficVolume.length > 0) {
    const tvData = [...data.trafficVolume].reverse();
    trafficVolumeChart.data.labels = tvData.map((r) =>
      new Date(r.hour).toLocaleTimeString([], { hour: "2-digit" }),
    );
    trafficVolumeChart.data.datasets[0].data = tvData.map((r) => r.count);
  } else {
    trafficVolumeChart.data.labels = [];
    trafficVolumeChart.data.datasets[0].data = [];
  }
  trafficVolumeChart.update();

  if (data.statusCodes && data.statusCodes.length > 0) {
    const labels = data.statusCodes.map((r) => r.status_code);
    const counts = data.statusCodes.map((r) => r.count);
    const colors = labels.map((code) => {
      const c = parseInt(code);
      if (c >= 200 && c < 300) return "#188038"; // Success green
      if (c >= 300 && c < 400) return "#fbbc04"; // Redirect yellow/orange
      if (c >= 400 && c < 500) return "#ea4335"; // Client error red
      return "#d93025"; // Server error dark red
    });

    statusCodesChart.data.labels = labels;
    statusCodesChart.data.datasets[0].data = counts;
    statusCodesChart.data.datasets[0].backgroundColor = colors;
  } else {
    statusCodesChart.data.labels = [];
    statusCodesChart.data.datasets[0].data = [];
  }
  statusCodesChart.update();
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function updateChartColors() {
  const textColor = getCssVar("--text-sec") || "#5f6368";
  const gridColor = getCssVar("--chart-grid") || "#f1f3f4";
  const surfaceColor = getCssVar("--surface") || "#ffffff";
  const bodyColor = getCssVar("--text-main") || "#202124";
  const borderColor = getCssVar("--border") || "#dadce0";
  const primaryColor = getCssVar("--primary") || "#1a73e8";

  const charts = [viewsChart, eventsChart, trafficVolumeChart];

  charts.forEach((chart) => {
    if (!chart) return;

    // Update scales
    if (chart.options.scales.x) {
      chart.options.scales.x.ticks.color = textColor;
      if (chart.options.scales.x.grid)
        chart.options.scales.x.grid.color = gridColor;
    }
    if (chart.options.scales.y) {
      chart.options.scales.y.ticks.color = textColor;
      if (chart.options.scales.y.grid)
        chart.options.scales.y.grid.color = gridColor;
    }

    // Update tooltip colors
    if (chart.options.plugins && chart.options.plugins.tooltip) {
      chart.options.plugins.tooltip.backgroundColor = surfaceColor;
      chart.options.plugins.tooltip.titleColor = textColor;
      chart.options.plugins.tooltip.bodyColor = bodyColor;
      chart.options.plugins.tooltip.borderColor = borderColor;
    }

    // Update dataset colors if they are line/bar charts (not doughnut)
    if (chart.data && chart.data.datasets) {
      chart.data.datasets.forEach((dataset) => {
        if (chart.config.type === "line") {
          dataset.borderColor = primaryColor;
        } else if (chart.config.type === "bar") {
          dataset.backgroundColor = primaryColor;
        }
      });
    }

    chart.update();
  });

  if (statusCodesChart) {
    statusCodesChart.options.plugins.legend.labels.color = textColor;
    statusCodesChart.update();
  }
}

function initCharts() {
  const gradientLine = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, "rgba(26, 115, 232, 0.4)");
    gradient.addColorStop(1, "rgba(26, 115, 232, 0.0)");
    return gradient;
  };

  const commonLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#5f6368",
        bodyColor: "#202124",
        borderColor: "#dadce0",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#5f6368" },
      },
      y: {
        grid: { color: "#f1f3f4" },
        ticks: {
          color: "#5f6368",
          callback: function (value) {
            return value >= 1000 ? value / 1000 + "k" : value;
          },
        },
      },
    },
  };

  // Overview: Page Views
  const ctxViews = document.getElementById("pageViewsChart").getContext("2d");
  viewsChart = new Chart(ctxViews, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Page Views",
          data: [],
          borderColor: "#1a73e8",
          backgroundColor: gradientLine(ctxViews),
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
      ],
    },
    options: commonLineOptions,
  });

  // Overview: Event Counts
  const ctxEvents = document.getElementById("eventsChart").getContext("2d");
  eventsChart = new Chart(ctxEvents, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Events",
          data: [],
          backgroundColor: "#1a73e8",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#5f6368" },
        },
        y: {
          grid: { color: "#f1f3f4" },
          ticks: { color: "#5f6368" },
        },
      },
    },
  });

  // Traffic: Traffic Volume
  const ctxTraffic = document.getElementById("trafficVolumeChart");
  if (ctxTraffic) {
    trafficVolumeChart = new Chart(ctxTraffic.getContext("2d"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Traffic",
            data: [],
            borderColor: "#1a73e8",
            backgroundColor: gradientLine(ctxTraffic.getContext("2d")),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
        ],
      },
      options: commonLineOptions,
    });
  }

  // Traffic: Status Codes Doughnut
  const ctxStatus = document.getElementById("statusCodesChart");
  if (ctxStatus) {
    statusCodesChart = new Chart(ctxStatus.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "right",
            labels: { boxWidth: 12, usePointStyle: true },
          },
        },
      },
    });
  }
}
