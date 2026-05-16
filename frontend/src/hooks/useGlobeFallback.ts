import { useCallback, useEffect, useMemo, useState } from 'react'

const mobileQuery = '(max-width: 767px)'
const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
const fallbackDelayMs = 2200

interface BrowserConnection {
  saveData?: boolean
}

interface NavigatorWithConnection extends Navigator {
  connection?: BrowserConnection
}

interface GlobeCapabilities {
  isMobile: boolean
  hasWebGl: boolean
  prefersReducedMotion: boolean
  saveData: boolean
}

function supportsWebGl() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') || canvas.getContext('webgl'),
    )
  } catch {
    return false
  }
}

function readCapabilities(): GlobeCapabilities {
  if (typeof window === 'undefined') {
    return {
      isMobile: true,
      hasWebGl: false,
      prefersReducedMotion: true,
      saveData: true,
    }
  }

  const navigatorWithConnection = navigator as NavigatorWithConnection

  return {
    isMobile: window.matchMedia(mobileQuery).matches,
    hasWebGl: supportsWebGl(),
    prefersReducedMotion: window.matchMedia(reducedMotionQuery).matches,
    saveData: Boolean(navigatorWithConnection.connection?.saveData),
  }
}

export function useGlobeFallback() {
  const [capabilities, setCapabilities] = useState(readCapabilities)
  const [isSlowToLoad, setIsSlowToLoad] = useState(false)
  const [isGlobeReady, setIsGlobeReady] = useState(false)

  useEffect(() => {
    const mobileMedia = window.matchMedia(mobileQuery)
    const motionMedia = window.matchMedia(reducedMotionQuery)

    function refreshCapabilities() {
      setCapabilities(readCapabilities())
    }

    mobileMedia.addEventListener('change', refreshCapabilities)
    motionMedia.addEventListener('change', refreshCapabilities)

    return () => {
      mobileMedia.removeEventListener('change', refreshCapabilities)
      motionMedia.removeEventListener('change', refreshCapabilities)
    }
  }, [])

  useEffect(() => {
    if (
      capabilities.isMobile ||
      !capabilities.hasWebGl ||
      capabilities.prefersReducedMotion ||
      capabilities.saveData ||
      isGlobeReady
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsSlowToLoad(true)
    }, fallbackDelayMs)

    return () => window.clearTimeout(timeoutId)
  }, [capabilities, isGlobeReady])

  const markGlobeReady = useCallback(() => {
    setIsGlobeReady(true)
    setIsSlowToLoad(false)
  }, [])

  return useMemo(() => {
    const shouldUseFallback =
      capabilities.isMobile ||
      !capabilities.hasWebGl ||
      capabilities.prefersReducedMotion ||
      capabilities.saveData ||
      (isSlowToLoad && !isGlobeReady)

    return {
      ...capabilities,
      isGlobeReady,
      isSlowToLoad,
      markGlobeReady,
      shouldUseFallback,
    }
  }, [capabilities, isGlobeReady, isSlowToLoad, markGlobeReady])
}
