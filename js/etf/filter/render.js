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