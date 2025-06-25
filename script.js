
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

let username = "";

function start() {
  username = document.getElementById("name").value.trim();
  if (!username) return alert("Введите имя!");
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("main-container").classList.remove("hidden");
  loadAllContent();
}

function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
  document.getElementById(tab).classList.remove("hidden");
}

function showPopup(type) {
  document.getElementById("popup-" + type).classList.remove("hidden");
}

function publishPost() {
  const text = document.getElementById("post-text").value;
  db.collection("posts").add({ text, user: username, time: Date.now() });
  document.getElementById("post-text").value = "";
  document.getElementById("popup-post").classList.add("hidden");
  loadAllContent();
}

function publishVideo() {
  const file = document.getElementById("video-file").files[0];
  if (!file) return;
  const ref = storage.ref("videos/" + Date.now() + "_" + file.name);
  ref.put(file).then(snapshot => {
    ref.getDownloadURL().then(url => {
      db.collection("videos").add({ url, user: username, time: Date.now(), name: file.name });
      document.getElementById("popup-video").classList.add("hidden");
      loadAllContent();
    });
  });
}

function loadAllContent() {
  const postEl = document.getElementById("posts");
  postEl.innerHTML = "";
  db.collection("posts").orderBy("time", "desc").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "post";
      div.innerText = `${data.user}: ${data.text}`;
      postEl.appendChild(div);
    });
  });

  const videoList = document.getElementById("video-list");
  videoList.innerHTML = "";
  db.collection("videos").orderBy("time", "desc").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const video = document.createElement("video");
      video.src = data.url;
      video.controls = true;
      video.style.maxWidth = "100%";
      videoList.appendChild(video);
    });
  });
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function logout() {
  location.reload();
}
