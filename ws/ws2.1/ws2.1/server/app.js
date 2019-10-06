const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const wss = new WebSocket.Server({ port: 9001 });
const users = {};
const handlers = {
    newUser: function (data, ws) {
        const id = uuidv1();
        data.id = id
        ws.userData = data;
        users[id] = ws;

        const allUsers = [];

        for (const id in users) {
            if (users.hasOwnProperty(id)) {
                allUsers.push(users[id].userData);
                users[id].send(JSON.stringify({
                    payload: 'newUser',
                    data: ws.userData
                }))
            }
        }

        ws.send(JSON.stringify({
            payload: 'getUsers',
            data: allUsers
        }));
    },
    upload: function (data, ws) {
        ws.userData.img = data.base64;

        for (const id in users) {
            if (users.hasOwnProperty(id)) {
                users[id].send(JSON.stringify({
                    payload: 'upload',
                    data: ws.userData
                }))
            }
        }
    }
}

wss.on('connection', function (ws) {
    ws.on('message', function (event) {
        const message = JSON.parse(event);

        handlers[message.payload](message.data, ws);
    })
});

server.listen(9000);


