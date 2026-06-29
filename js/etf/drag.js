let draggedEtfCard = null;
let etfCardsContainer = null;

document.addEventListener("pointerdown", event => {
	const handle = event.target.closest(".drag-handle");

	if (!handle) return;

	draggedEtfCard = handle.closest(".etf-card");
	etfCardsContainer = draggedEtfCard.parentElement;

	if (!draggedEtfCard || !etfCardsContainer) return;

	draggedEtfCard.classList.add("dragging");
	document.body.classList.add("dragging-etf");

	event.preventDefault();
});

document.addEventListener("pointermove", event => {
	if (!draggedEtfCard || !etfCardsContainer) return;

	event.preventDefault();

	const cards = [...etfCardsContainer.querySelectorAll(".etf-card:not(.dragging)")];

	const nextCard = cards.find(card => {
		const rect = card.getBoundingClientRect();

		return event.clientY < rect.top + rect.height / 2;
	});

	etfCardsContainer.insertBefore(draggedEtfCard, nextCard || null);
});

document.addEventListener("pointerup", stopEtfDragging);
document.addEventListener("pointercancel", stopEtfDragging);

function stopEtfDragging() {
	if (!draggedEtfCard) return;

	draggedEtfCard.classList.remove("dragging");
	document.body.classList.remove("dragging-etf");

	draggedEtfCard = null;
	etfCardsContainer = null;
}