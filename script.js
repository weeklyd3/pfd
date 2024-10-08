var width = 960;
var height = 540;
var player = {
	'lastLocation': {},
	'gyro': {'roll': 0, 'pitch': 0, 'heading': 0, 'enabled': false},
	'roll': 0,
	'pitch': 0,
	'pitch_offset': 0,
	'pitch_scale': 7,
	'old_pitch_scale': 7,
	'heading_scale': 9,
	'old_heading_scale': 9,
	'speed': 0,
	'speed_trend': 0,
	'speed_last_frame': 0,
	'speed_scale': 4,
	'ones_digit_scale': 20,
	'tens_digit_scale': 25,
	'twenty_scale': 18,
	'heading': 0,
	'track': 0,
	'altitude': 0,
	'lastAltitude': 0,
	'fl_scale': 35,
	'vertical_speed': 0,
	'fpa': 0,
	'vs_scale': height * 0.105,
	'inertial_velocity': [0, 0],
	'inertial_altitude': 0,
	'inertial_vs': 0,
	'last_inertial_velocity_time': Date.now(),
	'inertial_velocity_change': [0, 0],
	'camera': undefined,
	'fov': [58.986, 36]
}
function heading(deg) {
	return (deg + 720) % 360;
}
function drawHorizon(draw, width, height) {
	draw.push();
	var max_displacement = height * 0.25;
	var displacement = player.pitch * player.pitch_scale;
	var original_displacement = displacement;
	if (displacement > max_displacement) displacement = max_displacement;
	if (displacement < -max_displacement) displacement = -max_displacement;
	if (!player.camera) {
		draw.fill('blue');
		draw.rect(-width, -height * 2, width * 2, height * 2 + displacement);
		draw.fill('#7e513c');
		draw.rect(-width, displacement, width * 2, height * 2);
	}
	draw.stroke('white');
	draw.fill('white');
	draw.strokeWeight(2);
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
	draw.strokeWeight(2);
	draw.line(-width / 2, displacement, width / 2, displacement);
	if (displacement != original_displacement) {
		if (player.pitch < 0) {
			draw.fill('blue');
			if (!player.camera) draw.rect(-width, -height * 2, width * 2, height * 2 + displacement);
			var y = displacement - player.pitch_scale * 2.5;
			draw.fill('white');
			for (var i = 0; i < 40; i += 10) {
				draw.strokeWeight(2);
				draw.line(-10, y, 10, y);
				y -= player.pitch_scale * 2.5;
				draw.line(-20, y, 20, y);
				y -= player.pitch_scale * 2.5;
				draw.line(-10, y, 10, y);
				y -= player.pitch_scale * 2.5;
				draw.line(-35, y, 35, y);
				draw.strokeWeight(0);
				draw.text(i + 10, 45, y);
				draw.text(i + 10, -45, y);
				y -= player.pitch_scale * 2.5;
			}
		}
		if (player.pitch > 0) {
			draw.fill('#7e513c');
			if (!player.camera) draw.rect(-width, displacement, width * 2, height * 2);
			var y = displacement + player.pitch_scale * 2.5;
			draw.fill('white');
			for (var i = 0; i > -40; i -= 10) {
				draw.strokeWeight(2);
				draw.line(-10, y, 10, y);
				y += player.pitch_scale * 2.5;
				draw.line(-20, y, 20, y);
				y += player.pitch_scale * 2.5;
				draw.line(-10, y, 10, y);
				y += player.pitch_scale * 2.5;
				draw.line(-35, y, 35, y);
				draw.strokeWeight(0);
				draw.text(i - 10, 45, y);
				draw.text(i - 10, -45, y);
				y += player.pitch_scale * 2.5;
			}
		}
		draw.fill('white');
	}
	const start_hdg = Math.floor(player.heading / 10) * 10 - 140;
	for (var i = start_hdg;
		i <= start_hdg + 280; i += 10) {
		draw.strokeWeight(2);
		var x = -(player.heading - i) * player.heading_scale;
		draw.line(x, displacement, x, displacement - 10);
		draw.strokeWeight(0);
		draw.text(heading(i) / 10, x, displacement + 9);
	}
	draw.strokeWeight(0);
	draw.triangle(0, -150, 7, -140, -7, -140);
	draw.fill(draw.color(0, 0, 0, 0));
	draw.stroke('lime');
	draw.strokeWeight(2);
	player.fpa = Math.atan2(player.vertical_speed * 3600 / 6076 / 100, player.speed) * 180 / Math.PI;
	var coords = [0, Math.max(Math.min(original_displacement - player.fpa * player.pitch_scale, Math.abs(displacement)), -Math.abs(displacement))];
	var left_turn = Math.abs((player.heading - player.track + 360) % 360);
	var right_turn = Math.abs((player.track - player.heading + 360) % 360);
	if (left_turn < right_turn) coords[0] = -left_turn * player.heading_scale;
	else coords[0] = right_turn * player.heading_scale;
	if (coords[0] > width / 2) coords[0] = width / 2;
	if (coords[0] < -width / 2) coords[0] = -width / 2;
	if (coords[1] > height / 2) coords[1] = height / 2;
	if (coords[1] < -height / 2) coords[1] = -height / 2;
	draw.translate(...coords);
	draw.rotate(-player.roll);
	draw.circle(0, 0, 20);
	draw.line(-10, 0, -40, 0);
	draw.line(10, 0, 40, 0);
	draw.line(0, -10, 0, -40);
	var energy_cue_displacement = -player.speed_trend * 0.1;
	var y_displacement = energy_cue_displacement * player.pitch_scale;
	draw.line(-45, y_displacement, -60, y_displacement - 10);
	draw.line(-45, y_displacement, -60, y_displacement + 10);
	draw.line(45, y_displacement, 60, y_displacement - 10);
	draw.line(45, y_displacement, 60, y_displacement + 10);
	draw.pop();
}
function update() {
	//if (player.camera) player.capture = player.camera.get();
	updateData();
	draw.clear();
	draw.push();
	const ahrs_width = width * 0.6;
	draw.translate(ahrs_width / 2, height / 2);
	if (player.camera) {
		// draw video feed in lieu of horizon
		player.camera.loadPixels();
		const capture = player.camera.get();
		var drawWidth = capture.width;
		var drawHeight = capture.height;
		if (capture.width / capture.height < width / height) {
			var ratio = (capture.width / capture.height) / (width / height);
			ratio *= width / capture.width;
			drawWidth *= ratio;
			drawHeight *= ratio;
		}
		else if (capture.width / capture.height > width / height) {
			var ratio = (width / height) / (capture.width / capture.height);
			ratio *= height / capture.height;
			drawWidth *= ratio;
			drawHeight *= ratio;
		} else {
			var ratio = height / capture.height;
			drawWidth *= ratio;
			drawHeight *= ratio;
		}
		player.pitch_scale = drawHeight / player.fov[1];
		player.heading_scale = drawWidth / player.fov[0];
		console.log(player.pitch_scale, player.heading_scale);
		draw.image(capture, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
	}
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
	draw.push();
	draw.strokeWeight(0);
	draw.translate(ahrs_width / 2, height / 2);
	draw.fill(draw.color(0, 0, 0, 125));
	draw.rect(-250, -height * 0.3, 80, height * 0.7);
	draw.rect(170, -height * 0.3, 110, height * 0.7);
	draw.stroke('white');
	draw.strokeWeight(2);
	draw.line(250, -height * 0.3, 250, height * 0.4);
	draw.fill('white');
	for (var i = 0; i < 9000; i += 1000) {
		draw.strokeWeight(2);
		var y_offset = Math.log2(i / 1000 + 1) * player.vs_scale;
		var half_offset = Math.log2(i / 1000 + 1.5) * player.vs_scale;
		var line_y = y_offset + height * 0.05;
		draw.line(250, line_y, 255, line_y);
		draw.line(250, -y_offset + height * 0.05, 255, -y_offset + height * 0.05);
		draw.strokeWeight(1);
		draw.line(250, half_offset + height * 0.05, 253, half_offset + height * 0.05);
		draw.line(250, -half_offset + height * 0.05, 253, -half_offset + height * 0.05);
		draw.strokeWeight(0);
		draw.text(i / 1000, 260, line_y);
		draw.text(i / 1000, 260, -y_offset + height * 0.05);
	}
	draw.strokeWeight(3);
	draw.stroke('lime');
	var log_vs = player.vertical_speed;
	if (log_vs > 8500) log_vs = 8500;
	if (log_vs < -8500) log_vs = -8500;
	var vs_log = Math.log2(Math.abs(log_vs / 1000) + 1) * player.vs_scale;
	if (player.vertical_speed < 0) vs_log = -vs_log;
	draw.line(280, height * 0.05 - vs_log * 0.5, 250, height * 0.05 - vs_log);
	draw.strokeWeight(0);
	var text = '';
	for (const param of ['latitude', 'longitude', 'altitude', 'accuracy', 'altitudeAccuracy', 'heading', 'speed']) text += `${param}: ${player.lastLocation[param]}\n`;
	draw.textAlign('center', 'top');
	draw.text(text, width * 0.5, 0);
	draw.fill('lime');
	draw.push();
	draw.textSize(14);
	draw.textAlign('center', 'top');
	if (Math.abs(player.vertical_speed) > 100) {
		draw.text(Math.round(player.vertical_speed) + "\n" + player.fpa.toFixed(2), 265, height * 0.4);
	}
	draw.pop();
	updateSpeed(speed);
	updateAltitude(alt);
	updateHeading(player.heading, player.track);
	draw.image(speed, -250, -height * 0.3);
	draw.image(alt, 170, -height * 0.3);
	draw.pop();
}
function updateHeading(heading, track) {
	draw.fill(draw.color(0, 0, 0, 125));
	draw.circle(0, height * 0.6, height * 0.65);
	draw.fill('white');
	draw.push();
	draw.strokeWeight(2);
	draw.stroke('white');
	draw.translate(0, height * 0.6);
	draw.rotate(-player.heading);
	for (var i = 0; i < 36; i++) {
		draw.strokeWeight(0);
		draw.text(i, 0, -height * 0.29);
		draw.strokeWeight(2);
		draw.line(0, height * 0.3, 0, height * 0.325);
		for (var j = 0; j < 10; j += 2) {
			draw.rotate(2);
			draw.line(0, height * 0.32, 0, height * 0.325);
		}
	}
	draw.pop();
	draw.strokeWeight(1);
	draw.stroke('white');
	draw.line(0, height * 0.6, 0, height * 0.28);
	draw.push();
	draw.strokeWeight(2);
	draw.stroke('magenta');
	draw.translate(0, height * 0.6);
	draw.rotate(player.track - player.heading);
	draw.line(0, 0, 0, -height * 0.32);
	draw.line(-10, -height * 0.32 + 15, 0, -height * 0.32);
	draw.line(10, -height * 0.32 + 15, 0, -height * 0.32);
	draw.pop();
	draw.strokeWeight(0);
	draw.text(`HDG ${Math.round(player.heading)}`, -35, height * 0.45);
	draw.fill('magenta');
	draw.text(`TRK ${Math.round(player.track)}`, 35, height * 0.45);
}
var speedInterpolator = new Interpolator(0);
var trackInterpolator = new Interpolator(player.heading, true);
var altInterpolator = new Interpolator(player.altitude);
function updateSpeed(draw) {
	/*player.inertial_velocity[0] += player.inertial_velocity_change[0] / 2;
	player.inertial_velocity[1] += player.inertial_velocity_change[1] / 24;
	player.speed = (player.inertial_velocity[0] ** 2 + player.inertial_velocity[1] ** 2) ** 0.5 * 3600 / 1852;*/
	draw.clear();
	draw.push();
	draw.stroke('white');
	draw.fill('white');
	draw.strokeWeight(3);
	var start_speed = Math.floor((player.speed - (height * 0.35) / 7) / 10) * 10 - 20;
	for (var i = start_speed; i < (start_speed + height * 1.2 / 7 + 10); i += 10) {
		if (i < 0) continue;
		var y = (player.speed - i) * player.speed_scale;
		draw.strokeWeight(3);
		draw.line(0, y, (i % 20) ? -25 : -40, y);
		if (!(i % 20)) {
			draw.strokeWeight(0);
			draw.text(i, -50, y);
		}
	}
	draw.strokeWeight(0);
	preciseSpeed.clear();
	preciseSpeed.background('white');
	preciseSpeed.fill('black');
	preciseSpeed.rect(-27, -17, 54, 34);
	preciseSpeed.fill('white');
	var digit_offset = player.ones_digit_scale * (player.speed % 1);
	var last_digit = Math.floor(player.speed) % 10;
	preciseSpeed.text(last_digit, 15, digit_offset);
	preciseSpeed.text((last_digit + 1) % 10, 15, digit_offset - player.ones_digit_scale);
	preciseSpeed.text((last_digit + 2) % 10, 15, digit_offset - 2 * player.ones_digit_scale);
	preciseSpeed.text((last_digit + 9) % 10, 15, digit_offset + player.ones_digit_scale);
	preciseSpeed.text((last_digit + 8) % 10, 15, digit_offset + player.ones_digit_scale * 2);
	// tens digit
	var tens_digit = Math.floor((Math.floor(player.speed) % 100) / 10)
	var tens_digit_offset = 0;
	if (last_digit == "9") tens_digit_offset = player.tens_digit_scale * (player.speed % 1);
	if (player.speed >= 10) preciseSpeed.text(tens_digit, 0, tens_digit_offset);
	preciseSpeed.text((tens_digit + 1) % 10, 0, tens_digit_offset - player.tens_digit_scale);
	// hundreds digit
	var hundreds_digit = Math.floor((Math.floor(player.speed) % 1000) / 100)
	var hundreds_digit_offset = 0;
	if (last_digit == "9" && tens_digit == '9') hundreds_digit_offset = player.tens_digit_scale * (player.speed % 1);
	if (player.speed >= 100) preciseSpeed.text(hundreds_digit, -15, hundreds_digit_offset);
	preciseSpeed.text((hundreds_digit + 1) % 10, -15, hundreds_digit_offset - player.tens_digit_scale);
	draw.fill('white');
	draw.triangle(-20, 5, -20, -5, -13, 0);
	draw.stroke('lime');
	draw.strokeWeight(2);
	draw.fill(draw.color(0, 0, 0, 0));
	var speed_trend = (player.speed - player.speed_last_frame) * 144 * player.speed_scale;
	player.speed_trend = speed_trend;
	if (speed_trend) {
		draw.line(-13, 0, -13, -speed_trend);
		draw.triangle(-13, -speed_trend - (speed_trend > 0 ? 10 : -10), -18, -speed_trend, -8, -speed_trend);
	}
	draw.image(preciseSpeed, -80, -20);
	draw.pop();
	player.speed_last_frame = player.speed;
}
function updateAltitude(draw) {
	draw.push();
	draw.clear();
	const altitude = player.altitude;
	player.vertical_speed = (player.altitude - player.lastAltitude) * 60 * 24;
	preciseAlt.clear();
	preciseAlt.background('white');
	preciseAlt.fill('black');
	preciseAlt.rect(-32, -17, 64, 34);
	preciseAlt.fill('white');
	var ten_thousands = Math.floor(altitude / 10000);
	var ten_thousands_offset = 0;
	if ((altitude % 10000) > 9980) ten_thousands_offset = player.tens_digit_scale * (altitude % 1000 - 980) / 20;
	if (ten_thousands > 0) preciseAlt.text(ten_thousands, -25, ten_thousands_offset);
	preciseAlt.text((ten_thousands + 1) % 10, -25, ten_thousands_offset - player.tens_digit_scale);
	var thousands = Math.floor(altitude / 1000) % 10;
	var thousands_offset = 0;
	if ((altitude % 1000) > 980) thousands_offset = player.tens_digit_scale * (altitude % 1000 - 980) / 20;
	if (altitude >= 1000) preciseAlt.text(thousands, -15, thousands_offset);
	preciseAlt.text((thousands + 1) % 10, -15, thousands_offset - player.tens_digit_scale);
	var hundreds = Math.floor(altitude / 100) % 10;
	var hundreds_offset = 0;
	if ((altitude % 100) > 80) hundreds_offset = player.tens_digit_scale * (altitude % 100 - 80) / 20;
	if (altitude >= 100) preciseAlt.text(hundreds, -5, hundreds_offset);
	preciseAlt.text((hundreds + 1) % 10, -5, hundreds_offset - player.tens_digit_scale);
	var twenty = (altitude % 100) - (altitude % 20);
	var next_alt = (twenty + 20) % 100;
	var next2_alt = (twenty + 40) % 100;
	var prev_alt = (twenty + 80) % 100;
	if (!next_alt) next_alt = '00';
	if (!next2_alt) next2_alt = '00';
	if (!prev_alt) prev_alt = '00';
	if (!twenty) twenty = '00';
	var twenty_offset = (altitude % 20) / 20 * player.twenty_scale;
	preciseAlt.text(twenty, 15, twenty_offset);
	preciseAlt.text(next_alt, 15, twenty_offset - player.twenty_scale);
	preciseAlt.text(next2_alt, 15, twenty_offset - 2 * player.twenty_scale);
	preciseAlt.text(prev_alt, 15, twenty_offset + player.twenty_scale);
	draw.stroke('white');
	draw.fill('white');
	draw.textAlign('left', 'center');
	for (var starting_fl = Math.floor((player.altitude - 100 * height * 0.4 / player.fl_scale) / 100); starting_fl <= Math.ceil((player.altitude + 100 * height * 0.4 / player.fl_scale) / 100) + 5; starting_fl++) {
		draw.strokeWeight(2);
		var y = (player.altitude - starting_fl * 100) * player.fl_scale / 100;
		if (!(starting_fl % 5)) {
			draw.line(0, y, 30, y);
			draw.line(0, y, 80, y + 80 * 5 / 7);
			draw.line(0, y, 80, y - 80 * 5 / 7);
		}
		else draw.line(0, y, 10, y);
		draw.line(0, y + player.fl_scale / 2, 5, y + player.fl_scale / 2);
		var text_x = 15;
		if (!(starting_fl % 5)) text_x = 35;
		draw.strokeWeight(0);
		draw.text(starting_fl, text_x, y);
	}
	draw.image(preciseAlt, 10, -20);
	draw.fill('white');
	draw.strokeWeight(0);
	draw.triangle(10, -5, 10, 5, 3, 0);
	draw.pop();
	player.lastAltitude = player.altitude;
}
const font = 'sans-serif';
var s = function(sketch) {
	sketch.setup = async function() {
		sketch.createCanvas(width, height);
		draw.angleMode('degrees');
		draw.frameRate(30);
		draw.textFont(font);
		draw.textAlign('center', 'center');
		speed = draw.createGraphics(80, height * 0.7);
		speed.textAlign('center', 'center');
		speed.textFont(font);
		preciseSpeed = draw.createGraphics(60, 40);
		preciseSpeed.textFont(font);
		preciseSpeed.translate(30, 20);
		preciseSpeed.textAlign('center', 'center');
		preciseSpeed.textSize(20);
		speed.translate(80, height * 0.35);
		alt = draw.createGraphics(80, height * 0.7);
		alt.textAlign('center', 'center');
		alt.textFont(font);
		alt.translate(0, height * 0.35);
		preciseAlt = draw.createGraphics(70, 40);
		preciseAlt.textFont(font);
		preciseAlt.translate(35, 20);
		preciseAlt.textAlign('center', 'center');
		preciseAlt.textSize(17);
	};
	sketch.draw = update;
}
var draw = new p5(s, 'pad'); 
function startOrientation() {
	if (typeof DeviceMotionEvent.requestPermission === "function") {
		DeviceOrientationEvent.requestPermission().then(function(response) {
			alert(response);
			if (response == "granted") {
			}
		});
	} else {
		console.log("not granted");
	}
}
window.addEventListener("deviceorientation", function(event) {
	player.gyro.enabled = true;
	// https://stackoverflow.com/a/42799567/15578194
	// those angles are in degrees
	var alpha = event.alpha;
	var beta = event.beta;
	var gamma = event.gamma;

	// JS math works in radians
	var betaR = (beta / 180) * Math.PI;
	var gammaR = (gamma + player.pitch_offset) / 180 * Math.PI;
	var spinR = Math.atan2(Math.cos(betaR) * Math.sin(gammaR), Math.sin(betaR));

	// convert back to degrees
	var spin = (spinR * 180) / Math.PI;
	var processedGamma = gammaR * 180 / Math.PI;
	if (event.gamma > 0) processedGamma -= 90;
	else processedGamma += 90;
	player.gyro.pitch = processedGamma;
	player.gyro.roll = -spin + 90;
	if (Math.abs(player.gyro.roll) > 90) player.gyro.pitch = -player.gyro.pitch;
	if ('webkitCompassHeading' in event) player.gyro.heading = event.webkitCompassHeading;
});
window.addEventListener('devicemotion', function(event) {
	var now = Date.now();
	var interval = now - player.last_inertial_velocity_time;
	var accel = event.acceleration;
	player.inertial_velocity_change = [accel.x, accel.y];
	player.inertial_velocity[0] += accel.x * interval / 1000;
	player.inertial_velocity[1] += accel.y * interval / 1000;
	player.last_inertial_velocity_time = Date.now();
	// player.speed = (player.inertial_velocity[0] ** 2 + player.inertial_velocity[1] ** 2) ** 0.5 * 3600 / 1852;
});
window.addEventListener("deviceorientationabsolute", (ev) => {
	player.heading = ev.alpha;
});