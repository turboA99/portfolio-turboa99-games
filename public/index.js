var isTouchDevice =
	"ontouchstart" in window ||
	navigator.maxTouchPoints > 0 ||
	navigator.msMaxTouchPoints > 0;
var isTouchUsed = isTouchDevice && event.type === "touchstart";

let black_and_white = document.querySelector(".black-and-white");

let lastMouseX, lastMouseY;
lastMouseX = undefined;
lastMouseY = undefined;
let mouseVelocityX, mouseVelocityY;
mouseVelocityX = 0;
mouseVelocityY = 0;

if (!isTouchUsed) {
	document.querySelector(".white").style.display = "relative";
	black_and_white.addEventListener("mousemove", (ev) => {
		black_and_white.style.setProperty("--mouse-x", ev.clientX + "px");
		black_and_white.style.setProperty("--mouse-y", ev.clientY + "px");
	});
} else {
	document.querySelector(".white").style.display = "none";
}
