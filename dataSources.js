var sources = {
	'location': {
		'geolocation': {
			'update': function() {
				speedInterpolator.update();
				altInterpolator.update();
				trackInterpolator.update();
			},
			'activeUpdate': function() {
				player.speed = speedInterpolator.value;
				player.altitude = altInterpolator.value;
				player.track = trackInterpolator.value;
			}
		},
		'inertial': {
			'update': function() {},
			'activeUpdate': function() {
				player.speed = (player.inertial_velocity[0] ** 2 + player.inertial_velocity[1] ** 2) ** 0.5 * 3600 / 1852;
				player.track = Math.atan2(player.inertial_velocity[0], player.inertial_velocity[1]) * 180 / Math.PI;
				player.track = (player.track + 360) % 360;
			}
		},
		'random': {
			'update': function() {
				if (randomLocation.speed <= 140 && randomLocation['accel'] < 0) randomLocation['jerk'] += 0.01;
				else if (randomLocation.speed >= 280 && randomLocation['accel'] > 0) randomLocation['jerk'] -= 0.01;
				else {
					randomLocation['jerk'] *= 0.9;
					if (Math.random() < 0.1) randomLocation['jerk'] += (Math.random() - 0.5) * 0.05;
				}
				randomLocation.accel += randomLocation.jerk / 5;
				randomLocation.vs_trend *= 0.9;
				if (Math.random() < 0.1) randomLocation.vs_trend += (Math.random() - 0.5) * 25000;
				randomLocation.vs += randomLocation.vs_trend / 60 / 24;
				randomLocation.speed += randomLocation.accel / 10;
				randomLocation.altitude += randomLocation.vs / 60 / 24;
			},
			'activeUpdate': function() {
				player.speed = randomLocation.speed;
				player.altitude = randomLocation.altitude;
				player.track = randomLocation.track;
			}
		}
	},
	'attitude': {
		'gyro': {
			'update': () => 0,
			'activeUpdate': function() {
				player.pitch = player.gyro.pitch;
				player.roll = player.gyro.roll;
				player.heading = player.gyro.heading;
			}
		},
		'random': {
			'update': () => {
				randomLocation.pitch = 1 / Math.cos(randomLocation.roll * Math.PI / 180) * 5 + player.fpa;
				var aoa = 1 + (randomLocation.vs + 8500) / 8000;
				randomLocation.pitch += aoa;
			},
			'activeUpdate': function() {
				player.pitch = randomLocation.pitch;
				player.roll = randomLocation.roll;
			}
		}
	}
}
var randomLocation = {'speed': Math.random() * 140 + 140, 'accel': (Math.random() - 0.5) * 0.12, 'jerk': 0, 'vs': (Math.random() - 0.5) * 5000, 'vs_trend': 0, 'altitude': Math.random() * 37000, 'track': 0, 'turnRate': 0, 'pitch': 0, 'roll': 0};
var selected_sources = {'location': "geolocation", 'attitude': "gyro"};
function updateData() {
	for (const data of Object.keys(selected_sources)) {
		for (const func of Object.keys(sources[data])) sources[data][func].update();
		sources[data][selected_sources[data]].activeUpdate();
	}
}