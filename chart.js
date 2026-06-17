function drawGraph() {
  graphA = calculate("A");
  graphB = calculate("B");

  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const max = Math.max(...graphA, ...graphB, 1);
  const niceMax = Math.ceil(max / 1000) * 1000;
  const steps = Math.max(graphA.length, graphB.length, 1);
  const stepX = steps > 1 ? canvas.width / (steps - 1) : canvas.width;
  const years = Math.max(Math.ceil(graphA.length / 12), Math.ceil(graphB.length / 12), 1);

  ctx.strokeStyle = "#ddd";
  ctx.fillStyle = "#000";
  ctx.font = "12px Arial";

  for (let i = 0; i <= 5; i++) {
    const yVal = niceMax / 5 * i;
    const y = canvas.height - (i / 5) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();

    ctx.fillText(Math.round(yVal) + " €", 5, y - 2);
  }

  // Draw x-axis labels per year (skip monthly labels)
  for (let y = 0; y < years; y++) {
    const x = Math.min(y * 12 * stepX, canvas.width - 10);
    ctx.fillText(y + 1, x, canvas.height - 5);
  }

  ctx.fillStyle = "blue";
  ctx.fillText("● Investicija A", 20, 20);

  ctx.fillStyle = "red";
  ctx.fillText("● Investicija B", 20, 40);

  function draw(data, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    data.forEach((v, i) => {
      const x = i * stepX;
      const y = canvas.height - (v / max) * canvas.height;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }

  draw(graphA, "blue");
  draw(graphB, "red");
}