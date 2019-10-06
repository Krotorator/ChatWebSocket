import '../scss/index.scss';
import tusers from '../views/users.hbs';

const ws = new WebSocket('ws://localhost:5000');
const handlers = {
    getUsers: function (data) {
        console.log(data);
        document.querySelector('.container').innerHTML = tusers({ users: data })
    },
    newUser(data) {
        console.log(data);
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