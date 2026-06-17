function getChartAccounts() {
  const colors = [
    '#3b82f6',
    '#ef4444',
    '#f97316',
    '#14b8a6',
    '#8b5cf6',
    '#ec4899',
    '#22c55e',
    '#0ea5e9'
  ];

  return Array.from(document.querySelectorAll('.account-card')).map((card, index) => {
    const prefix = card.dataset.prefix;
    const history = calculate(prefix);
    const yearly = [];
    for (let i = 11; i < history.length; i += 12) {
      yearly.push(history[i]);
    }
    const name = card.querySelector('h4')?.textContent || `${prefix} sąskaita`;
    return {
      prefix,
      name,
      history,
      yearly,
      color: colors[index % colors.length]
    };
  });
}

function drawGraph() {
  const accounts = getChartAccounts();
  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const allValues = accounts.flatMap(account => account.yearly);
  const max = Math.max(...allValues, 1);
  const niceMax = Math.ceil(max / 1000) * 1000;
  const steps = Math.max(...accounts.map(account => account.yearly.length), 1);
  const stepX = steps > 1 ? canvas.width / (steps - 1) : canvas.width;

  ctx.strokeStyle = '#ddd';
  ctx.fillStyle = '#0f172a';
  ctx.font = '12px Arial';

  for (let i = 0; i <= 5; i++) {
    const yVal = niceMax / 5 * i;
    const y = canvas.height - (i / 5) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    if (yVal !== 0) {
      ctx.fillText(Math.round(yVal) + ' €', 8, y - 6);
    }
  }

  for (let y = 0; y < steps; y++) {
    const x = y * stepX;
    ctx.fillText(y + 1, x, canvas.height - 6);
  }

  accounts.forEach((account, index) => {
    const labelY = 20 + index * 20;
    ctx.fillStyle = account.color;
    ctx.fillText(`● ${account.prefix}`, 20, labelY);
  });

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

  accounts.forEach(account => draw(account.yearly, account.color));
}