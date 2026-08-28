import { RESERVE_STORAGE } from '@/utils/constants'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

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

export const VIDEO_CHAPTERS: VideoChapter[] = [
  chapter(
    'what-is-a-dtf',
    '01_Buildout DTF SECTIONS_01.mp4',
    msg`What is a Diversified Token Fund?`,
    msg`How to buy an entire portfolio in a single token.`,
    '0:33'
  ),
  chapter(
    'meet-buildout',
    '02_Buildout DTF SECTIONS_01.mp4',
    msg`Meet $BUILDOUT`,
    msg`What this is all about.`,
    '0:28'
  ),
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
    msg`Who can buy $BUILDOUT?`,
    msg`Eligibility and how to get started.`,
    '1:15'
  ),
]
