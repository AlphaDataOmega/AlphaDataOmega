describe('Feed Browsing', () => {
  it('should allow a user to browse and filter the feed', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('Feed').click();
    cy.get('input[placeholder="Search"]').type('alpha');
    cy.contains('Filter').click();
    cy.contains('alpha').should('exist');
  });
}); 