const swaggerJsDoc = require('swagger-jsdoc');

// Swagger Configuration
const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Rentals Review API',
			version: '1.0.0',
			description: 'API for managing rental properties and reviews',
		},
		servers: [
			{
				url: 'http://localhost:5000',
				description: 'Development server',
			},
		],
	},
	apis: ['./routes/*.js'], // Path to your route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Export the swaggerDocs for use in your app
module.exports = { swaggerDocs };
