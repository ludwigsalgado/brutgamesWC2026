import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBruD1Cd1z2v2eAdpDC_dxwmueDHiEhQv4",
    authDomain: "brutgamesunited2026.firebaseapp.com",
    projectId: "brutgamesunited2026",
    storageBucket: "brutgamesunited2026.firebasestorage.app",
    messagingSenderId: "1068840236536",
    appId: "1:1068840236536:web:bf57c80c72cac154b8520d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
