const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('chat.db');

db.serialize(() => {
    // Print all data in the users table
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching users data:", err);
            return;
        }
        console.log("Users table data:");
        rows.forEach((row) => {
            console.log(row);
        });

        // Print all data in the messages table
        db.all(`SELECT * FROM messages`, [], (err, rows) => {
            if (err) {
                console.error("Error fetching messages data:", err);
                return;
            }
            console.log("Messages table data:");
            rows.forEach((row) => {
                console.log(row);
            });

            db.close(); // Close the database after printing data
        });
    });
});