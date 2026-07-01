const seedMessages = [
  {
    id: "welcome-1",
    clientId: "system",
    name: "Chat",
    text: "두 컴퓨터에서 같은 주소로 들어오면 메시지가 같이 보입니다.",
    createdAt: Date.now(),
  },
];

globalThis.__simpleChatMessages ||= seedMessages;

function sendJson(response, status, body) {
  response.status(status).json(body);
}

module.exports = function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  const messages = globalThis.__simpleChatMessages;

  if (request.method === "GET") {
    sendJson(response, 200, { messages });
    return;
  }

  if (request.method === "POST") {
    const text = String(request.body?.text || "").trim().slice(0, 500);
    if (!text) {
      sendJson(response, 400, { error: "Message text is required" });
      return;
    }

    messages.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      clientId: String(request.body?.clientId || "guest").slice(0, 80),
      name: String(request.body?.name || "Guest").slice(0, 40),
      text,
      createdAt: Date.now(),
    });

    while (messages.length > 80) messages.shift();
    sendJson(response, 200, { messages });
    return;
  }

  sendJson(response, 405, { error: "Method not allowed" });
};
