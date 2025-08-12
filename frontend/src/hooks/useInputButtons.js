import { useSettingsStore } from '../stores/settingsStore'

export const useInputButtons = () => {
  const { inputButtons } = useSettingsStore()
  return inputButtons
}
