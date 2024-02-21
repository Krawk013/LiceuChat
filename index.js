const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  socket.emit('chat history', messages);

  socket.on('chat message', (msg) => {
    messages.push(msg);
    io.emit('chat message', msg);
    saveMessages();
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

function saveMessages() {
  fs.writeFile('messages.json', JSON.stringify(messages), (err) => {
    if (err) {
      console.error('Error saving messages:', err);
    } else {
      console.log('Messages saved successfully.');
    }
  });
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
