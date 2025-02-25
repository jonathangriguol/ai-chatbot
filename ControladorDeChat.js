const { WebSocketServer } = require("ws");

const puerto = 8081;
const CLIENTE_CONECTADO = 'connection';
const MENSAJE_RECIBIDO = 'message';
const CERRAR_CONEXION = 'close';
const MENSAJE_FIN = "[FIN]";

class ControladorDeChat {
    constructor(asistente) {
        this.server = new WebSocketServer({port: puerto});
        this.chats = new Map();
        this.asistente = asistente;
    }

    iniciar() {
        this.server.on(CLIENTE_CONECTADO, this.alConectarseUnCliente.bind(this));
    }

    alConectarseUnCliente(webSocket) {
        console.log("[Controlador de chat] Cliente conectado");
        webSocket.on(MENSAJE_RECIBIDO, (datos) => this.alRecibirUnMensaje(webSocket, datos));
        webSocket.on(CERRAR_CONEXION, () => this.alCerrarConexion(webSocket));
    }

    alRecibirUnMensaje = async (webSocket, datos) => {
        const mensaje = datos.toString();
        console.log("[Controlador de chat] Mensaje recibido: ", mensaje);

        let chat = await this.obtenerOCrearChat(webSocket)

        const respuesta = await this.asistente.atender(chat, mensaje);
        webSocket.send(respuesta);
        this.finalizar(webSocket);
    }

    alCerrarConexion(webSocket) {
        console.log("[Controlador de chat] Cliente desconectado, eliminando su conversación...");
        this.chats.delete(webSocket);
    }

    async obtenerOCrearChat(webSocket) {
        let chat;
        if (this.chats.has(webSocket)) {
            chat = this.chats.get(webSocket);
        } else {
            const hilo = await this.asistente.crearHilo();
            chat = hilo.id;
            this.chats.set(webSocket, chat);
        }

        return chat;
    }

    finalizar(webSocket) {
        webSocket.send(MENSAJE_FIN);
    }
}

module.exports = ControladorDeChat;