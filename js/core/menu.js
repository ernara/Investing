function openTopMenu() {
	document.getElementById("top-menu").classList.add("open");
}

function closeTopMenu() {
	document.getElementById("top-menu").classList.remove("open");
}

function toggleTopMenu() {
	document.getElementById("top-menu").classList.toggle("open");
}

function setupTopMenu() {
	const menu = document.getElementById("top-menu");
	const button = document.getElementById("top-menu-button");

	button.addEventListener("click", e => {
		e.stopPropagation();
		toggleTopMenu();
	});

	document.addEventListener("click", e => {
		if (!menu.contains(e.target)) {
			closeTopMenu();
		}
	});

	document.addEventListener("keydown", e => {
		if (e.key === "Escape") {
			closeTopMenu();
		}
	});
}

setupTopMenu();