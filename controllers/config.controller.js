const { listUsuarios, crearUsuario, pausarUsuario, eliminarUsuario, resetPassword } = require('../store/dbUsers');

const configController = {
    index: (req, res) => {
        res.render('configuraciones/index');
    },

    usuarios: async (req, res) => {
        const usuarios = await listUsuarios();
        res.render('configuraciones/usuarios', { usuarios });
    },

    crearUsuario: async (req, res) => {
        const { nombre, apellido, user, password, rol } = req.body;
        if (!user || !password || !nombre || !apellido) return res.redirect('/configuraciones/usuarios');
        await crearUsuario({ nombre, apellido, user, password, rol });
        res.redirect('/configuraciones/usuarios');
    },

    pausarUsuario: async (req, res) => {
        const id = Number(req.params.id);
        await pausarUsuario(id);
        res.redirect('/configuraciones/usuarios');
    },

    eliminarUsuario: async (req, res) => {
        const id = Number(req.params.id);
        await eliminarUsuario(id);
        res.redirect('/configuraciones/usuarios');
    },

    resetPassword: async (req, res) => {
        const id = Number(req.params.id);
        await resetPassword(id, '123456');
        res.redirect('/configuraciones/usuarios');
    }
};

module.exports = configController;
