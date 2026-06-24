const locks = {
	A: true,
	B: true
};

function toggleLock(prefix) {
	const button = document.getElementById("lock" + prefix);
	const block = button.closest(".input-block");

	locks[prefix] = !locks[prefix];

	button.textContent = locks[prefix] ? "🔒" : "🔓";
	block.classList.toggle("unlocked", !locks[prefix]);

	if (locks[prefix]) {
		block.style.transform = "";
		block.style.zIndex = "";
		block.dataset.x = 0;
		block.dataset.y = 0;
	}
}