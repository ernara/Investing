function calculateProfit(prefix) {
	const metai = getInput(prefix, "metai");
	const menesineImoka = getInput(prefix, "menesineImoka");
	const metineGraza = getInput(prefix, "metineGraza") / 1200;
	const valdymoMokestis = getInput(prefix, "valdymoMokestis") / 1200;
	const saugojimoMokestis = getInput(prefix, "saugojimoMokestis") / 100;
	const pirkimoMokestis = getInput(prefix, "pirkimoMokestis") / 100;

	let kapitalas = getInput(prefix, "pradineInvesticija");
	const history = [];

	history.push(kapitalas);

	for (let i = 0; i < metai * 12; i++) {
		kapitalas += menesineImoka * (1 - pirkimoMokestis);
		kapitalas *= 1 + metineGraza - valdymoMokestis;
		kapitalas *= 1 - saugojimoMokestis;
		history.push(kapitalas);
	}

	return history;
}