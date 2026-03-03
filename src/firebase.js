import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBruD1Cd1z2v2eAdpDC_dxwmueDHiEhQv4",
    authDomain: "brutgamesunited2026.firebaseapp.com",
    projectId: "brutgamesunited2026",
    storageBucket: "brutgamesunited2026.firebasestorage.app",
    messagingSenderId: "1068840236536",
    appId: "1:1068840236536:web:690b958309a0c52eb8520d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);
