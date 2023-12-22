var MIN_POWER = 1; // W
var CHECK_INT = 10000; // check interval
var OFF_DELAY = 60000; // minimum time to keep on

var last_on = Date.now();
var last_power = [0,0];

Shelly.addStatusHandler(function(e) {
  if ((e.component === "switch:0") || (e.component === "switch:1")) {
    if (e.delta.output === true) {
      last_on = Date.now();
    }
  }
});

var t = Timer.set(CHECK_INT, true, function (userdata) {
  if (Date.now() - last_on < OFF_DELAY) {
    return;
  }
  for (var i=0; i<2; i++) {
    Shelly.call("Switch.GetStatus", { id: i },
      function (res, error_code, error_msg, user_data) {
        if (res.output && (res.apower < MIN_POWER) && (res.aenergy.by_minute[0] < (MIN_POWER * 1000 / 60))) {
          if (Date.now() - last_power[res.id] > OFF_DELAY) {
            Shelly.call("Switch.set", {'id': res.id, 'on': false});
          }
        } else if (res.output) {
          last_power[res.id] = Date.now();
        }
      }
    );
  }
});
