import ERRORS from '../constants/errors'

// Gets the "errorMessage" prop from the contract call result and return a human friendlier message
export const getErrorMessage = (rejectionMessage, messages = ERRORS) => {
  for (const error of Object.key(messages)) {
    if (rejectionMessage.indexOf(error) !== -1) {
      return messages[error]
    }
  }

  return rejectionMessage
}
