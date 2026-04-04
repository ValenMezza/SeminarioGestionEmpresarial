let nextId = 1;

const dbTransacciones = {
    listaTransacciones: []
};

function crearTransaccion({ tipo, clienteId, cliente, monto, descripcion, metodoPago }) {
    const transaccion = {
        id: nextId++,
        tipo,
        clienteId: clienteId || null,
        cliente,
        monto,
        descripcion,
        metodoPago: metodoPago || 'efectivo',
        fecha: new Date().toISOString().split('T')[0]
    };
    dbTransacciones.listaTransacciones.push(transaccion);
    return transaccion;
}

function listTransacciones() {
    return dbTransacciones.listaTransacciones;
}

function filtrarTransacciones({ id, tipo, cliente, fechaDesde, fechaHasta, montoMin, montoMax } = {}) {
    return dbTransacciones.listaTransacciones.filter(t => {
        if (id        && t.id !== Number(id))                                          return false;
        if (tipo      && tipo !== 'todos' && t.tipo !== tipo)                          return false;
        if (cliente   && !t.cliente.toLowerCase().includes(cliente.toLowerCase()))     return false;
        if (fechaDesde && t.fecha < fechaDesde)                                        return false;
        if (fechaHasta && t.fecha > fechaHasta)                                        return false;
        if (montoMin  && t.monto < Number(montoMin))                                   return false;
        if (montoMax  && t.monto > Number(montoMax))                                   return false;
        return true;
    });
}

module.exports = { crearTransaccion, listTransacciones, filtrarTransacciones };
