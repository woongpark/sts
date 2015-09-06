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
function query(queryStr, callback) {
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
          if(typeof callback == "function") {
            callback(result);
          } else {
            callback.json(result);
          }
        }
        connection.close();
      });
      connection.execSql(request);
    }
  );
}

router.get('/linkinfo', function(req, res, next) {
  query("SELECT * FROM LINKINFO;", res);
});

router.get('/latest_time', function(req, res, next) {
  query("SELECT DISTINCT TOP 1 CDATE, CTIME FROM LINKSPEED ORDER BY CDATE DESC, CTIME DESC;", res);
});


router.get('/linkspeed_latest', function(req, res, next) {
  var str = "SELECT DISTINCT PDATE, PTIME FROM LINKSPEED WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "';";
  query(str, res);
});

router.get('/linkspeed_map', function(req, res, next) {
  var str = "SELECT LINKID, PSPEED, DIRECTION FROM LINKSPEED WHERE PDATE='" + req.query.PDATE + "' AND PTIME='" + req.query.PTIME + "';";
  query(str, res);
});

router.get('/linkspeed_graph', function(req, res, next) {
  var str = "SELECT PTIME, PSPEED FROM LINKSPEED WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "' AND LINKID='" + req.query.LINKID + "' AND DIRECTION='" + req.query.DIRECTION + "';";
  console.log(str);
  query(str, res);
});

module.exports = router;
