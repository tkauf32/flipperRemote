const socket = io(); // Connect to the server

document.addEventListener('DOMContentLoaded', async function () {
    
    const buttonsContainer = document.getElementById('buttons-container');

    try {
        const response = await fetch('remotes2.json');
        const config = await response.json();

        for (const remote in config) {
            if (remote === "Groups" || remote === "Macros") continue; // skip special groups
            
            const section = document.createElement('div');
            section.innerHTML = `<h2>${remote}</h2>`;

            for (const command in config[remote]) {
                const button = document.createElement('button');
                button.classList.add('remote-button');
                button.dataset.remote = remote;
                button.dataset.command = command;
                button.textContent = command.replace(/([A-Z])/g, ' $1'); // Format button name
                
                button.addEventListener('click', () => {
                    console.log(`Button pressed: ${remote} -> ${command}`);
                    socket.emit('ButtonPressed', {remote, command});
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

                button.dataset.remote = 'Groups';
                button.dataset.command = groupName;
                button.textContent = groupName.replace(/([A-Z])/g, ' $1');
                button.addEventListener('click', () => {
                    console.log(`Group button pressed: ${groupName}`);
                    socket.emit('ButtonPressed', { remote: 'Groups', command: groupName });
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
