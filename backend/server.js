const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;
const {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarProducto,
  vaciarCarrito,
  guardarPedido,
  obtenerPedidos
} = require("./db");
app.use(cors());
app.use(express.json());

// Datos
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



// Rutas
app.get("/categorias", (req, res) => {
    res.json(Object.keys(productosPorCategoria));
});

app.get("/productos", (req, res) => {
    const categoria = req.query.categoria;
    if (!productosPorCategoria[categoria]) {
        return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json(productosPorCategoria[categoria]);
});

app.get("/carrito", (req, res) => {
  obtenerCarrito((err, items) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al leer el carrito" });
    } else {
      res.json(items);
    }
  });
});

app.post("/carrito", (req, res) => {
  agregarAlCarrito(req.body, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al agregar al carrito" });
    } else {
      res.json({ mensaje: "Producto agregado" });
    }
  });
});
// Modificar cantidad de un producto
app.put("/carrito", (req, res) => {
  const { nombre, cantidad } = req.body;

  actualizarCantidad(nombre, cantidad, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al actualizar carrito" });
    } else {
      res.json({ mensaje: "Cantidad actualizada" });
    }
  });
});

// Eliminar producto
app.delete("/carrito/:nombre", (req, res) => {
  const { nombre } = req.params;

  eliminarProducto(nombre, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al eliminar producto" });
    } else {
      res.json({ mensaje: "Producto eliminado" });
    }
  });
});

// Vaciar carrito (confirmar pedido)
app.delete("/carrito", (req, res) => {
  vaciarCarrito((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error al vaciar carrito" });
    } else {
      res.json({ mensaje: "Carrito vaciado" });
    }
  });
});
//ID pedido - fecha hora
let numeroPedido = 1;

app.post("/pedido", (req, res) => {
  const metodoPago = req.body.metodoPago || "Efectivo"; 
  
  obtenerCarrito((err, items) => {
    if (err) return res.status(500).json({ error: "Error al obtener carrito" });
    if (items.length === 0) return res.status(400).json({ error: "Carrito vacío" });

    // 1. TENÉS QUE CALCULAR EL TOTAL ACÁ ADENTRO
    let totalCalculado = 0;
    items.forEach(p => {
      totalCalculado += p.precio * p.cantidad;
    });

    const pedido = {
      fecha: new Date().toLocaleString("es-AR"),
      total: totalCalculado, // <--- AHORA SÍ: Usamos la variable que acabamos de crear
      metodoPago: metodoPago
    };

    guardarPedido(pedido, function(err) {
      if (err) return res.status(500).json({ error: "Error al guardar" });
      
      const nuevoId = this.lastID; 

      vaciarCarrito((err) => {
        if (err) return res.status(500).json({ error: "Error al vaciar" });

        res.json({
          mensaje: "Pedido confirmado",
          id: nuevoId,
          pedido
        });
      });
    });
  });
});

// --- RUTAS DE ADMINISTRACIÓN ---
// verlo a futuro 
// Ruta para obtener todos los pedidos (Solo para el dueño)
app.get("/api/pedidos", (req, res) => {
    obtenerPedidos((err, pedidos) => {
        if (err) return res.status(500).json({ error: "Error" });
        res.json(pedidos);
    });
});

// Ruta para ver estadísticas rápidas 
app.get("/api/admin/stats", (req, res) => {
    // consultas de SQL más complejas a futuro
    
    res.json({ mensaje: "Puerto de estadísticas listo" });
});

app.put('/api/pedidos/:id/estado', (req, res) => {
    const { id } = req.params;
    const { nuevoEstado } = req.body;

    const { actualizarEstadoPedido } = require("./db"); // Importamos la función

    actualizarEstadoPedido(id, nuevoEstado, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Estado actualizado" });
    });
});
//Borrar un pedido del admin 
// Única ruta para cambiar estados (Entregado, Cancelado, etc.)
app.put('/api/pedidos/:id/estado', (req, res) => {
    const { id } = req.params;
    const { nuevoEstado, motivo } = req.body; // Recibimos el motivo también
    const { actualizarEstadoPedido } = require("./db");

    actualizarEstadoPedido(id, nuevoEstado, motivo, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Estado actualizado con éxito" });
    });
});






// levantar server AL FINAL
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});














