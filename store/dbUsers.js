const dbUsers = {
    lista: [
        { id: 1, user: 'admin', password: 'admin123', rol: 'admin', activo: true }
    ],
    nextId: 2
};

function listUsuarios() {
    return dbUsers.lista;
}

function usuarioById(id) {
    return dbUsers.lista.find(u => u.id === id);
}

function buscarPorUser(user) {
    return dbUsers.lista.find(u => u.user === user);
}

function crearUsuario({ user, password, rol }) {
    const nuevo = { id: dbUsers.nextId++, user, password, rol: rol || 'operador', activo: true };
    dbUsers.lista.push(nuevo);
    return nuevo;
}

function actualizarUsuario(id, datos) {
    const u = dbUsers.lista.find(u => u.id === id);
    if (!u) return null;
    Object.assign(u, datos);
    return u;
}

function eliminarUsuario(id) {
    const idx = dbUsers.lista.findIndex(u => u.id === id);
    if (idx === -1) return null;
    return dbUsers.lista.splice(idx, 1)[0];
}

function pausarUsuario(id) {
    const u = dbUsers.lista.find(u => u.id === id);
    if (!u) return null;
    u.activo = !u.activo;
    return u;
}

function resetPassword(id, newPassword) {
    const u = dbUsers.lista.find(u => u.id === id);
    if (!u) return null;
    u.password = newPassword;
    return u;
}

module.exports = { dbUsers, listUsuarios, usuarioById, buscarPorUser, crearUsuario, actualizarUsuario, eliminarUsuario, pausarUsuario, resetPassword };
