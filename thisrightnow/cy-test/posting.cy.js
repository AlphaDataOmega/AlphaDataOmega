describe('Posting Flow', () => {
  it('should allow a user to create a post', () => {
    cy.visit('http://localhost:5173/'); // Adjust to your dev server URL/port
    cy.contains('Create Post').click();
    cy.get('textarea').type('Hello, Cypress!');
    cy.contains('Submit').click();
    cy.contains('Hello, Cypress!').should('exist');
  });

  it('should create a post via the API', () => {
    cy.request('POST', '/api/post/new', { content: 'API test post content' }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('hash');
      expect(response.body).to.have.property('category');
      expect(response.body).to.have.property('regionCode');
      expect(response.body).to.have.property('earningsProjection');
      expect(response.body.category).to.be.a('string');
      expect(response.body.regionCode).to.be.a('string');
      expect(response.body.earningsProjection).to.be.a('number');
    });
  });
}); 