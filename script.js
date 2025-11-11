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

// Función para cargar productos
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
            <label>Cantidad: <input type="number" min="1" value="1" id="cant-${categoria}-${index}"></label>
            <button onclick="agregarAlCarrito('${categoria}', ${index})">Agregar al carrito</button>
        `;
        contenedor.appendChild(div);
    });
}

// Agregar al carrito
function agregarAlCarrito(categoria, index) {
    const cantidad = parseInt(document.getElementById(`cant-${categoria}-${index}`).value);
    const producto = productosPorCategoria[categoria][index];
    carrito.push({ ...producto, cantidad });
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

function agregarAlCarrito(categoria, index) {
    const cantidad = parseInt(document.getElementById(`cant-${categoria}-${index}`).value);
    const producto = productosPorCategoria[categoria][index];

    // Buscar si ya está en el carrito
    const existente = carrito.find(p => p.nombre === producto.nombre);

    if (existente) {
        // Si ya existe, solo sumamos la cantidad
        existente.cantidad += cantidad;
    } else {
        // Si no existe, lo agregamos
        carrito.push({ ...producto, cantidad });
    }

    actualizarCarrito();
}