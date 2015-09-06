var express = require('express');
var router = express.Router();
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var config = {
  userName: 'stswing@mun9e1kfb3',
  password: 'Sts502507',
  server: 'mun9e1kfb3.database.windows.net',

  // If you're on Windows Azure, you will need this:
  options: {
    encrypt: true,
    database: 'stsprediction',
    rowCollectionOnRequestCompletion: true
  }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/linkinfo', function(req, res, next) {
  var connection = new Connection(config);

  connection.on('connect', function(err) {
      if(err) {
        console.log(err);
        return;
      }
      // If no error, then good to go...
      linkinfo(connection, res);
    }
  );

  // connection.on('debug', function(text) {
  //   console.log(text)
  // });
});

function linkinfo(connection, res) {
  var request = new Request("SELECT * FROM LINKINFO;", function(err, rowCount, rows) {
    if (err) {
      console.log(err);
    } else {
      console.log(rowCount + ' rows');
      debugger
      res.json(rows);
    }
    connection.close();
  });

  // request.on('row', function(columns) {
  //   var result = {};
  //   columns.forEach(function(column) {
  //     result[column.metadata.colName] = column.value;
  //   });
  //   console.log(result);
  // });

  connection.execSql(request);
}

module.exports = router;
