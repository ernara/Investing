let allDisplayEtfs = [];

async function loadEtfs() {
	try {
		const etfs = await loadTerEtfFiles(3, 10);

		allDisplayEtfs = prepareEtfsForDisplay(etfs, {
			combineShareClasses: true
		});

		allDisplayEtfs = sortEtfs(allDisplayEtfs);

		initEtfFilters(allDisplayEtfs, renderEtfs);
	} catch (error) {
		document.getElementById("etfSummary").innerHTML = `
			<p class="etf-error">Nepavyko įkelti ETF duomenų.</p>
		`;

		console.error(error);
	}
}

async function loadTerEtfFiles(fromTer, toTer) {
	const filePromises = [];

	for (let ter = fromTer; ter <= toTer; ter++) {
		const fileName = `data/ter-0.${String(ter).padStart(2, "0")}.json`;

		filePromises.push(loadJsonFileIfExists(fileName));
	}

	const files = await Promise.all(filePromises);

	return files
		.filter(Boolean)
		.flatMap(file => Array.isArray(file) ? file : file.etfs || []);
}

async function loadJsonFileIfExists(fileName) {
	const response = await fetch(fileName);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`Nepavyko įkelti: ${fileName}`);
	}

	return response.json();
}

function renderEtfs(etfs) {
	const root = document.getElementById("etfSummary");

	root.innerHTML = etfs.map(renderEtfCard).join("");
}

function renderEtfCard(etf) {
	const usa = etf.countries.find(country => country.code === "US") || {
	companies: null,
	weightPercent: null
	};

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
			${renderCountryTable(etf.countries)}
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

function getFlagUrl(code) {
	return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
}



function renderFlag(code) {
	if (!code || code.length !== 2) {
		return `<span class="country-flag country-flag-missing">?</span>`;
	}

	return `
		<img
			class="country-flag"
			src="${getFlagUrl(code)}"
			alt=""
			onerror="this.outerHTML='<span class=&quot;country-flag country-flag-missing&quot;>?</span>'"
		>
	`;
}

function prepareEtfsForDisplay(etfs, options = {}) {
	if (!options.combineShareClasses) return etfs;

	return combineEtfShareClasses(etfs);
}

function combineEtfShareClasses(etfs) {
	const groups = new Map();

	etfs.forEach(etf => {
		const key = getEtfGroupKey(etf);
		const capital = getCapitalForCombining(etf);

		if (!groups.has(key)) {
			groups.set(key, {
				...etf,
				ticker: etf.ticker,
				name: cleanEtfName(etf.name),
				fundCapital: {
					amountMillions: 0,
					currency: capital?.currency || etf.fundCapital?.currency || "USD",
					estimated: Boolean(capital?.estimated || etf.fundCapital?.estimated),
					sourceName: capital?.sourceName || etf.fundCapital?.sourceName || "",
					asOf: capital?.asOf || etf.fundCapital?.asOf || null
				},
				shareClasses: []
			});
		}

		const group = groups.get(key);

		group.shareClasses.push(etf);
		group.ticker = mergeTickers(group.ticker, etf.ticker);

		if (capital?.amountMillions) {
			group.fundCapital.amountMillions += capital.amountMillions;
		}
	});

	return [...groups.values()];
}

function getEtfGroupKey(etf) {
	return cleanEtfName(etf.name).toLowerCase();
}

function cleanEtfName(name) {
	return name
		.replace(/\b(acc|dist|accumulating|distributing)\b/gi, "")
		.replace(/\s+/g, " ")
		.trim();
}

function getCapitalForCombining(etf) {
	return etf.shareClassCapital || etf.fundCapital;
}

function mergeTickers(currentTicker, newTicker) {
	const tickers = new Set(
		[currentTicker, newTicker]
			.join(" / ")
			.split("/")
			.map(ticker => ticker.trim())
			.filter(Boolean)
	);

	return [...tickers].join(" / ");
}

function getFlagUrl(code) {
	return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
}



function sortEtfs(etfs) {
	return [...etfs].sort((a, b) => a.terPercent - b.terPercent);
}

function formatNumber(number) {
	if (number === null || number === undefined) return "Nerasta";

	return number.toLocaleString("lt-LT");
}

function formatPercent(number) {
	if (number === null || number === undefined) return "Nerasta";

	return number.toFixed(2).replace(".", ",") + "%";
}

function formatFundCapital(fundCapital) {
	if (!fundCapital?.amountMillions) return "Nerasta";

	const amountBillions = fundCapital.amountMillions / 1000;
	const currency = fundCapital.currency === "USD" ? "$" : "";

	return currency + amountBillions.toFixed(1) + "B";
}

document.addEventListener("click", event => {
	const button = event.target.closest(".etf-panel-button");

	if (!button) return;

	const card = button.closest(".etf-card");
	const panelName = button.dataset.panel;
	const panel = card.querySelector(`[data-panel-content="${panelName}"]`);

	if (!panel) return;

	const wasOpen = !panel.classList.contains("hidden");

	card.querySelectorAll(".country-panel").forEach(panel => {
		panel.classList.add("hidden");
	});

	card.querySelectorAll(".etf-panel-button").forEach(button => {
		button.classList.remove("active");
		resetPanelButtonText(button);
	});

	if (!wasOpen) {
		panel.classList.remove("hidden");
		button.classList.add("active");
		button.textContent = getHideText(panelName);
	}

	if (typeof updateEtfDragAreaHeight === "function") {
		setTimeout(updateEtfDragAreaHeight, 0);
	}
});

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

function resetPanelButtonText(button) {
	if (button.dataset.panel === "countries") {
		button.textContent = "Rodyti šalis";
	}

	if (button.dataset.panel === "topHoldings") {
		button.textContent = "Rodyti TOP10 pozicijas";
	}
}

function getHideText(panelName) {
	if (panelName === "countries") return "Slėpti šalis";
	if (panelName === "topHoldings") return "Slėpti TOP10 pozicijas";

	return "Slėpti";
}

loadEtfs();