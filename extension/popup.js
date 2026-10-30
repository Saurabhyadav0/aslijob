const API_BASE = "https://aslijob.vercel.app";

document.getElementById("checkBtn").addEventListener("click", async () => {
  const text = document.getElementById("text").value.trim();
  const btn = document.getElementById("checkBtn");
  const resultDiv = document.getElementById("result");

  if (!text) return;

  btn.disabled = true;
  btn.innerText = "Checking...";
  resultDiv.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, channel: "extension" })
    });
    const data = await res.json();

    resultDiv.className = `result ${data.verdict}`;
    resultDiv.style.display = "block";
    resultDiv.innerHTML = `
      <strong>Verdict: ${data.verdict.toUpperCase()} (${Math.round(data.confidence * 100)}%)</strong><br>
      ${data.reasons?.[0]?.text ?? "Analysis complete"}<br>
      <a href="${API_BASE}/r/${data.checkId}?ref=ext" target="_blank" style="color: inherit; text-decoration: underline; margin-top: 4px; display: inline-block;">
        View Full Card & Report ↗
      </a>
    `;
  } catch (err) {
    resultDiv.className = "result suspicious";
    resultDiv.style.display = "block";
    resultDiv.innerText = "Check request failed. Opening AsliJob Web...";
    window.open(`${API_BASE}/?text=${encodeURIComponent(text)}`, "_blank");
  } finally {
    btn.disabled = false;
    btn.innerText = "🔍 Check Offer";
  }
});

