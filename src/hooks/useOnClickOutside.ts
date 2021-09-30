import React, { useEffect } from 'react'

const useOnClickOutside = (ref: React.RefObject<any>, handler?: () => void) => {
  useEffect(() => {
    console.log('listener', handler)
    const listener = (event: TouchEvent | MouseEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      console.log('listener')
      if (!ref.current || ref.current.contains(event.target) || !handler) {
        console.log('didint found anything')
        return
      }
      console.log('call handler')
      handler()
    }
    if (handler) {
      document.addEventListener('mousedown', listener)
      document.addEventListener('touchstart', listener)
    }

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

export default useOnClickOutside
