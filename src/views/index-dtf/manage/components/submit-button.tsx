import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import { signatureAtom } from '../atoms'
import { useSignMessage } from 'wagmi'
import { walletAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

const NONCE_ENDPOINT = `${RESERVE_API}folio-manager/nonce`
const VERIFY_ENDPOINT = `${RESERVE_API}folio-manager/verify`

const api = {
  getNonce: async (): Promise<{ nonce: string }> => {
    const response = await fetch(NONCE_ENDPOINT)
    if (!response.ok) throw new Error('Failed to get nonce')
    return response.json().nonce
  },

  // verifySignature: async (
  //   payload: VerifySignaturePayload
  // ): Promise<AuthResponse> => {
  //   const response = await fetch('/folio-manager/verify', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(payload),
  //   })

  //   if (!response.ok) throw new Error('Verification failed')
  //   return response.json()
  // },
}

const SubmitButton = () => {
  const signature = useAtomValue(signatureAtom)
  const wallet = useAtomValue(walletAtom)
  const { signMessage } = useSignMessage()
  const { data: nonce } = useQuery({
    queryKey: ['nonce'],
    queryFn: () => api.getNonce(),
  })

  console.log('nonce', nonce)

  const handleSignMessage = () => {
    if (!wallet) return

    signMessage({ message: 'test' })
  }

  if (!signature)
    return (
      <div className="rounded-3xl p-2 shadow-md bg-card">
        <Button className="w-full rounded-xl" onClick={handleSignMessage}>
          Verify wallet
        </Button>
      </div>
    )

  return (
    <div className="rounded-3xl p-2 shadow-md bg-card">
      <Button type="submit" className="w-full rounded-xl">
        Submit all changes
      </Button>
    </div>
  )
}

export default SubmitButton
