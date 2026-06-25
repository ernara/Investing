function csvCell(value) {
	const text = String(value)
		.replaceAll("\n", " ")
		.replaceAll("\r", " ")
		.replaceAll('"', '""');

	return `"${text}"`;
}

function parseCSV(text) {
	const rows = [];
	let row = [];
	let cell = "";
	let insideQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		const next = text[i + 1];

		if (char === '"' && insideQuotes && next === '"') {
			cell += '"';
			i++;
		} else if (char === '"') {
			insideQuotes = !insideQuotes;
		} else if (char === "," && !insideQuotes) {
			row.push(cell);
			cell = "";
		} else if ((char === "\n" || char === "\r") && !insideQuotes) {
			if (char === "\r" && next === "\n") i++;

			row.push(cell);
			rows.push(row);

			row = [];
			cell = "";
		} else {
			cell += char;
		}
	}

	row.push(cell);
	rows.push(row);

	return rows;
}

function downloadCSV(prefix) {
	const history = calculateInvestment(prefix).history;
	const name = titles[prefix] || prefix;
	const summary = getSummary(prefix, history);

	const percent = value => value.toFixed(2) + " %";

	const rows = [
		["Sąskaita", name],
		[],
		["Įvestys"],
		["Metai", getInput(prefix, "metai")],
		["Pradinė investicija", getInput(prefix, "pradineInvesticija")],
		["Mėnesinė įmoka", getInput(prefix, "menesineImoka")],
		["Metinė grąža", percent(getInput(prefix, "metineGraza"))],
		["Valdymo mokestis", percent(getInput(prefix, "valdymoMokestis"))],
		["Saugojimo mokestis", percent(getInput(prefix, "saugojimoMokestis"))],
		["Pirkimo mokestis", percent(getInput(prefix, "pirkimoMokestis"))],
		[],
		["Santrauka"],
		["Investuota", summary.invested.toFixed(2)],
		["Galutinis kapitalas", summary.final.toFixed(2)],
		["Pelnas", summary.profit.toFixed(2)],
		["Bendra grąža", percent(summary.profitPercent)],
		["Vidutinė metinė grąža", percent(summary.yearlyProfitPercent)],
		[],
		["Metinė lentelė"],
		["Metai", "Investuota", "Kapitalas", "Pelnas", "Grąža"]
	];

	for (let year = 1; year < history.length / 12; year++) {
		const month = year * 12;
		const invested = getInput(prefix, "pradineInvesticija") + getInput(prefix, "menesineImoka") * month;
		const capital = history[month];
		const profit = capital - invested;
		const profitPercent = invested === 0 ? 0 : profit / invested * 100;

		rows.push([
			year,
			invested.toFixed(2),
			capital.toFixed(2),
			profit.toFixed(2),
			percent(profitPercent)
		]);
	}

	rows.push(
		[],
		["Mėnesinė lentelė"],
		["Mėnuo", "Metai", "Investuota", "Kapitalas", "Pelnas", "Grąža"]
	);

	history.forEach((capital, month) => {
		const invested = getInput(prefix, "pradineInvesticija") + getInput(prefix, "menesineImoka") * month;
		const profit = capital - invested;
		const profitPercent = invested === 0 ? 0 : profit / invested * 100;

		rows.push([
			month,
			(month / 12).toFixed(2),
			invested.toFixed(2),
			capital.toFixed(2),
			profit.toFixed(2),
			percent(profitPercent)
		]);
	});

	const csv = rows
		.map(row => row.map(csvCell).join(","))
		.join("\n");

	const blob = new Blob(["\uFEFF" + csv], {
		type: "text/csv;charset=utf-8;"
	});

	const fileName = name.replace(/[\\/:*?"<>|]/g, "_");

	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `${fileName}.csv`;
	link.click();

	URL.revokeObjectURL(link.href);
}

function importCSV(prefix) {
	const input = document.createElement("input");
	input.type = "file";
	input.accept = ".csv";

	input.onchange = async () => {
		const file = input.files[0];

		if (!file) return;

		const text = await file.text();
		const rows = parseCSV(text);

		runAction(prefix, () => {
			const accountRow = rows.find(row => row[0] === "Sąskaita");

			if (accountRow && accountRow[1]) {
				titles[prefix] = cleanTitle(accountRow[1], titles[prefix]);
				document.getElementById("title" + prefix).textContent = titles[prefix];
			}

			const inputMap = {
				"Metai": "metai",
				"Pradinė investicija": "pradineInvesticija",
				"Mėnesinė įmoka": "menesineImoka",
				"Metinė grąža": "metineGraza",
				"Valdymo mokestis": "valdymoMokestis",
				"Saugojimo mokestis": "saugojimoMokestis",
				"Pirkimo mokestis": "pirkimoMokestis"
			};

			let insideInputs = false;

			rows.forEach(row => {
				if (row[0] === "Įvestys") {
					insideInputs = true;
					return;
				}

				if (row[0] === "Santrauka") {
					insideInputs = false;
					return;
				}

				if (!insideInputs) return;

				const id = inputMap[row[0]];

				if (!id) return;

				const input = document.getElementById(id + prefix);
				const value = limitInputValue(id, parseInputValue(row[1]));

				input.value = value;
			});
		});
	};

	input.click();
}