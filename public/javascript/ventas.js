document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.addToCart');
    const cart = document.getElementById('cart_items');
    const cartDiv = document.getElementById('cart');

    let carrito = [];

    // Botones de acciones (se crean 1 sola vez)
    const checkoutCart = document.createElement('button');
    checkoutCart.className = 'btn_checkout';
    checkoutCart.textContent = 'Finalizar compra';
    checkoutCart.style.display = 'none';

    const deleteCart = document.createElement('button');
    deleteCart.className = 'btn_clear';
    deleteCart.textContent = 'Eliminar carrito';
    deleteCart.style.display = 'none';

    cartDiv.append(checkoutCart, deleteCart);

    function renderCarrito() {
        cart.innerHTML = '';

        if (carrito.length === 0) {
            cart.innerHTML = `<li class="cart_empty">No hay items</li>`;
            deleteCart.style.display = 'none';
            checkoutCart.style.display = 'none';
            return;
        }

        deleteCart.style.display = 'inline-flex';
        checkoutCart.style.display = 'inline-flex';

        let total = 0;

        carrito.forEach(producto => {
            total += producto.precio * producto.cantidad;

            const li = document.createElement('li');
            li.className = 'cart_item';

            // Estructura prolija
            li.innerHTML = `
        <div class="cart_info">
          <div class="cart_title">${producto.nombre}</div>
          <div class="cart_meta">
            <span>Cant: <b>${producto.cantidad}</b></span>
            <span>Subtotal: <b>$${producto.precio * producto.cantidad}</b></span>
          </div>
        </div>

        <div class="cart_actions">
          <button class="qty_btn deleteBtn" aria-label="Restar">−</button>
          <button class="remove_btn delCartBtn" aria-label="Eliminar item">ELIM</button>
          <button class="qty_btn addBtn" aria-label="Sumar">+</button>
        </div>
      `;

            const delOne = li.querySelector('.deleteBtn');
            const addOne = li.querySelector('.addBtn');
            const eliminarProdBtn = li.querySelector('.delCartBtn');

            delOne.addEventListener('click', () => {
                const prod = carrito.find(p => p.id === producto.id);
                if (!prod) return;

                prod.cantidad -= 1;
                if (prod.cantidad <= 0) carrito = carrito.filter(p => p.id !== producto.id);
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

            cart.appendChild(li);
        });

        // Total al final
        const totalLi = document.createElement('li');
        totalLi.className = 'cart_total';
        totalLi.innerHTML = `<span>Total</span><b>$${total}</b>`;
        cart.appendChild(totalLi);
    }

    // Agregar desde la lista de productos
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;

            const id = Number(btn.dataset.id);
            const nombre = btn.dataset.nombre;
            const precio = Number(btn.dataset.precio);

            const prodExist = carrito.find(p => p.id === id);

            if (prodExist) prodExist.cantidad += 1;
            else carrito.push({ id, nombre, precio, cantidad: 1 });

            renderCarrito();
        });
    });

    // Vaciar carrito
    deleteCart.addEventListener('click', () => {
        carrito = [];
        renderCarrito();
    });

    // (Opcional) Finalizar compra
    checkoutCart.addEventListener('click', () => {
        // acá después lo conectás con backend / pago / persistencia
        alert('Compra finalizada (demo)');
        carrito = [];
        renderCarrito();
    });

    renderCarrito();
});