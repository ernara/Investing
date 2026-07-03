function formatContinentSummary(etf) {
	const continents = getContinentWeights(etf);

	if (!continents.length) return "Nerasta";

	return formatNumber(continents.length);
}

function getContinentWeights(etf) {
	if (Array.isArray(etf.continentWeights) && etf.continentWeights.length) {
		return etf.continentWeights
			.filter(isRealContinentWeight)
			.sort((a, b) => b.weightPercent - a.weightPercent);
	}

	if (!Array.isArray(etf.countries)) return [];

	const continents = new Map();

	etf.countries
		.filter(isRealCountryForContinent)
		.forEach(country => {
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

	return [...continents.values()]
		.filter(isRealContinentWeight)
		.sort((a, b) => b.weightPercent - a.weightPercent);
}

function isRealContinentWeight(continent) {
	if (!continent) return false;

	const name = String(continent.name || "").trim().toLowerCase();
	const nameLt = String(continent.nameLt || "").trim().toLowerCase();

	return !(
		name === "unknown" ||
		name === "other" ||
		name === "other/mixed" ||
		name.includes("other countries") ||
		name.includes("other/mixed") ||
		nameLt === "nežinoma" ||
		nameLt === "nezinoma" ||
		nameLt === "kita / mišru" ||
		nameLt === "kita / misru" ||
		nameLt.includes("kitos šalys") ||
		nameLt.includes("kitos salys")
	);
}

function isRealCountryForContinent(country) {
	if (!country) return false;

	const code = String(country.code || country.countryCode || "").trim().toUpperCase();
	const name = String(country.name || country.nameLt || country.nameEn || "").trim().toLowerCase();

	return !(
		code === "OTHER" ||
		code === "SUM" ||
		code === "TOTAL" ||
		name === "suma" ||
		name === "total" ||
		name === "iš viso" ||
		name === "is viso" ||
		name.includes("kitos šalys") ||
		name.includes("kitos salys") ||
		name.includes("other countries")
	);
}