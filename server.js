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

// Add io to req object for use in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

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
        console.log(`User ${socket.id} attempting to join room: ${roomId}`);
        socket.join(roomId);

        // Track active users
        if (!activeUsers.has(roomId)) {
            activeUsers.set(roomId, new Set());
            console.log(`Created new activeUsers entry for room: ${roomId}`);
        }
        activeUsers.get(roomId).add(socket.id);
        console.log(`Active users in room ${roomId}: ${activeUsers.get(roomId).size}`);
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

  socket.on('leave-room', async ({ roomId }) => {
    console.log(`User ${socket.id} leaving room: ${roomId}`);
    socket.leave(roomId);
    
    if (activeUsers.has(roomId)) {
      activeUsers.get(roomId).delete(socket.id);
      console.log(`Active users in room ${roomId}: ${activeUsers.get(roomId).size}`);
      
      // If no users left in room, schedule deletion with delay
      if (activeUsers.get(roomId).size === 0) {
        try {
          console.log(`Scheduling room ${roomId} for deletion in 5 minutes`);
          setTimeout(async () => {
            // Double-check that room is still empty before deleting
            if (activeUsers.has(roomId) && activeUsers.get(roomId).size === 0) {
              console.log(`Deleting room ${roomId} - no users left after 5 minute delay`);
              await Room.findByIdAndDelete(roomId);
              console.log(`Room ${roomId} deleted automatically - user left and no users left`);
              activeUsers.delete(roomId);
            } else {
              console.log(`Room ${roomId} deletion cancelled - users rejoined`);
            }
          }, 5 * 60 * 1000); // 5 minutes delay
        } catch (error) {
          console.error(`Failed to schedule deletion for room ${roomId}:`, error);
        }
      } else {
        io.to(roomId).emit("active-users", activeUsers.get(roomId).size);
      }
    }
  });

  socket.on('disconnecting', async () => {
    console.log(`Socket ${socket.id} disconnecting`);
    // Get the rooms the socket was in before it fully disconnects
    const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
    console.log(`Socket was in rooms:`, rooms);

    for (const roomId of rooms) {
      if (activeUsers.has(roomId)) {
        activeUsers.get(roomId).delete(socket.id);
        console.log(`Active users in room ${roomId} after disconnection: ${activeUsers.get(roomId).size}`);
        
        // Only delete room if it has been empty for more than 5 minutes
        // This prevents immediate deletion due to connection issues
        if (activeUsers.get(roomId).size === 0) {
          try {
            console.log(`Scheduling room ${roomId} for deletion in 5 minutes`);
            setTimeout(async () => {
              // Double-check that room is still empty before deleting
              if (activeUsers.has(roomId) && activeUsers.get(roomId).size === 0) {
                console.log(`Deleting room ${roomId} - no users left after 5 minute delay`);
                await Room.findByIdAndDelete(roomId);
                console.log(`Room ${roomId} deleted automatically - no users left`);
                activeUsers.delete(roomId);
              } else {
                console.log(`Room ${roomId} deletion cancelled - users rejoined`);
              }
            }, 5 * 60 * 1000); // 5 minutes delay
          } catch (error) {
            console.error(`Failed to schedule deletion for room ${roomId}:`, error);
          }
        } else {
          io.to(roomId).emit("active-users", activeUsers.get(roomId).size);
        }
      }
    }
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


