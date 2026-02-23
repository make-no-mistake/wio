/** Landing page data — single source of truth for features and workflow. */
const GITHUB_URL =
  "https://github.com/csc301-2026-s/project-21-make-no-mistake";

const realtimeIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 2a10 10 0 0 0-10 10"/><path d="M12 12l6 0"/><path d="M12 12l-6 0"/><path d="M12 12l0 6"/><path d="M12 12l0-6"/></svg>';
const aiIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/></svg>';
const deployIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>';
const tableIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/></svg>';
const codeIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';
const keyIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></path></svg>';

const featureGridCards = [
  {
    icon: tableIcon,
    title: "Schema-less tables",
    description:
      "Create tables on the fly. Insert any JSON, query with a fluent TypeScript client — no migrations required.",
    visualHtml: `<div class="feature-visual-code"><pre><code><span class="kw">const</span> courses = <span class="fn">useTable</span>(<span class="s">"courses"</span>);
<span class="kw">await</span> courses
  .<span class="fn">where</span>({ dept: <span class="s">"CSC"</span> })
  .<span class="fn">orderBy</span>(<span class="s">"votes"</span>, <span class="s">"desc"</span>)
  .<span class="fn">limit</span>(<span class="num">10</span>);</code></pre></div>`,
  },
  {
    icon: realtimeIcon,
    title: "Real-time sync",
    description:
      "WebSockets out of the box. Emit to topics, broadcast to clients — zero configuration needed.",
    visualHtml: `<div class="feature-visual-diagram">
  <div class="flow-box">Client A</div>
  <div class="flow-connector">↔</div>
  <div class="flow-box">wio</div>
  <div class="flow-connector">↔</div>
  <div class="flow-box">Client B</div>
</div>`,
  },
  {
    icon: aiIcon,
    title: "AI built-in",
    description:
      "Call Claude as a single function. Summarize, classify, generate — no API keys or backend to manage.",
    visualHtml: `<div class="feature-visual-code"><pre><code><span class="kw">const</span> summary = <span class="kw">await</span>
  <span class="fn">ask</span>(<span class="s">"Summarize top courses"</span>)
  .<span class="fn">response</span>();</code></pre></div>`,
  },
  {
    icon: codeIcon,
    title: "Agent-first API",
    description:
      "AGENTS.md gives your AI the full API reference. One read, then it builds — no guessing.",
    visualHtml: `<div class="feature-visual-code feature-visual-md"><pre><code><span class="cm"># wio API</span>
<span class="kw">## Tables</span>
useTable(name)
<span class="kw">## Real-time</span>
socket.emit / socket.on
<span class="kw">## AI</span>
ask(prompt).response()</code></pre></div>`,
  },
  {
    icon: deployIcon,
    title: "One-command deploy",
    description:
      "Run wio push and your app is live at project.wio.dev. Shareable instantly, no DevOps required.",
    visualHtml: `<div class="feature-visual-terminal">
  <div class="fvt-line"><span class="fvt-prompt">$</span> wio push</div>
  <div class="fvt-line fvt-ok">✓ Building...</div>
  <div class="fvt-line fvt-ok">✓ Live → my-app.wio.dev</div>
</div>`,
  },
  {
    icon: keyIcon,
    title: "Powered by",
    description:
      "Built on Fastify, Bun, PostgreSQL, and TypeScript. Production-ready stack, minimal config.",
    visualHtml: `<div class="feature-visual-logos">
  <div class="fv-logo-box"><img src="https://cdn.simpleicons.org/fastify/9ca3af" alt="Fastify" class="fv-logo"/></div>
  <div class="fv-logo-box"><img src="https://cdn.simpleicons.org/bun/9ca3af" alt="Bun" class="fv-logo"/></div>
  <div class="fv-logo-box"><img src="https://cdn.simpleicons.org/postgresql/9ca3af" alt="PostgreSQL" class="fv-logo"/></div>
  <div class="fv-logo-box"><img src="https://cdn.simpleicons.org/typescript/9ca3af" alt="TypeScript" class="fv-logo"/></div>
</div>`,
  },
];

const workflowSteps = [
  {
    title: "Scaffold",
    description:
      "Run <code>npx create-wio-app</code>. You get <code>index.html</code> and <code>AGENTS.md</code> — a complete API reference your agent can read.",
    fileLabel: "AGENTS.md",
    codeHtml: `<span class="cm"># wio API Reference</span><br>
<br>
<span class="kw">## Tables</span><br>
<span class="fn">useTable</span>(name) → Table client<br>
<br>
<span class="kw">## Real-time</span><br>
socket.<span class="fn">emit</span>(topic, data)<br>
socket.<span class="fn">on</span>(topic, callback)<br>
<br>
<span class="kw">## AI</span><br>
<span class="fn">ask</span>(prompt).<span class="fn">response</span>()<br>
<br>
<span class="cm"># Your agent reads this once. Then it builds.</span>`,
  },
  {
    title: "Prompt",
    description:
      "Open your agent — Cursor, Claude Code, Codex. Describe the app in plain language. Point it at the project folder.",
    fileLabel: "agent",
    codeHtml: `<span class="agent-label">Question</span><br>
<span class="agent-q">Build a course ranker where students<br>can upvote their favourite classes</span><br>
<br>
<span class="agent-muted">• Analyzed scope</span><br>
<span class="agent-muted">• Started agents</span><br>
<span class="agent-green">• Database — Creating courses table</span><br>
<span class="agent-green">• Frontend — Building vote UI</span><br>
<span class="agent-cur">&nbsp;</span>`,
  },
  {
    title: "Build",
    description:
      "The agent reads <code>AGENTS.md</code> and builds — creating tables, wiring sockets, calling <code>ask()</code>. No backend code from you.",
    fileLabel: "index.html",
    codeHtml: `<span class="cm">&lt;!-- Agent-built --&gt;</span><br>
<span class="kw">&lt;script</span> <span class="fn">src</span>=<span class="s">"https://cdn.wio.dev/wio.js"</span><span class="kw">&gt;&lt;/script&gt;</span><br>
<span class="kw">&lt;script&gt;</span><br>
&nbsp;<span class="kw">const</span> courses = <span class="fn">useTable</span>(<span class="s">"courses"</span>);<br>
&nbsp;<span class="kw">const</span> data = <span class="kw">await</span> courses<br>
&nbsp;&nbsp;&nbsp;.<span class="fn">orderBy</span>(<span class="s">"votes"</span>,<span class="s">"desc"</span>)<br>
&nbsp;&nbsp;&nbsp;.<span class="fn">limit</span>(<span class="num">20</span>);<br>
&nbsp;socket.<span class="fn">on</span>(<span class="s">"vote"</span>, () =&gt; <span class="fn">refresh</span>());<br>
<span class="kw">&lt;/script&gt;</span>`,
  },
  {
    title: "Ship",
    description:
      "Run <code>wio push</code>. Your app is live at <code>project.wio.dev</code> — shareable instantly. No DevOps required.",
    fileLabel: "Terminal",
    codeHtml: `<span class="ok">$</span> npx create-wio-app course-ranker<br>
<span class="agent-muted">✓ Created index.html + AGENTS.md</span><br>
<br>
<span class="ok">$</span> wio push<br>
<span class="agent-green">✓ Live → course-ranker.wio.dev</span>`,
  },
];

(function () {
  document.querySelectorAll("[data-github-link]").forEach((a) => {
    a.href = GITHUB_URL;
  });
})();

(function () {
  const featuresContainer = document.getElementById("feature-grid");
  if (featuresContainer) {
    const html = featureGridCards
      .map(
        (card) => `
      <div class="feature-card">
        <div class="feature-card-header">
          <div class="feature-card-icon">${card.icon}</div>
          <h3 class="feature-card-title">${card.title}</h3>
        </div>
        <p class="feature-card-desc">${card.description}</p>
        <div class="feature-visual">${card.visualHtml}</div>
      </div>`,
      )
      .join("");
    featuresContainer.innerHTML = html;
  }

  const workflowStepsEl = document.getElementById("workflow-steps");
  const workflowPanelsEl = document.getElementById("workflow-panels");
  if (workflowStepsEl && workflowPanelsEl) {
    workflowStepsEl.innerHTML =
      '<div class="workflow-progress-track"><div class="workflow-progress-line" id="workflow-progress"></div></div>' +
      workflowSteps
        .map(
          (step, i) =>
            `<div class="workflow-step" data-step="${i}">
          <h3>${step.title}</h3>
          <p>${step.description}</p>
        </div>`,
        )
        .join("");
    workflowPanelsEl.innerHTML = workflowSteps
      .map(
        (step, i) =>
          `<div class="workflow-panel" data-step="${i}">
          <div class="workflow-panel-bar">
            <div class="workflow-panel-dots">
              <span class="workflow-panel-dot"></span>
              <span class="workflow-panel-dot"></span>
              <span class="workflow-panel-dot"></span>
            </div>
            <span class="workflow-panel-filename">${step.fileLabel}</span>
          </div>
          <div class="workflow-panel-body">${step.codeHtml}</div>
        </div>`,
      )
      .join("");
  }
})();

(function () {
  const STORAGE_KEY = "wio-theme";
  const html = document.documentElement;

  function getStoredPreference() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return ["dark", "light", "adaptive"].includes(stored) ? stored : "adaptive";
  }

  function getResolvedTheme() {
    const pref = getStoredPreference();
    if (pref === "adaptive")
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    return pref;
  }

  function applyTheme(resolved) {
    if (resolved === "dark") html.setAttribute("data-theme", "dark");
    else html.removeAttribute("data-theme");
  }

  function setPreference(pref) {
    localStorage.setItem(STORAGE_KEY, pref);
    const resolved =
      pref === "adaptive"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : pref;
    applyTheme(resolved);
    updateFooterThemeButtons();
  }

  function updateFooterThemeButtons() {
    const pref = getStoredPreference();
    document.querySelectorAll(".theme-btn-adaptive").forEach((btn) => {
      btn.classList.toggle("active", pref === "adaptive");
      btn.setAttribute("aria-pressed", pref === "adaptive");
    });
    document.querySelectorAll(".theme-btn-light").forEach((btn) => {
      btn.classList.toggle("active", pref === "light");
      btn.setAttribute("aria-pressed", pref === "light");
    });
    document.querySelectorAll(".theme-btn-dark").forEach((btn) => {
      btn.classList.toggle("active", pref === "dark");
      btn.setAttribute("aria-pressed", pref === "dark");
    });
  }

  function initTheme() {
    applyTheme(getResolvedTheme());
    updateFooterThemeButtons();
  }

  initTheme();
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (getStoredPreference() === "adaptive")
        applyTheme(e.matches ? "dark" : "light");
    });
  document
    .querySelector(".theme-btn-adaptive")
    ?.addEventListener("click", () => setPreference("adaptive"));
  document
    .querySelector(".theme-btn-light")
    ?.addEventListener("click", () => setPreference("light"));
  document
    .querySelector(".theme-btn-dark")
    ?.addEventListener("click", () => setPreference("dark"));
})();

(function () {
  const cmdEl = document.getElementById("hero-install-cmd");
  const copyBtn = document.getElementById("hero-install-copy");
  const copySvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const checkSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';

  if (cmdEl && copyBtn) {
    copyBtn.addEventListener("click", () => {
      const cmd =
        cmdEl.getAttribute("data-cmd") || cmdEl.textContent || "bun link wio";
      navigator.clipboard.writeText(cmd).then(() => {
        copyBtn.classList.add("copied");
        copyBtn.innerHTML = checkSvg;
        setTimeout(() => {
          copyBtn.classList.remove("copied");
          copyBtn.innerHTML = copySvg;
        }, 1500);
      });
    });
  }
})();

(function () {
  function initReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    const opts = {
      root: null,
      rootMargin: "0px 0px -80px 0px",
      threshold: 0.15,
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("revealed");
      });
    }, opts);
    els.forEach((el) => obs.observe(el));
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", initReveal)
    : initReveal();
})();

(function () {
  const steps = document.querySelectorAll(".workflow-step");
  const panels = document.querySelectorAll(".workflow-panel[data-step]");
  const progressLine = document.getElementById("workflow-progress");
  if (!steps.length || !panels.length) return;

  const totalSteps = steps.length;

  function setActiveStep(idx) {
    if (idx < 0 || idx >= totalSteps) return;
    panels.forEach((p) => {
      const stepIdx = parseInt(p.getAttribute("data-step"), 10);
      p.classList.remove(
        "wf-front",
        "wf-behind-1",
        "wf-behind-2",
        "wf-behind-3",
        "wf-hidden",
      );
      if (stepIdx > idx) p.classList.add("wf-hidden");
      else if (stepIdx === idx) p.classList.add("wf-front");
      else p.classList.add("wf-behind-" + (idx - stepIdx));
    });
    if (progressLine && steps[idx]) {
      const step = steps[idx];
      progressLine.style.top =
        step.offsetTop + step.offsetHeight / 2 - 40 + "px";
    }
  }

  let activeIdx = 0;
  const opts = { root: null, rootMargin: "-35% 0px -45% 0px", threshold: 0 };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const idx = parseInt(e.target.getAttribute("data-step"), 10);
      if (e.isIntersecting && idx >= 0 && idx !== activeIdx) {
        activeIdx = idx;
        setActiveStep(idx);
      }
    });
  }, opts);
  steps.forEach((s) => obs.observe(s));
  setActiveStep(0);
})();

(function () {
  const commands = [
    "course ranker with real-time votes",
    "todos table with status and due dates",
    "live poll with anonymous voting",
    "wio push to go live",
  ];
  const el = document.getElementById("agent-typing");
  const textEl = el?.querySelector(".agent-typing-text");
  if (!textEl) return;

  let idx = 0;
  let cmd = commands[0];
  let i = 0;
  const typingSpeed = 45;
  const deleteSpeed = 20;
  const pauseAfterType = 2000;
  const pauseAfterDelete = 800;

  function typeNext() {
    if (i < cmd.length) {
      textEl.textContent += cmd[i++];
      setTimeout(typeNext, typingSpeed + Math.random() * 25);
    } else {
      setTimeout(deleteAll, pauseAfterType);
    }
  }

  function deleteAll() {
    if (textEl.textContent.length > 0) {
      textEl.textContent = textEl.textContent.slice(0, -1);
      setTimeout(deleteAll, deleteSpeed);
    } else {
      idx = (idx + 1) % commands.length;
      cmd = commands[idx];
      i = 0;
      setTimeout(typeNext, pauseAfterDelete);
    }
  }

  setTimeout(typeNext, 1200);
})();
