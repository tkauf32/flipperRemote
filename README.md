## Running
node app.js

Create a systemd service file:
```bash
sudo nano /etc/systemd/system/flipperremote.service 
```

```bash
[Unit]
Description=Flipper Remote Node.js App
After=network.target

[Service]
ExecStart=/usr/bin/node /home/tommy/flipperRemote/app/app.js
WorkingDirectory=/home/pi/flipperRemote/app
Restart=always
User=pi
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable flipperremote
sudo systemctl start flipperremote
sudo systemctl status flipperremote
```

## Feature list
- button learning feature where you can create new buttons off of sequential button clicks"
    - show the list of commands
    - confirm that you want to add the button
    - give the button a name 

- flipper add remote learning feature
    - user selects add new remote & gives it a name
    - user inputs remote type -- subghz or ir  (so we know which cli command to execute)
    - if subghz, input the frequency. If IR, input the type (ideally NEC)    (subghz rx --~=-~=~-)
    - press the button, give user feedback you read it (maybe text box with serial output). 
    - automatically parse the output, put it into the remote command configuration, and ask user if they want to save this button yes or no. Allow them to name the button here. 
    - button is saved to flipper configuration file and written to the flipper in a directory linked to the command so it can be executed later. 


- refresh the flipper connection to the serial port automatically 

- Somehow implement a lightweight, extremely low power, universal sensor (like a light / noise sensor) that can provide feedback for state management. This way, you can use all your remotes, digital and physical, to monitor the state of your devices. 

- 
