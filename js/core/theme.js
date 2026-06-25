const themeStorageKey = "theme";

function loadTheme() {
	document.body.classList.toggle(
		"dark",
		localStorage.getItem(themeStorageKey) === "dark"
	);
}

function toggleTheme() {
	const isDark = document.body.classList.toggle("dark");

	localStorage.setItem(themeStorageKey, isDark ? "dark" : "light");

	if (typeof drawChart === "function") drawChart();
}

loadTheme();