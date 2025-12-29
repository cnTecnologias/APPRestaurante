const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;
const {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarProducto
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

let carrito = [];

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
    carrito = [];
    res.json({ mensaje: "Pedido confirmado" });
});

//ID pedido - fecha hora
let numeroPedido = 1;

app.post("/pedido", (req, res) => {
  const pedido = {
    id: numeroPedido++,
    fecha: new Date().toLocaleString("es-AR"),
    items: carrito
  };

  carrito = []; // vaciamos carrito al confirmar

  res.json(pedido);
});


// levantar server AL FINAL
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});














