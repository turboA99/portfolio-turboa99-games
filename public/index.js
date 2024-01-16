var isTouchDevice =
	"ontouchstart" in window ||
	navigator.maxTouchPoints > 0 ||
	navigator.msMaxTouchPoints > 0;
var isTouchUsed = isTouchDevice && event.type === "touchstart";

if (isTouchUsed) {
	document.querySelector("custom-section > .white").remove();
}
