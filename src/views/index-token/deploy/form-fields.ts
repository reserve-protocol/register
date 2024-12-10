import { isAddress } from 'viem'
import { z } from 'zod'

export type DeployStepId =
  | 'metadata'
  | 'basket'
  | 'governance'
  | 'demurrage-fee'
  | 'revenue-distribution'

export const dtfDeploySteps: Record<DeployStepId, { fields: string[] }> = {
  metadata: {
    fields: ['name', 'symbol'],
  },
  basket: {
    fields: ['initialValue', 'tokensDistribution'],
  },
  governance: {
    fields: [
      'governanceERC20name',
      'governanceERC20symbol',
      'governanceERC20address',
      'governanceWalletAddress',
    ],
  },
  'demurrage-fee': {
    fields: ['demurrageFee'],
  },
  'revenue-distribution': {
    fields: [],
  },
}

export const DeployFormSchema = z
  .object({
    name: z.string().min(1, 'Token name is required'),
    symbol: z.string().min(1, 'Token symbol is required'),
    initialValue: z.coerce.number().positive('Initial value must be positive'),
    tokensDistribution: z.array(
      z.coerce.number().positive('Token distribution must be positive')
    ),
    governanceERC20name: z.string().min(1, 'Token name is required').optional(),
    governanceERC20symbol: z
      .string()
      .min(1, 'Token symbol is required')
      .optional(),
    governanceERC20address: z
      .string()
      .refine(isAddress, { message: 'Invalid Address' })
      .optional(),
    governanceWalletAddress: z
      .string()
      .refine(isAddress, { message: 'Invalid Address' })
      .optional(),
    demurrageFee: z.coerce
      .number()
      .min(0, 'Demurrage fee must be 0 or greater')
      .max(100, 'Demurrage fee must be 100 or less'),
  })
  .refine((data) => {
    const governanceNewERC20 =
      data.governanceERC20name && data.governanceERC20symbol
    const governanceExistingERC20 = data.governanceERC20address
    const governanceWallet = data.governanceWalletAddress

    return (
      (governanceNewERC20 && !governanceExistingERC20 && !governanceWallet) ||
      (!governanceNewERC20 && governanceExistingERC20 && !governanceWallet) ||
      (!governanceNewERC20 && !governanceExistingERC20 && governanceWallet)
    )
  })

export const dtfDeployDefaultValues = {
  name: '',
  symbol: '',
  initialValue: 1,
  tokensDistribution: [],
  governanceERC20name: '',
  governanceERC20symbol: '',
  governanceERC20address: undefined,
  governanceWalletAddress: undefined,
  demurrageFee: 0,
}

export type DeployInputs = z.infer<typeof DeployFormSchema>
