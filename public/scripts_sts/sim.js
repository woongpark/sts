$(function() {
  "use strict";


  // $.getJSON("/sim_event", function(summary) {
  //   summary.forEach(function(ev) {
  //     var text = "";
  //     $.each(ev, function(name, value) {
  //       text += "<label>" + name + "</label> : ";
  //       text += "<span>" + value + "</span>" + "<br/>";
  //     });
  //     $(".event.summary").append("<li>").html(text);
  //   });
  // });

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
        setChartByPTIME(ptimes[e.value]);
    });
    setChartByPTIME(ptimes[ptimes.length-1]);
  });
  function setChartByPTIME(ptime) {
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
    $.getJSON("/sim_vsl", {
      PTIME: ptime
    }, function(result) {
      var container = $('#VSL .chart-area');
      var chart = new google.visualization.Timeline(container.get(0));
      var dataTable = new google.visualization.DataTable();
      dataTable.addColumn({ type: 'string', id: 'Routes' });
      dataTable.addColumn({ type: 'string', id: 'dummy bar label' });
      dataTable.addColumn({ type: 'string', role: 'tooltip' });
      dataTable.addColumn({ type: 'number', id: 'Start' });
      dataTable.addColumn({ type: 'number', id: 'End' });
      var rowLabels = [];
      var rows = result.data.map(function(arr) {
        if(!rowLabels[+arr[7]-1]) {
          rowLabels[+arr[7]-1] = arr[2];
        }
        return [
          arr[2],
          arr[5],
          Math.min(+arr[3], +arr[4]) + "~" + Math.max(+arr[3], +arr[4]),
          Math.min(+arr[3], +arr[4]),
          Math.max(+arr[3], +arr[4])
        ];
      });
      dataTable.addRows(rows);
      chart.clearChart();
      chart.draw(dataTable, {
        timeline: {
          showRowLabels: false,
          colorByRowLabel: true
        }
      });
      if($("#VSL .row-label").length == 0) {
        rowLabels.forEach(function(str) {
          $("<div class='row-label'>").text(str).appendTo("#VSL .label-area");
        });
      }
    });
  }

  $.getJSON("/sim_cti", function(result) {
    var container = $('#traveltime .chart-area');
    var chart = new google.visualization.Timeline(container.get(0));
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'string', id: 'Routes' });
    dataTable.addColumn({ type: 'string', id: 'dummy bar label' });
    dataTable.addColumn({ type: 'string', role: 'tooltip' });
    dataTable.addColumn({ type: 'date', id: 'Start' });
    dataTable.addColumn({ type: 'date', id: 'End' });
    var rowLabels = [];
    var rows = result.data.map(function(arr) {
      var hour = +arr[0].slice(0,2),
          min = +arr[0].slice(2);
      if(!rowLabels[+arr[5]-1]) {
        rowLabels[+arr[5]-1] = arr[1];
      }
      return [
        arr[1],
        arr[2] + "(" + arr[3] + "%)",
        arr[2] + "(" + arr[3] + "%)",
        new Date(2015, 0, 1, hour, min),
        new Date(2015, 0, 1, hour, min + 5)
      ];
    });
    dataTable.addRows(rows);
    chart.draw(dataTable, {
      timeline: {
        showRowLabels: false,
        colorByRowLabel: true
      }
    });
    rowLabels.forEach(function(str) {
      $("<div class='row-label'>").text(str).appendTo("#traveltime .label-area");
    });
  });
});
