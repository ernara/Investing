const moneyModeStorageKey = "money-mode";
let moneyMode = localStorage.getItem(moneyModeStorageKey) || "compact";

function formatMoney(value) {
	if (moneyMode === "full") {
		return value.toFixed(2) + " €";
	}

	if (value >= 1000000) return (value / 1000000).toFixed(1) + "M €";
	if (value >= 1000) return (value / 1000).toFixed(0) + "k €";

	return value.toFixed(2) + " €";
}

function getMoneyModeLabel() {
	return moneyMode === "full" ? "123" : "K/M";
}

function updateMoneyModeButtons() {
	document.querySelectorAll(".money-mode-button").forEach(button => {
		button.textContent = getMoneyModeLabel();
	});

	const menuIcon = document.getElementById("money-mode-menu-icon");

	if (menuIcon) {
		menuIcon.textContent = getMoneyModeLabel();
	}
}

function toggleMoneyMode() {
	moneyMode = moneyMode === "full" ? "compact" : "full";
	localStorage.setItem(moneyModeStorageKey, moneyMode);

	updateMoneyModeButtons();
	renderResults();
	drawChart();
	updateMoneyModeButtons();
}