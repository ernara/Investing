function renderEtfCard(etf) {
	return `
		<article class="etf-card">
			<div class="etf-card-top">
				<span class="drag-handle">⋮⋮</span>
				<h3>${etf.ticker} - ${etf.name}</h3>
			</div>

			<table class="etf-mini-table">
				<tbody>
					<tr>
						<th>ETF kapitalas</th>
						<td>${formatFundCapital(etf.fundCapital)}</td>
					</tr>

					<tr>
						<th>Valdymo mokestis</th>
						<td>${formatPercent(etf.terPercent)}</td>
					</tr>

					<tr>
						<th>Šalys</th>
						<td>${formatCountryCountSummary(etf)}</td>
					</tr>

					<tr>
						<th>Patikimos šalys</th>
						<td>${formatPercent(getGoodCountryWeightPercent(etf))}</td>
					</tr>

					<tr>
						<th>Didžiausios šalies dalis</th>
						<td>${formatPercent(getMaxCountryWeightPercent(etf))}</td>
					</tr>

					<tr>
						<th>Žemynai</th>
						<td>${formatContinentSummary(etf)}</td>
					</tr>

					<tr>
						<th>Iš viso įmonių</th>
						<td>${formatNumber(etf.totalCompanies)}</td>
					</tr>

					<tr>
						<th>Didžiausias sektorius</th>
						<td>${formatTopSector(etf)}</td>
					</tr>

					<tr>
						<th>TOP10 pozicijų dalis</th>
						<td>${formatPercent(etf.topHoldingsTotalWeightPercent)}</td>
					</tr>
				</tbody>
			</table>

			<div class="etf-actions">
				<button type="button" class="country-button etf-panel-button" data-panel="countries">
					Rodyti šalis
				</button>

				<!--
				<button type="button" class="country-button etf-panel-button" data-panel="continents">
					Rodyti žemynus
				</button>

				<button type="button" class="country-button etf-panel-button" data-panel="sectors">
					Rodyti sektorius
				</button>
				-->

				<button type="button" class="country-button etf-panel-button" data-panel="topHoldings">
					Rodyti TOP10 pozicijas
				</button>
			</div>

			<div class="country-panel hidden" data-panel-content="countries">
				${renderCountryTable(etf.countries || [])}
			</div>

			<div class="country-panel hidden" data-panel-content="continents">
				${renderContinentTable(getContinentWeights(etf))}
			</div>

			<div class="country-panel hidden" data-panel-content="sectors">
				${renderSectorTable(etf.sectorWeights || [])}
			</div>

			<div class="country-panel hidden" data-panel-content="topHoldings">
				${renderTopHoldingsTable(etf.topHoldings || [])}
			</div>
		</article>
	`;
}

function formatCountryCountSummary(etf) {
	const countryCount = getDisplayCountryCount(etf);

	if (countryCount === null) return "Nerasta";

	return formatNumber(countryCount);
}

function getDisplayCountryCount(etf) {
	if (!Array.isArray(etf.countries)) {
		return etf.countryCount ?? null;
	}

	return etf.countries.filter(isCountryCountRow).length;
}

function isCountryCountRow(country) {
	if (!country) return false;

	const code = String(country.code || country.countryCode || "").trim().toUpperCase();
	const name = String(country.name || country.nameLt || country.nameEn || "").trim().toLowerCase();

	return !(
		code === "SUM" ||
		code === "TOTAL" ||
		name === "suma" ||
		name === "total" ||
		name === "iš viso" ||
		name === "is viso"
	);
}

function formatTopSector(etf) {
	if (!etf.topSectorName) return "Nerasta";

	return translateSectorName(etf.topSectorName);
}