import mongoose from "mongoose";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";

import router from "./routes/roomRoutes.js"
import { Room } from "./models/Room_model.js";

dotenv.config();
const app = express();
const server = http.createServer(app);


app.use(cors({
    origin: process.env.CORS_ORIGIN || "https://whiteboard-ashy-nu.vercel.app",
    credentials:true
}))

app.use(express.json());
app.use("/api", router);


const io = new Server(server, {
    cors: { 
        origin: process.env.CORS_ORIGIN || "https://whiteboard-ashy-nu.vercel.app",
        methods: ["GET", "POST"]
    }
});

// Map to store active users per room
const activeUsers = new Map(); // roomId -> Set of socket.id's

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join-room', async ({ roomId }) => {
        socket.join(roomId);

        // Track active users
        if (!activeUsers.has(roomId)) {
            activeUsers.set(roomId, new Set());
        }
        activeUsers.get(roomId).add(socket.id);
        io.to(roomId).emit("active-users", activeUsers.get(roomId).size);

        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on('drawing-data', ({ roomId, line }) => {
    socket.to(roomId).emit('receive-drawing', line);
  });

  socket.on('save-state', async ({ roomId, whiteboardState }) => {
    await Room.findByIdAndUpdate(roomId, { whiteboardState });
  });

  socket.on('undo-redo', ({ roomId, state }) => {
    socket.to(roomId).emit('undo-redo-receive', state);
  });

  socket.on('clear-board', ({ roomId }) => {
    socket.to(roomId).emit('clear-board-receive');
  });

  socket.on('disconnecting', () => {
    // Get the rooms the socket was in before it fully disconnects
    const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);

    rooms.forEach(roomId => {
      if (activeUsers.has(roomId)) {
        activeUsers.get(roomId).delete(socket.id);
        if (activeUsers.get(roomId).size === 0) {
          activeUsers.delete(roomId);
        }
        io.to(roomId).emit("active-users", activeUsers.has(roomId) ? activeUsers.get(roomId).size : 0);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
})


async function start() {
    const mongoUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/whiteboard";
    try {
        await mongoose.connect(mongoUrl, { dbName: process.env.DB_NAME || undefined });
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(` MONGODB connected Succsefully \n Server is running at port: ${PORT}`);
            
        });
    } catch (err) {
        console.error("MONGODB CONNECTION FAILED!!", err);
        process.exit(1);
    }
}

start();


