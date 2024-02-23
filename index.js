const Giphy = require('giphy-js-sdk-core');
const giphy = Giphy('6U0FZT1gjNTHSpVhjC6KKe6n6hte0IVh'); // Substitua 'SUA_CHAVE_DE_API_DO_GIPHY' pela sua chave de API do Giphy

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

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

  socket.on('chat message', async (msg) => {
    // Se imgUrl estiver presente na mensagem, buscar um GIF correspondente no Giphy
    if (msg.imgUrl) {
      try {
        const response = await giphy.search('gifs', { q: msg.imgUrl, limit: 1 });
        if (response.data.length > 0) {
          msg.imgUrl = response.data[0].images.fixed_height.url;
        }
      } catch (error) {
        console.error('Error fetching GIF from Giphy:', error);
      }
    }
    
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
