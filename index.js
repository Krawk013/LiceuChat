// index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

const PORT = process.env.PORT || 3000; // Use a porta definida pelo ambiente ou 3000 como padrão
const IP_ADDRESS = '192.168.0.246'; // Escute em todas as interfaces de rede

server.listen(PORT, IP_ADDRESS, () => {
  console.log(`Servidor rodando em http://${IP_ADDRESS}:${PORT}`);
});
