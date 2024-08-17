var width = 960;
var height = 540;
var player = {
	'roll': 0,
	'pitch': 0,
	'pitch_scale': 7,
	'heading_scale': 9,
	'heading': 0
}
function heading(deg) {
	return (deg + 720) % 360;
}
function drawHorizon(draw, width, height) {
	draw.push();
	var max_displacement = height * 0.45;
	var displacement = player.pitch * player.pitch_scale;
	var original_displacement = displacement;
	if (displacement > max_displacement) displacement = max_displacement;
	if (displacement < -max_displacement) displacement = -max_displacement;
	draw.fill('blue');
	draw.rect(-width, -height * 2, width * 2, height * 2 + displacement);
	draw.fill('#7e513c');
	draw.rect(-width, displacement, width * 2, height * 2);
	draw.stroke('white');
	draw.fill('white');
	draw.strokeWeight(2);
	draw.line(-width / 2, original_displacement, width / 2, original_displacement);
	const start_hdg = Math.floor(player.heading / 10) * 10 - 140;
	for (var i = start_hdg;
		i <= start_hdg + 280; i += 10) {
		draw.strokeWeight(2);
		var x = -(player.heading - i) * player.heading_scale;
		draw.line(x, original_displacement, x, original_displacement - 10);
		draw.strokeWeight(0);
		draw.text(heading(i) / 10, x, original_displacement + 9);
	}
	for (var i = -90; i <= 90; i += 10) {
		var y = original_displacement - i * player.pitch_scale;
		draw.strokeWeight(2);
		draw.line(-35, y, 35, y);
		if (i != -90) {
			draw.line(-20, y + player.pitch_scale * 5, 20, y + player.pitch_scale * 5);
			var small_line_y = y + player.pitch_scale * 2.5;
			draw.line(-10, small_line_y, 10, small_line_y);
			small_line_y += player.pitch_scale * 5;
			draw.line(-10, small_line_y, 10, small_line_y);
		}
		if (i) {
			draw.strokeWeight(0);
			draw.text(i, -45, y);
			draw.text(i, 45, y);
		}
	}
	draw.strokeWeight(0);
	draw.triangle(0, -150, 7, -140, -7, -140);
	draw.pop();
}
function update() {
	draw.clear();
	draw.push();
	const ahrs_width = width * 0.6;
	draw.translate(ahrs_width / 2, height / 2);
	draw.rotate(player.roll);
	drawHorizon(draw, ahrs_width, height);
	draw.rotate(-player.roll);
	draw.fill(draw.color(0, 0, 0, 0));
	draw.stroke('white');
	draw.strokeWeight(2);
	draw.arc(0, 0, 300, 300, -165, -15);
	draw.push();
	for (const deg of [-75, -60, -45, -30, -20, -10, 0, 
					  10, 20, 30, 45, 60, 75]) {
		draw.push();
		draw.rotate(deg);
		draw.line(0, -150, 0, -160);
		draw.pop();
	}
	draw.pop();
	draw.stroke('yellow');
	draw.rect(-3, -3, 6, 6);
	draw.fill('black');
	draw.beginShape();
	draw.vertex(-53, -3);
	draw.vertex(-53, 12);
	draw.vertex(-59, 12);
	draw.vertex(-59, 3);
	draw.vertex(-100, 3);
	draw.vertex(-100, -3);
	draw.endShape('close');
	draw.beginShape();
	draw.vertex(53, -3);
	draw.vertex(53, 12);
	draw.vertex(59, 12);
	draw.vertex(59, 3);
	draw.vertex(100, 3);
	draw.vertex(100, -3);
	draw.endShape('close');
	draw.strokeWeight(0);
	draw.rect(width * 0.3, -height / 2, width * 0.4, height);
	draw.pop();
}
var s = function (sketch) {
  sketch.setup = async function () {
	  sketch.createCanvas(width, height);
	  draw.angleMode('degrees');
	  draw.textAlign('center', 'center');
	  setInterval(update, 1000 / 24);
  }
}
var draw = new p5(s, 'pad');
function startOrientation() {
	if (typeof DeviceMotionEvent.requestPermission === "function") {
		DeviceOrientationEvent.requestPermission().then(function (response) {
			alert(response);
			if (response == "granted") {
			}
		});
	} else {
		console.log("not granted");
	}
}
window.addEventListener("deviceorientation", function (event) {
	// https://stackoverflow.com/a/42799567/15578194
	// those angles are in degrees
	var alpha = event.alpha;
	var beta = event.beta;
	var gamma = event.gamma;

	// JS math works in radians
	var betaR = (beta / 180) * Math.PI;
	var gammaR = (gamma / 180) * Math.PI;
	var spinR = Math.atan2(Math.cos(betaR) * Math.sin(gammaR), Math.sin(betaR));

	// convert back to degrees
	var spin = (spinR * 180) / Math.PI;
	var processedGamma = event.gamma;
	if (event.gamma > 0) processedGamma -= 90;
	else processedGamma += 90;
	player.pitch = processedGamma;
	player.roll = -spin + 90;
	if ('webkitCompassHeading' in event) player.heading = event.webkitCompassHeading;
});
window.addEventListener("deviceorientationabsolute", (ev) => {
	player.heading = ev.alpha;
});