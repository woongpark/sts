$(function() {
  "use strict";

  $('#VHT').highcharts({
    chart: { type: 'column' },
    title: { text: 'Vehicle Hour Traveled (VHT)' },
    xAxis: { categories: ['Without', 'With'] },
    yAxis: {
      min: 0,
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        }
      }
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
          style: { textShadow: '0 0 3px black' }
        }
      }
    },
    series: [
      { name: 'Kyungbu', data: [0, 0] },
      { name: 'Seohaean', data: [0, 0] },
      { name: 'CheonanNonsan', data: [0, 0] },
      { name: 'DanjikYoungduk', data: [0, 0] },
      { name: 'Joongbu', data: [0, 0] },
      { name: 'PyungtaekJecheon', data: [0, 0] },
      { name: 'Youngdong', data: [0, 0] },
    ]
  });

  $('#COLLISION').highcharts({
    chart: { type: 'column' },
    title: { text: 'Collision Risk' },
    xAxis: { categories: ['Without', 'With'] },
    yAxis: {
      min: 0,
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        }
      }
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
          style: { textShadow: '0 0 3px black' }
        }
      }
    },
    series: [
      { name: 'Kyungbu', data: [0, 0] },
      { name: 'Seohaean', data: [0, 0] },
      { name: 'CheonanNonsan', data: [0, 0] },
      { name: 'DanjikYoungduk', data: [0, 0] },
      { name: 'Joongbu', data: [0, 0] },
      { name: 'PyungtaekJecheon', data: [0, 0] },
      { name: 'Youngdong', data: [0, 0] },
    ]
  });

  $('#CRT').highcharts({
    chart: { type: 'column' },
    title: { text: 'Travel Time (between SEOUL and DAEJEON)' },
    xAxis: { categories: [ 'GYUNGBU', 'JUNGBU', 'SEOHAE' ] },
    series: [{
      name: 'Without(Down)',
      data: [0, 0, 0]
    }, {
      name: 'With(Down)',
      data: [0, 0, 0]
    }, {
      name: 'Without(Up)',
      data: [0, 0, 0]
    }, {
      name: 'With(Up)',
      data: [0, 0, 0]
    }]
  });

  $.getJSON("/sim_summary", function(summary) {
    var hours = summary[0].HORIZON.trim() + " hours";
    var ctime = summary[0].CTIME.trim();
    var number = summary[0].NUMBER.trim();
    ctime = ctime.slice(0, 2) + ":" + ctime.slice(2) + " PM";
    if(number.length > 3) {
      number = number.slice(0, -3) + "," + number.slice(-3);
    }
    $(".summary .horizon").text(hours);
    $(".summary .ctime").text(ctime);
    $(".summary .number").text(number);
  });
  $.getJSON("/sim_event", function(summary) {
    summary.forEach(function(ev) {
      var text = "";
      $.each(ev, function(name, value) {
        text += "<label>" + name + "</label>";
        text += "<span>" + value + "</span>";
      });
      $(".event.summary").append("<li>").html(text);
    });
  });
  $.getJSON( "/sim_vht_ptimes", function( result ) {
    var ptimes = $.map(result.data, function(arr) {
      return arr[0];
    });
    var mySlider = $("#ex1").slider({
      max: ptimes.length-1,
      value: ptimes.length-1,
      formatter: function(value) {
        return "PTIME : " + ptimes[value];
      }
    });
    mySlider.on('slideStop', function(e) {
        setVHTchart(ptimes[e.value]);
    });
    setVHTchart(ptimes[ptimes.length-1]);
  });
  function setVHTchart(ptime) {
    $.getJSON("/sim_vht", {
      PTIME: ptime
    }, function(result) {
      var series = result.data.map(function(arr) {
        return [+arr[2], +arr[3]];
      });
      var chart = $('#VHT').highcharts();
      for(var i = 0; i < series.length; i++) {
        chart.series[i].setData(series[i]);
      }
      chart.redraw();
    });
    $.getJSON("/sim_collision", {
      PTIME: ptime
    }, function(result) {
      var series = result.data.map(function(arr) {
        return [+arr[2], +arr[3]];
      });
      var chart = $('#COLLISION').highcharts();
      for(var i = 0; i < series.length; i++) {
        chart.series[i].setData(series[i]);
      }
      chart.redraw();
    });
    $.getJSON("/sim_crt", {
      PTIME: ptime
    }, function(result) {
      var categories = ['GYUNGBU', 'JUNGBU', 'SEOHAE'];
      var series = [ [], [], [], [] ];
      result.data.forEach(function(arr) {
        var idx = 0;
        for(var i = 0; i < categories.length; i++) {
          if(arr[1].indexOf(categories[i]) >= 0) {
            idx = i;
            break;
          }
        }
        if(arr[2] == "D") {
          series[0][idx] = +arr[3]; // ATIME
          series[1][idx] = +arr[4]; // CTIME
        } else { // "U"
          series[2][idx] = +arr[3]; // ATIME
          series[3][idx] = +arr[4]; // CTIME
        }
      });
      var chart = $('#CRT').highcharts();
      for(var i = 0; i < series.length; i++) {
        chart.series[i].setData(series[i]);
      }
      chart.redraw();
    });
  }
});
