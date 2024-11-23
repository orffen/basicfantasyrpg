/**
 * pseudo-enum to make setting ID references less error prone
 */
export const SETTINGS = {
  AUTO_ROLL_TOKEN_HP: 'autoRollTokenHP'
}

// Use this internally for now. Refactoring the whole system is too big a job!
const SYSTEM_ID = 'basicfantasyrpg'

export function registerSettings () {
  /**
   * If we have any settings submenus, they'd be defined in separate files and called from here.
   */

  game.settings.register(SYSTEM_ID, SETTINGS.AUTO_ROLL_TOKEN_HP, {
    name: 'BASICFANTASYRPG.AutoRollTokenHP.name',
    hint: 'BASICFANTASYRPG.AutoRollTokenHP.hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
    requiresReload: false,
    restricted: true,  // GM-only setting
  })
}
