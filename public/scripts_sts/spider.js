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
  var margin = {top: 10, right: 10, bottom: 10, left: 10};

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

  var forms = {
    line: '<label>Line</label> : '
        + '<%= link_data.color %> (<%= link_data.line %>)',
    node: '<label>Node</label> : '
        + '<%= node_data.id %>',
    milepost: '<label>Mile Post</label> : '
        + '<%= Math.min(link_data.smile, link_data.emile) %> KM ~ '
        + '<%= Math.max(link_data.smile, link_data.emile) %> KM',
    location: '<label>Location</label><br/>'
        + '<input name="LOCATION" type="number"'
        + ' placeholder="Between <%= Math.min(link_data.smile, link_data.emile) %> ~ '
        + '<%= Math.max(link_data.smile, link_data.emile) %> (default 0)"/>',
    direction: '<label>Direction</label><br/>'
        + '<select name="DIRECTION">'
        +   '<option value="U">Up</option><option value="D">Down</option>'
        + '</select>',
    direction2: '<label>Direction</label><br/>'
        + '<select name="DIRECTION">'
        +   '<option value="U">Up</option><option value="D">Down</option><option value="B">Both</option>'
        + '</select>',
    time: '<label>Start Time</label><label class="second">End Time</label><br/>'
        + '<select name="STARTTIME">' + getTimeOptions() + '</select>'
        + '<select name="ENDTIME" class="second">' + getTimeOptions() + '</select>',
    blockedlane: '<label>Blocked Lane</label><br/>'
        + '<select name="SEVERITY">'
        +   '<option>1</option>'
        +   '<option>2</option>'
        +   '<option>3</option>'
        +   '<option>4</option>'
        + '</select>',
    weather: '<label>Weather</label><br/>'
        + '<select name="SEVERITY">'
        +   '<option value="1">1(Dry)</option>'
        +   '<option value="2">2(Wet)</option>'
        +   '<option value="3">3(Rain)</option>'
        +   '<option value="4">4(Snow)</option>'
        + '</select>',
    blockratio: '<label>Block Ratio</label><br/>'
        + '<input name="SETTING" type="number" min="0" max="100"'
        + ' placeholder="Between 0 ~ 100% (default 0)"/>',
    fakerate: '<label>Fake Rate</label><br/>'
        + '<input name="SETTING" type="number" min="0" max="500"'
        + ' placeholder="Between 0 ~ 500 (default 100)"/>',
    speedlimit: '<label>Speed Limit</label><br/>'
        + '<input name="SETTING" type="number" min="0" max="150"'
        + ' placeholder="Between 0 ~ 150 (default 100)"/>',
    speedlimit: '<label>Capacity Change</label><br/>'
        + '<input name="SETTING" type="number" min="0" max="1000"'
        + ' placeholder="Between 0 ~ 1000 (default 100)"/>'
  };

  var markers = [];
  var templates = [{
    type: "accident",
    title: "Accident",
    shape: "images/squat-marker-red.svg",
    x: 0,
    y: 0,
    snapto: "link",
    forms: [
      forms.line,
      forms.milepost,
      forms.location,
      forms.direction,
      forms.time,
      forms.blockedlane
    ],
    data: {
      EVENTTYPE: "1"
    }
  }, {
    type: "roadwork",
    title: "Road Work",
    shape: "images/squat-marker-yellow.svg",
    x: 0,
    y: 50,
    snapto: "link",
    forms: [
      forms.line,
      forms.milepost,
      forms.location,
      forms.direction,
      forms.time,
      forms.blockedlane
    ],
    data: {
      EVENTTYPE: "2"
    }
  }, {
    type: "weather",
    title: "Weather",
    shape: "images/squat-marker-green.svg",
    x: 0,
    y: 100,
    snapto: "link",
    forms: [
      forms.line,
      forms.milepost,
      forms.location,
      forms.direction,
      forms.time,
      forms.weather
    ],
    data: {
      EVENTTYPE: "3"
    }
  }, {
    type: "ramp",
    title: "Ramp Metering",
    x: 3,
    y: 150,
    shape: "rect",
    color: "red",
    snapto: "node",
    forms: [
      forms.node,
      forms.direction2,
      forms.time,
      forms.blockratio
    ],
    data: {
      CONTROLTYPE: "1"
    }
  }, {
    type: "travel",
    title: "Travel Time Information",
    x: 3,
    y: 180,
    shape: "rect",
    color: "yellow",
    snapto: "link",
    forms: [
      forms.line,
      forms.milepost,
      forms.location,
      forms.direction,
      forms.time,
      forms.fakerate
    ],
    data: {
      CONTROLTYPE: "2"
    }
  }, {
    type: "variable",
    title: "Variable Speed Limit",
    x: 3,
    y: 210,
    shape: "rect",
    color: "blue",
    snapto: "link",
    forms: [
      forms.line,
      forms.milepost,
      forms.location,
      forms.direction,
      forms.time,
      forms.speedlimit
    ],
    data: {
      CONTROLTYPE: "3"
    }
  }, {
    type: "newcontrol",
    title: "New Control",
    x: 3,
    y: 240,
    shape: "rect",
    color: "green",
    snapto: "link",
    forms: [
      forms.line,
      forms.milepost,
      forms.location,
      forms.direction,
      forms.time,
      forms.capacitychange
    ],
    data: {
      CONTROLTYPE: "4"
    }
  }];

  templates.forEach(function(template) {
    createMarker(template.type);
  });

  function getTimeOptions() {
    var result = "";
    for(var i = 13; i <= 18; i++) {
      for(var j = 0; j <= 55; j+=5) {
        var hh = i,
            mm = (j < 10 ? "0" : "") + j;
        result += '<option value="' + hh + mm + '">' + hh + ':' + mm + '</option>';
      }
    }
    return result;
  }

  function createMarker(type) {
    var marker = templates.filter(function(temp) {
      return temp.type === type;
    })[0];
    marker = JSON.parse(JSON.stringify(marker));
    markers.push(marker);
    if(marker.shape == "rect") {
      var container = svg.append("g").classed("marker", true).data([marker])
        .attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")"; })
        .on("click", clicked)
        .call(drag);

      container.append("rect")
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", marker.color)
          .attr("stroke", "black")
          .attr("stroke-width", 2);
      container.append("circle")
          .attr("cx", 10)
          .attr("cy", 10)
          .attr("r", 2)
          .attr("fill", "black");

    } else {
      d3.xml(marker.shape, "image/svg+xml", function(error, xml) {
        if (error) throw error;

        var container = svg.append("g").classed("marker", true).data([marker]);
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
        marker = d3.selectAll(".marker").filter(function(_d) {
          return d == _d;
        }),
        box = marker.node().getBBox(),
        px = marker.data()[0].shape == "rect" ? -box.width / 2 : -box.width / 2,
        py = marker.data()[0].shape == "rect" ? -box.height / 2 : -box.height;
    d.x = d3.event.x;
    d.y = d3.event.y;
    d.snap = false;
    if(d.snapto == "link") {
      svg.selectAll('.connect').each(function() {
        var line = d3.select(this),
            cx = (+line.attr("x1") + +line.attr("x2")) / 2 + px + margin.left,
            cy = (+line.attr("y1") + +line.attr("y2")) / 2 + py + margin.top,
            dist_cube = (d.x - cx) * (d.x - cx) + (d.y - cy) * (d.y - cy);
        if(dist_cube < 100 && dist_cube < min) {
          min = dist_cube;
          d.x = cx;
          d.y = cy;
          d.snap = true;
          d.link_data = line.data()[0];
          d.data.LINKID = "" + line.data()[0].linkid;
        }
      });
    } else {
      svg.selectAll('.station').each(function() {
        var circle = d3.select(this),
            cx = +circle.attr("cx") + px + margin.left,
            cy = +circle.attr("cy") + py + margin.top,
            dist_cube = (d.x - cx) * (d.x - cx) + (d.y - cy) * (d.y - cy);
        if(dist_cube < 100 && dist_cube < min) {
          min = dist_cube;
          d.x = cx;
          d.y = cy;
          d.snap = true;
          d.node_data = circle.data()[0];
          d.data.LINKID = "" + circle.data()[0].id;
        }
      });
    }
    d3.select(this).attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")"; })
  }

  function dragended(d) {
    d3.select(this).classed("dragging", false);
    if(d.snap && !d.fixed) {
      d.fixed = true;
      createMarker(d.type);
      popupSimInput(d);
    }
  }

  function clicked(d) {
    if(d.fixed) {
      popupSimInput(d);
    }
  }

  function popupSimInput(d) {
    var $popup = $(".popup"),
        $form = $(".sim-input");
    $popup.removeClass().addClass("popup " + d.type).show();
    $popup.find("h1").text(d.title);
    $form.data("data", d).html("");
    d.forms.forEach(function(form) {
      var $row = $('<div class="popup-row">').append(_.template(form)(d));
      $form.append($row);
    });
    for(var key in d.data) {
      $form.find("[name='" + key + "']").val(d.data[key]);
    }
  }

  $(".popup .insert").click(function(e) {
    e.preventDefault();
    var $form = $(".sim-input"),
        d = $form.data("data");
    $form.find("[name]").each(function() {
      var $this = $(this),
          key = $this.attr("name"),
          val = $this.val();
      if($this.attr("type") == "number") {
        val = +val;
      }
      d.data[key] = val;
    });
    $(".popup").hide();
  });
  $(".popup .delete").click(function(e) {
    e.preventDefault();
    removeMarker();
    $(".popup").hide();
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

  $("#sim-run").click(function() {
    var sim_no = moment().format("YYYYMMDDhhmm");
    var data = markers.filter(function(datum) {
      var isSim = {"accident":1, "roadwork":1, "weather":1}[datum.type];
      return datum.fixed && isSim;
    }).map(function(datum, index) {
      datum.data.SIMULATIONNO = Number(sim_no.substring(8,12));
      datum.data.EVENTNO = index + 1;
      return datum.data;
    });
    data.forEach(function(datum) {
      // $.getJSON( "/sim_input", datum, function() {
      // });
    });
    console.log(data);
  });

  $("#con-run").click(function() {
    var sim_no = moment().format("YYYYMMDDhhmm");
    var data = markers.filter(function(datum) {
      var isCon = {"ramp":1, "travel":1, "variable":1, "newcontrol":1}[datum.type];
      return datum.fixed && isCon;
    }).map(function(datum, index) {
      datum.data.SIMULATIONNO = Number(sim_no.substring(8,12));
      datum.data.CONTROLNO = index + 1;
      return datum.data;
    });
    data.forEach(function(datum) {
      // $.getJSON( "/con_input", datum, function() {
      // });
    });
    console.log(data);
  });

}());
