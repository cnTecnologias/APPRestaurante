const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error al conectar DB", err.message);
  } else {
    console.log("DB conectada");
  }
});

// Crear tabla carrito si no existe(carrito)
db.run(`
  CREATE TABLE IF NOT EXISTS carrito (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    precio INTEGER,
    cantidad INTEGER
  )
`);
//crear tabla para pedidos 
db.run(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT,
    total INTEGER,
    metodo_pago TEXT
  )
`);

// Obtener carrito
function obtenerCarrito(callback) {
  db.all("SELECT * FROM carrito", callback);
}

// Agregar producto al carrito


function agregarAlCarrito(producto, callback) {
  const { nombre, precio, cantidad } = producto;

  db.run(
    `
    INSERT INTO carrito (nombre, precio, cantidad)
    VALUES (?, ?, ?)
    `,
    [nombre, precio, cantidad],
    callback
  );
}


// Actualizar la cantidad


function actualizarCantidad(nombre, cantidad, callback) {
  if (cantidad <= 0) {
    db.run(
      "DELETE FROM carrito WHERE nombre = ?",
      [nombre],
      callback
    );
  } else {
    db.run(
      "UPDATE carrito SET cantidad = ? WHERE nombre = ?",
      [cantidad, nombre],
      callback
    );
  }
}


//Eliminar producto 


function eliminarProducto(nombre, callback) {
  db.run(
    "DELETE FROM carrito WHERE nombre = ?",
    [nombre],
    callback
  );
}

//Eliminar todo del carrito 
function vaciarCarrito(callback) {
  db.run("DELETE FROM carrito", callback);
}

// 1. DEFINICIÓN (Asegurate que el nombre sea EXACTO)
function obtenerPedidos(callback) {
  db.all("SELECT * FROM pedidos", (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}





//Guardar pedido 
function guardarPedido(pedido, callback) {
  const { fecha, total, metodoPago } = pedido;

  db.run(
    `INSERT INTO pedidos (fecha, total, metodo_pago) VALUES (?, ?, ?)`,
    [fecha, total, metodoPago],
    callback // SQLite ejecutará este callback y nos dará el lastID en el server
  );
}

module.exports = {
  db,
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarProducto,
  vaciarCarrito,
  guardarPedido,
  obtenerPedidos
};