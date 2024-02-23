const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Função para instalar o pacote giphy-js-sdk-core
const installGiphySDK = () => {
  return new Promise((resolve, reject) => {
    exec('npm install giphy-js-sdk-core', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error installing giphy-js-sdk-core: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Error installing giphy-js-sdk-core: ${stderr}`);
        reject(stderr);
        return;
      }
      console.log(`giphy-js-sdk-core installed successfully`);
      resolve();
    });
  });
};

// Verifica se o pacote giphy-js-sdk-core está instalado
try {
  require.resolve('giphy-js-sdk-core');
} catch (err) {
  console.log('Installing giphy-js-sdk-core...');
  // Instalar o pacote giphy-js-sdk-core no diretório atual
  installGiphySDK().then(() => {
    console.log('Dependencies installed successfully');
    // Depois que o pacote é instalado com sucesso, prosseguimos com o restante do código
    startServer();
  }).catch(err => {
    console.error('Error installing giphy-js-sdk-core:', err);
  });
}

// Função para iniciar o servidor após a instalação das dependências
function startServer() {
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
          const Giphy = require('giphy-js-sdk-core');
          const giphy = Giphy('SUA_CHAVE_DE_API_DO_GIPHY'); // Substitua 'SUA_CHAVE_DE_API_DO_GIPHY' pela sua chave de API do Giphy
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
}
