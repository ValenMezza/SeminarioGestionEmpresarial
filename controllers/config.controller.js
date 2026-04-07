const { listUsuarios, crearUsuario, pausarUsuario, eliminarUsuario, resetPassword: cambiarPass } = require('../store/dbUsers');
const { validarContrasena, hashPassword } = require('../lib/password');

const configController = {
    index: (req, res) => {
        res.render('configuraciones/index');
    },

    usuarios: async (req, res) => {
        const usuarios = await listUsuarios();
        res.render('configuraciones/usuarios', { usuarios, error: null });
    },

    crearUsuario: async (req, res) => {
        const { nombre, apellido, user, password, rol } = req.body;
        if (!user || !password || !nombre || !apellido) {
            const usuarios = await listUsuarios();
            return res.render('configuraciones/usuarios', { usuarios, error: 'Completá todos los campos.' });
        }
        const errorPass = validarContrasena(password);
        if (errorPass) {
            const usuarios = await listUsuarios();
            return res.render('configuraciones/usuarios', { usuarios, error: errorPass });
        }
        const hash = await hashPassword(password);
        await crearUsuario({ nombre, apellido, user, password: hash, rol });
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

    cambiarPassword: async (req, res) => {
        const id = Number(req.params.id);
        const { password } = req.body;
        if (!password) return res.redirect('/configuraciones/usuarios');
        const errorPass = validarContrasena(password);
        if (errorPass) return res.redirect('/configuraciones/usuarios');
        const hash = await hashPassword(password);
        await cambiarPass(id, hash);
        res.redirect('/configuraciones/usuarios');
    }
};

module.exports = configController;
