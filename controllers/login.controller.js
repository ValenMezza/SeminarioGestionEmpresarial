const { buscarPorUser, crearUsuario } = require('../store/dbUsers');

const loginController = {
    index: (req, res) => {
        if (req.session?.user) return res.redirect('/home');
        res.render('login/index', { error: null });
    },

    login: (req, res) => {
        const { user, password } = req.body;
        const usuario = buscarPorUser(user);

        if (!usuario || usuario.password !== password) {
            return res.render('login/index', { error: 'Usuario o contraseña incorrectos.' });
        }
        if (!usuario.activo) {
            return res.render('login/index', { error: 'Tu cuenta está pausada. Contactá al administrador.' });
        }

        req.session.user = { id: usuario.id, user: usuario.user, rol: usuario.rol };
        res.redirect('/home');
    },

    logout: (req, res) => {
        req.session.destroy(() => res.redirect('/'));
    },

    createUser: (req, res) => {
        res.render('login/create', { error: null });
    },

    postUser: (req, res) => {
        const { user, password } = req.body;
        if (!user || !password) {
            return res.render('login/create', { error: 'Completá todos los campos.' });
        }
        if (buscarPorUser(user)) {
            return res.render('login/create', { error: 'Ese nombre de usuario ya existe.' });
        }
        crearUsuario({ user, password, rol: 'operador' });
        res.redirect('/');
    }
};

module.exports = loginController;
