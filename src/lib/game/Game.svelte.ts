import { Stories } from './data/NewsStories';
import { DefaultCoreStats, Upgrades, type UpgradeStat } from './data/Upgrades';

class Game {
	private intervalId: ReturnType<typeof setInterval> | null = null;
	private tickAccumulator = 0;

	private ticksPerSecond = 30;
	// Seconds passed per tick
	public deltaTime = 1 / this.ticksPerSecond;
	// $/kWh
	public kwhPrice = 0.06;
	public incomeBoostMultiplier = 3600;
	// Exponential efficiency loss when over thermal limit (approaching one is steeper)
	public efficiencyDropoffExponent = 0.85;
	// Multiple of limit break progress lost per second
	public limitBreakDecayMultiplierPerSec = 0.05;
	// Cost multiplier per upgrade level
	public upgradeCostScaling = 1.18;

	public static readonly Defaults = {
		balance: 0,
		upgrades: [] as { id: string; count: number }[],
		cores: 1,
		stats: {
			limitBreaks: 0
		},
		news: {
			unlocked: [] as string[]
		},
		limitBreakWh: 0
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
	getUpgradePositivity(upgradeId: string, forStat: UpgradeStat) {
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

	getLimitBreakProgress() {
		const maxProgress = this.getLimitBreakCostWattHours();
		return Math.min(this.persistentState.limitBreakWh / maxProgress, 1);
	}

	getLimitBreakCostWattHours() {
		const maxOutput = this.getMaxTotalOutput();
		return (maxOutput * 30) / 60 / 60; // * [seconds of output] / [60 seconds] / [60 minutes]
	}

	getUpgradeLevel(upgradeId: string) {
		const upgradeEntry = this.persistentState.upgrades.find((u) => u.id === upgradeId);
		return upgradeEntry ? upgradeEntry.count : 0;
	}

	getUpgradeEffectTotal(upgradeId: string, forStat: UpgradeStat) {
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

	calculateUpgradeCost(upgradeId: string) {
		const upgradeEntry = this.persistentState.upgrades.find((u) => u.id === upgradeId);
		const baseCost = Upgrades.find((u) => u.id === upgradeId)?.cost ?? 0;
		const scaling = Upgrades.find((u) => u.id === upgradeId)?.costScaling ?? this.upgradeCostScaling;

		if (upgradeEntry) {
			return baseCost * scaling ** upgradeEntry.count;
		} else {
			return baseCost;
		}
	}

	purchaseUpgrade(upgradeId: string) {
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
		const degsPerWatt = this.getUpgradedStat('degsPerWatt');

		if (coreIndex < 0 || coreIndex >= this.persistentState.cores) {
			console.warn('Tried to get temperature of invalid core index', coreIndex);
			return 0;
		}

		const coreOutput = this.coreOutputs[coreIndex] ?? 0;
		return coreOutput * degsPerWatt;
	}

	// Maximum total output of all cores in watts
	getMaxTotalOutput() {
		const degsPerWatt = this.getUpgradedStat('degsPerWatt');
		const thermalLimitDeg = this.getUpgradedStat('thermalLimitDegs');

		return (thermalLimitDeg / degsPerWatt) * this.persistentState.cores;
	}

	getTotalInputFlux() {
		const harvestedFlux = this.getUpgradedStat('fluxHarvestRate');

		let totalFlux = harvestedFlux;

		// apply clicks
		for (let i = 0; i < this.persistentState.cores; i++) {
			let totalClickFlux = 0;

			if (!this.coreClicks[i]) continue;

			for (const click of this.coreClicks[i]) {
				totalClickFlux += click.flux;
			}

			totalFlux += totalClickFlux;
		}

		return totalFlux;
	}

	tick() {
		const decayRate = this.getUpgradedStat('clickDecayPerSec');
		const wattsPerFlux = this.getUpgradedStat('wattsPerFlux');
		const thermalLimitDeg = this.getUpgradedStat('thermalLimitDegs');
		const degsPerWatt = this.getUpgradedStat('degsPerWatt');

		// calculate core outputs
		const inputFlux = this.getUpgradedStat('fluxHarvestRate');

		let limitBreakIncreasing = false;

		for (let i = 0; i < this.persistentState.cores; i++) {
			let coreInputFlux = inputFlux / this.persistentState.cores;

			if (!this.coreClicks[i]) this.coreClicks[i] = [];

			// apply clicks
			for (const click of this.coreClicks[i]) {
				// we apply before decaying so that clicks always give their full amount at least once
				coreInputFlux += click.flux;
				click.flux -= decayRate * this.deltaTime;
			}

			// filter out old clicks
			this.coreClicks[i] = this.coreClicks[i].filter((click) => click.flux >= 0);

			// reduce efficiency when over-utilised
			let output = coreInputFlux * wattsPerFlux;

			const utilisation = (coreInputFlux * wattsPerFlux * degsPerWatt) / thermalLimitDeg;
			if (utilisation > 1) {
				output /= utilisation ** this.efficiencyDropoffExponent;

				const wattsOverLimit = output - thermalLimitDeg / degsPerWatt;
				this.persistentState.limitBreakWh += (wattsOverLimit * this.deltaTime) / 60 / 60;
				limitBreakIncreasing = true;
			}

			this.coreOutputs[i] = output;
		}

		// decay limit break progress if not increasing
		if (!limitBreakIncreasing) {
			this.persistentState.limitBreakWh -= this.persistentState.limitBreakWh * this.limitBreakDecayMultiplierPerSec * this.deltaTime;
		}

		// snap limit break progress to zero if close
		if (this.persistentState.limitBreakWh < 1 / 1000 / 100) this.persistentState.limitBreakWh = 0;

		// smooth total output
		this.totalOutputSamples.push(this.totalOutput);
		if (this.totalOutputSamples.length > this.averageSampleCount) {
			this.totalOutputSamples.shift();
		}

		this.persistentState.balance += this.totalOutput * this.kwhPrice * (this.deltaTime / 60 / 60) * this.incomeBoostMultiplier;

		// test story requirements
		for (const story of Stories) {
			if (!this.persistentState.news.unlocked.find((id) => id === story.id) && (!story.requirements || story.requirements())) {
				this.persistentState.news.unlocked.push(story.id);
			}
		}
	}

	runLoop() {
		let currentTime = performance.now();

		this.intervalId = setInterval(() => {
			const newTime = performance.now();
			const deltaTime = newTime - currentTime;
			currentTime = newTime;

			this.tickAccumulator += deltaTime / 1000;

			while (this.tickAccumulator >= this.deltaTime) {
				this.tickAccumulator -= this.deltaTime;
				this.tick();
			}
		}, 1000 / this.ticksPerSecond);
	}

	stopLoop() {
		console.log('Stopping tick loop');
		if (this.intervalId !== null) {
			console.log('^(Interval found)');
			this.tickAccumulator = 0;

			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	saveState() {
		console.log('Saving state');
		localStorage.setItem('lbi-state', JSON.stringify(this.persistentState));
	}

	loadState() {
		console.log('Loading saved state');
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

// @ts-expect-error for debugging
window.game = game;
