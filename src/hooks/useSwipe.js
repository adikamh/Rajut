import { useEffect, useRef } from 'react'

export default function useSwipe(onSwipeLeft, onSwipeRight, targetRef = null) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndX = useRef(0)
  const touchEndY = useRef(0)

  useEffect(() => {
    const target = targetRef?.current || null
    if (!target) return

    const handleTouchStart = (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX.current = e.changedTouches[0].clientX
        touchStartY.current = e.changedTouches[0].clientY
      }
    }

    const handleTouchEnd = (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchEndX.current = e.changedTouches[0].clientX
        touchEndY.current = e.changedTouches[0].clientY
        handleSwipe()
      }
    }

    const handleSwipe = () => {
      const deltaX = touchEndX.current - touchStartX.current
      const deltaY = touchEndY.current - touchStartY.current

      // Strict swipe detection: horizontal distance > 80px & horizontal movement must dominate vertical scrolling
      if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
        if (deltaX > 0) {
          if (onSwipeRight) onSwipeRight()
        } else {
          if (onSwipeLeft) onSwipeLeft()
        }
      }
    }

    target.addEventListener('touchstart', handleTouchStart, { passive: true })
    target.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      target.removeEventListener('touchstart', handleTouchStart)
      target.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, targetRef])
}

