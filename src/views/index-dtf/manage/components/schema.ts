import { z } from 'zod'

export const manageFormSchema = z.object({
  hidden: z.boolean().optional(),
  dtf: z.object({
    icon: z.string().optional(),
    cover: z.string().optional(),
    mobileCover: z.string().optional(),
    description: z.string().optional(),
    notesFromCreator: z.string().optional(),
    prospectus: z.url().optional().or(z.literal('')),
    tags: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    basketType: z
      .enum(['unit-based', 'percentage-based'])
      .optional()
      .default('percentage-based'),
  }),
  creator: z.object({
    name: z.string().optional(),
    icon: z.string().optional(),
    link: z.url().optional().or(z.literal('')),
  }),
  curator: z.object({
    name: z.string().optional(),
    icon: z.string().optional(),
    link: z.url().optional().or(z.literal('')),
  }),
  socials: z.object({
    twitter: z
      .url()
      .refine(
        (url) => !url || url.includes('x.com') || url.includes('twitter.com'),
        {
          message: 'Must be a valid Twitter/X URL',
        }
      )
      .optional()
      .or(z.literal('')),
    telegram: z
      .url()
      .refine((url) => !url || url.includes('t.me'), {
        message: 'Must be a valid Telegram URL',
      })
      .optional()
      .or(z.literal('')),
    discord: z
      .url()
      .refine(
        (url) =>
          !url || url.includes('discord.com') || url.includes('discord.gg'),
        {
          message: 'Must be a valid Discord URL',
        }
      )
      .optional()
      .or(z.literal('')),
    website: z.url().optional().or(z.literal('')),
  }),
  files: z.object({
    logo: z.instanceof(File).optional(),
    creatorLogo: z.instanceof(File).optional(),
    curatorLogo: z.instanceof(File).optional(),
    desktopCover: z.instanceof(File).optional(),
    mobileCover: z.instanceof(File).optional(),
  }),
})

export type ManageFormValues = z.infer<typeof manageFormSchema>
