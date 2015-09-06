function getPolygon(linkinfo, direct, speed) {
  var x1 = linkinfo.SLAT,
      y1 = linkinfo.SLON,
      x2 = linkinfo.ELAT,
      y2 = linkinfo.ELON,
      diff,
      color;

  if(direct == "S") {
    diff = -0.01;
  } else {
    diff = +0.01;
  }

  speed = Math.min(speed, 130);
  speed = parseInt(speed / 130 * 255 + 0.5, 10);
  color = new Microsoft.Maps.Color(255,255-speed,0,speed);

  // Create a polygon
  var vertices = new Array(
    new Microsoft.Maps.Location(x1 + diff, y1 - diff),
    new Microsoft.Maps.Location(x2 + diff, y2 - diff)
  );
  var polygon = new Microsoft.Maps.Polygon(vertices,{
    fillColor: new Microsoft.Maps.Color(0,0,0,0),
    strokeColor: color,
    strokeThickness: 4
  });
  return polygon;
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
        text: 'Link Prediction',
        x: -20 //center
      },
      subtitle: {
        text: 'Speed and Collision Risk',
        x: -20
      },
      yAxis: {
        title: {
          text: "PSPEED"
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        name: "PSPEED",
        data: []
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
  chart.xAxis[0].setCategories(categories);
  chart.series[0].setData(data);
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
