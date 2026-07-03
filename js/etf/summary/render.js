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
						<span>${translateSectorName(sector.name)}</span>
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