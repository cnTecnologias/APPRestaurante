


const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send();
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});




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
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
















