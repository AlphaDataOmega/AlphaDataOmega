describe('Post Details & Replies', () => {
  it('should allow a user to view post details and replies', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('View').first().click();
    cy.contains('Replies').should('exist');
  });
}); 