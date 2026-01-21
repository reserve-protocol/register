import { Button } from '@/components/ui/button'
import Sparkles from 'components/icons/Sparkles'
import { useState } from 'react'

const STORAGE_KEY = '3.0-announcement'

const Announcement = () => {
  const [show, setShow] = useState(!localStorage.getItem(STORAGE_KEY))

  if (!show) {
    return null
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed')
    setShow(false)
  }

  return (
    <div className="flex items-center flex-wrap bg-blue-50 dark:bg-blue-950/30 border border-blue-500 rounded-lg px-4 py-2 mb-8">
      <div className="flex items-center mr-4 mb-2 lg:mb-0">
        <Sparkles />
      </div>
      <div>
        <div className="font-bold">
          <span className="text-blue-500">Releasing 3.0.0</span>{' '}
          <span>of the Reserve Protocol V.1</span>
        </div>
        <p>
          Streamlining trades with Dutch Auctions, Fortifying Security, Enhanced
          Developer Experience & Governance improvements.
        </p>
      </div>
      <div className="ml-0 lg:ml-auto mt-4 lg:mt-0">
        <Button size="sm" variant="outline" className="border-2" onClick={handleDismiss}>
          Dismiss
        </Button>
        <Button
          className="ml-4 bg-[#2150A9] whitespace-nowrap"
          size="sm"
          onClick={() =>
            window.open(
              'https://blog.reserve.org/reserve-protocol-v1-3-0-0-release-9c539334f771',
              '_blank'
            )
          }
        >
          Read the blog post
        </Button>
      </div>
    </div>
  )
}

export default Announcement
