const transaccionesController ={
    index:(req, res)=>{
        res.render ('transacciones/index')
    },
    detalle :(req,res)=>{
        res.render ('transacciones/detalle')
    }
}

module.exports =transaccionesController;