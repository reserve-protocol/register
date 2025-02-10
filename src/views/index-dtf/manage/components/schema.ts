import { z } from 'zod'

export const dtfFormSchema = z.object({
  // About section
  dtfIcon: z.string().optional(),
  categoryTags: z.array(
    z.object({
      type: z.string(),
      selected: z.boolean(),
    })
  ),
  aboutDtf: z.string(),

  // Creator section
  creatorImage: z.string().optional(),
  creatorName: z.string().min(1, 'Creator name is required'),
  creatorLink: z.string().url('Please enter a valid URL'),

  // Curator section
  curatorImage: z.string().optional(),
  curatorName: z.string().min(1, 'Curator name is required'),
  curatorLink: z.string().url('Please enter a valid URL'),

  // Social links
  twitterLink: z.string().url('Please enter a valid URL').optional(),
  telegramLink: z.string().url('Please enter a valid URL').optional(),
  discordLink: z.string().url('Please enter a valid URL').optional(),
  websiteLink: z.string().url('Please enter a valid URL').optional(),
})

export type DTFFormValues = z.infer<typeof dtfFormSchema>
