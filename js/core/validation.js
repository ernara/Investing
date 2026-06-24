const inputRules = {
	metai: { min: 0, max: 100 },
	pradineInvesticija: { min: 0, max: 10000000 },
	menesineImoka: { min: 0, max: 100000 },
	metineGraza: { min: 0, max: 100 },
	valdymoMokestis: { min: 0, max: 100 },
	saugojimoMokestis: { min: 0, max: 100 },
	pirkimoMokestis: { min: 0, max: 100 }
};

function parseInputValue(value) {
	const text = String(value)
		.trim()
		.toLowerCase()
		.replaceAll(" ", "")
		.replace(",", ".")
		.replace("%", "");

	let multiplier = 1;
	let numberText = text;

	if (text.endsWith("kk")) {
		multiplier = 1000000;
		numberText = text.slice(0, -2);
	} else if (text.endsWith("m")) {
		multiplier = 1000000;
		numberText = text.slice(0, -1);
	} else if (text.endsWith("k")) {
		multiplier = 1000;
		numberText = text.slice(0, -1);
	}

	const number = Number(numberText);

	return Number.isFinite(number) ? number * multiplier : 0;
}

function limitInputValue(id, value) {
	const rule = inputRules[id];

	if (!rule) return value;

	return Math.min(rule.max, Math.max(rule.min, value));
}

function getInput(prefix, id) {
	const input = document.getElementById(id + prefix);
	const value = parseInputValue(input.value);

	return limitInputValue(id, value);
}

function normalizeInput(input) {
	const prefix = accounts.find(prefix => input.id.endsWith(prefix));

	if (!prefix) return;

	const id = input.id.slice(0, -prefix.length);

	if (!inputRules[id]) return;

	input.value = getInput(prefix, id);

	if (typeof saveData === "function") saveData();
	if (typeof renderResults === "function") renderResults();
	if (typeof drawChart === "function") drawChart();
}

document.addEventListener("change", e => {
	if (e.target.matches(".field input")) {
		normalizeInput(e.target);
	}
});