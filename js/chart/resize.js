const contentWidthStorageKey = "content-width";
const chartHeightStorageKey = "chart-height";

function setContentWidth(width) {
	const safeWidth = Math.max(35, Math.min(95, width));

	document.documentElement.style.setProperty("--content-width", safeWidth + "vw");
	localStorage.setItem(contentWidthStorageKey, safeWidth);
	updateWidthInputs(safeWidth);

	if (typeof chart !== "undefined" && chart) {
		chart.resize();
	}
}

function setChartHeight(height) {
	const safeHeight = Math.max(35, Math.min(90, height));

	document.documentElement.style.setProperty("--chart-height", safeHeight + "vh");
	localStorage.setItem(chartHeightStorageKey, safeHeight);

	if (typeof chart !== "undefined" && chart) {
		chart.resize();
	}
}

function loadContentWidth() {
	const savedWidth = localStorage.getItem(contentWidthStorageKey);

	if (!savedWidth) return;

	setContentWidth(+savedWidth);
}

function loadChartHeight() {
	const savedHeight = localStorage.getItem(chartHeightStorageKey);

	if (!savedHeight) return;

	setChartHeight(+savedHeight);
}

function updateWidthInputs(width) {
	document.querySelectorAll(".width-input").forEach(input => {
		input.value = Math.round(width);
	});
}

function getContentWidth() {
	return Math.round(localStorage.getItem(contentWidthStorageKey) || 70);
}

function createSizeHandle() {
	const chartBox = document.getElementById("chart");
	const handle = document.createElement("div");

	handle.id = "size-handle";
	chartBox.appendChild(handle);

	let dragging = false;

	handle.addEventListener("pointerdown", e => {
		e.preventDefault();
		handle.setPointerCapture(e.pointerId);

		dragging = true;
		document.body.classList.add("resizing-size");
	});

	document.addEventListener("pointermove", e => {
		if (!dragging) return;

		const rect = chartBox.getBoundingClientRect();

		setContentWidth((e.clientX - rect.left) / window.innerWidth * 100);
		setChartHeight((e.clientY - rect.top) / window.innerHeight * 100);
	});

	document.addEventListener("pointerup", () => {
		dragging = false;
		document.body.classList.remove("resizing-size");
	});

	document.addEventListener("pointercancel", () => {
	dragging = false;
	document.body.classList.remove("resizing-size");
});
}

loadContentWidth();
loadChartHeight();
createSizeHandle();