const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let onlineUsers = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('set username', (username) => {
        socket.username = username;
        onlineUsers[username] = socket.id;
        io.emit('online users', Object.keys(onlineUsers));
    });

    socket.on('private message', ({ recipient, message }) => {
        const recipientSocketId = onlineUsers[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('private message', {
                sender: socket.username,
                message: message
            });
        }
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            delete onlineUsers[socket.username];
            io.emit('online users', Object.keys(onlineUsers));
        }
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
