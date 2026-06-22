const titles = {
	A: "SEB",
	B: "Trading212"
};

const defaultValues = {
	A: [30,0,400,8,0.07,0,0],
	B: [30,0,400,8,0.07,0.013,0.25]
};

const names = [
	["metai", "Metai"],
	["pradineInvesticija", "Pradinė Investicija"],
	["menesineImoka", "Mėnesinė Įmoka"],
	["metineGraza", "Metinė Grąža"],
	["valdymoMokestis", "Valdymo Mokestis"],
	["saugojimoMokestis", "Saugojimo Mokestis"],
	["pirkimoMokestis", "Pirkimo Mokestis"]
];

function createInputs(prefix, values) {
	const block = document.createElement("div");
	block.className = "input-block";
	block.innerHTML = `<h3>${titles[prefix]}</h3>`;

	names.forEach(([id, label], i) => {
		block.innerHTML += `
			<div class="field">
				<label>${label}:</label>
				<input id="${id + prefix}" type="number" value="${values[i]}">
			</div>
		`;
	});

	block.innerHTML += `<div id="output${prefix}"></div>`;
	document.getElementById("inputs").appendChild(block);
}

function downloadCSV(prefix) {
	const history = calculateProfit(prefix);
	const name = titles[prefix] || prefix;

	const rows = [
		["Sąskaita", name],
		[],
		["Mėnuo", "Metai", "Kapitalas"]
	];

	history.forEach((value, month) => {
		rows.push([
			month,
			(month / 12).toFixed(2),
			value.toFixed(2)
		]);
	});

	const csv = rows.map(row => row.join(";")).join("\n");
	const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });

	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `${name}.csv`;
	link.click();

	URL.revokeObjectURL(link.href);
}

createInputs("A", defaultValues.A);
createInputs("B", defaultValues.B);