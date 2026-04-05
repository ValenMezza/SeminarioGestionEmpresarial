const supabase = require('../lib/supabase');

async function listProds() {
    const { data } = await supabase.from('stock').select('*').order('id');
    return data || [];
}

async function prodsById(id) {
    const { data } = await supabase.from('stock').select('*').eq('id', Number(id)).single();
    return data;
}

async function crearProducto({ producto, precio, stock }) {
    const { data } = await supabase.from('stock').insert({
        producto, precio: Number(precio), stock: Number(stock)
    }).select().single();
    return data;
}

async function actualizarProducto(id, { producto, precio, stock }) {
    const update = {};
    if (producto !== undefined) update.producto = producto;
    if (precio   !== undefined) update.precio   = Number(precio);
    if (stock    !== undefined) update.stock    = Number(stock);
    const { data } = await supabase.from('stock').update(update).eq('id', Number(id)).select().single();
    return data;
}

async function eliminarProducto(id) {
    const { data } = await supabase.from('stock').delete().eq('id', Number(id)).select().single();
    return data;
}

module.exports = { listProds, prodsById, crearProducto, actualizarProducto, eliminarProducto };
