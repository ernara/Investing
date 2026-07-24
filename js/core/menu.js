function renderTopMenu() {
	if (document.getElementById("top-menu")) return;

	const menu = document.createElement("div");

	menu.id = "top-menu";
	menu.innerHTML = `
		<button id="top-menu-button" type="button" aria-label="Atidaryti meniu" title="Meniu" aria-expanded="false">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
				<circle cx="5" cy="10" r="1.5" fill="currentColor"></circle>
				<circle cx="10" cy="10" r="1.5" fill="currentColor"></circle>
				<circle cx="15" cy="10" r="1.5" fill="currentColor"></circle>
			</svg>
		</button>

		<div id="top-menu-dropdown" role="menu">
			<button type="button" data-page="investing.html" onclick="location.href='investing.html'">
				<span>📈</span>
				Investicijų palyginimas
			</button>

			<button type="button" data-page="etf.html" onclick="location.href='etf.html'">
				<span>🌍</span>
				ETF palyginimas
			</button>

			<button type="button" data-page="bruto-neto.html" onclick="location.href='bruto-neto.html'">
				<span>💶</span>
				Bruto / neto
			</button>

			<button id="theme-menu-button" type="button" onclick="toggleTheme(); closeTopMenu();">
				<span id="theme-menu-icon">☾</span>
				<span id="theme-menu-label" class="top-menu-label">Tamsi tema</span>
			</button>

			<button id="money-mode-menu-button" type="button" onclick="toggleMoneyMode(); closeTopMenu();">
				<span id="money-mode-menu-icon">K/M</span>
				<span class="top-menu-label">Skaičių formatas</span>
			</button>
		</div>
	`;

	document.body.prepend(menu);
}

function setTopMenuExpanded(isOpen) {
	const menu = document.getElementById("top-menu");
	const button = document.getElementById("top-menu-button");

	if (!menu || !button) return;

	menu.classList.toggle("open", isOpen);
	button.setAttribute("aria-expanded", String(isOpen));
}

function openTopMenu() {
	setTopMenuExpanded(true);
}

function closeTopMenu() {
	setTopMenuExpanded(false);
}

function toggleTopMenu() {
	const menu = document.getElementById("top-menu");
	setTopMenuExpanded(!menu.classList.contains("open"));
}

function markCurrentMenuPage() {
	const currentPage = location.pathname.split("/").pop() || "index.html";

	document.querySelectorAll("#top-menu-dropdown [data-page]").forEach(button => {
		const isCurrent = button.dataset.page === currentPage;
		button.classList.toggle("active-page", isCurrent);
		if (isCurrent) button.setAttribute("aria-current", "page");
	});
}

function setupTopMenu() {
	renderTopMenu();

	const menu = document.getElementById("top-menu");
	const button = document.getElementById("top-menu-button");
	const moneyModeButton = document.getElementById("money-mode-menu-button");

	button.addEventListener("click", event => {
		event.stopPropagation();
		toggleTopMenu();
	});

	document.addEventListener("click", event => {
		if (!menu.contains(event.target)) closeTopMenu();
	});

	document.addEventListener("keydown", event => {
		if (event.key === "Escape") closeTopMenu();
	});

	if (typeof toggleMoneyMode !== "function") {
		moneyModeButton.hidden = true;
	}

	markCurrentMenuPage();
	if (typeof updateThemeMenuIcon === "function") updateThemeMenuIcon();
	if (typeof updateMoneyModeButtons === "function") updateMoneyModeButtons();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", setupTopMenu, { once: true });
} else {
	setupTopMenu();
}
