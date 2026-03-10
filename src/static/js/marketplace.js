const GITHUB_URL =
  "https://github.com/csc301-2026-s/project-21-make-no-mistake";

(function () {
  document.querySelectorAll("[data-github-link]").forEach((a) => {
    a.href = GITHUB_URL;
  });
})();

(async function loadMarketplace() {
  const grid = document.getElementById("marketplace-grid");
  if (!grid) return;
  try {
    const res = await fetch("/marketplace/api");
    const { sites } = await res.json();
    if (!sites.length) {
      grid.innerHTML =
        '<p class="marketplace-empty">No sites deployed yet.</p>';
      return;
    }
    grid.innerHTML = sites
      .map(
        (site) => `
      <a href="${site.url}" class="marketplace-card" target="_blank" rel="noopener noreferrer">
        <div class="marketplace-card-top">
          <span class="marketplace-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </span>
          <span class="marketplace-card-name">${site.name}</span>
        </div>
        <p class="marketplace-card-url">${site.url}</p>
        <p class="marketplace-card-date">Deployed ${new Date(site.deployed_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
      </a>`,
      )
      .join("");
  } catch {
    // network or parse errors are silently ignored on the client
  }
})();
