var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var config = {
  userName: 'stswing@mun9e1kfb3',
  password: 'Sts502507',
  server: 'mun9e1kfb3.database.windows.net',

  // If you're on Windows Azure, you will need this:
  options: {
    encrypt: true,
    database: 'stsprediction'
  }
};

function executeStatement() {
  request = new Request("SELECT * FROM ODDEMAND;", function(err, rowCount) {
    if (err) {
      console.log(err);
    } else {
      console.log(rowCount + ' rows');
    }
    connection.close();
  });

  request.on('row', function(columns) {
    var result = {};
    columns.forEach(function(column) {
      result[column.metadata.colName] = column.value;
    });
    console.log(result);
  });

  connection.execSql(request);
}

var connection = new Connection(config);

connection.on('connect', function(err) {
    if(err) {
      console.log(err);
      return;
    }
    // If no error, then good to go...
    executeStatement();
  }
);

connection.on('debug', function(text) {
  // console.log(text)
});
