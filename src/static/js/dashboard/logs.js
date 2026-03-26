import {
  state,
  LOG_FILTER_LABELS,
  STATUS_FILTERS,
  DURATION_FILTERS,
} from "./state.js";
import { byId, escapeHTML, parseContent, updateSortHeaders } from "./utils.js";
import { getFilterDropdownValues } from "./filters.js";

export function getEventType(row) {
  const content = parseContent(row);
  if (row.msg === "incoming request" || row.msg === "request completed")
    return "http";
  if (content?.event === "ai_prompt") return "ai";
  if (content?.event?.startsWith("ws_")) return "ws";
  if (
    content?.error ||
    (content?.res?.statusCode && Number(content.res.statusCode) >= 400)
  ) {
    return "err";
  }
  return "http";
}

function typeBadgeClass(t) {
  const map = {
    http: "badge-neutral",
    ws: "badge-neutral",
    ai: "badge-accent",
    err: "badge-bad",
  };
  return map[t] || "badge-neutral";
}

function typeLabel(t) {
  return LOG_FILTER_LABELS[t] || "HTTP";
}

function getStatusFromContent(content, type) {
  if (content.res?.statusCode) {
    const c = Number(content.res.statusCode);
    const status = c === 101 ? "ok" : String(c);
    const statusClass =
      c < 400 ? "badge-ok" : c < 500 ? "badge-warn" : "badge-bad";
    return { status, statusClass };
  }
  if (content.error) return { status: "ERR", statusClass: "badge-bad" };
  if (type === "ai") {
    return {
      status: content.success ? "200" : "ERR",
      statusClass: content.success ? "badge-ok" : "badge-bad",
    };
  }
  if (type === "ws") return { status: "ok", statusClass: "badge-ok" };
  return { status: "-", statusClass: "badge-neutral" };
}

function buildLogRow(row, index) {
  const content = parseContent(row);
  const type = getEventType(row);
  const d = new Date(row.time);
  const dateStr = d
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
  const timeStr = d.toTimeString().slice(0, 12);
  let path = content.req?.url || content.wsEvent || content.error || "/";
  if (content.promptLength) path = `prompt: ${content.promptLength} chars`;
  const { status, statusClass } = getStatusFromContent(content, type);
  const dur = content.responseTime
    ? `${Math.round(content.responseTime)}ms`
    : "—";
  const pathStr = String(path);
  const pathDisplay =
    pathStr.length > 50 ? pathStr.slice(0, 47) + "…" : pathStr;
  const badgeClass = typeBadgeClass(type);
  const badgeLabel = typeLabel(type);
  return (
    `<tr data-index="${index}">` +
    `<td class="log-time"><span class="log-time-date">${escapeHTML(dateStr)}</span>` +
    `<strong>${escapeHTML(timeStr)}</strong></td>` +
    `<td><span class="log-type-badge ${badgeClass}">${badgeLabel}</span></td>` +
    `<td class="path-cell"><span class="log-path" title="${escapeHTML(pathStr)}">${escapeHTML(pathDisplay)}</span></td>` +
    `<td class="log-status ${statusClass}">${escapeHTML(status)}</td>` +
    `<td class="log-dur">${escapeHTML(dur)}</td></tr>`
  );
}

export function matchesLogFilter(r, opts = {}) {
  const content = parseContent(r);
  const type = getEventType(r);
  if (!state.filterState.api && type === "http") return false;
  if (!state.filterState.ws && type === "ws") return false;
  if (!state.filterState.ai && type === "ai") return false;
  if (!state.filterState.err && type === "err") return false;
  if (opts.typeOnly) return true;
  const statusFilters = getFilterDropdownValues("logsFilterStatus");
  if (statusFilters.length > 0) {
    const statusCode =
      content.res?.statusCode != null ? Number(content.res.statusCode) : null;
    const matches = statusFilters.some(
      (sf) => statusCode != null && STATUS_FILTERS[sf]?.(statusCode),
    );
    if (!matches) return false;
  }
  const durationFilters = getFilterDropdownValues("logsFilterDuration");
  if (durationFilters.length > 0) {
    const dur =
      content.responseTime != null ? Number(content.responseTime) : null;
    if (dur == null) return false;
    const matches = durationFilters.some((df) => DURATION_FILTERS[df]?.(dur));
    if (!matches) return false;
  }
  const q = (byId("logsSearch")?.value || "").toLowerCase();
  if (q) {
    const path = content.req?.url || content.wsEvent || content.error || "";
    const siteId = content.siteId != null ? Number(content.siteId) : null;
    const site =
      siteId != null
        ? state.sitesData.find((x) => x.id === siteId)?.name || ""
        : "";
    const searchable =
      `${path} ${site} ${content.res?.statusCode || ""}`.toLowerCase();
    if (!searchable.includes(q)) return false;
  }
  return true;
}

export function renderLogs() {
  const filtered = state.logEvents.filter((r) => matchesLogFilter(r));
  const tbody = byId("logsBody");
  if (!tbody) return;
  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="log-empty">No logs match your filter</td></tr>';
    const loadWrap = byId("loadMoreLogsWrap");
    if (loadWrap) loadWrap.style.display = "none";
    updateSortHeaders(".log-tbl", state.logsSort);
    return;
  }
  const { col, order } = state.logsSort;
  const asc = order === "asc" ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    const contentA = parseContent(a);
    const contentB = parseContent(b);
    if (col === "time")
      return asc * (new Date(a.time).getTime() - new Date(b.time).getTime());
    if (col === "type") {
      const typeA = getEventType(a);
      const typeB = getEventType(b);
      return asc * (typeA < typeB ? -1 : typeA > typeB ? 1 : 0);
    }
    if (col === "path") {
      const pathA = (
        contentA.req?.url ||
        contentA.wsEvent ||
        contentA.error ||
        ""
      ).toLowerCase();
      const pathB = (
        contentB.req?.url ||
        contentB.wsEvent ||
        contentB.error ||
        ""
      ).toLowerCase();
      return asc * (pathA < pathB ? -1 : 1);
    }
    if (col === "status") {
      const sa =
        contentA.res?.statusCode != null
          ? Number(contentA.res.statusCode)
          : contentA.error
            ? 999
            : getEventType(a) === "ws"
              ? 101
              : 200;
      const sb =
        contentB.res?.statusCode != null
          ? Number(contentB.res.statusCode)
          : contentB.error
            ? 999
            : getEventType(b) === "ws"
              ? 101
              : 200;
      return asc * (sa - sb);
    }
    if (col === "dur") {
      const durA =
        contentA.responseTime != null ? Number(contentA.responseTime) : -1;
      const durB =
        contentB.responseTime != null ? Number(contentB.responseTime) : -1;
      return asc * (durA - durB);
    }
    return 0;
  });
  tbody.innerHTML = sorted
    .map((r) => buildLogRow(r, state.logEvents.indexOf(r)))
    .join("");
  const loadWrap = byId("loadMoreLogsWrap");
  if (loadWrap)
    loadWrap.style.display = state.logEvents.length >= 50 ? "block" : "none";
  updateSortHeaders(".log-tbl", state.logsSort);
}

export function updateEventsTable(events, append) {
  if (!append) {
    state.logEvents = events;
  }
  renderLogs();
}
