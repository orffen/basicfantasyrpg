import { BASICFANTASYRPG } from '../helpers/config.mjs'
import { registerSavesSettings } from './saves-settings.mjs'

/**
 * pseudo-enum to make setting ID references less error prone
 */
export const SETTINGS = {
  //   AUTO_ROLL_TOKEN_HP: 'autoRollTokenHP',
  // use the saves keys as the setting ID to make retrieval easy.
  // So long as the system.key is unique, it's fine.
  SAVE_DEATH_NAME: 'death',
  SAVE_WANDS_NAME: 'wands',
  SAVE_PARALYSIS_NAME: 'paralysis',
  SAVE_BREATH_NAME: 'breath',
  SAVE_SPELLS_NAME: 'spells',

  SAVES_MENU: 'savesMenu',
  SAVES_SETTINGS: 'savesSettings'
}

// Use this internally for now. Refactoring the whole system is too big a job!
export const SYSTEM_ID = 'basicfantasyrpg'

/**
 * Array of setting IDs for the settings that should be hidden from
 * non-GM users. We iterate the array in the renderSettingsConfig
 * hook and remove those settings from the DOM when required.
 * This workaround is necessary because in Foundry v12, a restricted
 * flag to show a setting to GM users is only supported for a setting
 * menu, not a setting itself.
 */
const GM_ONLY_SETTINGS = [
//   SETTINGS.SAVE_DEATH_NAME,
//   SETTINGS.SAVE_WANDS_NAME,
//   SETTINGS.SAVE_PARALYSIS_NAME,
//   SETTINGS.SAVE_BREATH_NAME,
//   SETTINGS.SAVE_SPELLS_NAME
]

Hooks.on('renderSettingsConfig', (app, [html], context) => {
  if (game.user.isGM) return

  GM_ONLY_SETTINGS.forEach(id => {
    html
      .querySelector(`.form-group[data-setting-id="${SYSTEM_ID}.${id}"]`)
      ?.remove()
  })
})

export function registerSettings () {
  /**
   * If we have any settings submenus, they'd be defined in separate files and called from here.
   */
    registerSavesSettings()
}
