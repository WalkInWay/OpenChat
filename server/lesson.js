/**
 * Имя пользователя
 * @type {string}
 * @const
 */
const LOGIN = 'Пятнистый кот'

// подключение зависимостей
const http = require('http')
const fs = require('fs')
const path = require('path')
const WebSocket = require('ws')
const mysql = require('mysql')

/**
 * Получить со=держимое текстового файла по пути.
 * @param url
 * @return {Promise}
 */
function getFileByUrl (url) {
  const filePath = path.extname(url)
    ? path.join(__dirname, '../client/', url)
    : path.join(__dirname, '../client/', url, 'index.html')

  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        fs.readFile(filePath, {encoding: 'utf-8'}, (err, data) => {
          if (err) reject(new Error())
          resolve(data)
        })
      } else {
        reject(new Error())
      }
    })
  })
}

const httpServer = http.createServer(function (req, res) {
  getFileByUrl(req.url)
    .then(str => {
      res.writeHead(200, {'Content-Type': /\.css$/.test(req.url) ? 'text/css' : 'text/html'})
      res.write(str)
      res.end()
    })
    .catch(() => {
      res.writeHead(404, {'Content-Type': 'text/html'})
      res.write('404 =(')
      res.end()
    })
})
httpServer.listen(8000)

const dbConnection = mysql.createConnection({
  host: '138.68.95.178',
  user: 'chat_user',
  password: 'chat_pass'
})

dbConnection.connect(function (err) {
  if (err) throw err
})

const checkError = error => { if (error) throw error }

/**
 * Создаёт подключение к чат серверу
 * @return {WebSocketServer}
 */
function connectToChatServer () {
  const socketServer = http.createServer().listen(10000)

  console.log('Вы онлайн')
  setInterval(checkMyOnline, 2000)

  return new WebSocket.Server({server: socketServer})
}

/**
 * Отмечает пользователя, что он онлайн.
 */
function checkMyOnline () {
  dbConnection.query('INSERT INTO openchat.users SET ?', {name: LOGIN}, error => {
    if (error) dbConnection.query('UPDATE openchat.users SET ? WHERE name = ?', [{last: new Date()}, LOGIN], checkError)
  })
}

async function getOnlineUsers () {
  const onlineDate = new Date()
  onlineDate.setSeconds(onlineDate.getSeconds() - 5)

  return new Promise((resolve, reject) => {
    dbConnection.query(
      'SELECT * FROM openchat.users WHERE last >= ? ORDER BY name',
      onlineDate,
      (error, result) => error ? reject(error) : resolve(result)
    )
  })
}

async function getMessagesUsers () {
  const onlineDate = new Date()
  onlineDate.setSeconds(onlineDate.getSeconds() - 5)

  return new Promise((resolve, reject) => {
    dbConnection.query(
      'SELECT * FROM openchat.messages ORDER BY id DESC LIMIT 50',
      (error, result) => error ? reject(error) : resolve(result.reverse())
    )
  })
}

function sendToAll (message) {
  dbConnection.query(
    'INSERT INTO openchat.messages SET ?',
    {author: LOGIN, text: message},
    checkError
  )

  console.log(`Рассылка >>> ${LOGIN}: ${message}`)
}

/**
 * Выполняет функцию, пока открыто соединение
 * @param {WebSocket} connection
 * @param {Function} callback
 */
function whileAlive (connection, callback) {
  const timer = setInterval(() => {
    if (connection.readyState !== 1) {
      clearInterval(timer)
      return
    }

    callback()
  }, 1000)
}

console.log('Сервер запущен!')
console.log('=(^.^)=')
console.log('http://localhost:8000')
console.log('')

module.exports = {
  whileAlive,
  getMessagesUsers,
  getOnlineUsers,
  connectToChatServer,
  sendToAll
}
