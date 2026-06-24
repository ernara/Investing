function makeBlocksDraggable() {
	accounts.forEach(prefix => {
		const title = document.getElementById("title" + prefix);
		const block = document.getElementById("lock" + prefix).closest(".input-block");

		let startMouseX = 0;
		let startMouseY = 0;
		let startBlockX = 0;
		let startBlockY = 0;
		let dragging = false;

		title.addEventListener("mousedown", e => {
			if (locks[prefix]) return;

			e.preventDefault();

			dragging = true;
			startMouseX = e.clientX;
			startMouseY = e.clientY;
			startBlockX = +(block.dataset.x || 0);
			startBlockY = +(block.dataset.y || 0);

			block.style.zIndex = 20;
			document.body.classList.add("dragging-block");
		});

		document.addEventListener("mousemove", e => {
			if (!dragging) return;

			const x = startBlockX + e.clientX - startMouseX;
			const y = startBlockY + e.clientY - startMouseY;

			block.dataset.x = x;
			block.dataset.y = y;
			block.style.transform = `translate(${x}px, ${y}px)`;
		});

		document.addEventListener("mouseup", () => {
			dragging = false;
			document.body.classList.remove("dragging-block");
		});
	});
}

document.addEventListener("click", e => {
	const title = e.target.closest(".investment-title");

	if (!title) return;

	const prefix = title.id.replace("title", "");

	if (!locks[prefix]) {
		e.preventDefault();
		e.stopImmediatePropagation();
	}
}, true);

makeBlocksDraggable();