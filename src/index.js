import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAymRuyzskddedlToAKhbTxtN1gan2oJIM",
	authDomain: "turboa99.firebaseapp.com",
	projectId: "turboa99",
	storageBucket: "turboa99.appspot.com",
	messagingSenderId: "870083818836",
	appId: "1:870083818836:web:85066fd6c92740135c84c1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
