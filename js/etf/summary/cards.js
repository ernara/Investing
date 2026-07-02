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

function formatContinentSummary(etf) {
	const continents = getContinentWeights(etf);

	if (!continents.length) return "Nerasta";

	return formatNumber(etf.continentCount || continents.length);
}

function formatTopSector(etf) {
	if (!etf.topSectorName) return "Nerasta";

	return translateSectorName(etf.topSectorName);
}

function getContinentWeights(etf) {
	if (Array.isArray(etf.continentWeights) && etf.continentWeights.length) {
		return etf.continentWeights;
	}

	if (!Array.isArray(etf.countries)) return [];

	const continents = new Map();

	etf.countries.forEach(country => {
		const name = country.continent || "Unknown";
		const nameLt = country.continentLt || name;

		if (!continents.has(name)) {
			continents.set(name, {
				name: name,
				nameLt: nameLt,
				companies: 0,
				weightPercent: 0
			});
		}

		const continent = continents.get(name);

		continent.companies += Number(country.companies || 0);
		continent.weightPercent += Number(country.weightPercent || 0);
	});

	return [...continents.values()].sort((a, b) => b.weightPercent - a.weightPercent);
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

function renderContinentTable(continents) {
	if (!continents.length) {
		return `<p class="no-data">Nėra žemynų duomenų.</p>`;
	}

	return `
		<div class="country-list">
			<div class="country-header">
				<span>Žemynas</span>
				<span>Įmonių sk.</span>
				<span>ETF dalis</span>
			</div>

			${continents.map(continent => `
				<div class="country-row">
					<span class="country-name">
						<span>${continent.nameLt || continent.name}</span>
					</span>

					<span class="country-companies">
						${formatNumber(continent.companies)}
					</span>

					<strong class="country-weight">
						${formatPercent(continent.weightPercent)}
					</strong>
				</div>
			`).join("")}
		</div>
	`;
}

function renderSectorTable(sectors) {
	if (!sectors.length) {
		return `<p class="no-data">Nėra sektorių duomenų.</p>`;
	}

	return `
		<div class="country-list">
			<div class="country-header">
				<span>Sektorius</span>
				<span></span>
				<span>ETF dalis</span>
			</div>

			${sectors.map(sector => `
				<div class="country-row">
					<span class="country-name">
						<span>${sector.name}</span>
					</span>

					<span></span>

					<strong class="country-weight">
						${formatPercent(sector.weightPercent)}
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
						${translateSectorName(holding.sector)}
					</span>

					<strong class="holding-weight">
						${formatPercent(holding.weightPercent)}
					</strong>
				</div>
			`).join("")}
		</div>
	`;
}

function translateSectorName(sectorName) {
	const sectors = {
		"Information Technology": "Informacinės technologijos",
		"Health Care": "Sveikatos priežiūra",
		"Healthcare": "Sveikatos priežiūra",
		"Financials": "Finansai",
		"Consumer Discretionary": "Nebūtino vartojimo prekės ir paslaugos",
		"Consumer Staples": "Būtino vartojimo prekės",
		"Communication Services": "Komunikacijos paslaugos",
		"Industrials": "Pramonė",
		"Energy": "Energetika",
		"Utilities": "Komunalinės paslaugos",
		"Materials": "Žaliavos ir medžiagos",
		"Real Estate": "Nekilnojamasis turtas"
	};

	return sectors[sectorName] || sectorName || "Nerasta";
}