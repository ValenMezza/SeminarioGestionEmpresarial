document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.addToCart');
    const cart = document.getElementById('cart_items');
    const cartDiv = document.getElementById('cart');

    let carrito = [];

    // Botón eliminar carrito (lo creas 1 vez)
    const deleteCart = document.createElement('button');
    deleteCart.textContent = "Eliminar carrito";
    deleteCart.style.display = "none"; // arranca oculto
    cartDiv.append(deleteCart);

    function renderCarrito() {
        cart.innerHTML = "";

        if (carrito.length === 0) {
            cart.innerHTML = "<li>No hay items</li>";
            deleteCart.style.display = "none";
            return;
        }

        deleteCart.style.display = "inline-block";

        carrito.forEach(producto => {
            const li = document.createElement('li');

            li.innerHTML = `
        Producto: ${producto.nombre} 
        | Cantidad: ${producto.cantidad} 
        | Subtotal: $${producto.precio * producto.cantidad}
        `;

            const delOne = document.createElement('button');
            delOne.className = "deleteBtn";
            delOne.textContent = "-";

            const addOne = document.createElement('button');
            addOne.className = "addBtn";
            addOne.textContent = "+";

            const eliminarProdBtn = document.createElement('button');
            eliminarProdBtn.textContent = "ELIMINAR";

            // ✅ -1 cantidad
            delOne.addEventListener('click', () => {
                const prod = carrito.find(p => p.id === producto.id);
                if (!prod) return;

                prod.cantidad -= 1;

                if (prod.cantidad <= 0) {
                    carrito = carrito.filter(p => p.id !== producto.id);
                }

                renderCarrito();
            });

            // ✅ +1 cantidad
            addOne.addEventListener('click', () => {
                const prod = carrito.find(p => p.id === producto.id);
                if (!prod) return;

                prod.cantidad += 1;
                renderCarrito();
            });

            // ✅ eliminar producto completo
            eliminarProdBtn.addEventListener('click', () => {
                carrito = carrito.filter(p => p.id !== producto.id);
                renderCarrito();
            });

            li.append(delOne);
            li.append(eliminarProdBtn);
            li.append(addOne);
            cart.append(li);
        });
    }

    // ✅ agregar desde la lista de productos
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const nombre = btn.dataset.nombre;
            const precio = Number(btn.dataset.precio);

            const prodExist = carrito.find(p => p.id === id);

            if (prodExist) {
                prodExist.cantidad += 1;
            } else {
                carrito.push({ id, nombre, precio, cantidad: 1 });
            }

            renderCarrito();
        });
    });

    // ✅ vaciar carrito
    deleteCart.addEventListener('click', () => {
        carrito = [];
        renderCarrito();
    });

    renderCarrito();
});s