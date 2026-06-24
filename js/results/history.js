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