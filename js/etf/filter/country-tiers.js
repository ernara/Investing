let countryInvestmentTiers = {};

async function loadCountryInvestmentTiers() {
	const response = await fetch("data/country-investment-tier.json");

	if (!response.ok) {
		throw new Error("Nepavyko įkelti country-investment-tier.json");
	}

	const data = await response.json();

	countryInvestmentTiers = data.countries || {};
}

function getGoodCountryWeightPercent(etf) {
	if (!Array.isArray(etf.countries)) return null;

	const goodCountryWeight = etf.countries
		.filter(isRealEtfCountry)
		.filter(country => {
			return isOtherCountriesRow(country) || isGoodInvestmentCountry(country);
		})
		.reduce((total, country) => {
			return total + (parseEtfNumber(country.weightPercent) || 0);
		}, 0);

	return Math.round(goodCountryWeight * 100) / 100;
}

function isGoodInvestmentCountry(country) {
	const code = String(country.code || country.countryCode || "").trim().toUpperCase();

	return countryInvestmentTiers[code]?.allow === true;
}

function isOtherCountriesRow(country) {
	const name = String(country.name || country.nameLt || country.nameEn || "").trim().toLowerCase();

	return (
		name.includes("kitos šalys") ||
		name.includes("kitos salys") ||
		name.includes("other countries")
	);
}

function getOtherCountriesWeightPercent(etf) {
	if (!Array.isArray(etf.countries)) return null;

	const otherCountriesWeight = etf.countries
		.filter(isOtherCountriesRow)
		.reduce((total, country) => {
			return total + (parseEtfNumber(country.weightPercent) || 0);
		}, 0);

	return Math.round(otherCountriesWeight * 100) / 100;
}