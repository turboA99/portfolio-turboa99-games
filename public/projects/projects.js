import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  collection,
  getFirestore,
  getDocs,
  query,
  orderBy,
  where,
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

const projectsCollection = collection(db, "projects");
const projectsContainer = document.getElementById("projects-container");

const tagsCollection = collection(db, "tags");
const tagsContainer = document.getElementById("tags-container");

var selectedTag = "";
var selectedCategory = "";
const urlParams = new URLSearchParams(window.location.search);
const tagId = urlParams.get("tagId");
if (tagId) {
  selectedTag = tagId;
} else {
  selectedTag = "all";
  history.replaceState(
    null,
    "",
    window.location.pathname + `?tagId=${selectedTag}`
  );
}
let loadingIndicator = document.createElement("h2");
loadingIndicator.textContent = "Loading projects...";
loadingIndicator.className = "loading-indicator";
projectsContainer.appendChild(loadingIndicator);

async function fetchAndDisplayTags() {
  try {
    const tagsDocs = await getDocs(tagsCollection);
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
        var tagElement = document.createElement("a");
        tagElement.onclick = () => selectTag(tagData.id);
        tagElement.className = "tag";
        tagElement.textContent = tagData.name;
        tagElement.id = `tag-${tagData.id}`;
        if (selectedTag === tagData.id) {
          tagElement.toggleAttribute("selected", true);
        }
        tagsContainer.appendChild(tagElement);
      } else {
        const subTagCollection = collection(db, "tags", tagData.id, "tags");
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
          subTagData.id = subTag.id;

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
  } catch (error) {
    console.error("Error fetching tags: ", error);
    tagsContainer.innerHTML =
      "<p>Could not load tags. Please try again later.</p>";
  }
}

async function fetchAndDisplayProjects() {
  let q = query(projectsCollection, orderBy("highlighted", "desc"));
  if (selectedTag && selectedTag !== "all") {
    q = query(q, where("tags", "array-contains", selectedTag));
  }
  console.log("Fetching projects with query:", q);

  try {
    const projectDocs = await getDocs(q);

    loadingIndicator.style.display = "none";

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
        projectsContainer.appendChild(projectElement);
      } else {
        console.warn("Skipping project with incomplete data:", projectData);
      }
    });

    if (projectDocs.empty) {
      projectsContainer.innerHTML =
        "<p>No projects found with all of the selected tags.</p>";
    }
  } catch (error) {
    console.error("Error fetching projects: ", error);
    projectsContainer.innerHTML =
      "<p>Could not load projects. Please try again later.</p>";
  }
}

async function selectTag(tagId, tagCategoryId = "", pushState = true) {
  const tagElement = document.getElementById(`tag-${tagId}`);

  if (pushState) {
    history.pushState(null, "", window.location.pathname + `?tagId=${tagId}`);
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

  projectsContainer.innerHTML = "";
  loadingIndicator = document.createElement("h2");
  loadingIndicator.textContent = "Loading projects...";
  loadingIndicator.className = "loading-indicator";
  projectsContainer.appendChild(loadingIndicator);
  await fetchAndDisplayProjects();
}

async function fetchAll() {
  await fetchAndDisplayTags();
  await fetchAndDisplayProjects();
}

fetchAll();

window.onpopstate = function (event) {
  const urlParams = new URLSearchParams(event.target.location.search);
  const tagId = urlParams.get("tagId");
  selectTag(tagId || "all", false);
};
