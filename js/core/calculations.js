function calculateInvestment(prefix) {
	const metai = getInput(prefix, "metai");
	const menesineImoka = getInput(prefix, "menesineImoka");
	const metineGraza = getInput(prefix, "metineGraza") / 1200;
	const valdymoMokestis = getInput(prefix, "valdymoMokestis") / 1200;
	const saugojimoMokestis = getInput(prefix, "saugojimoMokestis") / 100;
	const pirkimoMokestis = getInput(prefix, "pirkimoMokestis") / 100;

	let kapitalas = getInput(prefix, "pradineInvesticija");
	let feesPaid = 0;
	const history = [kapitalas];

	for (let i = 0; i < metai * 12; i++) {
		const pirkimoSuma = menesineImoka * pirkimoMokestis;

		feesPaid += pirkimoSuma;
		kapitalas += menesineImoka - pirkimoSuma;

		feesPaid += kapitalas * valdymoMokestis;
		kapitalas *= 1 + metineGraza - valdymoMokestis;

		feesPaid += kapitalas * saugojimoMokestis;
		kapitalas *= 1 - saugojimoMokestis;

		history.push(kapitalas);
	}

	return { history, feesPaid };
}