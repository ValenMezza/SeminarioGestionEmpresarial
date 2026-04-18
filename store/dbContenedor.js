const supabase = require('../lib/supabase');

// mapeo snake_case de la DB a camelCase para usar en el codigo
function mapRow(c) {
    if (!c) return null;
    return {
        ...c,
        clienteId:         c.cliente_id,
        inicioAlquiler:    c.inicio_alquiler,
        finAlquiler:       c.fin_alquiler,
        direccionAlquiler: c.direccion_alquiler,
        precioAlquiler:    c.precio_alquiler,
        precioDia:         c.precio_dia,
    };
}

async function listContenedores() {
    const { data } = await supabase.from('contenedores').select('*').order('id');
    return (data || []).map(mapRow);
}

async function contenedorById(id) {
    const { data } = await supabase.from('contenedores').select('*').eq('id', id).single();
    return mapRow(data);
}

async function listContenedoresAlquilados() {
    const { data } = await supabase.from('contenedores').select('*').eq('estado', 'Alquilado').order('id');
    return (data || []).map(mapRow);
}

async function listContenedoresDisponibles() {
    const { data } = await supabase.from('contenedores').select('*').eq('estado', 'Disponible').order('id');
    return (data || []).map(mapRow);
}

async function contenedorLibre() {
    const { data } = await supabase.from('contenedores').select('*').eq('estado', 'Disponible').limit(1).single();
    return mapRow(data);
}

// trae los contenedores que vencen en 2 dias o menos
async function listContenedoresPorFinalizar() {
    const en2dias = new Date();
    en2dias.setDate(en2dias.getDate() + 2);
    const limite = en2dias.toISOString().split('T')[0];
    const { data } = await supabase.from('contenedores').select('*')
        .eq('estado', 'Alquilado')
        .lte('fin_alquiler', limite)
        .order('fin_alquiler');
    return (data || []).map(mapRow);
}

async function actualizarContenedor(id, datos) {
    const update = {};
    if (datos.estado             !== undefined) update.estado              = datos.estado;
    if (datos.cliente            !== undefined) update.cliente             = datos.cliente;
    if (datos.clienteId          !== undefined) update.cliente_id          = datos.clienteId;
    if (datos.inicioAlquiler     !== undefined) update.inicio_alquiler     = datos.inicioAlquiler;
    if (datos.finAlquiler        !== undefined) update.fin_alquiler        = datos.finAlquiler;
    if (datos.direccionAlquiler  !== undefined) update.direccion_alquiler  = datos.direccionAlquiler;
    if (datos.precioAlquiler     !== undefined) update.precio_alquiler     = datos.precioAlquiler;
    if (datos.precioDia          !== undefined) update.precio_dia          = datos.precioDia;
    const { data, error } = await supabase.from('contenedores').update(update).eq('id', id).select().single();
    if (error) throw new Error(`actualizarContenedor: ${error.message}`);
    return mapRow(data);
}

// actualiza precios base de todos los contenedores disponibles
async function actualizarPrecios(precioDia, precioAlquiler) {
    await supabase.from('contenedores').update({
        precio_dia: precioDia, precio_alquiler: precioAlquiler
    }).eq('estado', 'Disponible');
}

// agarro los precios base leyendo un contenedor disponible
async function getPreciosConfig() {
    const { data } = await supabase.from('contenedores').select('precio_dia, precio_alquiler')
        .eq('estado', 'Disponible').limit(1).maybeSingle();
    return {
        precioDia:      data?.precio_dia      ?? 30000,
        precioAlquiler: data?.precio_alquiler ?? 250000,
    };
}

// al finalizar un alquiler, resetea el contenedor a disponible con precios default
async function finalizarAlquiler(id) {
    const { data: cfg } = await supabase.from('contenedores').select('precio_dia, precio_alquiler').eq('estado', 'Disponible').limit(1).single();
    const { data } = await supabase.from('contenedores').update({
        estado: 'Disponible',
        cliente: null, cliente_id: null,
        inicio_alquiler: null, fin_alquiler: null, direccion_alquiler: null,
        precio_dia:      cfg?.precio_dia      ?? 5000,
        precio_alquiler: cfg?.precio_alquiler ?? 30000,
    }).eq('id', id).select().single();
    return mapRow(data);
}

async function crearContenedor() {
    // agarro los precios de otro contenedor para mantener consistencia
    const { data: ref } = await supabase.from('contenedores').select('precio_dia, precio_alquiler').limit(1).single();
    const { data } = await supabase.from('contenedores').insert({
        estado: 'Disponible',
        precio_alquiler: ref?.precio_alquiler ?? 30000,
        precio_dia:      ref?.precio_dia      ?? 5000,
        cliente: null, cliente_id: null,
        inicio_alquiler: null, fin_alquiler: null, direccion_alquiler: null
    }).select().single();
    return mapRow(data);
}

async function eliminarContenedor(id) {
    const cont = await contenedorById(id);
    if (!cont || cont.estado === 'Alquilado') return null; // no se puede eliminar si esta alquilado
    const { data } = await supabase.from('contenedores').delete().eq('id', id).select().single();
    return mapRow(data);
}

module.exports = {
    contenedorById, listContenedores, listContenedoresAlquilados,
    listContenedoresDisponibles, contenedorLibre, actualizarContenedor,
    listContenedoresPorFinalizar, actualizarPrecios, getPreciosConfig, finalizarAlquiler,
    crearContenedor, eliminarContenedor
};
