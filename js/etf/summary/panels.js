document.addEventListener("click", event => {
	const button = event.target.closest(".etf-panel-button");

	if (!button) return;

	const card = button.closest(".etf-card");
	const panelName = button.dataset.panel;
	const panel = card.querySelector(`[data-panel-content="${panelName}"]`);

	if (!panel) return;

	const wasOpen = !panel.classList.contains("hidden");

	card.querySelectorAll(".country-panel").forEach(panel => {
		panel.classList.add("hidden");
	});

	card.querySelectorAll(".etf-panel-button").forEach(button => {
		button.classList.remove("active");
		resetPanelButtonText(button);
	});

	if (!wasOpen) {
		panel.classList.remove("hidden");
		button.classList.add("active");
		button.textContent = getHideText(panelName);
	}

	if (typeof updateEtfDragAreaHeight === "function") {
		setTimeout(updateEtfDragAreaHeight, 0);
	}
});

function resetPanelButtonText(button) {
	if (button.dataset.panel === "countries") {
		button.textContent = "Rodyti šalis";
	}

	if (button.dataset.panel === "continents") {
		button.textContent = "Rodyti žemynus";
	}

	if (button.dataset.panel === "sectors") {
		button.textContent = "Rodyti sektorius";
	}

	if (button.dataset.panel === "topHoldings") {
		button.textContent = "Rodyti TOP10 pozicijas";
	}
}

function getHideText(panelName) {
	if (panelName === "countries") return "Slėpti šalis";
	if (panelName === "continents") return "Slėpti žemynus";
	if (panelName === "sectors") return "Slėpti sektorius";
	if (panelName === "topHoldings") return "Slėpti TOP10 pozicijas";

	return "Slėpti";
}