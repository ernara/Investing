const etfFiltersStorageKey = "etfFilters";

let defaultEtfFilters = getEmptyEtfFilters();
let activeEtfFilters = getEmptyEtfFilters();
let etfFilterSource = [];
let renderEtfFilterResult = null;

function initEtfFilters(etfs, renderCallback) {
	etfFilterSource = etfs;
	renderEtfFilterResult = renderCallback;

	defaultEtfFilters = getEtfFilterBounds(etfs);
	activeEtfFilters = loadSavedEtfFilters(defaultEtfFilters);

	renderEtfFilters(activeEtfFilters);
	renderCurrentFilteredEtfs();
}

function getEmptyEtfFilters() {
	return {
		nameText: "",
		capitalBillions: { min: null, max: null },
		terPercent: { min: null, max: null },
		companies: { min: null, max: null },
		countryCount: { min: null, max: null },
		topHoldingsWeightPercent: { min: null, max: null },
		maxCountryWeightPercent: { min: null, max: null }
	};
}

function getEtfFilterBounds(etfs) {
	return {
		nameText: "",
		capitalBillions: getRange(etfs, getEtfCapitalBillions),
		terPercent: getRange(etfs, etf => etf.terPercent),
		companies: getRange(etfs, etf => etf.totalCompanies),
		countryCount: getRange(etfs, getEtfCountryCount),
		topHoldingsWeightPercent: getRange(etfs, etf => etf.topHoldingsTotalWeightPercent),
		maxCountryWeightPercent: getRange(etfs, getMaxCountryWeightPercent)
	};
}

function getRange(items, getValue) {
	const values = items
		.map(getValue)
		.map(parseEtfNumber)
		.filter(value => value !== null);

	if (!values.length) {
		return { min: null, max: null };
	}

	return {
		min: roundFilterMin(Math.min(...values)),
		max: roundFilterMax(Math.max(...values))
	};
}

function roundFilterMin(value) {
	return Math.floor(value * 100) / 100;
}

function roundFilterMax(value) {
	return Math.ceil(value * 100) / 100;
}

function loadSavedEtfFilters(defaultFilters) {
	const savedFilters = JSON.parse(localStorage.getItem(etfFiltersStorageKey) || "null");

	if (!savedFilters) return structuredClone(defaultFilters);

	return {
		...structuredClone(defaultFilters),
		...savedFilters
	};
}

function saveEtfFilters() {
	localStorage.setItem(etfFiltersStorageKey, JSON.stringify(activeEtfFilters));
}

function setupEtfFilterInputs() {
	const nameSearch = document.getElementById("etfNameSearch");

	if (nameSearch) {
		nameSearch.addEventListener("input", () => {
			activeEtfFilters.nameText = nameSearch.value;

			saveEtfFilters();
			renderCurrentFilteredEtfs();
		});
	}
	document.querySelectorAll("[data-filter]").forEach(input => {
		input.addEventListener("input", () => {
			const key = input.dataset.filter;
			const side = input.dataset.side;

			activeEtfFilters[key][side] = input.value === "" ? null : Number(input.value);

			saveEtfFilters();
			renderCurrentFilteredEtfs();
		});
	});

	setupEtfPresetButton();

	document.getElementById("resetEtfFilters").addEventListener("click", () => {
		activeEtfFilters = structuredClone(defaultEtfFilters);

		localStorage.removeItem(etfFiltersStorageKey);

		renderEtfFilters(activeEtfFilters);
		renderCurrentFilteredEtfs();
	});
}

function setupEtfShareClassSelect() {
	const select = document.getElementById("etfShareClassModeSelect");

	if (!select) return;

	select.value = getEtfShareClassMode();

	select.addEventListener("change", () => {
		setEtfShareClassMode(select.value);

		if (typeof renderEtfsByShareClassMode === "function") {
			renderEtfsByShareClassMode();
		}
	});
}

function renderCurrentFilteredEtfs() {
	const filteredEtfs = etfFilterSource.filter(etf => {
		return etfPassesFilters(etf, activeEtfFilters);
	});

	const sortedEtfs = sortFilteredEtfs(filteredEtfs);

	renderEtfFilterResult(sortedEtfs);
	updateEtfFilterCount(sortedEtfs.length, etfFilterSource.length);
}

function parseEtfNumber(value) {
	if (value === null || value === undefined) return null;

	if (typeof value === "number") {
		return Number.isNaN(value) ? null : value;
	}

	if (typeof value !== "string") return null;

	const cleanedValue = value
		.replace(",", ".")
		.replace("%", "")
		.replace(/\s/g, "")
		.replace(/[^\d.-]/g, "");

	if (cleanedValue === "") return null;

	const number = Number(cleanedValue);

	return Number.isNaN(number) ? null : number;
}

function getEtfCapitalBillions(etf) {
	const amountMillions = parseEtfNumber(etf.fundCapital?.amountMillions);

	if (amountMillions === null) return null;

	return amountMillions / 1000;
}

function getEtfCountryCount(etf) {
	if (!Array.isArray(etf.countries)) return null;

	return etf.countries.filter(isRealEtfCountry).length;
}

function getMaxCountryWeightPercent(etf) {
	if (!Array.isArray(etf.countries)) return null;

	const weights = etf.countries
		.filter(isRealEtfCountry)
		.map(country => parseEtfNumber(country.weightPercent))
		.filter(weight => weight !== null);

	if (!weights.length) return null;

	return Math.max(...weights);
}

function isRealEtfCountry(country) {
	if (!country) return false;

	const code = String(country.code || country.countryCode || "").trim().toUpperCase();
	const name = String(country.name || country.nameLt || country.nameEn || "").trim().toLowerCase();

	if (!code && !name) return false;

	return !(
		code === "SUM" ||
		code === "TOTAL" ||
		code === "OTHER" ||
		name === "suma" ||
		name === "total" ||
		name === "iš viso" ||
		name === "is viso" ||
		name.includes("kitos šalys") ||
		name.includes("kitos salys") ||
		name.includes("other countries")
	);
}

function updateEtfFilterCount(visibleCount, totalCount) {
	const count = document.getElementById("etfFilterCount");

	if (!count) return;

	count.textContent = `Rodoma: ${visibleCount} iš ${totalCount}`;
}
