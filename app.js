const messages = document.querySelector("#messages");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const toggle = document.querySelector("#drawToggle");
const clearButton = document.querySelector("#clearCanvas");
const colorInput = document.querySelector("#drawColor");
const sizeInput = document.querySelector("#drawSize");
const canvas = document.querySelector("#doodleCanvas");
const ctx = canvas.getContext("2d");

const clientId = crypto.randomUUID();
let drawingEnabled = false;
let isDrawing = false;
let lastPoint = null;
let lastRenderedIds = "";

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

function createMessage(message) {
  const article = document.createElement("article");
  article.className = `message ${message.clientId === clientId ? "mine" : "other"}`;
  article.innerHTML = "<span></span><p></p>";
  article.querySelector("span").textContent = message.name || "Guest";
  article.querySelector("p").textContent = message.text;
  return article;
}

function renderMessages(nextMessages) {
  const nextIds = nextMessages.map((message) => message.id).join(",");
  if (nextIds === lastRenderedIds) return;
  lastRenderedIds = nextIds;
  messages.replaceChildren(...nextMessages.map(createMessage));
  messages.scrollTop = messages.scrollHeight;
}

async function loadMessages() {
  try {
    const response = await fetch("/api/messages", { cache: "no-store" });
    if (!response.ok) throw new Error("Message load failed");
    const data = await response.json();
    renderMessages(data.messages);
  } catch (error) {
    console.warn(error);
  }
}

async function sendMessage(text) {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, clientId, name: "Guest" }),
  });
  if (!response.ok) throw new Error("Message send failed");
  const data = await response.json();
  renderMessages(data.messages);
}

function pointFromEvent(event) {
  return {
    x: event.clientX,
    y: event.clientY,
  };
}

function startDrawing(event) {
  if (!drawingEnabled) return;
  isDrawing = true;
  lastPoint = pointFromEvent(event);
  canvas.setPointerCapture?.(event.pointerId);
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

function stopDrawing(event) {
  isDrawing = false;
  lastPoint = null;
  if (event?.pointerId !== undefined) {
    canvas.releasePointerCapture?.(event.pointerId);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  input.focus();

  try {
    await sendMessage(text);
  } catch (error) {
    input.value = text;
    console.warn(error);
  }
});

toggle.addEventListener("click", () => {
  drawingEnabled = !drawingEnabled;
  document.body.classList.toggle("drawing", drawingEnabled);
  toggle.classList.toggle("active", drawingEnabled);
  toggle.textContent = drawingEnabled ? "낙서 끄기" : "낙서 켜기";
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
});

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
loadMessages();
window.setInterval(loadMessages, 1000);
