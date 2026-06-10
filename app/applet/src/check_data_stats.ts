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

async function checkData() {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  console.log("Total users:", usersSnapshot.size);
  
  const stats: any = {};
  
  usersSnapshot.forEach(doc => {
    const user = doc.data();
    if (user.schoolId) {
      if (!stats[user.schoolId]) {
        stats[user.schoolId] = { studentCount: 0, teacherCount: 0, classCount: 0 };
      }
      if (user.role === 'student') stats[user.schoolId].studentCount++;
      if (user.role === 'teacher') stats[user.schoolId].teacherCount++;
    }
  });

  const classesSnapshot = await getDocs(collection(db, 'classes'));
  console.log("Total classes:", classesSnapshot.size);
  
  classesSnapshot.forEach(doc => {
    const cls = doc.data();
    if (cls.schoolId) {
      if (!stats[cls.schoolId]) {
        stats[cls.schoolId] = { studentCount: 0, teacherCount: 0, classCount: 0 };
      }
      stats[cls.schoolId].classCount++;
    }
  });
  
  console.log("Calculated Stats:", stats);
}

checkData();
