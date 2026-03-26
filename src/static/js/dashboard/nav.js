import { state, getData } from "./state.js";
import { byId, escapeHTML } from "./utils.js";
import {
  fetchViewData,
  fetchOverviewData,
  fetchTrafficData,
  fetchEventsData,
} from "./fetch.js";
import { renderLogs } from "./logs.js";
import { updateLogsFilterActiveState } from "./filters.js";
import { renderProjects } from "./projects.js";

// ---------------------------------------------------------------------------
// Site / combo
// ---------------------------------------------------------------------------

export function initSites() {
  const data = getData();
  state.sitesData = (data.sites || []).map((s) => ({
    val: String(s.id),
    label: `${s.name}.wio.onl`,
    name: s.name,
    id: s.id,
    url: `https://${s.name}.wio.onl`,
    created_at: s.created_at,
    updated_at: s.updated_at || s.updatedAt || null,
  }));
  state.selectedSite = state.sitesData[0] || null;
  state.currentSiteId = state.selectedSite?.val ?? "";
}

export function renderComboOpts(query) {
  const q = (query || "").toLowerCase();
  const filtered = q
    ? state.sitesData.filter((s) => s.label.toLowerCase().includes(q))
    : state.sitesData;
  const optsEl = byId("comboOpts");
  if (!optsEl) return;
  optsEl.innerHTML = filtered
    .map((s) => {
      const isSel = s.val === state.selectedSite?.val;
      const sel = isSel ? " sel" : "";
      return (
        `<div class="dropdown-item combo-opt${sel}" role="option" aria-selected="${isSel}" tabindex="-1" data-val="${escapeHTML(s.val)}">` +
        `<span>${escapeHTML(s.label)}</span></div>`
      );
    })
    .join("");
  optsEl.querySelectorAll(".combo-opt").forEach((el) => {
    el.addEventListener("click", () => selectSite(el.dataset.val));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectSite(el.dataset.val);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        (el.nextElementSibling || el.parentElement.firstElementChild)?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        (
          el.previousElementSibling || el.parentElement.lastElementChild
        )?.focus();
      } else if (e.key === "Escape") {
        closeCombo();
        byId("comboTrigger")?.focus();
      }
    });
  });
}

export function toggleCombo() {
  const dd = byId("comboDropdown");
  const caret = byId("comboCaret");
  const isOpen = dd.classList.toggle("open");
  caret?.classList.toggle("open", isOpen);
  byId("comboTrigger")?.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    renderComboOpts("");
    setTimeout(() => byId("comboSearchVis")?.focus(), 40);
  }
}

export function closeCombo() {
  byId("comboDropdown")?.classList.remove("open");
  byId("comboCaret")?.classList.remove("open");
  byId("comboTrigger")?.setAttribute("aria-expanded", "false");
  const s = byId("comboSearchVis");
  if (s) s.value = "";
}

export function selectSite(val) {
  const s = state.sitesData.find((x) => x.val === val) || state.sitesData[0];
  state.selectedSite = s;
  state.currentSiteId = s.val;
  byId("comboLabel").textContent = s.label;
  closeCombo();
  state.eventsCurrentPage = 1;
  fetchViewData();
}

// ---------------------------------------------------------------------------
// Account dropdown
// ---------------------------------------------------------------------------

export function toggleAccountDropdown(open) {
  const shouldOpen =
    typeof open === "boolean"
      ? open
      : !byId("accountDropdown")?.classList.contains("open");
  byId("accountDropdown")?.classList.toggle("open", shouldOpen);
  const trigger = byId("accountTrigger");
  trigger?.classList.toggle("open", shouldOpen);
  trigger?.setAttribute("aria-expanded", String(shouldOpen));
}

// ---------------------------------------------------------------------------
// Page navigation
// ---------------------------------------------------------------------------

export function go(el) {
  const page = el?.dataset?.page || el;
  if (state.currentPage === page) return;
  state.currentPage = page;
  document
    .querySelector(".shell")
    ?.classList.toggle("projects-only", page === "projects");
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("on"));
  document.querySelector(`[data-page="${page}"]`)?.classList.add("on");
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("on"));
  const logsPage = byId("p-logs");
  if (page === "logs") {
    logsPage?.classList.add("on");
    fetchEventsData();
    renderLogs();
    updateLogsFilterActiveState();
  } else {
    logsPage?.classList.remove("on");
    const pEl = byId(`p-${page}`);
    if (pEl) pEl.classList.add("on");
    byId("content").scrollTop = 0;
    if (page === "overview") fetchOverviewData();
    if (page === "traffic") fetchTrafficData();
    if (page === "projects") {
      renderProjects((val) => {
        selectSite(val);
        go("overview");
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Close dropdowns when clicking outside
// ---------------------------------------------------------------------------

document.addEventListener("click", (e) => {
  const wrap = byId("comboWrap");
  const accountWrap = byId("accountWrap");
  if (wrap && !wrap.contains(e.target)) closeCombo();
  if (accountWrap && !accountWrap.contains(e.target))
    toggleAccountDropdown(false);
});
