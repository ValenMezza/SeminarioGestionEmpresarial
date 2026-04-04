let nextId = 1;

const dbViajes = {
    lista: []
};

function crearViaje(datos) {
    const viaje = {
        id: nextId++,
        clienteId: datos.clienteId || null,
        clienteNombre: datos.clienteNombre,
        telefono: datos.telefono || null,
        fecha: datos.fecha,
        hora: datos.hora || null,
        direccion: datos.direccion,
        productoId: datos.productoId,
        productoNombre: datos.productoNombre,
        cantidad: datos.cantidad || 1,
        precioProducto: datos.precioProducto || 0,
        precioFlete: datos.precioFlete || 0,
        precioTotal: datos.precioTotal || 0,
        metodoPago: datos.metodoPago || 'efectivo',
        descripcion: datos.descripcion || '',
        estado: datos.estado || 'pendiente',
        creadoEn: new Date().toISOString().split('T')[0]
    };
    dbViajes.lista.push(viaje);
    return viaje;
}

function listViajes() {
    return dbViajes.lista;
}

function viajeById(id) {
    return dbViajes.lista.find(v => v.id === id);
}

function finalizarViaje(id) {
    const v = dbViajes.lista.find(v => v.id === id);
    if (!v) return null;
    v.estado = 'finalizado';
    return v;
}

function viajesPendientesHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    return dbViajes.lista.filter(v => v.estado === 'pendiente' && v.fecha === hoy);
}

function viajesPendientes() {
    return dbViajes.lista.filter(v => v.estado === 'pendiente');
}

module.exports = { crearViaje, listViajes, viajeById, finalizarViaje, viajesPendientesHoy, viajesPendientes };
