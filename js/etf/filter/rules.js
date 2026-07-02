function etfPassesFilters(etf, filters) {
	return (
		passesEtfNameSearch(etf, filters.nameText) &&
		passesRange(getEtfCapitalBillions(etf), filters.capitalBillions, defaultEtfFilters.capitalBillions) &&
		passesRange(etf.terPercent, filters.terPercent, defaultEtfFilters.terPercent) &&
		passesRange(etf.totalCompanies, filters.companies, defaultEtfFilters.companies) &&
		passesRange(etf.continentCount, filters.continentCount, defaultEtfFilters.continentCount) &&
		passesRange(getEtfCountryCount(etf), filters.countryCount, defaultEtfFilters.countryCount) &&
		passesRange(etf.topHoldingsTotalWeightPercent, filters.topHoldingsWeightPercent, defaultEtfFilters.topHoldingsWeightPercent) &&
		passesRange(getMaxCountryWeightPercent(etf), filters.maxCountryWeightPercent, defaultEtfFilters.maxCountryWeightPercent)
	);
}

function passesRange(value, range, defaultRange) {
	const number = parseEtfNumber(value);

	if (number === null) {
		return !isRangeNarrowed(range, defaultRange);
	}

	if (range.min !== null && number < range.min) return false;
	if (range.max !== null && number > range.max) return false;

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

function passesEtfNameSearch(etf, searchText) {
	const search = normalizeEtfSearchText(searchText);

	if (!search) return true;

	const haystack = normalizeEtfSearchText([
		etf.ticker,
		etf.name,
		etf.isin,
		etf.provider,
		etf.indexName
	].filter(Boolean).join(" "));

	return search
		.split(" ")
		.filter(Boolean)
		.every(word => haystack.includes(word));
}

function normalizeEtfSearchText(text) {
	return String(text || "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}