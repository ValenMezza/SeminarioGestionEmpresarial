require('dotenv').config();
var createError = require('http-errors');
var express     = require('express');
var path        = require('path');
var cookieParser = require('cookie-parser');
var logger      = require('morgan');
var session     = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'gestion-empresarial-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 horas
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.formatFecha = (fecha) => {
        if (!fecha) return '';
        const [y, m, d] = fecha.split('-');
        return `${d}-${m}-${y}`;
    };
    res.locals.sessionUser = req.session?.user ?? null;
    next();
});

// ── Middleware de autenticación ───────────────────────────────
const requireAuth  = require('./middleware/requireAuth');
const requireAdmin = require('./middleware/requireAdmin');

// ── Controladores ─────────────────────────────────────────────
const authController         = require('./controllers/login.controller.js');
const homeController         = require('./controllers/home.controller.js');
const ventasController       = require('./controllers/ventas.controller.js');
const alquilerController     = require('./controllers/alquiler.controller.js');
const contenedoresController = require('./controllers/contenedores.controller.js');
const stockController        = require('./controllers/stock.controller.js');
const clienteController      = require('./controllers/clientes.controller.js');
const transaccionesController = require('./controllers/transacciones.controller.js');
const configController       = require('./controllers/config.controller.js');

// ── Auth (rutas públicas) ─────────────────────────────────────
app.get('/',        authController.index);
app.post('/login',  authController.login);
app.get('/logout',  authController.logout);
app.get('/create',  authController.createUser);
app.post('/create', authController.postUser);

// ── Rutas protegidas ──────────────────────────────────────────
app.use(requireAuth);

// ── Home ──────────────────────────────────────────────────────
app.get('/home', homeController.index);

// ── Ventas ────────────────────────────────────────────────────
app.get('/ventas',                         ventasController.index);
app.get('/ventas/cantera',                 ventasController.cantera);
app.post('/ventas/finalizar-cantera',      ventasController.finalizarVentaCantera);
app.get('/ventas/cantera/confirmacion',    ventasController.confirmacionCantera);
app.get('/ventas/viaje',                   ventasController.viaje);
app.post('/ventas/crear-viaje',            ventasController.crearViajeProgramado);
app.post('/ventas/finalizar-viaje/:id',    ventasController.finalizarViajeProgramado);
app.get('/ventas/viaje/detalle/:id',       ventasController.detalleViaje);

// ── Transacciones ─────────────────────────────────────────────
app.get('/transacciones',            transaccionesController.index);
app.get('/transacciones/detalle/:id', transaccionesController.detalle);

// ── Alquileres ────────────────────────────────────────────────
app.get('/alquileres',                    alquilerController.index);
app.get('/alquileres/detalle/:id',        alquilerController.detalle);
app.get('/alquileres/nuevo_alquiler',     alquilerController.nuevoAlquiler);
app.get('/alquileres/confirmacion/:id',   alquilerController.confirmacion);
app.get('/alquileres/editar/:id',         alquilerController.edicionAlquiler);
app.post('/alquileres/editar/:id',        alquilerController.guardarEdicion);
app.post('/alquileres/crear',             alquilerController.crearAlquiler);
app.post('/alquileres/cancelar/:id',      alquilerController.cancelarAlquiler);
app.post('/alquileres/finalizar/:id',     alquilerController.finalizarAlquiler);

// ── Contenedores ──────────────────────────────────────────────
app.get('/contenedores',                contenedoresController.index);
app.get('/contenedores/detalle/:id',    contenedoresController.detalle);
app.get('/contenedores/config',         contenedoresController.config);
app.post('/contenedores/config',        contenedoresController.guardarConfig);
app.post('/contenedores/crear',         contenedoresController.crear);
app.post('/contenedores/eliminar/:id',  contenedoresController.eliminar);
// Editar contenedor reutiliza la misma lógica de alquileres/editar
app.get('/contenedores/:id/edit',  alquilerController.edicionAlquiler);
app.post('/contenedores/:id/edit', alquilerController.guardarEdicion);

// ── Stock ─────────────────────────────────────────────────────
app.get('/stock',                stockController.index);
app.get('/stock/nuevo_stock',    stockController.nuevoStock);
app.post('/stock/nuevo_stock',   stockController.crearStock);
app.get('/stock/detalle/:id',    stockController.detalle);
app.get('/stock/editar/:id',     stockController.editarStock);
app.post('/stock/editar/:id',    stockController.guardarEdicionStock);
app.post('/stock/eliminar/:id',  stockController.eliminarStock);

// ── Clientes ──────────────────────────────────────────────────
app.get('/clientes',                    clienteController.index);
app.get('/clientes/nuevo_cliente',      clienteController.nuevo);
app.post('/clientes/nuevo_cliente',     clienteController.crearCliente);
app.get('/clientes/detalle/:id',        clienteController.detalle);
app.post('/clientes/eliminar/:id',      clienteController.eliminar);
app.get('/clientes/cuentas',            clienteController.cuentas);
app.get('/clientes/editar/:id',         clienteController.editar);
app.post('/clientes/editar/:id',        clienteController.guardarEdicion);
app.post('/clientes/:id/habilitar-cuenta', clienteController.habilitarCuenta);
app.post('/clientes/:id/abonar',          clienteController.abonar);

// ── API Clientes (JSON) ──────────────────────────────────────
app.get('/api/clientes/buscar',  clienteController.buscarApi);
app.post('/api/clientes/crear',  clienteController.crearApi);

// ── Configuraciones (solo admin) ──────────────────────────────
app.get('/configuraciones',                          requireAdmin, configController.index);
app.get('/configuraciones/usuarios',                 requireAdmin, configController.usuarios);
app.post('/configuraciones/usuarios/crear',          requireAdmin, configController.crearUsuario);
app.post('/configuraciones/usuarios/pausar/:id',     requireAdmin, configController.pausarUsuario);
app.post('/configuraciones/usuarios/eliminar/:id',   requireAdmin, configController.eliminarUsuario);
app.post('/configuraciones/usuarios/editar/:id',     requireAdmin, configController.editarUsuario);

// ── Utilidades ────────────────────────────────────────────────
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.status(204).end();
});

// 404
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error   = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
