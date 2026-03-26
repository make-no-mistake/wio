import { state, STATUS_COLOR } from "./state.js";
import {
  byId,
  toggleDisplay,
  formatNumber,
  escapeHTML,
  buildTimeSlots,
  updateSortHeaders,
} from "./utils.js";

export function statusCodeColor(code) {
  const c = Number(code);
  if (c >= 200 && c < 300) return STATUS_COLOR.ok;
  if (c >= 300 && c < 400) return STATUS_COLOR.redirect;
  if (c >= 400 && c < 500) return STATUS_COLOR.warn;
  return STATUS_COLOR.bad;
}

export function renderAllPaths() {
  const tbody = byId("allPathsBody");
  if (!tbody) return;
  const sorted = [...state.allPathsData].sort((a, b) => {
    const { col, order } = state.allPathsSort;
    const asc = order === "asc" ? 1 : -1;
    if (col === "path") {
      const ap = (a.path || "").toLowerCase();
      const bp = (b.path || "").toLowerCase();
      return asc * (ap < bp ? -1 : ap > bp ? 1 : 0);
    }
    if (col === "hits")
      return asc * ((Number(a.total_hits) || 0) - (Number(b.total_hits) || 0));
    if (col === "avg")
      return (
        asc * ((Number(a.avg_response) || 0) - (Number(b.avg_response) || 0))
      );
    if (col === "max")
      return (
        asc * ((Number(a.max_response) || 0) - (Number(b.max_response) || 0))
      );
    return 0;
  });
  const hasData = sorted.length > 0;
  toggleDisplay("allPathsTableWrap", hasData, "");
  toggleDisplay("allPathsEmpty", !hasData, "flex");
  tbody.innerHTML = hasData
    ? sorted
        .map((p) => {
          const path = escapeHTML(p.path || "/");
          const hits = formatNumber(p.total_hits);
          const avg = Math.round(Number(p.avg_response) || 0);
          const max = Math.round(Number(p.max_response) || 0);
          return (
            `<tr><td class="path-cell">${path}</td>` +
            `<td class="r">${hits}</td>` +
            `<td class="r">${avg}</td>` +
            `<td class="r">${max}</td></tr>`
          );
        })
        .join("")
    : "";
  updateSortHeaders(".tbl-all-paths", state.allPathsSort);
}

export function updateTraffic(data, since = "24h") {
  state.allPathsData = data.allPaths || [];
  renderAllPaths();
  if (state.trafficStatusCodesChart) {
    const sc = data.statusCodes || [];
    const total = sc.reduce((s, r) => s + Number(r.count || 0), 0);
    const hasData = total > 0;
    toggleDisplay("trafficStatusCodesChartWrap", hasData, "");
    toggleDisplay("trafficStatusCodesEmpty", !hasData, "flex");
    if (hasData) {
      state.trafficStatusCodesChart.data.labels = sc.map((r) =>
        String(r.status_code || "?"),
      );
      state.trafficStatusCodesChart.data.datasets[0].data = sc.map(
        (r) => Number(r.count) || 0,
      );
      state.trafficStatusCodesChart.data.datasets[0].backgroundColor = sc.map(
        (r) => statusCodeColor(r.status_code),
      );
    } else {
      state.trafficStatusCodesChart.data.labels = [];
      state.trafficStatusCodesChart.data.datasets[0].data = [];
    }
    state.trafficStatusCodesChart.update();
  }
  if (state.trafficVolumeChart) {
    const { slots, labels, toKey } = buildTimeSlots(since);
    const tvMap = new Map(
      (data.trafficVolume || []).map((r) => [
        toKey(r.hour),
        Number(r.count) || 0,
      ]),
    );
    state.trafficVolumeChart.data.labels = labels;
    state.trafficVolumeChart.data.datasets[0].data = slots.map(
      (s) => tvMap.get(toKey(s)) ?? 0,
    );
    state.trafficVolumeChart.update();
  }
}
