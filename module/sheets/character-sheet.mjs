import { BaseActorSheet } from './base-actor-sheet.mjs';

/**
 * Character Sheet for Basic Fantasy RPG
 * Extends BaseActorSheet with character-specific functionality
 * @extends {BaseActorSheet}
 */
export class CharacterSheet extends BaseActorSheet {

  static DEFAULT_OPTIONS = {
    ...BaseActorSheet.DEFAULT_OPTIONS,
    classes: [...BaseActorSheet.DEFAULT_OPTIONS.classes, "character"],
    window: {
      ...BaseActorSheet.DEFAULT_OPTIONS.window,
      title: "Character"
    },
  };


  static PARTS = {
    header: {
      template: "systems/basicfantasyrpg/templates/actor/header.hbs"
    },
      resources: {
        template: "systems/basicfantasyrpg/templates/actor/parts/character-resources.hbs"
      }
  };

    /** @override */
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        options.parts = ['header']
    }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);

    // Add character-specific rendering logic
    console.log("Character Sheet rendered for:", context.name);
  }

  /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        context.resourcesTemplate = "systems/basicfantasyrpg/templates/actor/parts/character-resources.hbs";
        return context;
    }
}