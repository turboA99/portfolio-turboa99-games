class SectionElement extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		if (this.hasAttribute("mouse-over")) {
			this.style.setProperty("--mouse-x", "0px");
			this.style.setProperty("--mouse-y", "0px");
			this.addEventListener("mousemove", (ev) => {
				this.style.setProperty("--mouse-x", ev.clientX + "px");
				this.style.setProperty("--mouse-y", ev.clientY + "px");
			});
		}
	}
}

window.customElements.define("custom-section", SectionElement);
