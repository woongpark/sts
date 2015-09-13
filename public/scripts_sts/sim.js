(function () {
  "use strict";
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
  });
})();
