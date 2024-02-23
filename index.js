const fs = require('fs');
const path = require('path');

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer'); // Adicionando Multer para upload de imagens

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = [];


const { exec } = require('child_process');

// Função para instalar o módulo 'multer'
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

// Instalar 'multer' se ainda não estiver instalado
installMulter().catch(err => console.error(err));



// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Diretório onde as imagens serão armazenadas
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Nome do arquivo (timestamp + nome original)
  }
});

const upload = multer({ storage: storage });

// Rota para lidar com o upload de imagens de perfil
app.post('/upload', upload.single('profileImage'), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error('Por favor, selecione um arquivo');
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
});


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
const terrorDeOPTPassword = 'sonia'; // Senha para a sala Terror de OPT

terrorDeOPT.on('connection', (socket) => {
  console.log('Novo usuário conectado à sala Terror de OPT');

  // Verificação da senha ao entrar na sala
  socket.on('enter room', (password) => {
    if (password === terrorDeOPTPassword) {
      socket.join('terror-de-opt'); // Adicionando o usuário à sala
      socket.emit('room entered');
      socket.emit('chat history', terrorDeOPTMessages);
    } else {
      socket.emit('error', 'Senha incorreta para a sala Terror de OPT');
    }
  });

  socket.on('chat message', (msg) => {
    terrorDeOPTMessages.push(msg);
    io.to('terror-de-opt').emit('chat message', msg); // Emitir apenas para a sala Terror de OPT
    saveTerrorDeOPTMessages();
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado da sala Terror de OPT');
  });
});

// Sala "Inimigos da Bola"
const inimigosDaBola = io.of('/inimigos-da-bola');
let inimigosDaBolaMessages = [];
const inimigosDaBolaPassword = 'mariana'; // Senha para a sala Inimigos da Bola

inimigosDaBola.on('connection', (socket) => {
  console.log('Novo usuário conectado à sala Inimigos da Bola');

  // Verificação da senha ao entrar na sala
  socket.on('enter room', (password) => {
    if (password === inimigosDaBolaPassword) {
      socket.join('inimigos-da-bola'); // Adicionando o usuário à sala
      socket.emit('room entered');
      socket.emit('chat history', inimigosDaBolaMessages);
    } else {
      socket.emit('error', 'Senha incorreta para a sala Inimigos da Bola');
    }
  });

  socket.on('chat message', (msg) => {
    inimigosDaBolaMessages.push(msg);
    io.to('inimigos-da-bola').emit('chat message', msg); // Emitir apenas para a sala Inimigos da Bola
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
