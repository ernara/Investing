let draggedFilterPanel = null;
let filterDragOffsetX = 0;
let filterDragOffsetY = 0;

function initEtfFilterDrag() {
	const panel = document.getElementById("etfFilters");
	const handle = panel?.querySelector(".etf-filter-handle");

	if (!panel || !handle) return;

	handle.addEventListener("pointerdown", event => {
		const rect = panel.getBoundingClientRect();

		draggedFilterPanel = panel;
		filterDragOffsetX = event.clientX - rect.left;
		filterDragOffsetY = event.clientY - rect.top;

		panel.style.left = rect.left + "px";
		panel.style.top = rect.top + "px";
		panel.style.right = "auto";
		panel.style.transform = "none";

		document.body.classList.add("dragging-filter");

		event.preventDefault();
	});
}

document.addEventListener("pointermove", event => {
	if (!draggedFilterPanel) return;

	draggedFilterPanel.style.left = event.clientX - filterDragOffsetX + "px";
	draggedFilterPanel.style.top = event.clientY - filterDragOffsetY + "px";

	event.preventDefault();
});

document.addEventListener("pointerup", stopFilterDrag);
document.addEventListener("pointercancel", stopFilterDrag);

function stopFilterDrag() {
	if (!draggedFilterPanel) return;

	document.body.classList.remove("dragging-filter");
	draggedFilterPanel = null;
}