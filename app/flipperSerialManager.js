// flipperSerialManager.js

const { SerialPort } = require('serialport');

class FlipperSerialManager {
  constructor(serialPortPath, baudRate = 9600) {
    this.serialPortPath = serialPortPath;
    this.baudRate = baudRate;
    this.serialPort = null;
    this.isOpen = false;
    this.buffer = '';  // Accumulates incoming data
    this.commandResolve = null;  // Promise resolver for sendCommand
    this.commandReject = null;   // Promise rejecter for sendCommand
    this.promptString = '>: ';   // Adjust to the Flipper CLI’s actual prompt or marker
  }

  /**
   * Initialize the serial port and attach listeners.
   */
  init() {
    this.serialPort = new SerialPort({
      path: this.serialPortPath,
      baudRate: this.baudRate,
      autoOpen: false, // We'll open it manually
    });

    // Event: open
    this.serialPort.on('open', () => {
      console.log('FlipperSerialManager: Serial port opened.');
      this.isOpen = true;
    });

    // Event: cFlipperSerialManager:ose
    this.serialPort.on('close', () => {
      console.log('FlipperSerialManager: Serial port closed.');
      this.isOpen = false;
      // If there's a pending command promise, reject it
      if (this.commandReject) {
        this.commandReject(new Error('Serial port closed unexpectedly.'));
        this._resetCommandPromise();
      }
      // Optionally auto-reopen after a delay if needed:
      // setTimeout(() => this.openPort(), 3000);
    });

    // Event: error
    this.serialPort.on('error', (err) => {
      console.error('FlipperSerialManager: Serial port error:', err.message);
      // If there's a pending command, reject it
      if (this.commandReject) {
        this.commandReject(err);
        this._resetCommandPromise();
      }
    });

    // Event: data - read incoming data
    this.serialPort.on('data', (chunk) => {
      const incoming = chunk.toString();
      console.log('[Flipper Data]', incoming);
      this.buffer += incoming;

      // Check if we received the prompt or an indication the command has finished
      if (this.buffer.includes(this.promptString)) {
        if (this.commandResolve) {
          // Resolve with the full buffered data
          this.commandResolve(this.buffer);
          this._resetCommandPromise();
        }
        // Clear the buffer or keep it if you want to parse more
        this.buffer = '';
      }
    });
  }

  /**
   * Open the port if it's not already open.
   */
  openPort() {
    if (this.isOpen) {
      console.log('FlipperSerialManager: Port already open.');
      return;
    }
    this.serialPort.open((err) => {
      if (err) {
        console.error('FlipperSerialManager: Failed to open port:', err.message);
      }
    });
  }

  /**
   * Send a command to the Flipper CLI and return a Promise that resolves with the CLI output.
   */
  sendCommand(cmd) {
    if (!this.isOpen) {
      return Promise.reject(new Error('Serial port is not open.'));
    }

    // If there's already a pending command, reject to avoid collisions.
    if (this.commandResolve || this.commandReject) {
      return Promise.reject(new Error('Another command is still pending.'));
    }

    // Return a promise so callers can await or handle the result
    return new Promise((resolve, reject) => {
      this.commandResolve = resolve;
      this.commandReject = reject;

      // Prepare the command with a newline if needed
      const finalCommand = cmd.trim() + '\r\n';

      this.serialPort.write(finalCommand, 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('FlipperSerialManager: Error writing:', writeErr.message);
          reject(writeErr);
          this._resetCommandPromise();
          return;
        }
        // Wait for data and the prompt to indicate the command has finished
        // For debugging
        console.log(`FlipperSerialManager: Command "${finalCommand}" written`);
        this.serialPort.drain(() => {
          console.log('FlipperSerialManager: write buffer drained');
        });
      });
    });
  }

  _resetCommandPromise() {
    this.commandResolve = null;
    this.commandReject = null;
  }
}

module.exports = FlipperSerialManager;
