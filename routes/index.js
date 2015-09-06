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

/* query */
function query(res, queryStr) {
  var connection = new Connection(config);
  connection.on('connect', function(err) {
      if(err) {
        console.log(err);
        return;
      }
      var request = new Request(queryStr, function(err, rowCount, rows) {
        if (err) {
          console.log(err);
        } else {
          console.log(rowCount + ' rows');
          var result = rows.map(function(row) {
            var obj = {};
            row.forEach(function(val) {
              obj[val.metadata.colName] = val.value;
            })
            return obj;
          });
          res.json(result);
        }
        connection.close();
      });
      connection.execSql(request);
    }
  );
}

router.get('/linkinfo', function(req, res, next) {
  query(res, "SELECT * FROM LINKINFO;");
});

router.get('/linkspeed_distict', function(req, res, next) {
  query(res, "SELECT DISTINCT CDATE, CTIME FROM LINKSPEED ORDER BY CDATE DESC, CTIME DESC;");
});

module.exports = router;
