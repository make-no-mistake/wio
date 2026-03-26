import { byId } from "./utils.js";

export function getFilterDropdownValues(name) {
  const panel = byId(`${name}Panel`);
  return panel
    ? [...panel.querySelectorAll("input:checked")].map((cb) => cb.dataset.value)
    : [];
}

export function setFilterDropdownValues(name, values) {
  const panel = byId(`${name}Panel`);
  if (!panel) return;
  panel.querySelectorAll("input").forEach((cb) => {
    cb.checked = values.includes(cb.dataset.value);
  });
  updateFilterDropdownLabel(name);
}

function getFilterDropdownLabels(name) {
  const panel = byId(`${name}Panel`);
  return panel
    ? [...panel.querySelectorAll("input:checked")].map(
        (cb) => cb.dataset.label || cb.dataset.value,
      )
    : [];
}

export function updateFilterDropdownLabel(name, defaultLabel) {
  const labelEl = byId(`${name}Trigger`)?.querySelector(
    ".filter-dropdown-label",
  );
  if (!labelEl) return;
  const labels = getFilterDropdownLabels(name);
  labelEl.textContent =
    labels.length === 0
      ? defaultLabel || "Type"
      : labels.length === 1
        ? labels[0]
        : `${labels[0]} +${labels.length - 1}`;
}

export function initFilterDropdown(name, onChange, defaultLabel) {
  const dropdown = byId(`${name}Dropdown`);
  const trigger = byId(`${name}Trigger`);
  const panel = byId(`${name}Panel`);
  if (!dropdown || !trigger || !panel) return;
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".filter-dropdown.open").forEach((d) => {
      if (d !== dropdown) {
        d.classList.remove("open");
        d.querySelector(".filter-dropdown-trigger")?.setAttribute(
          "aria-expanded",
          "false",
        );
      }
    });
    const isOpen = dropdown.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });
  panel.querySelectorAll("input").forEach((cb) => {
    cb.addEventListener("change", () => {
      updateFilterDropdownLabel(name, defaultLabel);
      onChange(getFilterDropdownValues(name));
    });
  });
  panel.addEventListener("click", (e) => e.stopPropagation());
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    }
  });
}

export function initFilterDropdowns(configs) {
  configs.forEach(({ name, onChange, defaultLabel }) =>
    initFilterDropdown(name, onChange, defaultLabel),
  );
}

export function updateLogsFilterActiveState() {
  const typeEl = byId("logsFilterTypeDropdown");
  const timeEl = byId("logsFilterTime");
  const timeWrap = byId("logsFilterTimeWrap");
  const statusEl = byId("logsFilterStatusDropdown");
  const durationEl = byId("logsFilterDurationDropdown");
  typeEl?.classList.toggle(
    "active",
    getFilterDropdownValues("logsFilterType").length > 0,
  );
  timeWrap?.classList.toggle("active", timeEl?.value !== "any");
  statusEl?.classList.toggle(
    "active",
    getFilterDropdownValues("logsFilterStatus").length > 0,
  );
  durationEl?.classList.toggle(
    "active",
    getFilterDropdownValues("logsFilterDuration").length > 0,
  );
}

// Close all filter dropdowns when clicking outside
document.addEventListener("click", () => {
  document.querySelectorAll(".filter-dropdown.open").forEach((d) => {
    d.classList.remove("open");
    d.querySelector(".filter-dropdown-trigger")?.setAttribute(
      "aria-expanded",
      "false",
    );
  });
});
