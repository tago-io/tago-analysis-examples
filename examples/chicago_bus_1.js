/*jshint esnext:true, node:true*/
/*globals _, bucket, async, moment_tz*/
"use strict";
var bus_bucket = bucket("556391a7791aa76a07f0c283"); // Chicago - Bus #1

function random_true_false() {
    return (_.random(true, false) ? true : false);
}

const LOCATIONS = [{
    "id": 1,
    "location": `41.87${_.random(7000, 9000)}, -87.624205`,
    "max_speed": 45,
    "break": random_true_false()
}, {
    "id": 2,
    "location": `41.88${_.random(1000, 4000)}, -87.624205`,
    "max_speed": 0,
    "break": random_true_false()
}, {
    "id": 3,
    "location": `41.88${_.random(4000, 8000)}, -87.624448`,
    "max_speed": 20,
    "break": random_true_false()
}, {
    "id": 4,
    "location": "41.888330, -87.624792",
    "max_speed": 3,
    "break": random_true_false()
}, {
    "id": 5,
    "location": "41.888286, -87.625221",
    "max_speed": 10,
    "break": random_true_false()
}, {
    "id": 6,
    "location": "41.887392, -87.626122",
    "max_speed": 8,
    "break": random_true_false()
}, {
    "id": 7,
    "location": "41.886912, -87.628783",
    "max_speed": 23,
    "break": random_true_false()
}, {
    "id": 8,
    "location": "41.886912, -87.635091",
    "max_speed": 25,
    "break": random_true_false()
}, {
    "id": 9,
    "location": "41.885986, -87.636679",
    "max_speed": 3,
    "break": random_true_false()
}, {
    "id": 10,
    "location": "41.882344, -87.636936",
    "max_speed": 40,
    "break": random_true_false()
}, {
    "id": 11,
    "location": "41.877838, -87.636679",
    "max_speed": 40,
    "break": random_true_false()
}, {
    "id": 12,
    "location": "41.875538, -87.635606",
    "max_speed": 50,
    "break": random_true_false()
}, {
    "id": 13,
    "location": "41.875569, -87.630842",
    "max_speed": 50,
    "break": random_true_false()
}, {
    "id": 14,
    "location": "41.875697, -87.628997",
    "max_speed": 10,
    "break": random_true_false()
}, {
    "id": 15,
    "location": "41.875693, -87.626132",
    "max_speed": 5,
    "break": random_true_false()
}, {
    "id": 16,
    "location": "41.876340, -87.624190",
    "max_speed": 30,
    "break": random_true_false()
}, {
    "id": 17,
    "location": "41.877882, -87.624212",
    "max_speed": 10,
    "break": random_true_false()
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

async.parallel({"serie": get_serie, "id": get_inc_id}, function (err, result) {
    if (err) {
        return console.log(err);
    }

    let bus = _.findWhere(LOCATIONS, {"id": result.id});

    bus_bucket("location").insert({"location": bus.location, "serie": result.serie});
    bus_bucket("speed").insert({"value": _.random(0, bus.max_speed), "serie": result.serie});
    bus_bucket("update_at").insert({"value": moment_tz(new Date()).tz("America/Chicago").format("hh:mm A - z"), "serie": result.serie});
    if (bus.break) {
        bus_bucket("break_pressed").insert({"value": bus.break, "serie": result.serie});
    }
});
