/**
 * AsliJob Extension — Content Script
 * Injects a non-intrusive "Check with AsliJob" button on selected text on LinkedIn, Naukri, and Gmail
 */
(function () {
  let floatingBtn = null;

  function createFloatingButton() {
    if (floatingBtn) return floatingBtn;

    floatingBtn = document.createElement("div");
    floatingBtn.id = "aslijob-floating-check-btn";
    floatingBtn.innerHTML = "🛡️ Check with AsliJob";
    floatingBtn.style.cssText = `
      position: absolute;
      z-index: 9999999;
      display: none;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #0284c7;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      font-weight: 700;
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      user-select: none;
      transition: transform 0.1s ease;
    `;

    floatingBtn.addEventListener("mouseenter", () => {
      floatingBtn.style.transform = "scale(1.05)";
    });
    floatingBtn.addEventListener("mouseleave", () => {
      floatingBtn.style.transform = "scale(1)";
    });

    floatingBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const selectedText = window.getSelection()?.toString().trim();
      if (!selectedText) return;

      floatingBtn.innerHTML = "⏳ Checking...";
      fetch("https://aslijob.vercel.app/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedText,
          channel: "extension"
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.checkId) {
            window.open(`https://aslijob.vercel.app/r/${data.checkId}?ref=ext`, "_blank");
          }
          hideButton();
        })
        .catch(() => {
          window.open(`https://aslijob.vercel.app/?text=${encodeURIComponent(selectedText)}`, "_blank");
          hideButton();
        });
    });

    document.body.appendChild(floatingBtn);
    return floatingBtn;
  }

  function hideButton() {
    if (floatingBtn) {
      floatingBtn.style.display = "none";
      floatingBtn.innerHTML = "🛡️ Check with AsliJob";
    }
  }

  document.addEventListener("mouseup", (e) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || text.length < 15) {
      hideButton();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const btn = createFloatingButton();

    btn.style.left = `${window.scrollX + rect.left + rect.width / 2 - 60}px`;
    btn.style.top = `${window.scrollY + rect.bottom + 8}px`;
    btn.style.display = "flex";
  });

  document.addEventListener("mousedown", (e) => {
    if (floatingBtn && !floatingBtn.contains(e.target)) {
      hideButton();
    }
  });
})();

