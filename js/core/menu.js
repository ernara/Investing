function renderTopMenu() {
	if (document.getElementById("top-menu")) return;

	const menu = document.createElement("div");

	menu.id = "top-menu";
	menu.innerHTML = `
		<button id="top-menu-button" type="button" aria-label="Open menu" title="Menu">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
				<circle cx="5" cy="10" r="1.5" fill="currentColor"></circle>
				<circle cx="10" cy="10" r="1.5" fill="currentColor"></circle>
				<circle cx="15" cy="10" r="1.5" fill="currentColor"></circle>
			</svg>
		</button>

		<div id="top-menu-dropdown">
			<button type="button" onclick="location.href='investing.html'">
				<span>📈</span>
				Investicijų palyginimas
			</button>

			<button type="button" onclick="location.href='etf.html'">
				<span>🌍</span>
				ETF palyginimas
			</button>

			<button type="button" onclick="toggleTheme(); closeTopMenu();">
				<span id="theme-menu-icon">☾</span>
				Perjungti temą
			</button>

			<button type="button" onclick="toggleMoneyMode(); closeTopMenu();">
				<span id="money-mode-menu-icon">K/M</span>
				Skaičių formatas
			</button>
		</div>
	`;

	document.body.prepend(menu);
}

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
	renderTopMenu();

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

	if (typeof updateThemeMenuIcon === "function") updateThemeMenuIcon();
	if (typeof updateMoneyModeButtons === "function") updateMoneyModeButtons();
}

setupTopMenu();