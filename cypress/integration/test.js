describe('Test connection', () => {
  it('Should be already connected', () => {
    cy.visit('/')
    cy.contains('0x68D25464371F3a97691c52e40d4C1306aF0B7629')
  })
})
