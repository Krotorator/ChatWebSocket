import '../scss/index.scss';
import tusers from '../views/users.hbs';
const ws = new WebSocket('ws://localhost:9001');
const handlers = {
    getUsers: function (data) {
        console.log(data);
        document.querySelector('.container').innerHTML = tusers({ users: data })
    },
    newUser(data) {
        console.log(data);
    },
    upload: function (data) {
        const users = document.querySelectorAll(`[data-id="${data.id}"]`);

        for (const user of users) {
            user.querySelector('img').setAttribute('src', data.img);
        }
    }
}
ws.onopen = function (event) {
    console.log(event)
}

ws.onerror = function (event) {
    console.log(event)
}

ws.onmessage = function (message) {
    console.log(message)
    const messageData = JSON.parse(message.data);
    handlers[messageData.payload](messageData.data)

}

const send = document.querySelector('button');
const email = document.querySelector('#login');
const pass = document.querySelector('#pass');

send.addEventListener('click', () => {
    ws.send(JSON.stringify({
        payload: 'newUser',
        data: {
            email: email.value,
            password: pass.value
        }
    }))
})
var target = document.querySelector('.container');
const config = {
    attributes: true,
    childList: true,
    subtree: true
};

const observer = new MutationObserver(() => {
    const files = document.querySelector('#file');
    const upload = document.querySelector('#upload');

    upload.addEventListener('click', () => {
        const file = files.files[0];
        const fileReader = new FileReader();

        fileReader.readAsDataURL(file);

        fileReader.onload = function (e) {
            ws.send(JSON.stringify({
                payload: 'upload',
                data: {
                    name: file.name,
                    base64: e.target.result
                }
            }))
        };

    })
});

// Начинаем наблюдение за настроенными изменениями целевого элемента
observer.observe(target, config);