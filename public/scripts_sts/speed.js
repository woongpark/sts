var def1 = $.Deferred(),
    def2 = $.Deferred(),
    def3 = $.Deferred(),
    dir = "U",
    riskOn = "F",
    weatherOn = "F";

var map;

var linkSpeed_list_U = [],
    linkSpeed_list_D = [],
    linkRisk_list_U = [],
    linkRisk_list_D = [],
    event_list = [],
    wearther_list = [];

$.getJSON("/linkinfo", function(data) {
  def1.resolve(data);
});

$.getJSON("/latest_time", function(data) {
  def2.resolve(data);
});

$(function() {
  getChart1();
  getChart1_risk();
  getChart2();
  getChart3();
  def3.resolve();
});

$.when( def1, def2, def3 ).done(function ( v1, v2 ) {
  var linkinfo = v1,
      CDATE = v2[0].CDATE,
      CTIME = v2[0].CTIME;
  map = getMap();
  setSlider(linkinfo, CDATE, CTIME);

  $.getJSON( "/event_test", {
    CDATE: CDATE,
    CTIME: CTIME
  }, function(data) {
    for(var i =0; i< data.length;i++){
      var eIcon = getIcon(data[i].EVENTTYPE, data[i].LAT, data[i].LON);
      event_list.push(eIcon);
    }
  });
  $.getJSON( "/linkspeed_graph", {
    CDATE: CDATE,
    CTIME: CTIME,
    LINKID: "1001001",
    DIRECTION: "U"
  }, function(data) {
    setChart1(data);
  });

  $.getJSON( "/linkrisk_graph", {
    CDATE: CDATE,
    CTIME: CTIME,
    LINKID: "1001001",
    DIRECTION: "U"
  }, function(data) {
    setChart1_risk(data);
  });

  $.getJSON( "/aerr_graph", {
    CDATE: CDATE,
    LINDE: "1",
    LINKID: "1001001",
    DIRECTION: "U"
  }, function(data) {
    setChart2(data);
    setChart3(data);
  });
});

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
      xAxis: {
        tickInterval: 12
      },
      yAxis: {
        min: 0,
        max: 120,
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
      }],
      tooltip: {
          formatter: function(){
            return 'PTIME : ' + this.x + '<br/>PSPEED : '+this.y;
          }
      }
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
    categories: categories
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
      xAxis: {
        tickInterval: 12
      },
      yAxis: {
        min: 0,
        max: 1.5,
        title: {
          text: "Collision Risk"
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        name: "Collision Risk",
        data: [],
        id: "cRisk"
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
          }],
          tooltip: {
              formatter: function(){
                return 'PTIME : ' + this.x + '<br/>Collision Risk : '+this.y;
              }
          }

    });
  });
}

function setChart1_risk(data) {
  if(data["error"]=="lineNull"){
    document.getElementById("chartDiv1_risk").style.display = "none";
  }else{
    document.getElementById("chartDiv1_risk").style.display = "inline";
  }
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
    categories: categories
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

  if(data["error"]=="lineNull"){
    document.getElementById("chartDiv2").style.display = "none";
  }else{
    document.getElementById("chartDiv2").style.display = "inline";
  }
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
  categories.reverse();
  bValue.reverse();
  chart.xAxis[0].setCategories(categories);
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

  if(data["error"]=="lineNull"){
    document.getElementById("chartDiv3").style.display = "none";
  }else{
    document.getElementById("chartDiv3").style.display = "inline";
  }
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
  categories.reverse();
  bValue.reverse();
  chart.xAxis[0].setCategories(categories);
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

function setSlider(linkinfo, CDATE, CTIME) {
  $.getJSON( "/linkspeed_latest", {
    CDATE: CDATE,
    CTIME: CTIME
  }, function( datetime ) {
    var mySlider = $("#ex1").slider({
      max: datetime.length-1,
      value: datetime.length-1,
      formatter: function(value) {
        return "date : " + datetime[value].PDATE + "\n" +
               "time : " + datetime[value].PTIME;
      }
    });
    mySlider.on('slideStop', function(e) {
        getLinkspeed_map(linkinfo, CDATE, CTIME, datetime[e.value].PDATE, datetime[e.value].PTIME);
    });
    getLinkspeed_map(linkinfo, CDATE, CTIME, datetime[datetime.length-1].PDATE, datetime[datetime.length-1].PTIME);
  });
}

function getLinkspeed_map(linkinfo, CDATE, CTIME, PDATE, PTIME) {
  $.getJSON( "/linkspeed_map", {
    CDATE: CDATE,
    CTIME: CTIME,
    PDATE: PDATE,
    PTIME: PTIME
  }, function( data ) {
    var id2speed = {};
    $.each(data, function(idx, obj) {
      id2speed[$.trim(obj.LINKID)+$.trim(obj.DIRECTION)] = obj.PSPEED;
    });
    linkSpeed_list_U=[];
    linkSpeed_list_D=[];
    for(var i = 0; i < linkinfo.length; i++) {
      var polygon1 = getPolygon(linkinfo[i], "S", id2speed[linkinfo[i].LINKNO + "D"]),
          polygon2 = getPolygon(linkinfo[i], "U", id2speed[linkinfo[i].LINKNO + "U"]);

      polygon1.LINE = linkinfo[i].LINE;
      polygon1.LINKNO = linkinfo[i].LINKNO;
      polygon1.DIRECTION = "D";
      polygon1.CDATE = CDATE;
      polygon1.CTIME = CTIME;
      polygon2.LINE = linkinfo[i].LINE;
      polygon2.LINKNO = linkinfo[i].LINKNO;
      polygon2.DIRECTION = "U";
      polygon2.CDATE = CDATE;
      polygon2.CTIME = CTIME;

      Microsoft.Maps.Events.addHandler(polygon1, 'click', onClickHandler);
      Microsoft.Maps.Events.addHandler(polygon2, 'click', onClickHandler);
      //map.entities.push(polygon2);
      linkSpeed_list_U.push(polygon2);
      linkSpeed_list_D.push(polygon1);
      //map.entities.push(polygon1);
    }
    getLinkRisk_map(linkinfo, CDATE, CTIME, PDATE, PTIME)
    //resetLink();
  });
}

function getLinkRisk_map(linkinfo, CDATE, CTIME, PDATE, PTIME) {
  $.getJSON( "/linkrisk_map", {
    CDATE: CDATE,
    CTIME: CTIME,
    PDATE: PDATE,
    PTIME: PTIME
  }, function( data ) {
    var id2risk = {};
    $.each(data, function(idx, obj) {
      id2risk[$.trim(obj.LINKID)+$.trim(obj.DIRECTION)] = obj.COLLISIONRISKMEAN;
    });
    linkRisk_list_U = [];
    linkRisk_list_D = [];
    for(var i = 0; i < linkinfo.length; i++) {
      var polygon1 = getPolygon_risk(linkinfo[i], "S", id2risk[linkinfo[i].LINKNO + "D"]),
          polygon2 = getPolygon_risk(linkinfo[i], "U", id2risk[linkinfo[i].LINKNO + "U"]);

      polygon1.LINE = linkinfo[i].LINE;
      polygon1.LINKNO = linkinfo[i].LINKNO;
      polygon1.DIRECTION = "D";
      polygon1.CDATE = CDATE;
      polygon1.CTIME = CTIME;
      polygon2.LINE = linkinfo[i].LINE;
      polygon2.LINKNO = linkinfo[i].LINKNO;
      polygon2.DIRECTION = "U";
      polygon2.CDATE = CDATE;
      polygon2.CTIME = CTIME;

      Microsoft.Maps.Events.addHandler(polygon1, 'click', onClickHandler);
      Microsoft.Maps.Events.addHandler(polygon2, 'click', onClickHandler);
      //map.entities.push(polygon2);
      linkRisk_list_U.push(polygon2);
      linkRisk_list_D.push(polygon1);
      //map.entities.push(polygon1);
    }
    weatherTest(CDATE, CTIME);

  });
}
function weatherTest(CDATE, CTIME){
  $.getJSON( "/weather_test", {
    CDATE: CDATE,
    CTIME: CTIME
  }, function(data) {
    wearther_list = [];
    for(var i =0; i< data.length;i++){
      var wIcon = getIcon(data[i].WEATHERTYPE, data[i].LAT, data[i].LON);
      wearther_list.push(wIcon);
    }
    resetLink();
  });
}
function resetLink(){
  map.entities.clear();
  if(dir=="U"){
    if(riskOn=="F"){
      for(var i=0;i<linkSpeed_list_U.length;i++){
        map.entities.push(linkSpeed_list_U[i]);
      }
    }else{
      for(var i=0;i<linkRisk_list_U.length;i++){
        map.entities.push(linkRisk_list_U[i]);
      }
    }
  }else{
    if(riskOn=="F"){
      for(var i=0;i<linkSpeed_list_D.length;i++){
        map.entities.push(linkSpeed_list_D[i]);
      }
    }else{
      for(var i=0;i<linkRisk_list_D.length;i++){
        map.entities.push(linkRisk_list_D[i]);
      }
    }
  }
  for(var i=0;i<event_list.length;i++){
    map.entities.push(event_list[i]);
  }
  if(weatherOn=="T"){
    for(var i=0;i<wearther_list.length;i++){
      map.entities.push(wearther_list[i]);
    }
  }

}

function onClickHandler(e) {
  if (e.targetType == "polygon") {
    var cLineNo = e.target.LINE;
    $.getJSON( "/linkspeed_graph", {
      CDATE: e.target.CDATE,
      CTIME: e.target.CTIME,
      LINKID: e.target.LINKNO,
      DIRECTION: e.target.DIRECTION
    }, function(data) {
      setChart1(data);
    });
    $.getJSON( "/linkrisk_graph", {
      CDATE: e.target.CDATE,
      CTIME: e.target.CTIME,
      LINE: e.target.LINE,
      LINKID: e.target.LINKNO,
      DIRECTION: e.target.DIRECTION
    }, function(data) {
      if(cLineNo!="1000" && cLineNo!="2000" && cLineNo!="3000")
      {
        setChart1_risk(data);
      }else {
        setChart1_risk({error: "lineNull"});
      }
    });

    $.getJSON( "/aerr_graph", {
      CDATE: e.target.CDATE,
      LINE: e.target.LINE,
      LINKID: e.target.LINKNO,
      DIRECTION: e.target.DIRECTION
    }, function(data) {
      if(cLineNo=="1000" || cLineNo=="2000" || cLineNo=="3000"){
        setChart3(data);
        setChart2({error: "lineNull"});
      }else{
        setChart3({error: "lineNull"});
        setChart2(data);
      }
    });
  }
}
$(document).ready(function() {
    $('#direction_btn').on('click', function () {
      if($(this).text()=='Direction : U'){
        $(this).text('Direction : D');
        dir = "D";
        resetLink();
      }else{
        $(this).text('Direction : U');
        dir = "U";
        resetLink();
      }
    });
    $('#risk_btn').on('click', function () {
      if($(this).text()=='Risk Off'){
        $(this).text('Risk On');
        riskOn = "T";
        resetLink();
      }else{
        $(this).text('Risk Off');
        riskOn = "F";
        resetLink();
      }
    });
    $('#weather_btn').on('click', function () {
      if($(this).text()=='Weather Off'){
        $(this).text('Weather On');
        weatherOn = "T";
        resetLink();
      }else{
        $(this).text('Weather Off');
        weatherOn = "F";
        resetLink();
      }
    });
});
