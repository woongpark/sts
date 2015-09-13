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

  $.getJSON( "/herr_graph", {
    CDATE: CDATE,
    LINDE: "1",
    LINKID: "1001001",
    DIRECTION: "U"
  }, function(data) {
    if(data != "lineNull"){
      setChart2(data);
    }
  });
  $.getJSON( "/aerr_graph", {
    CDATE: CDATE,
    LINDE: "1",
    LINKID: "1001001",
    DIRECTION: "U"
  }, function(data) {
    if(data != "lineNull"){
      setChart3(data);
    }
  });
});

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
      if(data != "lineNull"){
        setChart1_risk(data);
      }
    });
    $.getJSON( "/herr_graph", {
      CDATE: e.target.CDATE,
      LINE: e.target.LINE,
      LINKID: e.target.LINKNO,
      DIRECTION: e.target.DIRECTION
    }, function(data) {
      if(data != "lineNull"){
        setChart2(data);
      }
    });
    $.getJSON( "/aerr_graph", {
      CDATE: e.target.CDATE,
      LINE: e.target.LINE,
      LINKID: e.target.LINKNO,
      DIRECTION: e.target.DIRECTION
    }, function(data) {
      if(data != "lineNull"){
        setChart3(data);
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
