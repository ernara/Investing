function calculateProfit(prefix) {
	const g = id => +document.getElementById(id + prefix).value || 0;

	const metai = g("metai");
	const menesineImoka = g("menesineImoka");
	const metineGraza = g("metineGraza") / 1200;
	const valdymoMokestis = g("valdymoMokestis") / 1200;
	const saugojimoMokestis = g("saugojimoMokestis") / 100;
	const pirkimoMokestis = g("pirkimoMokestis") / 100;

	let kapitalas = g("pradineInvesticija");
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