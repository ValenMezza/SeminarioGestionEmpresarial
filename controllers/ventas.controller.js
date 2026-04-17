const { listProds, prodsById, actualizarProducto } = require('../store/dbStock');
const { listClientes, nombreCompleto, agregarMovimiento } = require('../store/dbClientes');
const { crearTransaccion }                 = require('../store/dbTransacciones');
const { crearViaje, viajesPendientesHoy, viajesPendientes, viajeById, finalizarViaje, cancelarViaje, actualizarViaje } = require('../store/dbViajes');

const ventasController = {
    index: async (req, res) => {
        const [viajesHoy, viajesTotales] = await Promise.all([
            viajesPendientesHoy(),
            viajesPendientes(),
        ]);
        res.render('ventas/index', { viajesHoy, viajesTotales });
    },

    cantera: async (req, res) => {
        const productos = await listProds();
        res.render('ventas/cantera', { productos });
    },

    viaje: async (req, res) => {
        const productos = await listProds();
        res.render('ventas/viaje', { productos });
    },

    finalizarVentaCantera: async (req, res) => {
        const { clienteId, clienteNombre, items, metodoPago, precioTotal } = req.body;
        let carrito = [];
        try { carrito = JSON.parse(items || '[]'); } catch (_) {}
        const total  = precioTotal ? Number(precioTotal) : carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
        const desc   = carrito.map(p => `${p.nombre} x${p.cantidad}`).join(', ');
        const nombre = clienteNombre || 'Particular';
        const cid    = clienteId ? Number(clienteId) : null;

        // Descontar stock de cada producto
        for (const item of carrito) {
            const prod = await prodsById(item.id);
            if (prod) {
                const nuevoStock = Math.max(0, prod.stock - item.cantidad);
                await actualizarProducto(item.id, { stock: nuevoStock });
            }
        }

        await crearTransaccion({ tipo: 'Venta Cantera', clienteId: cid, cliente: nombre, monto: total, descripcion: desc, metodoPago: metodoPago || 'efectivo' });
        if (metodoPago === 'cuenta_corriente' && cid) {
            await agregarMovimiento(cid, { tipo: 'deuda', descripcion: `Venta Cantera: ${desc}`, monto: -total });
        }
        res.redirect('/ventas/cantera/confirmacion?tipo=cantera&cliente=' + encodeURIComponent(nombre) + '&total=' + total);
    },

    confirmacionCantera: (req, res) => {
        const { tipo, cliente, total } = req.query;
        res.render('ventas/confirmacion', { tipo: tipo || 'cantera', cliente: cliente || '', total: total || 0 });
    },

    crearViajeProgramado: async (req, res) => {
        try {
            const { clienteId, clienteNombre, telefono, fecha, hora, calle, numero, productoId, cantidad, precioProducto, precioFlete, precioTotal, metodoPago, descripcion, finalizarAhora } = req.body;
            const prod = await prodsById(Number(productoId));
            const direccion = `${calle || ''} ${numero || ''}`.trim();
            const esFinalizarAhora = finalizarAhora === 'true';

            // Validar y descontar stock del producto
            const cantidadVendida = Number(cantidad) || 1;
            if (prod && cantidadVendida > prod.stock) {
                return res.status(400).send(`Stock insuficiente. Disponible: ${prod.stock} unidades.`);
            }
            if (prod) {
                await actualizarProducto(Number(productoId), { stock: prod.stock - cantidadVendida });
            }

            const viaje = await crearViaje({
                clienteId: clienteId ? Number(clienteId) : null,
                clienteNombre: clienteNombre || 'Sin nombre',
                telefono, fecha, hora, direccion,
                productoId: Number(productoId),
                productoNombre: prod ? prod.producto : 'Producto',
                cantidad: cantidadVendida,
                precioProducto: Number(precioProducto) || 0,
                precioFlete: Number(precioFlete) || 0,
                precioTotal: Number(precioTotal) || 0,
                metodoPago: metodoPago || 'efectivo',
                descripcion: descripcion || '',
                estado: esFinalizarAhora ? 'finalizado' : 'pendiente'
            });

            if (!viaje) throw new Error('No se pudo crear el viaje (insert devolvio null).');

            if (esFinalizarAhora) {
                await crearTransaccion({ tipo: 'Venta Viaje', clienteId: viaje.clienteId, cliente: viaje.clienteNombre, monto: viaje.precioTotal, descripcion: `${viaje.productoNombre} x${viaje.cantidad} — ${viaje.direccion}`, metodoPago: viaje.metodoPago });
                if (viaje.metodoPago === 'cuenta_corriente' && viaje.clienteId) {
                    await agregarMovimiento(viaje.clienteId, { tipo: 'deuda', descripcion: `Venta Viaje: ${viaje.productoNombre} x${viaje.cantidad} — ${viaje.direccion}`, monto: -viaje.precioTotal });
                }
            }
            res.redirect(`/ventas/viaje/detalle/${viaje.id}`);
        } catch (err) {
            console.error('[ventas/crearViajeProgramado]', err);
            res.status(500).send('Error al crear viaje: ' + err.message);
        }
    },

    finalizarViajeProgramado: async (req, res) => {
        const id = Number(req.params.id);
        const viaje = await viajeById(id);
        if (!viaje) return res.redirect('/ventas');

        await finalizarViaje(id);
        await crearTransaccion({ tipo: 'Venta Viaje', clienteId: viaje.clienteId, cliente: viaje.clienteNombre, monto: viaje.precioTotal, descripcion: `${viaje.productoNombre} x${viaje.cantidad} — ${viaje.direccion}`, metodoPago: viaje.metodoPago });
        if (viaje.metodoPago === 'cuenta_corriente' && viaje.clienteId) {
            await agregarMovimiento(viaje.clienteId, { tipo: 'deuda', descripcion: `Venta Viaje: ${viaje.productoNombre} x${viaje.cantidad} — ${viaje.direccion}`, monto: -viaje.precioTotal });
        }
        res.redirect(`/ventas/viaje/detalle/${id}`);
    },

    detalleViaje: async (req, res) => {
        const id = Number(req.params.id);
        const viaje = await viajeById(id);
        if (!viaje) return res.status(404).send('Viaje no encontrado');
        res.render('ventas/detalle_viaje', { viaje });
    },

    editarViaje: async (req, res) => {
        const id = Number(req.params.id);
        const viaje = await viajeById(id);
        if (!viaje) return res.redirect('/ventas');
        if (viaje.estado !== 'pendiente') return res.status(400).send('Solo se pueden editar viajes pendientes.');
        const dir = viaje.direccion || '';
        const lastSpace = dir.lastIndexOf(' ');
        const calle  = lastSpace > 0 ? dir.substring(0, lastSpace) : dir;
        const numero = lastSpace > 0 ? dir.substring(lastSpace + 1) : '';
        res.render('ventas/editar_viaje', { viaje, calle, numero });
    },

    guardarEdicionViaje: async (req, res) => {
        const id = Number(req.params.id);
        const viaje = await viajeById(id);
        if (!viaje) return res.redirect('/ventas');
        if (viaje.estado !== 'pendiente') return res.status(400).send('Solo se pueden editar viajes pendientes.');

        const cantidadNueva = Number(req.body.cantidad) || viaje.cantidad;
        const diff = cantidadNueva - viaje.cantidad;
        if (diff !== 0 && viaje.productoId) {
            const prod = await prodsById(viaje.productoId);
            if (prod) {
                if (diff > 0 && diff > prod.stock) {
                    return res.status(400).send(`Stock insuficiente. Disponible: ${prod.stock} unidades.`);
                }
                await actualizarProducto(viaje.productoId, { stock: prod.stock - diff });
            }
        }

        const precioProducto = req.body.precioProducto !== undefined ? Number(req.body.precioProducto) : viaje.precioProducto;
        const precioFlete    = req.body.precioFlete    !== undefined ? Number(req.body.precioFlete)    : viaje.precioFlete;
        const precioTotal    = req.body.precioTotal ? Number(req.body.precioTotal) : (precioProducto * cantidadNueva + precioFlete);

        await actualizarViaje(id, {
            fecha: req.body.fecha,
            hora: req.body.hora,
            telefono: req.body.telefono,
            direccion: `${req.body.calle || ''} ${req.body.numero || ''}`.trim(),
            descripcion: req.body.descripcion || '',
            cantidad: cantidadNueva,
            precioProducto,
            precioFlete,
            precioTotal,
            metodoPago: req.body.metodoPago || viaje.metodoPago,
        });
        res.redirect(`/ventas/viaje/detalle/${id}`);
    },

    cancelarViajeProgramado: async (req, res) => {
        const id = Number(req.params.id);
        const viaje = await viajeById(id);
        if (!viaje) return res.redirect('/ventas');
        if (viaje.estado !== 'pendiente') return res.status(400).send('Solo se pueden cancelar viajes pendientes.');

        // Restituir stock
        if (viaje.productoId && viaje.cantidad) {
            const prod = await prodsById(viaje.productoId);
            if (prod) {
                await actualizarProducto(viaje.productoId, { stock: prod.stock + viaje.cantidad });
            }
        }
        await cancelarViaje(id);
        res.redirect('/ventas');
    }
};

module.exports = ventasController;
