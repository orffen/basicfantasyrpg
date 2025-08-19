import { BaseActorSheet } from './base-actor-sheet.mjs';

/**
 * Monster Sheet for Basic Fantasy RPG
 * Extends BaseActorSheet with monster-specific functionality
 * @extends {BaseActorSheet}
 */
export class MonsterSheet extends BaseActorSheet {

  static DEFAULT_OPTIONS = {
    ...BaseActorSheet.DEFAULT_OPTIONS,
    classes: [...BaseActorSheet.DEFAULT_OPTIONS.classes, "monster"]
  };

  static PARTS = {
    main: {
      template: "systems/basicfantasyrpg/templates/actor/actor-monster-sheet.html"
    }
  };

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);

    // Add monster-specific rendering logic
    console.log("Monster Sheet rendered for:", context.name);
  }
}