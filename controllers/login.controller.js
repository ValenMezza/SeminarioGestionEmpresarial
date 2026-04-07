const { buscarPorUser, crearUsuario, resetPassword } = require('../store/dbUsers');
const { validarContrasena, hashPassword, verifyPassword } = require('../lib/password');

const MAX_INTENTOS = 5;

// Detecta si el string es un hash bcrypt
function esBcrypt(str) {
    return typeof str === 'string' && str.startsWith('$2');
}

const loginController = {
    index: (req, res) => {
        if (req.session?.user) return res.redirect('/home');
        res.render('login/index', { error: null });
    },

    login: async (req, res) => {
        const { user, password } = req.body;

        if (!req.session.loginIntentos) req.session.loginIntentos = 0;

        if (req.session.loginIntentos >= MAX_INTENTOS) {
            return res.render('login/index', {
                error: 'Demasiados intentos fallidos. Contactá al administrador para restablecer tu acceso.'
            });
        }

        const usuario = await buscarPorUser(user);

        let passwordOk = false;
        if (usuario) {
            if (esBcrypt(usuario.password)) {
                // Contraseña ya hasheada
                passwordOk = await verifyPassword(password, usuario.password);
            } else {
                // Contraseña en texto plano (usuario viejo) — comparar y migrar
                if (usuario.password === password) {
                    passwordOk = true;
                    const hash = await hashPassword(password);
                    await resetPassword(usuario.id, hash);
                }
            }
        }

        if (!usuario || !passwordOk) {
            req.session.loginIntentos++;
            const restantes = MAX_INTENTOS - req.session.loginIntentos;
            const msg = restantes > 0
                ? `Usuario o contraseña incorrectos. Te quedan ${restantes} intento${restantes !== 1 ? 's' : ''}.`
                : 'Demasiados intentos fallidos. Contactá al administrador para restablecer tu acceso.';
            return res.render('login/index', { error: msg });
        }

        if (!usuario.activo) {
            return res.render('login/index', { error: 'Tu cuenta está pausada. Contactá al administrador.' });
        }

        req.session.loginIntentos = 0;
        req.session.user = { id: usuario.id, user: usuario.user, rol: usuario.rol };
        res.redirect('/home');
    },

    logout: (req, res) => {
        req.session.destroy(() => res.redirect('/'));
    },

    createUser: (_req, res) => {
        res.render('login/create', { error: null });
    },

    postUser: async (req, res) => {
        const { user, password } = req.body;
        if (!user || !password) {
            return res.render('login/create', { error: 'Completá todos los campos.' });
        }
        const errorPass = validarContrasena(password);
        if (errorPass) {
            return res.render('login/create', { error: errorPass });
        }
        if (await buscarPorUser(user)) {
            return res.render('login/create', { error: 'Ese nombre de usuario ya existe.' });
        }
        const hash = await hashPassword(password);
        await crearUsuario({ user, password: hash, rol: 'operador' });
        res.redirect('/');
    }
};

module.exports = loginController;
