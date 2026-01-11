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
    metodo_pago TEXT,
    estado TEXT DEFAULT 'Pendiente' 
  )`);
  

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
  // Agregamos 'estado' en el INSERT y le pasamos 'Pendiente'
  db.run(
    `INSERT INTO pedidos (fecha, total, metodo_pago, estado) VALUES (?, ?, ?, ?)`,
    [fecha, total, metodoPago, 'Pendiente'], 
    callback
  );
}
function actualizarEstadoPedido(id, nuevoEstado, callback) {
  db.run('UPDATE pedidos SET estado = ? WHERE id = ?', [nuevoEstado, id], callback);
}

db.run(`ALTER TABLE pedidos ADD COLUMN estado TEXT DEFAULT 'Pendiente'`, (err) => {
    if (err) {
        console.log("Aviso: La columna estado ya existe, todo ok.");
    } else {
        console.log("Éxito: Columna estado creada.");
    }
});

module.exports = {
  db,
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarProducto,
  vaciarCarrito,
  guardarPedido,
  obtenerPedidos,
  actualizarEstadoPedido
};