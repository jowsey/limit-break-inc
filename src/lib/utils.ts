const formatWatts = (watts: number) => {
	if (isNaN(watts) || !isFinite(watts)) return '???  W';
	if (watts >= 1e18) return (watts / 1e18).toPrecision(3) + ' EW';
	if (watts >= 1e15) return (watts / 1e15).toPrecision(3) + ' PW';
	if (watts >= 1e12) return (watts / 1e12).toPrecision(3) + ' TW';
	if (watts >= 1e9) return (watts / 1e9).toPrecision(3) + ' GW';
	if (watts >= 1e6) return (watts / 1e6).toPrecision(3) + ' MW';
	if (watts >= 1e3) return (watts / 1e3).toPrecision(3) + ' kW';
	if (watts >= 1) return watts.toPrecision(3) + '  W';
	return (watts * 1000).toPrecision(3) + ' mW';
};

const formatWattHours = (wattHours: number) => {
	if (isNaN(wattHours) || !isFinite(wattHours)) return '???  Wh';
	if (wattHours >= 1e18) return (wattHours / 1e18).toPrecision(3) + ' EWh';
	if (wattHours >= 1e15) return (wattHours / 1e15).toPrecision(3) + ' PWh';
	if (wattHours >= 1e12) return (wattHours / 1e12).toPrecision(3) + ' TWh';
	if (wattHours >= 1e9) return (wattHours / 1e9).toPrecision(3) + ' GWh';
	if (wattHours >= 1e6) return (wattHours / 1e6).toPrecision(3) + ' MWh';
	if (wattHours >= 1e3) return (wattHours / 1e3).toPrecision(3) + ' kWh';
	if (wattHours >= 1) return wattHours.toPrecision(3) + '  Wh';
	return (wattHours * 1000).toPrecision(3) + ' mWh';
};

const formatMoney = (money: number) => {
	return '$' + money.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const numToRoman = (num: number) => {
	if (num <= 0) return num.toString();

	const romanNumerals: { [key: number]: string } = {
		1000: 'M',
		900: 'CM',
		500: 'D',
		400: 'CD',
		100: 'C',
		90: 'XC',
		50: 'L',
		40: 'XL',
		10: 'X',
		9: 'IX',
		5: 'V',
		4: 'IV',
		1: 'I'
	};

	let result = '';
	for (const value of Object.keys(romanNumerals)
		.map(Number)
		.sort((a, b) => b - a)) {
		while (num >= value) {
			result += romanNumerals[value];
			num -= value;
		}
	}
	return result;
};

export { formatWatts, formatWattHours, formatMoney, numToRoman };
