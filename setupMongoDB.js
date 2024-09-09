const sqlite3 = require('sqlite3').verbose();

// Open a database connection
const db = new sqlite3.Database('chat.db'); // This will create a file named 'chat.db'

// Set up tables
db.serialize(() => {
    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            socketId TEXT
        )
    `);

    // Create messages table
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            recipient TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("Database tables created successfully.");
});

// Close the database connection
db.close();
