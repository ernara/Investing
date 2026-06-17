document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll("input")
    .forEach(i => i.addEventListener("input", renderAll));

  renderAll();

  const canvas = document.getElementById("chart");
  const tooltip = document.getElementById("tooltip");

  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const years = Math.max(graphA.length, graphB.length);
    if (years === 0) return;

    const stepX = canvas.width / Math.max(years - 1, 1);
    const idx = Math.round(x / stepX);

    if (idx < 0 || idx >= years) {
      tooltip.style.display = "none";
      return;
    }

    tooltip.innerHTML =
      "Metai " + (idx + 1) + "<br>" +
      "🔵 A: " + (graphA[idx]?.toFixed(2) ?? "-") + " €<br>" +
      "🔴 B: " + (graphB[idx]?.toFixed(2) ?? "-") + " €";

    tooltip.style.left = (e.pageX + 15) + "px";
    tooltip.style.top = (e.pageY + 15) + "px";
    tooltip.style.display = "block";
  });

  canvas.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });

});