'use strict'

let manual = {
    nick : "NICK is a command to set a nickname on the server, requires one parameter: the nickname (example: /nick mynickname)",
    online: "ONLINE is a command to list every online user on the server, optional parameter the listitem's mark (example: /online - {gives a list with listmark '-' instead of the original listmark '*'})",
    priv: "PRIV is a command to send private message to an online client, requires two parameters the first is to whom it should send, and from the second parameter, the message (example: /priv nickname random text what is the message {sends: <nickname> random text what is the message})",
    yes: "YES is a command answering the login question (example: /yes)",
    all: "ALL is a command to list every valid command on the server, optinal parameter the listitem mark seen as in ONLINE",
    man: "MAN is a command to get the 'manual' for the requiested command, requires one parameter: the name of the wanted command (example: /man all {gives the manual for the 'all' command})",
    serverInfo: "in this server you can chat in a public chatroom \r\nyou need to set a nickname first: use the /nick yournickname formula \r\nto give a command use the '/' start and the command's name \r\n"
};


const net = require('net');
const fs =  require('fs');

const server = net.createServer();
let clients = [];

function sendMsgToAll (nickname, msg) {
    clients.forEach(function (clientSocket) {
        if (clientSocket.nickname === nickname) {

        }
        else if (clientSocket.nickname) {
            clientSocket.write(`<${nickname}> ${msg}\r\n`);
        }
    })
    console.log(`<${nickname}> : ${msg}`);
}

server.on('connection', function (socket) {

    const commands = {
        nick: function (name) {
            if (!name) {
                return false;
            }
            socket.nickname = name;
            console.log(`nick set to <${name}>`);
            socket.write(`your nickname is: <${name}> \r\nnow you can chat with everyone\r\n`);
            return true;
        },
        online: function (listitem) {
            listitem = listitem || '*';
            clients.forEach(function (clientSocket) {
                console.log(clientSocket.nickname);
                socket.write(`${listitem} ${clientSocket.nickname}\r\n`);
            })
        },
        priv: function (address, privMsg) {
            const privAdress = clients.filter(function (clientSocket) {
                return clientSocket.nickname === address;
            })
            if (privAdress.length >0) {
                console.log(`PRIVATE: <${socket.nickname}> => <${address}> : ${privMsg}\r\n`);
                privAdress[0].write(`PRIVATE: <${socket.nickname}> : ${privMsg}\r\n`);
            }
            else {
                console.log(`<${socket.nickname}> : ERROR: unrecognised username\r\n`);
                socket.write('ERROR: unrecognised username\r\n');
            }
        },
        yes: function () {
            console.log(`<${socket.nickname}> : then get one, moron!\r\n`);
            socket.write(`then get one, moron!\r\n`)
        },
        all: function (listitem) {
            listitem = listitem || '*';
            Object.keys(commands).forEach(function (actualCommand) {
                socket.write(`${listitem} ${actualCommand}\r\n`);
            })
        },
        man: function (key) {
            if (!manual.hasOwnProperty(key)) {
                console.log(`<${socket.nickname}> : ERROR: unrecognised command, you should choose one from the commands (/all)\r\n`);
                socket.write('ERROR: unrecognised command, you should choose one from the commands (/all)\r\n');
                return;
            }
            socket.write(manual[key]);
        }
    };

    socket.nickname = false;
    clients.push(socket);
    console.log(`<${socket.remoteAddress}:${socket.remotePort}> has joined`);
    console.log('clientcount: ' + clients.length);

    socket.write('Do You want to get a pet snake?\r\nto more info type (/man serverInfo)\r\n');

    socket.on('data', function (data) {
        const msg = data.toString().trim();
        if (msg) {
            if (msg.charAt(0) === '/') {
                const params = msg.substr(1).split(' ');
                if (params[0] === 'yes') {
                    commands.yes();
                    return;
                }
                if (params[0] === 'priv') {
                    if (params.length < 2) {
                        console.log(`<${socket.nickname}> : ERROR: priv needs two parameters!\r\n`);
                        socket.write('ERROR: priv needs two parameters!\r\n');
                        return;
                    }
                    const commandName = params.shift();
                    const address = params.shift();
                    const privMsg = params.join(' ');
                    commands.priv(address, privMsg);
                    return;
                }
                if (params[0] === 'man' && params.length <= 1) {
                    console.log(`<${socket.nickname}> : ERROR: invalid command param, you should choose one from the commands (/all)\r\n`);
                    socket.write('ERROR: invalid command param, you should choose one from the commands (/all)\r\n');
                    return;
                }
                else if (params.length > 0 && commands.hasOwnProperty(params[0])) {
                    const commandName = params.shift();
                    const result = commands[commandName].apply(commands, params);
                    if (!result && commandName !== 'online' && commandName !== 'all' && commandName !== 'man') {
                        console.log(`<${socket.nickname}> : ERROR: invalid command param\r\n`);
                        socket.write('ERROR: invalid command param, you should look it up in the manual (/man nick)\r\n');
                    }
                }
                else {
                    console.log(`<${socket.nickname}> : ERROR: unrecognised command, you should choose one from the commands (/all)\r\n`);
                    socket.write('ERROR: unrecognised command, you should choose one from the commands (/all)\r\n');
                }
            } else {
                if (!socket.nickname) {
                    console.log(`<${socket.nickname}> : ERROR: no nick set, it requires a ( /nick yourNickanme ) form, try again, mate!\r\n`);
                    socket.end('ERROR: no nick set, it requires a ( /nick yourNickanme ) form, try again, mate!\r\n');
                    return;
                }
                sendMsgToAll(socket.nickname, msg);
            }
        }
    })

    socket.on('close', function () {
        clients = clients.filter(function (clientSocket) {
            return socket !== clientSocket;
        })
        if (socket.nickname) {
            console.log(`<${socket.nickname}> : has left`);
        }
        else {
            console.log('client has left');
        }
    })
});

server.listen(3000);
