const etfTerFileFrom = 3;
const etfTerFileTo = 25;

async function loadEtfFiles() {
	return loadTerEtfFiles(etfTerFileFrom, etfTerFileTo);
}

async function loadTerEtfFiles(fromTer, toTer) {
	const filePromises = [];

	for (let ter = fromTer; ter <= toTer; ter++) {
		const fileName = getTerEtfFileName(ter);

		filePromises.push(loadJsonFileIfExists(fileName));
	}

	const files = await Promise.all(filePromises);

	return files
		.filter(Boolean)
		.flatMap(file => Array.isArray(file) ? file : file.etfs || []);
}

function getTerEtfFileName(ter) {
	return `data/ter-0.${String(ter).padStart(2, "0")}.json`;
}

async function loadJsonFileIfExists(fileName) {
	const response = await fetch(fileName);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`Nepavyko įkelti: ${fileName}`);
	}

	return response.json();
}