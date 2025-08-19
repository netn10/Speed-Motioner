// Device detection utilities
export const isMobile = () => {
  // Check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Check screen size
  const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768

  // Check user agent (as fallback)
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  const isMobileUA = mobileRegex.test(navigator.userAgent)

  return hasTouch && (isSmallScreen || isMobileUA)
}

export const isTablet = () => {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isTabletSize = window.innerWidth > 768 && window.innerWidth <= 1024
  const tabletRegex = /iPad|Android(?!.*Mobile)/i
  const isTabletUA = tabletRegex.test(navigator.userAgent)

  return hasTouch && (isTabletSize || isTabletUA)
}

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export const getScreenOrientation = () => {
  if (screen.orientation) {
    return screen.orientation.angle === 0 || screen.orientation.angle === 180 
      ? 'portrait' : 'landscape'
  }
  
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
}

export const supportsVibration = () => {
  return 'vibrate' in navigator
}

export const getDevicePixelRatio = () => {
  return window.devicePixelRatio || 1
}

export const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

// Performance detection
export const getDevicePerformance = () => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  let performance = 'medium'
  
  if (gl) {
    const renderer = gl.getParameter(gl.RENDERER)
    const vendor = gl.getParameter(gl.VENDOR)
    
    // Basic GPU detection
    if (renderer.includes('Adreno') || renderer.includes('Mali') || renderer.includes('PowerVR')) {
      performance = 'low'
    } else if (renderer.includes('GeForce') || renderer.includes('Radeon') || renderer.includes('Intel Iris')) {
      performance = 'high'
    }
  }
  
  // CPU cores estimation
  const cores = navigator.hardwareConcurrency || 2
  if (cores <= 2) {
    performance = 'low'
  } else if (cores >= 8) {
    performance = 'high'
  }
  
  // Memory estimation
  if (navigator.deviceMemory) {
    if (navigator.deviceMemory <= 2) {
      performance = 'low'
    } else if (navigator.deviceMemory >= 8) {
      performance = 'high'
    }
  }
  
  return performance
}

// Network detection
export const getConnectionSpeed = () => {
  if (navigator.connection) {
    const connection = navigator.connection
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false
    }
  }
  
  return {
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  }
}

// Battery detection
export const getBatteryInfo = async () => {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery()
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      }
    } catch (error) {
      console.warn('Battery API not available:', error)
    }
  }
  
  return null
}

// Device capabilities summary
export const getDeviceCapabilities = async () => {
  const capabilities = {
    isMobile: isMobile(),
    isTablet: isTablet(),
    isTouchDevice: isTouchDevice(),
    orientation: getScreenOrientation(),
    supportsVibration: supportsVibration(),
    pixelRatio: getDevicePixelRatio(),
    viewport: getViewportSize(),
    performance: getDevicePerformance(),
    connection: getConnectionSpeed(),
    battery: await getBatteryInfo()
  }
  
  return capabilities
}

// Recommended settings based on device
export const getRecommendedSettings = async () => {
  const capabilities = await getDeviceCapabilities()
  
  const settings = {
    enableAnimations: true,
    enableParticles: true,
    enableBlur: true,
    enableSounds: true,
    enableVibration: capabilities.supportsVibration,
    showMobileControls: capabilities.isMobile || capabilities.isTablet,
    quality: 'high'
  }
  
  // Adjust based on performance
  if (capabilities.performance === 'low') {
    settings.enableAnimations = false
    settings.enableParticles = false
    settings.enableBlur = false
    settings.quality = 'low'
  } else if (capabilities.performance === 'medium') {
    settings.enableParticles = false
    settings.quality = 'medium'
  }
  
  // Adjust based on battery
  if (capabilities.battery && capabilities.battery.level < 0.2 && !capabilities.battery.charging) {
    settings.enableAnimations = false
    settings.enableParticles = false
    settings.enableBlur = false
    settings.quality = 'low'
  }
  
  // Adjust based on connection
  if (capabilities.connection.saveData || capabilities.connection.effectiveType === 'slow-2g') {
    settings.enableAnimations = false
    settings.enableParticles = false
    settings.quality = 'low'
  }
  
  return settings
}

// Event listeners for device changes
export const addDeviceChangeListeners = (callback) => {
  const listeners = []
  
  // Orientation change
  const orientationHandler = () => {
    callback({
      type: 'orientation',
      orientation: getScreenOrientation()
    })
  }
  
  window.addEventListener('orientationchange', orientationHandler)
  window.addEventListener('resize', orientationHandler)
  listeners.push(() => {
    window.removeEventListener('orientationchange', orientationHandler)
    window.removeEventListener('resize', orientationHandler)
  })
  
  // Network change
  if (navigator.connection) {
    const connectionHandler = () => {
      callback({
        type: 'connection',
        connection: getConnectionSpeed()
      })
    }
    
    navigator.connection.addEventListener('change', connectionHandler)
    listeners.push(() => {
      navigator.connection.removeEventListener('change', connectionHandler)
    })
  }
  
  // Battery change
  getBatteryInfo().then(battery => {
    if (battery) {
      const batteryHandler = () => {
        callback({
          type: 'battery',
          battery: {
            level: battery.level,
            charging: battery.charging
          }
        })
      }
      
      battery.addEventListener('levelchange', batteryHandler)
      battery.addEventListener('chargingchange', batteryHandler)
      
      listeners.push(() => {
        battery.removeEventListener('levelchange', batteryHandler)
        battery.removeEventListener('chargingchange', batteryHandler)
      })
    }
  })
  
  // Return cleanup function
  return () => {
    listeners.forEach(cleanup => cleanup())
  }
}