const { getPrimerDisponible, actualizarEstado } = require("../store/dbContenedor");
const { crearAlquiler } = require("../store/dbAlquiler");

async function crearNuevoAlquiler(datos) {

    const contenedor = getPrimerDisponible();

    if (!contenedor) {
        throw new Error("No hay contenedores disponibles");
    }

    const nuevoAlquiler = {
        id: Date.now(),
        contenedorId: contenedor.id,
        cliente: datos.cliente,
        inicioAlquiler: datos.inicioAlquiler,
        finAlquiler: datos.finAlquiler
    };

    crearAlquiler(nuevoAlquiler);

    actualizarEstado(contenedor.id, "Alquilado");

    return nuevoAlquiler;
}

module.exports = { crearNuevoAlquiler };