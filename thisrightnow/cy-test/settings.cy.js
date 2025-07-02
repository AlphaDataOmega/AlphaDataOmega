describe('Settings', () => {
  it('should allow a user to change preferences', () => {
    cy.visit('http://localhost:5173/account/settings');
    cy.get('input[name="emailNotifications"]').check();
    cy.get('input[name="darkMode"]').check();
    cy.contains('Save Settings').click();
    cy.contains('Settings updated').should('exist');
  });
}); 