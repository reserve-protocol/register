import { z } from 'zod'

export const manageFormSchema = z.object({
  dtf: z.object({
    icon: z.string().url(),
    cover: z.string().url(),
    mobileCover: z.string().url(),
    description: z.string(),
    notesFromCreator: z.string(),
    tags: z.array(z.string()),
    hidden: z.boolean(),
  }),
  creator: z.object({
    name: z.string(),
    icon: z.string().url(),
    link: z.string().url(),
  }),
  curator: z.object({
    name: z.string(),
    icon: z.string().url(),
    link: z.string().url(),
  }),
  socials: z.object({
    twitter: z.string().url(),
    telegram: z.string().url(),
    discord: z.string().url(),
    website: z.string().url(),
  }),
  files: z.object({
    logo: z.instanceof(File).nullable(),
    creatorLogo: z.instanceof(File).nullable(),
    curatorLogo: z.instanceof(File).nullable(),
    desktopCover: z.instanceof(File).nullable(),
    mobileCover: z.instanceof(File).nullable(),
  }),
})

export type ManageFormValues = z.infer<typeof manageFormSchema>
