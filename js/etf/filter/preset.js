function getMyEtfPresetFilters() {
	return {
		...structuredClone(defaultEtfFilters),
		nameText: "",
		includeSynthetic: false,
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
			min: 50
		},
		continentCount: {
			...defaultEtfFilters.continentCount,
			min: 2
		},
		countryCount: {
			...defaultEtfFilters.countryCount,
			min: 5
		},
		goodCountryWeightPercent: {
			...defaultEtfFilters.goodCountryWeightPercent,
			min: 80
		},
		topHoldingsWeightPercent: {
			...defaultEtfFilters.topHoldingsWeightPercent,
			max: 50
		},
		maxCountryWeightPercent: {
			...defaultEtfFilters.maxCountryWeightPercent,
			max: 50
		}
	};
}


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

