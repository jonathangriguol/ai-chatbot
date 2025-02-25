# 🧠 Asistente OpenAI con WebSockets

Este proyecto implementa un chatbot con respuestas en tiempo real utilizando la **Assistants API** de OpenAI y **WebSockets** en un servidor Node.js. Permite interactuar con un asistente previamente configurado en OpenAI para responder de manera personalizada.

## 🚀 Características

- Comunicación en tiempo real con **WebSockets**
- Uso de un **asistente personalizado** de OpenAI
- **Memoria de conversación** mediante hilos (*threads*)
- Interfaz web sencilla para interactuar con el chatbot

## 📁 Estructura del Proyecto

```
/esfera-commerce
│── server.js  # Servidor Node.js con WebSockets y OpenAI
│── .env       # Configuración con la API Key
│── package.json # Dependencias del proyecto
│── public/
│   │── index.html  # Interfaz web del chatbot
│   │── script.js   # Lógica WebSocket en el cliente
```

## 🛠️ Instalación y Configuración

### 1️⃣ Clonar el repositorio

```sh
git clone https://github.com/tu_usuario/mi-asistente.git
cd mi-asistente
```

### 2️⃣ Instalar dependencias

```sh
npm install
```

### 3️⃣ Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto y añade tu API Key de OpenAI y el id del asistente a utilizar:

```
OPENAI_API_KEY=tu_clave_aqui
ASSISTANT_ID=id-asistente
```

> **NOTA:** También debes reemplazar `asst_XXXXXXXXXXXXXXXXX` en `server.js` con el ID de tu asistente de OpenAI.

### 4️⃣ Ejecutar el servidor

```sh
node server.js
```

### 5️⃣ Abrir el chat en el navegador

Abre `public/index.html` en tu navegador para interactuar con el chatbot.

## 📜 Comandos Disponibles

| Comando          | Descripción                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `npm install`    | Instala las dependencias del proyecto                              |
| `node server.js` | Inicia el servidor WebSocket en el puerto 8080                     |
| `npm start`      | Ejecuta el servidor (puedes agregar este script en `package.json`) |

## 🛠️ Mejoras Futuras

- Generar invoice
- Guardar conversaciones en base de datos

---

📌 **Autor:** *Jonathan E. Griguol*\
📅 **Última actualización:** *Febrero 2025*

