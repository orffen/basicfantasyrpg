import { BASICFANTASYRPG } from '../helpers/config.mjs'
import { registerSavesSettings } from './saves-settings.mjs'

/**
 * pseudo-enum to make setting ID references less error prone
 */
export const SETTINGS = {
  SAVES_MENU: 'savesMenu',
  SAVES_SETTINGS: 'savesSettings',
}

// Use this just for settings for now. Refactoring the whole system is too big a job!
export const SYSTEM_ID = 'basicfantasyrpg'

/**
 * Array of setting IDs for the settings that should be hidden from
 * non-GM users. We iterate the array in the renderSettingsConfig
 * hook and remove those settings from the DOM when required.
 * This workaround is necessary because in Foundry v12, a restricted
 * flag to show a setting to GM users is only supported for a setting
 * menu, not a setting itself.
 */
const GM_ONLY_SETTINGS = []

Hooks.on('renderSettingsConfig', (app, [html], context) => {
  if (game.user.isGM) return

  GM_ONLY_SETTINGS.forEach(id => {
    html.querySelector(`.form-group[data-setting-id="${SYSTEM_ID}.${id}"]`)?.remove()
  })
})

export function registerSettings () {
  /**
   * register settings menus
   */
  registerSavesSettings()

  /**
   * register top-level settings
   */
}
