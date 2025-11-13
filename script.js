// Lista de productos de ejemplo
const productosPorCategoria = {
    pizzas: [
        { nombre: "Muzza", precio: 1200 },
        { nombre: "Napolitana", precio: 1400 },
        { nombre: "Pepperoni", precio: 1500 }
    ],
    bebidas: [
        { nombre: "Coca-Cola", precio: 400 },
        { nombre: "Agua", precio: 300 }
    ],
    postres: [
        { nombre: "Helado", precio: 500 },
        { nombre: "Brownie", precio: 600 }
    ],
    Hamburguesa: [
    { nombre: "Clasica", precio: 1300 },
    { nombre: "Doble Carne", precio: 1800 }
],
 Hamburlomo: [
    { nombre: "Clasico", precio: 1300 },
    { nombre: "veggie", precio: 1800 }
],
 Lomitos: [
    { nombre: "Lomito Clasico", precio: 1300 },
    { nombre: "Lomito de Pollo", precio: 1800 },
    { nombre: "Lomito de Cerdo", precio: 1800 }
]
};

// Carrito
let carrito = [];

// Función para cargar productos (ojo ver)
function cargarProductos(categoria) {
    document.getElementById("titulo-categoria").innerText = categoria;
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    productosPorCategoria[categoria].forEach((p, index) => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <h3>${p.nombre}</h3>
            <p>Precio: $${p.precio}</p>
            <div class="cantidad-control">
                <button onclick="cambiarCantidad('${categoria}', ${index}, -1)">–</button>
                <span id="cant-${categoria}-${index}">1</span>
                <button onclick="cambiarCantidad('${categoria}', ${index}, 1)">+</button>
            </div>
            <button onclick="agregarAlCarrito('${categoria}', ${index})">Agregar al carrito</button>
        `;
        contenedor.appendChild(div);
    });
}
// Cambiar la Cantidad  (ojo ver)
function cambiarCantidad(categoria, index, cambio) {
    const span = document.getElementById(`cant-${categoria}-${index}`);
    let cantidad = parseInt(span.textContent) + cambio;
    if (cantidad < 1) cantidad = 1; // nunca menos de 1
    span.textContent = cantidad;
}




// Agregar al carrito
function agregarAlCarrito(categoria, index) {
    const span = document.getElementById(`cant-${categoria}-${index}`);
    let cantidad = parseInt(span.textContent);

    // Validar cantidad
    if (isNaN(cantidad) || cantidad < 1) cantidad = 1;

    const producto = productosPorCategoria[categoria][index];

    const existente = carrito.find(p => p.nombre === producto.nombre);
    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    }

    actualizarCarrito();
}
// Mostrar carrito
function actualizarCarrito() {
    const contenedor = document.getElementById("carrito");
    const contador = document.getElementById("contador-carrito");
    const totalCarrito = document.getElementById("total-carrito");

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>No hay productos agregados</p>";
        contador.innerText = 0;
        totalCarrito.innerText = 0;
        return;
    }

    let html = "";
    let total = 0;
    let cantidadTotal = 0;
    carrito.forEach((p, i) => {
        total += p.precio * p.cantidad;
        cantidadTotal += p.cantidad;
        html += `<p>${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}</p>`;
    });

    html += `<p id="total">Total: $${total}</p>`;
    html += `<button onclick="confirmarPedido()">Confirmar pedido</button>`;
    contenedor.innerHTML = html;

    // Actualizamos barra superior
    contador.innerText = cantidadTotal;
    totalCarrito.innerText = total;
}

// Confirmar pedido (por ahora solo alerta)
function confirmarPedido() {
    if (carrito.length === 0) return alert("No hay productos en el carrito");
    alert("Pedido confirmado!\n" + carrito.map(p => `${p.nombre} x${p.cantidad}`).join("\n"));
    carrito = [];
    actualizarCarrito();
}

// --------------------------
// Leer categoría de la URL y cargar productos
function obtenerCategoriaDeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("categoria") || "pizzas"; // por defecto pizzas
}

if (window.location.href.includes("productos.html")) {
    const categoria = obtenerCategoriaDeURL();
    cargarProductos(categoria);
}


function verCarrito() {
    document.getElementById("modal-carrito").style.display = "block";
    mostrarCarritoModal();
}

function cerrarCarrito() {
    document.getElementById("modal-carrito").style.display = "none";
}

// Eliminar producto del carrito
function eliminarProducto(index) {
    carrito.splice(index, 1);
    actualizarCarrito();      // Actualiza contador y total en header
    mostrarCarritoModal();    // Actualiza modal
}

// Actualizar cantidad de un producto
function actualizarCantidad(index, nuevaCantidad) {
    const cantidad = parseInt(nuevaCantidad);
    if (cantidad <= 0) return;
    carrito[index].cantidad = cantidad;
    actualizarCarrito();
    mostrarCarritoModal();
}

















function mostrarCarritoModal() {
    const detalles = document.getElementById("detalles-carrito");
    const totalModal = document.getElementById("total-modal");

    if (carrito.length === 0) {
        detalles.innerHTML = "<p>No hay productos en el carrito</p>";
        totalModal.innerText = "";
        return;
    }

    let html = "";
    let total = 0;

 carrito.forEach((p, i) => {
    total += p.precio * p.cantidad;
    html += `
        <div class="producto-modal">
            <span>${p.nombre}</span>
            <div class="cantidad-control">
                <button onclick="modificarCantidadCarrito(${i}, -1)">–</button>
                <span id="cant-modal-${i}">${p.cantidad}</span>
                <button onclick="modificarCantidadCarrito(${i}, 1)">+</button>
            </div>
            <span>$${p.precio * p.cantidad}</span>
            <button onclick="eliminarProducto(${i})">❌ Quitar</button>
        </div>
    `;
});

    detalles.innerHTML = html;
    totalModal.innerText = `Total: $${total}`;
}

function modificarCantidadCarrito(index, cambio) {
    carrito[index].cantidad += cambio;

    if (carrito[index].cantidad < 1) {
        // Si baja a 0, eliminamos el producto
        carrito.splice(index, 1);
    }

    actualizarCarrito();      // Actualiza contador y total en header
    mostrarCarritoModal();    // Si usas modal, actualiza ahí también
}






