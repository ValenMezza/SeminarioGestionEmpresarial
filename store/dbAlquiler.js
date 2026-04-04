let nextId = 1;

const dbAlquileres = {
    lista: []
};

function crearAlquiler(datos) {
    const alquiler = {
        id: nextId++,
        contenedorId: datos.contenedorId,
        clienteId: datos.clienteId || null,
        clienteNombre: datos.clienteNombre,
        inicioAlquiler: datos.inicioAlquiler,
        finAlquiler: datos.finAlquiler,
        direccionAlquiler: datos.direccionAlquiler,
        precioAlquiler: datos.precioAlquiler || 0,
        metodoPago: datos.metodoPago || 'efectivo',
        estado: datos.estado || 'activo',
        creadoEn: new Date().toISOString().split('T')[0]
    };
    dbAlquileres.lista.push(alquiler);
    return alquiler;
}

function listAlquileres() {
    return dbAlquileres.lista;
}

function alquilerById(id) {
    return dbAlquileres.lista.find(a => a.id === id);
}

function alquileresProgramados() {
    return dbAlquileres.lista.filter(a => a.estado === 'programado');
}

function alquileresActivos() {
    return dbAlquileres.lista.filter(a => a.estado === 'activo');
}

function alquileresPorIniciar() {
    const hoy = new Date().toISOString().split('T')[0];
    return dbAlquileres.lista.filter(a => a.estado === 'programado' && a.inicioAlquiler > hoy);
}

function alquileresProgramadosPorContenedor(contenedorId) {
    return dbAlquileres.lista.find(a => a.contenedorId === contenedorId && a.estado === 'programado');
}

function activarAlquiler(id) {
    const a = dbAlquileres.lista.find(a => a.id === id);
    if (!a) return null;
    a.estado = 'activo';
    return a;
}

function finalizarAlquilerRecord(id) {
    const a = dbAlquileres.lista.find(a => a.id === id);
    if (!a) return null;
    a.estado = 'finalizado';
    return a;
}

function cancelarAlquilerRecord(id) {
    const a = dbAlquileres.lista.find(a => a.id === id);
    if (!a) return null;
    a.estado = 'cancelado';
    return a;
}

module.exports = {
    crearAlquiler, listAlquileres, alquilerById,
    alquileresProgramados, alquileresActivos, alquileresPorIniciar,
    alquileresProgramadosPorContenedor, activarAlquiler,
    finalizarAlquilerRecord, cancelarAlquilerRecord
};
