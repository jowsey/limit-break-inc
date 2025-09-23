interface Core {
	upgrades: { id: string; count: number }[];
}

class Game {
	private animationFrame: number | null = null;
	private tickAccumulator = 0;

	public stepMs = 1000 / 20; // 20 ticks per second
	public timeScale = 60 * 60; // one game hour per real second

	public clickPower = 0.1; // each click generates 0.1W
	public clickDecayMs = 1000 * 3; // clicks decay over 3 seconds

	public static readonly Defaults = {
		balance: 0,
		cores: [Game.newCore()] as Core[],
		market: {
			kwhPrice: 0.05
		}
	};

	public persistentState = $state(this.getSavedState()); // loaded from localStorage

	public coreOutputs: number[] = $state([0]); // in Watts
	public totalOutput = $derived(this.coreOutputs.reduce((a, b) => a + b, 0)); // combined output of all cores
	public coreClicks: { time: number }[][] = $state([]); // timestamps of clicks on each core

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
