import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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

async function checkData() {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  console.log("Total users:", usersSnapshot.size);
  let count = 0;
  usersSnapshot.forEach(doc => {
    if (count < 5) {
      console.log("User:", doc.id, doc.data());
      count++;
    }
  });

  const classesSnapshot = await getDocs(collection(db, 'classes'));
  console.log("Total classes:", classesSnapshot.size);
  count = 0;
  classesSnapshot.forEach(doc => {
    if (count < 5) {
      console.log("Class:", doc.id, doc.data());
      count++;
    }
  });
}

checkData();
