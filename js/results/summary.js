function money(value) {
	return formatMoney(value);
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

function renderSummaryCard(summary, prefix) {
	return `
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
			${renderActionButtons(prefix)}
		</div>
	`;
}