import { BaseActorSheet } from "./base-actor-sheet.mjs";

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
      title: "Character",
    },
  };

  static TABS = {
    primary: {
      tabs: [{ id: "combat" }, { id: "items" }],
      labelPrefix: "BASICFANTASYRPG.Tab",
      initial: "combat",
    },
  };

  static PARTS = {
    header: {
      template: "systems/basicfantasyrpg/templates/actor/character.hbs",
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    combat: {
      template: "systems/basicfantasyrpg/templates/actor/parts/combat.hbs",
    },
    items: {
      template: "systems/basicfantasyrpg/templates/actor/parts/items.hbs",
    }
  };


  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);

    // Add character-specific rendering logic
    console.log("Character Sheet rendered for:", context.name);
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.tabs = this._prepareTabs("primary");

    // Handle saves.
    for (let [k, v] of Object.entries(context.data.saves)) {
      v.label = game.i18n.localize(CONFIG.BASICFANTASYRPG.saves[k]) ?? k;
    }

    // Handle ability scores.
    for (let [k, v] of Object.entries(context.data.abilities)) {
      v.label = game.i18n.localize(CONFIG.BASICFANTASYRPG.abilities[k]) ?? k;
    }

    // Handle money.
    for (let [k, v] of Object.entries(context.data.money)) {
      v.label = game.i18n.localize(CONFIG.BASICFANTASYRPG.money[k]) ?? k;
    }

    console.log("Available context data:", context);
    return context;
  }
}
