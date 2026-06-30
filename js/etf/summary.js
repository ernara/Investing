async function loadEtfs() {
	const root = document.getElementById("etfSummary");

	if (!root) return;

	try {
		const response = await fetch("data/ter-0.07.json");

		if (!response.ok) throw new Error("data/ter-0.07.json not found");

		const etfs = await response.json();

		const displayEtfs = prepareEtfsForDisplay(etfs, {
		combineShareClasses: true
		});

		renderEtfs(sortEtfs(displayEtfs));
		setupCountryButtons();

	} catch (error) {
		console.error(error);

		root.innerHTML = `
			<p class="etf-error">Nepavyko užkrauti ETF duomenų.</p>
		`;
	}
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
				</tbody>
			</table>

			<button class="country-button" type="button">
				Rodyti šalis
			</button>

			<div class="country-panel hidden">
				${renderCountryTable(etf.countries)}
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

function setupCountryButtons() {
	document.querySelectorAll(".country-button").forEach(button => {
		button.addEventListener("click", () => {
			const panel = button.nextElementSibling;

			panel.classList.toggle("hidden");

			button.textContent = panel.classList.contains("hidden")
				? "Rodyti šalis"
				: "Slėpti šalis";
		});
	});
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

loadEtfs();