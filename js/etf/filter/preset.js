function setupEtfPresetButton() {
	const button = document.getElementById("applyEtfDefaultPreset");

	if (!button) return;

	button.addEventListener("click", () => {
		activeEtfFilters = getMyEtfPresetFilters();

		saveEtfFilters();
		setEtfShareClassMode("combined");

		if (typeof renderEtfsByShareClassMode === "function") {
			renderEtfsByShareClassMode();
			return;
		}

		renderEtfFilters(activeEtfFilters);
		renderCurrentFilteredEtfs();
	});
}

function getMyEtfPresetFilters() {
	return {
		...structuredClone(defaultEtfFilters),
		nameText: "",
		includeSynthetic: false,
		capitalBillions: {
			...defaultEtfFilters.capitalBillions,
			min: 1
		},
		terPercent: {
			...defaultEtfFilters.terPercent,
			max: 0.07
		},
		continentCount: {
			...defaultEtfFilters.continentCount,
			min: 4,
			max: 6
		},
		companies: {
			...defaultEtfFilters.companies,
			min: 1300
		},
		countryCount: {
			...defaultEtfFilters.countryCount,
			min: 23
		},
		goodCountryWeightPercent: {
			...defaultEtfFilters.goodCountryWeightPercent,
			min: 88
		},
		topHoldingsWeightPercent: {
			...defaultEtfFilters.topHoldingsWeightPercent,
			max: 28.5
		},
		maxCountryWeightPercent: {
			...defaultEtfFilters.maxCountryWeightPercent,
			max: 73
		}
	};
}