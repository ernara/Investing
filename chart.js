let chart;

function formatMoney(value) {
	if (value >= 1000000) return (value / 1000000).toFixed(1) + "M €";
	if (value >= 1000) return (value / 1000).toFixed(0) + "k €";
	return value.toFixed(2) + " €";
}

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

			scales: {
				x: {
					title: {
						display: true,
						text: "Metai"
					}
				},
				y: {
					title: {
						display: true,
						text: "Kapitalas"
					},
					ticks: {
						callback: value => formatMoney(value)
					}
				}
			},

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
								: `Metai ${items[0].dataIndex}`,

						label: item =>
							`${titles[item.dataset.label] || item.dataset.label}: ${formatMoney(item.raw)}`
					}
				}
			}
		}
	});
}

function getData() {
	const data = accounts.map(prefix => calculateProfit(prefix));

	return data.map((values, i) => ({
		label: titles[accounts[i]],
		data: values.filter((_, index) => index === 0 || index % 12 === 0),
		pointRadius: 0,
		pointHoverRadius: 0
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