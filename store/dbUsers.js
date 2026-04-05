const supabase = require('../lib/supabase');

async function listUsuarios() {
    const { data } = await supabase.from('usuarios').select('*').order('id');
    return data || [];
}

async function usuarioById(id) {
    const { data } = await supabase.from('usuarios').select('*').eq('id', id).single();
    return data;
}

async function buscarPorUser(user) {
    const { data } = await supabase.from('usuarios').select('*').eq('user', user).single();
    return data;
}

async function crearUsuario({ nombre, apellido, user, password, rol }) {
    const { data } = await supabase.from('usuarios').insert({
        nombre: nombre || '', apellido: apellido || '', user, password,
        rol: rol || 'operador', activo: true
    }).select().single();
    return data;
}

async function actualizarUsuario(id, datos) {
    const { data } = await supabase.from('usuarios').update(datos).eq('id', id).select().single();
    return data;
}

async function eliminarUsuario(id) {
    const { data } = await supabase.from('usuarios').delete().eq('id', id).select().single();
    return data;
}

async function pausarUsuario(id) {
    const usuario = await usuarioById(id);
    if (!usuario) return null;
    const { data } = await supabase.from('usuarios').update({ activo: !usuario.activo }).eq('id', id).select().single();
    return data;
}

async function resetPassword(id, newPassword) {
    const { data } = await supabase.from('usuarios').update({ password: newPassword }).eq('id', id).select().single();
    return data;
}

module.exports = { listUsuarios, usuarioById, buscarPorUser, crearUsuario, actualizarUsuario, eliminarUsuario, pausarUsuario, resetPassword };
