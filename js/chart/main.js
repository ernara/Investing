let chart;

function drawChart() {
	if (chart) chart.destroy();

	chart = new Chart(document.getElementById("c"), {
		type: "line",
		data: {
			labels: getChartAxis(),
			datasets: getChartData()
		},
		options: getChartOptions()
	});
}

document.addEventListener("input", drawChart);
drawChart();