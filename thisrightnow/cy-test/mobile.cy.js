describe('Mobile Responsiveness', () => {
  it('should display the mobile layout', () => {
    cy.viewport('iphone-6');
    cy.visit('http://localhost:5173/');
    cy.get('.mobile-nav').should('be.visible');
  });
}); 