const { listContenedores, contenedorById, actualizarPrecios, getPreciosConfig, crearContenedor, eliminarContenedor } = require("../store/dbContenedor");
const { alquileresProgramados } = require("../store/dbAlquiler");

const contenedoresController = {
    index: async (req, res) => {
        const [contenedores, programados, precios] = await Promise.all([
            listContenedores(),
            alquileresProgramados(),
            getPreciosConfig(),
        ]);
        const finProximoPorContenedor = {};
        programados.forEach(p => { finProximoPorContenedor[p.contenedorId] = p.finAlquiler; });
        res.render('contenedores/index', { contenedores, finProximoPorContenedor, precios });
    },

    detalle: async (req, res) => {
        const id = Number(req.params.id);
        const contenedor = await contenedorById(id);
        if (!contenedor) return res.status(404).send('Contenedor no encontrado');
        res.render('contenedores/detalle', { contenedor });
    },

    config: async (req, res) => {
        const precios = await getPreciosConfig();
        res.render('contenedores/config', { precios });
    },

    guardarConfig: async (req, res) => {
        const { precioPorDia, precioAlquiler } = req.body;
        await actualizarPrecios(Number(precioPorDia), Number(precioAlquiler));
        res.redirect('/contenedores/config');
    },

    crear: async (req, res) => {
        await crearContenedor();
        res.redirect('/contenedores');
    },

    eliminar: async (req, res) => {
        const id = Number(req.params.id);
        await eliminarContenedor(id);
        res.redirect('/contenedores');
    }
};

module.exports = contenedoresController;
