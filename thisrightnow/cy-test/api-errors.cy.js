describe('API Error Handling', () => {
  it('should display an error message on server error', () => {
    cy.intercept('POST', '/api/*', { statusCode: 500 }).as('apiError');
    cy.visit('http://localhost:5173/');
    cy.contains('Create Post').click();
    cy.get('textarea').type('This will fail');
    cy.contains('Submit').click();
    cy.contains('An error occurred').should('exist');
  });
}); 