var mysql = require('mysql');

//configuring database
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'AKILAN1999',
  database: 'shared_electricity'
});

//Checks if the connection is succesful
connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected...')
});

exports.connection = connection;
