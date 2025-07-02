describe('Vault/Recovery', () => {
  it('should allow a user to recover a vault', () => {
    cy.visit('http://localhost:5173/recover');
    cy.get('input[name="vaultKey"]').type('testkey');
    cy.contains('Recover').click();
    cy.contains('Vault recovered').should('exist');
  });
}); 