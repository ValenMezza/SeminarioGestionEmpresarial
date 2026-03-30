const { listUsuarios, crearUsuario, pausarUsuario, eliminarUsuario, resetPassword } = require('../store/dbUsers');

const configController = {
    index: (req, res) => {
        res.render('configuraciones/index');
    },

    usuarios: (req, res) => {
        const usuarios = listUsuarios();
        res.render('configuraciones/usuarios', { usuarios });
    },

    crearUsuario: (req, res) => {
        const { user, password, rol } = req.body;
        if (!user || !password) return res.redirect('/configuraciones/usuarios');
        crearUsuario({ user, password, rol });
        res.redirect('/configuraciones/usuarios');
    },

    pausarUsuario: (req, res) => {
        const id = Number(req.params.id);
        pausarUsuario(id);
        res.redirect('/configuraciones/usuarios');
    },

    eliminarUsuario: (req, res) => {
        const id = Number(req.params.id);
        eliminarUsuario(id);
        res.redirect('/configuraciones/usuarios');
    },

    resetPassword: (req, res) => {
        const id = Number(req.params.id);
        resetPassword(id, '123456');
        res.redirect('/configuraciones/usuarios');
    }
};

module.exports = configController;
