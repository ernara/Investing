const contentWidthStorageKey = "content-width";

function setContentWidth(width) {
	const safeWidth = Math.max(45, Math.min(95, width));

	document.documentElement.style.setProperty("--content-width", safeWidth + "vw");
	localStorage.setItem(contentWidthStorageKey, safeWidth);
    updateWidthInputs(safeWidth);

	if (typeof chart !== "undefined" && chart) {
		chart.resize();
	}
}

function loadContentWidth() {
	const savedWidth = localStorage.getItem(contentWidthStorageKey);

	if (!savedWidth) return;

	setContentWidth(+savedWidth);
}

function createWidthHandle() {
	const chartBox = document.getElementById("chart");
	const handle = document.createElement("div");

	handle.id = "width-handle";
	handle.title = "Tempkite, kad pakeistumėte plotį";

	chartBox.appendChild(handle);

	let dragging = false;

	handle.addEventListener("mousedown", e => {
		e.preventDefault();
		dragging = true;
		document.body.classList.add("resizing-width");
	});

	document.addEventListener("mousemove", e => {
		if (!dragging) return;

		const chartLeft = chartBox.getBoundingClientRect().left;
		const newWidth = (e.clientX - chartLeft) / window.innerWidth * 100;

		setContentWidth(newWidth);
	});

	document.addEventListener("mouseup", () => {
		dragging = false;
		document.body.classList.remove("resizing-width");
	});
}

function updateWidthInputs(width) {
	document.querySelectorAll(".width-input").forEach(input => {
		input.value = Math.round(width);
	});
}

function getContentWidth() {
	return Math.round(localStorage.getItem(contentWidthStorageKey) || 70);
}

loadContentWidth();
createWidthHandle();