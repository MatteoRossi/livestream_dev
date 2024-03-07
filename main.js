import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc, increment, collection, query, orderBy} from "firebase/firestore";

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

const q = query(collection(db, "livestreams/mll2hccPnNBua9PWcE0x/updates"), orderBy("created", "asc"));
const updates = onSnapshot(q, (querySnapshot) => {
  const data = [];
  querySnapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const liveUpdateList = document.getElementById('live_update_list');
        const card = document.createElement('div');
        card.id = change.doc.id;
        card.className = "live_update_card";
        card.style = "max-width: min(500px, 90vw); background-color: #f9f9f9; padding: 1em; border-radius: 8px;";
        card.innerHTML = `
          <p style="font-size: 14px; font-weight: 400; text-align: left;">${change.doc.data().textEn}</p>
          <div class="live_update_card_reaction_board" style="display: flex; flex-direction: row; justify-content: space-between;">
          <div class="live_update_card_reaction_buttons">
          <button data-id="${change.doc.id}" class="live_update_button" style="border-radius: 8px; border: 1px solid transparent; padding: 0.6em 1.2em; font-size: 0.5em; font-weight: 500; font-family: inherit; background-color: #e5e5e5; cursor: pointer; transition: border-color 0.25s;">${change.doc.data().emojiCount} ${change.doc.data().emoji}</button>
      </div>
              <div data-share="${change.doc.data().shareEn}" class="live_update_card_reaction_share">
              <button data-id="x" class="live_update_button" style="border-radius: 8px; border: 1px solid transparent; padding: 0.6em 1.2em; font-size: 0.5em; font-weight: 500; font-family: inherit; background-color: #e5e5e5; cursor: pointer; transition: border-color 0.25s;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-twitter-x" viewbox="0 0 16 16">
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
              </svg>
            </button>
            <button data-id="t" class="live_update_button" style="border-radius: 8px; border: 1px solid transparent; padding: 0.6em 1.2em; font-size: 0.5em; font-weight: 500; font-family: inherit; background-color: #e5e5e5; cursor: pointer; transition: border-color 0.25s;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-threads" viewbox="0 0 16 16">
            <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
          </svg>
          </button>
              <!-- Additional content -->
          </div>
        `;

        // Prepend the new card to make it appear at the top of the list
        liveUpdateList.prepend(card);
      }
      if (change.type === "modified") {
        document.getElementById(change.doc.id).innerHTML = `
        <p style="font-size: 14px; font-weight: 400; text-align: left;">${change.doc.data().textEn}</p>
        <div class="live_update_card_reaction_board" style="display: flex; flex-direction: row; justify-content: space-between;">
            <div class="live_update_card_reaction_buttons">
                <button data-id="${change.doc.id}" class="live_update_button" style="border-radius: 8px; border: 1px solid transparent; padding: 0.6em 1.2em; font-size: 0.5em; font-weight: 500; font-family: inherit; background-color: #e5e5e5; cursor: pointer; transition: border-color 0.25s;">${change.doc.data().emojiCount} ${change.doc.data().emoji}</button>
            </div>
            <div data-share="${change.doc.data().shareEn}" class="live_update_card_reaction_share">
              <button data-id="x" class="live_update_button" style="border-radius: 8px; border: 1px solid transparent; padding: 0.6em 1.2em; font-size: 0.5em; font-weight: 500; font-family: inherit; background-color: #e5e5e5; cursor: pointer; transition: border-color 0.25s;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-twitter-x" viewbox="0 0 16 16">
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
              </svg>
            </button>
            <button data-id="t" class="live_update_button" style="border-radius: 8px; border: 1px solid transparent; padding: 0.6em 1.2em; font-size: 0.5em; font-weight: 500; font-family: inherit; background-color: #e5e5e5; cursor: pointer; transition: border-color 0.25s;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-threads" viewbox="0 0 16 16">
            <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
          </svg>
          </button>
            </div>
        </div>
        `
      }
    });

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

/* UPDATE LIST COMPONENT */
document.getElementById('live_update_component').innerHTML = `
    <div id="live_update_header">Budget 2024 Live Feed<br>Follow here for the latest updates!</div>
    <div id="live_update_list">
    </div>
    <div id="live_update_list_end">Stay tuned here for more updates as they get delivered!</div>
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

// Add an event listener for the 'contentchanged' event for each button
document.querySelectorAll('.reactions_count').forEach(button => {
  button.addEventListener('contentchanged', function(e) {
    animateButton(e.target);
  });
});


/* LIVE UPDATE CLICK HANDLER */

document.getElementById('live_update_list').addEventListener('click', (event) => {
  
  const target = event.target;
  const isReactionButton = target.classList.contains('live_update_button') && target.closest('.live_update_card_reaction_buttons');
  const isShareButton = target.classList.contains('live_update_button') && target.closest('.live_update_card_reaction_share');

  if (isReactionButton) {
      const docId = target.closest('.live_update_card').id; // Assuming the closest parent with an ID is the document's container
      const reactionRef = doc(db, "livestreams/mll2hccPnNBua9PWcE0x/updates", docId);
      
      // Increment emojiCount in Firestore
      updateDoc(reactionRef, {
          emojiCount: increment(1)
      }).catch(console.error);
  }

  if(isShareButton) {
    const shareText = encodeURIComponent(target.closest('.live_update_card_reaction_share').getAttribute('data-share'))
    
    console.log(shareText);

    const sharePlatform =  target.getAttribute('data-id');

    if(sharePlatform === 'x') {
      //encode the sharetext
      const shareLink = `https://twitter.com/intent/tweet?text=${shareText}`
      window.open(shareLink, '_blank');
      return;
    }
    else if(sharePlatform === 't') {
      const shareLink = `https://threads.net/intent/post?text=${shareText}`
      window.open(shareLink, '_blank');
      return;
    }

  }

});

