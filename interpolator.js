class Interpolator {
	constructor(initialValue, initialPeriod = null) {
		this.period = initialPeriod;
		this.target = 0;
		this.framesLeft = 0;
		this.velocity = 0;
		this.accelerationPeriod = 0.25;
		this.value = initialValue;
		this.counter = 0;
	}
	update() {
		this.counter++;
		if (this.framesLeft <= 1) {
			this.value = this.target;
			return this.value;
		}
		this.framesLeft--;
		this.velocity = (this.target - this.value) / this.framesLeft;
		this.value += this.velocity;
		return this.value;
	}
	addValue(value) {
		this.target = value;
		this.period = this.counter;
		this.framesLeft = this.period;
		this.counter = 0;
	}
}