import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCIHf2sdQAMyanvCRfPtKtrg-ZoxqxGMTU",
  authDomain: "borbor-1260e.firebaseapp.com",
  projectId: "borbor-1260e",
  storageBucket: "borbor-1260e.firebasestorage.app",
  messagingSenderId: "662138581345",
  appId: "1:662138581345:web:f81ec38ed14b1dbfe71520"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

