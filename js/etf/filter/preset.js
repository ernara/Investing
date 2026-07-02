function setupEtfPresetButton() {
	const button = document.getElementById("applyEtfDefaultPreset");

	if (!button) return;

	button.addEventListener("click", () => {
		activeEtfFilters = getMyEtfPresetFilters();

		saveEtfFilters();
		renderEtfFilters(activeEtfFilters);
		renderCurrentFilteredEtfs();
	});
}

function getMyEtfPresetFilters() {
	return {
		...structuredClone(defaultEtfFilters),
		nameText: "",
		capitalBillions: {
			...defaultEtfFilters.capitalBillions,
			min: 0.1
		},
		terPercent: {
			...defaultEtfFilters.terPercent,
			max: 0.1
		},
		companies: {
			...defaultEtfFilters.companies,
			min: 100
		},
		countryCount: {
			...defaultEtfFilters.countryCount,
			min: 10
		},
		topHoldingsWeightPercent: {
			...defaultEtfFilters.topHoldingsWeightPercent,
			max: 33.34
		},
		maxCountryWeightPercent: {
			...defaultEtfFilters.maxCountryWeightPercent,
			max: 33.34
		}
	};
}