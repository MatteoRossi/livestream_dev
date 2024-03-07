import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, addDoc, collection, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnA_2p1ef6MlnQ9BB2zE446DNGGy7g0ac",
  authDomain: "forum-8423f.firebaseapp.com",
  projectId: "forum-8423f",
  storageBucket: "forum-8423f.appspot.com",
  messagingSenderId: "834054366177",
  appId: "1:834054366177:web:45b07b4c8cc580cec968a0"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore();

const submit = document.getElementById('submit');
const textEn = document.getElementById('textEn');
const textFn = document.getElementById('textFn');
const shareEn = document.getElementById('shareEn');
const shareFn = document.getElementById('shareFn');
const emoji = document.getElementById('emoji');

submit.addEventListener('click', () => {

  addDoc(collection(db, "livestreams", "mll2hccPnNBua9PWcE0x", "updates"), {
    textEn: textEn.value,
    textFn: textFn.value,
    shareEn: shareEn.value,
    shareFn: shareFn.value,
    emoji: emoji.value,
    emojiCount: 0,
    created: serverTimestamp()
  }).catch(console.error);

})