const form = document.getElementById("loginForm");
const tagInput = document.getElementById("tagInput");
const loginBtn = document.getElementById("loginBtn");
const statusEl = document.getElementById("loginStatus");

function setStatus(message, tone = "muted") {
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const tag = tagInput.value.trim();
  if (!tag) {
    setStatus("Enter your user tag to continue.", "warn");
    return;
  }

  loginBtn.disabled = true;
  setStatus("Authenticating…");

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        setStatus("That tag is not recognized. Try again.", "warn");
      } else {
        setStatus(`Login failed (HTTP ${response.status}).`, "warn");
      }
      return;
    }

    setStatus("Authenticated...");
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get("returnTo") || "/";
    window.location.href = returnTo;
  } catch {
    setStatus("Network error. Check your connection.", "warn");
  } finally {
    loginBtn.disabled = false;
  }
});
