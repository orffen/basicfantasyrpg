/**
 * pseudo-enum to make setting ID references less error prone
 */
export const SETTINGS = {
//   AUTO_ROLL_TOKEN_HP: 'autoRollTokenHP',
  SAVE_DEATH_NAME: 'saveDeathName',
  SAVE_WANDS_NAME: 'saveWandsName',
  SAVE_PARALYSIS_NAME: 'saveParalysisName',
  SAVE_BREATH_NAME: 'saveBreathName',
  SAVE_SPELLS_NAME: 'saveSpellsName',
}

// Use this internally for now. Refactoring the whole system is too big a job!
const SYSTEM_ID = 'basicfantasyrpg'

export function registerSettings () {
  /**
   * If we have any settings submenus, they'd be defined in separate files and called from here.
   */

  /*
  Disabled for now based on https://discord.com/channels/735808783493890058/1307906023444582430/1309772596103086081
  Will delete later once confirmed that it's the wrong direction.
  game.settings.register(SYSTEM_ID, SETTINGS.AUTO_ROLL_TOKEN_HP, {
    name: 'BASICFANTASYRPG.AutoRollTokenHP.name',
    hint: 'BASICFANTASYRPG.AutoRollTokenHP.hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
    requiresReload: false,
    restricted: true // GM-only setting
  })
*/

  /**
   * Saving throw customisation.
   * If we get too many settings, these could be broken out into a submenu.
   * It's more coding work, but keeps things together for the users.
   */
  // Death Ray or Poison
  game.settings.register(SYSTEM_ID, SETTINGS.SAVE_DEATH_NAME, {
    name: 'BASICFANTASYRPG.SaveDeath',
    hint: 'BASICFANTASYRPG.SaveName.hint',
    scope: 'world',
    config: true,
    type: String,
    default: game.i18n.localize('BASICFANTASYRPG.SaveDeath'),
    requiresReload: true, // I assume this will need a reload to ensure everything is re-rendered
    restricted: true // GM-only setting
  })

  //   "BASICFANTASYRPG.SaveWands": "Magic Wands",
  game.settings.register(SYSTEM_ID, SETTINGS.SAVE_WANDS_NAME, {
    name: 'BASICFANTASYRPG.SaveWands',
    hint: 'BASICFANTASYRPG.SaveName.hint',
    scope: 'world',
    config: true,
    type: String,
    default: game.i18n.localize('BASICFANTASYRPG.SaveWands'),
    requiresReload: true, // I assume this will need a reload to ensure everything is re-rendered
    restricted: true // GM-only setting
  })

  //   "BASICFANTASYRPG.SaveParalysis": "Paralysis or Petrify",
  game.settings.register(SYSTEM_ID, SETTINGS.SAVE_PARALYSIS_NAME, {
    name: 'BASICFANTASYRPG.SaveParalysis',
    hint: 'BASICFANTASYRPG.SaveName.hint',
    scope: 'world',
    config: true,
    type: String,
    default: game.i18n.localize('BASICFANTASYRPG.SaveParalysis'),
    requiresReload: true, // I assume this will need a reload to ensure everything is re-rendered
    restricted: true // GM-only setting
  })

  //   "BASICFANTASYRPG.SaveBreath": "Dragon Breath",
  game.settings.register(SYSTEM_ID, SETTINGS.SAVE_BREATH_NAME, {
    name: 'BASICFANTASYRPG.SaveBreath',
    hint: 'BASICFANTASYRPG.SaveName.hint',
    scope: 'world',
    config: true,
    type: String,
    default: game.i18n.localize('BASICFANTASYRPG.SaveBreath'),
    requiresReload: true, // I assume this will need a reload to ensure everything is re-rendered
    restricted: true // GM-only setting
  })

  //   "BASICFANTASYRPG.SaveSpells": "Rods, Staves, and Spells",
  game.settings.register(SYSTEM_ID, SETTINGS.SAVE_SPELLS_NAME, {
    name: 'BASICFANTASYRPG.SaveSpells',
    hint: 'BASICFANTASYRPG.SaveName.hint',
    scope: 'world',
    config: true,
    type: String,
    default: game.i18n.localize('BASICFANTASYRPG.SaveSpells'),
    requiresReload: true, // I assume this will need a reload to ensure everything is re-rendered
    restricted: true // GM-only setting
  })

}
