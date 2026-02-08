import {
	doc,
	getDoc,
	onSnapshot,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { firestore } from "/backend.js";

const urlParams = new URLSearchParams(window.location.search);
let projectId = urlParams.get("id");

if (!projectId) {
	projectId = location.href
		.split("/")
		.filter((str) => str)
		.pop();
}

document.querySelector("main").style.viewTransitionName =
	"project-" + projectId;

if (projectId) {
	onSnapshot(doc(firestore, "projects", projectId), (docSnapshot) => {
		var projectTitle = document.createElement("h1");
		projectTitle.textContent = docSnapshot.data().name;
		document.getElementById("project-name").appendChild(projectTitle);
		document.title = docSnapshot.data().name + " - TurboA99";
		if (docSnapshot.data().github) {
			var githubIcon = document.createElement("i");
			githubIcon.className = "fa fa-github";
			githubIcon.setAttribute("aria-hidden", "true");

			var githubLink = document.createElement("a");
			githubLink.href = docSnapshot.data().github;
			githubLink.target = "_blank";
			githubLink.appendChild(githubIcon);
			githubLink.id = "github-link";
			document.getElementById("project-name").appendChild(githubLink);
			document.getElementById("project-name");
		}

		if (docSnapshot.data().link) {
			var webIcon = document.createElement("i");
			webIcon.className = "fa fa-globe";
			webIcon.setAttribute("aria-hidden", "true");

			var webLink = document.createElement("a");
			webLink.href = docSnapshot.data().link;
			webLink.target = "_blank";
			webLink.appendChild(webIcon);
			webLink.id = "download-link";
			document.getElementById("project-name").appendChild(webLink);
		}

		if (docSnapshot.data().download) {
			var downloadIcon = document.createElement("i");
			downloadIcon.className = "fa fa-download";
			downloadIcon.setAttribute("aria-hidden", "true");

			var downloadLink = document.createElement("a");
			downloadLink.href = docSnapshot.data().download;
			downloadLink.target = "_blank";
			downloadLink.appendChild(downloadIcon);
			downloadLink.id = "download-link";
			document.getElementById("project-name").appendChild(downloadLink);
		}

		document.getElementById("project-image").src = docSnapshot.data().image;
		document.getElementById("project-image").alt = docSnapshot.data().name;
		const date = new Date(docSnapshot.data().date.seconds * 1000);
		document.getElementById("project-date").dateTime = date;
		document.getElementById("project-date").textContent =
			date.toLocaleDateString(date.getTimezoneOffset(), {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		if (docSnapshot.data().lastModified) {
			const lastModified = new Date(
				docSnapshot.data().lastModified.seconds * 1000,
			);
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
		}
		document.getElementById("content").innerHTML = docSnapshot.data().content;

		docSnapshot.data().tags.forEach(async (tagId) => {
			onSnapshot(doc(firestore, "tags", tagId), (tag) => {
				if (!tag) return;
				const tagElement = document.createElement("a");
				tagElement.textContent = tag.data().name;
				const searchParams = new URLSearchParams();
				searchParams.set("tagId", tagId);
				tagElement.href = `/projects/?${searchParams.toString()}`;
				tagElement.className = "tag";
				document.getElementById("project-tags").appendChild(tagElement);
			});
		});
	});
}
