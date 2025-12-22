const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;
const db = require("./db");
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
    res.json(carrito);
});

app.post("/carrito", (req, res) => {
    const { nombre, precio, cantidad } = req.body;

    const existente = carrito.find(p => p.nombre === nombre);
    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({ nombre, precio, cantidad });
    }

    res.json(carrito);
});
// Modificar cantidad de un producto
app.put("/carrito", (req, res) => {
    const { nombre, cantidad } = req.body;

    const producto = carrito.find(p => p.nombre === nombre);
    if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (cantidad <= 0) {
        carrito = carrito.filter(p => p.nombre !== nombre);
    } else {
        producto.cantidad = cantidad;
    }

    res.json(carrito);
});

// Eliminar producto
app.delete("/carrito/:nombre", (req, res) => {
    const { nombre } = req.params;
    carrito = carrito.filter(p => p.nombre !== nombre);
    res.json(carrito);
});

// Vaciar carrito (confirmar pedido)
app.delete("/carrito", (req, res) => {
    carrito = [];
    res.json({ mensaje: "Pedido confirmado" });
});
// levantar server AL FINAL
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});














