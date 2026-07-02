let allRawEtfs = [];

async function loadEtfs() {
	try {
		allRawEtfs = await loadEtfFiles();

		renderEtfsByShareClassMode();
	} catch (error) {
		document.getElementById("etfSummary").innerHTML = `
			<p class="etf-error">Nepavyko įkelti ETF duomenų.</p>
		`;

		console.error(error);
	}
}

function renderEtfsByShareClassMode() {
	const displayEtfs = prepareEtfsForDisplay(allRawEtfs);
	const sortedEtfs = sortEtfs(displayEtfs);

	initEtfFilters(sortedEtfs, renderEtfs);
}



function renderEtfs(etfs) {
	const root = document.getElementById("etfSummary");

	root.innerHTML = etfs.map(renderEtfCard).join("");

	if (typeof initEtfSummaryDrag === "function") {
		initEtfSummaryDrag();
	}

	if (typeof updateEtfDragAreaHeight === "function") {
		setTimeout(updateEtfDragAreaHeight, 0);
	}
}

function sortEtfs(etfs) {
	return [...etfs].sort((a, b) => a.terPercent - b.terPercent);
}

function getHideText(panelName) {
	if (panelName === "countries") return "Slėpti šalis";
	if (panelName === "topHoldings") return "Slėpti TOP10 pozicijas";

	return "Slėpti";
}

loadEtfs();