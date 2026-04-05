const { listProds, prodsById, crearProducto, actualizarProducto, eliminarProducto } = require('../store/dbStock');

const stockController = {
    index: async (req, res) => {
        const productos = await listProds();
        res.render('stock/index', { productos });
    },

    detalle: async (req, res) => {
        const { id } = req.params;
        const producto = await prodsById(id);
        if (!producto) return res.status(404).send('Producto no encontrado');
        res.render('stock/detalle', { producto });
    },

    nuevoStock: (req, res) => {
        res.render('stock/nuevo_stock');
    },

    crearStock: async (req, res) => {
        const { producto, precio, stock } = req.body;
        await crearProducto({ producto, precio, stock });
        res.redirect('/stock');
    },

    editarStock: async (req, res) => {
        const { id } = req.params;
        const producto = await prodsById(id);
        if (!producto) return res.status(404).send('Producto no encontrado');
        res.render('stock/editar', { producto });
    },

    guardarEdicionStock: async (req, res) => {
        const { id } = req.params;
        const { producto, precio, stock } = req.body;
        await actualizarProducto(id, { producto, precio, stock });
        res.redirect('/stock');
    },

    eliminarStock: async (req, res) => {
        const { id } = req.params;
        await eliminarProducto(id);
        res.redirect('/stock');
    },
};

module.exports = stockController;
