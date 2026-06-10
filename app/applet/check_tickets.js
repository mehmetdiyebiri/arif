import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVZHrDnPfCZhy2kv_PU2XHqW-1b2fqqgo",
  authDomain: "gihosistem.firebaseapp.com",
  projectId: "gihosistem",
  storageBucket: "gihosistem.firebasestorage.app",
  messagingSenderId: "826788368080",
  appId: "1:826788368080:web:a17f652d5379b9335458d5",
  measurementId: "G-E3RHM9GBMB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkTickets() {
  const snapshot = await getDocs(collection(db, 'tickets'));
  console.log("Tickets count:", snapshot.size);
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}

checkTickets();
