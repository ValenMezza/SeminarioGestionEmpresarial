const clienteController = {
    index: (req, res)=>{
        res.render('clientes/index')
    },
    detalle: (req, res)=>{
        res.render ('clientes/detalle')
    },
    cuentas: (req, res)=>{
        res.render ('clientes/cuentas');
    }, 
    nuevo: (req, res)=>{
        res.render('clientes/nuevo_cliente')
    }
}

module.exports = clienteController;