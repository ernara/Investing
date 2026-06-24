function resetDefaults(prefix) {
	runAction(prefix, () => {
		titles[prefix] = defaultTitles[prefix];
		document.getElementById("title" + prefix).textContent = defaultTitles[prefix];

		names.forEach(([id], i) => {
			document.getElementById(id + prefix).value = defaultValues[prefix][i];
		});
	});
}

function resetToZero(prefix) {
	runAction(prefix, () => {
		names.forEach(([id]) => {
			document.getElementById(id + prefix).value = 0;
		});
	});
}

function downloadCSV(prefix) {
	const history = calculateProfit(prefix);
	const name = titles[prefix] || prefix;
	const summary = getSummary(prefix, history);

	const csvCell = value => {
		const text = String(value)
			.replaceAll("\n", " ")
			.replaceAll("\r", " ")
			.replaceAll('"', '""');

		return `"${text}"`;
	};

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

function renderActionButtons(prefix) {
	return `
		<div class="summary-actions">
			<button type="button" onclick="resetDefaults('${prefix}')" title="Atstatyti numatytas reikšmes">↺</button>
			<button type="button" onclick="resetToZero('${prefix}')" title="Viską nustatyti į 0">0</button>
			<button type="button" onclick="undo('${prefix}')" title="Grįžti atgal">↶</button>
			<button type="button" onclick="redo('${prefix}')" title="Eiti pirmyn">↷</button>
			<button type="button" onclick="downloadCSV('${prefix}')" class="excel-button" title="Atsisiųsti CSV">CSV</button>
		</div>
	`;
}