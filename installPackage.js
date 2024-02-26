const { exec } = require('child_process');

// Define o diretório onde o npm será executado
const npmDirectory = '/.github';

// Comando para instalar o pacote giphy-js-sdk-core
const npmCommand = 'npm install giphy-js-sdk-core';

// Executa o comando npm install no diretório especificado
exec(npmCommand, { cwd: npmDirectory }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error installing giphy-js-sdk-core: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error installing giphy-js-sdk-core: ${stderr}`);
    return;
  }
  console.log(`giphy-js-sdk-core installed successfully: ${stdout}`);
});
