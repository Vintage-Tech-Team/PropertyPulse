// Haversine formula to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
	const R = 6371; // Earth's radius in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

const calculateDuration = (moveInDate, moveOutDate) => {
	const start = new Date(moveInDate);
	const end = new Date(moveOutDate);
	const diffTime = Math.abs(end - start);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	const months = Math.floor(diffDays / 30);
	const years = Math.floor(months / 12);

	if (years > 0) {
		const remainingMonths = months % 12;
		return remainingMonths > 0
			? `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
			: `${years} year${years > 1 ? 's' : ''}`;
	}
	if (months > 0) {
		return `${months} month${months > 1 ? 's' : ''}`;
	}
	return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
};

module.exports = {
	calculateDistance,
	calculateDuration,
};
