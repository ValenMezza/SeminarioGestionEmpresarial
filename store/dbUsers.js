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
    const { data, error } = await supabase.from('usuarios').insert({
        nombre: nombre || '', apellido: apellido || '', user, password,
        rol: rol || 'operador', activo: true
    }).select().single();
    if (error) {
        if (error.code === '23505' || /duplicate/i.test(error.message)) {
            throw new Error(`El nombre de usuario "${user}" ya existe.`);
        }
        throw new Error(`crearUsuario: ${error.message}`);
    }
    return data;
}

async function cambiarRol(id, rol) {
    if (rol !== 'admin' && rol !== 'operador') {
        throw new Error('Rol inválido. Debe ser "admin" u "operador".');
    }
    const { data, error } = await supabase.from('usuarios').update({ rol }).eq('id', id).select().single();
    if (error) throw new Error(`cambiarRol: ${error.message}`);
    return data;
}

async function actualizarUsuario(id, datos) {
    const { data, error } = await supabase.from('usuarios').update(datos).eq('id', id).select().single();
    if (error) {
        if (error.code === '23505' || /duplicate/i.test(error.message)) {
            throw new Error(`El nombre de usuario "${datos.user}" ya existe.`);
        }
        throw new Error(`actualizarUsuario: ${error.message}`);
    }
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

module.exports = { listUsuarios, usuarioById, buscarPorUser, crearUsuario, actualizarUsuario, eliminarUsuario, pausarUsuario, resetPassword, cambiarRol };
