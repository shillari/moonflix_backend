const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Moonflix',
            version: '1.0.0',
            description: 'See /documentation.html',
        },
    },
    apis: ['./*.js'], // Path to the API routes folder
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;