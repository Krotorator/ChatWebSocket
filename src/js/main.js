const Handlebars = require("handlebars");
const ws = new WebSocket("ws://localhost:9000");

const authWindow = document.querySelector("#auth");
const authForm = document.forms.auth;
const name = authForm.name;
const nick = authForm.nick;
const authSend = document.querySelector("#login");
const authClose = document.querySelector(".auth__close");

const chatUsers = document.querySelector("#users");
const chatMessages = document.querySelector("#messages");
const chatMessage = document.querySelector("#message");
const messageSend = document.querySelector("#messageSend");

const numberOfUsers = document.querySelector(".chat__usersNum span");

const avatarPopup = document.querySelector(".avatarPopup");
const avatarPopupName = document.querySelector(".avatarPopup__userName");
const avatarPopupLoadImg = document.querySelector(".avatarPopup__icon-link");
const avatarPopupClose = document.querySelector("#avatarPopupClose");

const loadPopup = document.querySelector(".loadPopup");
const imgDropArea = document.querySelector(".loadPopup__dropArea");
const dropImg = document.querySelector("#dropImg");

ws.onopen = function(e) {
    console.log("connection ok");
};

let user = {
    list: []
};
numberOfUsers.innerText = 0;
ws.onmessage = function(message) {
    let messageBody = JSON.parse(message.data);
    let messageType = "";

    if (messageBody.type == "newUser") {
        user.list.push({
            img: "http://s1.iconbird.com/ico/2013/3/637/w128h12813939683291.png",
            name: messageBody.data.name,
            nick: messageBody.data.nick
        });

        var source = document.getElementById("user-template").innerHTML;
        var template = Handlebars.compile(source);
        var context = user;
        var html = template(context);
        chatUsers.innerHTML = html;
    } else if (messageBody.messageBody && messageBody.messageBody.type == "message") {
        let img;
        let users = document.querySelectorAll("#userImg");

        for (const user of users) {
            if (user.parentElement.parentElement.dataset.nick == messageBody.client.datanick) {
                img = user.src;
            }
        }

        let userMessage = {
            img: img,
            nick: messageBody.client.nick,
            message: messageBody.messageBody.data.message
        };
        let newMessage = document.createElement("div");
        newMessage.setAttribute("id", "new-message");
        chatMessages.append(newMessage);

        const source = document.getElementById("message-template").innerHTML;
        const template = Handlebars.compile(source);
        const context = userMessage;
        const html = template(context);
        newMessage.innerHTML = html;
    } else if (messageBody.type == "allUsers") {
        let usersForCounter = document.querySelector("#users");
        numberOfUsers.innerText = parseInt(messageBody.allUsers.list.length);
        console.log(numberOfUsers.innerText);

        const source = document.getElementById("user-template").innerHTML;
        const template = Handlebars.compile(source);
        var context = messageBody.allUsers;
        var html = template(context);
        chatUsers.innerHTML = html;
    } else if (messageBody.messageBody.type == "img") {
        let currentUsers = document.querySelectorAll(
            `[data-nick="${messageBody.client.datanick}"]`
        );

        for (const user of currentUsers) {
            user.querySelector("img").setAttribute("src", messageBody.messageBody.data);
        }

        let serverNick = messageBody.client.nick;
        let serverName = messageBody.client.name;
        [...chatUsers.children].forEach(user => {
            let clientNick = user.lastElementChild.lastElementChild.innerText;
            let clientName = user.lastElementChild.firstElementChild.innerText;
            if (clientNick == serverNick && clientName == serverName) {
                user.firstElementChild.firstElementChild.src = messageBody.messageBody.data;
            }
        });
    }
    chatUsers.onclick = function(e) {
        if (e.target.classList.contains("user__img")) {
            avatarPopup.style.display = "block";
            avatarPopupName.innerText =
                e.target.parentElement.nextElementSibling.firstElementChild.innerText;
            avatarPopupClose.onclick = () => {
                avatarPopup.style.display = "none";
            };
        }
    };
};

authSend.onclick = function(e) {
    e.preventDefault();
    ws.send(
        JSON.stringify({
            type: "newUser",
            data: {
                name: name.value,
                nick: nick.value,
                datanick: nick.value
            }
        })
    );
    name.value = "";
    nick.value = "";
    authWindow.style.display = "none";
};

authClose.addEventListener("click", () => {
    authWindow.style.display = "none";
});

messageSend.onclick = function(e) {
    e.preventDefault();
    ws.send(
        JSON.stringify({
            type: "message",
            data: {
                // img: usersImgs,
                message: chatMessage.value
            }
        })
    );
    chatMessage.value = "";
};

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    imgDropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

avatarPopupLoadImg.addEventListener("click", () => {
    loadPopup.style.display = "block";
});

["dragenter", "dragover"].forEach(eventName => {
    imgDropArea.addEventListener(eventName, () => {
        imgDropArea.classList.add("highlight");
    });
});

["dragleave", "drop"].forEach(eventName => {
    imgDropArea.addEventListener(eventName, () => {
        imgDropArea.classList.remove("highlight");
    });
});

let avatar;

imgDropArea.addEventListener("drop", e => {
    let dt = e.dataTransfer;
    dropImg.src = window.URL.createObjectURL(dt.files[0]);

    let reader = new FileReader();
    reader.readAsDataURL(dt.files[0]);
    reader.onload = () => {
        avatar = reader.result;
    };
});

loadPopupCancel.onclick = () => {
    loadPopup.style.display = "none";
    avatarPopup.style.display = "none";
};

loadPopupLoad.onclick = () => {
    loadPopup.style.display = "none";
    avatarPopup.style.display = "none";

    ws.send(JSON.stringify({ type: "img", data: avatar }));
};
