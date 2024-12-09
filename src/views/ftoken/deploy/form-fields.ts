import { z } from 'zod'

export type DeployStepId =
  | 'metadata'
  | 'primary-basket'
  | 'emergency-collateral'
  | 'revenue-distribution'
  | 'governance'

export const dtfDeploySteps: Record<DeployStepId, { fields: string[] }> = {
  metadata: {
    fields: ['name', 'symbol'],
  },
  'primary-basket': {
    fields: ['initialValue'],
  },
  'emergency-collateral': {
    fields: [],
  },
  'revenue-distribution': {
    fields: [],
  },
  governance: {
    fields: [],
  },
}

export const DeployFormSchema = z.object({
  name: z.string().min(1, 'Token name is required'),
  symbol: z.string().min(1, 'Token symbol is required'),
  initialValue: z.coerce.number().min(0, 'Initial value is required'),
})

export const dtfDeployDefaultValues = {
  name: '',
  symbol: '',
  initialValue: 1,
}

export type DeployInputs = z.infer<typeof DeployFormSchema>
