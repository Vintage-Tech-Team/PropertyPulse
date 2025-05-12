const cron = require('node-cron');

// Cron job function
const handler = (req, res) => {
	cron.schedule('41 16 * * *', async () => {
		console.log('Running cron job to update deployment URLs...');
	});
};

module.exports = { handler };
