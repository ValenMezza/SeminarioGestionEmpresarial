const config = { precioDia: 5000, precioAlquiler: 30000 };
let nextId = 6;

const dbContenedores = {
    listaContenedores: [
        { id: 1, estado: "Disponible", precioAlquiler: 30000, precioDia: 5000, cliente: null, inicioAlquiler: null, finAlquiler: null, direccionAlquiler: null },
        { id: 2, estado: "Alquilado", precioAlquiler: 30000, precioDia: 5000, cliente: "Juan Perez", inicioAlquiler: "2026-03-24", finAlquiler: "2026-04-03", direccionAlquiler: "Yrigoyen 123" },
        { id: 3, estado: "Disponible", precioAlquiler: 30000, precioDia: 5000, cliente: null, inicioAlquiler: null, finAlquiler: null, direccionAlquiler: null },
        { id: 4, estado: "Alquilado", precioAlquiler: 30000, precioDia: 5000, cliente: "Maria Lopez", inicioAlquiler: "2026-03-22", finAlquiler: "2026-03-29", direccionAlquiler: "San Lorenzo 501" },
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
        clienteId: null,
        inicioAlquiler: null,
        finAlquiler: null,
        direccionAlquiler: null,
        precioDia: config.precioDia,
        precioAlquiler: config.precioAlquiler,
    });
    return contenedor;
}

function crearContenedor() {
    const nuevo = {
        id: nextId++,
        estado: "Disponible",
        precioAlquiler: config.precioAlquiler,
        precioDia: config.precioDia,
        cliente: null,
        clienteId: null,
        inicioAlquiler: null,
        finAlquiler: null,
        direccionAlquiler: null
    };
    dbContenedores.listaContenedores.push(nuevo);
    return nuevo;
}

function eliminarContenedor(id) {
    const idx = dbContenedores.listaContenedores.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const cont = dbContenedores.listaContenedores[idx];
    if (cont.estado === 'Alquilado') return null;
    return dbContenedores.listaContenedores.splice(idx, 1)[0];
}

module.exports = { dbContenedores, contenedorById, listContenedores, listContenedoresAlquilados, listContenedoresDisponibles, contenedorLibre, actualizarContenedor, listContenedoresPorFinalizar, actualizarPrecios, finalizarAlquiler, crearContenedor, eliminarContenedor }