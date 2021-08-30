import ERRORS from '../constants/errors'

// Gets the "errorMessage" prop from the contract call result and return a human friendlier message
export const getErrorMessage = (
  rejectionMessage: string,
  messages = ERRORS
): string => {
  for (const error of Object.keys(messages)) {
    if (rejectionMessage.indexOf(error) !== -1) {
      return messages[error]
    }
  }

  return rejectionMessage
}
