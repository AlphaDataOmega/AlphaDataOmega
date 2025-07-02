describe('Login', () => {
  it('should allow a user to log in', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('Login').click();
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password123');
    cy.contains('Submit').click();
    cy.contains('Dashboard').should('exist');
  });
}); 