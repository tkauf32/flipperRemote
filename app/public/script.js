document.addEventListener('DOMContentLoaded', function () {
    const socket = io(); // Connect to the serve
    
    // Projector Buttons
    const upButton = document.getElementById('Up');
    const pauseButton = document.getElementById('Pause');
    const downButton = document.getElementById('Down');

    // Fan buttons
    const fanPower = document.getElementById('FanPower');
    const lightPowerButton = document.getElementById('LightPower');
    const fanMedium = document.getElementById('Medium');
    const fanHigh = document.getElementById('High');
    const fanLow = document.getElementById('Low');

    // OutletPlugs buttons
    const plug1On = document.getElementById('Plug1_ON');
    const plug1Off = document.getElementById('Plug1_OFF');
    const plug2On = document.getElementById('Plug2_ON');
    const plug2Off = document.getElementById('Plug2_OFF');
    const plug3On = document.getElementById('Plug3_ON');
    const plug3Off = document.getElementById('Plug3_OFF');
    const plug4On = document.getElementById('Plug4_ON');
    const plug4Off = document.getElementById('Plug4_OFF');
    const plug5On = document.getElementById('Plug5_ON');
    const plug5Off = document.getElementById('Plug5_OFF');

    function executeCommand(button) {
        console.log(`%s ButtonPressed. Executing ws`, button);
        socket.emit('ButtonPressed', button);
    }

    socket.on('error', error => {
        console.log('Received error ws: ', error);
    })

    socket.on('commandOutput', (data) => {
        console.log('Command Output: ', data);
    })

    upButton.onclick = () => executeCommand("Up");
    pauseButton.onclick = () => executeCommand("Pause");
    downButton.onclick = () => executeCommand("Down");

    lightPowerButton.onclick = () => executeCommand("LightPower");
    fanPower.onclick = () => executeCommand("FanPower");
    fanHigh.onclick = () => executeCommand("High");
    fanMedium.onclick = () => executeCommand("Medium");
    fanLow.onclick = () => executeCommand("Low");
  
    // Attach event listeners to OutletPlugs buttons
    plug1On.onclick = () => executeCommand("Plug1_ON");
    plug1Off.onclick = () => executeCommand("Plug1_OFF");
    plug2On.onclick = () => executeCommand("Plug2_ON");
    plug2Off.onclick = () => executeCommand("Plug2_OFF");
    plug3On.onclick = () => executeCommand("Plug3_ON");
    plug3Off.onclick = () => executeCommand("Plug3_OFF");
    plug4On.onclick = () => executeCommand("Plug4_ON");
    plug4Off.onclick = () => executeCommand("Plug4_OFF");
    plug5On.onclick = () => executeCommand("Plug5_ON");
    plug5Off.onclick = () => executeCommand("Plug5_OFF");
});
