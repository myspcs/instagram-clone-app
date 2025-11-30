const path = require('path');
const express = require('express');
const app = require('./backend/app');
const connectDatabase = require('./backend/config/database');
const PORT = process.env.PORT || 4000;

connectDatabase();

// Serve uploaded files from the backend/uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));

// deployment
__dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/frontend/build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
    });
} else {
    app.get('/', (req, res) => {
        res.send('Server is Running! 🚀');
    });
}

const server = app.listen(PORT, () => {
    console.log(`Server Running on http://localhost:${PORT}`);
});


// ============= socket.io ==============

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
    }
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
}

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
}

io.on("connection", (socket) => {
    console.log("🚀 Someone connected!");

    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    socket.on("sendMessage", ({ senderId, receiverId, content }) => {
        const user = getUser(receiverId);

        io.to(user?.socketId).emit("getMessage", {
            senderId,
            content,
        });
    });

    socket.on("typing", ({ senderId, receiverId }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit("typing", senderId);
    });

    socket.on("typing stop", ({ senderId, receiverId }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit("typing stop", senderId);
    });

    socket.on("disconnect", () => {
        console.log("⚠️ Someone disconnected")
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
