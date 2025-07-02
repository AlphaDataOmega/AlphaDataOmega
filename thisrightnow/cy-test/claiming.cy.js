describe('Claiming Flow', () => {
  it('should allow a user to claim earnings', () => {
    cy.visit('http://localhost:5173/account/your-address/earnings'); // Adjust as needed
    cy.contains('Claim').click();
    cy.contains('Claim successful').should('exist');
  });
}); 