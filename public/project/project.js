import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getFirestore,
  doc,
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

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");

const docRef = doc(db, "projects", projectId);
const docSnapshot = await getDoc(docRef);

document.getElementById("project-name").textContent = docSnapshot.data().name;
document.getElementById("project-image").src = docSnapshot.data().image;
document.getElementById("project-image").alt = docSnapshot.data().name;
const date = new Date(docSnapshot.data().date.seconds * 1000);
document.getElementById("project-date").dateTime = date;
document.getElementById("project-date").textContent = date.toLocaleDateString(
  date.getTimezoneOffset(),
  {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
);
document.getElementById("content").innerHTML = docSnapshot.data().content;

docSnapshot.data().tags.forEach(async (tagRef) => {
  const tag = await getDoc(tagRef);
  if (!tag) return;
  const tagElement = document.createElement("span");
  tagElement.textContent = tag.data().name;
  document.getElementById("project-tags").appendChild(tagElement);
});
