function renderResults() {
	accounts.forEach(prefix => {
		const history = calculateProfit(prefix);
		const output = document.getElementById("output" + prefix);

		output.innerHTML = "";

		for (let y = 1; y < history.length / 12; y++) {
			const year = document.createElement("div");
			year.className = "year";

			year.innerHTML = `
				<span>Metai ${y}</span>
				<span>${history[y * 12].toFixed(2)} €</span>
			`;

			const months = document.createElement("div");
			months.className = "months";

			for (let m = 1; m <= 12; m++) {
				const index = (y - 1) * 12 + m;

				months.innerHTML += `
					<div class="month">
						<span>Mėnuo ${m}</span>
						<span>${history[index].toFixed(2)} €</span>
					</div>
				`;
			}

			year.onclick = () => months.classList.toggle("show");

			output.append(year, months);
		}
	});
}

document.addEventListener("input", () => {
	renderResults();
	drawChart();
});

renderResults();