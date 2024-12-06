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
    fields: [],
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
})

export const dtfDeployDefaultValues = {
  name: '',
  symbol: '',
}

export type DeployInputs = z.infer<typeof DeployFormSchema>
