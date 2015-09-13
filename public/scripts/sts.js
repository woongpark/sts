function getPolygon(linkinfo, direct, speed) {
  var x1 = linkinfo.SLAT,
      y1 = linkinfo.SLON,
      x2 = linkinfo.ELAT,
      y2 = linkinfo.ELON,
      color;

  speed = Math.min(speed, 130);
  speed = parseInt(speed / 130 * 255+0.5, 10);
  color = new Microsoft.Maps.Color(255,255-speed,0,speed);

  // Create a polygon
  var vertices = new Array(
    new Microsoft.Maps.Location(x1, y1),
    new Microsoft.Maps.Location(x2, y2)
  );
  var polygon = new Microsoft.Maps.Polygon(vertices,{
    fillColor: new Microsoft.Maps.Color(0,0,0,0),
    strokeColor: color,
    strokeThickness: 4
  });
  return polygon;
}

function getPolygon_risk(linkinfo, direct, risk) {
  var x1 = linkinfo.SLAT,
      y1 = linkinfo.SLON,
      x2 = linkinfo.ELAT,
      y2 = linkinfo.ELON,
      color;

  risk = Math.min(risk, 2);
  risk = parseInt(risk / 2.0 * 255+0.5, 10);
  color = new Microsoft.Maps.Color(255,255-risk,risk,0);

  // Create a polygon
  var vertices = new Array(
    new Microsoft.Maps.Location(x1, y1),
    new Microsoft.Maps.Location(x2, y2)
  );
  var polygon = new Microsoft.Maps.Polygon(vertices,{
    fillColor: new Microsoft.Maps.Color(0,0,0,0),
    strokeColor: color,
    strokeThickness: 4
  });
  return polygon;
}

function getIcon(TYPE, LAT, LON) {
  // Create a icon
  var loc = new Microsoft.Maps.Location(LAT, LON);
  var str = "/images/"+ TYPE.trim() + '.png';//타입별로 이미지를 선택하도록 고처야함
  // var pushpinOptions = {icon: str, width: 50, height: 50};
  var pushpinOptions = {
    htmlContent: "<img class='map-icon' src='" + str + "'></img>"
  };
  var pushpin= new Microsoft.Maps.Pushpin(loc, pushpinOptions);

  return pushpin;
}

function getMap() {
  var map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), {
    credentials: "Andq5Xlwoi8Um_dR6vSSL0QBQ4ktzXkweGorhME7lzAewPlOm1Og8XdcfiNL7vDd",
    center: new Microsoft.Maps.Location(37, 127.2),
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    showDashboard: true,
    disablePanning: false,
    disableZooming: false,
    zoom: 8
  });
  return map;
}

function getChart1() {
  $(function () {
    $('#chartDiv1').highcharts({
      title: {
        text: 'Link Prediction 1',
        x: -20 //center
      },
      subtitle: {
        text: 'Speed',
        x: -20
      },
      yAxis: {
        title: {
          text: "PSPEED",
          min: 0.0
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        name: "PSPEED",
        data: [],
        tooltip: {
            headerFormat: 'No : {point.key}<br/>'
        }
      }]
    });
  });
}

function setChart1(data) {
  var chart = $('#chartDiv1').highcharts();
  var categories = $.map(data, function(obj) {
    return obj.PTIME;
  });
  var data = $.map(data, function(obj) {
    return obj.PSPEED;
  })
  //chart.xAxis[0].setCategories(categories);
  chart.series[0].setData(data);
  chart.xAxis[0].update({
    labels: {
      formatter: function() {
        return categories[this.value];
      }
    }
  }, true);
}

function getChart1_risk() {
  $(function () {
    $('#chartDiv1_risk').highcharts({
      title: {
        text: 'Link Prediction 2',
        x: -20 //center
      },
      subtitle: {
        text: 'Collision Risk',
        x: -20
      },
      yAxis: {
        title: {
          text: "Collision Risk",
          min: 0.0,
          max: 2.0
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        name: "Collision Risk",
        data: [],
        id: "cRisk",
        tooltip: {
            headerFormat: 'No : {point.key}<br/>'
        }
      },{
          type: 'flags',
          data: [],
          color: Highcharts.getOptions().colors[0], // same as onSeries
          fillColor: '#FF0000',
          onSeries: 'cRisk',
          width: 16,
          style: { // text style
              color: 'white'
          },
          states: {
              hover: {
                  fillColor: '#FF0000' // darker
              }
          }
        },{
            type: 'flags',
            data: [],
            color: Highcharts.getOptions().colors[0], // same as onSeries
            fillColor: '#FFFF00',
            onSeries: 'cRisk',
            width: 16,
            style: { // text style
                color: 'white'
            },
            states: {
                hover: {
                    fillColor: '#FFFF00' // darker
                }
            }
          }]
    });
  });
}

function setChart1_risk(data) {
  var chart = $('#chartDiv1_risk').highcharts();
  var categories = $.map(data, function(obj) {
    return obj.PTIME;
  });
  var data = $.map(data, function(obj) {
    return obj.COLLISIONRISKMEAN;
  })
  // chart.xAxis[0].setCategories(categories);
  chart.series[0].setData(data);

  var dager = [];
  var moredager = [];
  for(var i = 0;i<data.length;i++){
    if(data[i]>1.6){
      moredager.push({
          x: i,
          title: 'VD',
          text: 'Vary Dangerous'
      });
    } else if(data[i]>1.2){
      dager.push({
          x: i,
          title: 'D',
          text: 'Dangerous'
      });
    }
  }
  /*
  chart.series[1].setData([{
      x: categories.indexOf("1350"),
      title: 'D',
      text: 'Vary Dangerous'
  }, {
      x: categories.indexOf("1835"),
      title: 'D',
      text: 'Vary Dangerous'
  }]);*/
  chart.series[1].setData(moredager);
  chart.series[2].setData(dager);
  chart.xAxis[0].update({
    labels: {
      formatter: function() {
        return categories[this.value];
      }
    }
  }, true);
}

function getChart2() {
  $('#chartDiv2').highcharts({
    chart: {
        type: 'boxplot'
    },

    title: {
        text: 'Highway Prediction Error'
    },

    legend: {
        enabled: false
    },

    xAxis: {
        //categories: ['1', '2', '3', '4', '5'],
        title: {
            text: 'CTIME'
        }
    },

    yAxis: {
        title: {
            text: 'DIFFERENCE'
        }
    },

    series: [{
        name: 'DIFFERENCE PSPEED TO ASPEED',
        data: [
            [760, 801, 848, 895, 965],
            [733, 853, 939, 980, 1080],
            [714, 762, 817, 870, 918],
            [724, 802, 806, 871, 950],
            [834, 836, 864, 882, 910]
        ],
        tooltip: {
            headerFormat: 'CTIME : {point.key}<br/>'
        }
    }]
  });
}

function setChart2(data){
  var chart = $('#chartDiv2').highcharts();
  var categories = [];
  var baskets = {};
  $.each(data, function(idx, obj) {
    if(!baskets[obj.CTIME]) {
      baskets[obj.CTIME] = [];
      categories.push(obj.CTIME);
    }
    baskets[obj.CTIME].push(obj.PSPEED - obj.ASPEED);
  });
  var array = [];
  $.each(baskets, function(key, arr) {
    var idx = categories.indexOf("" + key);
    array[idx] = arr;
  });
  var bValue = getBoxVaule(array);
//  debugger
  // chart.xAxis[0].setCategories(categories);
  chart.series[0].setData(bValue);
}

function getChart3() {
  $('#chartDiv3').highcharts({
    chart: {
        type: 'boxplot'
    },

    title: {
        text: 'Arterial Prediction Error'
    },

    legend: {
        enabled: false
    },

    xAxis: {
        //categories: ['1', '2', '3', '4', '5'],
        title: {
            text: 'CTIME'
        }
    },

    yAxis: {
        title: {
            text: 'DIFFERENCE'
        }
    },

    series: [{
        name: 'DIFFERENCE PSPEED TO ASPEED',
        data: [
            [760, 801, 848, 895, 965],
            [733, 853, 939, 980, 1080],
            [714, 762, 817, 870, 918],
            [724, 802, 806, 871, 950],
            [834, 836, 864, 882, 910]
        ],
        tooltip: {
            headerFormat: 'CTIME : {point.key}<br/>'
        }
    }]
  });
}

function setChart3(data){
  var chart = $('#chartDiv3').highcharts();
  var categories = [];
  var baskets = {};
  $.each(data, function(idx, obj) {
    if(!baskets[obj.CTIME]) {
      baskets[obj.CTIME] = [];
      categories.push(obj.CTIME);
    }
    baskets[obj.CTIME].push(obj.PSPEED - obj.ASPEED);
  });
  var array = [];
  $.each(baskets, function(key, arr) {
    var idx = categories.indexOf("" + key);
    array[idx] = arr;
  });
  var bValue = getBoxVaule(array);
//  debugger
  // chart.xAxis[0].setCategories(categories);
  chart.series[0].setData(bValue);
}


function getBoxVaule(array){
  var box_values = [];
  for(var i=0; i<array.length;i++)
  {
    array[i].sort(function(a,b){
      if(a>b) return 1;
      else return -1;
    });
    var box_value = [];
    var meanIndex = parseInt(array[i].length/2);
    var lowerIndex = parseInt(array[i].length/4);
    var upperIndex = 3*parseInt(array[i].length/4);
    var minIndex = 0;
    var maxIndex = array[i].length-1;
    box_value.push(array[i][minIndex]);
    box_value.push(array[i][lowerIndex]);
    box_value.push(array[i][meanIndex]);
    box_value.push(array[i][upperIndex]);
    box_value.push(array[i][maxIndex]);
    box_values.push(box_value);
  }
  return box_values;
}
