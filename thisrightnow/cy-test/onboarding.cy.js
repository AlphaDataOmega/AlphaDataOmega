describe('User Onboarding', () => {
  it('should allow a new user to register/onboard', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('Sign Up').click();
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="email"]').type('testuser@example.com');
    cy.contains('Register').click();
    cy.contains('Welcome, testuser').should('exist');
  });
}); 