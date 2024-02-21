const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer'); // Adicionando o multer para lidar com o upload de arquivos
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = [];

// Configurando o multer para salvar os arquivos na pasta 'uploads'
const upload = multer({ dest: 'uploads/' });

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

// Rota para lidar com o upload de mídia
app.post('/upload', upload.single('media'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('Nenhum arquivo foi enviado.');
  }
  res.send(file);
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
