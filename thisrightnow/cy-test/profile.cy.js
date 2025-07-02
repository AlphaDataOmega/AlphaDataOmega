describe('Profile Editing', () => {
  it('should allow a user to update their profile', () => {
    cy.visit('http://localhost:5173/account/your-address');
    cy.contains('Edit Profile').click();
    cy.get('input[name="username"]').clear().type('newusername');
    cy.get('textarea[name="bio"]').clear().type('This is my new bio.');
    cy.get('input[type="file"]').attachFile('avatar.png'); // Requires cypress-file-upload plugin
    cy.contains('Save Changes').click();
    cy.contains('Profile updated').should('exist');
  });
}); 