const etfFiltersStorageKey = "etfFilters";

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
		capitalBillions: { min: null, max: null },
		terPercent: { min: null, max: null },
		companies: { min: null, max: null },
		topHoldingsWeightPercent: { min: null, max: null },
		usaWeightPercent: { min: null, max: null }
	};
}

function getEtfFilterBounds(etfs) {
	return {
		capitalBillions: getRange(etfs, getEtfCapitalBillions),
		terPercent: getRange(etfs, etf => etf.terPercent),
		companies: getRange(etfs, etf => etf.totalCompanies),
		topHoldingsWeightPercent: getRange(etfs, etf => etf.topHoldingsTotalWeightPercent),
		usaWeightPercent: { min: 0, max: 100 }
	};
}

function getRange(items, getValue) {
	const values = items
		.map(getValue)
		.filter(value => value !== null && value !== undefined && !Number.isNaN(value));

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

			${renderRangeFilter("capitalBillions", "ETF kapitalas", "B", filters.capitalBillions, "0.1")}
			${renderRangeFilter("terPercent", "Valdymo mokestis", "%", filters.terPercent, "0.01")}
			${renderRangeFilter("companies", "Įmonių skaičius", "", filters.companies, "1")}
			${renderRangeFilter("topHoldingsWeightPercent", "TOP pozicijų dalis", "%", filters.topHoldingsWeightPercent, "0.01")}
			${renderRangeFilter("usaWeightPercent", "JAV dalis", "%", filters.usaWeightPercent, "0.01")}
		</div>

		<div class="etf-filter-bottom">
			<span id="etfFilterCount"></span>
			<button type="button" id="resetEtfFilters">Atstatyti</button>
		</div>
	`;

	setupEtfFilterInputs();
	setupEtfShareClassSelect();
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
	document.querySelectorAll("[data-filter]").forEach(input => {
		input.addEventListener("input", () => {
			const key = input.dataset.filter;
			const side = input.dataset.side;

			activeEtfFilters[key][side] = input.value === "" ? null : Number(input.value);

			saveEtfFilters();
			renderCurrentFilteredEtfs();
		});
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

function renderCurrentFilteredEtfs() {
	const filteredEtfs = etfFilterSource.filter(etf => {
		return etfPassesFilters(etf, activeEtfFilters);
	});

	renderEtfFilterResult(filteredEtfs);
	updateEtfFilterCount(filteredEtfs.length, etfFilterSource.length);
}

function etfPassesFilters(etf, filters) {
	return (
		passesRange(getEtfCapitalBillions(etf), filters.capitalBillions, defaultEtfFilters.capitalBillions) &&
		passesRange(etf.terPercent, filters.terPercent, defaultEtfFilters.terPercent) &&
		passesRange(etf.totalCompanies, filters.companies, defaultEtfFilters.companies) &&
		passesRange(etf.topHoldingsTotalWeightPercent, filters.topHoldingsWeightPercent, defaultEtfFilters.topHoldingsWeightPercent) &&
		passesRange(getUsaWeightPercent(etf), filters.usaWeightPercent, defaultEtfFilters.usaWeightPercent)
	);
}

function passesRange(value, range, defaultRange) {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return !isRangeNarrowed(range, defaultRange);
	}

	if (range.min !== null && value < range.min) return false;
	if (range.max !== null && value > range.max) return false;

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

function getEtfCapitalBillions(etf) {
	if (!etf.fundCapital?.amountMillions) return null;

	return etf.fundCapital.amountMillions / 1000;
}

function getUsaWeightPercent(etf) {
	if (!Array.isArray(etf.countries)) return null;

	const usa = etf.countries.find(country => {
		return country.code === "US" || country.countryCode === "US";
	});

	return usa?.weightPercent ?? 0;
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