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
				${renderFilterLabel("ETF versija", "Acc-ETF'as, kuris dividendus refinansuoja, Dist- ETF'as, kuris dividendus išmoka. Kai kurie ETF'ai investuoja taip pat, tiesiog vienas iš jų išmoka dividendus, o kitas- ne. Todėl galima tokius ETF'us atskirti arba sujungti")}

				<select id="etfShareClassModeSelect">
					<option value="combined">Acc + Dist kartu</option>
					<option value="separated">Rodyti atskirai</option>
					<option value="acc">Tik Acc</option>
					<option value="dist">Tik Dist</option>
				</select>
			</div>

			<div class="etf-filter">
				${renderFilterLabel("Rūšiavimas", "Nustato, kokia tvarka rodomi ETF po filtravimo.")}

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
					<option value="otherCountriesAsc">Kitos šalys: mažiausia</option>
					<option value="otherCountriesDesc">Kitos šalys: didžiausia</option>
				</select>
			</div>

			<div class="etf-filter">
				${renderFilterLabel("Paieška pagal pavadinimą", "Ieškoma pagal ETF pavadinimą ar tickerį")}

				<input
					type="text"
					id="etfNameSearch"
					placeholder="Pvz. MSCI World, VWCE, Amundi"
					value="${filters.nameText || ""}"
				>
			</div>

			${renderRangeFilter("capitalBillions", "ETF kapitalas", "B", filters.capitalBillions, "0.1", "Fondo dydis milijardais. Didesnis ETF dažniausiai turi mažesnę uždarymo arba sujungimo riziką")}
			${renderRangeFilter("terPercent", "Valdymo mokestis", "%", filters.terPercent, "0.01", "Metinis ETF mokestis. Kuo mažesnis, tuo mažiau fondo grąžos suvalgo mokesčiai")}
			${renderRangeFilter("continentCount", "Žemynų skaičius", "", filters.continentCount, "1", "Į kiek skirtingų realių žemynų investuoja ETF")}
			${renderRangeFilter("companies", "Įmonių skaičius", "", filters.companies, "10", "Į kiek įmonių investuoja ETF")}
			${renderRangeFilter("countryCount", "Šalių skaičius", "", filters.countryCount, "1", "Į kiek skirtingų šalių investuoja ETF")}
			${renderRangeFilter("goodCountryWeightPercent", "Patikimos šalys", "%", filters.goodCountryWeightPercent, "1", "Šalys į kurias saugu ir verta investuoti")}
			${renderRangeFilter("topHoldingsWeightPercent", "TOP10 pozicijų dalis", "%", filters.topHoldingsWeightPercent, "1", "Kiek ETF kapitalo sudaro 10 didžiausių įmonių")}
			${renderRangeFilter("maxCountryWeightPercent", "Didžiausios šalies dalis", "%", filters.maxCountryWeightPercent, "1", "Kiek ETF'o kapitalo sudaro invescticija į didžiausią vieną šalį. Mažesnė reikšmė reiškia mažesnę priklausomybę nuo vienos šalies")}

			<div class="etf-filter etf-filter-checkbox">
				<label>
					<input
						type="checkbox"
						id="includeSyntheticEtfs"
						${filters.includeSynthetic ? "checked" : ""}
					>

					<span>Rodyti sintetinius ETF</span>
					${renderInfoBubble("Sintetinis ETF indekso grąžą atkartoja per finansinį susitarimą su banku, o ne tiesiogiai pirkdamas visas indekso akcijas")}
				</label>
			</div>
		</div>

		<div class="etf-filter-bottom">
			<span id="etfFilterCount"></span>

			<div class="etf-filter-buttons">
				<button type="button" id="applyEtfDefaultPreset">Big</button>
				<button type="button" id="applyGoodEtfPreset">Good</button>
				<button type="button" id="resetEtfFilters">Atstatyti</button>
			</div>
		</div>
	`;

	setupEtfFilterInputs();
	setupEtfShareClassSelect();
	setupEtfSortSelect();
	initEtfFilterDrag();
}

function renderRangeFilter(key, label, unit, range, step, infoText) {
	return `
		<div class="etf-filter">
			${renderFilterLabel(`${label}${unit ? ` (${unit})` : ""}`, infoText)}

			<div class="etf-filter-inputs">
				<input
					type="number"
					min="0"
					step="${step}"
					data-filter="${key}"
					data-side="min"
					placeholder="Nuo"
					value="${range.min ?? ""}"
				>

				<input
					type="number"
					min="0"
					step="${step}"
					data-filter="${key}"
					data-side="max"
					placeholder="Iki"
					value="${range.max ?? ""}"
				>
			</div>
		</div>
	`;
}

function renderFilterLabel(label, infoText) {
	return `
		<div class="etf-filter-label">
			<span>${label}</span>
			${renderInfoBubble(infoText)}
		</div>
	`;
}

function renderInfoBubble(infoText) {
	return `
		<span
			class="etf-info-bubble"
			tabindex="0"
			data-tooltip="${escapeAttribute(infoText)}"
			aria-label="${escapeAttribute(infoText)}"
		>?</span>
	`;
}

function escapeAttribute(value) {
	return String(value || "")
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}