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
	}
}
var randomLocation = {'speed': Math.random() * 140 + 140, 'accel': (Math.random() - 0.5) * 0.12, 'jerk': 0, 'vs': (Math.random() - 0.5) * 5000, 'vs_trend': 0, 'altitude': Math.random() * 37000, 'track': 0, 'turnRate': 0};
var selected_sources = {'location': "geolocation"};
function updateData() {
	for (const data of Object.keys(selected_sources)) {
		for (const func of Object.keys(sources[data])) sources[data][func].update();
		sources[data][selected_sources[data]].activeUpdate();
	}
}