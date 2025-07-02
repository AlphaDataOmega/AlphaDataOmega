describe('Multi-step Onboarding', () => {
  it('should complete the onboarding walkthrough', () => {
    cy.visit('http://localhost:5173/');
    cy.contains('Get Started').click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Finish').click();
    cy.contains('Onboarding complete').should('exist');
  });
}); 