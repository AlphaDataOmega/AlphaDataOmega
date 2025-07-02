// E2E: Post → View → Merkle → Proof → Claim → Vault TRN balance > 0
// Uses platform core assumptions for deterministic, Merkle-traceable flows

describe('PostToClaimFlow', () => {
  it('should allow a user to earn and claim TRN from a post view', () => {
    // 1. Simulate user login (mock or UI)
    cy.visit('http://localhost:5173/login');
    cy.get('input[type=email]').type('user@example.com');
    cy.get('input[type=password]').type('password123');
    cy.contains('Login').click();
    cy.url().should('include', '/feed');

    // 2. Create a post
    cy.contains('Create Post').click();
    cy.get('textarea').type('E2E test post for claim flow');
    cy.contains('Post').click();
    cy.contains('E2E test post for claim flow').should('exist');

    // 3. Simulate a view event (could be automatic on post creation)
    // Optionally, trigger a view as another user or via API

    // 4. Trigger Merkle drop (simulate or call API/CLI)
    cy.exec('npm run indexer:mock-drop');

    // 5. Fetch proof and claim TRN
    cy.visit('http://localhost:5173/vault');
    cy.contains('Claim').click();

    // 6. Assert vault TRN balance > 0
    cy.get('.vault-balance').invoke('text').then((text) => {
      const balance = parseFloat(text);
      expect(balance).to.be.greaterThan(0);
      cy.log('Vault TRN balance after claim:', balance);
    });
  });
}); 