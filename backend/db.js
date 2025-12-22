const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Error al conectar DB", err.message);
    } else {
        console.log("DB conectada");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS carrito (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        precio INTEGER,
        cantidad INTEGER
    )
`);
module.exports = db;