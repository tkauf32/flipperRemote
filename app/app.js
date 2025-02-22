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
// const serialPort = new SerialPort({ path: serialPortPath, baudRate: 9600})
let isSerialConnected = false;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join('public/index.html')));
server.listen(port, () =>  {console.log(`Server is running on port ${port}`);});

// Initialize and open the port
flipper.init();
flipper.openPort();


// Socket.IO
io.on('connection', (socket) => {
    console.log('New WebSocket client connected.');
  
    socket.on('disconnect', () => {
      console.log('WebSocket client disconnected.');
    });
  
    // Listen for "ButtonPressed" events from the client
    socket.on('ButtonPressed', async (button) => {
      console.log(`Received button press: ${button}`);
  
      // If serial not connected, notify client
      if (!flipper.isOpen) {
        socket.emit('error', 'Serial device not connected!');
        return;
      }
  
      // Example: map the button to a flipper CLI command
    //   let command = '?'; // Default
    
    // Fan commands
    if (button === 'FanPower') {
        command = 'subghz tx_from_file /ext/Room/Fan/FanPower.sub';
      } else if (button === 'LightPower') {
        command = 'subghz tx_from_file /ext/Room/Fan/LightPower.sub';
      } else if (button === 'Medium') {
        command = 'subghz tx_from_file /ext/Room/Fan/Medium.sub';
      } else if (button === 'High') {
        command = 'subghz tx_from_file /ext/Room/Fan/High.sub';
      } else if (button === 'Low') {
        command = 'subghz tx_from_file /ext/Room/Fan/Low.sub';
      } else if (button.startsWith('Plug')) {
        // Remove the "Plug" prefix (e.g., "Plug1_ON" -> "1_ON")
        const plugCommand = button.replace('Plug', '');
        command = 'subghz tx_from_file /ext/Room/OutletPlugs/' + plugCommand + '.sub';
      }
      // Default: treat as ProjectorScreen command
      else {
        command = 'subghz tx_from_file /ext/Room/ProjectorScreen/' + button + '.sub';
      }
  
      try {
        const response = await flipper.sendCommand(command);
        console.log('Command Response:', response);
        // Optionally, send the response back to the client
        socket.emit('commandOutput', response);
      } catch (err) {
        console.error('Error executing command:', err.message);
        socket.emit('error', 'Failed to execute command');
      }
    });
  });
