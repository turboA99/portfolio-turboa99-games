import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { firestore } from "/backend.js";

const projectsCollection = collection(firestore, "projects");

const projectsContainer = document.getElementById("projects-container");

onSnapshot(projectsCollection, (projectDocs) => {
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
                            <span class="material-symbols-outlined"> delete </span>`;
			projectElement.style.viewTransitionName = "project-" + projectData.id;
			projectElement.onclick = () => {
				deleteProject(doc(firestore, "projects", projectData.id));
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

function deleteProject(projectReference) {
	if (
		window.confirm(
			"Are you sure you want to delete this project? The action CANNOT be undone",
		)
	) {
		deleteDoc(projectReference);
	}
}
