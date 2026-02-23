var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var app = express();




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//controladores
const authController = require('./controllers/login.controller.js');
const homeController = require('./controllers/home.controller.js');
const ventasController = require('./controllers/ventas.controller.js')
const alquilerController = require ('./controllers/alquiler.controller.js');
const contenedoresController =require('./controllers/contenedores.controller.js');
const stockController = require('./controllers/stock.controller.js');
const clienteController = require('./controllers/clientes.controller.js');
const transaccionesController =require('./controllers/transacciones.controller.js')

//rutas
app.get('/',authController.index) //login
app.get('/create',authController.createUser)//para crear usuario
app.post('/create', authController.postUser); //método post para la creacion 
app.get('/home', homeController.index) //home
app.get('/ventas', ventasController.index)
app.get('/controllers/stock.controller.js')
app.get('/controllers/clientes.controller.js')

//transacciones
app.get('/transacciones', transaccionesController.index)
app.get('/transacciones/detalle',transaccionesController.detalle)


//alquiler
app.get('/alquileres', alquilerController.index);
app.get('/alquileres/detalle', alquilerController.detalle)
app.get('/alquileres/nuevo_alquiler', alquilerController.nuevoAlquiler)
app.get('/alquileres/edicion_alquiler', alquilerController.edicionAlquiler)

//contendedor
app.get('/contenedores', contenedoresController.index)
app.get('/contenedores/detalle', contenedoresController.detalle)

//stock
app.get('/stock',stockController.index)
app.get('/stock/detalle/:id',stockController.detalle)
app.get('/stock/nuevo_stock', stockController.nuevoStock)

//cliente
app.get('/clientes', clienteController.index)
app.get('/clientes/detalle', clienteController.detalle)
app.get('/clientes/cuentas', clienteController.cuentas)
app.get('/clientes/nuevo_cliente', clienteController.nuevo)

//para evitar un eerro 404 que ensucia consola
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
