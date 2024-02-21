const { exec } = require('child_process');
const fs = require('fs');

const installMulter = () => {
  return new Promise((resolve, reject) => {
    exec('npm install multer', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error installing multer: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Error installing multer: ${stderr}`);
        reject(stderr);
        return;
      }
      console.log(`multer installed successfully`);
      resolve();
    });
  });
};

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = [];

// Carregar mensagens salvas
fs.readFile('messages.json', (err, data) => {
  if (err) {
    console.error('Error loading messages:', err);
  } else {
    try {
      messages = JSON.parse(data);
      console.log('Messages loaded successfully.');
    } catch (error) {
      console.error('Error parsing messages:', error);
    }
  }
});

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

installMulter().catch(err => console.error(err));
