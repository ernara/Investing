// Dynamic account add/remove has been disabled for now.
// The page currently supports the static two account cards only.

function registerCardEvents(card) {
  card.querySelectorAll('input').forEach(input => input.addEventListener('input', renderAll));
}

function initializeAccounts() {
  document.querySelectorAll('.account-card').forEach(registerCardEvents);
  renderAll();
}

document.addEventListener('DOMContentLoaded', initializeAccounts);

function render(prefix, outputId) {
  const metaiEl = document.getElementById('metai' + prefix);
  const menesineImokaEl = document.getElementById('menesineImoka' + prefix);
  const metineGrazaEl = document.getElementById('metineGraza' + prefix);
  const valdymoMokestisEl = document.getElementById('valdymoMokestis' + prefix);
  const saugojimoMokestisEl = document.getElementById('saugojimoMokestis' + prefix);
  const pirkimoMokestisEl = document.getElementById('pirkimoMokestis' + prefix);

  if (!metaiEl || !menesineImokaEl || !metineGrazaEl || !valdymoMokestisEl || !saugojimoMokestisEl || !pirkimoMokestisEl) {
    console.warn('Missing input elements for prefix:', prefix);
    return;
  }

  const metai = parseInt(metaiEl.value) || 0;
  const output = document.getElementById(outputId);
  if (!output) return;

  output.innerHTML = '';
  const history = typeof calculate === 'function' ? calculate(prefix) : [];

  for (let y = 0; y < metai; y++) {
    const monthsContainer = document.createElement('div');
    monthsContainer.className = 'months';

    for (let m = 0; m < 12; m++) {
      const idx = y * 12 + m;
      const value = history[idx] || 0;

      const row = document.createElement('div');
      row.className = 'month';
      row.innerHTML = `
        <div>Mėnuo ${m + 1}</div>
        <div>${value.toFixed(2)} €</div>
      `;

      monthsContainer.appendChild(row);
    }

    const box = document.createElement('div');
    box.className = 'year';

    const summary = document.createElement('div');
    summary.className = 'summary';
    const yearEnd = history[(y + 1) * 12 - 1] || 0;
    summary.innerHTML = `
      <div>Metai ${y + 1}</div>
      <div>${yearEnd.toFixed(2)} €</div>
    `;

    box.appendChild(summary);
    box.appendChild(monthsContainer);

    box.onclick = () => {
      monthsContainer.style.display = monthsContainer.style.display === 'block' ? 'none' : 'block';
    };

    output.appendChild(box);
  }
}

function renderAll() {
  document.querySelectorAll('.account-card').forEach(card => {
    const prefix = card.dataset.prefix;
    render(prefix, `output${prefix}`);
  });

  if (typeof drawGraph === 'function') {
    drawGraph();
  }
}