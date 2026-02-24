const dbStock = {
  productos: [
    { id: 1, producto: "Tierra", precio: 19500, stock:10 },
    { id: 2, producto: "Arena", precio: 10000,stock:10 },
    { id: 3, producto: "Piedra", precio: 15000, stock:10 },
    { id: 4, producto: "Arenza zarandeada", precio: 12000, stock:0 },
    { id: 5, producto: "Material Relleno", precio: 20000 , stock: 1}
  ],
};


async function listProds() {
  return dbStock.productos;
}

async function prodsById(id) {
  const prodId = Number(id);
  return dbStock.productos.find((p) => p.id === prodId);
}

// async function stockActivo(){
//     if (dbStock.productos.id >0){
//         retu
//     }
//     else
// }




module.exports = { dbStock, listProds, prodsById};