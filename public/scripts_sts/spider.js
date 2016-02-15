/**
 * header.js
 *
 * Copyright 2014 Michael Barry & Brian Card.  MIT open-source lincense.
 *
 * Render the header for the visualization
 */

(function () {
  "use strict";
  var svg = d3.select('.header .graphic').append("svg").attr('width', 283).attr('height', 283);

  // Render the station map first, then load the train data and start animating trains
  VIZ.requiresData([
    // nodes and links that comprise the subway system network
    'json!newdata/station-network.json',
    // hard-coded positions for each station on the map glyph
    'json!newdata/spider.json'
  ], true).done(function (network, spider) {
    // pre-process the data
    var idToNode = {}, idToLine = {}, trips, positions, ptimes = [];
    network.nodes.forEach(function (node, idx) {
      node.idx = idx + 1;
      node.x = spider[node.id][0];
      node.y = spider[node.id][1];
      idToNode[node.id] = node;
    });
    network.links.forEach(function (link) {
      link.source = network.nodes[link.source] || {};
      link.target = network.nodes[link.target] || {};
      link.source.links = link.source.links || [];
      link.target.links = link.target.links || [];
      link.target.links.splice(0, 0, link);
      link.source.links.splice(0, 0, link);
      idToLine[link.source.id + '|' + link.target.id] = link.line;
      idToLine[link.target.id + '|' + link.source.id] = link.line;
    });

    // watch height to adjust visualization after loading data
    VIZ.watchSize(function () {
      drawMap(svg, $('.graphic').width(), $('.graphic').width());
    });

    // render the map given a particular width and height that it needs to fit into
    function drawMap(svgContainer, outerWidth, outerHeight) {
      var margin = {top: 20, right: 30, bottom: 10, left: 10};
      var xRange = d3.extent(network.nodes, function (d) { return d.x; });
      var yRange = d3.extent(network.nodes, function (d) { return d.y; });
      var width = outerWidth - margin.left - margin.right,
          height = outerHeight - margin.top - margin.bottom;
      var xScale = width / (xRange[1] - xRange[0]);
      var yScale = height / (yRange[1] - yRange[0]);
      var scale = Math.min(xScale, yScale);

      network.nodes.forEach(function (data) {
        data.pos = [(data.x-xRange[0]) * scale, (data.y-yRange[0]) * scale];
      });
      var endDotRadius = 0.2 * scale;

      var svg = svgContainer
          .attr('width', Math.max(250, scale * (xRange[1] - xRange[0]) + margin.left + margin.right))
          .attr('height', scale * (yRange[1] - yRange[0]) + margin.top + margin.bottom)
        .appendOnce('g', 'map-container')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.appendOnce('text', 'time-display')
        .attr('x', svgContainer.attr('width') * 0.55 - 10)
        .attr('y', svgContainer.attr('height') * 0.55);

      var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) { return d.name; });
      svg.call(tip);

      var stations = svg.selectAll('.station')
          .data(network.nodes, function (d) { return d.name; });

      var connections = svg.selectAll('.connect')
          .data(network.links, function (d) { return (d.source && d.source.id) + '-' + (d.target && d.target.id); });

      connections
          .enter()
        .append('line')
          .attr('class', function (d) { return 'connect ' + d.line; });

      connections
          .attr('x1', function (d) { return d.source.pos[0]; })
          .attr('y1', function (d) { return d.source.pos[1]; })
          .attr('x2', function (d) { return d.target.pos[0]; })
          .attr('y2', function (d) { return d.target.pos[1]; });

      stations
          .enter()
        .append('circle')
          .attr('class', function (d) { return 'station middle station-label ' + d.id; })
          .on('mouseover', function (d) {
            if (d.pos[1] < 30) {
              tip.direction('e')
                .offset([0, 10]);
            } else {
              tip.direction('n')
                .offset([-10, 0]);
            }
            tip.show(d);
          })
          .on('mouseout', tip.hide);

      stations.attr('cx', function (d) { return d.pos[0]; })
          .attr('cy', function (d) { return d.pos[1]; })
          .attr('r', 2);

      // line color circles at the end of each line
      function dot(id, clazz) {
        svg.selectAll('circle.' + id)
          .classed(clazz, true)
          .classed('end', true)
          .classed('middle', false)
          .attr('r', Math.max(endDotRadius, 3));
      }
      dot('place-asmnl', "red");
      dot('place-alfcl', "red");
      dot('place-brntn', "red");
      dot('place-wondl', "blue");
      dot('place-bomnl', "blue");
      dot('place-forhl', "orange");
      dot('place-ogmnl', "orange");
      if (trips) {
        renderTrainsBySpeed(lastTime, true);
      }
    }
  });

  // add draggable markers
  var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

  var markers = [];
  var templates = [{
    type: "accident",
    title: "Accident",
    url: "images/squat-marker-red.svg",
    x: 0,
    y: 0
  }, {
    type: "roadwork",
    title: "Road Work",
    url: "images/squat-marker-yellow.svg",
    x: 0,
    y: 50
  }, {
    type: "weather",
    title: "Weather",
    url: "images/squat-marker-green.svg",
    x: 0,
    y: 100
  }];

  templates.forEach(function(template) {
    createMarker(template.type);
  });

  for(var i = 13; i <= 18; i++) {
    for(var j = 0; j <= 55; j+=5) {
      var t = i + ":" + (j < 10 ? "0" : "") + j;
      $(".sim-input [name='start_time'], .sim-input [name='end_time']")
          .append("<option>" + t + "</option>");
    }
  }

  function createMarker(type) {
    var marker = templates.filter(function(temp) {
      return temp.type === type;
    })[0];
    marker = JSON.parse(JSON.stringify(marker));
    markers.push(marker);
    d3.xml(marker.url, "image/svg+xml", function(error, xml) {
      if (error) throw error;

      var container = svg.append("g").data([marker]);
      var svgNode = xml.getElementsByTagName("svg")[0];
      container.node().appendChild(svgNode);
      container
        .attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")"; })
        .on("click", clicked)
        .call(drag)
        .select("svg")
          .attr("width", 25)
          .attr("height", 39);
    });
  }

  function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    if(!d.fixed) {
      d3.select(this).classed("dragging", true);
    }
  }

  function dragged(d) {
    if(d.fixed) {
      return;
    }
    var min = Infinity,
        marker = svg.select("#layer1"),
        box = marker.node().getBBox(),
        snap = false;
    d.x = d3.event.x;
    d.y = d3.event.y;
    var connections = svg.selectAll('.connect').each(function() {
      var line = d3.select(this),
          cx = (+line.attr("x1") + +line.attr("x2")) / 2 - 2,
          cy = (+line.attr("y1") + +line.attr("y2")) / 2 - box.height / 2,
          dist_cube = (d.x - cx) * (d.x - cx) + (d.y - cy) * (d.y - cy);
      if(dist_cube < 100 && dist_cube < min) {
        min = dist_cube;
        d.x = cx;
        d.y = cy;
        d.data = line.data()[0];
        snap = true;
      }
    });
    d.snap = snap;
    d3.select(this).attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")"; })
  }

  function dragended(d) {
    d3.select(this).classed("dragging", false);
    if(d.snap && !d.fixed) {
      d.fixed = true;
      createMarker(d.type);
    }
  }

  function clicked(d) {
    if(d.fixed) {
      popupSimInput(d);
    }
  }

  function popupSimInput(d) {
    var min = Math.min(d.data.smile, d.data.emile),
        max = Math.max(d.data.smile, d.data.emile),
        $form = $(".sim-input");
    $form.data("data", d).removeClass().addClass("sim-input " + d.type).show();
    $form.find("h1").text(d.title);
    $form.find(".line").text(d.data.color + " (" + d.data.line + ")");
    $form.find(".milepost").text(min + " KM ~ " + max + " KM");
    $form.find(".location").val(d.location || "")
        .attr("placeholder", "Between " + min + " ~ " + max + " (default 0)");
    $form.find("[name='direction']")
        .filter("[value='" + (d.direction||"UP") + "']").prop('checked', true);
    $form.find("[name='start_time']").val(d.start_time || "13:00");
    $form.find("[name='end_time']").val(d.end_time || "13:00");
    $form.find("[name='blocked_lane']").val(d.blocked_lane || "1");
    // TODO: Road Work와 Weather입력
  }

  $(".sim-input .insert").click(function(e) {
    e.preventDefault();
    var $form = $(".sim-input"),
        d = $form.data("data");
    d.location = $form.find(".location").val();
    d.direction = $form.find("input[type=radio]:checked").val();
    d.start_time = $form.find("[name='start_time']").val();
    d.end_time = $form.find("[name='end_time']").val();
    d.blocked_lane = $form.find("[name='blocked_lane']").val();
    $form.hide();
  });
  $(".sim-input .delete").click(function(e) {
    e.preventDefault();
    removeMarker();
    $(".sim-input").hide();
  });

  function removeMarker() {
    var d = $(".sim-input").data("data");
    for(var i = 0; i < markers.length; i++) {
      if(d === markers[i]) {
        markers.splice(i, 1);
        break;
      }
    }
    svg.selectAll("g").filter(function(obj) {
      return obj === d;
    }).remove();
  }
}());
