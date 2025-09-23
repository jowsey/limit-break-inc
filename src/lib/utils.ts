const formatWatts = (watts: number) => {
	if (isNaN(watts) || !isFinite(watts)) return '??? W';
	if (watts >= 1e18) return (watts / 1e18).toPrecision(3) + ' EW';
	if (watts >= 1e15) return (watts / 1e15).toPrecision(3) + ' PW';
	if (watts >= 1e12) return (watts / 1e12).toPrecision(3) + ' TW';
	if (watts >= 1e9) return (watts / 1e9).toPrecision(3) + ' GW';
	if (watts >= 1e6) return (watts / 1e6).toPrecision(3) + ' MW';
	if (watts >= 1e3) return (watts / 1e3).toPrecision(3) + ' kW';
	if (watts >= 1) return watts.toPrecision(3) + ' W';
	return (watts * 1000).toPrecision(3) + ' mW';
};

export { formatWatts };
