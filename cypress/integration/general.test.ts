import { TEST_ADDRESS_NEVER_USE_SHORTENED } from '../support/commands'

describe('Test connection', () => {
  it('Should display the page layout', () => {
    cy.visit('/')
    cy.contains('Reserve Explorer')
  })

  it('Should be connected with the default account', () => {
    cy.visit('/')
    cy.contains(TEST_ADDRESS_NEVER_USE_SHORTENED)
  })
})
