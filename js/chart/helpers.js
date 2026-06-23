function formatMoney(value) {
	if (value >= 1000000) return (value / 1000000).toFixed(1) + "M €";
	if (value >= 1000) return (value / 1000).toFixed(0) + "k €";
	return value.toFixed(2) + " €";
}

function getChartData() {
	const data = accounts.map(prefix => calculateProfit(prefix));

	return data.map((values, i) => ({
		label: titles[accounts[i]],
		data: values.filter((_, index) => index === 0 || index % 12 === 0),
		pointRadius: 0,
		pointHoverRadius: 0
	}));
}

function getChartAxis() {
	const yearly = calculateProfit(accounts[0])
		.filter((_, i) => i === 0 || i % 12 === 0);

	return Array.from(
		{ length: yearly.length },
		(_, i) => i
	);
}