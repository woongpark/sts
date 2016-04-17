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


});
