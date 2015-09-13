(function() {
  $(function() {
    var pathname = location.pathname,
        a = $(".nav a[href=\"" + pathname + "\"]");
    a.closest("li").addClass("active");
  });
})();

function getPolygon(linkinfo, direct, speed) {
  var x1 = linkinfo.SLAT,
      y1 = linkinfo.SLON,
      x2 = linkinfo.ELAT,
      y2 = linkinfo.ELON,
      color;

  speed = Math.min(speed, 130);
  speed = parseInt(speed / 130 * 255+0.5, 10);
  color = new Microsoft.Maps.Color(255,255-speed,0,speed);

  // Create a polygon
  var vertices = new Array(
    new Microsoft.Maps.Location(x1, y1),
    new Microsoft.Maps.Location(x2, y2)
  );
  var polygon = new Microsoft.Maps.Polygon(vertices,{
    fillColor: new Microsoft.Maps.Color(0,0,0,0),
    strokeColor: color,
    strokeThickness: 4
  });
  return polygon;
}

function getPolygon_risk(linkinfo, direct, risk) {
  var x1 = linkinfo.SLAT,
      y1 = linkinfo.SLON,
      x2 = linkinfo.ELAT,
      y2 = linkinfo.ELON,
      color;

  risk = Math.min(risk, 2);
  risk = parseInt(risk / 2.0 * 255+0.5, 10);
  color = new Microsoft.Maps.Color(255,255-risk,risk,0);

  // Create a polygon
  var vertices = new Array(
    new Microsoft.Maps.Location(x1, y1),
    new Microsoft.Maps.Location(x2, y2)
  );
  var polygon = new Microsoft.Maps.Polygon(vertices,{
    fillColor: new Microsoft.Maps.Color(0,0,0,0),
    strokeColor: color,
    strokeThickness: 4
  });
  return polygon;
}

function getIcon(TYPE, LAT, LON) {
  // Create a icon
  var loc = new Microsoft.Maps.Location(LAT, LON);
  var str = "/images/"+ TYPE.trim() + '.png';//타입별로 이미지를 선택하도록 고처야함
  // var pushpinOptions = {icon: str, width: 50, height: 50};
  var pushpinOptions = {
    htmlContent: "<img class='map-icon' src='" + str + "'></img>"
  };
  var pushpin= new Microsoft.Maps.Pushpin(loc, pushpinOptions);

  return pushpin;
}

function getMap() {
  var map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), {
    credentials: "Andq5Xlwoi8Um_dR6vSSL0QBQ4ktzXkweGorhME7lzAewPlOm1Og8XdcfiNL7vDd",
    center: new Microsoft.Maps.Location(37, 127.2),
    mapTypeId: Microsoft.Maps.MapTypeId.road,
    showDashboard: true,
    disablePanning: false,
    disableZooming: false,
    zoom: 8
  });
  return map;
}
