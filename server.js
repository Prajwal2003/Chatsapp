const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const db = new sqlite3.Database('chat.db');

app.use(bodyParser.json());
app.use(express.static('public'));

// Register endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ error: 'Error hashing password.' });
        }

        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
            if (err) {
                console.error('Error inserting user into database:', err);
                return res.status(500).json({ error: 'Error registering user.' });
            }
            res.status(201).json({ message: 'User registered successfully.' });
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    db.get(`SELECT password FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Error fetching user.' });
        }
        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        bcrypt.compare(password, row.password, (err, match) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ error: 'Error comparing passwords.' });
            }
            if (!match) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }
            res.status(200).json({ message: 'Login successful.' });
        });
    });
});

// Initialize database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT,
        recipient TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Socket.io setup
const users = new Set();

io.on('connection', (socket) => {
    let username = '';

    socket.on('set username', (name) => {
        username = name;
        users.add(username);
        io.emit('update user list', Array.from(users));
    });

    socket.on('disconnect', () => {
        users.delete(username);
        io.emit('update user list', Array.from(users));
    });

    socket.on('private message', ({ recipient, message }) => {
        db.run(`INSERT INTO messages (sender, recipient, message) VALUES (?, ?, ?)`, [username, recipient, message]);

        io.emit('private message', { sender: username, message });
    });

    socket.on('get users', () => {
        io.emit('update user list', Array.from(users));
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

