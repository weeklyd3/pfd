class Interpolator {
	constructor(initialValue, isAngle = false, initialPeriod = null) {
		this.period = initialPeriod;
		this.target = 0;
		this.framesLeft = 0;
		this.velocity = 0;
		this.accelerationPeriod = 0.25;
		this.value = initialValue;
		this.counter = 0;
		this.isAngle = isAngle;
	}
	update() {
		this.counter++;
		if (this.framesLeft <= 1) {
			this.value = this.target;
			this.velocity = 0;
			return this.value;
		}
		this.framesLeft--;
		if (!this.isAngle) this.velocity = (this.target - this.value) / this.framesLeft;
		if (this.isAngle && !this.velocity) {
			var leftTurn = (Math.abs(this.value - this.target + 360) % 360) < (Math.abs((this.target - this.value + 360)) % 360);
			var difference;
			if (leftTurn) difference = -(this.value - this.target + 360) % 360;
			else difference = (this.target - this.value + 360) % 360;
			this.velocity = difference / this.framesLeft;
		}
		this.value += this.velocity;
		return this.value;
	}
	addValue(value) {
		this.target = value;
		this.period = this.counter;
		this.framesLeft = this.period;
		this.counter = 0;
		this.velocity = 0;
	}
}