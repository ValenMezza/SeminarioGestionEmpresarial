const { listProds } = require("../store/dbStock");

const ventasController={
    index:async (req,res) =>{
        const productos=await listProds();
        
        res.render('ventas/index', {productos})
    }
}

module.exports= ventasController;