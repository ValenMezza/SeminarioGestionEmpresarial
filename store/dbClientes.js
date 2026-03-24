const dbClientes = {
    lista: [
        { id: 1, nombre: 'Juan Perez',   telefono: '351 000 0001', email: 'juan@email.com',  direccion: 'Calle Falsa 123' },
        { id: 2, nombre: 'Maria Lopez',  telefono: '351 000 0002', email: 'maria@email.com', direccion: 'Avenida Siempre Viva 456' },
    ],
    nextId: 3
};

function listClientes() {
    return dbClientes.lista;
}

function clienteById(id) {
    return dbClientes.lista.find(c => c.id === id);
}

function crearCliente(datos) {
    const nuevo = { id: dbClientes.nextId++, ...datos };
    dbClientes.lista.push(nuevo);
    return nuevo;
}

function eliminarCliente(id) {
    const idx = dbClientes.lista.findIndex(c => c.id === id);
    if (idx === -1) return null;
    return dbClientes.lista.splice(idx, 1)[0];
}

module.exports = { listClientes, clienteById, crearCliente, eliminarCliente };
