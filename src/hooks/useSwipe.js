import { useEffect, useRef } from 'react'

export default function useSwipe(onSwipeLeft, onSwipeRight) {
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.changedTouches[0].screenX
    }

    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].screenX
      handleSwipe()
    }

    const handleSwipe = () => {
      const swipeThreshold = 50
      const swipeDistance = touchEndX.current - touchStartX.current

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          if (onSwipeRight) onSwipeRight()
        } else {
          if (onSwipeLeft) onSwipeLeft()
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight])
}
