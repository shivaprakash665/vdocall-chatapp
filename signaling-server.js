/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your domain
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Ensure compatibility across different network conditions
  allowEIO3: true,                     // Support older clients if needed
});

// Store room information. Map of roomId -> { hosts: Set<string>, guests: Set<string> }
const roomData = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('request-join-room', ({ roomId, name }) => {
    let room = roomData.get(roomId);

    if (!room) {
      // Room doesn't exist, this user becomes the first host
      room = { hosts: new Set([socket.id]), guests: new Set() };
      roomData.set(roomId, room);

      socket.join(roomId);
      console.log(`User ${socket.id} created and joined room ${roomId} as host`);
      socket.emit('room-joined', { isHost: true, roomId });
    } else if (room.hosts.has(socket.id) || room.guests.has(socket.id)) {
      // User is already recognized in this room
      socket.emit('room-joined', { isHost: room.hosts.has(socket.id), roomId });
    } else {
      // Room exists, users in it are hosts. Send knocking signal.
      console.log(`User ${socket.id} (${name}) is knocking on room ${roomId}`);
      socket.emit('waiting-for-host');

      // Notify all users already in the room that someone wants to join
      socket.to(roomId).emit('guest-knocking', { guestId: socket.id, guestName: name });
    }
  });

  socket.on('accept-guest', ({ roomId, guestId }) => {
    const room = roomData.get(roomId);
    if (!room) return;

    // Verify the sender is a host (currently anyone in the room is a host)
    if (room.hosts.has(socket.id) || room.guests.has(socket.id)) {
      // Add the guest to the actual socket room
      const guestSocket = io.sockets.sockets.get(guestId);
      if (guestSocket) {
        guestSocket.join(roomId);
        room.guests.add(guestId);
        console.log(`Guest ${guestId} was accepted into room ${roomId}`);

        // Tell the guest they are allowed in
        guestSocket.emit('room-joined', { isHost: false, roomId });

        // Tell everyone else the guest has officially connected (triggers WebRTC offer)
        guestSocket.to(roomId).emit('user-connected', guestId);
      }
    }
  });

  socket.on('deny-guest', ({ roomId, guestId }) => {
    const guestSocket = io.sockets.sockets.get(guestId);
    if (guestSocket) {
      console.log(`Guest ${guestId} was denied entry to room ${roomId}`);
      guestSocket.emit('guest-denied');
    }
  });

  socket.on('offer', (data) => {
    // Forward offer to specific target or room
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      senderId: socket.id
    });
  });

  socket.on('answer', (data) => {
    // Forward answer to specific target or room
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      senderId: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    // Forward ICE candidate to others in the room
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      senderId: socket.id
    });
  });

  // Chat message event
  socket.on('chat-message', (data) => {
    socket.to(data.roomId).emit('chat-message', {
      message: data.message,
      senderId: socket.id,
      senderName: data.senderName
    });
  });

  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach(roomId => {
      socket.to(roomId).emit('user-disconnected', socket.id);

      // Cleanup roomData
      const room = roomData.get(roomId);
      if (room) {
        room.hosts.delete(socket.id);
        room.guests.delete(socket.id);
        if (room.hosts.size === 0 && room.guests.size === 0) {
          roomData.delete(roomId);
        }
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || process.env.SIGNALING_PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Signaling server running on port ${PORT}`);
});
