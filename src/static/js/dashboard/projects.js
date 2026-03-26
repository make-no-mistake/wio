import { state, NO_PROJECTS_HTML } from "./state.js";
import { byId, escapeHTML, formatProjectTime } from "./utils.js";

/**
 * Render the projects grid.
 * @param {(val: string) => void} onActivate - called when a card is activated
 *   (click or Enter/Space). Receives the site val. Pass null to skip attaching
 *   handlers (useful when re-rendering without re-binding, though typically
 *   you always pass it).
 */
export function renderProjects(onActivate) {
  const q = (byId("projSearch")?.value || "").toLowerCase();
  const sort = byId("projSort")?.value || "activity";
  let list = state.sitesData
    .filter((s) => s.id)
    .filter(
      (p) =>
        !q ||
        p.label.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q),
    );
  if (sort === "name")
    list = [...list].sort((a, b) =>
      (a.label || "").localeCompare(b.label || ""),
    );
  else
    list = [...list].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const grid = byId("projGrid");
  if (!grid) return;
  if (list.length === 0) {
    const hasSites = state.sitesData.filter((s) => s.id).length > 0;
    grid.innerHTML = hasSites
      ? '<div class="empty"><span class="empty-msg">No projects match your search</span>' +
        '<span class="empty-hint">Try a different search term</span></div>'
      : NO_PROJECTS_HTML;
    return;
  }
  grid.innerHTML = list
    .map(
      (p) =>
        `<div class="proj-card" data-site-id="${p.id}" data-site-val="${escapeHTML(p.val || "")}" tabindex="0" aria-label="Open ${escapeHTML(p.name || p.label)} dashboard">` +
        `<span class="proj-caret material-symbols-outlined" aria-hidden="true">chevron_right</span>` +
        `<div class="proj-name">${escapeHTML(p.name || p.label)}</div>` +
        `<a class="proj-url" href="${escapeHTML(p.url || "#")}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${escapeHTML(p.url || "")}</a>` +
        `<span class="proj-time">${formatProjectTime(p)}</span></div>`,
    )
    .join("");
  if (!onActivate) return;
  grid.querySelectorAll(".proj-card").forEach((card) => {
    const activate = () => {
      const val = card.dataset.siteVal;
      if (val) onActivate(val);
    };
    card.addEventListener("click", activate);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });
}
