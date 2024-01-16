var isTouchDevice =
	"ontouchstart" in document.documentElement ||
	"ontouchstart" in window ||
	navigator.maxTouchPoints > 0 ||
	navigator.msMaxTouchPoints > 0;

if (isTouchDevice) {
	document.querySelector(".white").style.display = "none";
}
