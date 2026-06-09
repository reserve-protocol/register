import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useMemo } from 'react'
import { z } from 'zod'

const messages = {
  twitter: msg`Must be a valid Twitter/X URL`,
  telegram: msg`Must be a valid Telegram URL`,
  discord: msg`Must be a valid Discord URL`,
}

export const buildManageFormSchema = (
  t: (descriptor: MessageDescriptor) => string
) =>
  z.object({
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
            message: t(messages.twitter),
          }
        )
        .optional()
        .or(z.literal('')),
      telegram: z
        .url()
        .refine((url) => !url || url.includes('t.me'), {
          message: t(messages.telegram),
        })
        .optional()
        .or(z.literal('')),
      discord: z
        .url()
        .refine(
          (url) =>
            !url || url.includes('discord.com') || url.includes('discord.gg'),
          {
            message: t(messages.discord),
          }
        )
        .optional()
        .or(z.literal('')),
      website: z.url().optional().or(z.literal('')),
    }),
    files: z.object({
      logo: z.instanceof(File).nullable().optional(),
      creatorLogo: z.instanceof(File).nullable().optional(),
      curatorLogo: z.instanceof(File).nullable().optional(),
      desktopCover: z.instanceof(File).nullable().optional(),
      mobileCover: z.instanceof(File).nullable().optional(),
    }),
  })

export const useManageFormSchema = () => {
  const { t } = useLingui()
  return useMemo(() => buildManageFormSchema(t), [t])
}

export type ManageFormValues = z.infer<ReturnType<typeof buildManageFormSchema>>
