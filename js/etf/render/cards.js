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
						<th>Iš viso įmonių</th>
						<td>${formatNumber(etf.totalCompanies)}</td>
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

				<button type="button" class="country-button etf-panel-button" data-panel="topHoldings">
					Rodyti TOP10 pozicijas
				</button>
			</div>

			<div class="country-panel hidden" data-panel-content="countries">
				${renderCountryTable(etf.countries || [])}
			</div>

			<div class="country-panel hidden" data-panel-content="topHoldings">
				${renderTopHoldingsTable(etf.topHoldings || [])}
			</div>
		</article>
	`;
}

function renderCountryTable(countries) {
	if (!countries.length) {
		return `<p class="no-data">Nėra šalių duomenų.</p>`;
	}

	return `
		<div class="country-list">
			<div class="country-header">
				<span>Šalis</span>
				<span>Įmonių sk.</span>
				<span>ETF dalis</span>
			</div>

			${countries.map(country => `
				<div class="country-row">
					<span class="country-name">
						${renderFlag(country.code)}
						<span>${country.nameLt}</span>
					</span>

					<span class="country-companies">
						${formatNumber(country.companies)}
					</span>

					<strong class="country-weight">
						${formatPercent(country.weightPercent)}
					</strong>
				</div>
			`).join("")}
		</div>
	`;
}

function renderTopHoldingsTable(topHoldings) {
	if (!topHoldings.length) {
		return `<p class="no-data">Nėra TOP pozicijų duomenų.</p>`;
	}

	return `
		<div class="country-list">
			<div class="top-holdings-header">
				<span>Įmonė</span>
				<span>Sektorius</span>
				<span>ETF dalis</span>
			</div>

			${topHoldings.map(holding => `
				<div class="top-holdings-row">
					<span class="holding-name">
						${renderFlag(holding.countryCode)}
						<span>
							<strong>${holding.name}</strong>
							<small>${holding.ticker || ""}</small>
						</span>
					</span>

					<span class="holding-sector">
						${holding.sector || "Nerasta"}
					</span>

					<strong class="holding-weight">
						${formatPercent(holding.weightPercent)}
					</strong>
				</div>
			`).join("")}
		</div>
	`;
}