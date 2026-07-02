const etfFiltersStorageKey = "etfFilters";
const etfSortModeStorageKey = "etfSortMode";

let defaultEtfFilters = getEmptyEtfFilters();
let activeEtfFilters = getEmptyEtfFilters();
let etfFilterSource = [];
let renderEtfFilterResult = null;

let draggedFilterPanel = null;
let filterDragOffsetX = 0;
let filterDragOffsetY = 0;

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

function getEtfSortMode() {
	return localStorage.getItem(etfSortModeStorageKey) || "terAsc";
}

function setEtfSortMode(mode) {
	localStorage.setItem(etfSortModeStorageKey, mode);
}

function renderEtfFilters(filters) {
	const summary = document.getElementById("etfSummary");

	if (!document.getElementById("etfFilters")) {
		summary.insertAdjacentHTML("beforebegin", `
			<section id="etfFilters" class="etf-filters"></section>
		`);
	}

	document.getElementById("etfFilters").innerHTML = `
		<div class="etf-filter-handle">
			<span>Filtrai</span>
			<span class="etf-filter-dots">⋮⋮</span>
		</div>

		<div class="etf-filter-grid">
			<div class="etf-filter">
				<label>ETF versija</label>

				<select id="etfShareClassModeSelect">
					<option value="combined">Acc + Dist kartu</option>
					<option value="separated">Rodyti atskirai</option>
					<option value="acc">Tik Acc</option>
					<option value="dist">Tik Dist</option>
				</select>
			</div>

			<div class="etf-filter">
				<label>Rūšiavimas</label>

				<select id="etfSortModeSelect">
					<option value="terAsc">Valdymo mokestis: mažiausias</option>
					<option value="terDesc">Valdymo mokestis: didžiausias</option>
					<option value="capitalDesc">ETF kapitalas: didžiausias</option>
					<option value="capitalAsc">ETF kapitalas: mažiausias</option>
					<option value="companiesDesc">Įmonių skaičius: didžiausias</option>
					<option value="companiesAsc">Įmonių skaičius: mažiausias</option>
					<option value="countryCountDesc">Šalių skaičius: didžiausias</option>
					<option value="countryCountAsc">Šalių skaičius: mažiausias</option>
					<option value="topHoldingsAsc">TOP10 dalis: mažiausia</option>
					<option value="topHoldingsDesc">TOP10 dalis: didžiausia</option>
				</select>
			</div>

			<div class="etf-filter">
				<label>Paieška pagal pavadinimą</label>

				<input
					type="text"
					id="etfNameSearch"
					placeholder="Pvz. MSCI World, VWCE, Amundi"
					value="${filters.nameText || ""}"
				>
			</div>

			${renderRangeFilter("capitalBillions", "ETF kapitalas", "B", filters.capitalBillions, "0.1")}
			${renderRangeFilter("terPercent", "Valdymo mokestis", "%", filters.terPercent, "0.01")}
			${renderRangeFilter("companies", "Įmonių skaičius", "", filters.companies, "1")}
			${renderRangeFilter("countryCount", "Šalių skaičius", "", filters.countryCount, "1")}
			${renderRangeFilter("topHoldingsWeightPercent", "TOP10 pozicijų dalis", "%", filters.topHoldingsWeightPercent, "0.01")}
			${renderRangeFilter("maxCountryWeightPercent", "Vienos šalies max dalis", "%", filters.maxCountryWeightPercent, "0.01")}
		</div>

		<div class="etf-filter-bottom">
			<span id="etfFilterCount"></span>

			<div class="etf-filter-buttons">
				<button type="button" id="applyEtfDefaultPreset">Mano</button>
				<button type="button" id="resetEtfFilters">Atstatyti</button>
			</div>
		</div>
	`;

	setupEtfFilterInputs();
	setupEtfShareClassSelect();
	setupEtfSortSelect();
	initEtfFilterDrag();
}

function renderRangeFilter(key, label, unit, range, step) {
	return `
		<div class="etf-filter">
			<label>${label}${unit ? ` (${unit})` : ""}</label>

			<div class="etf-filter-inputs">
				<input type="number" step="${step}" data-filter="${key}" data-side="min" placeholder="Nuo" value="${range.min ?? ""}">
				<input type="number" step="${step}" data-filter="${key}" data-side="max" placeholder="Iki" value="${range.max ?? ""}">
			</div>
		</div>
	`;
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

	document.getElementById("applyEtfDefaultPreset").addEventListener("click", () => {
	activeEtfFilters = {
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

	saveEtfFilters();
	renderEtfFilters(activeEtfFilters);
	renderCurrentFilteredEtfs();
});

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

function renderCurrentFilteredEtfs() {
	const filteredEtfs = etfFilterSource.filter(etf => {
		return etfPassesFilters(etf, activeEtfFilters);
	});

	const sortedEtfs = sortFilteredEtfs(filteredEtfs);

	renderEtfFilterResult(sortedEtfs);
	updateEtfFilterCount(sortedEtfs.length, etfFilterSource.length);
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

function passesRange(value, range, defaultRange) {
	const number = parseEtfNumber(value);

	if (number === null) {
		return !isRangeNarrowed(range, defaultRange);
	}

	if (range.min !== null && number < range.min) return false;
	if (range.max !== null && number > range.max) return false;

	return true;
}

function isRangeNarrowed(range, defaultRange) {
	if (range.min !== null && defaultRange.min !== null && range.min > defaultRange.min) {
		return true;
	}

	if (range.max !== null && defaultRange.max !== null && range.max < defaultRange.max) {
		return true;
	}

	return false;
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

function etfPassesFilters(etf, filters) {
	return (
		passesEtfNameSearch(etf, filters.nameText) &&
		passesRange(getEtfCapitalBillions(etf), filters.capitalBillions, defaultEtfFilters.capitalBillions) &&
		passesRange(etf.terPercent, filters.terPercent, defaultEtfFilters.terPercent) &&
		passesRange(etf.totalCompanies, filters.companies, defaultEtfFilters.companies) &&
		passesRange(getEtfCountryCount(etf), filters.countryCount, defaultEtfFilters.countryCount) &&
		passesRange(etf.topHoldingsTotalWeightPercent, filters.topHoldingsWeightPercent, defaultEtfFilters.topHoldingsWeightPercent) &&
		passesRange(getMaxCountryWeightPercent(etf), filters.maxCountryWeightPercent, defaultEtfFilters.maxCountryWeightPercent)
	);
}

function passesEtfNameSearch(etf, searchText) {
	const search = normalizeEtfSearchText(searchText);

	if (!search) return true;

	const haystack = normalizeEtfSearchText([
		etf.ticker,
		etf.name,
		etf.isin,
		etf.provider,
		etf.indexName
	].filter(Boolean).join(" "));

	return search
		.split(" ")
		.filter(Boolean)
		.every(word => haystack.includes(word));
}

function normalizeEtfSearchText(text) {
	return String(text || "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}