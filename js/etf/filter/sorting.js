const etfSortModeStorageKey = "etfSortMode";

function getEtfSortMode() {
	return localStorage.getItem(etfSortModeStorageKey) || "terAsc";
}

function setEtfSortMode(mode) {
	localStorage.setItem(etfSortModeStorageKey, mode);

	const select = document.getElementById("etfSortModeSelect");

	if (select) {
		select.value = mode;
	}
}

function setupEtfSortSelect() {
	const select = document.getElementById("etfSortModeSelect");

	if (!select) return;

	select.value = getEtfSortMode();

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

		if (mode === "otherCountriesAsc") {
			return compareNumbers(getOtherCountriesWeightPercent(a), getOtherCountriesWeightPercent(b), "asc");
		}

		if (mode === "otherCountriesDesc") {
			return compareNumbers(getOtherCountriesWeightPercent(a), getOtherCountriesWeightPercent(b), "desc");
		}

		return compareNumbers(a.terPercent, b.terPercent, "asc");
	});
}

function compareNumbers(valueA, valueB, direction) {
	const numberA = parseEtfNumber(valueA);
	const numberB = parseEtfNumber(valueB);

	if (numberA === null && numberB === null) return 0;
	if (numberA === null) return 1;
	if (numberB === null) return -1;

	if (direction === "desc") {
		return numberB - numberA;
	}

	return numberA - numberB;
}