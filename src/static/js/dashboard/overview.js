import { state, PILL_MAP } from "./state.js";
import {
  byId,
  toggleDisplay,
  formatNumber,
  formatRelativeTime,
  buildTimeSlots,
} from "./utils.js";

export function updateDeployCard() {
  const card = byId("deployCard");
  const titleEl = byId("deployCardTitle");
  const visitBtn = byId("deployVisitBtn");
  const urlEl = byId("deployUrl");
  const statusEl = byId("deployStatus");
  if (!card || !visitBtn || !urlEl) return;

  const site = state.selectedSite;
  if (!site?.url || !site?.id) {
    card.style.display = "none";
    return;
  }
  card.style.display = "block";
  if (titleEl) titleEl.textContent = site.name || site.label || "?";
  visitBtn.href = site.url;
  urlEl.href = site.url;
  urlEl.textContent = site.url;
  if (statusEl)
    statusEl.textContent = "Created " + formatRelativeTime(site.created_at);
}

export function updateDeploySystemStatus(data) {
  const el = byId("deploySystemStatus");
  if (!el) return;

  const totalRequests = Number(data.totalRequests) || 0;
  const errorCount = Number(data.errorCount) || 0;
  const avgResponse = Number(data.avgResponseTime) || 0;
  const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;

  let status = "unknown";
  let label = "Unknown";
  if (totalRequests === 0) {
    status = "stable";
    label = "Stable";
  } else if (errorRate > 0.1 || avgResponse > 1000) {
    status = "down";
    label = "Down";
  } else if (errorRate > 0.05 || avgResponse > 500) {
    status = "degraded";
    label = "Degraded";
  } else {
    status = "stable";
    label = "Stable";
  }
  el.className = "pill pill--" + (PILL_MAP[status] || "neu");
  el.textContent = label;
  el.setAttribute("aria-label", `System status: ${label}`);
}

export function updateOverview(data) {
  updateDeployCard();
  updateDeploySystemStatus(data);
  const trafficEl = byId("stat-traffic");
  const errorsEl = byId("stat-errors");
  const respEl = byId("stat-response");
  if (trafficEl) trafficEl.textContent = formatNumber(data.totalRequests);
  if (errorsEl) errorsEl.textContent = formatNumber(data.errorCount);
  if (respEl) respEl.textContent = (data.avgResponseTime || 0) + "ms";
  const respIndicator = byId("stat-response-indicator");
  if (respIndicator) {
    const ms = Number(data.avgResponseTime) || 0;
    respIndicator.className = "stat-indicator";
    if (ms === 0) {
      respIndicator.textContent = "";
      respIndicator.setAttribute("aria-hidden", "true");
    } else {
      const s = ms < 200 ? "good" : ms < 500 ? "fair" : "bad";
      const lbl = ms < 200 ? "Fast" : ms < 500 ? "Fair" : "Slow";
      respIndicator.classList.add(s);
      respIndicator.textContent = lbl;
      respIndicator.setAttribute("aria-hidden", "false");
    }
  }
  const { slots, labels, toKey } = buildTimeSlots("24h");
  if (state.overviewActivityChart) {
    const pvMap = new Map(
      (data.pageViews || []).map((r) => [toKey(r.hour), Number(r.count) || 0]),
    );
    state.overviewActivityChart.data.labels = labels;
    state.overviewActivityChart.data.datasets[0].data = slots.map(
      (h) => pvMap.get(toKey(h)) ?? 0,
    );
    state.overviewActivityChart.update();
  }
  if (state.overviewProblemsChart) {
    const errMap = new Map(
      (data.errorsOverTime || []).map((r) => [
        toKey(r.hour),
        Number(r.count) || 0,
      ]),
    );
    state.overviewProblemsChart.data.labels = labels;
    state.overviewProblemsChart.data.datasets[0].data = slots.map(
      (h) => errMap.get(toKey(h)) ?? 0,
    );
    state.overviewProblemsChart.update();
  }
  if (state.overviewRoutesChart) {
    const paths = (data.topPaths || []).slice(0, 10);
    const hasData = paths.length > 0;
    toggleDisplay("overviewRoutesChartWrap", hasData, "");
    toggleDisplay("overviewRoutesEmpty", !hasData, "flex");
    state.overviewRoutesChart.data.labels = paths.map((p) => {
      const path = p.path || "/";
      return path.slice(0, 35) + (path.length > 35 ? "…" : "");
    });
    state.overviewRoutesChart.data.datasets[0].data = paths.map(
      (p) => Number(p.total_hits) || 0,
    );
    state.overviewRoutesChart.update();
  }
}
