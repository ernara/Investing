document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll("input")
    .forEach(i => i.addEventListener("input", renderAll));

  renderAll();

  const canvas = document.getElementById("chart");
  const tooltip = document.getElementById("tooltip");

  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const accounts = Array.from(document.querySelectorAll('.account-card')).map(card => {
      const prefix = card.dataset.prefix;
      const history = calculate(prefix);
      return { prefix, history };
    });

    const years = Math.max(...accounts.map(account => Math.ceil(account.history.length / 12)), 0);
    if (years === 0) return;

    const stepX = canvas.width / Math.max(years - 1, 1);
    const idx = Math.round(x / stepX);

    if (idx < 0 || idx >= years) {
      tooltip.style.display = "none";
      return;
    }

    const lines = accounts.map(account => {
      const value = account.history[idx * 12 + 11] ?? account.history[account.history.length - 1] ?? 0;
      return `🔹 ${account.prefix}: ${typeof value === 'number' ? value.toFixed(2) : '-'} €`;
    });

    tooltip.innerHTML =
      "Metai " + (idx + 1) + "<br>" +
      lines.join("<br>");

    tooltip.style.left = (e.pageX + 15) + "px";
    tooltip.style.top = (e.pageY + 15) + "px";
    tooltip.style.display = "block";
  });

  canvas.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });

});