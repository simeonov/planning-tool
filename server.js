const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const socketIo = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = socketIo(server);

  const rooms = new Map();

  io.on('connection', (socket) => {
    socket.on('joinRoom', ({ roomId, userName }) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      rooms.get(roomId).set(socket.id, { name: userName, role: '', vote: null });
      io.to(roomId).emit('updateUsers', Array.from(rooms.get(roomId).values()));
    });

    socket.on('selectRole', ({ roomId, role }) => {
      if (rooms.has(roomId) && rooms.get(roomId).has(socket.id)) {
        rooms.get(roomId).get(socket.id).role = role;
        io.to(roomId).emit('updateUsers', Array.from(rooms.get(roomId).values()));
      }
    });

    socket.on('vote', ({ roomId, vote }) => {
      if (rooms.has(roomId) && rooms.get(roomId).has(socket.id)) {
        rooms.get(roomId).get(socket.id).vote = vote;
        io.to(roomId).emit('updateUsers', Array.from(rooms.get(roomId).values()));
      }
    });

    socket.on('revealVotes', ({ roomId }) => {
      io.to(roomId).emit('revealVotes');
    });

    socket.on('resetVotes', ({ roomId }) => {
      if (rooms.has(roomId)) {
        for (const user of rooms.get(roomId).values()) {
          user.vote = null;
        }
        io.to(roomId).emit('resetVotes');
        io.to(roomId).emit('updateUsers', Array.from(rooms.get(roomId).values()));
      }
    });

    socket.on('disconnecting', () => {
      for (const roomId of socket.rooms) {
        if (rooms.has(roomId)) {
          rooms.get(roomId).delete(socket.id);
          if (rooms.get(roomId).size === 0) {
            rooms.delete(roomId);
          } else {
            io.to(roomId).emit('updateUsers', Array.from(rooms.get(roomId).values()));
          }
        }
      }
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});