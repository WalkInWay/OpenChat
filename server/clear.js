const mysql = require('mysql')

const dbConnection = mysql.createConnection({
  host: '138.68.95.178',
  user: 'chat_user',
  password: 'chat_pass'
})

dbConnection.connect(function (err) {
  if (err) throw err
})

const checkError = error => { if (error) throw error }

dbConnection.query('DELETE FROM openchat.users', checkError)
dbConnection.query('DELETE FROM openchat.messages', checkError)

console.log('ok')
