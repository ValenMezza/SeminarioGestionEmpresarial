const supabase = require('../lib/supabase');

async function crearTransaccion({ tipo, clienteId, cliente, monto, descripcion, metodoPago }) {
    const { data } = await supabase.from('transacciones').insert({
        tipo,
        cliente_id:  clienteId || null,
        cliente,
        monto,
        descripcion,
        metodo_pago: metodoPago || 'efectivo'
    }).select().single();
    return data;
}

async function listTransacciones() {
    const { data } = await supabase.from('transacciones').select('*').order('id', { ascending: false });
    return (data || []).map(t => ({ ...t, metodoPago: t.metodo_pago, clienteId: t.cliente_id }));
}

async function filtrarTransacciones({ id, tipo, idCliente, cliente, fechaDesde, fechaHasta, montoMin, montoMax } = {}) {
    let query = supabase.from('transacciones').select('*');
    if (id)         query = query.eq('id', Number(id));
    if (tipo && tipo !== 'todos') query = query.eq('tipo', tipo);
    if (idCliente)  query = query.eq('cliente_id', Number(idCliente));
    if (cliente)    query = query.ilike('cliente', `%${cliente}%`);
    if (fechaDesde) query = query.gte('fecha', fechaDesde);
    if (fechaHasta) query = query.lte('fecha', fechaHasta);
    if (montoMin)   query = query.gte('monto', Number(montoMin));
    if (montoMax)   query = query.lte('monto', Number(montoMax));
    const { data } = await query.order('id', { ascending: false });
    return (data || []).map(t => ({ ...t, metodoPago: t.metodo_pago, clienteId: t.cliente_id }));
}

module.exports = { crearTransaccion, listTransacciones, filtrarTransacciones };
