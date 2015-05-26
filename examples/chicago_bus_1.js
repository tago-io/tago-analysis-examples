/*jshint esnext:true, node:true*/
/*globals _, bucket, async, moment_tz*/
"use strict";
var bus_bucket = bucket("556391a7791aa76a07f0c283"); // Chicago - Bus #1

const TASK_INTERVAL = 2; // minute

const LOCATIONS = [{
    "id": 1,
    "location": `41.87${_.random(7000, 9000)}, -87.624205`,
    "max_speed": 45
}, {
    "id": 2,
    "location": `41.88${_.random(1000, 4000)}, -87.624205`,
    "max_speed": 0
}, {
    "id": 3,
    "location": `41.88${_.random(4000, 8000)}, -87.624448`,
    "max_speed": 20
}, {
    "id": 4,
    "location": "41.888330, -87.624792",
    "max_speed": 3
}, {
    "id": 5,
    "location": "41.888286, -87.625221",
    "max_speed": 10
}, {
    "id": 6,
    "location": "41.887392, -87.626122",
    "max_speed": 8
}, {
    "id": 7,
    "location": `41.886912, -87.6${_.random(28000, 35000)}`,
    "max_speed": 23
}, {
    "id": 8,
    "location": "41.886437, -87.636303",
    "max_speed": 25
}, {
    "id": 9,
    "location": "41.885710, -87.636969",
    "max_speed": 3
}, {
    "id": 10,
    "location": `41.88${_.random(0, 5224)}, -87.637054`,
    "max_speed": 40
}, {
    "id": 11,
    "location": `41.87${_.random(8000, 9999)}, -87.637054`,
    "max_speed": 40
}, {
    "id": 12,
    "location": "41.875726, -87.635971",
    "max_speed": 50
}, {
    "id": 13,
    "location": `41.875569, -87.63${_.random(0, 5871)}`,
    "max_speed": 50
}, {
    "id": 14,
    "location": `41.875697, -87.62${_.random(4200, 8997)}`,
    "max_speed": 13
}];

function get_serie(cb) {
    bus_bucket("serie").query("last_value").run(function (err, result) {
        if (err) {
            return cb(err);
        }

        result = result[0] || {};
        let serie = 0;

        if (result) {
            serie = Number(result.value) || 0;
        }

        serie += 1;
        bus_bucket("serie").insert({"value": serie});

        cb(null, serie);
    });
}

function get_inc_id(cb) {
    bus_bucket("id").query("last_value").run(function (err, result) {
        if (err) {
            return cb(err);
        }

        result = result[0] || {};
        let id = 0;

        if (result.value >= LOCATIONS.length) {
            result.value = 0;
        } else if (result) {
            id = Number(result.value) || 0;
        }

        id += 1;
        bus_bucket("id").insert({"value": id});

        cb(null, id);
    });
}

function get_fuel(cb) {
    bus_bucket("fuel_level").query("last_value").run(function (err, result) {
        if (err) {
            return cb(err);
        }

        result = result[0] || {};
        let fuel = 100;

        if (result.value >= 5) {
            let how_much_spend = ((TASK_INTERVAL*LOCATIONS.length) / 12); // Assuming that the fuel tank is enough for 12hours
            fuel = Number(result.value) - how_much_spend;
        }

        cb(null, fuel);
    });
}

async.parallel({"serie": get_serie, "id": get_inc_id, "fuel": get_fuel}, function (err, result) {
    if (err) {
        return console.log(err);
    }

    let bus = _.findWhere(LOCATIONS, {"id": result.id});

    let location      = {"location": bus.location, "serie": result.serie};
    let speed         = {"value": _.random(0, bus.max_speed), "unit": "mph", "serie": result.serie};
    let fuel          = {"value": result.fuel, "unit": "%", "serie": result.serie};
    let update_at     = {"value": moment_tz(new Date()).tz("America/Chicago").format("hh:mm A - z"), "serie": result.serie};
    let break_pressed = {"value": random_true_false(), "serie": result.serie};

    bus_bucket("location").insert(location);
    bus_bucket("speed").insert(speed);
    bus_bucket("fuel_level").insert(fuel);
    bus_bucket("update_at").insert(update_at);
    if (bus.break) { bus_bucket("break_pressed").insert(break_pressed); }
});

// Helpers
function random_true_false() {
    return (_.random(true, false) ? true : false);
}
