const titles = {
	A: "SEB",
	B: "Trading212"
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

createInputs("A", [30,0,400,8,0.07,0,0]);
createInputs("B", [30,0,400,8,0.07,0.013,0.25]);