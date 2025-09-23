class Game {
	public static readonly Defaults = {
		balance: 0,
		tickAccumulator: 0
	};

	public state = $state(this.getSavedState());

	private animationFrame: number | null = null;

	tick() {
		this.state.balance += 1;
	}

	runLoop() {
		const step = 1000 / 20;

		let currentTime = performance.now();

		const frame = () => {
			const newTime = performance.now();
			const deltaTime = newTime - currentTime;
			currentTime = newTime;

			this.state.tickAccumulator += deltaTime;

			while (this.state.tickAccumulator >= step) {
				this.state.tickAccumulator -= step;
				this.tick();
			}

			this.animationFrame = requestAnimationFrame(frame);
		};

		this.animationFrame = requestAnimationFrame(frame);
	}

	stopLoop() {
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}
	}

	saveState() {
		localStorage.setItem('lbi-state', JSON.stringify(this.state));
	}

	getSavedState() {
		const data = JSON.parse(localStorage.getItem('lbi-state') ?? 'null');
		return Object.assign({}, Game.Defaults, data);
	}
}

export const game = new Game();
