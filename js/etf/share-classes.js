const etfShareClassModeStorageKey = "etfShareClassMode";

function getEtfShareClassMode() {
	return localStorage.getItem(etfShareClassModeStorageKey) || "combined";
}

function setEtfShareClassMode(mode) {
	localStorage.setItem(etfShareClassModeStorageKey, mode);
}

function prepareEtfsForDisplay(etfs) {
	const mode = getEtfShareClassMode();

	if (mode === "combined") {
		return combineEtfShareClasses(etfs);
	}

	if (mode === "separated") {
		return etfs;
	}

	return etfs.filter(etf => {
		const type = getEtfShareClassType(etf);

		if (mode === "acc") return type === "acc";
		if (mode === "dist") return type === "dist";

		return true;
	});
}

function getEtfShareClassType(etf) {
	if (etf.distribution) {
		const distribution = etf.distribution.toLowerCase();

		if (distribution === "acc") return "acc";
		if (distribution === "dist") return "dist";
	}

	const text = [
		etf.shareClassType,
		etf.distributionPolicy,
		etf.incomeTreatment,
		etf.name,
		etf.ticker
	].filter(Boolean).join(" ").toLowerCase();

	if (/\b(acc|accumulating|accumulation)\b/.test(text)) return "acc";
	if (/\b(dist|distributing|distribution)\b/.test(text)) return "dist";

	return "unknown";
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
		.replace(/\b(acc|dist|accumulating|distributing|accumulation|distribution)\b/gi, "")
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

function renderEtfShareClassControls() {
	const summary = document.getElementById("etfSummary");

	if (!document.getElementById("etfShareClassMode")) {
		summary.insertAdjacentHTML("beforebegin", `
			<section id="etfShareClassMode" class="etf-share-class-mode">
				<label>ETF versija</label>

				<select id="etfShareClassModeSelect">
					<option value="combined">Acc + Dist kartu</option>
	                <option value="separated">Rodyti atskirai</option>
	                <option value="acc">Tik Acc</option>
	                <option value="dist">Tik Dist</option>
				</select>
			</section>
		`);
	}

	const select = document.getElementById("etfShareClassModeSelect");

	select.value = getEtfShareClassMode();

	select.addEventListener("change", () => {
		setEtfShareClassMode(select.value);

		if (typeof renderEtfsByShareClassMode === "function") {
			renderEtfsByShareClassMode();
		}
	});
}