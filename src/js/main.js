window.onload = function() {
    const Handlebars = require("handlebars");
    const ws = new WebSocket("ws://localhost:9020");

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

    // window.onload = function() {
    //     const chatBody = document.querySelector(".chat__body");
    //     chatUsers.classList.add("hidden");
    //     chatBody.classList.add("hidden");
    // };

    ws.onopen = function(e) {
        console.log("connection ok");

        let user = {
            list: []
        };
        let nicks = [];
        numberOfUsers.innerText = 0;
        ws.onmessage = function(message) {
            let messageBody = JSON.parse(message.data);
            let messageType = "";

            if (messageBody.type == "forValidation") {
                messageBody.users.forEach(user => {
                    nicks.push(user.nick);
                });
            } else if (messageBody.type == "newUser") {
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
                const date = new Date();
                let hours = timePlusZero(date.getHours());
                let minutes = timePlusZero(date.getMinutes());
                let time = `${hours}:${minutes}`;
                console.log(time);

                let img;
                let users = document.querySelectorAll("#userImg");
                for (const user of users) {
                    if (
                        user.parentElement.parentElement.dataset.nick == messageBody.client.datanick
                    ) {
                        img = user.src;
                    }
                }
                let userMessage = {
                    img: img,
                    nick: messageBody.client.nick,
                    message: messageBody.messageBody.data.message,
                    time: time
                };

                let newMessage = document.createElement("div");
                newMessage.setAttribute("id", "new-message");

                let messageExist = document.querySelector("#messages").lastElementChild;
                if (messageExist != null) {
                    if (
                        messageExist.firstElementChild.dataset.nick != userMessage.nick &&
                        messageExist.className != "right"
                    ) {
                        newMessage.classList.toggle("right");
                    } else if (messageExist.firstElementChild.dataset.nick == userMessage.nick) {
                        if (messageExist.className) {
                            newMessage.classList.add(messageExist.className);
                        }
                    }
                }

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
            console.log(nicks);
            if (nicks.length) {
                if (name.value && nick.value) {
                    let existNick;
                    nicks.forEach(nick => {
                        existNick = nick;
                    });
                    if (existNick && existNick === nick.value) {
                        nick.value = "";
                        nick.placeholder = "This nick is already occupied!";
                        nick.classList.add("placeholderred");
                    } else {
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
                    }
                } else if (!name.value && !nick.value) {
                    name.placeholder = "Please enter your name!";
                    name.classList.add("placeholderred");
                    nick.placeholder = "Please enter your nick!";
                    nick.classList.add("placeholderred");
                } else if (!name.value) {
                    if (name.value && existNick && existNick === nick.value) {
                        nick.value = "";
                        nick.placeholder = "This nick is already occupied!";
                        nick.classList.add("placeholderred");
                    } else {
                        name.placeholder = "Please enter your name!";
                        name.classList.add("placeholderred");
                    }
                } else if (!nick.value) {
                    if (nick.value && existNick && existNick === nick.value) {
                        nick.value = "";
                        nick.placeholder = "This nick is already occupied!";
                        nick.classList.add("placeholderred");
                    } else {
                        nick.placeholder = "Please enter your nick!";
                        nick.classList.add("placeholderred");
                    }
                }
            } else {
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
            }
            authClose.addEventListener("click", () => {
                authWindow.style.display = "none";
            });
        };

        messageSend.onclick = function(e) {
            e.preventDefault();
            if (chatMessage.value) {
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
                chatMessage.placeholder = "Enter message...";
                chatMessage.classList.remove("placeholderred");
            } else {
                chatMessage.placeholder = "Please enter your message!";
                chatMessage.classList.add("placeholderred");
            }
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

        function timePlusZero(i) {
            if (i < 10) {
                i = "0" + i;
            } else {
                i = i;
            }
            return i;
        }
    };
};
