describe('Password Reset', () => {
  it('should allow a user to reset their password', () => {
    cy.visit('http://localhost:5173/login');
    cy.contains('Forgot Password').click();
    cy.get('input[name="email"]').type('testuser@example.com');
    cy.contains('Send Reset Link').click();
    cy.contains('Reset link sent').should('exist');
  });
}); 