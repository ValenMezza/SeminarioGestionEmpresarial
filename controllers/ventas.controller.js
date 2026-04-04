const { listProds, prodsById }              = require('../store/dbStock');
const { listClientes, nombreCompleto, agregarMovimiento } = require('../store/dbClientes');
const { crearTransaccion }                 = require('../store/dbTransacciones');
const { crearViaje, viajesPendientesHoy, viajesPendientes, viajeById, finalizarViaje } = require('../store/dbViajes');

const ventasController = {
    // Landing page: 2 cards + viajes programados del dia
    index: (req, res) => {
        const viajesHoy       = viajesPendientesHoy();
        const viajesTotales   = viajesPendientes();
        res.render('ventas/index', { viajesHoy, viajesTotales });
    },

    // Pagina cantera: productos + carrito
    cantera: async (req, res) => {
        const productos = await listProds();
        res.render('ventas/cantera', { productos });
    },

    // Pagina viaje: formulario dedicado
    viaje: async (req, res) => {
        const productos = await listProds();
        res.render('ventas/viaje', { productos });
    },

    finalizarVentaCantera: (req, res) => {
        const { clienteId, clienteNombre, items, metodoPago, precioTotal } = req.body;

        let carrito = [];
        try { carrito = JSON.parse(items || '[]'); } catch (_) {}

        const total = precioTotal ? Number(precioTotal) : carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
        const desc  = carrito.map(p => `${p.nombre} x${p.cantidad}`).join(', ');
        const nombre = clienteNombre || 'Particular';

        const cid = clienteId ? Number(clienteId) : null;
        crearTransaccion({
            tipo: 'Venta Cantera',
            clienteId: cid,
            cliente: nombre,
            monto: total,
            descripcion: desc,
            metodoPago: metodoPago || 'efectivo'
        });
        if (metodoPago === 'cuenta_corriente' && cid) {
            agregarMovimiento(cid, {
                tipo: 'deuda',
                descripcion: `Venta Cantera: ${desc}`,
                monto: -total
            });
        }

        res.redirect('/ventas/cantera/confirmacion?tipo=cantera&cliente=' + encodeURIComponent(nombre) + '&total=' + total);
    },

    confirmacionCantera: (req, res) => {
        const { tipo, cliente, total } = req.query;
        res.render('ventas/confirmacion', { tipo: tipo || 'cantera', cliente: cliente || '', total: total || 0 });
    },

    crearViajeProgramado: async (req, res) => {
        const { clienteId, clienteNombre, telefono, fecha, hora, calle, numero, productoId, cantidad, precioProducto, precioFlete, precioTotal, metodoPago, descripcion, finalizarAhora } = req.body;

        const prod = await prodsById(Number(productoId));
        const direccion = `${calle || ''} ${numero || ''}`.trim();
        const esFinalizarAhora = finalizarAhora === 'true';

        const viaje = crearViaje({
            clienteId: clienteId ? Number(clienteId) : null,
            clienteNombre: clienteNombre || 'Sin nombre',
            telefono,
            fecha,
            hora,
            direccion,
            productoId: Number(productoId),
            productoNombre: prod ? prod.producto : 'Producto',
            cantidad: Number(cantidad) || 1,
            precioProducto: Number(precioProducto) || 0,
            precioFlete: Number(precioFlete) || 0,
            precioTotal: Number(precioTotal) || 0,
            metodoPago: metodoPago || 'efectivo',
            descripcion: descripcion || '',
            estado: esFinalizarAhora ? 'finalizado' : 'pendiente'
        });

        if (esFinalizarAhora) {
            crearTransaccion({
                tipo: 'Venta Viaje',
                clienteId: viaje.clienteId,
                cliente: viaje.clienteNombre,
                monto: viaje.precioTotal,
                descripcion: `${viaje.productoNombre} x${viaje.cantidad} — ${viaje.direccion}`,
                metodoPago: viaje.metodoPago
            });
            if (viaje.metodoPago === 'cuenta_corriente' && viaje.clienteId) {
                agregarMovimiento(viaje.clienteId, {
                    tipo: 'deuda',
                    descripcion: `Venta Viaje: ${viaje.productoNombre} x${viaje.cantidad} — ${viaje.direccion}`,
                    monto: -viaje.precioTotal
                });
            }
        }

        res.redirect(`/ventas/viaje/detalle/${viaje.id}`);
    },

    finalizarViajeProgramado: (req, res) => {
        const id = Number(req.params.id);
        const viaje = viajeById(id);
        if (!viaje) return res.redirect('/ventas');

        finalizarViaje(id);

        crearTransaccion({
            tipo: 'Venta Viaje',
            clienteId: viaje.clienteId,
            cliente: viaje.clienteNombre,
            monto: viaje.precioTotal,
            descripcion: `${viaje.productoNombre} x${viaje.cantidad} — ${viaje.direccion}`,
            metodoPago: viaje.metodoPago
        });
        if (viaje.metodoPago === 'cuenta_corriente' && viaje.clienteId) {
            agregarMovimiento(viaje.clienteId, {
                tipo: 'deuda',
                descripcion: `Venta Viaje: ${viaje.productoNombre} x${viaje.cantidad} — ${viaje.direccion}`,
                monto: -viaje.precioTotal
            });
        }

        res.redirect(`/ventas/viaje/detalle/${id}`);
    },

    detalleViaje: (req, res) => {
        const id = Number(req.params.id);
        const viaje = viajeById(id);
        if (!viaje) return res.status(404).send('Viaje no encontrado');
        res.render('ventas/detalle_viaje', { viaje });
    }
};

module.exports = ventasController;
