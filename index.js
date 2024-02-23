const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Array para armazenar os usuários e suas informações
const users = [];

// Definindo a política de segurança de conteúdo (CSP)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Configuração de visualização e arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Evento de conexão com o Socket.IO
io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  // Evento para lidar com a entrada do usuário
  socket.on('user join', (userData) => {
    // Adicionar usuário ao array de usuários
    users.push(userData);
    // Emitir evento para atualizar a lista de usuários conectados para todos os clientes
    io.emit('user join', users);
  });

  // Evento para lidar com o envio de mensagens
  socket.on('chat message', (msgData) => {
    io.emit('chat message', msgData);
  });

  // Evento de desconexão
  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
    // Remover usuário do array de usuários
    users.splice(users.indexOf(socket.username), 1);
    // Emitir evento para atualizar a lista de usuários conectados para todos os clientes
    io.emit('user join', users);
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
