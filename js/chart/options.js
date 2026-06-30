function formatChartAxisMoney(value) {
	return formatMoney(value).replace(/[.,]00(?= €$)/, "");
}

function getChartOptions() {
	const isDark = document.body.classList.contains("dark");
	const chartTextColor = isDark ? "#fafafa" : "#111827";
	const chartGridColor = isDark ? "#374151" : "#ddd";

	return {
		responsive: true,
		maintainAspectRatio: false,

		scales: {
			x: {
				title: {
					display: true,
					text: "Metai",
					color: chartTextColor
				},
				ticks: {
					autoSkip: false,
					color: chartTextColor
				},
				grid: {
					color: chartGridColor
				}
			},
			y: {
				title: {
					display: true,
					text: "Kapitalas",
					color: chartTextColor
				},
				ticks: {
					color: chartTextColor,
					callback: value => formatChartAxisMoney(value)
				},
				grid: {
					color: chartGridColor
				}
			}
		},

		interaction: {
			mode: "index",
			intersect: false
		},

		plugins: {
			legend: {
				labels: {
					color: chartTextColor
				}
			},
			tooltip: {
				bodyFont: {
					family: "monospace"
				},
				callbacks: {
					title: items =>
						items[0].dataIndex === 0
							? "Pradžia"
							: `Metai ${items[0].dataIndex}`,

					label: item => {
						const name = item.dataset.label;
						const value = formatMoney(item.raw);

						return (name + ":").padEnd(14) + value;
					}
				}
			}
		}
	};
}