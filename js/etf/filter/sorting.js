const etfSortModeStorageKey = "etfSortMode";

function getEtfSortMode() {
	return localStorage.getItem(etfSortModeStorageKey) || "terAsc";
}

function setEtfSortMode(mode) {
	localStorage.setItem(etfSortModeStorageKey, mode);
}

function setupEtfSortSelect() {
	const select = document.getElementById("etfSortModeSelect");

	if (!select) return;

	const savedSortMode = getEtfSortMode();
	const optionExists = [...select.options].some(option => option.value === savedSortMode);

	if (!optionExists) {
		setEtfSortMode("terAsc");
	}

	select.value = optionExists ? savedSortMode : "terAsc";

	select.addEventListener("change", () => {
		setEtfSortMode(select.value);
		renderCurrentFilteredEtfs();
	});
}

function sortFilteredEtfs(etfs) {
	const mode = getEtfSortMode();

	return [...etfs].sort((a, b) => {
		if (mode === "terAsc") return compareNumbers(a.terPercent, b.terPercent, "asc");
		if (mode === "terDesc") return compareNumbers(a.terPercent, b.terPercent, "desc");

		if (mode === "capitalAsc") return compareNumbers(getEtfCapitalBillions(a), getEtfCapitalBillions(b), "asc");
		if (mode === "capitalDesc") return compareNumbers(getEtfCapitalBillions(a), getEtfCapitalBillions(b), "desc");

		if (mode === "companiesAsc") return compareNumbers(a.totalCompanies, b.totalCompanies, "asc");
		if (mode === "companiesDesc") return compareNumbers(a.totalCompanies, b.totalCompanies, "desc");

		if (mode === "countryCountAsc") return compareNumbers(getEtfCountryCount(a), getEtfCountryCount(b), "asc");
		if (mode === "countryCountDesc") return compareNumbers(getEtfCountryCount(a), getEtfCountryCount(b), "desc");

		if (mode === "topHoldingsAsc") {
			return compareNumbers(a.topHoldingsTotalWeightPercent, b.topHoldingsTotalWeightPercent, "asc");
		}

		if (mode === "topHoldingsDesc") {
			return compareNumbers(a.topHoldingsTotalWeightPercent, b.topHoldingsTotalWeightPercent, "desc");
		}

		return compareNumbers(a.terPercent, b.terPercent, "asc");
	});
}

function compareNumbers(a, b, direction) {
	const numberA = parseEtfNumber(a);
	const numberB = parseEtfNumber(b);

	const aMissing = numberA === null;
	const bMissing = numberB === null;

	if (aMissing && bMissing) return 0;
	if (aMissing) return 1;
	if (bMissing) return -1;

	if (direction === "desc") return numberB - numberA;

	return numberA - numberB;
}