class SectionElement extends HTMLElement {
	constructor() {
		super();
		if (this.hasAttribute("mouse-over")) {
			this.mousePos = { x: 0, y: 0 };
			this.style.setProperty("--mouse-x", this.mousePos.x + "px");
			this.style.setProperty("--mouse-y", this.mousePos.y + "px");
		}
	}
	connectedCallback() {
		if (this.hasAttribute("mouse-over")) {
			this.addEventListener("mousemove", (ev) => {
				this.mousePos.x = ev.clientX;
				this.mousePos.y = ev.clientY;
				this.style.setProperty("--mouse-x", this.mousePos.x + "px");
				this.style.setProperty("--mouse-y", this.mousePos.y + "px");
			});
		}
	}
}

window.customElements.define("custom-section", SectionElement);
