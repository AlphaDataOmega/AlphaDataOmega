describe('Voting Flow', () => {
  it('should allow a user to vote on a post', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('Vote').first().click();
    cy.contains('Thank you for voting').should('exist');
  });
}); 