import TransactionButton from '@/components/old/button/TransactionButton'

const SubmitStakeButton = () => {
  return (
    <div>
      <TransactionButton
        // disabled={!isReady}
        // gas={gas}
        // loading={isLoading || !!hash}
        // loadingText={!!hash ? 'Confirming tx...' : 'Pending, sign in wallet'}
        // onClick={write}
        text="Submit"
        fullWidth
        // error={validationError || error || txError}
      />
    </div>
  )
}

export default SubmitStakeButton
