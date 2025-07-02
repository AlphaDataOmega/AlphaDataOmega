const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cy-test/**/*.cy.{js,ts}',
    baseUrl: 'http://localhost:5173', // Adjust if your dev server runs elsewhere
  },
}); 