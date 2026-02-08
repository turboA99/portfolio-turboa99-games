import {
	collection,
	getDocs,
	onSnapshot,
	query,
	where,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

import { firestore } from "/backend.js";

var projectsCollection = collection(firestore, "projects");
const q = query(projectsCollection, where("highlighted", "==", true));

var projectsContainer = document
	.getElementById("project-highlights")
	.querySelector(".projects-container");

onSnapshot(q, (projectsSnapshot) => {
	projectsContainer.innerHTML = "";
	projectsSnapshot.forEach((project) => {
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
	console.log(projectsSnapshot.metadata.fromCache ? "local cache" : "server");
	let projectElement = document.createElement("a");
	projectElement.href = `/projects`;
	projectElement.className = "project";
	projectElement.id = "all-projects";
	projectElement.textContent = "All Projects";
	projectsContainer.appendChild(projectElement);
});

async function fetchAndDisplayProjects() {}

fetchAndDisplayProjects();
