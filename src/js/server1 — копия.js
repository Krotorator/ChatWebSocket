const WebSocket = require("ws");
const uuidv1 = require("uuid/v1");

const wss = new WebSocket.Server({ port: 8080 });
const users = {};

const handlers = {
    newUser: function newUser(data, ws) {
        ws.userData = data;
        users[uuidv1()] = ws;

        const allUsers = [];

        for (const id in users) {
            if (users.hasOwnProperty(id)) {
                // allUsers.push(users[id].userData);
                users[id].send(
                    JSON.stringify({
                        type: "newUser",
                        data: ws.userData
                    })
                );
            }
        }

        ws.send(
            JSON.stringify({
                type: "getUsers",
                data: allUsers
            })
        );
    }
};

wss.on("connection", function connection(ws) {
    ws.on("message", function(event) {
        const message = JSON.parse(event);
        handlers[message.type](message.data, ws);
    });
});
