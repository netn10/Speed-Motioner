import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Theme settings
      theme: 'dark', // 'light' or 'dark'
      
      // Attack button mode: 4 or 6 buttons
      attackButtonMode: 6, // 4 or 6
      
      // Input button settings
      inputButtons: {
        up: 'w',
        down: 's',
        left: 'a',
        right: 'd',
        // Attack buttons
        lp: 'j', // Light Punch
        mp: 'k', // Medium Punch
        hp: 'l', // Heavy Punch
        lk: 'u', // Light Kick
        mk: 'i', // Medium Kick
        hk: 'o', // Heavy Kick
        // Legacy buttons (kept for compatibility)
        attack: 'j',
        special: 'k',
        block: 'l'
      },

      // Gamepad button mappings (button index -> action)
      gamepadButtons: {
        '0': 'lp', // A button -> Light Punch
        '1': 'lk', // B button -> Light Kick
        '2': 'mp', // X button -> Medium Punch
        '3': 'mk', // Y button -> Medium Kick
        '4': 'hp', // Left Bumper -> Heavy Punch
        '5': 'hk', // Right Bumper -> Heavy Kick
        '6': 'block', // Left Trigger
        '7': 'special', // Right Trigger
        '8': 'start',
        '9': 'select',
        '10': 'ls',
        '11': 'rs',
        '12': 'up',
        '13': 'down',
        '14': 'left',
        '15': 'right'
      },
      

      
      // Available button options
      availableButtons: [
        'w', 'a', 's', 'd', 'j', 'k', 'l', 'i', 'o', 'p',
        'q', 'e', 'r', 'f', 'g', 'h', 'z', 'x', 'c', 'v',
        'b', 'n', 'm', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
        'arrowup', 'arrowdown', 'arrowleft', 'arrowright'
      ],
      
      // Actions
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      setAttackButtonMode: (mode) => set({ attackButtonMode: mode }),
      
      setInputButton: (action, button) => set((state) => ({
        inputButtons: {
          ...state.inputButtons,
          [action]: button
        }
      })),

      setGamepadButton: (buttonIndex, action) => set((state) => ({
        gamepadButtons: {
          ...state.gamepadButtons,
          [buttonIndex.toString()]: action
        }
      })),


      
      resetToDefaults: () => set({
        theme: 'dark',
        attackButtonMode: 6,
        inputButtons: {
          up: 'w',
          down: 's',
          left: 'a',
          right: 'd',
          lp: 'j',
          mp: 'k',
          hp: 'l',
          lk: 'u',
          mk: 'i',
          hk: 'o',
          attack: 'j',
          special: 'k',
          block: 'l'
        },
        gamepadButtons: {
          '0': 'lp',
          '1': 'lk',
          '2': 'mp',
          '3': 'mk',
          '4': 'hp',
          '5': 'hk',
          '6': 'block',
          '7': 'special',
          '8': 'start',
          '9': 'select',
          '10': 'ls',
          '11': 'rs',
          '12': 'up',
          '13': 'down',
          '14': 'left',
          '15': 'right'
        }
      })
    }),
    {
      name: 'speed-motioner-settings',
      partialize: (state) => ({
        theme: state.theme,
        attackButtonMode: state.attackButtonMode,
        inputButtons: state.inputButtons,
        gamepadButtons: state.gamepadButtons
      })
    }
  )
)
