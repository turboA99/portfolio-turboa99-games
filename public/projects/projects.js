import {
	collection,
	getDocs,
	query,
	orderBy,
	where,
	onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

import { firestore } from "/backend.js";

const projectsCollection = collection(firestore, "projects");
const projectsContainer = document.getElementById("projects-container");

const tagsCollection = collection(firestore, "tags");
const tagsContainer = document.getElementById("tags-container");

var selectedTag = "";
var selectedCategory = "";
const urlParams = new URLSearchParams(window.location.search);
const tagId = urlParams.get("tagId");
const projectsSkeletonLoader = projectsContainer.innerHTML;
if (tagId) {
	selectedTag = tagId;
} else {
	selectedTag = "all";
	history.replaceState(
		null,
		"",
		window.location.pathname + `?tagId=${selectedTag}`,
	);
}
onSnapshot(tagsCollection, (tagsDocs) => {
	tagsContainer.innerHTML = "";
	{
		var tagElement = document.createElement("a");
		tagElement.onclick = () => selectTag("all");
		tagElement.className = "tag";
		tagElement.textContent = "all";
		tagElement.id = `tag-all`;
		if (selectedTag === "all") {
			tagElement.toggleAttribute("selected", true);
		}
		tagsContainer.appendChild(tagElement);
	}
	tagsDocs.forEach(async (tag) => {
		var tagData = tag.data();
		tagData.id = tag.id;

		if (!tagData.isCollection) {
			var tagElement = document.createElement("button");
			tagElement.onclick = () => selectTag(tagData.id);
			tagElement.className = "tag";
			tagElement.textContent = tagData.name;
			tagElement.id = `tag-${tagData.id}`;
			if (selectedTag === tagData.id) {
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
			const subDagsDocs = await getDocs(subTagCollection);
			var subTagSelect = document.createElement("select");
			subTagSelect.className = "tag-select";
			subTagSelect.id = `tag-select-${tagData.id}`;
			{
				var subTagElement = document.createElement("option");
				subTagElement.className = "tag";
				subTagElement.textContent = tagData.name;
				subTagElement.value = "";
				subTagElement.onclick = () => selectTag("all");
				subTagElement.id = `tag-${tagData.id}`;
				subTagElement.selected = true;
				subTagSelect.appendChild(subTagElement);
			}
			subDagsDocs.forEach((subTag) => {
				var subTagData = subTag.data();
				subTagData.id = `${tagData.id}/tags/${subTag.id}`;

				var subTagElement = document.createElement("option");
				subTagElement.onclick = () => selectTag(subTagData.id, tagData.id);
				subTagElement.className = "tag";
				subTagElement.textContent = subTagData.name;
				subTagElement.id = `tag-${subTagData.id}`;
				if (selectedTag === subTagData.id) {
					subTagElement.selected = true;
					subTagSelect.toggleAttribute("selected", true);
					selectedCategory = tagData.id;
				}
				subTagElement.value = subTagData.id;
				subTagSelect.appendChild(subTagElement);
			});
			tagsContainer.appendChild(subTagSelect);
		}
	});
});

async function fetchAndDisplayProjects() {
	let q = query(projectsCollection, orderBy("highlighted", "desc"));
	if (selectedTag && selectedTag !== "all") {
		q = query(q, where("tags", "array-contains", selectedTag));
	}
	onSnapshot(q, (projectDocs) => {
		projectsContainer.innerHTML = "";

		projectDocs.forEach((project) => {
			let projectData = project.data();
			projectData.id = project.id;

			if (
				projectData &&
				projectData.id &&
				projectData.name &&
				projectData.image
			) {
				var projectElement = document.createElement("a");
				projectElement.href = `/project/${projectData.id}/`;
				projectElement.className = "project";
				projectElement.innerHTML = `
                        <img src="${projectData.image}" alt="${projectData.name}" />
                        <h3>${projectData.name}</h3>`;
				projectElement.style.viewTransitionName = "project-" + projectData.id;
				projectsContainer.appendChild(projectElement);
			} else {
				console.warn("Skipping project with incomplete data:", projectData);
			}
		});

		if (projectDocs.empty) {
			projectsContainer.innerHTML =
				"<p>No projects found with all of the selected tags.</p>";
		}
	});
}

async function selectTag(tagId, tagCategoryId = "", pushState = true) {
	const tagElement = document.getElementById(`tag-${tagId}`);
	const searchParams = new URLSearchParams();
	searchParams.set("tagId", tagId);

	if (pushState) {
		history.pushState(
			null,
			"",
			window.location.pathname + `?${searchParams.toString()}`,
		);
	}

	if (tagId === selectedTag) {
		tagElement.toggleAttribute("selected", false);
		selectedTag = "all";
		document.getElementById(`tag-all`).toggleAttribute("selected", true);
		if (pushState) {
			history.pushState(null, "", window.location.pathname + `?tagId=all`);
		}
		if (selectedCategory) {
			document
				.getElementById(`tag-select-${selectedCategory}`)
				.toggleAttribute("selected", false);
			document.getElementById(`tag-${selectedCategory}`).selected = true;
			selectedCategory = "";
		}
	} else {
		document
			.getElementById(`tag-${selectedTag}`)
			?.toggleAttribute("selected", false);
		if (selectedCategory && selectedCategory !== tagCategoryId) {
			document.getElementById(`tag-${selectedCategory}`).selected = true;
			document
				.getElementById(`tag-select-${selectedCategory}`)
				.toggleAttribute("selected", false);
		}
		selectedTag = tagId;
		selectedCategory = tagCategoryId;

		if (selectedCategory) {
			document
				.getElementById(`tag-select-${selectedCategory}`)
				.toggleAttribute("selected", true);
		}
		tagElement.toggleAttribute("selected", true);
	}

	projectsContainer.innerHTML = projectsSkeletonLoader;
	await fetchAndDisplayProjects();
}

async function fetchAll() {
	await fetchAndDisplayProjects();
}

fetchAll();

window.onpopstate = function (event) {
	const urlParams = new URLSearchParams(event.target.location.search);
	const tagId = urlParams.get("tagId");
	selectTag(tagId || "all", false);
};
