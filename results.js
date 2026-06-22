function money(value) {
	return value.toFixed(2) + " €";
}

function getInput(prefix, id) {
	return +document.getElementById(id + prefix).value || 0;
}

function getSummary(prefix, history) {
	const final = history[history.length - 1];
	const months = history.length - 1;
	const years = months / 12;

	const invested = getInput(prefix, "pradineInvesticija") + getInput(prefix, "menesineImoka") * months;
	const profit = final - invested;
	const profitPercent = invested === 0 ? 0 : profit / invested * 100;
	const yearlyProfitPercent = years === 0 ? 0 : profitPercent / years;

	return {
		final,
		invested,
		profit,
		profitPercent,
		yearlyProfitPercent
	};
}

function renderResults() {
	const summaries = [];

	accounts.forEach(prefix => {
		const history = calculateProfit(prefix);
		const output = document.getElementById("output" + prefix);
		const summary = getSummary(prefix, history);
		const name = titles[prefix] || prefix;

		summaries.push({ name, summary });

		output.innerHTML = `
			<div class="summary-card">
				<div>
					<span>Investuota</span>
					<strong>${money(summary.invested)}</strong>
				</div>
				<div>
					<span>Galutinis kapitalas</span>
					<strong>${money(summary.final)}</strong>
				</div>
				<div>
					<span>Pelnas</span>
					<strong>${money(summary.profit)}</strong>
				</div>
				<div>
					<span>Bendra grąža</span>
					<strong>${summary.profitPercent.toFixed(2)} %</strong>
				</div>
				<div>
					<span>Vidutinė metinė grąža</span>
					<strong>${summary.yearlyProfitPercent.toFixed(2)} %</strong>
				</div>
				<div class="summary-actions">
					<button type="button" onclick="resetDefaults('${prefix}')" title="Atstatyti numatytas reikšmes">↺</button>
					<button type="button" onclick="resetToZero('${prefix}')" title="Viską nustatyti į 0">0</button>
					<button title="Grįžti atgal">↶</button>
					<button title="Eiti pirmyn">↷</button>
					<button type="button" onclick="downloadCSV('${prefix}')" class="excel-button" title="Atsisiųsti Excel">XLS</button>
				</div>
			</div>
		`;

		const toggle = document.createElement("button");
		toggle.className = "years-toggle";
		toggle.textContent = "Rodyti metus";

		const years = document.createElement("div");
		years.className = "years-list";

		for (let y = 1; y < history.length / 12; y++) {
			const year = document.createElement("div");
			year.className = "year";

			year.innerHTML = `
				<span>Metai ${y}</span>
				<span>${money(history[y * 12])}</span>
			`;

			const months = document.createElement("div");
			months.className = "months";

			for (let m = 1; m <= 12; m++) {
				const index = (y - 1) * 12 + m;

				months.innerHTML += `
					<div class="month">
						<span>Mėnuo ${m}</span>
						<span>${money(history[index])}</span>
					</div>
				`;
			}

			year.onclick = () => months.classList.toggle("show");

			years.append(year, months);
		}

		toggle.onclick = () => {
			years.classList.toggle("show");
			toggle.textContent = years.classList.contains("show") ? "Slėpti metus" : "Rodyti metus";
		};

		output.append(toggle, years);
	});

}

function resetDefaults(prefix) {
	names.forEach(([id], i) => {
		document.getElementById(id + prefix).value = defaultValues[prefix][i];
	});

	renderResults();
	drawChart();
}

function resetToZero(prefix) {
	names.forEach(([id]) => {
		document.getElementById(id + prefix).value = 0;
	});

	renderResults();
	drawChart();
}

function downloadCSV(prefix) {
	const history = calculateProfit(prefix);
	const name = titles[prefix] || prefix;

	const rows = [
		["Sąskaita", name],
		[],
		["Mėnuo", "Metai", "Kapitalas"]
	];

	history.forEach((value, month) => {
		rows.push([
			month,
			(month / 12).toFixed(2),
			value.toFixed(2)
		]);
	});

	const csv = rows.map(row => row.join(";")).join("\n");
	const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });

	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `${name}.csv`;
	link.click();

	URL.revokeObjectURL(link.href);
}

document.addEventListener("input", () => {
	renderResults();
	drawChart();
});

renderResults();