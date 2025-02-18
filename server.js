require("dotenv").config();
const express = require("express");
const { OpenAI } = require("openai");
const { WebSocketServer } = require("ws");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ASSISTANT_ID = "asst_A8w6kRTELYi9flRMFLjvkPo2";

// Mapa para almacenar el threadId por usuario
const userThreads = new Map();

app.use(cors());
app.use(express.static("public"));

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
    console.log("Cliente conectado");

    ws.on("message", async (message) => {
        const userMessage = message.toString();
        console.log("Mensaje recibido:", userMessage);

        try {
            let threadId;

            // Reusar el threadId si el cliente ya tiene uno
            if (userThreads.has(ws)) {
                threadId = userThreads.get(ws);
            } else {
                // Crear un nuevo thread si es la primera vez que el usuario se conecta
                const thread = await openai.beta.threads.create();
                threadId = thread.id;
                userThreads.set(ws, threadId);
                console.log("Nuevo thread creado:", threadId);
            }

            // Agregar el mensaje del usuario al hilo
            await openai.beta.threads.messages.create(threadId, {
                role: "user",
                content: userMessage,
            });

            // Ejecutar el asistente en el mismo thread
            const run = await openai.beta.threads.runs.create(threadId, {
                assistant_id: ASSISTANT_ID,
            });
            console.log("Run iniciado:", run.id);

            // Esperar a que el asistente termine la ejecución
            let runStatus;
            do {
                await new Promise(resolve => setTimeout(resolve, 1000));
                runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
                console.log("Estado del run:", runStatus.status);

                // 🚀 Capturar si el asistente necesita ejecutar una función
                if (runStatus.status === "requires_action") {
                    console.log("El asistente requiere ejecutar una función.");

                    const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
                    for (let toolCall of toolCalls) {
                        const functionName = toolCall.function.name;
                        const functionArgs = JSON.parse(toolCall.function.arguments);

                        console.log(`Ejecutando función: ${functionName} con argumentos`, functionArgs);

                        let functionOutput;

                        // 📌 Capturar la función para generar el link de checkout
                        if (functionName === "generar_link_checkout") {
                            let productos = functionArgs.productos;

                            // Si 'productos' no es un array, convertirlo en uno
                            if (!Array.isArray(productos)) {
                                productos = [functionArgs]; // Convertir en array con el único producto recibido
                            }

                            functionOutput = { url: generarLinkCheckout(productos) };
                        }

                        // Enviar el resultado de la función a OpenAI
                        await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
                            tool_outputs: [
                                {
                                    tool_call_id: toolCall.id,
                                    output: JSON.stringify(functionOutput),
                                },
                            ],
                        });

                        console.log("Resultado enviado a OpenAI:", functionOutput);
                    }
                }
            } while (runStatus.status !== "completed");

            // Obtener SOLO la última respuesta del asistente
            const messages = await openai.beta.threads.messages.list(threadId, { limit: 5 }); // Recuperar solo los últimos 5 mensajes
            const assistantMessages = messages.data
                .filter(msg => msg.role === "assistant")
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Ordenar por fecha de creación

            if (assistantMessages.length > 0) {
                const lastResponse = assistantMessages[0].content[0].text.value;
                ws.send(lastResponse);
            } else {
                ws.send("Lo siento, no encontré una respuesta.");
            }

            ws.send("[FIN]");
        } catch (error) {
            console.error("Error con OpenAI:", error);
            ws.send("Error al procesar la solicitud.");
        }
    });

    ws.on("close", () => {
        console.log("Cliente desconectado, eliminando su thread...");
        userThreads.delete(ws);
    });
});


function generarLinkCheckout(productos) {
    const mpagoUrl = "https://mercadopago.com.ar/payment/";
    
    // Simulacion en logs
    const uuid = uuidv4();

    // Aplico reglas de negocio

    // Calculo subtotal
    const subTotal = productos.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);

    console.log(`Sub Total del carrito: $${subTotal}`);

    // Aplico descuentos y calculo total
    const total = subTotal * 0.9;
    console.log(`TOTAL descuento del 10%: $${total}`);

    // TO-DO: Actualizar stock (reserva unidades) Ej:
    // stockService.actualizaStock(productos);
    console.log(`Actualizando stock de productos`);

    console.log(`Generando link de pago...`);
    return `${mpagoUrl}?${uuid}`;
}

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
console.log("WebSocket en ws://localhost:8080");
