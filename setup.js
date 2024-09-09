const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('chat.db');

db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS users`);
    db.run(`DROP TABLE IF EXISTS messages`);

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            socketId TEXT
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            recipient TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sender) REFERENCES users(username),
            FOREIGN KEY(recipient) REFERENCES users(username)
        )
    `);

    // Add a common user
    const username = 'a';
    const password = 'a';
    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error("Error hashing password:", err);
            return;
        }
        
        db.run(`
            INSERT INTO users (username, password) VALUES (?, ?)
        `, [username, hash], (err) => {
            if (err) {
                console.error("Error inserting common user:", err);
            } else {
                console.log("Common user added successfully.");
            }
            db.close();
        });
    });

    console.log("Database tables created successfully.");
});
