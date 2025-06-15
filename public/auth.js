import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

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

const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (await isAdmin()) {
      var adminLiElement = document.createElement("li");
      var adminAElement = document.createElement("a");
      adminAElement.href = "/admin";
      adminAElement.textContent = "Admin";
      adminLiElement.appendChild(adminAElement);
      if (window.location.pathname === "/admin/") {
        adminLiElement.toggleAttribute("active", true);
      }
      document.querySelector("nav > ul").appendChild(adminLiElement);
    }
  } else {
  }
});

async function isAdmin() {
  const user = auth.currentUser;
  if (!user) return false;

  const token = await user.getIdTokenResult();
  return token.claims.admin === true;
}
