import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import IndexAboutOverview from './index-about-overview'
import VideoLibrary from './video-library'
import { hasMeetVideo } from './video-library/chapters'

export const useHasVideoLibrary = () => {
  const dtf = useAtomValue(indexDTFAtom)

  return hasMeetVideo(dtf?.token.symbol)
}

// DTFs with their own explainer cut get the video library; the rest keep the
// written description.
const AboutDTF = ({ showCover = false }: { showCover?: boolean }) => {
  const hasVideoLibrary = useHasVideoLibrary()

  if (hasVideoLibrary) return <VideoLibrary />

  return (
    <div className="rounded-3xl bg-card">
      <IndexAboutOverview showCover={showCover} />
    </div>
  )
}

export default AboutDTF
