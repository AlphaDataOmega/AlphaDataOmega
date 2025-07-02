describe('Logout', () => {
  it('should allow a user to log out', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('Logout').click();
    cy.contains('Login').should('exist');
  });
}); 