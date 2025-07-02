describe('Boosting/Engagement', () => {
  it('should allow a user to boost a post', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('Boost').first().click();
    cy.get('input[type="number"]').type('10');
    cy.contains('Confirm Boost').click();
    cy.contains('Boost successful').should('exist');
  });
}); 