const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const { spawn, exec } = require('child_process');
const FlipperSerialManager = require('./flipperSerialManager');
const { SerialPort, SerialPortMock } = require('serialport');
const port = 3000;

// const serialPortPath = '/dev/ttyACM0';
const serialPortPath = '/dev/tty.usbmodemflip_Munati1';
const flipper = new FlipperSerialManager(serialPortPath);

const configPath = path.join(__dirname, 'public/remotes2.json');
let config = {};

function loadConfig() {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('Remote Configurations loaded successfully.');
  } catch (err) { 
    console.error('Error loading the remote configurations:', err);
    config = {};
  }
}

// Load the config
loadConfig();

// Watch for changes in config2.json (Optional: Hot Reload)
fs.watchFile(configPath, { interval: 5000 }, () => {
  console.log('Config file updated. Reloading...');
  loadConfig();
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join('public/index.html')));
server.listen(port, () =>  {console.log(`Server is running on port ${port}`);});

// Initialize and open the port
flipper.init();
flipper.openPort();

function getCommand(button) {
  for (const category in config) {
    if (config[category][button]) {
      return config[category][button];
    }
  }
  return null;
}

// Socket.IO
io.on('connection', (socket) => {
    console.log('New WebSocket client connected.');
  
    // Listen for "ButtonPressed" events from the client
    socket.on('ButtonPressed', async (button) => {
      console.log(`Received button press: ${button}`);
  
      // If serial not connected, notify client
      if (!flipper.isOpen) {
        socket.emit('error', 'Serial device not connected!');
        return;
      }
  
      let command = getCommand(button);

      if (!command) {
        socket.emit('error', `Command not found for that button!`);
        return;
      }

      try { 
        if (Array.isArray(command)) {
          for (let i = 0; i < command.length; i++) {
            const cmd = command[i];
            console.log(`Executing array command #[${i}]: ${cmd}`);
            await flipper.sendCommand(cmd);
          }
        } else {
          await flipper.sendCommand(command);
          console.log(`Executed commmand: ${command}`);
        }
        socket.emit('commandOutput', command);
      } catch (err) {
        console.error('Error executing command:', err.message);
        socket.emit('error', 'Failed to execute command.');
      }

    });

    socket.on('disconnect', () => {
      console.log('WebSocket client disconnected.');
    });
  });
