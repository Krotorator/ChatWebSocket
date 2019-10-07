const WebSocket = require("ws");
const uuidv1 = require("uuid/v1");

const server = new WebSocket.Server({ port: 9020 });
const users = {
    type: "allUsers",
    allUsers: {
        list: []
    }
};

server.on("connection", function connection(ws) {
    if (users.allUsers.list.length) {
        ws.send(JSON.stringify({ type: "forValidation", users: users.allUsers.list }));
    }
    ws.on("message", function(message) {
        const messageBody = JSON.parse(message);
        // console.log("message from client: ", messageBody);

        if (messageBody.type == "newUser") {
            console.log(messageBody);
            messageBody.data.img = "http://s1.iconbird.com/ico/2013/3/637/w128h12813939683291.png";
            ws.user = messageBody.data;
            users.allUsers.list.push(ws.user);
            console.log(users.allUsers.list);

            server.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageBody));
                    client.send(JSON.stringify(users));
                }
            });
        } else if (messageBody.type == "message") {
            server.clients.forEach(function each(client) {
                if (/* client !== ws && */ client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ messageBody, client: ws.user }));
                }
            });
        } else if (messageBody.type == "img") {
            server.clients.forEach(function each(client) {
                if (/* client !== ws && */ client.readyState === WebSocket.OPEN) {
                    ws.user.img = messageBody.data;
                    client.send(JSON.stringify({ messageBody, client: ws.user }));
                }
            });
        }
    });

    ws.on("close", e => {
        users.allUsers.list.forEach(function(user, i) {
            if (ws.user && user.name == ws.user.name) {
                users.allUsers.list.splice(i, 1);
                console.log(i);
            }
        });
        server.clients.forEach(function each(client) {
            client.send(JSON.stringify(users));
        });
    });
});
