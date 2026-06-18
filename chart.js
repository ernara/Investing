let chart;

function drawChart() {
	const data = accounts.map(prefix => calculateProfit(prefix));
	const months = Math.max(...data.map(x => x.length));

	const labels = Array.from(
	{ length: data[0].filter((_, i) => i === 0 || i % 12 === 0).length },
	(_, i) => i
);

	const datasets = data.map((values, i) => ({
	label: accounts[i],
	data: values.filter((_, index) => index === 0 || index % 12 === 0)
}));

	if (chart) chart.destroy();

	chart = new Chart(document.getElementById("c"), {
		type: "line",
		data: { labels, datasets },
		options: {
			responsive: true,
			maintainAspectRatio: false,
			interaction: {
			mode: "index",
			intersect: false
	}
}
	});
}

document.addEventListener("input", drawChart);
drawChart();