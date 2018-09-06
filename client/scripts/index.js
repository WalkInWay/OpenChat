'use strict'

let socket = {}

window.addEventListener('load', function () {
  connect()
  registerSender()
})

async function connect () {
  const statusNode = document.getElementById('connect')

  setInterval(() => {
    if (![0, 1].includes(socket.readyState)) {
      socket = new WebSocket('ws://localhost:10000')
      socket.registered = false
      statusNode.innerText = '✗'
      statusNode.title = 'Подключение отсутствует'
      statusNode.classList.remove('connected')
    } else if (socket.readyState === 1) {
      if (!socket.registered) {
        socket.registered = true
        statusNode.classList.add('connected')
        statusNode.title = 'Всё хорошо. Вы онлайн'
        statusNode.innerText = '✓'

        socket.addEventListener('message', event => writeMessage(event.data))
      }
    }
  }, 200)
}

function registerSender () {
  const senderNode = document.getElementById('sender')
  const newMessageNode = document.getElementById('new')

  newMessageNode.addEventListener('keypress', event => {
    if (event.keyCode !== 13 || event.shiftKey) return

    sendMessage(newMessageNode.value)
    newMessageNode.value = ''
    newMessageNode.focus()
    event.preventDefault()
  })
  senderNode.addEventListener('click', () => {
    sendMessage(newMessageNode.value)
    newMessageNode.value = ''
    newMessageNode.focus()
  })
}

function sendMessage (message) {
  message = message.trim()
  if (message && socket.readyState === 1) {
    socket.send(message)
  }
}

function writeMessage (data) {
  const messagesNode = document.getElementById('messages')
  const usersNode = document.getElementById('users')
  const {messages, users} = JSON.parse(data)

  while (usersNode.firstChild) usersNode.removeChild(usersNode.firstChild)
  while (messagesNode.firstChild) messagesNode.removeChild(messagesNode.firstChild)

  messages.forEach(message => {
    const newMessageNode = document.createElement('div')
    const authorNode = document.createElement('div')
    const textNode = document.createElement('div')

    newMessageNode.classList.add('message')
    authorNode.classList.add('author')
    textNode.classList.add('text')

    authorNode.innerText = message.author
    textNode.innerText = message.text

    newMessageNode.appendChild(authorNode)
    newMessageNode.appendChild(textNode)
    messagesNode.appendChild(newMessageNode)
  })

  users.forEach(user => {
    const newUserNode = document.createElement('div')

    newUserNode.classList.add('user')
    newUserNode.innerText = user.name
    usersNode.appendChild(newUserNode)
  })

  messagesNode.scrollTop = messagesNode.scrollHeight - messagesNode.offsetHeight
}
