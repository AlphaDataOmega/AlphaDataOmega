describe('Notifications', () => {
  it('should allow a user to view and mark notifications as read', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('Notifications').click();
    cy.get('.notification').first().click();
    cy.contains('Marked as read').should('exist');
  });
}); 