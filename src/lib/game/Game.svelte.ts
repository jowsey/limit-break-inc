import { Upgrades, type UpgradeId, type UpgradeStat } from './data/Upgrades';

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
		upgrades: [] as { id: string; count: number }[],
		cores: 1,
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
	public totalOutputSmooth = $derived(this.totalOutputSamples.reduce((a, b) => a + b, 0) / Math.max(this.totalOutputSamples.length, 1));

	// 1 is positive, -1 is negative, 0 is neutral
	getUpgradePositivity(upgradeId: UpgradeId, forStat: UpgradeStat) {
		const upgrade = Upgrades.find((u) => u.id === upgradeId);
		if (!upgrade) {
			console.warn('Tried to get effect positivity for unknown upgrade', upgradeId);
			return 0;
		}

		const effect = upgrade.effects.find((e) => e.stat === forStat);
		if (!effect) {
			console.warn('Tried to get effect positivity for unset stat on upgrade', upgradeId, forStat);
			return 0;
		}

		if (effect.method === 'add') {
			const sign = Math.sign(effect.value);
			return upgrade.invertPositivity ? -sign : sign;
		}
		if (effect.method === 'multiply') {
			// above/below 1
			const sign = Math.sign(effect.value - 1);
			return upgrade.invertPositivity ? -sign : sign;
		}
	}

	getUpgradeLevel(upgradeId: UpgradeId) {
		const upgradeEntry = this.persistentState.upgrades.find((u) => u.id === upgradeId);
		return upgradeEntry ? upgradeEntry.count : 0;
	}

	getUpgradeEffectTotal(upgradeId: UpgradeId, forStat: UpgradeStat) {
		const upgrade = Upgrades.find((u) => u.id === upgradeId);
		if (!upgrade) {
			console.warn('Tried to get effect total for unknown upgrade', upgradeId);
			return 0;
		}

		const effect = upgrade.effects.find((e) => e.stat === forStat);
		if (!effect) {
			console.warn('Tried to get effect total for unset stat on upgrade', upgradeId, forStat);
			return 0;
		}

		let total = effect?.method === 'multiply' ? 1 : 0;

		const upgradeEntry = this.persistentState.upgrades.find((u) => u.id === upgradeId);
		if (!upgradeEntry) return total;

		if (effect.method === 'add') {
			total += effect.value * upgradeEntry.count;
		} else if (effect.method === 'multiply') {
			total += effect.value ** upgradeEntry.count;
		}
		return total;
	}

	calculateUpgradeCost(upgradeId: UpgradeId) {
		const upgradeEntry = this.persistentState.upgrades.find((u) => u.id === upgradeId);
		const baseCost = Upgrades.find((u) => u.id === upgradeId)?.cost ?? 0;
		const scaling = Upgrades.find((u) => u.id === upgradeId)?.costScaling ?? 1.26;

		if (upgradeEntry) {
			return baseCost * scaling ** upgradeEntry.count;
		} else {
			return baseCost;
		}
	}

	purchaseUpgrade(upgradeId: UpgradeId) {
		const upgrade = Upgrades.find((u) => u.id === upgradeId);
		if (!upgrade) {
			console.warn('Tried to purchase unknown upgrade', upgradeId);
			return;
		}

		if (game.persistentState.balance < upgrade.cost) return;

		const upgradeEntry = this.persistentState.upgrades.find((u) => u.id === upgradeId);

		if (upgradeEntry) {
			upgradeEntry.count++;
		} else {
			this.persistentState.upgrades.push({ id: upgradeId, count: 1 });
		}

		game.persistentState.balance -= this.calculateUpgradeCost(upgradeId);
	}

	tick() {
		const hoursDelta = this.stepMs / 1000 / 60 / 60;
		const currentTime = performance.now();

		// calculate core outputs
		for (let i = 0; i < this.persistentState.cores; i++) {
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
