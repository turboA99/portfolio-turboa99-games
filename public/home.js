import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  collection,
  getFirestore,
  getDocs,
  getDoc,
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

var highlights = collection(db, "highlights");

var projectsContainer = document
  .getElementById("project-highlights")
  .querySelector(".projects-container");
let loadingIndicator = document.createElement("h2");
loadingIndicator.textContent = "Loading projects...";
loadingIndicator.className = "loading-indicator";
projectsContainer.appendChild(loadingIndicator);

var projects = [];

async function fetchAndDisplayProjects() {
  try {
    const docsRefsSnapshot = await getDocs(highlights);
    const projectPromises = [];

    docsRefsSnapshot.forEach((docSnapshot) => {
      const projectDocRef = docSnapshot.data().ref;
      if (projectDocRef) {
        projectPromises.push(getDoc(projectDocRef));
      } else {
        console.warn(
          "Document reference not found in highlight:",
          docSnapshot.id
        );
      }
    });

    const projectDocs = await Promise.all(projectPromises);

    loadingIndicator.remove();

    const projects = projectDocs
      .map((doc) => {
        var data = doc.data();
        data.id = doc.id;
        return data;
      })
      .filter((data) => data);

    projects.forEach((projectData) => {
      console.log("Project Data:", projectData);
      if (
        projectData &&
        projectData.id &&
        projectData.name &&
        projectData.image
      ) {
        var projectElement = document.createElement("a");
        projectElement.href = `/project/?id=${projectData.id}`;
        projectElement.className = "project";
        projectElement.innerHTML = `
                <img src="${projectData.image}" alt="${projectData.name}" />
                <h3>${projectData.name}</h3>`;
        projectsContainer.appendChild(projectElement);
      } else {
        console.warn("Skipping project with incomplete data:", projectData);
      }
      var projectElement = document.createElement("a");
      projectElement.href = `/projects`;
      projectElement.className = "project";
      projectElement.id = "all-projects";
      projectElement.textContent = "All Projects";
      projectsContainer.appendChild(projectElement);
    });
  } catch (error) {
    console.error("Error fetching projects: ", error);
    projectsContainer.innerHTML =
      "<p>Could not load projects. Please try again later.</p>";
  }
}

fetchAndDisplayProjects();
