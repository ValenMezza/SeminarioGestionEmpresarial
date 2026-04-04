document.addEventListener('DOMContentLoaded', () => {
    const buttons  = document.querySelectorAll('.addToCart');
    const cartList = document.getElementById('cart_items');
    const cartDiv  = document.getElementById('cart');

    let carrito = [];

    // ── Botones de acción ──────────────────────────────────────
    const btnCantera = document.createElement('button');
    btnCantera.className = 'btn-cantera';
    btnCantera.textContent = 'Finalizar venta — Cantera';
    btnCantera.style.display = 'none';

    const btnViaje = document.createElement('button');
    btnViaje.className = 'btn-viaje';
    btnViaje.textContent = 'Finalizar venta — Viaje';
    btnViaje.style.display = 'none';

    const btnLimpiar = document.createElement('button');
    btnLimpiar.className = 'btn-limpiar';
    btnLimpiar.textContent = 'Limpiar carrito';
    btnLimpiar.style.display = 'none';

    cartDiv.append(btnCantera, btnViaje, btnLimpiar);

    // ── Render carrito ─────────────────────────────────────────
    function renderCarrito() {
        cartList.innerHTML = '';

        if (carrito.length === 0) {
            cartList.innerHTML = `<li class="cart_empty">No hay items</li>`;
            [btnCantera, btnViaje, btnLimpiar].forEach(b => b.style.display = 'none');
            return;
        }

        [btnCantera, btnViaje, btnLimpiar].forEach(b => b.style.display = 'block');

        let total = 0;

        carrito.forEach(producto => {
            total += producto.precio * producto.cantidad;

            const li = document.createElement('li');
            li.className = 'cart_item';
            li.innerHTML = `
                <div class="cart_info">
                    <div class="cart_title">${producto.nombre}</div>
                    <div class="cart_meta">
                        <span>Cant: <b>${producto.cantidad}</b></span>
                        <span>Subtotal: <b>$${(producto.precio * producto.cantidad).toLocaleString('es-AR')}</b></span>
                    </div>
                </div>
                <div class="cart_actions">
                    <button class="qty_btn deleteBtn" aria-label="Restar">−</button>
                    <button class="remove_btn delCartBtn" aria-label="Eliminar">ELIM</button>
                    <button class="qty_btn addBtn" aria-label="Sumar">+</button>
                </div>
            `;

            li.querySelector('.deleteBtn').addEventListener('click', () => {
                const p = carrito.find(x => x.id === producto.id);
                if (!p) return;
                p.cantidad -= 1;
                if (p.cantidad <= 0) carrito = carrito.filter(x => x.id !== producto.id);
                renderCarrito();
            });
            li.querySelector('.addBtn').addEventListener('click', () => {
                const p = carrito.find(x => x.id === producto.id);
                if (p) { p.cantidad += 1; renderCarrito(); }
            });
            li.querySelector('.delCartBtn').addEventListener('click', () => {
                carrito = carrito.filter(x => x.id !== producto.id);
                renderCarrito();
            });

            cartDiv.insertBefore(li, cartDiv.querySelector('.btn-cantera'));
        });

        const totalLi = document.createElement('li');
        totalLi.className = 'cart_total';
        totalLi.innerHTML = `<span>Total</span><b>$${total.toLocaleString('es-AR')}</b>`;
        cartDiv.insertBefore(totalLi, cartDiv.querySelector('.btn-cantera'));
    }

    // ── Agregar al carrito ─────────────────────────────────────
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            const id     = Number(btn.dataset.id);
            const nombre = btn.dataset.nombre;
            const precio = Number(btn.dataset.precio);
            const exist  = carrito.find(p => p.id === id);
            if (exist) exist.cantidad += 1;
            else carrito.push({ id, nombre, precio, cantidad: 1 });
            renderCarrito();
        });
    });

    // ── Limpiar carrito ────────────────────────────────────────
    btnLimpiar.addEventListener('click', () => {
        if (!confirm('¿Limpiar el carrito?')) return;
        carrito = [];
        renderCarrito();
    });

    // ── Helpers de modal ───────────────────────────────────────
    function abrirModal(id) {
        document.getElementById(id).style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    function cerrarModal(id) {
        document.getElementById(id).style.display = 'none';
        document.body.style.overflow = '';
    }

    function buildResumen(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        const total = carrito.reduce((a, p) => a + p.precio * p.cantidad, 0);
        el.innerHTML = carrito.map(p =>
            `<div class="resumen-row"><span>${p.nombre} × ${p.cantidad}</span><b>$${(p.precio * p.cantidad).toLocaleString('es-AR')}</b></div>`
        ).join('') + `<div class="resumen-total"><span>Total</span><b>$${total.toLocaleString('es-AR')}</b></div>`;
    }

    function tieneUnSoloProducto() {
        return new Set(carrito.map(p => p.id)).size <= 1;
    }

    // ── Modal Cantera ──────────────────────────────────────────
    btnCantera.addEventListener('click', () => {
        buildResumen('resumenCantera');
        document.getElementById('itemsCantera').value = JSON.stringify(carrito);
        abrirModal('modal-cantera');
    });

    document.getElementById('cerrarModalCantera')?.addEventListener('click', () => cerrarModal('modal-cantera'));
    document.getElementById('cancelarModalCantera')?.addEventListener('click', () => cerrarModal('modal-cantera'));

    // Toggle cliente existente / particular
    document.querySelectorAll('input[name="tipoCliente"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const esParticular = document.getElementById('tipoParticular').checked;
            document.getElementById('grupoClienteExistente').style.display = esParticular ? 'none' : 'block';
            document.getElementById('grupoParticular').style.display        = esParticular ? 'block' : 'none';
        });
    });

    // ── Modal Viaje ────────────────────────────────────────────
    btnViaje.addEventListener('click', () => {
        if (!tieneUnSoloProducto()) {
            document.getElementById('alertaMultiProducto').style.display = 'block';
            document.getElementById('formViaje').style.display           = 'none';
            document.getElementById('btnConfirmarViaje').style.display   = 'none';
        } else {
            document.getElementById('alertaMultiProducto').style.display = 'none';
            document.getElementById('formViaje').style.display           = 'grid';
            document.getElementById('btnConfirmarViaje').style.display   = 'block';
        }
        buildResumen('resumenViaje');
        document.getElementById('itemsViaje').value = JSON.stringify(carrito);
        abrirModal('modal-viaje');
    });

    document.getElementById('cerrarModalViaje')?.addEventListener('click', () => cerrarModal('modal-viaje'));
    document.getElementById('cancelarModalViaje')?.addEventListener('click', () => cerrarModal('modal-viaje'));

    renderCarrito();
});
