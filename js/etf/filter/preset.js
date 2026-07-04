function setupEtfPresetButton() {
	const bigButton = document.getElementById("applyEtfDefaultPreset");
	const goodButton = document.getElementById("applyGoodEtfPreset");

	if (bigButton) {
		bigButton.addEventListener("click", () => {
			applyEtfPreset(getMyEtfPresetFilters());
		});
	}

	if (goodButton) {
		goodButton.addEventListener("click", () => {
			applyEtfPreset(getGoodEtfPresetFilters());
		});
	}
}

function applyEtfPreset(filters) {
	activeEtfFilters = filters;

	saveEtfFilters();
	setEtfShareClassMode("combined");
	setEtfSortMode("terAsc");

	if (typeof renderEtfsByShareClassMode === "function") {
		renderEtfsByShareClassMode();
		return;
	}

	renderEtfFilters(activeEtfFilters);
	renderCurrentFilteredEtfs();
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
			max: 0.1
		},
		continentCount: {
			...defaultEtfFilters.continentCount,
			min: 3,
			max: 6
		},
		companies: {
			...defaultEtfFilters.companies,
			min: 1000
		},
		countryCount: {
			...defaultEtfFilters.countryCount,
			min: 10
		},
		goodCountryWeightPercent: {
			...defaultEtfFilters.goodCountryWeightPercent,
			min: 80
		},
		topHoldingsWeightPercent: {
			...defaultEtfFilters.topHoldingsWeightPercent,
			max: 33.4
		},
		maxCountryWeightPercent: {
			...defaultEtfFilters.maxCountryWeightPercent,
			max: 75
		}
	};
}

function getGoodEtfPresetFilters() {
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
		continentCount: {
			...defaultEtfFilters.continentCount,
			min: 1,
			max: 6
		},
		companies: {
			...defaultEtfFilters.companies,
			min: 100
		},
		countryCount: {
			...defaultEtfFilters.countryCount,
			min: 10
		},
		goodCountryWeightPercent: {
			...defaultEtfFilters.goodCountryWeightPercent,
			min: 80
		},
		topHoldingsWeightPercent: {
			...defaultEtfFilters.topHoldingsWeightPercent,
			max: 33.4
		},
		maxCountryWeightPercent: {
			...defaultEtfFilters.maxCountryWeightPercent,
			max: 33.4
		}
	};
}