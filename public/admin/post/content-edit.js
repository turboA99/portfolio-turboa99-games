let lastSelectedSection = null;
let lastSelectedEditable = null;

function validateContentEditable(element) {
	const placeholderText = element.getAttribute("data-placeholder");
	if (element.textContent.trim() === "" && placeholderText) {
		element.textContent = placeholderText;
		element.initialized = false;
	}
}
function validateURLOrPlaceholder(element, onSuccess = (url) => {}) {
	validateContentEditable(element);
	if (element.getAttribute("data-placeholder") === element.textContent) return;
	try {
		let url = validateUrl(element.textContent);
		if (!url) throw new Error("Invalid URL");
		element.textContent = url;
		onSuccess(url);
	} catch (e) {
		const placeholderText = element.getAttribute("data-placeholder");
		element.textContent = placeholderText;
	}
}

function validateUrl(urltext) {
	try {
		let url = new URL(urltext.trim());
		return url.href;
	} catch {
		return null;
	}
}

function insertSection() {
	const section = document.createElement("section");
	content.appendChild(section);
	lastSelectedSection = section;
	insertHeader(lastSelectedSection);
	insertParagraph(lastSelectedSection);
}

function insertHeader(root = null) {
	if (!lastSelectedSection) {
		insertSection();
		return;
	}

	const header = document.createElement("h2");
	header.textContent = "Edit Header";
	header.setAttribute("data-placeholder", "Edit Header");
	header.parentSection = lastSelectedSection;
	header.contentEditable = true;
	addBackspaceCallback(header);
	addFocusCallback(header);
	addEnterCallback(header);
	const currentSelection = window.getSelection();
	if (!root) {
		if (currentSelection.anchorNode.contentEditable) {
			currentSelection.anchorNode.after(header);
		} else if (currentSelection.anchorNode.parentElement.contentEditable) {
			currentSelection.anchorNode.parentElement.after(header);
		} else {
			lastSelectedSection.appendChild(header);
		}
	} else {
		root.appendChild(header);
	}
	header.focus();
}

function insertParagraph(root = null) {
	if (!lastSelectedSection) {
		insertSection();
		return;
	}
	const paragraph = document.createElement("p");
	paragraph.textContent = "Paragraph content goes here...";
	paragraph.setAttribute("data-placeholder", "Paragraph content goes here...");
	paragraph.contentEditable = "true";
	paragraph.parentSection = lastSelectedSection;
	addBackspaceCallback(paragraph);
	addFocusCallback(paragraph);
	addEnterCallback(paragraph);
	const currentSelection = window.getSelection();
	if (!root) {
		if (currentSelection.anchorNode.contentEditable) {
			currentSelection.anchorNode.after(paragraph);
		} else if (currentSelection.anchorNode.parentElement.contentEditable) {
			currentSelection.anchorNode.parentElement.after(paragraph);
		} else {
			lastSelectedSection.appendChild(paragraph);
		}
	} else {
		root.appendChild(paragraph);
	}
	paragraph.focus();
}

function insertGithubLink() {
	if (lastSelectedEditable) {
		const currentSelection = window.getSelection();
		if (!currentSelection) return;

		const selectionRange = currentSelection.getRangeAt(0);
		if (!selectionRange) return;

		let href = window.prompt(
			"Please insert the link to the github page",
			"https://github.com/",
		);
		let url = validateUrl(href);
		if (url) {
			const githubLink = document.createElement("a");
			githubLink.href = url;
			githubLink.target = "_blank";
			if (!selectionRange.collapsed) {
				selectionRange.surroundContents(githubLink);
				githubLink.innerHTML += `<i class="fa fa-github" aria-hidden="true"></i>`;
			} else {
				githubLink.innerHTML = `<i class="fa fa-github" aria-hidden="true"></i>`;
				selectionRange.insertNode(githubLink);
			}
		}
	}
}

function insertImage() {
	if (!lastSelectedSection) {
		insertSection();
	}
	const imageLink = document.createElement("p");
	imageLink.textContent = "Paste the link to the image here...";
	imageLink.setAttribute("data-placeholder", imageLink.textContent);
	imageLink.contentEditable = true;
	addBackspaceCallback(imageLink);
	addFocusCallback(imageLink);
	imageLink.onkeydown = (ev) => {
		if (ev.key === "Enter") {
			ev.preventDefault();
			validateURLOrPlaceholder(imageLink, (url) => {
				const image = document.createElement("img");
				image.src = url;
				image.contentEditable = true;
				addBackspaceCallback(image);
				addEnterCallback(image);
				imageLink.replaceWith(image);
				image.focus();
			});
		}
	};
	const currentSelection = window.getSelection();
	if (currentSelection.anchorNode.contentEditable) {
		currentSelection.anchorNode.after(imageLink);
	} else if (currentSelection.anchorNode.parentElement.contentEditable) {
		currentSelection.anchorNode.parentElement.after(imageLink);
	} else {
		lastSelectedSection.appendChild(imageLink);
	}
	imageLink.focus();
}

function insertVideo() {
	if (!lastSelectedSection) {
		insertSection();
	}

	const link = document.createElement("p");
	link.contentEditable = true;
	link.textContent = "Insert Link Here";
	link.setAttribute("data-placeholder", "Insert Link Here");
	addBackspaceCallback(link);
	addFocusCallback(link);
	link.onkeydown = (ev) => {
		if (ev.key == "Enter") {
			ev.preventDefault();
			validateURLOrPlaceholder(link, (stringurl) => {
				let url = new URL(stringurl);
				if (url.hostname === "youtu.be") {
					url.hostname = "youtube.com";
					url.pathname = "embed/" + url.pathname;
				}
				if (url.hostname !== "youtube.com") {
					return;
				}
				const iframe = document.createElement("iframe");
				iframe.src = url;
				iframe.allow =
					"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
				iframe.referrerPolicy = "strict-origin-when-cross-origin";
				iframe.toggleAttribute("allowfullscreen", true);
				iframe.contentEditable = true;
				addBackspaceCallback(iframe);
				addEnterCallback(iframe);
				link.replaceWith(iframe);
				iframe.focus();
			});
		}
	};
	const currentSelection = window.getSelection();
	if (currentSelection.anchorNode.contentEditable) {
		currentSelection.anchorNode.after(link);
	} else if (currentSelection.anchorNode.parentElement.contentEditable) {
		currentSelection.anchorNode.parentElement.after(link);
	} else {
		lastSelectedSection.appendChild(link);
	}
	link.focus();
}

function makeLink() {
	const currentSelection = window.getSelection();
	const currentRange = currentSelection.getRangeAt(0);
	if (!currentRange) return;
	const url = prompt(
		"Insert link you would like to use",
		"https://portfolio.turboa99.games",
	);
	const href = validateUrl(url);
	if (!href) return;
	const linkElement = document.createElement("a");
	linkElement.href = href;
	currentRange.surroundContents(linkElement);
}

function addFocusCallback(element) {
	element.addEventListener("focusin", (ev) => {
		if (element.parentSection) {
			lastSelectedSection = element.parentSection;
			lastSelectedEditable = element;
		}
		if (element.textContent && element.hasAttribute("data-placeholder")) {
			let placeholderText = element.getAttribute("data-placeholder");
			if (element.textContent == placeholderText) {
				element.textContent = "";
			}
		}
		window.getSelection().selectAllChildren(element);
		window.getSelection().collapseToEnd();
	});
	element.addEventListener("focusout", (ev) => {
		validateContentEditable(element);
	});
}

function addBackspaceCallback(element, elementToRemove = element) {
	if (element.textContent) {
		element.addEventListener("keydown", (ev) => {
			if (ev.key === "Backspace") {
				if (element.textContent === "") {
					ev.preventDefault();
					if (element.previousElementSibling) {
						elementToRemove.previousElementSibling.focus();
					} else {
						elementToRemove.parentSection.remove();
					}
					elementToRemove.remove();
				}
			}
		});
	} else {
		element.addEventListener("keydown", (ev) => {
			if (ev.key === "Backspace") {
				ev.preventDefault();
				if (element.previousElementSibling) {
					element.previousElementSibling.focus();
				} else {
					element.parentSection.remove();
				}
				element.remove();
			}
		});
	}
}

function addEnterCallback(element) {
	element.addEventListener("keydown", (ev) => {
		if (ev.key === "Enter" && !ev.shiftKey) {
			ev.preventDefault();
			if (element.textContent) {
				validateContentEditable(element);
			}
			if (element.nextElementSibling) {
				element.nextElementSibling.focus();
			} else {
				insertParagraph();
			}
		}
	});
}

function clearContentForPosting(root) {
	root.querySelectorAll("[contenteditable]").forEach((elm) => {
		elm.toggleAttribute("data-placeholder", false);
		elm.toggleAttribute("contenteditable", false);
	});
}

document.insertSection = insertSection;
document.insertParagraph = insertParagraph;
document.insertHeader = insertHeader;
document.insertImage = insertImage;
document.insertYoutubeVideo = insertVideo;
document.clearContentForPosting = clearContentForPosting;
document.insertGithubLink = insertGithubLink;
document.makeLink = makeLink;
document.addContentEditableCallbacks = (element) => {
	addFocusCallback(element);
	addEnterCallback(element);
	addBackspaceCallback(element);
};
