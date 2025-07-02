describe('Moderation/Flagging', () => {
  it('should allow a user to flag a post', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('Flag').first().click();
    cy.get('textarea[placeholder="Reason"]').type('Inappropriate content');
    cy.contains('Submit Flag').click();
    cy.contains('Flag submitted').should('exist');
  });
}); 