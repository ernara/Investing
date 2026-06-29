const themeStorageKey = "theme";

function updateThemeMenuIcon() {
	const icon = document.getElementById("theme-menu-icon");

	if (!icon) return;

	icon.textContent = "☾";
}

function loadTheme() {
	document.body.classList.toggle(
		"dark",
		localStorage.getItem(themeStorageKey) === "dark"
	);

	updateThemeMenuIcon();
}

function toggleTheme() {
	const isDark = document.body.classList.toggle("dark");

	localStorage.setItem(themeStorageKey, isDark ? "dark" : "light");

	updateThemeMenuIcon();

	if (typeof drawChart === "function") drawChart();
}

loadTheme();