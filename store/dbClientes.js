const supabase = require('../lib/supabase');

function nombreCompleto(c) {
    return `${c.nombre} ${c.apellido}`.trim();
}

function mapCliente(c) {
    if (!c) return null;
    return { ...c, cuentaCorriente: c.cuenta_corriente };
}

async function listClientes() {
    const { data } = await supabase.from('clientes').select('*').order('id');
    return (data || []).map(mapCliente);
}

async function clienteById(id) {
    const { data } = await supabase.from('clientes').select('*').eq('id', id).single();
    return mapCliente(data);
}

async function buscarClientes({ id, dni, nombre } = {}) {
    let query = supabase.from('clientes').select('*');
    if (id)          query = query.eq('id', Number(id));
    else if (dni)    query = query.eq('dni', dni);
    else if (nombre) query = query.or(`nombre.ilike.%${nombre}%,apellido.ilike.%${nombre}%`);
    const { data } = await query.order('id');
    return (data || []).map(mapCliente);
}

async function crearCliente(datos) {
    const { data } = await supabase.from('clientes').insert({
        nombre: datos.nombre,
        apellido: datos.apellido || '',
        dni: datos.dni || null,
        telefono: datos.telefono || null,
        email: datos.email || null,
        direccion: datos.direccion || null,
        cuenta_corriente: datos.cuentaCorriente === true || datos.cuentaCorriente === 'true',
        saldo: 0
    }).select().single();
    return mapCliente(data);
}

async function editarCliente(id, datos) {
    const update = {};
    if (datos.nombre     !== undefined) update.nombre     = datos.nombre;
    if (datos.apellido   !== undefined) update.apellido   = datos.apellido;
    if (datos.dni        !== undefined) update.dni        = datos.dni || null;
    if (datos.telefono   !== undefined) update.telefono   = datos.telefono || null;
    if (datos.email      !== undefined) update.email      = datos.email || null;
    if (datos.direccion  !== undefined) update.direccion  = datos.direccion || null;
    if (datos.cuentaCorriente !== undefined)
        update.cuenta_corriente = datos.cuentaCorriente === true || datos.cuentaCorriente === 'true';
    const { data } = await supabase.from('clientes').update(update).eq('id', id).select().single();
    return mapCliente(data);
}

async function eliminarCliente(id) {
    const { data } = await supabase.from('clientes').delete().eq('id', id).select().single();
    return data;
}

async function habilitarCuentaCorriente(id) {
    const { data } = await supabase.from('clientes').update({ cuenta_corriente: true }).eq('id', id).select().single();
    return data;
}

async function agregarMovimiento(id, { tipo, descripcion, monto }) {
    const cliente = await clienteById(id);
    if (!cliente) return null;
    const { data: mov } = await supabase.from('movimientos_cuenta').insert({
        cliente_id: id, tipo, descripcion, monto: Number(monto)
    }).select().single();
    // actualizo el saldo del cliente
    await supabase.from('clientes').update({ saldo: (cliente.saldo || 0) + Number(monto) }).eq('id', id);
    return mov;
}

async function abonarCuenta(id, monto) {
    return agregarMovimiento(id, { tipo: 'pago', descripcion: 'Pago / abono de deuda', monto: Number(monto) });
}

async function clientesConCuenta() {
    const { data: clientes } = await supabase.from('clientes').select('*').eq('cuenta_corriente', true).order('id');
    if (!clientes || clientes.length === 0) return [];
    const ids = clientes.map(c => c.id);
    const { data: movs } = await supabase.from('movimientos_cuenta').select('*').in('cliente_id', ids);
    const movsMap = {};
    (movs || []).forEach(m => {
        if (!movsMap[m.cliente_id]) movsMap[m.cliente_id] = [];
        movsMap[m.cliente_id].push(m);
    });
    return clientes.map(c => ({ ...mapCliente(c), movimientos: movsMap[c.id] || [] }));
}

async function clientesSinCuenta() {
    const { data } = await supabase.from('clientes').select('*').eq('cuenta_corriente', false).order('id');
    return (data || []).map(mapCliente);
}

module.exports = {
    listClientes, clienteById, buscarClientes, crearCliente, editarCliente,
    eliminarCliente, habilitarCuentaCorriente, agregarMovimiento, abonarCuenta,
    clientesConCuenta, clientesSinCuenta, nombreCompleto
};
