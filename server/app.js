const {
  whileAlive,
  getMessagesUsers,
  getOnlineUsers,
  connectToChatServer,
  sendToAll
} = require('./lesson.js')

// Начинается урок…

const chatServer = connectToChatServer()

chatServer.on('connection', connection => {
  connection.on('message', message => sendToAll(message))

  whileAlive(connection, async function () {
    connection.send(JSON.stringify({
      users: await getOnlineUsers(),
      messages: await getMessagesUsers()
    }))
  })
})
