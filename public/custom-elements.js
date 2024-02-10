class SectionElement extends HTMLElement {
	constructor() {
		super();
		if (this.hasAttribute("mouse-over")) {
			this.mousePos = { x: 0, y: 0 };
			this.targetPos = this.mousePos;
			this.curPos = this.targetPos;
			this.speedThreashold = 2;
			this.isMoveRunning = false;
			this.style.setProperty("--mouse-x", this.curPos.x + "px");
			this.style.setProperty("--mouse-y", this.curPos.y + "px");
		}
	}
	connectedCallback() {
		if (this.hasAttribute("mouse-over")) {
			this.addEventListener("mousemove", (ev) => {
				this.mousePos.x = ev.clientX;
				this.mousePos.y = ev.clientY;
				this.targetPos = this.mousePos;
				if (!this.isMoveRunning) this.moveToTarget();
			});
		}
	}
	async moveToTarget() {
		this.isMoveRunning = true;
		while (this.curPos != this.targetPos) {
			this.curPos +=
				this.targetPos - this.curPos > this.speedThreashold
					? this.speedThreashold
					: this.targetPos - this.curPos;
			this.style.setProperty("--mouse-x", this.curPos.x + "px");
			this.style.setProperty("--mouse-y", this.curPos.y + "px");
			console.log(this.curPos);
		}
		this.isMoveRunning = false;
		return 1;
	}
}

window.customElements.define("custom-section", SectionElement);
