const dbClientes = {
    lista: [
        { id: 1, nombre: 'Juan', apellido: 'Perez', dni: '30000001', telefono: '351 000 0001', email: 'juan@email.com', direccion: 'Calle Falsa 123', cuentaCorriente: false, saldo: 0, movimientos: [] },
        { id: 2, nombre: 'Maria', apellido: 'Lopez', dni: '30000002', telefono: '351 000 0002', email: 'maria@email.com', direccion: 'Avenida Siempre Viva 456', cuentaCorriente: false, saldo: 0, movimientos: [] },
    ],
    nextId: 3
};

function listClientes() {
    return dbClientes.lista;
}

function clienteById(id) {
    return dbClientes.lista.find(c => c.id === id);
}

function buscarClientes({ id, dni, nombre } = {}) {
    return dbClientes.lista.filter(c => {
        if (id) return c.id === Number(id);
        if (dni) return c.dni && c.dni === dni;
        if (nombre) {
            const q = nombre.toLowerCase();
            return c.nombre.toLowerCase().includes(q) || c.apellido.toLowerCase().includes(q);
        }
        return false;
    });
}

function crearCliente(datos) {
    const nuevo = {
        id: dbClientes.nextId++,
        nombre: datos.nombre,
        apellido: datos.apellido || '',
        dni: datos.dni || null,
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
    if (datos.apellido  !== undefined) c.apellido  = datos.apellido;
    if (datos.dni       !== undefined) c.dni       = datos.dni || null;
    if (datos.telefono  !== undefined) c.telefono  = datos.telefono || null;
    if (datos.email     !== undefined) c.email     = datos.email || null;
    if (datos.direccion !== undefined) c.direccion = datos.direccion || null;
    if (datos.cuentaCorriente !== undefined) {
        c.cuentaCorriente = datos.cuentaCorriente === true || datos.cuentaCorriente === 'true';
    }
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

function abonarCuenta(id, monto) {
    return agregarMovimiento(id, {
        tipo: 'pago',
        descripcion: 'Pago / abono de deuda',
        monto: Number(monto)
    });
}

function clientesConCuenta() {
    return dbClientes.lista.filter(c => c.cuentaCorriente === true);
}

function clientesSinCuenta() {
    return dbClientes.lista.filter(c => !c.cuentaCorriente);
}

function nombreCompleto(c) {
    return `${c.nombre} ${c.apellido}`.trim();
}

module.exports = { listClientes, clienteById, buscarClientes, crearCliente, editarCliente, eliminarCliente, habilitarCuentaCorriente, agregarMovimiento, abonarCuenta, clientesConCuenta, clientesSinCuenta, nombreCompleto };
