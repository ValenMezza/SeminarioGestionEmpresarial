const supabase = require('../lib/supabase');

function mapRow(a) {
    if (!a) return null;
    return {
        ...a,
        contenedorId:      a.contenedor_id,
        clienteId:         a.cliente_id,
        clienteNombre:     a.cliente_nombre,
        inicioAlquiler:    a.inicio_alquiler,
        finAlquiler:       a.fin_alquiler,
        direccionAlquiler: a.direccion_alquiler,
        precioAlquiler:    a.precio_alquiler,
        metodoPago:        a.metodo_pago,
        creadoEn:          a.creado_en,
    };
}

async function crearAlquiler(datos) {
    const { data, error } = await supabase.from('alquileres').insert({
        contenedor_id:      datos.contenedorId,
        cliente_id:         datos.clienteId || null,
        cliente_nombre:     datos.clienteNombre,
        inicio_alquiler:    datos.inicioAlquiler,
        fin_alquiler:       datos.finAlquiler,
        direccion_alquiler: datos.direccionAlquiler,
        precio_alquiler:    datos.precioAlquiler || 0,
        metodo_pago:        datos.metodoPago || 'efectivo',
        estado:             datos.estado || 'activo'
    }).select().single();
    if (error) throw new Error(`crearAlquiler: ${error.message}`);
    return mapRow(data);
}

async function listAlquileres() {
    const { data } = await supabase.from('alquileres').select('*').order('id', { ascending: false });
    return (data || []).map(mapRow);
}

async function alquilerById(id) {
    const { data } = await supabase.from('alquileres').select('*').eq('id', id).single();
    return mapRow(data);
}

async function alquileresProgramados() {
    const { data } = await supabase.from('alquileres').select('*').eq('estado', 'programado');
    return (data || []).map(mapRow);
}

async function alquileresActivos() {
    const { data } = await supabase.from('alquileres').select('*').eq('estado', 'activo');
    return (data || []).map(mapRow);
}

async function alquileresPorIniciar() {
    const hoy = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('alquileres').select('*').eq('estado', 'programado').gt('inicio_alquiler', hoy);
    return (data || []).map(mapRow);
}

async function alquileresProgramadosPorContenedor(contenedorId) {
    const { data } = await supabase.from('alquileres').select('*')
        .eq('contenedor_id', contenedorId).eq('estado', 'programado').maybeSingle();
    return mapRow(data);
}

async function activarAlquiler(id) {
    const { data } = await supabase.from('alquileres').update({ estado: 'activo' }).eq('id', id).select().single();
    return mapRow(data);
}

async function finalizarAlquilerRecord(id) {
    const { data } = await supabase.from('alquileres').update({ estado: 'finalizado' }).eq('id', id).select().single();
    return mapRow(data);
}

async function cancelarAlquilerRecord(id) {
    const { data } = await supabase.from('alquileres').update({ estado: 'cancelado' }).eq('id', id).select().single();
    return mapRow(data);
}

module.exports = {
    crearAlquiler, listAlquileres, alquilerById,
    alquileresProgramados, alquileresActivos, alquileresPorIniciar,
    alquileresProgramadosPorContenedor, activarAlquiler,
    finalizarAlquilerRecord, cancelarAlquilerRecord
};
