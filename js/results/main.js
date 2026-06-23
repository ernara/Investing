function renderYears(history) {
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

	return years;
}

function renderResults() {
	accounts.forEach(prefix => {
		const history = calculateProfit(prefix);
		const output = document.getElementById("output" + prefix);
		const summary = getSummary(prefix, history);

		output.innerHTML = renderSummaryCard(summary, prefix);

		const toggle = document.createElement("button");
		toggle.className = "years-toggle";
		toggle.textContent = "Rodyti metus";

		const years = renderYears(history);

		toggle.onclick = () => {
			years.classList.toggle("show");
			toggle.textContent = years.classList.contains("show") ? "Slėpti metus" : "Rodyti metus";
		};

		output.append(toggle, years);
	});
}

document.addEventListener("input", () => {
	renderResults();
	drawChart();
});

renderResults();