import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
	collection,
	getFirestore,
	getDocs,
	setDoc,
	doc,
	serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "AIzaSyAymRuyzskddedlToAKhbTxtN1gan2oJIM",
	authDomain: "turboa99.firebaseapp.com",
	databaseURL:
		"https://turboa99-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "turboa99",
	storageBucket: "turboa99.appspot.com",
	messagingSenderId: "870083818836",
	appId: "1:870083818836:web:85066fd6c92740135c84c1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tagsCollection = collection(db, "tags");

const projectName = document.getElementById("project-name");
const projectId = document.getElementById("project-id");
const tagsContainer = document.getElementById("tags-container");
const imageLink = document.getElementById("project-image-input");
const projectImage = document.getElementById("project-image");
const projectDate = document.getElementById("project-date");
const editor = document.getElementById("editor-container");
const content = document.getElementById("content");
const floatingModal = document.getElementById("floating-modal");
const postProject = document.getElementById("post-project");

const now = new Date(Date.now());
projectDate.dateTime = now.toString();
projectDate.textContent = now.toLocaleDateString(undefined, {
	year: "numeric",
	month: "long",
	day: "numeric",
	hour: "2-digit",
	minute: "2-digit",
});

async function fetchAndDisplayTags() {
	try {
		const tagsDocs = await getDocs(tagsCollection);
		tagsDocs.forEach(async (tag) => {
			var tagData = tag.data();
			tagData.id = tag.id;

			if (!tagData.isCollection) {
				var tagElement = document.createElement("button");
				tagElement.onclick = () => selectTag(tagData.id);
				tagElement.className = "tag";
				tagElement.textContent = tagData.name;
				tagElement.id = `tag-${tagData.id}`;
				tagElement.setAttribute("data-tag-id", tagData.id);
				tagsContainer.appendChild(tagElement);
			} else {
				const subTagCollection = collection(db, "tags", tagData.id, "tags");
				const subTagsDocs = await getDocs(subTagCollection);
				subTagsDocs.forEach((subTag) => {
					var subTagData = subTag.data();
					subTagData.id = `${tagData.id}/tags/${subTag.id}`;

					var tagElement = document.createElement("button");
					tagElement.onclick = () => selectTag(subTagData.id);
					tagElement.className = "tag";
					tagElement.textContent = subTagData.name;
					tagElement.id = `tag-${subTagData.id}`;
					tagElement.setAttribute("data-tag-id", subTagData.id);
					tagsContainer.appendChild(tagElement);
				});
			}
		});
	} catch (error) {
		console.error("Error fetching tags: ", error);
		tagsContainer.innerHTML =
			"<p>Could not load tags. Please try again later.</p>";
	}
}

function selectTag(tagId) {
	const tagElement = document.getElementById(`tag-${tagId}`);
	if (!tagElement) throw new Error("Tag element not found");
	const selected = tagElement.hasAttribute("selected");
	tagElement.toggleAttribute("selected", !selected);
}

projectName.querySelectorAll("a").forEach((link) => {
	const anchorName = `--${link.id}-anchor`;
	const popoverTarget = link.id + "-popover";
	const popoverElement = document.getElementById(popoverTarget);

	link.style.anchorName = anchorName;
	popoverElement.style.positionAnchor = anchorName;
	if (popoverElement) {
		link.addEventListener("pointerenter", (ev) => {
			popoverElement.showPopover();
		});
		link.addEventListener("pointerleave", (ev) => {
			if (popoverElement === document.activeElement) return;
			popoverElement.hidePopover();
			validateURLOrPlaceholder(popoverElement);
		});
		popoverElement.addEventListener("pointerenter", (ev) => {
			popoverElement.showPopover();
		});
		popoverElement.addEventListener("pointerleave", (ev) => {
			if (popoverElement === document.activeElement) return;
			popoverElement.hidePopover();
			validateURLOrPlaceholder(popoverElement);
		});
		popoverElement.addEventListener("keydown", (ev) => {
			if (ev.key === "Escape" || ev.key === "Enter") {
				ev.preventDefault();
				link.href = "#";
				validateURLOrPlaceholder(popoverElement, (url) => (link.href = url));
				popoverElement.hidePopover();
			}
		});
		popoverElement.addEventListener("toggle", (ev) => {
			if (!popoverElement.open) {
				link.href = "#";
				validateURLOrPlaceholder(popoverElement, (url) => (link.href = url));
			}
		});
		popoverElement.addEventListener("change", (ev) => {
			link.href = "#";
			validateURLOrPlaceholder(popoverElement, (url) => (link.href = url));
		});
	}
});

function validateContentEditable(element) {
	const placeholderText = element.getAttribute("data-placeholder");
	if (element.textContent.trim() === "" && placeholderText) {
		element.textContent = placeholderText;
		element.initialized = false;
	}
}

function validateURLOrPlaceholder(element, onSuccess = (url) => {}) {
	validateContentEditable(element);
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

document.querySelectorAll("[contenteditable]").forEach((element) => {
	const placeholderText = element.getAttribute("data-placeholder");
	element.addEventListener("change", (ev) => {
		if (element.textContent.trim() === "") {
			element.textContent = placeholderText;
		}
	});
});

imageLink.addEventListener("change", (ev) => {
	projectImage.src = ev.target.value;
});

document.insertSection();

await fetchAndDisplayTags();

// window.onbeforeunload = () => {
// 	return "Are you sure you want to leave? Unsaved changes will be lost.";
// };

floatingModal.addEventListener("submit", (ev) => {
	if (!floatingModal.checkValidity()) {
		ev.preventDefault();
	}
	ev.preventDefault();
});

floatingModal.addEventListener("keydown", (ev) => {
	if (ev.key === "Enter") {
		if (!floatingModal.checkValidity()) {
			ev.preventDefault();
		}
	}
});

const inputs = floatingModal.querySelectorAll("input");
for (let index = 0; index < inputs.length; index++) {
	const input = inputs[index];
	if (index < inputs.length - 1) {
		input.addEventListener("keydown", (ev) => {
			if (ev.key === "Enter") inputs[index + 1].focus();
		});
	}
}

postProject.onclick = (ev) => {
	if (
		floatingModal.checkValidity() &&
		window.confirm("Are you sure you want to post this page?")
	) {
		postPage();
	}
};

async function postPage() {
	const projectId = document.getElementById("project-id").value;
	const name = document
		.getElementById("project-name-header")
		.textContent.trim();
	const githubLink =
		document.getElementById("github-link").href === "#"
			? null
			: document.getElementById("github-link").href;
	const downloadLink =
		document.getElementById("download-link").href === "#"
			? null
			: document.getElementById("download-link").href;
	const projectLink =
		document.getElementById("project-link").href === "#"
			? null
			: document.getElementById("project-link").href;
	const tagElements = [...tagsContainer.childNodes];
	const selectedTags = tagElements
		.filter((tag) => tag.hasAttribute("selected"))
		.map((tag) => tag.getAttribute("data-tag-id"));
	const image = validateUrl(imageLink.value);
	const highlight = document.getElementById("is-highlighted").checked;

	clearContent();
	const contentHtml = content.innerHTML;
	if (
		!projectId ||
		!name ||
		!image ||
		!selectedTags ||
		!highlight == null ||
		!contentHtml
	) {
		console.log({
			projectId: projectId,
			name: name,
			image: image,
			tags: selectedTags,
			highlighted: highlight,
			content: contentHtml,
		});
		throw new Error("Incomplete data, cannot create project");
	}
	const projectDoc = doc(db, "projects", projectId);
	let data = {
		name: name,
		image: image,
		tags: selectedTags,
		highlighted: highlight,
		content: contentHtml,
		date: serverTimestamp(),
	};
	if (projectLink.href && projectLink.href !== "#")
		data.link = projectLink.href;
	if (githubLink.href && githubLink.href !== "#") data.github = githubLink.href;
	if (downloadLink.href && downloadLink.href !== "#")
		data.download = downloadLink.href;

	const projectDocRef = await setDoc(projectDoc, data).then(() => {
		location.href = `/project/${projectId}`;
	});
}

function clearContent() {
	content.querySelectorAll("[contenteditable]").forEach((elm) => {
		elm.toggleAttribute("data-placeholder", false);
		elm.toggleAttribute("contenteditable", false);
	});
}

document.clearContent = clearContent;
