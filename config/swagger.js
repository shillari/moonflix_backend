const swaggerJsdoc = require('swagger-jsdoc');

// Define security options
const securityOptions = {
    bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    },
};

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Moonflix',
            version: '1.0.0',
            description: 'See /documentation.html',
        },
        components: {
            securitySchemes: securityOptions,
        },
        security: [securityOptions], // Global security requirement
    },
    apis: ['./*.js'], // Path to the API routes folder
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
