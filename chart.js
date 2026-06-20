let chart;

function drawChart() {

	if (chart) chart.destroy();

	chart = new Chart(document.getElementById("c"), {
		type: "line",
		data: {
			labels: getAxis(),
			datasets: getData()
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			interaction: {
				mode: "index",
				intersect: false
			},
			plugins: {
				tooltip: {
					callbacks: {
						title: items =>
							items[0].dataIndex === 0
								? "Pradžia"
								: `Metai ${items[0].dataIndex}`
					}
				}
			}
		}
	});
}

function getData() {
	const data = accounts.map(prefix => calculateProfit(prefix));

	return data.map((values, i) => ({
		label: accounts[i],
		data: values.filter((_, index) => index === 0 || index % 12 === 0)
	}));
}

function getAxis() {
	const yearly = calculateProfit(accounts[0])
		.filter((_, i) => i === 0 || i % 12 === 0);

	return Array.from(
		{ length: yearly.length },
		(_, i) => i
	);
}

document.addEventListener("input", drawChart);
drawChart();