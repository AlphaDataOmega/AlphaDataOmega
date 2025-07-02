describe('Analytics/Leaderboard', () => {
  it('should display the leaderboard', () => {
    cy.visit('http://localhost:5173/analytics/leaderboard');
    cy.contains('Leaderboard').should('exist');
  });
}); 