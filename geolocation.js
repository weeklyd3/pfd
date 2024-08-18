function gotLocation(ev) {
	var coords = ev.coords;
	var speed = coords.speed;
	if (!speed) speed = 0;
	speedInterpolator.addValue(speed);
}
function startGeolocation() {
	navigator.geolocation.watchPosition(gotLocation, alert, {
		
	});
}