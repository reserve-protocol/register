import { RESERVE_API } from '@/utils/constants'
import { Hex, Address } from 'viem'

const uploadUrl = `${RESERVE_API}folio-manager/upload`

type Result =
  | {
      status: 'error'
      error: string
    }
  | {
      status: 'success'
      result: {
        url: string
      }
    }

export const uploadFile = async ({
  file,
  folio,
  message,
  signature,
}: {
  file: File | Blob | ArrayBuffer
  folio: Address
  message: string
  signature: Hex
}): Promise<{ url: string }> => {
  if (file instanceof ArrayBuffer) {
    file = new File([file], 'buffer')
  }
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folio', folio)
  fd.append('message', message)
  fd.append('signature', signature)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: fd,
  })

  const json = (await response.json()) as Result
  if (!response.ok) {
    if (json.status === 'error') {
      throw new Error(`Failed to upload asset: ${json.error}`)
    }

    throw new Error(
      `Failed to upload asset due to unknown error (${response.status}) `
    )
  }

  if (json.status === 'error') {
    throw new Error(`Failed to upload asset: ${json.error}`)
  }

  return json.result
}
