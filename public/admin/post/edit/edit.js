import {
	collection,
	getDocs,
	query,
	orderBy,
	doc,
	deleteField,
	updateDoc,
	onSnapshot,
	serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { firestore } from "/backend.js";

const projectsCollection = collection(firestore, "projects");
const tagsCollection = collection(firestore, "tags");
const projectsContainer = document.getElementById("projects-container");
const tagsContainer = document.getElementById("tags-container");
const content = document.getElementById("content");
const projectsQuery = query(projectsCollection, orderBy("date", "desc"));

let currentProjectRef;
let currentProjectData;
const searchParams = new URLSearchParams(location.search);
let projectID = null;

onSnapshot(tagsCollection, (tagsDocs) => {
	tagsDocs.forEach(async (tag) => {
		var tagData = tag.data();
		tagData.id = tag.id;

		if (!tagData.isCollection) {
			var tagElement = document.createElement("button");
			tagElement.onclick = () => selectTag(tagElement);
			tagElement.className = "tag";
			tagElement.textContent = tagData.name;
			tagElement.id = `tag-${tagData.id}`;
			tagElement.setAttribute("data-tag-id", tagData.id);
			if (
				currentProjectData &&
				currentProjectData.tags.find((tag) => tag === tagData.id)
			) {
				tagElement.toggleAttribute("selected", true);
			}
			tagsContainer.appendChild(tagElement);
		} else {
			const subTagCollection = collection(
				firestore,
				"tags",
				tagData.id,
				"tags",
			);
			const subTagsDocs = await getDocs(subTagCollection);
			subTagsDocs.forEach((subTag) => {
				var subTagData = subTag.data();
				subTagData.id = `${tagData.id}/tags/${subTag.id}`;

				var tagElement = document.createElement("button");
				tagElement.onclick = () => selectTag(tagElement);
				tagElement.className = "tag";
				tagElement.textContent = subTagData.name;
				tagElement.id = `tag-${subTagData.id}`;
				tagElement.setAttribute("data-tag-id", subTagData.id);
				if (
					currentProjectData &&
					currentProjectData.tags.find((tag) => tag === subTagData.id)
				) {
					tagElement.toggleAttribute("selected", true);
				}
				tagsContainer.appendChild(tagElement);
			});
		}
	});
});

if (
	location.pathname.split("/").filter((elm) => elm)[3] ||
	searchParams.get("project-id")
) {
	if (searchParams.get("project-id")) {
		projectID = searchParams.get("project-id");
	} else {
		projectID = location.pathname.split("/").filter((elm) => elm)[3];
	}
	window.onbeforeunload = () => {
		return "Are you sure you want to leave? Unsaved changes will be lost.";
	};
	document
		.querySelector("body[state]")
		.setAttribute("state", "Project Editing");
	let docRef = doc(firestore, "projects", projectID);
	onSnapshot(docRef, (project) => {
		let projectData = project.data();
		currentProjectData = projectData;
		currentProjectRef = doc(firestore, "projects", project.id);
		document
			.querySelector("body[state]")
			.setAttribute("state", "Project Editing");
		tagsContainer.querySelectorAll(".tag").forEach((elm) => {
			const tagId = elm.getAttribute("data-tag-id");
			if (!tagId)
				throw new Error("The tag must have data-tag-id attribute attached");
			if (projectData.tags.find((id) => id == tagId)) {
				elm.toggleAttribute("selected", true);
			} else {
				elm.toggleAttribute("selected", false);
			}
		});
		document.getElementById("project-name-header").textContent =
			projectData.name;
		document.title = projectData.name + " - TurboA99";
		if (projectData.github) {
			document.getElementById("github-link").href = projectData.github;
			document.getElementById("github-link-popover").textContent =
				projectData.github;
		}

		if (projectData.link) {
			document.getElementById("project-link").href = projectData.link;
			document.getElementById("project-link-popover").textContent =
				projectData.link;
		}

		if (projectData.download) {
			document.getElementById("download-link").href = projectData.download;
			document.getElementById("download-link-popover").textContent =
				projectData.download;
		}

		document.getElementById("project-image").src = projectData.image;
		document.getElementById("project-image").alt = projectData.name;
		const date = new Date(projectData.date.seconds * 1000);
		document.getElementById("project-date").dateTime = date;
		document.getElementById("project-date").textContent =
			date.toLocaleDateString(date.getTimezoneOffset(), {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		const lastModified = new Date(Date.now());
		document.getElementById("project-last-modified").dateTime = date;
		document.getElementById("project-last-modified").textContent =
			`Last modified: ${lastModified.toLocaleDateString(
				lastModified.getTimezoneOffset(),
				{
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				},
			)}`;
		content.innerHTML = projectData.content;
		document.getElementById("is-highlighted").checked = projectData.highlighted;
		document.getElementById("project-image-input").value = projectData.image;

		tagsContainer.querySelectorAll(".tag").forEach((elm) => {
			const tagId = elm.getAttribute("data-tag-id");
			if (!tagId)
				throw new Error("The tag must have data-tag-id attribute attached");
			if (projectData.tags.find((id) => id == tagId)) {
				elm.toggleAttribute("selected", true);
			} else {
				elm.toggleAttribute("selected", false);
			}
		});

		document
			.getElementById("content")
			.querySelectorAll("section > *")
			.forEach((elm) => {
				elm.contentEditable = "true";
				if (elm.tagName.toLocaleLowerCase() === "p") {
					elm.setAttribute("data-placeholder", "Write a paragraph here...");
				}
				if (elm.tagName.toLocaleLowerCase() === "h2") {
					elm.setAttribute("data-placeholder", "Edit header...");
				}
				elm.parentSection = elm.parentElement;
				document.addContentEditableCallbacks(elm);
			});
	});
} else {
	onSnapshot(projectsQuery, (projectDocs) => {
		let projectElements = [];
		projectDocs.forEach((project) => {
			let projectData = project.data();
			projectData.id = project.id;

			if (
				projectData &&
				projectData.id &&
				projectData.name &&
				projectData.image
			) {
				var projectElement = document.createElement("button");
				projectElement.setAttribute("data-project-id", projectData.id);
				projectElement.className = "project";
				projectElement.innerHTML = `
                        <img src="${projectData.image}" alt="${projectData.name}" />
                        <h3>${projectData.name}</h3>
                        <span class="material-symbols-outlined"> edit </span>`;
				projectElement.style.viewTransitionName = "project-" + projectData.id;
				projectElement.onclick = () => {
					currentProjectRef = doc(firestore, "projects", project.id);
					document.currentProjectRef = currentProjectRef;
					selectProject(projectData.id);
				};
				projectElements.push(projectElement);
			} else {
				console.warn("Skipping project with incomplete data:", projectData);
			}
		});

		projectsContainer.innerHTML = "";
		projectElements.forEach((elm) => projectsContainer.appendChild(elm));

		if (projectDocs.empty) {
			projectsContainer.innerHTML = "<p>No projects found</p>";
		}
	});
}

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

document
	.getElementById("project-name")
	.querySelectorAll("a")
	.forEach((link) => {
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
					link.removeAttribute("href");
					validateURLOrPlaceholder(popoverElement, (url) => (link.href = url));
					popoverElement.hidePopover();
				}
			});
			popoverElement.addEventListener("toggle", (ev) => {
				if (!popoverElement.open) {
					link.removeAttribute("href");
					validateURLOrPlaceholder(popoverElement, (url) => (link.href = url));
				}
			});
			popoverElement.addEventListener("change", (ev) => {
				link.removeAttribute("href");
				validateURLOrPlaceholder(popoverElement, (url) => (link.href = url));
			});
		}
	});

function selectProject(projectID) {
	if (!projectID)
		throw new Error(
			"Cannot select a project without a data-project-id attribute",
		);
	location.href = `/admin/post/edit/${projectID}`;
}

function selectTag(tagElement) {
	tagElement.toggleAttribute("selected", !tagElement.hasAttribute("selected"));
}

document.forms[0].addEventListener("submit", (ev) => {
	if (document.forms[0].checkValidity()) {
		uploadEdits();
	}
	ev.preventDefault();
});
document.getElementById("post-edits").addEventListener("click", (ev) => {
	if (document.forms[0].checkValidity()) {
		uploadEdits();
	}
	ev.preventDefault();
});

async function uploadEdits() {
	let data = {};
	document.clearContentForPosting(content);
	if (
		currentProjectData.name.trim() !==
		document.getElementById("project-name-header").textContent.trim()
	) {
		data.name = document
			.getElementById("project-name-header")
			.textContent.trim();
	}
	if (
		(currentProjectData.github &&
			currentProjectData.github !==
				document.getElementById("github-link").href) ||
		(!currentProjectData.github &&
			document.getElementById("github-link").href &&
			document.getElementById("github-link").href !== "#")
	) {
		data.github = document.getElementById("github-link").href;
	}
	if (
		currentProjectData.github &&
		(!document.getElementById("github-link").href ||
			document.getElementById("github-link").href === "#")
	) {
		data.github = deleteField();
	}
	if (
		!document.getElementById("github-link").href &&
		document.getElementById("github-link").href === "#"
	)
		if (
			(currentProjectData.download &&
				currentProjectData.download !==
					document.getElementById("download-link").href) ||
			(!currentProjectData.download &&
				document.getElementById("download-link").href &&
				document.getElementById("download-link").href !== "#")
		) {
			data.download = document.getElementById("download-link").href;
		}
	if (
		currentProjectData.download &&
		(!document.getElementById("download-link").href ||
			document.getElementById("download-link").href === "#")
	) {
		data.download = deleteField();
	}
	if (
		(currentProjectData.link &&
			currentProjectData.link !==
				document.getElementById("project-link").href) ||
		(!currentProjectData.link &&
			document.getElementById("project-link").href &&
			document.getElementById("project-link").href !== "#")
	) {
		data.link = document.getElementById("project-link").href;
	}
	if (
		currentProjectData.link &&
		(!document.getElementById("project-link").href ||
			document.getElementById("project-link").href === "#")
	) {
		data.link = deleteField();
	}
	if (
		currentProjectData.image !==
		document.getElementById("project-image-input").value
	) {
		data.image = document.getElementById("project-image-input").value;
	}
	const tagElements = [...tagsContainer.childNodes];
	const selectedTags = tagElements
		.filter((tag) => tag.hasAttribute("selected"))
		.map((tag) => tag.getAttribute("data-tag-id"));
	if (currentProjectData.tags !== selectedTags) {
		data.tags = selectedTags;
	}
	if (currentProjectData.content !== content.innerHTML) {
		data.content = content.innerHTML;
	}

	if (Object.entries(data).length == 0) return;

	data.lastModified = serverTimestamp();

	console.log(currentProjectRef);
	console.log(data);

	await updateDoc(currentProjectRef, data).then(() => {
		location.href = `/project/${currentProjectData.id}`;
	});
}
