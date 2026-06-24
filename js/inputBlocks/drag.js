function makeBlocksDraggable() {
	const suppressClick = {};

	accounts.forEach(prefix => {
		const title = document.getElementById("title" + prefix);
		const block = document.getElementById("lock" + prefix).closest(".input-block");

		let startMouseX = 0;
		let startMouseY = 0;
		let startBlockX = 0;
		let startBlockY = 0;
		let dragging = false;
		let moved = false;

		title.addEventListener("mousedown", e => {
			if (locks[prefix]) return;

			dragging = true;
			moved = false;
			startMouseX = e.clientX;
			startMouseY = e.clientY;
			startBlockX = +(block.dataset.x || 0);
			startBlockY = +(block.dataset.y || 0);

			block.style.zIndex = 20;
			document.body.classList.add("dragging-block");
		});

		document.addEventListener("mousemove", e => {
			if (!dragging) return;

			const dx = e.clientX - startMouseX;
			const dy = e.clientY - startMouseY;

			if (Math.abs(dx) + Math.abs(dy) < 4) return;

			moved = true;

			const x = startBlockX + dx;
			const y = startBlockY + dy;

			block.dataset.x = x;
			block.dataset.y = y;
			block.style.transform = `translate(${x}px, ${y}px)`;
		});

		document.addEventListener("mouseup", () => {
			if (dragging && moved) {
				suppressClick[prefix] = true;
				setTimeout(() => suppressClick[prefix] = false, 0);
			}

			dragging = false;
			document.body.classList.remove("dragging-block");
		});
	});

	document.addEventListener("click", e => {
		const title = e.target.closest(".investment-title");

		if (!title) return;

		const prefix = title.id.replace("title", "");

		if (suppressClick[prefix]) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	}, true);
}

makeBlocksDraggable();