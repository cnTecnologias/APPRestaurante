// Variable global para guardar los pedidos
let pedidosCache = [];

// 1. FUNCIÓN PRINCIPAL: Trae los datos del Servidor
async function cargarDatosAdmin() {
    try {
        // USAMOS LA RUTA QUE DEVUELVE LOS PEDIDOS REALES
        const respuesta = await fetch("http://localhost:3000/pedidos");
        pedidosCache = await respuesta.json();
        
        renderizarTabla(pedidosCache);
        actualizarResumen(pedidosCache);
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("No se pudo cargar la información.");
    }
}

// 2. DIBUJAR LA TABLA
function renderizarTabla(lista) {
    // CORREGIDO: Usamos el ID de tu HTML 'lista-pedidos'
    const tabla = document.getElementById("lista-pedidos");
    tabla.innerHTML = ""; 

    lista.reverse().forEach(pedido => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>#${pedido.id}</td>
            <td>${pedido.fecha}</td>
            <td><span class="badge ${pedido.metodo_pago}">${pedido.metodo_pago}</span></td>
            <td><strong>$${pedido.total.toLocaleString("es-AR")}</strong></td>
            <td><button class="btn-borrar" onclick="eliminarPedido(${pedido.id})">🗑️</button></td>
        `;
        tabla.appendChild(fila);
    });
}

// 3. FILTRADO INTERACTIVO
function filtrar() {
    // CORREGIDO: Usamos los IDs de tu HTML 'busqueda' y 'filtro-pago'
    const busqueda = document.getElementById("busqueda").value.toLowerCase();
    const metodo = document.getElementById("filtro-pago").value;

    const filtrados = pedidosCache.filter(p => {
        const coincideTexto = p.fecha.toLowerCase().includes(busqueda);
        const coincideMetodo = metodo === "todos" || p.metodo_pago === metodo;
        return coincideTexto && coincideMetodo;
    });

    renderizarTabla(filtrados);
    actualizarResumen(filtrados); // Para que el total cambie según el filtro
}

// 4. RESUMEN: Calcula el total y cantidad
function actualizarResumen(lista) {
    const recaudado = lista.reduce((acc, p) => acc + p.total, 0);
    
    // CORREGIDO: Usamos los IDs de tu HTML 'total-dinero' y 'total-pedidos'
    document.getElementById("total-dinero").innerText = `$${recaudado.toLocaleString("es-AR")}`;
    document.getElementById("total-pedidos").innerText = lista.length;
}

// Escuchamos cuando carga el HTML para arrancar
document.addEventListener("DOMContentLoaded", cargarDatosAdmin);

// Función extra para que no tire error si tocas el tacho (falta crear ruta en server)
function eliminarPedido(id) {
    if(confirm("¿Seguro que querés eliminar el pedido #" + id + "?")) {
        console.log("Eliminando pedido...", id);
        // Aquí iría un fetch con DELETE a futuro
    }
}