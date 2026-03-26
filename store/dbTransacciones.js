let nextId = 1;

const dbTransacciones = {
    listaTransacciones: []
};

function crearTransaccion({ tipo, cliente, monto, descripcion }) {
    const transaccion = {
        id: nextId++,
        tipo,
        cliente,
        monto,
        descripcion,
        fecha: new Date().toISOString().split('T')[0]
    };
    dbTransacciones.listaTransacciones.push(transaccion);
    return transaccion;
}

function listTransacciones() {
    return dbTransacciones.listaTransacciones;
}

module.exports = { crearTransaccion, listTransacciones };
