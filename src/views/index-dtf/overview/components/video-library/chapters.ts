import { indexDTFAtom } from '@/state/dtf/atoms'
import { RESERVE_STORAGE } from '@/utils/constants'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

export type VideoChapter = {
  id: string
  title: MessageDescriptor
  description: MessageDescriptor
  duration: string
  src: string
  poster: string
}

// Cuts + posters live on the Reserve storage bucket under the same base name.
const chapter = (
  id: string,
  file: string,
  title: MessageDescriptor,
  description: MessageDescriptor,
  duration: string
): VideoChapter => ({
  id,
  title,
  description,
  duration,
  src: `${RESERVE_STORAGE}${encodeURIComponent(file)}`,
  poster: `${RESERVE_STORAGE}${encodeURIComponent(file.replace(/\.mp4$/, '.jpg'))}`,
})

// Only the "Meet" chapter is cut per DTF; the other chapters are shared across the suite.
const MEET_VIDEO_BY_SYMBOL: Record<string, { file: string; duration: string }> =
  {
    BUILDOUT: { file: '02_Buildout DTF SECTIONS_01.mp4', duration: '0:28' },
    POWER: { file: 'Power DTF SECTION_only DTF.mp4', duration: '0:14' },
    PHOTON: { file: 'Photonic DTF SECTION_only DTF.mp4', duration: '0:17' },
    NEOCLOUD: { file: 'Neocloud DTF SECTION_only DTF.mp4', duration: '0:19' },
  }

export const hasMeetVideo = (symbol: string | undefined) =>
  !!MEET_VIDEO_BY_SYMBOL[symbol?.toUpperCase() ?? '']

export const getVideoChapters = (
  symbol: string | undefined
): VideoChapter[] => {
  const upper = symbol?.toUpperCase() ?? ''
  const ticker = `$${upper || 'DTF'}`
  const meet = MEET_VIDEO_BY_SYMBOL[upper]

  return [
    chapter(
      'what-is-a-dtf',
      '01_Buildout DTF SECTIONS_01.mp4',
      msg`What is a Decentralized Token Fund?`,
      msg`How to buy an entire portfolio in a single token.`,
      '0:33'
    ),
    ...(meet
      ? [
          chapter(
            `meet-${upper.toLowerCase()}`,
            meet.file,
            msg`Meet ${ticker}`,
            msg`What this is all about.`,
            meet.duration
          ),
        ]
      : []),
    chapter(
      'what-is-reserve',
      '03_Buildout DTF SECTIONS_01.mp4',
      msg`What is Reserve?`,
      msg`The platform and team behind DTFs.`,
      '0:53'
    ),
    chapter(
      'who-can-buy',
      '04_Buildout DTF SECTIONS_01.mp4',
      msg`Who can buy ${ticker}?`,
      msg`Eligibility and how to get started.`,
      '1:15'
    ),
  ]
}

export const useVideoChapters = () => {
  const symbol = useAtomValue(indexDTFAtom)?.token.symbol

  return useMemo(() => getVideoChapters(symbol), [symbol])
}
