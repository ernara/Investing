const titles = {
	A: "Trading212",
	B: "SEB"
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

function changeName(prefix) {
	const oldName = titles[prefix];
	const newName = prompt("Naujas pavadinimas:", oldName);

	if (!newName || !newName.trim()) return;

	runAction(prefix, () => {
		titles[prefix] = newName.trim();
		document.getElementById("title" + prefix).textContent = titles[prefix];
	});
}

function createInputs(prefix, values) {
	const block = document.createElement("div");
	block.className = "input-block";

	block.innerHTML = `
		<h3
			id="title${prefix}"
			class="investment-title"
			onclick="changeName('${prefix}')"
			oncontextmenu="event.preventDefault(); changeName('${prefix}')"
			title="Spauskite, kad pakeistumėte pavadinimą"
		>
			${titles[prefix]}
		</h3>
	`;

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

createInputs("A", defaultValues.A);
createInputs("B", defaultValues.B);