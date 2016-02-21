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

  var markers = [];
  var templates = [{
    type: "accident",
    title: "Accident",
    shape: "images/squat-marker-red.svg",
    x: 0,
    y: 0,
    snapto: "link",
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
    data: {
      EVENTTYPE: "3"
    }
  }, {
    type: "ramp",
    title: "Ramp Metering",
    x: 0,
    y: 150,
    shape: "rect",
    color: "green",
    snapto: "node",
    data: {
      CONTROLTYPE: "1"
    }
  }];

  templates.forEach(function(template) {
    createMarker(template.type);
  });

  for(var i = 13; i <= 18; i++) {
    for(var j = 0; j <= 55; j+=5) {
      var hh = i,
          mm = (j < 10 ? "0" : "") + j;
      $(".sim-input [name='STARTTIME'], .sim-input [name='ENDTIME']")
          .append('<option value="' + hh + mm + '">' + hh + ':' + mm + '</option>');
    }
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
    var min = Math.min(d.link_data.smile, d.link_data.emile),
        max = Math.max(d.link_data.smile, d.link_data.emile),
        $form = $(".sim-input");
    $form.data("data", d).removeClass().addClass("sim-input " + d.type).show();
    $form.find("h1").text(d.title);
    $form.find(".line").text(d.link_data.color + " (" + d.link_data.line + ")");
    $form.find(".milepost").text(min + " KM ~ " + max + " KM");
    $form.find("[name='LOCATION']")
        .attr("placeholder", "Between " + min + " ~ " + max + " (default 0)");
    if(d.type == "accident" || d.type == "roadwork") {
      $form.find(".severity label").text("Blocked Lane");
      $form.find("[name='SEVERITY'] option").each(function() {
        $(this).text($(this).val());
      });
    } else {
      $form.find(".severity label").text("Weather");
      $form.find("[name='SEVERITY'] option").each(function(index) {
        $(this).text(['1(Dry)', '2(Wet)', '3(Rain)', '4(Snow)'][index]);
      });
    }
    $form.find("[name]").each(function() {
      var $this = $(this),
          key = $this.attr("name"),
          val = d.data[key];
      if(val) {
        $this.val(val);
      } else if(this.tagName == "INPUT") {
        $this.val("");
      } else if(this.tagName == "SELECT") {
        this.selectedIndex = 0;
      }
    });
  }

  $(".sim-input .insert").click(function(e) {
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

  $("#sim-run").click(function() {
    var data = getSimInfo();
    console.log(data);
    // for(var i=0; i< data.length;i++) {
    //   $.getJSON( "/sim_input", data[i], function() {
    //
    //   });
    // }
  });

  function getSimInfo() {
    var sim_no = moment().format("YYYYMMDDhhmm");
    var data = markers.filter(function(datum) {
      var isSim = {"accident":1, "roadwork":1, "weather":1}[datum.type];
      return datum.fixed && isSim;
    }).map(function(datum, index) {
      datum.data.SIMULATIONNO = Number(sim_no.substring(8,12));
      datum.data.EVENTNO = index + 1;
      return datum.data;
    });
    return data;
  }
}());
