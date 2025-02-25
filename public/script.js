const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => console.log("Conectado al servidor WebSocket");
ws.onerror = (error) => console.error("Error en WebSocket:", error);

function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.trim();
    if (!message) return;

    addMessage("Tú", message);
    ws.send(message);
    input.value = "";

    let botResponse = "";
    ws.onmessage = (event) => {
        if (event.data === "[FIN]") {
            addMessage("Bot", botResponse);
        } else {
            botResponse += event.data; // Acumular texto de streaming
        }
    };
}

function addMessage(user, text) {
    const chatbox = document.getElementById("chatbox");
    chatbox.innerHTML += `<p><strong>${user}:</strong> ${text}</p>`;
    chatbox.scrollTop = chatbox.scrollHeight;
}
