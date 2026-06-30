let draggedEtfCard = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let highestEtfZIndex = 1;

function bringEtfCardToFront(card) {
	highestEtfZIndex++;

	card.style.zIndex = highestEtfZIndex;
}

document.addEventListener("pointerdown", event => {
	const top = event.target.closest(".etf-card-top");

	if (!top) return;

	initEtfFreeDrag();

	draggedEtfCard = top.closest(".etf-card");

	if (!draggedEtfCard) return;

	const rect = draggedEtfCard.getBoundingClientRect();

	dragOffsetX = event.clientX - rect.left;
	dragOffsetY = event.clientY - rect.top;

	draggedEtfCard.classList.add("dragging");
	document.body.classList.add("dragging-etf");
	bringEtfCardToFront(draggedEtfCard);

	event.preventDefault();
});

document.addEventListener("pointermove", event => {
	if (!draggedEtfCard) return;

	const root = document.getElementById("etfSummary");
	const rootRect = root.getBoundingClientRect();

	const x = event.clientX - rootRect.left - dragOffsetX;
	const y = event.clientY - rootRect.top - dragOffsetY;

	draggedEtfCard.dataset.x = x;
	draggedEtfCard.dataset.y = y;

	draggedEtfCard.style.left = x + "px";
	draggedEtfCard.style.top = y + "px";

	updateEtfDragAreaHeight();

	event.preventDefault();
});

document.addEventListener("pointerup", stopEtfDrag);
document.addEventListener("pointercancel", stopEtfDrag);

document.addEventListener("click", event => {
	if (!event.target.closest(".country-button")) return;

	setTimeout(updateEtfDragAreaHeight, 0);
});

function initEtfFreeDrag() {
	const root = document.getElementById("etfSummary");

	if (!root || root.dataset.freeDragReady) return;

	const cards = [...root.querySelectorAll(".etf-card")];
	const rootRect = root.getBoundingClientRect();

	const positions = cards.map(card => {
		const rect = card.getBoundingClientRect();

		return {
			card: card,
			x: rect.left - rootRect.left,
			y: rect.top - rootRect.top,
			width: rect.width
		};
	});

	positions.forEach(position => {
		position.card.dataset.x = position.x;
		position.card.dataset.y = position.y;

		position.card.style.position = "absolute";
		position.card.style.left = position.x + "px";
		position.card.style.top = position.y + "px";
		position.card.style.width = position.width + "px";
	});

	root.dataset.freeDragReady = "true";

	updateEtfDragAreaHeight();
}

function updateEtfDragAreaHeight() {
	const root = document.getElementById("etfSummary");
	const cards = [...root.querySelectorAll(".etf-card")];

	if (!root || !cards.length) return;

	const maxBottom = Math.max(...cards.map(card => {
		const y = Number(card.dataset.y || 0);

		return y + card.offsetHeight;
	}));

	root.style.height = maxBottom + 30 + "px";
}

function stopEtfDrag() {
	if (!draggedEtfCard) return;

	draggedEtfCard.classList.remove("dragging");
	document.body.classList.remove("dragging-etf");

	draggedEtfCard = null;
}

document.addEventListener("click", event => {
	const card = event.target.closest(".etf-card");

	if (!card) return;

	bringEtfCardToFront(card);
});