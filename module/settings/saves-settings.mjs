import { objectsShallowEqual } from '../helpers/settings.mjs'
import { SYSTEM_ID, SETTINGS } from './settings.mjs'

// Helper array of IDs we'll use in a few places
const saves = ['death', 'wands', 'paralysis', 'breath', 'spells']

export function registerSavesSettings () {
  // The settings menu
  game.settings.registerMenu(SYSTEM_ID, SETTINGS.SAVES_MENU, {
    name: 'BASICFANTASYRPG.Settings.SavesMenu.name',
    label: 'BASICFANTASYRPG.Settings.SavesMenu.label',
    hint: 'BASICFANTASYRPG.Settings.SavesMenu.hint',
    icon: 'fas fa-cog',
    type: SavesSettings,
    restricted: true, // GM-only
  })

  // the settings object
  game.settings.register(SYSTEM_ID, SETTINGS.SAVES_SETTINGS, {
    scope: 'world',
    config: false,
    type: Object,
    default: SavesSettings.defaultSaves,
  })
}

class SavesSettings extends FormApplication {
  static #defaultSaves = null
  static get defaultSaves () {
    if (!SavesSettings.#defaultSaves) {
      SavesSettings.#defaultSaves = {}
      saves.forEach(s => {
        SavesSettings.#defaultSaves[s] = game.i18n.localize(`BASICFANTASYRPG.Save${s.capitalize()}`)
      })
    }
    return SavesSettings.#defaultSaves
  }

  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      popOut: true,
      width: 400,
      template: `systems/${SYSTEM_ID}/templates/settings/string-array-settings.hbs`,
      id: SETTINGS.SAVES_MENU,
      title: 'BASICFANTASYRPG.Settings.SavesMenu.name',
    })
  }

  getData () {
    const initialValues = game.settings.get(SYSTEM_ID, SETTINGS.SAVES_SETTINGS)
    // repack the current saves names into id, label and values for the form
    const data = {}
    saves.forEach((v, i) => {
      data[i] = {
        id: v,
        label: SavesSettings.defaultSaves[v],
        value: initialValues[v],
        required: true,
      }
    })
    return data
  }

  _updateObject (event, formData) {
    const data = foundry.utils.expandObject(formData)
    const current = game.settings.get(SYSTEM_ID, SETTINGS.SAVES_SETTINGS)

    // todo: escape html
    for (let [k, v] of Object.entries(data)) {
      data[k] = v.trim()
    }

    if (!objectsShallowEqual(data, current)) {
      game.settings.set(SYSTEM_ID, SETTINGS.SAVES_SETTINGS, data)
      SettingsConfig.reloadConfirm({ world: true })
    }
  }

  activateListeners (html) {
    super.activateListeners(html)
    html.on('click', '[data-action=reset]', this._handleResetButtonClicked)
  }

  async _handleResetButtonClicked (event) {
    console.log('BFRPG | Reset save names to default values')
    saves.forEach(id => {
      const element = $(event.delegateTarget).find(`[name=${id}]`)
      if (element && element.length > 0) {
        element[0].value = game.i18n.localize(`BASICFANTASYRPG.Save${id.capitalize()}`)
      }
    })
  }
}
