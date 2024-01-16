var isTouchDevice =
	"ontouchstart" in document.documentElement ||
	navigator.maxTouchPoints > 0 ||
	navigator.msMaxTouchPoints > 0;

if (isTouchDevice) {
	document.querySelector("custom-section > .white").remove();
}
