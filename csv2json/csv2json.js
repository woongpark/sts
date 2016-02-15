//Converter Class
var Converter = require("csvtojson").core.Converter,
    fs        = require("fs"),
    async     = require("asyncjs"),
    util      = require("util");

var csvFiles = [
  "nodes",
  "links"
];

var outputPath = "../public/newdata/";

function csv2json(name, callback) {
  var csvFileName="./input/" + name + ".csv";
  var fileStream=fs.createReadStream(csvFileName);
  //new converter instance
  var csvConverter=new Converter({constructResult:true});

  //end_parsed will be emitted once parsing finished
  csvConverter.on("end_parsed",function(jsonObj) {
    callback(null, jsonObj); //here is your result json object
  });

  //read from file
  fileStream.pipe(csvConverter);
};

function json2File(name, json) {
  var text = JSON.stringify(json, null, 2);
  fs.writeFile(outputPath + name + ".json", text, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON saved to " + name + ".json");
      }
  });
}

if(!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}
async.map(csvFiles, csv2json, function(err, result) {
  var nodes = result[0],
      links = result[1],
      check = {};
  nodes = nodes.filter(function(obj) {
    if(!check[obj.num]) {
      check[obj.num] = true;
      return true;
    } else {
      return false;
    }
  });
  for(var name in restructers) {
    json2File(name, restructers[name](nodes, links));
  }
});

var restructers = {
  "station-network": function(node_json, link_json) {
    var nodes = [],
        links = [],
        lineMatch = {};
    for(var i = 0; i < node_json.length; i++) {
      nodes[node_json[i].num - 1] = {
        id: node_json[i].id,
        name: node_json[i].name
      };
      lineMatch[node_json[i].linecode] = node_json[i].linename;
    }
    for(var i = 0; i < link_json.length; i++) {
      links.push({
        source: link_json[i].source - 1,
        target: link_json[i].target - 1,
        line: lineMatch[link_json[i].linecode],
        color: link_json[i].linecolor,
        direct: link_json[i].direction,
        smile: link_json[i].smilepost,
        emile: link_json[i].emilepost
      });
    }
    return {
      nodes: nodes,
      links: links
    };
  },
  "spider": function(nodes) {
    var spider = {};
    for(var i = 0; i < nodes.length; i++) {
      spider[nodes[i].id] = [nodes[i].x, nodes[i].y];
    }
    return spider;
  },
  "marey-header": function(nodes) {
    var data = [],
        ret = {};
    for(var i = 0; i < nodes.length; i++) {
      data.push({
        linecode: nodes[i].linecode,
        linename: nodes[i].linename,
        order: nodes[i].order,
        id: nodes[i].id
      });
    }
    data.sort(function(a, b) {
      if(a.linecode != b.linecode) {
        return a.linecode - b.linecode;
      } else {
        return a.order - b.order;
      }
    });
    for(var i = 0; i < data.length; i++) {
      ret[data[i].id + "|" + data[i].linename] = [i, 0];
    }
    return ret;
  },
  "turnstile-gtfs-mapping": function(nodes) {
    var mapping = {};
    for(var i = 0; i < nodes.length; i++) {
      mapping[nodes[i].name] = nodes[i].id;
    }
    return mapping;
  },
  "station-paths": function(nodes) {
    var data = [],
        ret = [],
        temp = {};
    for(var i = 0; i < nodes.length; i++) {
      data.push({
        linecode: nodes[i].linecode,
        order: nodes[i].order,
        id: nodes[i].id
      });
    }
    data.sort(function(a, b) {
      if(a.linecode != b.linecode) {
        return a.linecode - b.linecode;
      } else {
        return a.order - b.order;
      }
    });
    for(var i = 0; i < data.length; i++) {
      if(!temp[data[i].linecode]) {
        temp[data[i].linecode] = [];
      }
      temp[data[i].linecode].push(data[i].id);
    }
    for(var linecode in temp) {
      ret.push(temp[linecode]);
    }
    return ret;
  }
};
