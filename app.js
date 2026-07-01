const messages = document.querySelector("#messages");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const toggle = document.querySelector("#drawToggle");
const clearButton = document.querySelector("#clearCanvas");
const colorInput = document.querySelector("#drawColor");
const sizeInput = document.querySelector("#drawSize");
const canvas = document.querySelector("#doodleCanvas");
const ctx = canvas.getContext("2d");

let drawingEnabled = false;
let isDrawing = false;
let lastPoint = null;

const botReplies = [
  "좋아요. 조금 더 자세히 말해줘도 돼요.",
  "확인했어요. 이 채팅은 데모라서 브라우저 안에서만 동작해요.",
  "낙서 기능을 켜면 화면 위에 바로 그릴 수 있어요.",
  "메시지와 낙서는 새로고침하면 초기화됩니다.",
];

function resizeCanvas() {
  const snapshot = document.createElement("canvas");
  snapshot.width = canvas.width;
  snapshot.height = canvas.height;
  snapshot.getContext("2d").drawImage(canvas, 0, 0);

  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.drawImage(snapshot, 0, 0, snapshot.width / ratio, snapshot.height / ratio);
}

function addMessage(author, text, type) {
  const article = document.createElement("article");
  article.className = `message ${type}`;
  article.innerHTML = `<span>${author}</span><p></p>`;
  article.querySelector("p").textContent = text;
  messages.append(article);
  messages.scrollTop = messages.scrollHeight;
}

function replyLater() {
  const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
  window.setTimeout(() => addMessage("Demo Bot", reply, "other"), 450);
}

function pointFromEvent(event) {
  const touch = event.touches?.[0] || event.changedTouches?.[0];
  return {
    x: touch ? touch.clientX : event.clientX,
    y: touch ? touch.clientY : event.clientY,
  };
}

function startDrawing(event) {
  if (!drawingEnabled) return;
  isDrawing = true;
  lastPoint = pointFromEvent(event);
  event.preventDefault();
}

function draw(event) {
  if (!isDrawing || !lastPoint) return;
  const nextPoint = pointFromEvent(event);
  ctx.strokeStyle = colorInput.value;
  ctx.lineWidth = Number(sizeInput.value);
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(nextPoint.x, nextPoint.y);
  ctx.stroke();
  lastPoint = nextPoint;
  event.preventDefault();
}

function stopDrawing() {
  isDrawing = false;
  lastPoint = null;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addMessage("Me", text, "mine");
  input.value = "";
  replyLater();
});

toggle.addEventListener("click", () => {
  drawingEnabled = !drawingEnabled;
  document.body.classList.toggle("drawing", drawingEnabled);
  toggle.classList.toggle("active", drawingEnabled);
  toggle.textContent = drawingEnabled ? "낙서 끄기" : "낙서 켜기";
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
window.addEventListener("touchend", stopDrawing);
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
