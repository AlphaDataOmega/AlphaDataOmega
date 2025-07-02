describe('Error Handling', () => {
  it('should display an error for invalid routes', () => {
    cy.visit('http://localhost:5173/this-route-does-not-exist', { failOnStatusCode: false });
    cy.contains('404').should('exist');
  });
}); 