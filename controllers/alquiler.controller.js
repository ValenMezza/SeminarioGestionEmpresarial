const { listContenedores, contenedorById, listContenedoresDisponibles, actualizarContenedor, listContenedoresPorFinalizar, finalizarAlquiler } = require("../store/dbContenedor");
const { listClientes, nombreCompleto, agregarMovimiento } = require("../store/dbClientes");
const { crearTransaccion } = require("../store/dbTransacciones");
const { crearAlquiler, alquileresProgramados, alquileresProgramadosPorContenedor, activarAlquiler, alquilerById, finalizarAlquilerRecord } = require("../store/dbAlquiler");

const alquilerController = {
    index: async (req, res) => {
        const contenedores = await listContenedores();
        const programados  = alquileresProgramados();

        // Excluir de "próximos a finalizar" los contenedores que ya tienen un alquiler programado
        const contenedoresConProgramado = new Set(programados.map(p => p.contenedorId));
        const porFinalizar = listContenedoresPorFinalizar().filter(c => !contenedoresConProgramado.has(c.id));

        res.render('alquileres/index', { contenedores, porFinalizar, programados });
    },

    detalle: async (req, res) => {
        const id = Number(req.params.id);
        const contenedor = await contenedorById(id);
        if (!contenedor) {
            return res.status(400).send("Contenedor no encontrado");
        }
        res.render('alquileres/detalle', { contenedor });
    },

    nuevoAlquiler: async (req, res) => {
        const contenedorlibre = await listContenedoresDisponibles();
        const contenedoresPorFinalizar = listContenedoresPorFinalizar();
        const clientes = listClientes();
        let renovarDatos = null;
        if (req.query.renovar) {
            const cont = await contenedorById(Number(req.query.renovar));
            if (cont) {
                const dir = cont.direccionAlquiler || '';
                const lastSpace = dir.lastIndexOf(' ');
                renovarDatos = {
                    id: cont.id,
                    clienteId: cont.clienteId || null,
                    cliente: cont.cliente,
                    calle: lastSpace > 0 ? dir.substring(0, lastSpace) : dir,
                    numero: lastSpace > 0 ? dir.substring(lastSpace + 1) : '',
                    finAlquilerActual: cont.finAlquiler,
                    precio: cont.precioAlquiler,
                };
            }
        }
        res.render('alquileres/nuevo_alquiler', { contenedorlibre, contenedoresPorFinalizar, clientes, renovarDatos });
    },

    crearAlquiler: async (req, res) => {
        const contenedorId = Number(req.body.contenedor);
        const cont = await contenedorById(contenedorId);
        if (!cont) return res.redirect('/alquileres');

        const clienteId    = req.body.clienteId ? Number(req.body.clienteId) : null;
        const clienteNombre = req.body.clienteNombre || req.body.nombreNuevoCliente || 'Sin nombre';
        const direccion     = `${req.body.calle} ${req.body.numero}`.trim();
        const precioAlquiler = req.body.precioAlquiler ? Number(req.body.precioAlquiler) : cont.precioAlquiler;
        const metodoPago    = req.body.metodoPago || 'efectivo';

        // Si el contenedor esta alquilado (por finalizar), crear alquiler programado
        if (cont.estado === 'Alquilado') {
            const alquiler = crearAlquiler({
                contenedorId,
                clienteId,
                clienteNombre,
                inicioAlquiler: req.body.fechaInicio,
                finAlquiler: req.body.fechaFin,
                direccionAlquiler: direccion,
                precioAlquiler,
                metodoPago,
                estado: 'programado'
            });
            return res.redirect(`/alquileres/confirmacion/${alquiler.id}`);
        }

        // Contenedor disponible: crear alquiler activo + actualizar contenedor
        const alquiler = crearAlquiler({
            contenedorId,
            clienteId,
            clienteNombre,
            inicioAlquiler: req.body.fechaInicio,
            finAlquiler: req.body.fechaFin,
            direccionAlquiler: direccion,
            precioAlquiler,
            metodoPago,
            estado: 'activo'
        });

        actualizarContenedor(contenedorId, {
            estado: 'Alquilado',
            clienteId,
            cliente: clienteNombre,
            inicioAlquiler: req.body.fechaInicio,
            finAlquiler: req.body.fechaFin,
            direccionAlquiler: direccion,
            precioAlquiler,
            metodoPago,
        });

        res.redirect(`/alquileres/confirmacion/${alquiler.id}`);
    },

    confirmacion: (req, res) => {
        const id = Number(req.params.id);
        const alquiler = alquilerById(id);
        if (!alquiler) return res.redirect('/alquileres');
        res.render('alquileres/confirmacion', { alquiler });
    },

    edicionAlquiler: async (req, res) => {
        const id = Number(req.params.id);
        const contenedor = await contenedorById(id);
        const dir = contenedor.direccionAlquiler || '';
        const lastSpace = dir.lastIndexOf(' ');
        const calle = lastSpace > 0 ? dir.substring(0, lastSpace) : dir;
        const numero = lastSpace > 0 ? dir.substring(lastSpace + 1) : '';
        return res.render('alquileres/editar', { contenedor, calle, numero });
    },

    guardarEdicion: async (req, res) => {
        const id = Number(req.params.id);
        actualizarContenedor(id, {
            cliente: req.body.cliente,
            inicioAlquiler: req.body.fechaInicio,
            finAlquiler: req.body.fechaFin,
            direccionAlquiler: `${req.body.calle} ${req.body.numero}`,
        });
        res.redirect(`/alquileres/detalle/${id}`);
    },

    cancelarAlquiler: (req, res) => {
        const id = Number(req.params.id);
        finalizarAlquiler(id);
        res.redirect('/alquileres');
    },

    finalizarAlquiler: async (req, res) => {
        const id = Number(req.params.id);
        const contenedor = await contenedorById(id);
        if (contenedor) {
            crearTransaccion({
                tipo: 'Alquiler',
                clienteId: contenedor.clienteId || null,
                cliente: contenedor.cliente,
                monto: contenedor.precioAlquiler,
                descripcion: `Contenedor #${contenedor.id} — ${contenedor.direccionAlquiler} (${contenedor.inicioAlquiler} → ${contenedor.finAlquiler})`,
                metodoPago: contenedor.metodoPago || 'efectivo'
            });
            if (contenedor.metodoPago === 'cuenta_corriente' && contenedor.clienteId) {
                agregarMovimiento(contenedor.clienteId, {
                    tipo: 'deuda',
                    descripcion: `Alquiler Contenedor #${contenedor.id} — ${contenedor.direccionAlquiler}`,
                    monto: -contenedor.precioAlquiler
                });
            }
        }
        finalizarAlquiler(id);

        // Verificar si hay alquiler programado para este contenedor y activarlo
        const programado = alquileresProgramadosPorContenedor(id);
        if (programado) {
            activarAlquiler(programado.id);
            actualizarContenedor(id, {
                estado: 'Alquilado',
                clienteId: programado.clienteId,
                cliente: programado.clienteNombre,
                inicioAlquiler: programado.inicioAlquiler,
                finAlquiler: programado.finAlquiler,
                direccionAlquiler: programado.direccionAlquiler,
                precioAlquiler: programado.precioAlquiler,
            });
        }

        res.redirect('/alquileres');
    }
};

module.exports = alquilerController;
