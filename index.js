const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Função para instalar o multer
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

// Função para salvar as mensagens no arquivo
function saveMessages() {
  const messagesPath = path.join('/tmp', 'messages.json'); // Caminho para o diretório temporário
  fs.writeFile(messagesPath, JSON.stringify(messages), (err) => {
    if (err) {
      console.error('Error saving messages:', err);
    } else {
      console.log('Messages saved successfully.');
    }
  });
}

// Sala "Terror de OPT"
const terrorDeOPT = io.of('/terror-de-opt');
let terrorDeOPTMessages = [];

terrorDeOPT.on('connection', (socket) => {
  console.log('Novo usuário conectado à sala Terror de OPT');

  socket.emit('chat history', terrorDeOPTMessages);

  socket.on('chat message', (msg) => {
    terrorDeOPTMessages.push(msg);
    terrorDeOPT.emit('chat message', msg);
    saveTerrorDeOPTMessages();
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado da sala Terror de OPT');
  });
});

// Sala "Inimigos da Bola"
const inimigosDaBola = io.of('/inimigos-da-bola');
let inimigosDaBolaMessages = [];

inimigosDaBola.on('connection', (socket) => {
  console.log('Novo usuário conectado à sala Inimigos da Bola');

  socket.emit('chat history', inimigosDaBolaMessages);

  socket.on('chat message', (msg) => {
    inimigosDaBolaMessages.push(msg);
    inimigosDaBola.emit('chat message', msg);
    saveInimigosDaBolaMessages();
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado da sala Inimigos da Bola');
  });
});

// Funções para salvar mensagens em arquivos diferentes para cada sala
function saveTerrorDeOPTMessages() {
  const messagesPath = path.join('/tmp', 'terror-de-opt-messages.json'); // Caminho para o diretório temporário
  fs.writeFile(messagesPath, JSON.stringify(terrorDeOPTMessages), (err) => {
    if (err) {
      console.error('Error saving Terror de OPT messages:', err);
    } else {
      console.log('Terror de OPT messages saved successfully.');
    }
  });
}

function saveInimigosDaBolaMessages() {
  const messagesPath = path.join('/tmp', 'inimigos-da-bola-messages.json'); // Caminho para o diretório temporário
  fs.writeFile(messagesPath, JSON.stringify(inimigosDaBolaMessages), (err) => {
    if (err) {
      console.error('Error saving Inimigos da Bola messages:', err);
    } else {
      console.log('Inimigos da Bola messages saved successfully.');
    }
  });
}

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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

installMulter().catch(err => console.error(err));
