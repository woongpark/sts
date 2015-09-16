var def1 = $.Deferred(),
    def2 = $.Deferred(),
    def3 = $.Deferred();

var map;

var origin = "National Assembly",
    destination = "KAIST";

var route1_list = [],
    route2_list = [],
    count = 0;

  $.getJSON("/latest_time_rou", function(data) {
    def2.resolve(data);
  });

$(function() {
  $('#timepicker1').timepicker();
  $('#timesetter1').timepicker({
      template: false,
      showInputs: false,
      minuteStep: 5
  });
  $('#timesetter2').timepicker({
      template: false,
      showInputs: false,
      minuteStep: 5
  });
  getChart1_route1();
  getChart1_route2();
  getChart2_route1();
  getChart2_route2();
  getChart3_time();
  getChart3_risk();
  getChart4_origin();
  getChart4_destination();
  def3.resolve();
});

$.when( def2, def3 ).done(function (v) {
  var CDATE = v[0].CDATE,
      CTIME = v[0].CTIME;
  map = getMap();
  setRouteLinks(origin,destination);
});

function setRouteLinks(or,de){
  $.getJSON( "/getLinkIDRoute", {
    ORIGIN: or,
    DESTI: de
  }, function( data1 ) {
    route1_list = [];
    route2_list = [];
    debugger
    for(var i =0; i< data1.length;i++){
      (function(data1_i){
        $.getJSON( "/getLinkInfoRoute", {
          LINKID: data1_i.LINKID
        }, function( data2 ) {
          if(data2.length!=0){
            var routetype = $.trim(data1_i.ROUTETYPE);
            var polygon_route = getPolygon_route(data2[0].SLAT, data2[0].SLON, data2[0].ELAT, data2[0].ELON, routetype);
            polygon_route.ORIGIN = or;
            polygon_route.DESTINATION = de;
            Microsoft.Maps.Events.addHandler(polygon_route, 'click', onClickHandler);
            if(routetype == '1'){
              route1_list.push(polygon_route);
            } else{
              route2_list.push(polygon_route);
            }
          }
          count++;
          if(count == data1.length){
            resetLink();
          }
        });
      })(data1[i]);
    }
  });
}

function getChart1_route1(){
  var chart;
  var arrow;
  var axis;

  AmCharts.ready(function () {
      // create angular gauge
      chart = new AmCharts.AmAngularGauge();
      //chart.addTitle("Speedometer");

      // create axis
      axis = new AmCharts.GaugeAxis();
      axis.startValue = 0;
      axis.axisThickness = 1;
      axis.valueInterval = 50;
      axis.endValue = 220;
      // color bands
      var band1 = new AmCharts.GaugeBand();
      band1.startValue = 0;
      band1.endValue = 90;
      band1.color = "#00CC00";

      var band2 = new AmCharts.GaugeBand();
      band2.startValue = 90;
      band2.endValue = 130;
      band2.color = "#ffac29";

      var band3 = new AmCharts.GaugeBand();
      band3.startValue = 130;
      band3.endValue = 220;
      band3.color = "#ea3838";
      band3.innerRadius = "95%";

      axis.bands = [band1, band2, band3];

      // bottom text
      axis.bottomTextYOffset = -20;
      axis.setBottomText("0 km/h");
      chart.addAxis(axis);

      // gauge arrow
      arrow = new AmCharts.GaugeArrow();
      chart.addArrow(arrow);

      chart.write("route1_chart1");
      setInterval(function () {
        var value = Math.round(Math.random() * 200);
        arrow.setValue(value);
        axis.setBottomText(value + " km/h");
      }, 2000);
  });
}
function getChart1_route2(){
  var chart;
  var arrow;
  var axis;

  AmCharts.ready(function () {
      // create angular gauge
      chart = new AmCharts.AmAngularGauge();
      //chart.addTitle("Speedometer");

      // create axis
      axis = new AmCharts.GaugeAxis();
      axis.startValue = 0;
      axis.axisThickness = 1;
      axis.valueInterval = 50;
      axis.endValue = 220;
      // color bands
      var band1 = new AmCharts.GaugeBand();
      band1.startValue = 0;
      band1.endValue = 90;
      band1.color = "#00CC00";

      var band2 = new AmCharts.GaugeBand();
      band2.startValue = 90;
      band2.endValue = 130;
      band2.color = "#ffac29";

      var band3 = new AmCharts.GaugeBand();
      band3.startValue = 130;
      band3.endValue = 220;
      band3.color = "#ea3838";
      band3.innerRadius = "95%";

      axis.bands = [band1, band2, band3];

      // bottom text
      axis.bottomTextYOffset = -20;
      axis.setBottomText("0 km/h");
      chart.addAxis(axis);

      // gauge arrow
      arrow = new AmCharts.GaugeArrow();
      chart.addArrow(arrow);

      chart.write("route1_chart2");
      // change value every 2 seconds
      setInterval(function () {
        var value = Math.round(Math.random() * 200);
        arrow.setValue(value);
        axis.setBottomText(value + " km/h");
      }, 2000);
  });
}

function getChart2_route1(){
  var gaugeOptions = {

       chart: {
           type: 'solidgauge'
       },

       title: null,

       pane: {
           center: ['50%', '85%'],
           size: '140%',
           startAngle: -90,
           endAngle: 90,
           background: {
               backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
               innerRadius: '60%',
               outerRadius: '100%',
               shape: 'arc'
           }
       },

       tooltip: {
           enabled: false
       },

       // the value axis
       yAxis: {
           stops: [
               [0.1, '#55BF3B'], // green
               [0.5, '#DDDF0D'], // yellow
               [0.9, '#DF5353'] // red
           ],
           lineWidth: 0,
           minorTickInterval: null,
           tickPixelInterval: 400,
           tickWidth: 0,
           title: {
               y: -70
           },
           labels: {
               y: 16
           }
       },

       plotOptions: {
           solidgauge: {
               dataLabels: {
                   y: 5,
                   borderWidth: 0,
                   useHTML: true
               }
           }
       }
   };

   // The speed gauge
   $('#route2_chart1').highcharts(Highcharts.merge(gaugeOptions, {
       yAxis: {
           min: 0,
           max: 200
       },

       credits: {
           enabled: false
       },

       series: [{
           name: 'Speed',
           data: [80],
           dataLabels: {
               format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                   ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                      '<span style="font-size:12px;color:silver">km/h</span></div>'
           },
           tooltip: {
               valueSuffix: ' km/h'
           }
       }]

   }));
   setInterval(function () {
        // Speed
        var chart = $('#route2_chart1').highcharts(),
            point,
            newVal,
            inc;

        if (chart) {
            point = chart.series[0].points[0];
            inc = Math.round((Math.random() - 0.5) * 100);
            newVal = point.y + inc;

            if (newVal < 0 || newVal > 200) {
                newVal = point.y - inc;
            }

            point.update(newVal);
        }

    }, 2000);
}

function getChart2_route2(){
  var gaugeOptions = {

       chart: {
           type: 'solidgauge'
       },

       title: null,

       pane: {
           center: ['50%', '85%'],
           size: '140%',
           startAngle: -90,
           endAngle: 90,
           background: {
               backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
               innerRadius: '60%',
               outerRadius: '100%',
               shape: 'arc'
           }
       },

       tooltip: {
           enabled: false
       },

       // the value axis
       yAxis: {
           stops: [
               [0.1, '#55BF3B'], // green
               [0.5, '#DDDF0D'], // yellow
               [0.9, '#DF5353'] // red
           ],
           lineWidth: 0,
           minorTickInterval: null,
           tickPixelInterval: 400,
           tickWidth: 0,
           title: {
               y: -70
           },
           labels: {
               y: 16
           }
       },

       plotOptions: {
           solidgauge: {
               dataLabels: {
                   y: 5,
                   borderWidth: 0,
                   useHTML: true
               }
           }
       }
   };

   // The speed gauge
   $('#route2_chart2').highcharts(Highcharts.merge(gaugeOptions, {
       yAxis: {
           min: 0,
           max: 200
       },

       credits: {
           enabled: false
       },

       series: [{
           name: 'Speed',
           data: [80],
           dataLabels: {
               format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                   ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                      '<span style="font-size:12px;color:silver">km/h</span></div>'
           },
           tooltip: {
               valueSuffix: ' km/h'
           }
       }]

   }));
   setInterval(function () {
        // Speed
        var chart = $('#route2_chart2').highcharts(),
            point,
            newVal,
            inc;

        if (chart) {
            point = chart.series[0].points[0];
            inc = Math.round((Math.random() - 0.5) * 100);
            newVal = point.y + inc;

            if (newVal < 0 || newVal > 200) {
                newVal = point.y - inc;
            }

            point.update(newVal);
        }

    }, 2000);
}

function getChart3_time(){
  var seriesOptions = [],
      seriesCounter = 0,
      names = ['MSFT', 'AAPL'],
      // create the chart when all data is loaded
      createChart = function () {

          $('#chart3_time').highcharts({
              title: {
                text: 'Travel Time',
                x: -20 //center
              },

              rangeSelector: {
                  selected: 4
              },

              yAxis: {
                  title: {
                    text: "Time"
                  },
                  labels: {
                      formatter: function () {
                          return (this.value > 0 ? ' + ' : '') + this.value + '%';
                      }
                  },
                  plotLines: [{
                      value: 0,
                      width: 2,
                      color: 'silver'
                  }]
              },

              plotOptions: {
                  series: {
                      compare: 'percent'
                  }
              },

              tooltip: {
                  pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                  valueDecimals: 2
              },

              series: seriesOptions
          });
      };

  $.each(names, function (i, name) {

      $.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=' + name.toLowerCase() + '-c.json&callback=?',    function (data) {

          seriesOptions[i] = {
              name: name,
              data: data
          };

          seriesCounter += 1;

          if (seriesCounter === names.length) {
              createChart();
          }
      });
  });
}

function getChart3_risk(){
  $('#chart3_risk').highcharts({

        chart: {
            type: 'boxplot'
        },

        title: {
            text: 'Collision Risk'
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
            name: 'Observations1',
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
        },{
            name: 'Observations2',
            data: [
                [660, 701, 748, 795, 865],
                [663, 753, 839, 880, 980],
                [614, 662, 717, 770, 818],
                [624, 702, 706, 771, 850],
                [734, 736, 764, 782, 810]
            ],
            tooltip: {
                headerFormat: '<em>Experiment No {point.key}</em><br/>'
            }
        }, {
            name: 'Outlier',
            color: Highcharts.getOptions().colors[0],
            type: 'scatter',
            data: [ // x, y positions where 0 is the first category
                [0, 544],
                [4, 618],
                [4, 851],
                [4, 869]
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

function getChart4_origin(){
    var headers = ["a", "b", "c", "d", "e", "f", "g"];
    var data = [8,9,14,11,5,10,12];
    $('#chart4_ori').highcharts({

        chart: {
            polar: true
        },

        title: {
            text: 'Departures from Origin'
        },

        pane: {
            startAngle: 0,
            endAngle: 360
        },

        xAxis: {
            tickInterval: 360/data.length,
            min: 0,
            max: 360,
            labels: {
                formatter: function () {
                    var interval = (360/data.length);
                    var idx = parseInt(this.value / interval + 0.5, 10);
                    return headers[idx];
                }
            }
        },

        yAxis: {
            min: 0
        },

        plotOptions: {
            series: {
                pointStart: 0,
                pointInterval: 360/data.length
            },
            column: {
                pointPadding: 0,
                groupPadding: 0
            }
        },

        series: [{
            type: 'column',
            name: 'Column',
            data: data
        }],

        tooltip: {
            formatter: function() {
                var interval = (360/data.length);
                var idx = parseInt(this.x / interval + 0.5, 10);
                return headers[idx] + " : " + this.y;
            }
        }

    });
}

function getChart4_destination(){
  var headers = ["a", "b", "c", "d", "e", "f", "g"];
  var data = [8,9,14,11,5,10,12];
  $('#chart4_dest').highcharts({

      chart: {
          polar: true
      },

      title: {
          text: 'Departures from Destination'
      },

      pane: {
          startAngle: 0,
          endAngle: 360
      },

      xAxis: {
          tickInterval: 360/data.length,
          min: 0,
          max: 360,
          labels: {
              formatter: function () {
                  var interval = (360/data.length);
                  var idx = parseInt(this.value / interval + 0.5, 10);
                  return headers[idx];
              }
          }
      },

      yAxis: {
          min: 0
      },

      plotOptions: {
          series: {
              pointStart: 0,
              pointInterval: 360/data.length
          },
          column: {
              pointPadding: 0,
              groupPadding: 0
          }
      },

      series: [{
          type: 'column',
          name: 'Column',
          data: data
      }],

      tooltip: {
          formatter: function() {
              var interval = (360/data.length);
              var idx = parseInt(this.x / interval + 0.5, 10);
              return headers[idx] + " : " + this.y;
          }
      }

  });
}

function resetLink(){
  count = 0;
  map.entities.clear();
  debugger
  map.entities.push(getLocationPin("KAIST", 36.369491, 127.363714));
  map.entities.push(getLocationPin("Olympic Park", 37.520300, 127.121569));
  map.entities.push(getLocationPin("National Assembly", 37.531792, 126.914015));
  for(var i=0;i<route1_list.length;i++){
    map.entities.push(route1_list[i]);
  }
  for(var i=0;i<route2_list.length;i++){
    map.entities.push(route2_list[i]);
  }
}

function findNewRoute(){
  var ori = document.getElementById("originSelect").value;
  var dest = document.getElementById("destinatioSelect").value;
  if(ori == dest){
    alert("Origin and Destination must be different.");
  } else if (ori != "KAIST" && dest!="KAIST"){
    alert("KAIST must be selected");
  }else{
    origin = ori;
    destination = dest;
    setRouteLinks(origin,destination);
    document.getElementById("originText").innerHTML = ori;
    document.getElementById("destinationText").innerHTML = dest;
  }

}


function onClickHandler(e) {
}
