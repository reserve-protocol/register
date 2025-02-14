import { z } from 'zod'

export const manageFormSchema = z.object({
  hidden: z.boolean().optional(),
  dtf: z.object({
    icon: z.string().optional(),
    cover: z.string().optional(),
    mobileCover: z.string().optional(),
    description: z.string().optional(),
    notesFromCreator: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  creator: z.object({
    name: z.string().optional(),
    icon: z.string().optional(),
    link: z.string().url().optional().or(z.literal('')),
  }),
  curator: z.object({
    name: z.string().optional(),
    icon: z.string().optional(),
    link: z.string().url().optional().or(z.literal('')),
  }),
  socials: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    telegram: z.string().url().optional().or(z.literal('')),
    discord: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
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
