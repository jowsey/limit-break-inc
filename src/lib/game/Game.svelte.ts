class Game {
	public static readonly Defaults = {
		balance: 0,
		tickAccumulator: 0,
		coreTier: 1,
		upgrades: [] as string[],
		market: {
			kwhPrice: 0.05
		}
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

	getSavedState(): typeof Game.Defaults {
		const storedData = JSON.parse(localStorage.getItem('lbi-state') ?? 'null');
		const data = Object.assign({}, Game.Defaults, storedData); // apply over defaults to ensure all keys exist

		// placeholder: migrate data if need-be
		return data;
	}
}

export const game = new Game();
