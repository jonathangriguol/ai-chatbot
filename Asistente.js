const { OpenAI } = require("openai");
const manejarFuncion = require('./ManejadorDeFunciones');

const EJECUCION_COMPLETADA = 'completed';
class Asistente {
    constructor(apiKey, idAsistente) {
        this.openai = new OpenAI({ apiKey: apiKey });
        this.idAsistente = idAsistente;
    }

    async crearHilo() {
        let hilo = await this.openai.beta.threads.create();
        console.log("[Asistente] Nuevo hilo creado");
        return hilo;
    }

    async atender(hilo, mensaje) {
        await this.crearMensaje(hilo, mensaje);

        const idEjecucion = await this.crearEjecucion(hilo);

        let ejecucion;
        do {

            await new Promise(resolve => setTimeout(resolve, 1000));
            ejecucion = await this.obtenerEjecucionPorHiloYId(hilo, idEjecucion);
            console.log("[Asistente] Estado de ejecución:", ejecucion.status);

            if (ejecucion.status === "requires_action") {
                console.log("[Asistente] El asistente requiere ejecutar una función.");
                const toolCalls = ejecucion.required_action.submit_tool_outputs.tool_calls;
                for (let toolCall of toolCalls) {
                    const nombreDeFuncion = toolCall.function.name;
                    const argumentosDeFuncion = JSON.parse(toolCall.function.arguments);

                    const salida = manejarFuncion(nombreDeFuncion, argumentosDeFuncion);

                    await this.enviarSalidaAOpenAI(hilo, idEjecucion, toolCall.id, salida);
                }
            }

        } while (ejecucion.status !== EJECUCION_COMPLETADA);

        return await this.obtenerUltimaRespuesta(hilo);
    }

    async enviarSalidaAOpenAI(hilo, idEjecucion, toolCallId, salida) {
        await this.openai.beta.threads.runs.submitToolOutputs(hilo, idEjecucion, {
            tool_outputs: [
                {
                    tool_call_id: toolCallId,
                    output: JSON.stringify(salida),
                },
            ],
        });

        console.log("[Asistente] Resultado enviado a OpenAI:", salida);
    }

    async crearMensaje(hilo, mensaje) {
        await this.openai.beta.threads.messages.create(hilo, {
            role: "user",
            content: mensaje,
        });
    }

    async listarMensajes(hilo, cantidad) {
        return await this.openai.beta.threads.messages.list(hilo, { limit: cantidad });
    }

    async crearEjecucion(hilo) {
        const ejecucion = await this.openai.beta.threads.runs.create(hilo, {
            assistant_id: this.idAsistente,
        });
        console.log("[Asistente] Ejecucion iniciada:", ejecucion.id);
        return ejecucion.id;
    }

    async obtenerEjecucionPorHiloYId(hilo, idEjecucion) {
        return await this.openai.beta.threads.runs.retrieve(hilo, idEjecucion);
    }

    async obtenerUltimaRespuesta(hilo) {
        let respuesta = "Lo siento, no encontré una respuesta.";
        const messages = await this.listarMensajes(hilo, 5)
        const assistantMessages = messages.data
            .filter(msg => msg.role === "assistant")
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (assistantMessages.length > 0) {
            respuesta = assistantMessages[0].content[0].text.value;
        }
        
        return respuesta;
    }
}

module.exports = Asistente;