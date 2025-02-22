const socket = io(); // Connect to the server

document.addEventListener('DOMContentLoaded', async function () {
    
    const buttons = document.querySelectorAll('.remote-button');

    const buttonsContainer = document.getElementById('buttons-container');

    try {
        const response = await fetch('remotes2.json');
        const config = await response.json();

        for (const category in config) {
            if (category === "Groups" || category === "Macros") continue; // skip special groups
            
            const section = document.createElement('div');
            section.innerHTML = `<h2>${category.replace(/([A-Z])/g, ' $1')}</h2>`;
            for (const buttonName in config[category]) {
                const button = document.createElement('button');
                button.classList.add('remote-button');
                button.dataset.command = buttonName;
                button.textContent = buttonName.replace(/([A-Z])/g, ' $1'); // Format button name
                button.addEventListener('click', () => {
                    console.log(`Button pressed: ${buttonName}`);
                    socket.emit('ButtonPressed', buttonName);
                });
                section.appendChild(button);
            }

            buttonsContainer.appendChild(section);
        }
        
        // Add group buttons
        if (config.Groups) {
            const groupSection = document.createElement('div');
            groupSection.innerHTML = `<h2>Groups</h2>`;
            
            for (const groupName in config.Groups) {
                const button = document.createElement('button');
                button.classList.add('remote-button');
                button.dataset.command = groupName;
                button.textContent = groupName.replace(/([A-Z])/g, ' $1');
                button.addEventListener('click', () => {
                    console.log(`Group button pressed: ${groupName}`);
                    socket.emit('ButtonPressed', groupName);
                });
                groupSection.appendChild(button);
            }
            buttonsContainer.appendChild(groupSection);
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }

    socket.on('error', error => {
        console.log('Received error ws: ', error);
    })

    socket.on('commandOutput', (data) => {
        console.log('Command Output: ', data);
    })

});
