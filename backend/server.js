


const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const PORT = 3000;

app.get("/", (req, res) => {
    res.send();
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});




// Datos Lista de productos de ejemplo
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

// Servidor
















