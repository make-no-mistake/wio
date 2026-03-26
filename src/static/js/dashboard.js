import { state, LOG_TYPES } from "./dashboard/state.js";
import { byId, on } from "./dashboard/utils.js";
import { initCharts } from "./dashboard/charts.js";
import {
  fetchViewData,
  fetchEventsData,
  fetchTrafficData,
} from "./dashboard/fetch.js";
import {
  initFilterDropdowns,
  setFilterDropdownValues,
  updateLogsFilterActiveState,
} from "./dashboard/filters.js";
import { renderLogs } from "./dashboard/logs.js";
import {
  initSites,
  renderComboOpts,
  toggleCombo,
  closeCombo,
  selectSite,
  toggleAccountDropdown,
  go,
} from "./dashboard/nav.js";
import { renderProjects } from "./dashboard/projects.js";
import { renderAllPaths } from "./dashboard/traffic.js";

function initSortable(selector, sortState, onSort) {
  document.querySelectorAll(selector).forEach((th) => {
    const doSort = () => {
      const col = th.dataset.sort;
      const isActive = sortState.col === col;
      sortState.order = isActive && sortState.order === "asc" ? "desc" : "asc";
      sortState.col = col;
      onSort();
    };

    th.addEventListener("click", doSort);
    th.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        doSort();
      }
    });
  });
}

function renderProjectsWithActivation() {
  renderProjects((val) => {
    selectSite(val);
    go("overview");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSites();
  renderComboOpts("");
  byId("comboLabel").textContent = state.selectedSite?.label || "-";

  on("breadcrumbProjects", "click", (e) => {
    e.preventDefault();
    go("projects");
  });

  on("comboTrigger", "click", toggleCombo);
  on("comboTrigger", "keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCombo();
    } else if (e.key === "Escape") {
      closeCombo();
    }
  });

  on("comboSearchVis", "input", (e) => renderComboOpts(e.target.value));
  on("comboSearchVis", "keydown", (e) => {
    if (e.key === "Escape") {
      closeCombo();
      byId("comboTrigger")?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      byId("comboOpts")?.querySelector(".combo-opt")?.focus();
    }
  });

  on("accountTrigger", "click", (e) => {
    e.stopPropagation();
    toggleAccountDropdown();
  });
  on("accountTrigger", "keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleAccountDropdown();
    }
  });

  document.addEventListener("keydown", (e) => {
    const accountDropdown = byId("accountDropdown");
    if (e.key === "Escape" && accountDropdown?.classList.contains("open")) {
      toggleAccountDropdown(false);
    }
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => go(e.currentTarget));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go(item);
      }
    });
  });

  document.querySelectorAll(".overview-chart-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      const filterStatus = link.dataset.filterStatus;
      const filterType = link.dataset.filterType;

      if (page === "logs") {
        if (filterStatus) {
          const statusValues = filterStatus
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          setFilterDropdownValues("logsFilterStatus", statusValues);
        }
        if (filterType) {
          state.filterState.api = filterType === "api";
          state.filterState.ws = filterType === "ws";
          state.filterState.ai = filterType === "ai";
          state.filterState.err = filterType === "err";
          setFilterDropdownValues("logsFilterType", [filterType]);
        }
        state.eventsCurrentPage = 1;
        if (filterStatus || filterType) fetchEventsData();
      }
      go(page);
    });
  });

  initSortable(
    ".tbl-all-paths th.sortable",
    state.allPathsSort,
    renderAllPaths,
  );
  initSortable(".log-tbl th.sortable", state.logsSort, renderLogs);

  try {
    initCharts();
  } catch (err) {
    console.error("Failed to initialize charts", err);
  }

  renderProjectsWithActivation();

  on("copyTokenBtn", "click", async (e) => {
    e.preventDefault();
    const token = window.__DASHBOARD_DATA__?.user?.tag;
    if (!token) return;
    const btn = e.currentTarget;
    const origHTML = btn.innerHTML;
    const copiedHTML =
      '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13 4L6 11 3 8"/></svg> Copied';

    const done = () => {
      btn.classList.remove("copied");
      btn.innerHTML = origHTML;
    };

    try {
      await navigator.clipboard.writeText(token);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = token;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    btn.classList.add("copied");
    btn.innerHTML = copiedHTML;
    setTimeout(done, 1500);
  });

  on("logoutBtn", "click", (e) => {
    e.preventDefault();
    document.cookie =
      "wio-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  });

  on("logsSearch", "input", () => renderLogs());

  const onTypeChange = (vals) => {
    LOG_TYPES.forEach((k) => {
      state.filterState[k] = vals.length === 0 || vals.includes(k);
    });
    state.eventsCurrentPage = 1;
    fetchEventsData();
    renderLogs();
    updateLogsFilterActiveState();
  };

  const onStatusChange = () => {
    state.eventsCurrentPage = 1;
    fetchEventsData();
    renderLogs();
    updateLogsFilterActiveState();
  };

  const onDurationChange = () => {
    renderLogs();
    updateLogsFilterActiveState();
  };

  initFilterDropdowns([
    { name: "logsFilterType", onChange: onTypeChange, defaultLabel: "Type" },
    {
      name: "logsFilterStatus",
      onChange: onStatusChange,
      defaultLabel: "Status",
    },
    {
      name: "logsFilterDuration",
      onChange: onDurationChange,
      defaultLabel: "Response time",
    },
  ]);

  on("trafficTimeRange", "change", () => {
    if (state.currentPage === "traffic") fetchTrafficData();
  });

  const openLogsTimePicker = () => {
    const select = byId("logsFilterTime");
    if (!select) return;
    if (typeof select.showPicker === "function") {
      select.showPicker();
      return;
    }
    select.focus();
    select.click();
  };

  on("logsFilterTimeWrap", "click", (e) => {
    if (e.target?.id === "logsFilterTime") return;
    openLogsTimePicker();
  });

  on("logsFilterTime", "change", onStatusChange);
  on("projSearch", "input", renderProjectsWithActivation);
  on("projSort", "change", renderProjectsWithActivation);
  on("loadMoreLogsBtn", "click", () => {
    state.eventsCurrentPage++;
    fetchEventsData(true);
  });

  fetchViewData();
});
