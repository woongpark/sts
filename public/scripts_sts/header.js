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
    'json!newdata/spider.json',
  ], true).done(function (network, spider) {
    // pre-process the data
    var idToNode = {}, idToLine = {}, trips, positions, ptimes = [];
    network.nodes.forEach(function (data) {
      data.x = spider[data.id][0];
      data.y = spider[data.id][1];
      idToNode[data.id] = data;
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

/*
    // return the center location for a train given the two stations it is between and
    // how far along that segment it is
    function placeWithOffset(from, to, ratio) {
      var fromPos = [from.pos[0], from.pos[1]];
      var toPos = [to.pos[0], to.pos[1]];
      var midpoint = d3.interpolate(fromPos, toPos)(ratio);
      var angle = Math.atan2(toPos[1] - fromPos[1], toPos[0] - fromPos[0]) + Math.PI / 2;
      return [midpoint[0] + Math.cos(angle) * radius, midpoint[1] + Math.sin(angle) * radius];
    }
  */

    var radius = 2;
    // var minUnixSeconds = moment('2015/01/01 13:00 +0900', 'YYYY/MM/DD HH:m ZZ').valueOf() / 1000;
    // var maxUnixSeconds = moment('2015/01/01 19:00 +0900', 'YYYY/MM/DD HH:m ZZ').valueOf() / 1000;
    var minTime = 0;
    var maxTime = 0;

    // number of times per second to recalculate trajectories of trains
    var PER_SECOND = 10;

    // Now load the marey data and start the animation
/*
    VIZ.requiresData([
      'json!data/marey-trips.json'
    ]).done(function (data) {
      trips = data;
      // and start rendering it - 1 minute = 1 second
      renderTrainsAtTime(lastTime, true);
      (function animate() {
        renderTrainsAtTime(lastTime > maxUnixSeconds ? minUnixSeconds : (lastTime + 60 / PER_SECOND));
        setTimeout(animate, 1000 / PER_SECOND);
      }());
    });
*/
    $.getJSON("/sim_speed", function(speedData) {
      trips = [];
      for(var i = 0; i < speedData.data.length; i++) {
        var ptime = speedData.data[i][0],
            idx = ptimes.indexOf(ptime);
        if(idx < 0) {
          idx = ptimes.length;
          ptimes.push(ptime);
          trips.push([]);
        }
        trips[idx].push(speedData.data[i]);
      }

      positions = trips[0].map(function (d, idx) {
        var linkno = d[2];
        var from = network.nodes.filter(function(node) {
              return node.id == network.links[linkno].source.id;
            })[0];
        var to = network.nodes.filter(function(node) {
              return node.id == network.links[linkno].target.id;
            })[0];
        var angle = Math.atan2(to.pos[1] - from.pos[1], to.pos[0] - from.pos[0]);

        return {
          idx: idx,
          linkno: linkno,
          line: network.links[linkno].line,
          from: from,
          to: to,
          cx: from.pos[0],
          cy: from.pos[1],
          angle: angle,
          direct: 1
        };
      }).filter(function(d) {
        return d.from != d.to;
      });

      maxTime = ptimes.length * PER_SECOND;

      renderTrainsBySpeed(lastTime, true);
      (function animate() {
        renderTrainsBySpeed(lastTime + 1 >= maxTime ? 0 : lastTime + 1);
        setTimeout(animate, 1000 / PER_SECOND);
      }());
    });

    // Render the dots for each train at a particular point in time
    var lastTime = minTime;
    function renderTrainsBySpeed(unixSeconds, now) {
      var duration = now ? 0 : (1000 / PER_SECOND);
      if (unixSeconds == null) { unixSeconds = lastTime; }
      lastTime = unixSeconds;
      var speedHash = {};
      trips[parseInt(unixSeconds / PER_SECOND, 10)].forEach(function(v) {
        speedHash[v[2]] = v[4];
      });

      var trains = svg.select('.map-container').selectAll('.train').data(positions, function (d) { return d.idx; });
      if (now) {
        positions.forEach(function(d) {
          var speed = speedHash[d.linkno];
          d.cx = d.from.pos[0];
          d.cy = d.from.pos[1];
          d.fill = d3.rgb(255-speed*2, 0, speed*2);
        });
        trains.transition().duration(0)
              .attr('cx', function (d) { return d.cx; })
              .attr('cy', function (d) { return d.cy; })
              .attr('fill', function (d) { return d.fill; });
      } else {
        positions.forEach(function(d) {
          var speed = speedHash[d.linkno];
          var moveX = Math.cos(d.angle) * (speed / 50);
          var moveY = Math.sin(d.angle) * (speed / 50);

          d.cx += moveX * d.direct;
          d.cy += moveY * d.direct;
          d.fill = d3.rgb(255-speed*2, 0, speed*2);
          var min_x = Math.min(d.from.pos[0], d.to.pos[0]),
              max_x = Math.max(d.from.pos[0], d.to.pos[0]),
              min_y = Math.min(d.from.pos[1], d.to.pos[1]),
              max_y = Math.max(d.from.pos[1], d.to.pos[1]);
          if( !(min_x <= d.cx && d.cx <= max_x &&
                min_y <= d.cy && d.cy <= max_y) ) {
            d.direct *= -1;
          }
        });
        trains.transition().duration(duration).ease('linear')
              .attr('cx', function (d) { return d.cx; })
              .attr('cy', function (d) { return d.cy; })
              .attr('fill', function (d) { return d.fill; });
      }
      trains.enter().append('circle')
          .attr('class', function (d) { return 'train ' + d.line; })
          .attr('r', radius)
          .attr('cx', function (d) { return d.cx; })
          .attr('cy', function (d) { return d.cy; });
      trains.exit().remove();

      // if (unixSeconds) { svg.select('.time-display').text(function () {
      //   var t = moment(unixSeconds * 1000).zone(5);
      //   return t.format('dddd M/D h:mm a');
      // }); }
      svg.select('.time-display').text(function() {
        return ptimes[parseInt(unixSeconds/10, 10)];
      });
    }

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
}());
