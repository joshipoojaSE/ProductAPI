const sql = require('mssql');

// SQL SERVER
const Pool = new sql.ConnectionPool({
    user: 'sa',
    password: '5425',
    server: 'localhost', 
    database: 'ProductDB',
    options: {
      encrypt: false, // Use this if you're on Windows Azure,
      enableArithAbort: true
    }
})

var Toggle = {
  // Error mode in text file
    ErrorLogMode: true
  }

module.exports = {
   Toggle, Pool
}