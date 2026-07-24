const themeStorageKey = "theme";

function updateThemeMenuIcon() {
	const isDark = document.body.classList.contains("dark");
	const icon = document.getElementById("theme-menu-icon");
	const label = document.getElementById("theme-menu-label");

	if (icon) icon.textContent = isDark ? "☀" : "☾";
	if (label) label.textContent = isDark ? "Šviesi tema" : "Tamsi tema";
}

function redrawPageAfterThemeChange() {
	if (typeof drawChart === "function") drawChart();
	if (typeof drawEtfChart === "function") drawEtfChart();
}

function applyTheme(theme) {
	document.body.classList.toggle("dark", theme === "dark");
	updateThemeMenuIcon();
	redrawPageAfterThemeChange();
}

function loadTheme() {
	applyTheme(localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light");
}

function toggleTheme() {
	const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
	localStorage.setItem(themeStorageKey, nextTheme);
	applyTheme(nextTheme);
}

window.addEventListener("storage", event => {
	if (event.key === themeStorageKey) loadTheme();
});

loadTheme();
