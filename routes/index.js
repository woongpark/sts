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
  res.render('about', { title: 'Real Time Traffic Prediction v.02' });
});

router.get('/speed', function(req, res, next) {
  res.render('speed', { title: 'Speed Prediction' });
});

router.get('/rutp', function(req, res, next) {
  res.render('rutp', { title: 'Route Prediction' });
});

router.get('/sim', function(req, res, next) {
  res.render('sim', { title: 'Simulation and Control' });
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

function queryArray(queryStr, callback) {
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
          var headers = rows[0].map(function(val) {
            return val.metadata.colName;
          });
          var data = rows.map(function(row) {
            return row.map(function(val) {
              return val.value.toString().trim();
            });
          });
          var result = {
            headers: headers,
            data: data
          };
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
  query("SELECT DISTINCT TOP 1 CDATE, CTIME FROM LINKSPEED ORDER BY CDATE DESC, CTIME;", res);//가장 처음의 CTIME 뽑기
  //query("SELECT DISTINCT TOP 1 CDATE, CTIME FROM LINKSPEED ORDER BY CDATE , CTIME;", res);//가장 최신의 CTIME 뽑기
});

router.get('/latest_time_rou', function(req, res, next) {
  query("SELECT DISTINCT TOP 1 CDATE, CTIME FROM ROUTETRAVELTIME ORDER BY CDATE DESC, CTIME;", res);//가장 처음의 CTIME 뽑기
//  query("SELECT DISTINCT TOP 1 CDATE, CTIME FROM ROUTETRAVELTIME ORDER BY CDATE, CTIME;", res);//가장 최신의 CTIME 뽑기
});

router.get('/event_test', function(req, res, next) {
  query("SELECT EVENTTYPE, LAT, LON FROM EVENTS;", res);
});

router.get('/weather_test', function(req, res, next) {
  query("SELECT WEATHERTYPE, LAT, LON FROM WEATHER;", res);
});

router.get('/linkspeed_latest', function(req, res, next) {
  var str = "SELECT DISTINCT PDATE, PTIME FROM LINKSPEED WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "';";
  query(str, res);
});

router.get('/linkspeed_map', function(req, res, next) {
  var str = "SELECT LINKID, PSPEED, DIRECTION FROM LINKSPEED WHERE PDATE='" + req.query.PDATE + "' AND PTIME='" + req.query.PTIME + "' AND CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "';";
  query(str, res);
});
router.get('/linkrisk_map', function(req, res, next) {
  var str = "SELECT LINKID, COLLISIONRISKMEAN, DIRECTION FROM LINKCOLLISIONRISK WHERE PDATE='" + req.query.PDATE + "' AND PTIME='" + req.query.PTIME + "' AND CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "';";
  query(str, res);
});

router.get('/linkspeed_graph', function(req, res, next) {
  var str = "SELECT PTIME, PSPEED FROM LINKSPEED WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "' AND LINKID='" + req.query.LINKID + "' AND DIRECTION='" + req.query.DIRECTION + "';";
  console.log(str);
  query(str, res);
});

router.get('/linkrisk_graph', function(req, res, next) {
  if(req.query.LINE!=1000 || req.query.LINE!=2000 || req.query.LINE!=3000){
    var str = "SELECT PTIME, COLLISIONRISKMEAN FROM LINKCOLLISIONRISK WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "' AND LINKID='" + req.query.LINKID + "' AND DIRECTION='" + req.query.DIRECTION + "';";
    console.log(str);
    query(str, res);
  }
  else {
    res.json({error: "lineNull"});
  }
});

router.get('/herr_graph', function(req, res, next) {
  if(req.query.LINE==1000 && req.query.LINE==2000 && req.query.LINE==3000){
    var str = "SELECT CTIME, PSPEED, ASPEED FROM LINKSPEED WHERE CDATE='" + req.query.CDATE + "' AND LINKID='" + req.query.LINKID + "' AND DIRECTION='" + req.query.DIRECTION + "';";
    console.log(str);
    query(str, res);
  }
  else {
    res.json({error: "lineNull"});
  }
});

router.get('/aerr_graph', function(req, res, next) {
  if(req.query.LINE!=1000 || req.query.LINE!=2000 || req.query.LINE!=3000){
    var str = "SELECT CTIME, PSPEED, ASPEED FROM LINKSPEED WHERE CDATE='" + req.query.CDATE + "' AND LINKID='" + req.query.LINKID + "' AND DIRECTION='" + req.query.DIRECTION + "';";
    console.log(str);
    query(str, res);
  }
  else {
    res.json({error: "lineNull"});  }
});

router.get('/getLinkIDRoute', function(req, res, next) {
  var str = "SELECT LINKID, ROUTETYPE FROM ROUTEINFO WHERE ORIGIN='" + req.query.ORIGIN + "' AND DESTINATION='" + req.query.DESTI + "';";
  console.log(str);
  query(str, res);
});

router.get('/getLinkInfoRoute', function(req, res, next) {
  var str = "SELECT SLAT, SLON, ELAT, ELON FROM LINKINFO WHERE LINKNO='" + req.query.LINKID + "';";
  console.log(str);
  query(str, res);
});

router.get('/find_ptimes_route', function(req, res, next) {
  var str = "SELECT DISTINCT PDATE, PTIME FROM ROUTETRAVELTIME WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "';";
  query(str, res);
});

router.get('/getTravelTime_route', function(req, res, next) {
  var str = "SELECT ROUTETYPE, TRAVELTIME, DELAYLEVEL FROM ROUTETRAVELTIME WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "' AND PDATE='" + req.query.PDATE+ "' AND PTIME='" + req.query.PTIME+ "' AND ORIGIN='" + req.query.ORIGIN+ "' AND DESTINATION='" + req.query.DESTINATION + "';";
  query(str, res);
});

router.get('/getCollision_route', function(req, res, next) {
  var str = "SELECT ROUTETYPE, COLLISIONRISK FROM ROUTECOLLISIONRISKOVERALL WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "' AND PDATE='" + req.query.PDATE+ "' AND PTIME='" + req.query.PTIME+ "' AND ORIGIN='" + req.query.ORIGIN+ "' AND DESTINATION='" + req.query.DESTINATION + "';";
  query(str, res);
});

router.get('/collsionChart_route', function(req, res, next) {
  var str = "SELECT CUMULATIVELENGTH, COLLISIONRISK FROM ROUTECOLLISIONRISKDETAIL WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "' AND PDATE='" + req.query.PDATE+ "' AND PTIME='" + req.query.PTIME+ "' AND ORIGIN='" + req.query.ORIGIN + "' AND DESTINATION='" + req.query.DESTINATION + "' AND ROUTETYPE='" + req.query.TYPE + "';";
  query(str, res);
});

router.get('/travelTimeGraph_route', function(req, res, next) {
  var str = "SELECT ROUTETYPE, PTIME, TRAVELTIME FROM ROUTETRAVELTIME WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "' AND ORIGIN='" + req.query.ORIGIN+ "' AND DESTINATION='" + req.query.DESTINATION + "';";
  query(str, res);
});

router.get('/collsionGraph_route', function(req, res, next) {
  var str = "SELECT ROUTETYPE, PTIME, COLLISIONRISK FROM ROUTECOLLISIONRISKDETAIL WHERE CDATE='" + req.query.CDATE + "' AND CTIME='" + req.query.CTIME + "' AND ORIGIN='" + req.query.ORIGIN+ "' AND DESTINATION='" + req.query.DESTINATION + "';";
  query(str, res);
});



router.get('/sim_speed', function(req, res, next) {
  var str = "SELECT * FROM SIMULATIONSPEED;";
  queryArray(str, res);
});

router.get('/sim_summary', function(req, res, next) {
  var str = "SELECT * FROM SIMULATIONSUMMARY; ";
  query(str, res);
});

router.get('/sim_event', function(req, res, next) {
  var str = "SELECT * FROM SIMULATIONINPUT;";
  query(str, res);
});

router.get('/sim_vht_ptimes', function(req, res, next) {
  queryArray("select DISTINCT PTIME from VHTPERFORMANCE ORDER BY PTIME ASC ;", res);
});

router.get('/sim_vht', function(req, res, next) {
  var str = "SELECT * FROM VHTPERFORMANCE WHERE PTIME='" + req.query.PTIME + "' ;";
  queryArray(str, res);
});

router.get('/sim_collision', function(req, res, next) {
  var str = "SELECT * FROM COLLISIONRISKPERFORMANCE WHERE PTIME='" + req.query.PTIME + "' ;";
  queryArray(str, res);
});

router.get('/sim_crt', function(req, res, next) {
  var str = "SELECT * FROM CONTROLROUTETIME  WHERE PTIME='" + req.query.PTIME + "' ;";
  queryArray(str, res);
});

module.exports = router;
