const supabase = require('../lib/supabase');

function mapRow(v) {
    if (!v) return null;
    return {
        ...v,
        clienteId:      v.cliente_id,
        clienteNombre:  v.cliente_nombre,
        productoId:     v.producto_id,
        productoNombre: v.producto_nombre,
        precioProducto: v.precio_producto,
        precioFlete:    v.precio_flete,
        precioTotal:    v.precio_total,
        metodoPago:     v.metodo_pago,
        creadoEn:       v.creado_en,
    };
}

async function crearViaje(datos) {
    const { data } = await supabase.from('viajes').insert({
        cliente_id:      datos.clienteId || null,
        cliente_nombre:  datos.clienteNombre,
        telefono:        datos.telefono || null,
        fecha:           datos.fecha,
        hora:            datos.hora || null,
        direccion:       datos.direccion,
        producto_id:     datos.productoId || null,
        producto_nombre: datos.productoNombre,
        cantidad:        datos.cantidad || 1,
        precio_producto: datos.precioProducto || 0,
        precio_flete:    datos.precioFlete || 0,
        precio_total:    datos.precioTotal || 0,
        metodo_pago:     datos.metodoPago || 'efectivo',
        descripcion:     datos.descripcion || '',
        estado:          datos.estado || 'pendiente'
    }).select().single();
    return mapRow(data);
}

async function listViajes() {
    const { data } = await supabase.from('viajes').select('*').order('id', { ascending: false });
    return (data || []).map(mapRow);
}

async function viajeById(id) {
    const { data } = await supabase.from('viajes').select('*').eq('id', id).single();
    return mapRow(data);
}

async function finalizarViaje(id) {
    const { data } = await supabase.from('viajes').update({ estado: 'finalizado' }).eq('id', id).select().single();
    return mapRow(data);
}

async function viajesPendientesHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('viajes').select('*').eq('estado', 'pendiente').eq('fecha', hoy);
    return (data || []).map(mapRow);
}

async function viajesPendientes() {
    const { data } = await supabase.from('viajes').select('*').eq('estado', 'pendiente').order('fecha');
    return (data || []).map(mapRow);
}

module.exports = { crearViaje, listViajes, viajeById, finalizarViaje, viajesPendientesHoy, viajesPendientes };
