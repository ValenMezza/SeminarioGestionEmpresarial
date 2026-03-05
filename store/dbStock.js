const dbStock = {
  productos: [
    { id: 1, producto: "Tierra", precio: 19500, stock: 10 },
    { id: 2, producto: "Arena", precio: 10000, stock: 10 },
    { id: 3, producto: "Piedra", precio: 15000, stock: 10 },
    { id: 4, producto: "Arena Zarandeada", precio: 12000, stock: 0 },
    { id: 5, producto: "Ripio", precio: 14000, stock: 6 },
    { id: 6, producto: "Piedra 6/20", precio: 16000, stock: 8 },
    { id: 7, producto: "Piedra 10/30", precio: 16500, stock: 5 },
    { id: 8, producto: "Material de Relleno", precio: 20000, stock: 1 },
    { id: 9, producto: "Tosca", precio: 18000, stock: 0 },
    { id: 10, producto: "Granito Triturado", precio: 22000, stock: 3 },
    { id: 11, producto: "Polvo de Piedra", precio: 13000, stock: 9 },
    { id: 12, producto: "Canto Rodado", precio: 21000, stock: 2 }
  ],
};


async function listProds() {
  return dbStock.productos;
}

async function prodsById(id) {
  const prodId = Number(id);
  return dbStock.productos.find((p) => p.id === prodId);
}


module.exports = { dbStock, listProds, prodsById };