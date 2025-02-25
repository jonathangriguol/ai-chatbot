
const { v4: uuidv4 } = require('uuid');

const manejarFuncion = (nombre, argumentos) => {
    let salida = "";
    if (nombre === "generar_link_checkout") {
        let productos = argumentos.productos;

        // Si 'productos' no es un array, convertirlo en uno
        if (!Array.isArray(productos)) {
            productos = [functionArgs]; // Convertir en array con el único producto recibido
        }

        salida = { url: generarLinkCheckout(productos) };
    }

    return salida;
};

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

module.exports = manejarFuncion;