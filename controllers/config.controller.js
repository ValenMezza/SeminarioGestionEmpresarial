const { listUsuarios, crearUsuario, pausarUsuario, eliminarUsuario, actualizarUsuario } = require('../store/dbUsers');
const { validarContrasena, hashPassword } = require('../lib/password');

async function renderUsuarios(res, error = null) {
    const usuarios = await listUsuarios();
    res.render('configuraciones/usuarios', { usuarios, error });
}

const configController = {
    index: (req, res) => {
        res.render('configuraciones/index');
    },

    usuarios: async (req, res) => {
        await renderUsuarios(res);
    },

    crearUsuario: async (req, res) => {
        const { nombre, apellido, user, password, rol } = req.body;
        if (!user || !password || !nombre || !apellido) {
            return renderUsuarios(res, 'Completá todos los campos.');
        }
        const errorPass = validarContrasena(password);
        if (errorPass) return renderUsuarios(res, errorPass);

        try {
            const hash = await hashPassword(password);
            await crearUsuario({ nombre, apellido, user, password: hash, rol });
            res.redirect('/configuraciones/usuarios');
        } catch (err) {
            console.error('[crearUsuario]', err.message);
            await renderUsuarios(res, err.message || 'Error al crear el usuario.');
        }
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

    editarUsuario: async (req, res) => {
        const id = Number(req.params.id);
        const { nombre, apellido, user, rol, password } = req.body;

        if (!nombre || !apellido || !user) {
            return renderUsuarios(res, 'Nombre, apellido y usuario son obligatorios.');
        }
        // no se puede cambiar el rol del admin principal
        if (id === 1 && rol && rol !== 'admin') {
            return renderUsuarios(res, 'No se puede cambiar el rol del administrador principal.');
        }

        const datos = { nombre, apellido, user };
        if (rol && (rol === 'admin' || rol === 'operador')) datos.rol = rol;

        // solo actualizo la pass si mando una nueva
        if (password && password.trim() !== '') {
            const errorPass = validarContrasena(password);
            if (errorPass) return renderUsuarios(res, errorPass);
            datos.password = await hashPassword(password);
        }

        try {
            await actualizarUsuario(id, datos);
            res.redirect('/configuraciones/usuarios');
        } catch (err) {
            console.error('[editarUsuario]', err.message);
            await renderUsuarios(res, err.message || 'Error al editar el usuario.');
        }
    }
};

module.exports = configController;
