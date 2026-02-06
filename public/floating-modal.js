const floatingModal = document.getElementById("floating-modal");

floatingModal
	.querySelector(".drag-handle")
	.addEventListener("pointerdown", (ev) => {
		floatingModal.isDragged = true;
		floatingModal.style.transition = "none";
		floatingModal.clickPosition = {
			x: ev.screenX,
			y: ev.screenY,
		};
		floatingModal.initialPosition = {
			x: floatingModal.getBoundingClientRect().left,
			y: floatingModal.getBoundingClientRect().top,
		};
	});

floatingModal.addEventListener("pointerup", (ev) => {
	floatingModal.isDragged = false;
	floatingModal.style.transition = null;
	const centerX = screen.width / 2;
	const centerY = screen.height / 2;

	if (ev.screenX < centerX && ev.screenY < centerY) {
		floatingModal.style.left = "0px";
		floatingModal.style.top = "0px";
		floatingModal.style.right = "auto";
		floatingModal.style.bottom = "auto";
	} else if (ev.screenX < centerX && ev.screenY >= centerY) {
		floatingModal.style.left = "0px";
		floatingModal.style.top = "auto";
		floatingModal.style.right = "auto";
		floatingModal.style.bottom = "var(--footer-height)";
	} else if (ev.screenX >= centerX && ev.screenY < centerY) {
		floatingModal.style.left = "auto";
		floatingModal.style.top = "var(--nav-height)";
		floatingModal.style.right = "0px";
		floatingModal.style.bottom = "auto";
	} else if (ev.screenX >= centerX && ev.screenY >= centerY) {
		floatingModal.style.left = "auto";
		floatingModal.style.top = "auto";
		floatingModal.style.right = "0px";
		floatingModal.style.bottom = "var(--footer-height)";
	}
});

document.addEventListener("pointermove", (ev) => {
	if (floatingModal.isDragged) {
		floatingModal.style.inset = `
			${floatingModal.initialPosition.y + ev.screenY - floatingModal.clickPosition.y}px 
			auto
			auto
			${floatingModal.initialPosition.x + ev.screenX - floatingModal.clickPosition.x}px 
		`;
	}
});
