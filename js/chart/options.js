function getChartOptions() {
	return {
		responsive: true,
		maintainAspectRatio: false,

		scales: {
			x: {
				title: {
					display: true,
					text: "Metai"
				},
				ticks: {
					autoSkip: false
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