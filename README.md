# Rotrics Studio for DexArm - Build development environment
Based on the original RotricsStudio App instructions.

## 1.Installation and configuration
These instruction apply to a VM Linux development environment running Ubuntu 20.04
on a Windows 10 host. Using atom as IDE.
0. Update your repositories (sudo apt update)
1. Install java (sudo apt install openjdk-17-jre-headless)
2. Install python 2.7 (sudo apt install python2)
3. Install node.js (>=14.1.0) and npm (sudo apt install nodejs npm). Check your
nodejs version (node -v). If it is not >14.1, run the following one by one:
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
4. Install atom (see here: https://linuxize.com/post/how-to-install-atom-text-editor-on-ubuntu-20-04/)

## 2.Setup repositories on your local machine
```bash
# clone repositories
Use atom to clone each repository on the following list. To use github in atom,
bring up the commands palette (ctrl-shft-P). Search for "clone", select "clone from github" and enter URL.
You should end up with all the repositories loaded inside your project.
Repository 1: https://github.com/commacmms/rotrics-studio-app.git
Repository 2: https://github.com/commacmms/rotrics-scratch-vm.git
Repository 3: https://github.com/commacmms/rotrics-scratch-blocks.git

Go to the project root on a terminal window (mine is ~/github):

cd ~/github/rotrics-scratch-vm
npm install
sudo npm link

cd ~/github/rotrics-scratch-blocks
npm install
sudo npm link

cd ~/github/rotrics-studio-app/server
npm install

cd ~/github/rotrics-studio-app/web
mkdir build-web
mkdir build-web/i18n
cp index.html build-web
npm install

There's some issues with serialport when npm tries to fetch, just do the following:
curl -L https://github.com/serialport/node-serialport/releases/download/%40serialport%2Fbindings%409.2.8/bindings-v9.2.8-electron-v89-linux-x64.tar.gz -o prebuilds/bindings-v9.2.8-electron-v76-linux-x64.tar.gz

mv and rename the file you just downloaded to the location after the @ on the following line of the error you
get when you do npm install

looking for cached prebuild @ ~/.npm/_prebuilds/009c6f-bindings-v9.2.8-electron-v76-linux-x64.tar.gz

mv bindings-v9.2.8-electron-v76-linux-x64.tar.gz ~/.npm/_prebuilds/009c6f-bindings-v9.2.8-electron-v76-linux-x64.tar.gz

cd ~/github/rotrics-studio-app/electron
npm install

npm run rebuild
```

## 3. Others
Compile rotrics-scratch-blocks：  
for mac: npm run prepublish-mac  
for win: npm run prepublish-win  

## 4.Run in the development environment
```bash
cd rotrics-studio-app/server
npm start

cd rotrics-studio-app/web
npm start

IF everything is normal, you will be able to see the page that is displayed at
http://localhost:8080
You will see a page that says "Loading..."
```

## 5. Run in electron enviroment
```bash
cd rotrics-studio-app/server
npm run build

cd rotrics-studio-app/web
npm run build

cd rotrics-studio-app/electron
npm start
# If the serialport version does not correspond to the electron node version, execute
npm run rebuild
```

## 6.Electron packaging
```bash
cd rotrics-studio-app/electron
#for mac:
npm run build:mac-x64

#for win:
npm run build:win-x64
```

# Brief description of project structure
Including three sub-projects, all of which are node projects
### web
In the front-end part, "index.html+js+resource" is obtained after build, and loadFile(index.html) is executed when electron is running
### server
local server, provides http api and socket connection to the web side, and then accesses the native layer
### electron
When running in the web, the local server uses the specified address: http://localhost:9000
When electron is running, it dynamically obtains the port and hangs the local server address under the window
Convenient for web access, never establish socket connect and use http api
When electron executes main.js, it starts the local server first, and then loads the index.html obtained by the web-side build after success.

## Precautions
node: >=14.1.0
electron: >=9.0.0
serialport: >=9.0.0

If it prompts that the serialport version does not correspond to the electron node version, please execute: npm run rebuild
The serialport that electron depends on must correspond to the version of electron node, so rebuild is required
The dependencies in the package.json of electron and server need to be consistent
Under electron, you must use npm instead of cnpm to install node_modules

Make sure the contents of the two files are consistent: server/src/constants.js and web/src/constants.js
