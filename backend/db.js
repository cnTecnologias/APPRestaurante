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

// Crear tabla para pedidos con TODAS las columnas necesarias
db.run(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT,
    productos TEXT,           -- Agregado
    motivo_cancelacion TEXT,  -- Agregado para auditoría
    total INTEGER,
    metodo_pago TEXT,
    estado TEXT DEFAULT 'Pendiente' 
  )
`);

// Ejecutar estas líneas UNA SOLA VEZ para actualizar si la tabla ya existía
db.run(`ALTER TABLE pedidos ADD COLUMN productos TEXT`, (err) => {});
db.run(`ALTER TABLE pedidos ADD COLUMN motivo_cancelacion TEXT`, (err) => {});


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
function crearPedidoDB(fecha, productos, total, metodoPago, callback) {
    const sql = `INSERT INTO pedidos (fecha, productos, total, metodo_pago, estado) 
                 VALUES (?, ?, ?, ?, 'Pendiente')`;
    
    // Usamos function(err) tradicional para poder acceder a 'this.lastID'
    db.run(sql, [fecha, productos, total, metodoPago], function(err) {
        if (err) return callback(err);
        callback(null, this.lastID); 
    });
}






db.run(`ALTER TABLE pedidos ADD COLUMN estado TEXT DEFAULT 'Pendiente'`, (err) => {
    if (err) {
        console.log("Aviso: La columna estado ya existe, todo ok.");
    } else {
        console.log("Éxito: Columna estado creada.");
    }
});

function eliminarPedidoDB(id, callback) {
  db.run("DELETE FROM pedidos WHERE id = ?", [id], callback);
}
function actualizarEstadoPedido(id, nuevoEstado, motivo, callback) {
    const sql = `UPDATE pedidos SET estado = ?, motivo_cancelacion = ? WHERE id = ?`;
    db.run(sql, [nuevoEstado, motivo || null, id], callback);
}

module.exports = {
  db,
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarProducto,
  vaciarCarrito,
  crearPedidoDB,          // Cambiado
  obtenerPedidos,
  actualizarEstadoPedido,
  eliminarPedidoDB
};