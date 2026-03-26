export const byId = (id) => document.getElementById(id);
export const on = (id, event, handler) =>
  byId(id)?.addEventListener(event, handler);

export function toggleDisplay(id, isVisible, visibleDisplay = "block") {
  const node = byId(id);
  if (node) node.style.display = isVisible ? visibleDisplay : "none";
}

export function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatNumber(num) {
  if (num === undefined || num === null) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return String(num);
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 2592000) return `${Math.floor(sec / 86400)}d ago`;
  if (sec < 31536000) return `${Math.floor(sec / 2592000)}mo ago`;
  return `${Math.floor(sec / 31536000)}y ago`;
}

export function formatProjectTime(project) {
  if (project?.updated_at) {
    return `Updated ${formatRelativeTime(project.updated_at)}`;
  }
  return `Created ${formatRelativeTime(project?.created_at)}`;
}

export function parseContent(row) {
  const c = row?.content;
  if (!c) return {};
  if (typeof c === "object") return c;
  try {
    return JSON.parse(c);
  } catch {
    return {};
  }
}

export function buildTimeSlots(since) {
  const now = new Date();
  const is24h = since === "24h";
  const n = is24h ? 24 : since === "7d" ? 7 : since === "30d" ? 30 : 90;
  const slots = [];
  for (let i = is24h ? 23 : n - 1; i >= 0; i--) {
    const t = new Date(now);
    if (is24h) {
      t.setHours(t.getHours() - i);
      t.setMinutes(0, 0, 0);
      t.setSeconds(0, 0);
    } else {
      t.setDate(t.getDate() - i);
      t.setHours(0, 0, 0, 0);
    }
    slots.push(t);
  }
  const labels = is24h
    ? slots.map((h) => h.toLocaleTimeString([], { hour: "2-digit" }))
    : slots.map((d) =>
        d.toLocaleDateString([], { month: "short", day: "numeric" }),
      );
  const toKey = (d) => {
    const x = new Date(d);
    if (is24h) {
      x.setMinutes(0, 0, 0);
      x.setSeconds(0, 0);
    } else {
      x.setHours(0, 0, 0, 0);
    }
    return x.getTime();
  };
  return { slots, labels, toKey };
}

export function updateSortHeaders(tableSelector, sortState) {
  const row = document.querySelector(`${tableSelector} thead tr`);
  if (!row) return;
  row.querySelectorAll("th.sortable").forEach((th) => {
    const key = th.dataset.sort;
    const isActive = sortState.col === key;
    th.dataset.order = isActive ? sortState.order : "asc";
    th.classList.toggle("sort-asc", isActive && sortState.order === "asc");
    th.classList.toggle("sort-desc", isActive && sortState.order === "desc");
    th.setAttribute(
      "aria-sort",
      isActive
        ? sortState.order === "asc"
          ? "ascending"
          : "descending"
        : "none",
    );
  });
}
