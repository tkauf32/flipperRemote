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

const serialPortPath = '/dev/ttyACM0';
// const serialPortPath = '/dev/tty.usbmodemflip_Munati1';
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

function getCommand(remote, command) {
  // If `remote` exists in config and that remote has a key for `command`
  if (config[remote] && config[remote][command]) {
    return config[remote][command];
  }
  return null;
}


// Socket.IO
io.on('connection', (socket) => {
    console.log('New WebSocket client connected.');
  
    // Listen for "ButtonPressed" events from the client
    socket.on('ButtonPressed', async ({remote, command}) => {
      console.log(`Received button press: ${remote} -> ${command}`);
  
      // If serial not connected, notify client
      if (!flipper.isOpen) {
        socket.emit('error', 'Serial device not connected!');
        return;
      }
  
      const cmd = getCommand(remote, command);
      if (!cmd) {
        socket.emit('error', `Command not found for ${remote} -> ${command}`);
        return;
      }

      try {
        if (Array.isArray(cmd)) {
            for (let i = 0; i < cmd.length; i++) {
                console.log(`Executing ${remote} command [${command} #${i}]: ${cmd[i]}`);
                await flipper.sendCommand(cmd[i]);
            }
        } else {
            console.log(`Executing ${remote} command ${command}: ${cmd}`);
            await flipper.sendCommand(cmd);
        }
        socket.emit('commandOutput', `${remote} -> ${command}`);
    } catch (err) {
        console.error('Error executing command:', err.message);
        socket.emit('error', 'Failed to execute command.');
    }
});

    socket.on('disconnect', () => {
      console.log('WebSocket client disconnected.');
    });
  });
