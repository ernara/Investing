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

function renderTopSummary(summaries) {
	let box = document.getElementById("comparison-summary");

	if (!box) {
		box = document.createElement("div");
		box.id = "comparison-summary";
		document.getElementById("inputs").before(box);
	}

	const first = summaries[0];
	const second = summaries[1];

	const difference = Math.abs(first.summary.final - second.summary.final);
	const winner = first.summary.final > second.summary.final ? first.name : second.name;

	box.innerHTML = `
		<h2>Investavimo palyginimas</h2>
		<p>${winner} laimi per ${money(difference)}</p>
	`;
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

	renderTopSummary(summaries);
}

document.addEventListener("input", () => {
	renderResults();
	drawChart();
});

renderResults();