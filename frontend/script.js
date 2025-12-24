function volverAtras() {
  window.location.href = "index.html";
}

/* =========================
   CARRITO (estado global)
========================= */

let carrito = {
  items: [],
  metodoPago: "Efectivo"
};

function actualizarMetodoPago() {
  const seleccionado = document.querySelector('input[name="pago-modal"]:checked');
  if (seleccionado) {
    carrito.metodoPago = seleccionado.value;
  }
}

/* =========================
   CATEGORÍAS
========================= */

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

/* =========================
   PRODUCTOS
========================= */

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

    window.productosActuales = productos;

  } catch (err) {
    contenedor.innerHTML = "Error cargando productos";
    console.error(err);
  }
}

function cambiarCantidad(index, cambio) {
  const span = document.getElementById(`cant-${index}`);
  let cantidad = parseInt(span.textContent) + cambio;
  if (cantidad < 1) cantidad = 1;
  span.textContent = cantidad;
}

/* =========================
   BACKEND / CARRITO
========================= */

async function agregarAlCarrito(index) {
  const span = document.getElementById(`cant-${index}`);
  const cantidad = parseInt(span.textContent) || 1;
  const producto = window.productosActuales[index];

  await fetch("http://localhost:3000/carrito", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad
    })
  });

  cargarCarrito();
}

async function cargarCarrito() {
  const res = await fetch("http://localhost:3000/carrito");
  carrito.items = await res.json();

  actualizarHeaderCarrito();
  actualizarCarrito();

  const modal = document.getElementById("modal-carrito");
  if (modal && modal.style.display === "block") {
    mostrarCarritoModal();
  }
}

/* =========================
   UI CARRITO
========================= */

function actualizarCarrito() {
  const contenedor = document.getElementById("carrito");
  if (!contenedor) return;

  if (carrito.items.length === 0) {
    contenedor.innerHTML = "<p>No hay productos agregados</p>";
    return;
  }

  let total = 0;
  let html = "";

  carrito.items.forEach(p => {
    total += p.precio * p.cantidad;
    html += `<p>${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}</p>`;
  });

  html += `<p>Total: $${total}</p>`;
  contenedor.innerHTML = html;
}
function actualizarHeaderCarrito() {
  const contador = document.getElementById("contador-carrito");
  const totalCarrito = document.getElementById("total-carrito");

  if (!contador || !totalCarrito) return;

  let total = 0;
  let cantidadTotal = 0;

  carrito.items.forEach(p => {
    total += p.precio * p.cantidad;
    cantidadTotal += p.cantidad;
  });

  contador.innerText = cantidadTotal;
  totalCarrito.innerText = total;
}
/* =========================
   MODAL
========================= */

function verCarrito() {
  document.getElementById("modal-carrito").style.display = "block";
  mostrarCarritoModal();
}

function cerrarCarrito() {
  document.getElementById("modal-carrito").style.display = "none";
}

function mostrarCarritoModal() {
  const detalles = document.getElementById("detalles-carrito");
  const totalModal = document.getElementById("total-modal");

  if (carrito.items.length === 0) {
    detalles.innerHTML = "<p>No hay productos en el carrito</p>";
    totalModal.innerText = "";
    return;
  }

  let total = 0;
  let html = "";

  carrito.items.forEach((p, i) => {
    total += p.precio * p.cantidad;
    html += `
      <div class="producto-modal">
        <span>${p.nombre}</span>
        <div class="cantidad-control">
          <button onclick="modificarCantidadCarrito(${i}, -1)">–</button>
          <span>${p.cantidad}</span>
          <button onclick="modificarCantidadCarrito(${i}, 1)">+</button>
        </div>
        <span>$${p.precio * p.cantidad}</span>
        <button onclick="eliminarProducto(${i})">❌</button>
      </div>
    `;
  });

  detalles.innerHTML = html;
  totalModal.innerText = `Total: $${total}`;

///Agregado ver mas tarde -------------> para ver metodo de pago en modal 
  const radios = document.querySelectorAll('input[name="pago-modal"]');
radios.forEach(radio => {
  radio.checked = radio.value === carrito.metodoPago;
});
}
document.addEventListener("change", (e) => {
  if (e.target.name === "pago-modal") {
    carrito.metodoPago = e.target.value;
  }
});
/* =========================
   MODIFICACIONES
========================= */

async function eliminarProducto(index) {
  const producto = carrito.items[index];

  await fetch(`http://localhost:3000/carrito/${producto.nombre}`, {
    method: "DELETE"
  });

  cargarCarrito();
}

async function modificarCantidadCarrito(index, cambio) {
  const producto = carrito.items[index];
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

/* =========================
   CONFIRMAR + WHATSAPP
========================= */

function generarResumen(carrito) {
  let total = 0;
  let texto = "Pedido:\n";

  carrito.items.forEach(p => {
    const subtotal = p.precio * p.cantidad;
    total += subtotal;
    texto += `- ${p.nombre} x${p.cantidad} ($${subtotal})\n`;
  });

  texto += `\nPago: ${carrito.metodoPago}`;
  texto += `\nTotal: $${total}`;

  return texto;
}

async function confirmarPedido() {
  if (carrito.items.length === 0) {
    alert("No hay productos en el carrito");
    return;
  }

  actualizarMetodoPago();

  const resumen = generarResumen(carrito);
  const telefono = "5493515447794";
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(resumen)}`;

 try {
    // 3. Vaciamos el tanque en el Backend (SQL) para que no queden pedidos viejos
    await fetch("http://localhost:3000/carrito", { method: "DELETE" });

    // 4. Abrimos WhatsApp en una pestaña nueva
    window.open(url, "_blank");

    // 5. Limpiamos la memoria local y refrescamos la vista
    carrito.items = [];
    actualizarHeaderCarrito(); // Pone el contador en 0 y el total en $0
    cerrarCarrito();           // Cierra el modal automáticamente
    
    alert("¡Pedido enviado con éxito!");

  } catch (error) {
    console.error("Error al procesar el pedido:", error);
    alert("Hubo un problema al conectar con el servidor.");
  }
}


/* =========================
   INIT
========================= */

function obtenerCategoriaDeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("categoria");
}

if (window.location.href.includes("productos.html")) {
  cargarProductos(obtenerCategoriaDeURL());
}

if (window.location.href.includes("index.html")) {
  cargarCategorias();
}

cargarCarrito();