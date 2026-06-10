import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

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

const mockTickets = [
  {
    schoolId: "kibriscik",
    schoolName: "Kıbrıscık YİBO",
    senderName: "yibo",
    senderRole: "admin",
    subject: "rehberlik formları",
    status: "answered",
    createdAt: "2026-04-08T10:36:00.000Z",
    messages: [
      {
        id: "1",
        senderName: "yibo",
        senderRole: "admin",
        content: "Rehberlik formlarına ulaşamıyorum.",
        date: "2026-04-08T10:30:00.000Z"
      },
      {
        id: "2",
        senderName: "Sistem Yöneticisi",
        senderRole: "superadmin",
        content: "Kontrol edip dönüş yapacağım.",
        date: "2026-04-08T10:36:00.000Z"
      }
    ]
  },
  {
    schoolId: "goynuk_orta",
    schoolName: "Göynük Ortaokulu",
    senderName: "goo",
    senderRole: "admin",
    subject: "Deneme Talep",
    status: "closed",
    createdAt: "2026-03-02T10:44:00.000Z",
    messages: [
      {
        id: "1",
        senderName: "goo",
        senderRole: "admin",
        content: "Bu bir deneme talebidir.",
        date: "2026-03-02T10:40:00.000Z"
      },
      {
        id: "2",
        senderName: "Sistem Yöneticisi",
        senderRole: "superadmin",
        content: "Talep kapatıldı.",
        date: "2026-03-02T10:44:00.000Z"
      }
    ]
  },
  {
    schoolId: "goynuk_iho",
    schoolName: "Göynük İmam Hatip Ortaokulu",
    senderName: "Sistem Yöneticisi",
    senderRole: "superadmin",
    subject: "Öğrenci Silinmiyor.",
    status: "open",
    createdAt: "2026-03-02T10:39:00.000Z",
    messages: [
      {
        id: "1",
        senderName: "Sistem Yöneticisi",
        senderRole: "superadmin",
        content: "Öğrenci silme işleminde hata alıyorum.",
        date: "2026-03-02T10:39:00.000Z"
      }
    ]
  }
];

async function seedTickets() {
  const snapshot = await getDocs(collection(db, 'tickets'));
  if (snapshot.size === 0) {
    for (const ticket of mockTickets) {
      await addDoc(collection(db, 'tickets'), ticket);
    }
    console.log("Mock tickets added.");
  } else {
    console.log("Tickets already exist.");
  }
}

seedTickets();
