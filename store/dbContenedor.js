const listAlquileres = require("./dbAlquiler").listAlquileres;

const config = { precioDia: 5000, precioAlquiler: 30000 };

const dbContenedores = {
    listaContenedores: [
        { id: 1, estado: "Disponible", precioAlquiler: 30000, precioDia: 5000, cliente: null, inicioAlquiler: null, finAlquiler: null, direccionAlquiler: null },
        { id: 2, estado: "Alquilado", precioAlquiler: 30000, precioDia: 5000, cliente: "Juan Perez", inicioAlquiler: "2026-03-20", finAlquiler: "2026-03-24", direccionAlquiler: "Calle Falsa 123" },
        { id: 3, estado: "Disponible", precioAlquiler: 30000, precioDia: 5000, cliente: null, inicioAlquiler: null, finAlquiler: null, direccionAlquiler: null },
        { id: 4, estado: "Alquilado", precioAlquiler: 30000, precioDia: 5000, cliente: "Maria Lopez", inicioAlquiler: "2024-06-05", finAlquiler: "2024-06-15", direccionAlquiler: "Avenida Siempre Viva 456" },
        { id: 5, estado: "Disponible", precioAlquiler: 30000, precioDia: 5000, cliente: null, inicioAlquiler: null, finAlquiler: null, direccionAlquiler: null }
    ],
};

async function listContenedores() {
    return dbContenedores.listaContenedores;
}
async function contenedorById(id) {
    return dbContenedores.listaContenedores.find(c => c.id === id);
}

async function listContenedoresAlquilados(){
    return dbContenedores.listaContenedores.filter(c=> c.estado === "Alquilado");
}

async function listContenedoresDisponibles (){
    return dbContenedores.listaContenedores.filter(c=> c.estado === "Disponible");
}

async function contenedorLibre(){
    return dbContenedores.listaContenedores.find(c=> c.estado === "Disponible")
}

function listContenedoresPorFinalizar() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return dbContenedores.listaContenedores.filter(c => {
        if (c.estado !== "Alquilado" || !c.finAlquiler) return false;
        const fin = new Date(c.finAlquiler + 'T00:00:00');
        fin.setHours(0, 0, 0, 0);
        const diasRestantes = (fin - hoy) / (1000 * 60 * 60 * 24);
        return diasRestantes >= 0 && diasRestantes <= 2;
    });
}

function actualizarContenedor(id, datos) {
    const contenedor = dbContenedores.listaContenedores.find(c => c.id === id);
    if (!contenedor) return null;
    Object.assign(contenedor, datos);
    return contenedor;
}

function actualizarPrecios(precioDia, precioAlquiler) {
    config.precioDia = precioDia;
    config.precioAlquiler = precioAlquiler;
    dbContenedores.listaContenedores.forEach(c => {
        if (c.estado !== "Alquilado") {
            c.precioDia = precioDia;
            c.precioAlquiler = precioAlquiler;
        }
    });
}

function finalizarAlquiler(id) {
    const contenedor = dbContenedores.listaContenedores.find(c => c.id === id);
    if (!contenedor) return null;
    Object.assign(contenedor, {
        estado: "Disponible",
        cliente: null,
        inicioAlquiler: null,
        finAlquiler: null,
        direccionAlquiler: null,
        precioDia: config.precioDia,
        precioAlquiler: config.precioAlquiler,
    });
    return contenedor;
}

module.exports = {dbContenedores, contenedorById, listContenedores, listContenedoresAlquilados, listContenedoresDisponibles, contenedorLibre, actualizarContenedor, listContenedoresPorFinalizar, actualizarPrecios, finalizarAlquiler}