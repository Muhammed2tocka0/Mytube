let currentUser = { name: "Пользователь" };

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function startApp() {
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("main-container").classList.remove("hidden");

  const avatar = localStorage.getItem("avatar");
  if (avatar) {
    document.getElementById("avatar-img").src = avatar;
  } else {
    document.getElementById("avatar-img").alt = currentUser.name[0].toUpperCase();
  }

  loadSavedContent();
}

function logout() {
  location.reload();
}

function toggleMenu() {
  document.getElementById("menu").classList.toggle("hidden");
}

function showPopup(type) {
  document.getElementById(`popup-${type}`).classList.toggle("hidden");
}

function getData(type) {
  return JSON.parse(localStorage.getItem(type)) || [];
}

function saveData(type, data) {
  localStorage.setItem(type, JSON.stringify(data));
}

function publishPost() {
  const text = document.getElementById("post-text").value.trim();
  if (!text) return;
  const post = {
    id: generateId(),
    user: currentUser.name,
    text,
    likes: 0,
    comments: []
  };
  addPost(post);
  const posts = getData("posts");
  posts.unshift(post);
  saveData("posts", posts);

  document.getElementById("post-text").value = "";
  showPopup("post");
}

function addPost(post) {
  const el = document.createElement("div");
  el.className = "post";
  el.dataset.id = post.id;
  el.innerHTML = `
    <strong>${post.user}</strong>
    <p>${post.text}</p>
    <button onclick="like(this, 'posts')">❤️</button> <span>${post.likes}</span>
    <div class="comment">
      <input placeholder="Коммент..." onkeypress="sendComment(event, this, 'posts')">
      ${post.comments.map(c => `<div>${c}</div>`).join('')}
    </div>
  `;
  document.getElementById("posts").prepend(el);
}

function publishVideo() {
  const file = document.getElementById("video-file").files[0];
  const title = prompt("Введите название видео:");
  if (!file || !title) return alert("Выберите видео и введите название!");

  const reader = new FileReader();
  reader.onload = () => {
    const video = document.createElement("video");
    video.src = reader.result;

    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const aspectRatio = width / height;

      const isShort = aspectRatio < 1;
      const type = isShort ? "shorts" : "videos";
      const videoData = {
        id: generateId(),
        user: currentUser.name,
        title,
        src: reader.result,
        likes: 0,
        comments: []
      };

      addVideo(videoData, type);
      const list = getData(type);
      list.unshift(videoData);
      saveData(type, list);

      showPopup("video");
    };
  };
  reader.readAsDataURL(file);
}

function addVideo(video, type = "videos") {
  const el = document.createElement("div");
  el.className = type === "shorts" ? "video shorts-video" : "video";
  el.dataset.id = video.id;
  el.innerHTML = `
    <strong>${video.user}</strong>
    <h3>${video.title}</h3>
    <video src="${video.src}" controls></video>
    <button onclick="like(this, '${type}')">❤️</button> <span>${video.likes}</span>
    <div class="comment">
      <input placeholder="Коммент..." onkeypress="sendComment(event, this, '${type}')">
      ${video.comments.map(c => `<div>${c}</div>`).join('')}
    </div>
  `;

  const container = type === "shorts" ? "shorts-list" : "video-list";
  document.getElementById(container).prepend(el);
}

function like(btn, type) {
  const parent = btn.closest("[data-id]");
  const id = parent.dataset.id;
  const data = getData(type);
  const item = data.find(i => i.id === id);
  if (item) {
    item.likes++;
    saveData(type, data);
    btn.nextElementSibling.textContent = item.likes;
  }
}

function sendComment(e, input, type) {
  if (e.key === "Enter" && input.value.trim()) {
    const parent = input.closest("[data-id]");
    const id = parent.dataset.id;
    const data = getData(type);
    const item = data.find(i => i.id === id);
    if (item) {
      const commentText = `${currentUser.name}: ${input.value.trim()}`;
      item.comments.push(commentText);
      saveData(type, data);

      const div = document.createElement("div");
      div.textContent = commentText;
      input.parentElement.appendChild(div);
      input.value = "";
    }
  }
}

function changeAvatar() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById("avatar-img").src = reader.result;
      localStorage.setItem("avatar", reader.result);
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function toggleTheme() {
  const dark = document.body.classList.toggle("dark");
  document.getElementById("theme-btn").textContent = dark ? "🌙" : "🌞";
}

function filterVideos() {
  const query = document.getElementById("video-search").value.toLowerCase();
  const videos = document.querySelectorAll("#video-list .video");
  videos.forEach(video => {
    const text = video.textContent.toLowerCase();
    video.style.display = text.includes(query) ? "block" : "none";
  });
}

function loadSavedContent() {
  getData("posts").forEach(addPost);
  getData("videos").forEach(v => addVideo(v, "videos"));
  getData("shorts").forEach(s => addVideo(s, "shorts"));
}

window.onload = () => {
  startApp();
};
