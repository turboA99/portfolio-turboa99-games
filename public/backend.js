import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
	browserLocalPersistence,
	browserSessionPersistence,
	indexedDBLocalPersistence,
	initializeAuth,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

import {
	initializeFirestore,
	persistentLocalCache,
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
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
	persistence: [
		indexedDBLocalPersistence,
		browserLocalPersistence,
		browserSessionPersistence,
	],
});
export const firestore = initializeFirestore(app, {
	localCache: persistentLocalCache(),
});

onAuthStateChanged(auth, async (user) => {
	if (user) {
		if (await isAdmin()) {
			if (!document.getElementById("admin-page-link")) {
				let adminLink = document.createElement("a");
				adminLink.href = "/admin";
				adminLink.id = "admin-page-link";
				adminLink.textContent = "Admin";
				if (window.location.pathname.startsWith("/admin/")) {
					adminLink.toggleAttribute("active", true);
				}
				document.querySelector("nav")?.appendChild(adminLink);
			}
		}
	}
});

async function isAdmin() {
	const user = auth.currentUser;
	if (!user) return false;

	const token = await user.getIdTokenResult();
	return token.claims.admin === true;
}
