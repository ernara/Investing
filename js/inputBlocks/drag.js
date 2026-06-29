function isTooFarFromOriginal(block) {
	const rect = block.getBoundingClientRect();

	const outsideLeft = Math.max(0, -rect.left);
	const outsideRight = Math.max(0, rect.right - window.innerWidth);
	const outsideTop = Math.max(0, -rect.top);
	const outsideBottom = Math.max(0, rect.bottom - window.innerHeight);

	return outsideLeft > rect.width * 0.5 ||
		outsideRight > rect.width * 0.5 ||
		outsideTop > rect.height * 0.5 ||
		outsideBottom > rect.height * 0.5;
}

function resetBlockPosition(block) {
	block.style.transform = "";
	block.style.zIndex = "";
	block.dataset.x = 0;
	block.dataset.y = 0;
}

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

		title.addEventListener("pointerdown", e => {
			if (locks[prefix]) return;

			e.preventDefault();
			title.setPointerCapture(e.pointerId);

			dragging = true;
			moved = false;
			startMouseX = e.clientX;
			startMouseY = e.clientY;
			startBlockX = +(block.dataset.x || 0);
			startBlockY = +(block.dataset.y || 0);

			block.style.zIndex = 20;
			block.classList.add("is-dragging");
			document.body.classList.add("dragging-block");
		});

		document.addEventListener("pointermove", e => {
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

		document.addEventListener("pointerup", () => {
			if (dragging && moved) {
				suppressClick[prefix] = true;
				setTimeout(() => suppressClick[prefix] = false, 0);

				if (isTooFarFromOriginal(block)) {
					resetBlockPosition(block);
				}
			}

			dragging = false;
			block.classList.remove("is-dragging");
			document.body.classList.remove("dragging-block");
		});

		document.addEventListener("pointercancel", () => {
			dragging = false;
			block.classList.remove("is-dragging");
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