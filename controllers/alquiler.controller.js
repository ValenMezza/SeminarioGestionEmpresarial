const { listContenedores, contenedorById, listContenedoresDisponibles, actualizarContenedor, listContenedoresPorFinalizar, finalizarAlquiler: resetContenedor } = require("../store/dbContenedor");
const { listClientes, clienteById: clientePorId, nombreCompleto, agregarMovimiento } = require("../store/dbClientes");
const { crearTransaccion } = require("../store/dbTransacciones");
const { crearAlquiler: insertarAlquiler, alquileresProgramados, alquileresProgramadosPorContenedor, alquilerActivoPorContenedor, activarAlquiler, alquilerById, finalizarAlquilerRecord } = require("../store/dbAlquiler");

// Tarifa alquiler: 9 dias = 250000; menos dias = 30000/dia
function calcularPrecioAlquiler(dias) {
    if (!dias || dias <= 0) return 0;
    if (dias >= 9) return 250000;
    return dias * 30000;
}

function diasEntre(inicio, fin) {
    const a = new Date(inicio + 'T00:00:00');
    const b = new Date(fin + 'T00:00:00');
    return Math.round((b - a) / 86400000);
}

const alquilerController = {
    index: async (req, res) => {
        try {
            const [contenedores, programados, porFinalizarRaw] = await Promise.all([
                listContenedores(),
                alquileresProgramados(),
                listContenedoresPorFinalizar(),
            ]);
            const contenedoresConProgramado = new Set(programados.map(p => p.contenedorId));
            const porFinalizar = porFinalizarRaw.filter(c => !contenedoresConProgramado.has(c.id));
            const finProximoPorContenedor = {};
            programados.forEach(p => { finProximoPorContenedor[p.contenedorId] = p.finAlquiler; });
            res.render('alquileres/index', { contenedores, porFinalizar, programados, finProximoPorContenedor });
        } catch (err) {
            console.error('[alquileres/index]', err);
            res.status(500).send('Error al cargar alquileres: ' + err.message);
        }
    },

    detalle: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const contenedor = await contenedorById(id);
            if (!contenedor) return res.status(400).send("Contenedor no encontrado");
            res.render('alquileres/detalle', { contenedor });
        } catch (err) {
            console.error('[alquileres/detalle]', err);
            res.status(500).send('Error: ' + err.message);
        }
    },

    nuevoAlquiler: async (req, res) => {
        try {
            const [contenedorlibre, porFinalizarRaw, clientes, programados] = await Promise.all([
                listContenedoresDisponibles(),
                listContenedoresPorFinalizar(),
                listClientes(),
                alquileresProgramados(),
            ]);
            const conProgramado = new Set(programados.map(p => p.contenedorId));
            const contenedoresPorFinalizar = porFinalizarRaw.filter(c => !conProgramado.has(c.id));
            let renovarDatos = null;
            if (req.query.renovar) {
                const cont = await contenedorById(Number(req.query.renovar));
                if (cont) {
                    // No permitir renovar si ya tiene un alquiler programado
                    const yaProgr = await alquileresProgramadosPorContenedor(cont.id);
                    if (!yaProgr) {
                        const dir = cont.direccionAlquiler || '';
                        const lastSpace = dir.lastIndexOf(' ');
                        let cuentaCorriente = false;
                        if (cont.clienteId) {
                            const cli = await clientePorId(cont.clienteId);
                            if (cli) cuentaCorriente = !!cli.cuentaCorriente;
                        }
                        renovarDatos = {
                            id: cont.id,
                            clienteId: cont.clienteId || null,
                            cliente: cont.cliente,
                            cuentaCorriente,
                            calle: lastSpace > 0 ? dir.substring(0, lastSpace) : dir,
                            numero: lastSpace > 0 ? dir.substring(lastSpace + 1) : '',
                            finAlquilerActual: cont.finAlquiler,
                            precio: cont.precioAlquiler,
                        };
                    }
                }
            }
            res.render('alquileres/nuevo_alquiler', { contenedorlibre, contenedoresPorFinalizar, clientes, renovarDatos });
        } catch (err) {
            console.error('[alquileres/nuevoAlquiler]', err);
            res.status(500).send('Error: ' + err.message);
        }
    },

    crearAlquiler: async (req, res) => {
        try {
            const contenedorId = Number(req.body.contenedor);
            const cont = await contenedorById(contenedorId);
            if (!cont) return res.redirect('/alquileres');

            // Validacion de periodo: minimo 4 dias, maximo 9 dias
            const dias = diasEntre(req.body.fechaInicio, req.body.fechaFin);
            if (!Number.isFinite(dias) || dias < 4 || dias > 9) {
                return res.status(400).send('El alquiler debe durar entre 4 y 9 dias.');
            }

            const clienteId     = req.body.clienteId ? Number(req.body.clienteId) : null;
            const clienteNombre = req.body.clienteNombre || req.body.nombreNuevoCliente || 'Sin nombre';
            const direccion     = `${req.body.calle} ${req.body.numero}`.trim();
            const precioAlquiler = calcularPrecioAlquiler(dias);
            const metodoPago    = req.body.metodoPago || 'efectivo';

            if (cont.estado === 'Alquilado') {
                // Verificar que no exista ya un alquiler programado para este contenedor
                const yaProgr = await alquileresProgramadosPorContenedor(contenedorId);
                if (yaProgr) {
                    return res.status(400).send('Este contenedor ya tiene un alquiler próximo programado. No se puede reservar otro.');
                }
                const alquiler = await insertarAlquiler({
                    contenedorId, clienteId, clienteNombre,
                    inicioAlquiler: req.body.fechaInicio, finAlquiler: req.body.fechaFin,
                    direccionAlquiler: direccion, precioAlquiler, metodoPago, estado: 'programado'
                });
                return res.redirect(`/alquileres/confirmacion/${alquiler.id}`);
            }

            const alquiler = await insertarAlquiler({
                contenedorId, clienteId, clienteNombre,
                inicioAlquiler: req.body.fechaInicio, finAlquiler: req.body.fechaFin,
                direccionAlquiler: direccion, precioAlquiler, metodoPago, estado: 'activo'
            });

            await actualizarContenedor(contenedorId, {
                estado: 'Alquilado', clienteId, cliente: clienteNombre,
                inicioAlquiler: req.body.fechaInicio, finAlquiler: req.body.fechaFin,
                direccionAlquiler: direccion, precioAlquiler,
            });

            res.redirect(`/alquileres/confirmacion/${alquiler.id}`);
        } catch (err) {
            console.error('[alquileres/crearAlquiler]', err);
            res.status(500).send('Error al crear alquiler: ' + err.message);
        }
    },

    confirmacion: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const alquiler = await alquilerById(id);
            if (!alquiler) return res.redirect('/alquileres');
            res.render('alquileres/confirmacion', { alquiler });
        } catch (err) {
            console.error('[alquileres/confirmacion]', err);
            res.status(500).send('Error: ' + err.message);
        }
    },

    edicionAlquiler: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const contenedor = await contenedorById(id);
            if (!contenedor) return res.redirect('/alquileres');
            const dir = contenedor.direccionAlquiler || '';
            const lastSpace = dir.lastIndexOf(' ');
            const calle  = lastSpace > 0 ? dir.substring(0, lastSpace) : dir;
            const numero = lastSpace > 0 ? dir.substring(lastSpace + 1) : '';
            return res.render('alquileres/editar', { contenedor, calle, numero });
        } catch (err) {
            console.error('[alquileres/edicionAlquiler]', err);
            res.status(500).send('Error: ' + err.message);
        }
    },

    guardarEdicion: async (req, res) => {
        try {
            const id = Number(req.params.id);
            await actualizarContenedor(id, {
                cliente: req.body.cliente,
                inicioAlquiler: req.body.fechaInicio,
                finAlquiler: req.body.fechaFin,
                direccionAlquiler: `${req.body.calle} ${req.body.numero}`,
            });
            res.redirect(`/alquileres/detalle/${id}`);
        } catch (err) {
            console.error('[alquileres/guardarEdicion]', err);
            res.status(500).send('Error: ' + err.message);
        }
    },

    cancelarAlquiler: async (req, res) => {
        try {
            const id = Number(req.params.id);
            await resetContenedor(id);
            res.redirect('/alquileres');
        } catch (err) {
            console.error('[alquileres/cancelarAlquiler]', err);
            res.status(500).send('Error: ' + err.message);
        }
    },

    finalizarAlquiler: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const contenedor = await contenedorById(id);
            if (!contenedor) return res.redirect('/alquileres');

            const alquilerActivo = await alquilerActivoPorContenedor(id);
            const metodoPago = alquilerActivo?.metodoPago || 'efectivo';

            await crearTransaccion({
                tipo: 'Alquiler',
                clienteId: contenedor.clienteId || null,
                cliente: contenedor.cliente,
                monto: contenedor.precioAlquiler,
                descripcion: `Contenedor #${contenedor.id} — ${contenedor.direccionAlquiler} (${contenedor.inicioAlquiler} → ${contenedor.finAlquiler})`,
                metodoPago
            });

            if (metodoPago === 'cuenta_corriente' && contenedor.clienteId) {
                await agregarMovimiento(contenedor.clienteId, {
                    tipo: 'deuda',
                    descripcion: `Alquiler Contenedor #${contenedor.id} — ${contenedor.direccionAlquiler}`,
                    monto: -contenedor.precioAlquiler
                });
            }

            if (alquilerActivo) {
                await finalizarAlquilerRecord(alquilerActivo.id);
            }

            await resetContenedor(id);

            const programado = await alquileresProgramadosPorContenedor(id);
            if (programado) {
                await activarAlquiler(programado.id);
                await actualizarContenedor(id, {
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
        } catch (err) {
            console.error('[alquileres/finalizarAlquiler]', err);
            res.status(500).send('Error al finalizar alquiler: ' + err.message);
        }
    }
};

module.exports = alquilerController;
