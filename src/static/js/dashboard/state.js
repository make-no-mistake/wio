export const PILL_MAP = {
  healthy: "ok",
  stable: "ok",
  degraded: "warn",
  down: "bad",
  unknown: "neu",
};

export const LOG_TYPES = ["api", "ws", "ai", "err"];

export const LOG_FILTER_LABELS = {
  api: "HTTP",
  ws: "WebSocket",
  ai: "AI",
  err: "Error",
};

export const STATUS_COLOR = {
  ok: "rgba(39, 184, 122, 0.8)",
  redirect: "rgba(79, 143, 207, 0.8)",
  warn: "rgba(232, 151, 58, 0.8)",
  bad: "rgba(248, 113, 113, 0.8)",
};

export const STATUS_FILTERS = {
  "2xx": (code) => code >= 200 && code < 300,
  "4xx": (code) => code >= 400 && code < 500,
  "5xx": (code) => code >= 500,
};

export const DURATION_FILTERS = {
  "0-100": (dur) => dur < 100,
  "100-500": (dur) => dur >= 100 && dur < 500,
  "500-1000": (dur) => dur >= 500 && dur < 1000,
  "1000+": (dur) => dur >= 1000,
};

export const NO_PROJECTS_HTML =
  '<div class="empty create"><div style="max-width:320px;margin:0 auto;text-align:center">' +
  '<h3 style="font:500 18px var(--sans);color:var(--text);margin:0 0 8px">No projects yet</h3>' +
  '<p style="font:15px var(--sans);color:var(--muted2);line-height:1.5;margin:0 0 16px">Create your first site with the Wio CLI. In your project directory, run:</p>' +
  '<div style="display:flex;flex-direction:column;gap:6px;text-align:left;background:var(--surf2);border:1px solid var(--border);border-radius:6px;padding:12px 16px;margin-bottom:16px"><code style="font:13px var(--mono);color:var(--text)">wio init &lt;name&gt;</code><code style="font:13px var(--mono);color:var(--text)">wio push</code></div>' +
  '<a href="https://wio.onl/docs" target="_blank" rel="noopener noreferrer">View docs -&gt;</a>' +
  "</div></div>";

export function getData() {
  return window.__DASHBOARD_DATA__ || { sites: [], user: null };
}

export const state = {
  overviewActivityChart: null,
  overviewProblemsChart: null,
  overviewRoutesChart: null,
  trafficVolumeChart: null,
  trafficStatusCodesChart: null,
  allPathsData: [],
  allPathsSort: { col: "hits", order: "desc" },
  logsSort: { col: "time", order: "desc" },
  currentSiteId: "overview",
  currentPage: "projects",
  eventsCurrentPage: 1,
  logEvents: [],
  filterState: { api: true, ws: true, ai: true, err: true },
  sitesData: [],
  selectedSite: null,
};
