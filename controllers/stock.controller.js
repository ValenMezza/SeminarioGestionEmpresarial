const { listProds, prodsById, mostrarProds } = require("../store/dbStock");

const stockController = {
    index: async (req, res) => {
        const productos = await listProds();

        res.render("stock/index", { productos });
    },

    detalle: async (req, res) => {
        const { id } = req.params;
        const producto = await prodsById(id);

        if (!producto) {
            return res.status(404).send("Producto no encontrado");
            // o res.render("404")
        }

        res.render("stock/detalle", { producto });
    },

    nuevoStock: (req, res) => {
        res.render("stock/nuevo_stock");
    },
};

module.exports = stockController;