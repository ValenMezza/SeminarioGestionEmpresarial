var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var app = express();




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((_req, res, next) => {
    res.locals.formatFecha = (fecha) => {
        if (!fecha) return '';
        const [y, m, d] = fecha.split('-');
        return `${d}-${m}-${y}`;
    };
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//controladores
const authController = require('./controllers/login.controller.js');
const homeController = require('./controllers/home.controller.js');
const ventasController = require('./controllers/ventas.controller.js')
const alquilerController = require('./controllers/alquiler.controller.js');
const contenedoresController = require('./controllers/contenedores.controller.js');
const stockController = require('./controllers/stock.controller.js');
const clienteController = require('./controllers/clientes.controller.js');
const transaccionesController = require('./controllers/transacciones.controller.js')

//rutas
app.get('/', authController.index) //login
app.get('/create', authController.createUser)//para crear usuario
app.post('/create', authController.postUser); //método post para la creacion 
app.get('/home', homeController.index) //home
app.get('/ventas', ventasController.index)

//transacciones
app.get('/transacciones', transaccionesController.index)
app.get('/transacciones/detalle', transaccionesController.detalle)


//alquiler
app.get('/alquileres', alquilerController.index);
app.get('/alquileres/detalle/:id', alquilerController.detalle);
app.get('/alquileres/nuevo_alquiler', alquilerController.nuevoAlquiler)
app.get('/alquileres/editar/:id', alquilerController.edicionAlquiler)
app.post('/alquileres/editar/:id', alquilerController.guardarEdicion);
app.post('/alquileres/crear', alquilerController.crearAlquiler);
app.post('/alquileres/finalizar/:id', alquilerController.finalizarAlquiler);

//contendedor
app.get('/contenedores', contenedoresController.index)
app.get('/contenedores/detalle', contenedoresController.detalle)
app.get('/contenedores/config', contenedoresController.config)
app.post('/contenedores/config', contenedoresController.guardarConfig)
//stock
app.get('/stock', stockController.index)
app.get('/stock/detalle/:id', stockController.detalle)
app.get('/stock/nuevo_stock', stockController.nuevoStock)

//cliente
app.get('/clientes', clienteController.index)
app.get('/clientes/nuevo_cliente', clienteController.nuevo)
app.post('/clientes/nuevo_cliente', clienteController.crearCliente)
app.get('/clientes/detalle/:id', clienteController.detalle)
app.post('/clientes/eliminar/:id', clienteController.eliminar)
app.get('/clientes/cuentas', clienteController.cuentas)

//para evitar un eerro 404 que ensucia consola
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
