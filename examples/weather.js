var wheater_bucket  = bucket("55639114791aa76a07f0c275"); // Chicago - Weather
var weather_service = service("weather");

weather_service.name('Chicago').current(function (err, result) {
    if (err) {
        return console.log(err);
    }

    wheater_bucket("temp_f").insert({'value': result.temp_f, 'unit': 'F'});
    wheater_bucket("temp_c").insert({'value': result.temp_c, 'unit': 'C'});
    wheater_bucket("weather_string").insert({'value': result.weather});
    wheater_bucket("UV").insert({'value': result.UV});
    wheater_bucket("wind_kph").insert({'value': result.wind_kph, 'unit': 'kph'});
    wheater_bucket("wind_mph").insert({'value': result.wind_mph, 'unit': 'mph'});
    wheater_bucket("precip_today_in").insert({'value': result.precip_today_in, 'unit': 'in'});
    wheater_bucket("precip_today_metric").insert({'value': result.precip_today_metric, 'unit': 'mm'});
});
