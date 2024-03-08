import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc, increment, collection, query, orderBy} from "firebase/firestore";
import html2canvas from "html2canvas";

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

let lastReactionsCount = { like: 0, love: 0, cheer: 0 };
let userTriggeredUpdate = false;
let isFirstLoad = true;
let isLive = false;

const qSettings = query(doc(db, "livestreams", "mll2hccPnNBua9PWcE0x"));

const settings = onSnapshot(qSettings, (doc) => {
  if(doc.data().live) {
    isLive = true;
    document.getElementById('video_player').innerHTML = `
      <iframe class='iframe' src="${doc.data().stream}"
      title="YouTube video player" frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
      </iframe>
    `
    document.querySelectorAll('.reactions_count').forEach(count => {
      count.querySelector('.count').style.display = 'block';
      count.querySelector('.placeholder').style.display = 'none';
    })

  }
  else {
    isLive = false;
    document.getElementById('video_player').innerHTML = `
      <img class='iframe' src= "https://firebasestorage.googleapis.com/v0/b/forum-8423f.appspot.com/o/livestream%2Fposter.jpg?alt=media&token=052dca3e-e347-47bb-90a2-d26588ac1adf" />
    `

    document.querySelectorAll('.reactions_count').forEach(count => {
      count.querySelector('.count').style.display = 'none';
      count.querySelector('.placeholder').style.display = 'block';

    })
  }
});

const reactions = onSnapshot(doc(db, "livestreams/mll2hccPnNBua9PWcE0x/reactions", "reactionsCounts"), (doc) => {
  const data = doc.data();

  Object.keys(data).forEach(key => {
    document.querySelector(`#reactions_${key}_count`).innerHTML = `${data[key]}`;
    if (data[key] > lastReactionsCount[key] && !userTriggeredUpdate && !isFirstLoad) {
      createAndAnimateEmoji(key);
      triggerContentChangedEvent(`reactions_${key}_count`);
    }
    //also triggercontentchanged event when user triggered update
    if (data[key] > lastReactionsCount[key] && userTriggeredUpdate) {
      triggerContentChangedEvent(`reactions_${key}_count`);
    }
    lastReactionsCount[key] = data[key];
    
  });

  isFirstLoad = false;

  // Reset the userTriggeredUpdate flag after handling the update
  if (userTriggeredUpdate) {
    userTriggeredUpdate = false;
  }
});

/* CONTENT HANLDER */

/* VIDEO REACTION COMPONENT */
document.getElementById('video_reaction_component').innerHTML = `
  <div id="video_player">
    <img class='iframe' src= "https://firebasestorage.googleapis.com/v0/b/forum-8423f.appspot.com/o/livestream%2Fposter.jpg?alt=media&token=052dca3e-e347-47bb-90a2-d26588ac1adf" />
  </div>
  <div id="reaction_board">
  <div class='reaction' id="reactions_cheer">
      <div><span class="reactions_count"><span class="count" id="reactions_cheer_count"></span><span class="placeholder">-</span></span></div>
      <button name='cheer' class="reaction_button">
          🥳
      </button>
  </div>
  <div class='reaction' id="reactions_like">
      <div><span class="reactions_count"><span class="count" id="reactions_like_count"></span><span class="placeholder">-</span></span></div>
      <button name='like' class="reaction_button">👍</button>
  </div>
  <div class='reaction' id="reactions_love">
      <div><span class="reactions_count"><span class="count" id="reactions_love_count"></span><span class="placeholder">-</span></span></div>
      <button name='love' class="reaction_button">😍</button>
  </div>
  </div>
`

document.getElementById('bingo_component').innerHTML = `
<div id="bingo_export">
<div class="bingo-header">Budget 2024 Bingo!</div>
<div class="bingo-sheet">
    <div class="bingo-section" data-section="1">
        <div class="active"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
        <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
      </svg></div>
      Conservatives boo progress for Canadians.</div>
    <div class="bingo-section" data-section="2">
        <div class="active"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
          </svg></div>$10-a-day child care</div>
    <div class="bingo-section" data-section="3">
        <div class="active"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
          </svg></div>Pierre Poilievre misleads Canadians about fixing the budget.</div>
    <div class="bingo-section" data-section="4">
        <div class="active"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
          </svg></div>Liberal Pharmacare mention.</div>
    <div class="bingo-section" data-section="5">
        <div class="active"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
          </svg></div>Add your name to support our progress<a href='liberal.ca'> here</a></div>
    <div class="bingo-section" data-section="6">
        <div class="active"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
          </svg></div>All provinces/territories get a mention.</div>
    <div class="bingo-section" data-section="7">
        <div class="active"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
          </svg></div>Conservatives don't clap at children getting the dental care they need.</div>
    <div class="bingo-section" data-section="8">
        <div class="active"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
          </svg></div>Chrystia Freeland say: "You shouldn't have to choose between X and Y"</div>
    <div class="bingo-section" data-section="9">
        <div class="active"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z"/>
          </svg></div>Speaker of the House says: "point of order".</div>
</div>
</div>
<div class="bingo-message" id="bingo-message">
<div style="    font-weight: bold; font-size: 1.2em;">You got a BINGO!</div>
<div>
    <p style="font-size: 1eem;">1) Share your <b>#BudgetBingo</b> sheet on social!</p>
    <a id='share-sheet-button' class="share-button">Share!</a>
</div>
<div style="gap:1em;">
    <p style="font-size: 1eem;">2) <b>Donate</b> to support our progress.</p>
    <a class="share-button">Donate!</a>
</div>
</div>
`

/* EMOJI CLICK HANDLER */

let lastClickTime = 0;
const debounceInterval = 500; 

document.querySelectorAll('.reaction_button').forEach(button => {
  button.addEventListener('click', () => {

    const currentTime = Date.now();

    if (currentTime - lastClickTime < debounceInterval) {
      console.log('Too many clicks, try again later.');
      return; // Exit the function if clicked too quickly
    }

    lastClickTime = currentTime; // Update the last click time

    const reaction = button.name;
    userTriggeredUpdate = true; // Set the flag to indicate a user-triggered update
    createAndAnimateEmoji(reaction, true); // Now passing a flag to indicate user-triggered
    
    const reactionsRef = doc(db, "livestreams/mll2hccPnNBua9PWcE0x/reactions", "reactionsCounts");
    updateDoc(reactionsRef, {
      [reaction]: increment(1)
    });
  });
});

function createAndAnimateEmoji(emojiType, isUserTriggered = false) {
  var emojiList = {
    "like": '👍',
    "love": '😍', 
    "cheer": '🥳'
  };

  var emoji = document.createElement('div');
  emoji.textContent = emojiList[emojiType]; // Random emoji
  emoji.style.position = 'absolute';
  emoji.style.bottom = '0';
  emoji.style.left = `${Math.random() * 20}%`; // Random starting position
  emoji.style.fontSize = '24px';
  document.getElementById('video_player').appendChild(emoji);

  // customize emoji if user triggered
  if (isUserTriggered) {
    //add a "you" badge to the emoji
    var badge = document.createElement('div');
    badge.textContent = 'You';
    badge.style.position = 'absolute';
    badge.style.bottom = '-20px';
    badge.style.left = '0px';
    badge.style.fontSize = '12px';
    badge.style.color = 'white';
    badge.style.backgroundColor = 'red';
    badge.style.padding = '2px 4px';
    badge.style.borderRadius = '4px';
    emoji.appendChild(badge);
  }

  var duration = 3000 + Math.random() * 2000; // Random duration between 3 and 5 seconds

  var startTime = null;

  function animate(time) {
    if (!startTime) startTime = time;
    var timeElapsed = time - startTime;
    // Normalized timeElapsed to range from 0 to 1
    var normalizedTimeElapsed = timeElapsed / duration;

    // Custom easing: faster in the first 30%, then normal speed
    var progress;
    if (normalizedTimeElapsed < 0.3) {
        // Accelerate progress in the first 30%
        // Adjust the multiplier to control the acceleration
        progress = normalizedTimeElapsed * 2; // Example: make it move faster
    } else {
        // After 30%, continue at normal pace, adjusting for the initial boost
        // The magic number 0.6 balances out the accelerated part to ensure smooth transition
        progress = 0.6 + (normalizedTimeElapsed - 0.3);
    }

    if (progress < 1) {
        emoji.style.bottom = `${progress * 100}%`; // Move emoji up
        requestAnimationFrame(animate);
    } else {
        emoji.remove(); // Remove emoji after it reaches the top
    }
}

  requestAnimationFrame(animate);
}

/* EMOJI COUNT ANIMATION HANDLER */

function triggerContentChangedEvent(buttonId) {
  const event = new CustomEvent('contentchanged');
  document.getElementById(buttonId).dispatchEvent(event);
}

// Function to add the animation class and remove it after the animation ends
function animateButton(button) {
  button.classList.add('button-animate');
  button.addEventListener('animationend', () => {
    button.classList.remove('button-animate');
  });
}


/* BINGO SHEET */

const winningCombinations = [
  ['1', '2', '3'], // First row
  ['4', '5', '6'], // Second row
  ['7', '8', '9'], // Third row
  ['1', '4', '7'], // First column
  ['2', '5', '8'], // Second column
  ['3', '6', '9'], // Third column
  ['1', '5', '9'], // Diagonal from top-left to bottom-right
  ['3', '5', '7']  // Diagonal from top-right to bottom-left
];

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.bingo-section');
  const bingoMessage = document.getElementById('bingo-message');

  sections.forEach(section => {
    section.addEventListener('click', () => {
      section.querySelector('.active').classList.toggle('show');
      checkForBingo();
    });
  });

  function checkForBingo() {
    for (let combination of winningCombinations) {
      const hasBingo = combination.every(sectionId => {
        return document.querySelector(`[data-section="${sectionId}"]`).querySelector('.active').classList.contains('show');
      });

      if (hasBingo) {
        bingoMessage.style.display = 'flex'; // Show "BINGO!" message
        break; // Stop checking after finding a Bingo
      }
      else{
        bingoMessage.style.display = 'none';
      }
    }
  }


});

document.getElementById('share-sheet-button').addEventListener('click', () => {
  html2canvas(document.getElementById('bingo_export')).then(function(canvas) {
    //download the image

    if(navigator.canShare && (navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    )) {
      var blob = new Blob([canvas.toDataURL()], {type: 'image/png'});
      var file = new File([blob], 'bingo.png', {type: 'image/png'});

      navigator.share({
        files: [file],
        text: 'Check out my #BudgetBingo sheet!'
      })    
    }
    else{
      var link = document.createElement('a');
      link.download = 'bingo.png';
      link.href = canvas.toDataURL();
      link.click();
    }
    
});
})