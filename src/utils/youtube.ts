const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/

const normalizeYouTubeVideoId = (value: string | null | undefined) => {
  if (!value) return null

  const videoId = value.trim()
  return YOUTUBE_VIDEO_ID_REGEX.test(videoId) ? videoId : null
}

export const getYouTubeVideoId = (video: string) => {
  const directVideoId = normalizeYouTubeVideoId(video)

  if (directVideoId) {
    return directVideoId
  }

  try {
    const url = new URL(video)
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    const pathSegments = url.pathname.split('/').filter(Boolean)

    if (hostname === 'youtu.be') {
      return normalizeYouTubeVideoId(pathSegments[0])
    }

    const isYouTubeHost =
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'youtube-nocookie.com' ||
      hostname.endsWith('.youtube-nocookie.com')

    if (!isYouTubeHost) {
      return null
    }

    const videoQueryId = normalizeYouTubeVideoId(url.searchParams.get('v'))

    if (videoQueryId) {
      return videoQueryId
    }

    if (['embed', 'shorts', 'live'].includes(pathSegments[0])) {
      return normalizeYouTubeVideoId(pathSegments[1])
    }
  } catch {
    return null
  }

  return null
}

export const getYouTubeThumbnailUrl = (video: string) => {
  const videoId = getYouTubeVideoId(video)

  if (!videoId) {
    return undefined
  }

  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export const getYouTubeEmbedUrl = (video: string) => {
  const videoId = getYouTubeVideoId(video)

  if (!videoId) {
    return undefined
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
}
