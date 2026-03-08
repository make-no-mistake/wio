const tagValue = document.getElementById("tagValue");
const copyBtn = document.getElementById("copyBtn");
const status = document.getElementById("status");

async function generateTag() {
  status.textContent = "Creating your user tag…";
  copyBtn.disabled = true;
  tagValue.textContent = "Generating…";

  try {
    const response = await fetch("/register", { method: "POST" });
    if (!response.ok) {
      throw new Error(`Server responded ${response.status}`);
    }
    const data = await response.json();
    if (!data?.tag) {
      throw new Error("Invalid response");
    }
    tagValue.textContent = data.tag;
    copyBtn.disabled = false;
    status.textContent = "Ready.";
  } catch {
    tagValue.textContent = "Error";
    status.textContent = "Please refresh.";
    copyBtn.disabled = true;
  }
}

copyBtn.addEventListener("click", async () => {
  const tag = tagValue.textContent;
  if (!tag || tag === "Generating…" || tag === "Error") {
    return;
  }
  try {
    await navigator.clipboard.writeText(tag);
    status.textContent = "Copied to clipboard.";
  } catch {
    status.textContent = "Copy failed. Select and copy manually.";
  }
});

generateTag();
