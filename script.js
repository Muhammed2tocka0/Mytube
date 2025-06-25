
let currentUser = null;

auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user) startApp();
  else showAuth();
});

function showAuth() {
  document.getElementById("auth-container").classList.remove("hidden");
  document.getElementById("main-container").classList.add("hidden");
}

function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(uc => uc.user.updateProfile({ displayName: name }))
    .catch(err => alert(err.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut();
}

function startApp() {
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("main-container").classList.remove("hidden");
  listenVideos();
}

function publishVideo() {
  const file = document.getElementById("video-file").files[0];
  const title = prompt("Название видео:");
  if (!file || !title) return;
  const id = Date.now();
  const ref = storage.ref("videos/" + id);
  ref.put(file)
    .then(() => ref.getDownloadURL())
    .then(url => db.collection("videos").add({
      title, url, author: currentUser.displayName, timestamp: Date.now()
    }))
    .then(() => alert("Загружено!"))
    .catch(err => alert(err.message));
}

function listenVideos() {
  db.collection("videos").orderBy("timestamp", "desc")
    .onSnapshot(snap => {
      const list = document.getElementById("video-list");
      list.innerHTML = "";
      snap.forEach(doc => {
        const v = doc.data();
        const el = document.createElement("div");
        el.innerHTML = `<strong>${v.author}</strong> — ${v.title}<br><video src="${v.url}" controls></video>`;
        list.appendChild(el);
      });
    });
}
