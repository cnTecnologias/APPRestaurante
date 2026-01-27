// Variable global para guardar los pedidos
let pedidosCache = [];

// 1. FUNCIÓN PRINCIPAL: Trae los datos del Servidor
async function cargarDatosAdmin() {
    try {
        // USAMOS LA RUTA QUE DEVUELVE LOS PEDIDOS REALES
        const respuesta = await fetch("http://localhost:3000/api/pedidos");
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
    const tabla = document.getElementById("lista-pedidos");
    tabla.innerHTML = ""; 

    // IMPORTANTE: .slice().reverse() para no modificar el array original permanentemente
    lista.slice().reverse().forEach(pedido => {
        const fila = document.createElement("tr");
        
        const estadoActual = pedido.estado || 'Pendiente';
        
        // Asignamos la clase según el estado para el color
        let claseEstado = "";
        if (estadoActual === 'Pendiente') claseEstado = "estado-pendiente";
        else if (estadoActual === 'Entregado') claseEstado = "estado-entregado";
        else claseEstado = "estado-cancelado"; // Por si agregás cancelados

        fila.innerHTML = `
            <td>#${pedido.id}</td>
            <td>${pedido.fecha}</td>
            <td><span class="badge ${pedido.metodo_pago}">${pedido.metodo_pago}</span></td>
            <td><strong>$${pedido.total.toLocaleString("es-AR")}</strong></td>
            <td>
                <button class="btn-estado ${claseEstado}" 
                        onclick="cambiarEstado(${pedido.id}, '${estadoActual}')">
                    ${estadoActual.toUpperCase()}
                </button>
            </td>
            <td>
                <button class="btn-cancelar" onclick="cancelarPedidoConMotivo(${pedido.id})">
                    ✖
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

async function cancelarPedidoConMotivo(id) {
    const motivo = prompt("¿Por qué cancelas este pedido?");
    if (!motivo) return;

    const res = await fetch(`http://localhost:3000/api/pedidos/${id}/estado`, {
        method: 'PUT', // Usamos PUT que es el que unificamos
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado: 'cancelado', motivo: motivo })
    });

    if (res.ok) {
        cargarDatosAdmin(); // Esto vuelve a pintar la tabla
    } else {
        alert("Error en el servidor al cancelar");
    }
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
async function eliminarPedido(id) {
    if(confirm("¿Seguro que querés eliminar el pedido #" + id + "? Esta acción no se puede deshacer.")) {
        try {
            const response = await fetch(`http://localhost:3000/api/pedidos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Actualizamos la lista local y volvemos a dibujar
                pedidosCache = pedidosCache.filter(p => p.id !== id);
                renderizarTabla(pedidosCache);
                actualizarResumen(pedidosCache);
            } else {
                alert("Error al eliminar el pedido del servidor.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}
async function cambiarEstado(id, estadoActual) {
    const nuevoEstado = estadoActual === 'Pendiente' ? 'Entregado' : 'Pendiente';
    
    try {
        // CAMBIAMOS LA URL PARA QUE APUNTE AL PUERTO 3000
        const response = await fetch(`http://localhost:3000/api/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nuevoEstado })
        });

        if (response.ok) {
            console.log("Estado actualizado en el servidor");
            cargarDatosAdmin(); 
        } else {
            console.error("Error en la respuesta del servidor");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

async function eliminarPedido(id) {
    if(confirm("¿Seguro que querés eliminar el pedido #" + id + "?")) {
        try {
            // IMPORTANTE: Puerto 3000 y la ruta correcta
            const response = await fetch(`http://localhost:3000/api/pedidos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Si el server dice OK, lo borramos de la vista
                pedidosCache = pedidosCache.filter(p => p.id !== id);
                renderizarTabla(pedidosCache);
                actualizarResumen(pedidosCache);
            } else {
                alert("Error al eliminar el pedido del servidor.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}