describe('Governance/Proposal Voting', () => {
  it('should allow a user to vote on a proposal', () => {
    cy.visit('http://localhost:5173/analytics/governance');
    cy.contains('Vote').first().click();
    cy.contains('Vote submitted').should('exist');
  });
}); 