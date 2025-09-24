interface Core {
	upgrades: { id: string; count: number }[];
}

class Game {
	private animationFrame: number | null = null;
	private tickAccumulator = 0;

	// Amount of real-time between game ticks
	public stepMs = 1000 / 20;
	// Speed multiplier on in-game time
	public timeScale = 60 * 60;

	// Max watts generated per active decaying click
	public clickPower = 0.1;
	// Duration over which to decay clicks
	public clickDecayMs = 1000 * 3;

	public static readonly Defaults = {
		balance: 0,
		cores: [Game.newCore()] as Core[],
		market: {
			kwhPrice: 0.05
		}
	};

	// State saved to localStorage
	public persistentState = $state(this.getSavedState());

	// Output of each active core in watts
	public coreOutputs: number[] = $state([0]);
	// Combined output of all cores in watts
	public totalOutput = $derived(this.coreOutputs.reduce((a, b) => a + b, 0));
	// Array of active clicks for each core
	public coreClicks: { time: number }[][] = $state([]);

	private averageSampleCount = 15;
	private totalOutputSamples: number[] = $state([]);

	// Average total output over the last N ticks
	public totalOutputSmooth = $derived(
		this.totalOutputSamples.reduce((a, b) => a + b, 0) / Math.max(this.totalOutputSamples.length, 1)
	);

	static newCore() {
		return {
			upgrades: []
		} as Core;
	}

	tick() {
		const hoursDelta = this.stepMs / 1000 / 60 / 60;
		const currentTime = performance.now();

		// calculate core outputs
		for (let i = 0; i < this.persistentState.cores.length; i++) {
			// const core = this.persistentState.cores[i]; // todo use upgrades
			let coreOutput = 0;

			// filter out old clicks
			if (!this.coreClicks[i]) this.coreClicks[i] = [];
			this.coreClicks[i] = this.coreClicks[i].filter((click) => currentTime - click.time < this.clickDecayMs);

			for (const click of this.coreClicks[i]) {
				const age = currentTime - click.time;
				const decayFactor = 1 - age / this.clickDecayMs;
				coreOutput += this.clickPower * decayFactor;
			}

			this.coreOutputs[i] = coreOutput;
		}

		// smooth total output
		this.totalOutputSamples.push(this.totalOutput);
		if (this.totalOutputSamples.length > this.averageSampleCount) {
			this.totalOutputSamples.shift();
		}

		this.persistentState.balance += this.totalOutput * hoursDelta * this.timeScale * this.persistentState.market.kwhPrice;
	}

	runLoop() {
		let currentTime = performance.now();

		const frame = () => {
			const newTime = performance.now();
			const deltaTime = newTime - currentTime;
			currentTime = newTime;

			this.tickAccumulator += deltaTime;

			while (this.tickAccumulator >= this.stepMs) {
				this.tickAccumulator -= this.stepMs;
				this.tick();
			}

			this.animationFrame = requestAnimationFrame(frame);
		};

		this.animationFrame = requestAnimationFrame(frame);
	}

	stopLoop() {
		if (this.animationFrame !== null) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}
	}

	saveState() {
		localStorage.setItem('lbi-state', JSON.stringify(this.persistentState));
	}

	getSavedState(): typeof Game.Defaults {
		const storedData = JSON.parse(localStorage.getItem('lbi-state') ?? 'null');
		const data = Object.assign({}, Game.Defaults, storedData); // apply over defaults to ensure all keys exist

		// placeholder: migrate data if need-be
		return data;
	}

	resetState() {
		this.persistentState = Game.Defaults;
		this.saveState();
	}
}

export const game = new Game();
