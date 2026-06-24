const undoHistory = {};
const redoHistory = {};
const editStartState = {};

accounts.forEach(prefix => {
	undoHistory[prefix] = [];
	redoHistory[prefix] = [];
});

function getActionState(prefix) {
	const state = {
		title: titles[prefix]
	};

	names.forEach(([id]) => {
		state[id] = document.getElementById(id + prefix).value;
	});

	return state;
}

function setActionState(prefix, state) {
	titles[prefix] = state.title;
	document.getElementById("title" + prefix).textContent = state.title;

	names.forEach(([id]) => {
		document.getElementById(id + prefix).value = state[id];
	});
}

function sameState(a, b) {
	return JSON.stringify(a) === JSON.stringify(b);
}

function updatePage() {
	saveData();
	renderResults();
	drawChart();
}

function runAction(prefix, action) {
	const before = getActionState(prefix);

	action();

	const after = getActionState(prefix);

	if (!sameState(before, after)) {
		undoHistory[prefix].push(before);
		redoHistory[prefix] = [];
	}

	updatePage();
}

function resetDefaults(prefix) {
	runAction(prefix, () => {
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

function undo(prefix) {
	if (undoHistory[prefix].length === 0) return;

	redoHistory[prefix].push(getActionState(prefix));
	setActionState(prefix, undoHistory[prefix].pop());

	updatePage();
}

function redo(prefix) {
	if (redoHistory[prefix].length === 0) return;

	undoHistory[prefix].push(getActionState(prefix));
	setActionState(prefix, redoHistory[prefix].pop());

	updatePage();
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

function renderActionButtons(prefix) {
	return `
		<div class="summary-actions">
			<button type="button" onclick="resetDefaults('${prefix}')" title="Atstatyti numatytas reikšmes">↺</button>
			<button type="button" onclick="resetToZero('${prefix}')" title="Viską nustatyti į 0">0</button>
			<button type="button" onclick="undo('${prefix}')" title="Grįžti atgal">↶</button>
			<button type="button" onclick="redo('${prefix}')" title="Eiti pirmyn">↷</button>
			<button type="button" onclick="downloadCSV('${prefix}')" class="excel-button" title="Atsisiųsti Excel">XLS</button>
		</div>
	`;
}

function getPrefixFromInput(input) {
	return accounts.find(prefix =>
		names.some(([id]) => input.id === id + prefix)
	);
}

document.addEventListener("focusin", e => {
	const prefix = getPrefixFromInput(e.target);

	if (!prefix) return;

	editStartState[prefix] = getActionState(prefix);
});

document.addEventListener("change", e => {
	const prefix = getPrefixFromInput(e.target);

	if (!prefix) return;

	const before = editStartState[prefix];
	const after = getActionState(prefix);

	if (before && !sameState(before, after)) {
		undoHistory[prefix].push(before);
		redoHistory[prefix] = [];
	}
});