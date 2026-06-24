const storageKey = "investing-data";

function saveData() {
	const data = {
		inputs: {},
		titles: {}
	};

	document.querySelectorAll("input[id]").forEach(input => {
		data.inputs[input.id] = input.value;
	});

	document.querySelectorAll(".investment-title[id]").forEach(title => {
		data.titles[title.id] = title.textContent.trim();
	});

	localStorage.setItem(storageKey, JSON.stringify(data));
}

function loadData() {
	const saved = localStorage.getItem(storageKey);

	if (!saved) return;

	let data;

	try {
		data = JSON.parse(saved);
	} catch {
		return;
	}

	document.querySelectorAll("input[id]").forEach(input => {
		if (data.inputs?.[input.id] !== undefined) {
			input.value = data.inputs[input.id];
		}
	});

	document.querySelectorAll(".investment-title[id]").forEach(title => {
		if (data.titles?.[title.id] !== undefined) {
			title.textContent = data.titles[title.id].trim();

			const prefix = title.id.replace("title", "");
			titles[prefix] = data.titles[title.id];
		}
	});
}

document.addEventListener("input", saveData);