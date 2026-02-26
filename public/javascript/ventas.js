document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.addToCart');
    const cart = document.getElementById('cart_items');
    const cartDiv = document.getElementById('cart');

    let carrito = [];

    const deleteCart = document.createElement('button');
    deleteCart.textContent = "Eliminar carrito";
    deleteCart.style.display = "none"; // arranca oculto
    const checkoutCart = document.createElement('button');
    checkoutCart.textContent = 'Finalizar compra';
    checkoutCart.style.display = 'none'
    cartDiv.append(checkoutCart)
    cartDiv.append(deleteCart);

    function renderCarrito() {
        cart.innerHTML = "";

        if (carrito.length === 0) {
            cart.innerHTML = "<li>No hay items</li>";
            deleteCart.style.display = "none";
            checkoutCart.style.display = 'none'

            return;
        }

        deleteCart.style.display = "inline-block";
        checkoutCart.style.display = 'inline-block'

        carrito.forEach(producto => {
            const li = document.createElement('li');

            li.innerHTML = `
        ${producto.nombre} 
        | x${producto.cantidad} 
        |Subtotal: $${producto.precio * producto.cantidad}
        `;
            const divBtns = document.createElement('div');
            divBtns.className = 'divBtns'
            const delOne = document.createElement('button');
            delOne.className = "deleteBtn";
            delOne.textContent = "-";

            const addOne = document.createElement('button');
            addOne.className = "addBtn";
            addOne.textContent = "+";

            const eliminarProdBtn = document.createElement('button');
            eliminarProdBtn.className = "delCartBtn"
            eliminarProdBtn.textContent = "ELIMINAR";

            delOne.addEventListener('click', () => {
                const prod = carrito.find(p => p.id === producto.id);
                if (!prod) return;

                prod.cantidad -= 1;

                if (prod.cantidad <= 0) {
                    carrito = carrito.filter(p => p.id !== producto.id);
                }

                renderCarrito();
            });

            addOne.addEventListener('click', () => {
                const prod = carrito.find(p => p.id === producto.id);
                if (!prod) return;

                prod.cantidad += 1;
                renderCarrito();
            });

            eliminarProdBtn.addEventListener('click', () => {
                carrito = carrito.filter(p => p.id !== producto.id);
                renderCarrito();
            });


            divBtns.append(delOne, eliminarProdBtn, addOne);;
            li.append(divBtns)
            cart.appendChild(li);

        });
    }

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

    deleteCart.addEventListener('click', () => {
        carrito = [];
        renderCarrito();
    });

    renderCarrito();
}); 