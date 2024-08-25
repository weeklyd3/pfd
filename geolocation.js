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
function startGeolocation() {
	navigator.geolocation.watchPosition(gotLocation, alert, {
		enableHighAccuracy: false,
		timeout: 5000,
		maximumAge: 3000,
	});
}