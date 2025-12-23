const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Experlisting API',
      version: '1.0.0',
      description: 'Docs',
    },
  },

  apis: ['./spec/api.yaml'],
};

module.exports = swaggerJSDoc(options);
