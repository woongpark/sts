function getLinkinfo(callback) {
  $.getJSON( "/linkinfo", function( data ) {
    callback(data);
  });
}

function getPolygon(linkinfo, direct) {
  var x1 = linkinfo.SLAT,
      y1 = linkinfo.SLON,
      x2 = linkinfo.ELAT,
      y2 = linkinfo.ELON,
      diff,
      color;

  if(direct == "S") {
    diff = -0.01;
    color = new Microsoft.Maps.Color(255,255,0,0);
  } else {
    diff = +0.01;
    color = new Microsoft.Maps.Color(255,0,0,255);
  }
  // Create a polygon
  var vertices = new Array(
    new Microsoft.Maps.Location(x1 + diff, y1 + diff),
    new Microsoft.Maps.Location(x2 + diff, y2 + diff)
  );
  var polygon = new Microsoft.Maps.Polygon(vertices,{
    fillColor: new Microsoft.Maps.Color(0,0,0,0),
    strokeColor: color
  });
  return polygon;
}

function getMap() {
  var map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), {
    credentials: "Andq5Xlwoi8Um_dR6vSSL0QBQ4ktzXkweGorhME7lzAewPlOm1Og8XdcfiNL7vDd",
    center: new Microsoft.Maps.Location(37, 127.2),
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    showDashboard: false,
    disablePanning: true,
    disableZooming: true,
    zoom: 8
  });
  // Retrieve the location of the map center
  var center = map.getCenter();

  /*
  // Add a pin to the center of the map
  var pin = new Microsoft.Maps.Pushpin(center, {text: '1'});
  map.entities.push(pin);
  */

  $.getJSON("/linkinfo", function(results) {
    var data = $.map(results, function(row) {
      var obj = {};
      $.each(row, function(idx, val) {
        obj[val.metadata.colName] = val.value;
      });
      return obj;
    });
    for(var i = 0; i < data.length; i++) {
      map.entities.push(getPolygon(data[i], "S"));
      map.entities.push(getPolygon(data[i], "U"));
    }
  });


  //Add handler for the map click event.
  Microsoft.Maps.Events.addHandler(map, 'click', displayLatLong);
  function displayLatLong(e) {
    if (e.targetType == "map") {
      var point = new Microsoft.Maps.Point(e.getX(), e.getY());
      var loc = e.target.tryPixelToLocation(point);
      document.getElementById("textBox").value= loc.latitude + ", " + loc.longitude;
    }
  }
}

function getChart1() {
  $.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=usdeur.json&callback=?', function (data) {
    var year = new Date(data[data.length - 1][0]).getFullYear(); // Get year of last data point
    // Create the chart
    $('#chartDiv1').highcharts('StockChart', {
      rangeSelector: {
        selected: 1
      },
      title: {
        text: 'USD to EUR exchange rate'
      },
      yAxis: {
        title: {
          text: 'Exchange rate'
        }
      },
      series: [{
        name: 'USD to EUR',
        data: data,
        id: 'dataseries',
        tooltip: {
          valueDecimals: 4
        }
      }, {
        type: 'flags',
        data: [{
          x: Date.UTC(year, 1, 22),
          title: 'A',
          text: 'Shape: "squarepin"'
        }, {
          x: Date.UTC(year, 3, 28),
          title: 'A',
          text: 'Shape: "squarepin"'
        }],
        onSeries: 'dataseries',
        shape: 'squarepin',
        width: 16
      }, {
        type: 'flags',
        data: [{
          x: Date.UTC(year, 2, 1),
          title: 'B',
          text: 'Shape: "circlepin"'
        }, {
          x: Date.UTC(year, 3, 1),
          title: 'B',
          text: 'Shape: "circlepin"'
        }],
        shape: 'circlepin',
        width: 16
      }, {
        type: 'flags',
        data: [{
          x: Date.UTC(year, 2, 10),
          title: 'C',
          text: 'Shape: "flag"'
        }, {
          x: Date.UTC(year, 3, 11),
          title: 'C',
          text: 'Shape: "flag"'
        }],
        color: Highcharts.getOptions().colors[0], // same as onSeries
        fillColor: Highcharts.getOptions().colors[0],
        onSeries: 'dataseries',
        width: 16,
        style: { // text style
          color: 'white'
        },
        states: {
          hover: {
            fillColor: '#395C84' // darker
          }
        }
      }]
    });
  });
}

function getChart2() {
  $('#chartDiv2').highcharts({
    chart: {
      type: 'boxplot'
    },
    title: {
      text: 'Highcharts Box Plot Example'
    },
    legend: {
      enabled: false
    },
    xAxis: {
      categories: ['1', '2', '3', '4', '5'],
      title: {
        text: 'Experiment No.'
      }
    },
    yAxis: {
      title: {
        text: 'Observations'
      },
      plotLines: [{
        value: 932,
        color: 'red',
        width: 1,
        label: {
          text: 'Theoretical mean: 932',
          align: 'center',
          style: {
            color: 'gray'
          }
        }
      }]
    },
    series: [{
      name: 'Observations',
      data: [
        [760, 801, 848, 895, 965],
        [733, 853, 939, 980, 1080],
        [714, 762, 817, 870, 918],
        [724, 802, 806, 871, 950],
        [834, 836, 864, 882, 910]
      ],
      tooltip: {
        headerFormat: '<em>Experiment No {point.key}</em><br/>'
      }
    }, {
      name: 'Outlier',
      color: Highcharts.getOptions().colors[0],
      type: 'scatter',
      data: [ // x, y positions where 0 is the first category
        [0, 644],
        [4, 718],
        [4, 951],
        [4, 969]
      ],
      marker: {
        fillColor: 'white',
        lineWidth: 1,
        lineColor: Highcharts.getOptions().colors[0]
      },
      tooltip: {
        pointFormat: 'Observation: {point.y}'
      }
    }]
  });
}

function getChart3() {
  $('#chartDiv3').highcharts({
    chart: {
      type: 'boxplot'
    },
    title: {
      text: 'Highcharts Box Plot Example'
    },
    legend: {
      enabled: false
    },
    xAxis: {
      categories: ['1', '2', '3', '4', '5'],
      title: {
        text: 'Experiment No.'
      }
    },
    yAxis: {
      title: {
        text: 'Observations'
      },
      plotLines: [{
        value: 932,
        color: 'red',
        width: 1,
        label: {
          text: 'Theoretical mean: 932',
          align: 'center',
          style: {
            color: 'gray'
          }
        }
      }]
    },
    series: [{
      name: 'Observations',
      data: [
        [760, 801, 848, 895, 965],
        [733, 853, 939, 980, 1080],
        [714, 762, 817, 870, 918],
        [724, 802, 806, 871, 950],
        [834, 836, 864, 882, 910]
      ],
      tooltip: {
        headerFormat: '<em>Experiment No {point.key}</em><br/>'
      }
    }, {
      name: 'Outlier',
      color: Highcharts.getOptions().colors[0],
      type: 'scatter',
      data: [ // x, y positions where 0 is the first category
        [0, 644],
        [4, 718],
        [4, 951],
        [4, 969]
      ],
      marker: {
        fillColor: 'white',
        lineWidth: 1,
        lineColor: Highcharts.getOptions().colors[0]
      },
      tooltip: {
        pointFormat: 'Observation: {point.y}'
      }
    }]
  });
}
