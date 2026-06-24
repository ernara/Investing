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
	const maxLength = Math.max(
		...accounts.map(prefix => calculateProfit(prefix).length)
	);

	const years = Math.floor((maxLength - 1) / 12);

	return Array.from(
		{ length: years + 1 },
		(_, i) => i
	);
}