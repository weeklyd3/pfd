function gotLocation(ev) {
	if (player.disableGeolocation) return;
	player.lastLocation = ev.coords;
	var coords = ev.coords;
	console.log(coords);
	var speed = coords.speed;
	var track = coords.heading;
	var alt = coords.altitude;
	if (!speed) speed = 0;
	if (!track) track = trackInterpolator.value;
	if (!alt) alt = altInterpolator.value * 12 * 2.54 / 100;
	speedInterpolator.addValue(speed * 3600 / 1852);
	trackInterpolator.addValue(track);
	altInterpolator.addValue(alt * 100 / 12 / 2.54);
}
function geolocationError(err) {
	console.log(err);
	alert(err.message);
}
function startGeolocation() {
	navigator.geolocation.watchPosition(gotLocation, geolocationError, {
		enableHighAccuracy: false,
		timeout: Infinity,
		maximumAge: Infinity,
	});
}