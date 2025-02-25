require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ControladorDeChat = require("./ControladorDeChat");
const Asistente = require("./Asistente");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static("public"));

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);

    let chat = new ControladorDeChat(new Asistente(process.env.OPENAI_API_KEY, process.env.ASSISTANT_ID));
    chat.iniciar();
});
