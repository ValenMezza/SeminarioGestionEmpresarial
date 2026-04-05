const { listContenedores } = require('../store/dbContenedor');
const { listClientes }     = require('../store/dbClientes');
const { listTransacciones } = require('../store/dbTransacciones');
const { listProds }        = require('../store/dbStock');

const homeController = {
    index: async (req, res) => {
        const [contenedores, clientes, transacciones, productos] = await Promise.all([
            listContenedores(),
            listClientes(),
            listTransacciones(),
            listProds(),
        ]);

        const hoy        = new Date();
        const mesActual  = hoy.getMonth();
        const anioActual = hoy.getFullYear();

        const ingresoMensual = transacciones
            .filter(t => {
                const d = new Date(t.fecha);
                return d.getMonth() === mesActual && d.getFullYear() === anioActual;
            })
            .reduce((acc, t) => acc + (t.monto || 0), 0);

        const metricas = {
            alquileresActivos:       contenedores.filter(c => c.estado === 'Alquilado').length,
            contenedoresDisponibles: contenedores.filter(c => c.estado === 'Disponible').length,
            totalClientes:           clientes.length,
            ingresoMensual,
            stockBajo:               productos.filter(p => p.stock > 0 && p.stock <= 3).length,
            sinStock:                productos.filter(p => p.stock === 0).length,
        };

        res.render('home', { metricas });
    }
};

module.exports = homeController;
