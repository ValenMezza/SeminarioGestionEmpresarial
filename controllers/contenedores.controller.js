const { listContenedores, contenedorById, actualizarPrecios, crearContenedor, eliminarContenedor } = require("../store/dbContenedor");

const contenedoresController = {
    index: async (req, res) => {
        const contenedores = await listContenedores();
        res.render('contenedores/index', { contenedores });
    },

    detalle: async (req, res) => {
        const id = Number(req.params.id);
        const contenedor = await contenedorById(id);
        if (!contenedor) return res.status(404).send('Contenedor no encontrado');
        res.render('contenedores/detalle', { contenedor });
    },

    config: async (req, res) => {
        const contenedores = await listContenedores();
        res.render('contenedores/config', { contenedores });
    },

    guardarConfig: (req, res) => {
        const { precioPorDia, precioAlquiler } = req.body;
        actualizarPrecios(Number(precioPorDia), Number(precioAlquiler));
        res.redirect('/contenedores/config');
    },

    crear: (req, res) => {
        crearContenedor();
        res.redirect('/contenedores');
    },

    eliminar: (req, res) => {
        const id = Number(req.params.id);
        const resultado = eliminarContenedor(id);
        if (!resultado) {
            return res.redirect('/contenedores');
        }
        res.redirect('/contenedores');
    }
};

module.exports = contenedoresController;
