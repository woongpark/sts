var def1 = $.Deferred(),
    def2 = $.Deferred(),
    def3 = $.Deferred();

var map;

var CDATE,
    CTIME;

var origin = "National Assembly",
    destination = "KAIST";

var route1_list = [],
    route2_list = [],
    count = 0;

var chart1_route1,
    route1_arrow,
    route1_axis;

var chart1_route2,
    route2_arrow,
    route2_axis;
var chart3_route1,
    chart3_route2;

var origin_headers = ["a", "b", "c", "d", "e", "f", "g"],
    origin_data = [8,9,14,11,5,10,12],
    destination_headers = ["a", "b", "c", "d", "e", "f", "g"],
    destination_data = [8,9,14,11,5,10,12];

$.getJSON("/latest_time_rou", function(data) {
  def2.resolve(data);
});

$(function() {
  getChart1_route1();
  getChart1_route2();
  getChart2_route1();
  getChart2_route2();
  getChart3_route1();
  getChart3_route2();
  getChart3_time();
  getChart3_risk();
  getChart4_origin();
  getChart4_destination();
  def3.resolve();
});

$.when( def2, def3 ).done(function (v) {
  CDATE = v[0].CDATE;
  CTIME = v[0].CTIME;
  map = getMap();
  Microsoft.Maps.Events.addHandler(map, 'click', onClickHandler);
  setRouteLinks(origin,destination);
});

function setRouteLinks(or,de){
  $.getJSON( "/getLinkIDRoute", {
    ORIGIN: or,
    DESTI: de
  }, function( data1 ) {
    route1_list = [];
    route2_list = [];
    for(var i =0; i< data1.length;i++){
      (function(data1_i){
        $.getJSON( "/getLinkInfoRoute", {
          LINKID: data1_i.LINKID
        }, function( data2 ) {
          if(data2.length!=0){
            var routetype = $.trim(data1_i.ROUTETYPE);
            var polygon_route = getPolygon_route(data2[0].SLAT, data2[0].SLON, data2[0].ELAT, data2[0].ELON, routetype);
            polygon_route.ROUTETYPE = routetype;
            polygon_route.LINKID = data1_i.LINKID;
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
            setPtimes();
          }
        });
      })(data1[i]);
    }
  });
}


function setPtimes(){
  $.getJSON( "/find_ptimes_route", {
    CDATE: CDATE,
    CTIME: CTIME
  }, function( data ) {
    var selector = document.getElementById("sel_ptime");
    selector.options.length=0;
    for(var i=0; i< data.length;i++){
      var hour = parseInt(data[i].PTIME.substring(0,2), 10);
      var minutes = data[i].PTIME.substring(2,4);
      var ampm = "";
      if(hour/12 < 1) {
        ampm = "AM ";
      }
      else {
        ampm = "PM ";
        hour = hour%12;
      }
      var op_value = ampm + hour +":"+minutes;
      selector.options[i]=new Option(op_value, data[i].PDATE+","+data[i].PTIME, true, false);
    }
    selPtime();
  });
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

function selPtime(){
  var pdate = document.getElementById("sel_ptime").value.split(',')[0];
  var ptime = document.getElementById("sel_ptime").value.split(',')[1];
  $.getJSON( "/getTravelTime_route", {
    CDATE: CDATE,
    CTIME: CTIME,
    PDATE: pdate,
    PTIME: ptime,
    ORIGIN: origin,
    DESTINATION: destination
  }, function( data ) {
    for(var i=0;i<data.length;i++){
      var hour = parseInt(ptime.substring(0,2), 10);
      var minutes = parseInt(ptime.substring(2,4),10);
      var trtime = parseInt($.trim(data[i].TRAVELTIME), 10);
      hour = hour + parseInt((minutes + trtime)/60);
      minutes = (minutes + trtime)%60;
      if(hour>24){
        hour = hour-24;
      }
      var ampm = "";
      if(hour/12 < 1) {
        ampm = "AM ";
      }
      else {
        ampm = "PM ";
        hour = hour%12;
      }
      if(minutes<10){
        var op_value = ampm + hour +":0"+minutes;
      }else{
        var op_value = ampm + hour +":"+minutes;
      }

      if(data[i].ROUTETYPE == 1){
        document.getElementById("tra_time1").innerHTML = $.trim(data[i].TRAVELTIME) + "분";
        document.getElementById("depart_time1").innerHTML = op_value;
        setChart1_route1(data[i].DELAYLEVEL);
      }else{
        document.getElementById("tra_time2").innerHTML = $.trim(data[i].TRAVELTIME) + "분";
        document.getElementById("depart_time2").innerHTML = op_value;
        setChart1_route2(data[i].DELAYLEVEL);
      }
    }
    setChart2(pdate, ptime);
    setChart3_route(pdate, ptime, "1");
    setChart3_route(pdate, ptime, "2");
    setChart3_time();
    setChart3_risk();
    setChart4_destination(pdate, ptime);
    setChart4_origin(pdate, ptime);
  });
}

function getChart1_route1(){
  AmCharts.ready(function () {
      // create angular gauge
      chart1_route1 = new AmCharts.AmAngularGauge();
      //chart.addTitle("Speedometer");

      // create axis
      route1_axis = new AmCharts.GaugeAxis();
      route1_axis.startValue = 0;
      route1_axis.axisThickness = 1;
      route1_axis.valueInterval = 1;
      route1_axis.endValue = 5;
      // color bands
      var band1 = new AmCharts.GaugeBand();
      band1.startValue = 0;
      band1.endValue = 2;
      band1.color = "#00CC00";

      var band2 = new AmCharts.GaugeBand();
      band2.startValue = 2;
      band2.endValue = 4;
      band2.color = "#ffac29";

      var band3 = new AmCharts.GaugeBand();
      band3.startValue = 4;
      band3.endValue = 5;
      band3.color = "#ea3838";

      route1_axis.bands = [band1, band2, band3];

      // bottom text
      route1_axis.bottomTextYOffset = -20;
      route1_axis.setBottomText("0 Delay Level");
      chart1_route1.addAxis(route1_axis);

      // gauge arrow
      route1_arrow = new AmCharts.GaugeArrow();
      chart1_route1.addArrow(route1_arrow);

      chart1_route1.write("route1_chart1");
  });
}

function setChart1_route1(value){
  route1_arrow.setValue(value);
  route1_axis.setBottomText(value + " Delay Level");
}

function getChart1_route2(){
  AmCharts.ready(function () {
      // create angular gauge
      chart1_route2 = new AmCharts.AmAngularGauge();
      //chart.addTitle("Speedometer");

      // create axis
      route2_axis = new AmCharts.GaugeAxis();
      route2_axis.startValue = 0;
      route2_axis.axisThickness = 1;
      route2_axis.valueInterval = 1;
      route2_axis.endValue = 5;
      // color bands
      var band1 = new AmCharts.GaugeBand();
      band1.startValue = 0;
      band1.endValue = 2;
      band1.color = "#00CC00";

      var band2 = new AmCharts.GaugeBand();
      band2.startValue = 2;
      band2.endValue = 4;
      band2.color = "#ffac29";

      var band3 = new AmCharts.GaugeBand();
      band3.startValue = 4;
      band3.endValue = 5;
      band3.color = "#ea3838";

      route2_axis.bands = [band1, band2, band3];

      // bottom text
      route2_axis.bottomTextYOffset = -20;
      route2_axis.setBottomText("0 Delay Level");
      chart1_route2.addAxis(route2_axis);

      // gauge arrow
      route2_arrow = new AmCharts.GaugeArrow();
      chart1_route2.addArrow(route2_arrow);

      chart1_route2.write("route2_chart1");
  });
}

function setChart1_route2(value){
  route2_arrow.setValue(value);
  route2_axis.setBottomText(value + " Delay Level");
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
   $('#route1_chart2').highcharts(Highcharts.merge(gaugeOptions, {
       yAxis: {
           min: 0,
           max: 2
       },

       credits: {
           enabled: false
       },

       series: [{
           name: 'Collision Risk',
           data: [1],
           dataLabels: {
               format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                   ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                      '<span style="font-size:12px;color:silver">Collision Risk</span></div>'
           },
           tooltip: {
               valueSuffix: ' Collision Risk'
           }
       }]

   }));
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
         max: 2
     },

     credits: {
         enabled: false
     },

     series: [{
         name: 'Collision Risk',
         data: [1],
         dataLabels: {
             format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                 ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                    '<span style="font-size:12px;color:silver">Collision Risk</span></div>'
         },
         tooltip: {
             valueSuffix: ' Collision Risk'
         }
     }]

   }));

}

function setChart2(PDATE, PTIME){
  $.getJSON( "/getCollision_route", {
    CDATE: CDATE,
    CTIME: CTIME,
    PDATE: PDATE,
    PTIME: PTIME,
    ORIGIN: origin,
    DESTINATION: destination
  }, function( data ) {
    for(var i=0;i<data.length;i++){
      var type = $.trim(data[i].ROUTETYPE);
      if(type == '1'){
        var chart = $('#route1_chart2').highcharts();
        chart.series[0].setData([data[i].COLLISIONRISK]);
      }else{
        var chart = $('#route2_chart2').highcharts();
        chart.series[0].setData([data[i].COLLISIONRISK]);
      }
    }
  });
}

function getChart3_route1(){
  chart3_route1 = AmCharts.makeChart("route1_chart3", {
      "type": "serial",
      "theme": "light",
      "marginTop":0,
      "marginRight": 80,
      "dataProvider": [{
        "CUMULATIVELENGTH": 1.34,
        "COLLISIONRISK": 3.307
    }, {
        "CUMULATIVELENGTH": 5.34,
        "COLLISIONRISK": -0.168
    }],
      "valueAxes": [{
          "axisAlpha": 0,
          "position": "left"
      }],
      "graphs": [{
          "id":"g1",
          "balloonText": "CUMULATIVELENGTH : [[category]]<br><b><span style='font-size:14px;'>COLLISIONRISK : [[value]]</span></b>",
          "bullet": "round",
          "bulletSize": 8,
          "lineColor": "#FF0000",
          "lineThickness": 2,
          "negativeBase": 1,
          "negativeLineColor": "#00FF00",
          "type": "smoothedLine",
          "valueField": "COLLISIONRISK"
      }],

      "categoryField": "CUMULATIVELENGTH",
  });
}
function getChart3_route2(){
  chart3_route2 = AmCharts.makeChart("route2_chart3", {
      "type": "serial",
      "theme": "light",
      "marginTop":0,
      "marginRight": 80,
      "dataProvider": [{
        "CUMULATIVELENGTH": 1950,
        "COLLISIONRISK": 1.307
    }, {
        "CUMULATIVELENGTH": 1951,
        "COLLISIONRISK": -0.168
    }],
      "valueAxes": [{
          "axisAlpha": 0,
          "position": "left"
      }],
      "graphs": [{
          "id":"g1",
          "balloonText": "CUMULATIVELENGTH : [[category]]<br><b><span style='font-size:14px;'>COLLISIONRISK : [[value]]</span></b>",
          "bullet": "round",
          "bulletSize": 8,
          "lineColor": "#FF0000",
          "lineThickness": 2,
          "negativeBase": 1,
          "negativeLineColor": "#00FF00",
          "type": "smoothedLine",
          "valueField": "COLLISIONRISK"
      }],

      "categoryField": "CUMULATIVELENGTH",
  });
}

function setChart3_route(PDATE, PTIME, TYPE){
  var orNum;
  var deNum;
  if(origin == "KAIST"){
    orNum = 1;
  }else if(origin == "National Assembly"){
    orNum = 2;
  } else{
    orNum = 3;
  }
  if(destination == "KAIST"){
    deNum = 1;
  }else if(destination == "National Assembly"){
    deNum = 2;
  } else{
    deNum = 3;
  }
  $.getJSON( "/collsionChart_route", {
    CDATE: CDATE,
    CTIME: CTIME,
    PDATE: PDATE,
    PTIME: PTIME,
    ORIGIN: orNum,
    DESTINATION: deNum,
    TYPE: TYPE
  }, function( data ) {
    var datas = [{
        "CUMULATIVELENGTH": 1950,
        "COLLISIONRISK": -0.307
    }, {
        "CUMULATIVELENGTH": 1951,
        "COLLISIONRISK": -0.168
    }];
    if(TYPE == "1"){
      chart3_route1.dataProvider = data;
      chart3_route1.validateData();
    }else{
      chart3_route2.dataProvider = data;
      chart3_route2.validateData();
    }
  });
}

function setVisible_route1(){
  if(document.getElementById("route1_chart3").style.display == "none"){
    document.getElementById("route1_chart3").style.display = "block";
  }else{
    document.getElementById("route1_chart3").style.display = "none";
  }
}

function setVisible_route2(){
  if(document.getElementById("route2_chart3").style.display == "none"){
    document.getElementById("route2_chart3").style.display = "block";
  }else{
    document.getElementById("route2_chart3").style.display = "none";
  }
}

function getChart3_time() {
  $(function () {
    $('#chart3_time').highcharts({
      colors: ['#FF0000', '#0000FF'],
      title: {
        text: 'Travel Time',
        x: -20 //center
      },
      xAxis: {
        tickInterval: 12
      },
      yAxis: {
        title: {
          text: "Travel Time",
          min: 0.0
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        name: "Route1",
        data: []
      },{
        name: "Route2",
        data: []
      }],
      tooltip: {
          formatter: function(){
            return '출발시간 : ' + this.x + '<br/>Travel Time : '+this.y +' min';
          }
      }
    });
  });
}

function setChart3_time() {
  $.getJSON( "/travelTimeGraph_route", {
    CDATE: CDATE,
    CTIME: CTIME,
    ORIGIN: origin,
    DESTINATION: destination
  }, function( data ) {
    var data_route1 = [];
    var data_route2 = [];
    for(var i=0;i<data.length;i++){
      if(data[i].ROUTETYPE== 1){
        data_route1.push(data[i]);
      }else {
        data_route2.push(data[i]);
      }
    }
    var chart = $('#chart3_time').highcharts();
    var categories = $.map(data_route1, function(obj) {
      return obj.PTIME;
    });
    var data1 = $.map(data_route1, function(obj) {
      return parseInt($.trim(obj.TRAVELTIME), 10);
    });
    var data2 = $.map(data_route2, function(obj) {
      return parseInt($.trim(obj.TRAVELTIME), 10);
    });
    //chart.xAxis[0].setCategories(categories);
    chart.series[0].setData(data1);
    chart.series[1].setData(data2);
    chart.xAxis[0].update({
      categories: categories
    }, true);
  });


}

function getChart3_risk(){
  $('#chart3_risk').highcharts({

        chart: {
            type: 'boxplot'
        },
        colors: ['#FF0000', '#0000FF'],
        title: {
            text: 'Collision Risk'
        },

        legend: {
            enabled: false
        },

        xAxis: {
            //categories: ['1', '2', '3', '4', '5'],
            title: {
                text: 'PTIME'
            }
        },

        yAxis: {
            title: {
                text: 'Collision Risk'
            }
        },

        series: [{
            name: 'Route1',
            data: [
                [760, 801, 848, 895, 965],
                [733, 853, 939, 980, 1080],
                [714, 762, 817, 870, 918],
                [724, 802, 806, 871, 950],
                [834, 836, 864, 882, 910]
            ],
            tooltip: {
                headerFormat: 'PTIME {point.key}<br/>'
            }
        },{
            name: 'Route2',
            data: [
                [760, 801, 848, 895, 965],
                [733, 853, 939, 980, 1080],
                [714, 762, 817, 870, 918],
                [724, 802, 806, 871, 950],
                [834, 836, 864, 882, 910]
            ],
            tooltip: {
                headerFormat: 'PTIME {point.key}<br/>'
            }
        }]

    });
}

function setChart3_risk(){
  var orNum;
  var deNum;
  if(origin == "KAIST"){
    orNum = 1;
  }else if(origin == "National Assembly"){
    orNum = 2;
  } else{
    orNum = 3;
  }
  if(destination == "KAIST"){
    deNum = 1;
  }else if(destination == "National Assembly"){
    deNum = 2;
  } else{
    deNum = 3;
  }

  $.getJSON( "/collsionGraph_route", {
    CDATE: CDATE,
    CTIME: CTIME,
    ORIGIN: orNum,
    DESTINATION: deNum
  }, function( data ) {
    var data_route1 = [];
    var data_route2 = [];
    for(var i=0;i<data.length;i++){
      var rType = $.trim(data[i].ROUTETYPE);
      if(rType == "1"){
        data_route1.push(data[i]);
      }else {
        data_route2.push(data[i]);
      }
    }
    var chart = $('#chart3_risk').highcharts();
    var categories = [];
    var baskets1 = {};
    var baskets2 = {};
    $.each(data_route1, function(idx, obj) {
      if(!baskets1[obj.PTIME]) {
        baskets1[obj.PTIME] = [];
        categories.push(obj.PTIME);
      }
      baskets1[obj.PTIME].push(obj.COLLISIONRISK);
    });
    $.each(data_route2, function(idx, obj) {
      if(!baskets2[obj.PTIME]) {
        baskets2[obj.PTIME] = [];
      }
      baskets2[obj.PTIME].push(obj.COLLISIONRISK);
    });
    var array1 = [];
    $.each(baskets1, function(key, arr) {
      var idx = categories.indexOf("" + key);
      array1[idx] = arr;
    });
    var array2 = [];
    $.each(baskets2, function(key, arr) {
      var idx = categories.indexOf("" + key);
      array2[idx] = arr;
    });
    var bValue1 = getBoxVaule(array1);
    var bValue2 = getBoxVaule(array2);
    chart.xAxis[0].setCategories(categories);
    chart.series[0].setData(bValue1);
    chart.series[1].setData(bValue2);
  });
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

function getChart4_origin(){

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
            tickInterval: 360/origin_data.length,
            min: 0,
            max: 360,
            labels: {
                formatter: function () {
                    var interval = (360/origin_data.length);
                    var idx = parseInt(this.value / interval + 0.5, 10);
                    return origin_headers[idx];
                }
            }
        },

        yAxis: {
            min: 0
        },

        plotOptions: {
            series: {
                pointStart: 0,
                pointInterval: 360/origin_data.length
            },
            column: {
                pointPadding: 0,
                groupPadding: 0
            }
        },

        series: [{
            type: 'column',
            name: 'PCOUNT',
            data: origin_data
        }],

        tooltip: {
            formatter: function() {
                var interval = (360/origin_data.length);
                var idx = parseInt(this.x / interval + 0.5, 10);
                return origin_headers[idx] + " : " + this.y;
            }
        }

    });
}

function setChart4_origin(pdate, ptime){
  var from_tc;
  if(origin=="KAIST"){
    from_tc = 115;
  }else{
    from_tc = 101;
  }
  $.getJSON( "/getOriginDemand", {
    /*
    CDATE: CDATE,
    CTIME: CTIME,
    PDATE: pdate,
    PTIME: ptime,*/ //이렇게 해야하나 데이터가 없어서 ptime 강제로 선택
    CDATE: 20130816,
    CTIME: 1434,
    PDATE: 20130816,
    PTIME: 20,
    FROM_TCS_CODE: from_tc
  }, function( data ) {
    data.sort(function(a,b){
      var a1 = parseInt(a.PCOUNT);
      var b1 = parseInt(b.PCOUNT);
      if(a1<b1) return 1;
      else return -1;
    });
    for(var i =0; i<30;i++){
      origin_headers[i] = data[i].TO_TCS_NAME;
      origin_data[i] =parseInt(data[i].PCOUNT);
    }
    getChart4_origin();
  });
}

function getChart4_destination(){
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
          tickInterval: 360/destination_data.length,
          min: 0,
          max: 360,
          labels: {
              formatter: function () {
                  var interval = (360/destination_data.length);
                  var idx = parseInt(this.value / interval + 0.5, 10);
                  return destination_headers[idx];
              }
          }
      },

      yAxis: {
          min: 0
      },

      plotOptions: {
          series: {
              pointStart: 0,
              pointInterval: 360/destination_data.length
          },
          column: {
              pointPadding: 0,
              groupPadding: 0
          }
      },

      series: [{
          type: 'column',
          name: 'PCOUNT',
          data: destination_data
      }],

      tooltip: {
          formatter: function() {
              var interval = (360/destination_data.length);
              var idx = parseInt(this.x / interval + 0.5, 10);
              return destination_headers[idx] + " : " + this.y;
          }
      }

  });
}

function setChart4_destination(pdate, ptime){
  var to_tc;
  if(origin=="KAIST"){
    to_tc = 101;
  }else{
    to_tc = 115;
  }
  $.getJSON( "/getDestinationDemand", {
    /*
    CDATE: CDATE,
    CTIME: CTIME,
    PDATE: pdate,
    PTIME: ptime,*/ //이렇게 해야하나 데이터가 없어서 ptime 강제로 선택
    CDATE: 20130816,
    CTIME: 1434,
    PDATE: 20130816,
    PTIME: 20,
    TO_TCS_CODE: to_tc
  }, function( data ) {
    data.sort(function(a,b){
      var a1 = parseInt(a.PCOUNT);
      var b1 = parseInt(b.PCOUNT);
      if(a1<b1) return 1;
      else return -1;
    });
    for(var i =0; i<30;i++){
      destination_headers[i] = data[i].FROM_TCS_NAME;
      destination_data[i] =parseInt(data[i].PCOUNT);
    }
    getChart4_destination();
  });

}

function resetLink(){
  count = 0;
  map.entities.clear();
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

function onClickHandler(e) {
  if (e.targetType == "polygon") {
    if(e.target.ROUTETYPE==1){
      debugger
      for(var i=0;i<route1_list.length;i++){
        route1_list[i]._strokeColor.r=0;
        route1_list[i]._strokeColor.g=255;
        route1_list[i]._strokeColor.b=0;
      }
      for(var i=0;i<route2_list.length;i++){
        route2_list[i]._strokeColor.r=132;
        route2_list[i]._strokeColor.g=132;
        route2_list[i]._strokeColor.b=132;
      }
    }else{
      for(var i=0;i<route1_list.length;i++){
        route1_list[i]._strokeColor.r=132;
        route1_list[i]._strokeColor.g=132;
        route1_list[i]._strokeColor.b=132;
      }
      for(var i=0;i<route2_list.length;i++){
        route2_list[i]._strokeColor.r=0;
        route2_list[i]._strokeColor.g=255;
        route2_list[i]._strokeColor.b=0;
      }
    }
    var orNum;
    var deNum;
    if(origin == "KAIST"){
      orNum = 1;
    }else if(origin == "National Assembly"){
      orNum = 2;
    } else{
      orNum = 3;
    }
    if(destination == "KAIST"){
      deNum = 1;
    }else if(destination == "National Assembly"){
      deNum = 2;
    } else{
      deNum = 3;
    }
    var pdate = document.getElementById("sel_ptime").value.split(',')[0];
    var ptime = document.getElementById("sel_ptime").value.split(',')[1];
    var latmin = (e.target._locations[0].latitude+e.target._locations[1].latitude)/2;
    var lonmin = (e.target._locations[0].longitude+e.target._locations[1].longitude)/2
    $.getJSON( "/goToSpeed_route", {
      CDATE: CDATE,
      CTIME: CTIME,
      PDATE: pdate,
      PTIME: ptime,
      ORIGIN: orNum,
      DESTINATION: deNum,
      TYPE:e.target.ROUTETYPE,
      LINKID:e.target.LINKID
    }, function( data ) {
        var infoboxOptions = {width:150,
                            height: 50,
                            title: "SPEED : " + data[0].SPEED,
                            };
      var myInfobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(latmin,lonmin), infoboxOptions);
      map.entities.push(myInfobox);
    });

  } else{
    for(var i=0;i<route1_list.length;i++){
      route1_list[i]._strokeColor.r=255;
      route1_list[i]._strokeColor.g=0;
      route1_list[i]._strokeColor.b=0;
    }
    for(var i=0;i<route2_list.length;i++){
      route2_list[i]._strokeColor.r=0;
      route2_list[i]._strokeColor.g=0;
      route2_list[i]._strokeColor.b=255;
    }
  }
  resetLink();
}
