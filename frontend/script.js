function volverAtras() {
    window.location.href = "index.html";
}




// Lista de productos de ejemplo
//Conexion front con back
async function cargarCategorias() {
    const res = await fetch("http://localhost:3000/categorias");
    const categorias = await res.json();

    const contenedor = document.getElementById("lista-categorias");
    contenedor.innerHTML = "";

    categorias.forEach(cat => {
        const div = document.createElement("div");
        div.classList.add("categoria");
        div.innerHTML = `
            <h3>${cat}</h3>
            <button onclick="irACategoria('${cat}')">Ver</button>
        `;
        contenedor.appendChild(div);
    });
}


function irACategoria(categoria) {
    window.location.href = `productos.html?categoria=${categoria}`;
}

// Carrito
let carrito = [];

// Función para cargar productos (ojo ver)
async function cargarProductos(categoria) {
    document.getElementById("titulo-categoria").innerText = categoria;
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "Cargando...";

    try {
        const res = await fetch(`http://localhost:3000/productos?categoria=${categoria}`);
        const productos = await res.json();

        contenedor.innerHTML = "";

        productos.forEach((p, index) => {
            const div = document.createElement("div");
            div.classList.add("producto");
            div.innerHTML = `
                <h3>${p.nombre}</h3>
                <p>Precio: $${p.precio}</p>
                <div class="cantidad-control">
                    <button onclick="cambiarCantidad(${index}, -1)">–</button>
                    <span id="cant-${index}">1</span>
                    <button onclick="cambiarCantidad(${index}, 1)">+</button>
                </div>
                <button onclick="agregarAlCarrito(${index})">Agregar al carrito</button>
            `;
            contenedor.appendChild(div);
        });

        // guardamos los productos cargados
        window.productosActuales = productos;

    } catch (error) {
        contenedor.innerHTML = "Error cargando productos";
        console.error(error);
    }
}
// Cambiar la Cantidad  (ojo ver)
function cambiarCantidad(index, cambio) {
    const span = document.getElementById(`cant-${index}`);
    let cantidad = parseInt(span.textContent) + cambio;
    if (cantidad < 1) cantidad = 1;
    span.textContent = cantidad;
}



// Agregar al carrito
async function agregarAlCarrito(index) {
    const span = document.getElementById(`cant-${index}`);
    let cantidad = parseInt(span.textContent);
    if (isNaN(cantidad) || cantidad < 1) cantidad = 1;

    const producto = window.productosActuales[index];

    await fetch("http://localhost:3000/carrito", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad
        })
    });

    cargarCarrito();
}
//cargar carrito 
async function cargarCarrito() {
    const res = await fetch("http://localhost:3000/carrito");
    carrito = await res.json();
    actualizarCarrito();
    if (document.getElementById("modal-carrito").style.display === "block") {
        mostrarCarritoModal();
    }
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
async function confirmarPedido() {
    if (carrito.length === 0) {
        alert("No hay productos en el carrito");
        return;
    }

    await fetch("http://localhost:3000/carrito", {
        method: "DELETE"
    });

    alert("Pedido confirmado");
    cargarCarrito();
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
async function eliminarProducto(index) {
    const producto = carrito[index];

    await fetch(`http://localhost:3000/carrito/${producto.nombre}`, {
        method: "DELETE"
    });

    cargarCarrito();
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



// Modificar carrito 

async function modificarCantidadCarrito(index, cambio) {
    const producto = carrito[index];
    const nuevaCantidad = producto.cantidad + cambio;

    await fetch("http://localhost:3000/carrito", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: producto.nombre,
            cantidad: nuevaCantidad
        })
    });

    cargarCarrito();
}





if (window.location.href.includes("index.html")) {
    cargarCategorias();
}

cargarCarrito();
