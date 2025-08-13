import React from 'react'

// Street Fighter-style punch icons
export const LightPunchIcon = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <circle cx="12" cy="12" r="10" fill="#ff6b6b" stroke="#d63031" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" fill="#ff8e8e"/>
    <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">LP</text>
  </svg>
)

export const MediumPunchIcon = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <circle cx="12" cy="12" r="10" fill="#ff9ff3" stroke="#e84393" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" fill="#fdcb6e"/>
    <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">MP</text>
  </svg>
)

export const HeavyPunchIcon = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <circle cx="12" cy="12" r="10" fill="#ff7675" stroke="#d63031" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" fill="#e17055"/>
    <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">HP</text>
  </svg>
)

// Street Fighter-style kick icons
export const LightKickIcon = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <rect x="2" y="2" width="20" height="20" rx="10" fill="#74b9ff" stroke="#0984e3" strokeWidth="2"/>
    <rect x="6" y="6" width="12" height="12" rx="6" fill="#a29bfe"/>
    <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">LK</text>
  </svg>
)

export const MediumKickIcon = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <rect x="2" y="2" width="20" height="20" rx="10" fill="#55a3ff" stroke="#0984e3" strokeWidth="2"/>
    <rect x="6" y="6" width="12" height="12" rx="6" fill="#6c5ce7"/>
    <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">MK</text>
  </svg>
)

export const HeavyKickIcon = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <rect x="2" y="2" width="20" height="20" rx="10" fill="#2d3436" stroke="#636e72" strokeWidth="2"/>
    <rect x="6" y="6" width="12" height="12" rx="6" fill="#636e72"/>
    <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">HK</text>
  </svg>
)

// Icon mapping object for easy access
export const streetFighterIcons = {
  lp: LightPunchIcon,
  mp: MediumPunchIcon,
  hp: HeavyPunchIcon,
  lk: LightKickIcon,
  mk: MediumKickIcon,
  hk: HeavyKickIcon
}
