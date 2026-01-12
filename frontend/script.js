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
    const contenedor = document.getElementById("lista-categorias");
    
    // Si no encuentra el div (porque estás en otra página), no hace nada y no tira error
    if (!contenedor) return; 

    try {
        const res = await fetch("http://localhost:3000/categorias");
        const categorias = await res.json();

        contenedor.innerHTML = "";

        categorias.forEach(cat => {
            const div = document.createElement("div");
            div.classList.add("categoria");
            
            // Hacemos que toda la tarjeta sea clickeable
            div.onclick = () => irACategoria(cat);

            div.innerHTML = `
                <h3>${cat}</h3>
                <span class="badge-premium">Explorar</span>
            `;
            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        contenedor.innerHTML = "<p style='color:white;'>Prende el servidor (node server.js) loco!</p>";
    }
}

function irACategoria(categoria) {
  window.location.href = `productos.html?categoria=${categoria}`;
}

/* =========================
   PRODUCTOS
========================= */

async function cargarProductos(categoria) {
    const titulo = document.getElementById("titulo-categoria");
    const contenedor = document.getElementById("productos");
    
    if (titulo) titulo.innerText = categoria;
    if (!contenedor) return;

    contenedor.innerHTML = "<p>Cargando delicias...</p>";

    try {
        const res = await fetch(`http://localhost:3000/productos?categoria=${categoria}`);
        const productos = await res.json();

        contenedor.innerHTML = "";

        productos.forEach((p, index) => {
            const div = document.createElement("div");
            div.classList.add("producto");
            div.innerHTML = `
                <div class="producto-info">
                    <h3>${p.nombre}</h3>
                    <span class="precio">$${p.precio}</span>
                    <div class="cantidad-control">
                        <button onclick="cambiarCantidad(${index}, -1)">–</button>
                        <span id="cant-${index}">1</span>
                        <button onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                    <button class="btn-agregar" onclick="agregarAlCarrito(${index})">
                        Añadir al pedido
                    </button>
                </div>
            `;
            contenedor.appendChild(div);
        });

        window.productosActuales = productos;

    } catch (err) {
        contenedor.innerHTML = "<p>Error al cargar los productos.</p>";
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
  // 1. Capturamos el método de pago antes de hacer nada
  const radioActivo = document.querySelector('input[name="pago"]:checked') || 
                      document.querySelector('input[name="pago-modal"]:checked');
  
  const metodoSeleccionado = radioActivo ? radioActivo.value : "Efectivo";

  // Actualizamos el objeto carrito local para que el resumen de WhatsApp salga bien
  carrito.metodoPago = metodoSeleccionado;

  try {
    // 2. Enviamos el pedido al backend con el método de pago en el BODY
    const res = await fetch("http://localhost:3000/pedido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        metodoPago: metodoSeleccionado
      })
    });

    if (!res.ok) throw new Error("Error en el servidor");

    const pedidoBackend = await res.json();

    // 3. Generar resumen para WhatsApp (usando el ID que viene del server)
    const resumen = generarResumen(carrito);
    const telefono = "5493515447794";
    const textoWhatsApp =
      `Pedido N° ${pedidoBackend.id || 'S/N'}\n` + // Usamos el ID del backend
      `Fecha: ${pedidoBackend.pedido.fecha}\n\n` +
      resumen;

    // 4. Abrir WhatsApp
    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(textoWhatsApp)}`,
      "_blank"
    );

    // 5. Limpiar backend (borrar carrito temporal)
    await fetch("http://localhost:3000/carrito", { method: "DELETE" });

    // 6. Limpiar frontend
    carrito.items = [];
    actualizarHeaderCarrito();
    cerrarCarrito();

    alert(`¡Pedido realizado!\n\nN° ${pedidoBackend.id}\n${pedidoBackend.pedido.fecha}`);

  } catch (error) {
    console.error("Error al procesar el pedido:", error);
    alert("No se pudo confirmar el pedido. Revisá que el servidor esté encendido.");
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