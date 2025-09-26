import { DefaultCoreStats, Upgrades, type UpgradeId, type UpgradeStat } from './data/Upgrades';

class Game {
	private animationFrame: number | null = null;
	private tickAccumulator = 0;

	// Amount of real-time between game ticks
	public stepMs = 1000 / 20;
	// Speed multiplier on in-game time
	public timeScale = 60 * 60;

	public static readonly Defaults = {
		balance: 0,
		upgrades: [] as { id: string; count: number }[],
		cores: 1,
		market: {
			kwhPrice: 0.05
		}
	};

	// State saved to localStorage
	public persistentState: typeof Game.Defaults = $state(Game.Defaults);

	// Output of each active core in watts
	public coreOutputs: number[] = $state([0]);
	// Combined output of all cores in watts
	public totalOutput = $derived(this.coreOutputs.reduce((a, b) => a + b, 0));
	// Array of active clicks for each core
	public coreClicks: { flux: number }[][] = $state([]);

	private averageSampleCount = 15;
	private totalOutputSamples: number[] = $state([]);

	// Average total output over the last averageSampleCount ticks
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
			total *= effect.value ** upgradeEntry.count;
		}
		return total;
	}

	getUpgradedStat(forStat: UpgradeStat) {
		let total = DefaultCoreStats[forStat] ?? 0;

		for (const ownedUpgrade of this.persistentState.upgrades) {
			const upgrade = Upgrades.find((u) => u.id === ownedUpgrade.id);
			if (!upgrade) continue;

			const effect = upgrade.effects.find((e) => e.stat === forStat);
			if (!effect) continue;

			if (effect.method === 'add') {
				total += effect.value * ownedUpgrade.count;
			} else if (effect.method === 'multiply') {
				total *= effect.value ** ownedUpgrade.count;
			}
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

		game.persistentState.balance -= this.calculateUpgradeCost(upgradeId);

		if (upgradeEntry) {
			upgradeEntry.count++;
		} else {
			this.persistentState.upgrades.push({ id: upgradeId, count: 1 });
		}
	}

	addCoreClick(coreIndex: number) {
		if (coreIndex < 0 || coreIndex >= this.persistentState.cores) {
			console.warn('Tried to add click to invalid core index', coreIndex);
			return;
		}

		if (!this.coreClicks[coreIndex]) this.coreClicks[coreIndex] = [];

		this.coreClicks[coreIndex].push({ flux: this.getUpgradedStat('fluxPerClick') });
	}

	getCoreTemperature(coreIndex: number) {
		const heatPerWatt = this.getUpgradedStat('heatPerWatt');

		if (coreIndex < 0 || coreIndex >= this.persistentState.cores) {
			console.warn('Tried to get temperature of invalid core index', coreIndex);
			return 0;
		}

		const coreOutput = this.coreOutputs[coreIndex] ?? 0;
		return coreOutput * heatPerWatt;
	}

	getTotalInputFlux() {
		const deltaTime = this.stepMs / 1000;
		const harvestedFlux = this.getUpgradedStat('fluxHarvestRate') * deltaTime;

		let totalFlux = 0;

		for (let i = 0; i < this.persistentState.cores; i++) {
			let coreInputFlux = harvestedFlux / this.persistentState.cores;

			if (!this.coreClicks[i]) continue;

			// apply clicks
			for (const click of this.coreClicks[i]) {
				coreInputFlux += click.flux;
			}

			totalFlux += coreInputFlux;
		}

		return totalFlux;
	}

	tick() {
		// time in hours passed this tick
		const deltaTime = this.stepMs / 1000;
		const deltaHours = deltaTime / 60 / 60;

		const decayRate = this.getUpgradedStat('clickDecayRate');
		const wattsPerFlux = this.getUpgradedStat('wattsPerFlux');

		// calculate core outputs
		const inputFlux = this.getUpgradedStat('fluxHarvestRate') * deltaTime;

		for (let i = 0; i < this.persistentState.cores; i++) {
			let coreInputFlux = inputFlux / this.persistentState.cores;

			if (!this.coreClicks[i]) continue;

			// apply clicks
			for (const click of this.coreClicks[i]) {
				// we apply before decaying so that clicks always give their full amount at least once
				coreInputFlux += click.flux;
				click.flux -= decayRate * deltaTime;
			}

			// filter out old clicks
			this.coreClicks[i] = this.coreClicks[i].filter((click) => click.flux >= 0);

			this.coreOutputs[i] = coreInputFlux * wattsPerFlux;
		}

		// smooth total output
		this.totalOutputSamples.push(this.totalOutput);
		if (this.totalOutputSamples.length > this.averageSampleCount) {
			this.totalOutputSamples.shift();
		}

		this.persistentState.balance += this.totalOutput * this.persistentState.market.kwhPrice * deltaHours * this.timeScale;
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

	loadState() {
		this.persistentState = this.getSavedState();
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
