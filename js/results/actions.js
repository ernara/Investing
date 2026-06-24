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

function renderActionButtons(prefix) {
	return `
		<div class="summary-actions">
			<button type="button" onclick="resetDefaults('${prefix}')" title="Atstatyti numatytas reikšmes">↺</button>
			<button type="button" onclick="resetToZero('${prefix}')" title="Viską nustatyti į 0">0</button>
			<button type="button" onclick="undo('${prefix}')" title="Grįžti atgal">↶</button>
			<button type="button" onclick="redo('${prefix}')" title="Eiti pirmyn">↷</button>
			<button type="button" onclick="toggleMoneyMode()" class="money-mode-button" title="Skaičių formatas">${getMoneyModeLabel()}</button>
			<button type="button" onclick="importCSV('${prefix}')" class="excel-button" title="Importuoti CSV">IN</button>
			<button type="button" onclick="downloadCSV('${prefix}')" class="excel-button" title="Atsisiųsti CSV">CSV</button>
            ${false ? `<input class="width-input" type="number" value="${getContentWidth()}" onchange="setContentWidth(this.value)" title="Puslapio plotis">` : ""}
		</div>
	`;
}