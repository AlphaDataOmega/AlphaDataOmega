describe('Dark/Light Mode', () => {
  it('should toggle dark mode', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('Dark Mode').click();
    cy.get('body').should('have.class', 'dark');
    cy.contains('Light Mode').click();
    cy.get('body').should('not.have.class', 'dark');
  });
}); 