const dbClientes = {
    lista: [
        { id: 1, nombre: 'Juan Perez',   telefono: '351 000 0001', email: 'juan@email.com',  direccion: 'Calle Falsa 123',           cuentaCorriente: false, saldo: 0, movimientos: [] },
        { id: 2, nombre: 'Maria Lopez',  telefono: '351 000 0002', email: 'maria@email.com', direccion: 'Avenida Siempre Viva 456',  cuentaCorriente: false, saldo: 0, movimientos: [] },
    ],
    nextId: 3
};

function listClientes() {
    return dbClientes.lista;
}

function clienteById(id) {
    return dbClientes.lista.find(c => c.id === id);
}

function buscarClientes({ nombre, telefono } = {}) {
    return dbClientes.lista.filter(c => {
        const matchNombre   = !nombre   || c.nombre.toLowerCase().includes(nombre.toLowerCase());
        const matchTelefono = !telefono || (c.telefono && c.telefono.includes(telefono));
        return matchNombre && matchTelefono;
    });
}

function crearCliente(datos) {
    const nuevo = {
        id: dbClientes.nextId++,
        nombre: datos.nombre,
        telefono: datos.telefono || null,
        email: datos.email || null,
        direccion: datos.direccion || null,
        cuentaCorriente: datos.cuentaCorriente === true || datos.cuentaCorriente === 'true',
        saldo: 0,
        movimientos: []
    };
    dbClientes.lista.push(nuevo);
    return nuevo;
}

function editarCliente(id, datos) {
    const c = dbClientes.lista.find(c => c.id === id);
    if (!c) return null;
    if (datos.nombre    !== undefined) c.nombre    = datos.nombre;
    if (datos.telefono  !== undefined) c.telefono  = datos.telefono  || null;
    if (datos.email     !== undefined) c.email     = datos.email     || null;
    if (datos.direccion !== undefined) c.direccion = datos.direccion || null;
    c.cuentaCorriente = datos.cuentaCorriente === true || datos.cuentaCorriente === 'true';
    return c;
}

function eliminarCliente(id) {
    const idx = dbClientes.lista.findIndex(c => c.id === id);
    if (idx === -1) return null;
    return dbClientes.lista.splice(idx, 1)[0];
}

function habilitarCuentaCorriente(id) {
    const c = dbClientes.lista.find(c => c.id === id);
    if (!c) return null;
    c.cuentaCorriente = true;
    return c;
}

function agregarMovimiento(id, { tipo, descripcion, monto }) {
    const c = dbClientes.lista.find(c => c.id === id);
    if (!c) return null;
    const mov = {
        id: (c.movimientos.length + 1),
        tipo,
        descripcion,
        monto,
        fecha: new Date().toISOString().split('T')[0]
    };
    c.movimientos.push(mov);
    c.saldo += monto;
    return mov;
}

function clientesConCuenta() {
    return dbClientes.lista.filter(c => c.cuentaCorriente === true);
}

function clientesSinCuenta() {
    return dbClientes.lista.filter(c => !c.cuentaCorriente);
}

module.exports = { listClientes, clienteById, buscarClientes, crearCliente, editarCliente, eliminarCliente, habilitarCuentaCorriente, agregarMovimiento, clientesConCuenta, clientesSinCuenta };
