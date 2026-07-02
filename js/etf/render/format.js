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