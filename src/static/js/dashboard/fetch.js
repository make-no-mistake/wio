import { state, LOG_TYPES } from "./state.js";
import { byId, escapeHTML } from "./utils.js";
import { getFilterDropdownValues } from "./filters.js";
import { updateOverview } from "./overview.js";
import { updateTraffic } from "./traffic.js";
import { updateEventsTable } from "./logs.js";

export function fetchViewData() {
  if (state.currentPage === "overview") fetchOverviewData();
  else if (state.currentPage === "traffic") fetchTrafficData();
  else if (state.currentPage === "logs") fetchEventsData();
}

export async function fetchOverviewData() {
  try {
    const url = state.currentSiteId
      ? `/api/metrics/${state.currentSiteId}`
      : "/api/metrics/overview";
    const res = await fetch(url);
    const data = await res.json();
    updateOverview(data);
  } catch (e) {
    console.error("Failed to fetch overview data", e);
  }
}

export async function fetchTrafficData() {
  try {
    const siteId =
      state.currentSiteId === "overview" || !state.currentSiteId
        ? state.selectedSite?.val || state.sitesData[0]?.val
        : state.currentSiteId;
    if (!siteId) {
      updateTraffic({ trafficVolume: [], allPaths: [] });
      return;
    }
    const since = byId("trafficTimeRange")?.value || "24h";
    const res = await fetch(`/api/metrics/traffic/${siteId}?since=${since}`);
    const data = await res.json();
    updateTraffic(data, since);
  } catch (e) {
    console.error("Failed to fetch traffic data", e);
  }
}

export async function fetchEventsData(append = false) {
  try {
    const statusFilters = getFilterDropdownValues("logsFilterStatus");
    const needsErr = statusFilters.some((s) => ["4xx", "5xx"].includes(s));
    let types = LOG_TYPES.filter((t) => state.filterState[t]);
    if (needsErr && !types.includes("err")) types = [...types, "err"];
    const typeParam =
      types.length === LOG_TYPES.length ? "all" : types.join(",");
    const since = byId("logsFilterTime")?.value || "any";
    const res = await fetch(
      `/api/metrics/events/${state.currentSiteId}?page=${state.eventsCurrentPage}&type=${typeParam}&since=${since}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const events = data.events || [];
    if (append) state.logEvents = state.logEvents.concat(events);
    else state.logEvents = events;
    updateEventsTable(events, append);
    const loadWrap = byId("loadMoreLogsWrap");
    if (loadWrap)
      loadWrap.style.display = events.length >= 50 ? "block" : "none";
  } catch (e) {
    console.error("Failed to fetch events", e);
    const tbody = byId("logsBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="log-empty" style="color: var(--bad);">Error loading events. ${escapeHTML(e.message)}, try disabling your ad blocker.</td></tr>`;
    }
  }
}
