import { useState, useEffect } from 'react'

export function useViewport() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [isMobile, setIsMobile] = useState(width < 768)
  const [isTablet, setIsTablet] = useState(width >= 768 && width < 1024)
  const [isDesktop, setIsDesktop] = useState(width >= 1024)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setWidth(w)
      setIsMobile(w < 768)
      setIsTablet(w >= 768 && w < 1024)
      setIsDesktop(w >= 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { width, isMobile, isTablet, isDesktop }
}
