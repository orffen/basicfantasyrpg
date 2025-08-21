import { successChatMessage } from "../helpers/chat.mjs";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Base Actor Sheet class for Basic Fantasy RPG
 * Contains shared functionality for all actor types
 * @extends {ActorSheetV2}
 */
export class BaseActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["basicfantasyrpg", "sheet", "actor", "themed", "theme-light"],
    position: {
      width: 600,
      height: 600,
    },
    window: {
      resizable: true,
    },
    form: {
      handler: BaseActorSheet.#onSubmitDocumentForm,
      submitOnChange: true,
    },
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const TextEditor = foundry.applications.ux.TextEditor.implementation;

    // Add the actor's basic data to the context
    context.actor = this.document;
    context.system = this.document.system;
    context.name = this.document.name;
    context.data = context.system;
    context.items = this.document.items.contents;

    // biography editor
    context.enrichedBiography = await TextEditor.enrichHTML(this.document.system.biography, {
      async: true,
    });

    this._prepareItems(context);

    return context;
  }

  /**
   * Handle form submission for the actor sheet
   * @param {SubmitEvent} event The form submission event
   * @param {HTMLFormElement} form The submitted form
   * @param {FormDataExtended} formData The form data
   * @returns {Promise<void>}
   */
  static async #onSubmitDocumentForm(event, form, formData) {
    const updates = foundry.utils.expandObject(formData.object);
    return this.document.update(updates);
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const weapons = [];
    const armors = [];
    const spells = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    const features = [];
    const floors = [];
    const walls = [];

    // Define an object to store carried weight.
    let carriedWeight = {
      value: 0,
      _addWeight(moreWeight, quantity) {
        if (!quantity || quantity === "" || Number.isNaN(quantity) || quantity < 0) {
          return; // check we have a valid quantity, and do nothing if we do not
        }
        let q = Math.floor(quantity / 20);
        if (!Number.isNaN(parseFloat(moreWeight))) {
          this.value += parseFloat(moreWeight) * quantity;
        } else if (moreWeight === "*" && q > 0) {
          // '*' is gold pieces
          this.value += q;
        }
      },
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === "item") {
        gear.push(i);
        carriedWeight._addWeight(i.system.weight.value, i.system.quantity.value);
      } else if (i.type === "weapon") {
        // Append to weapons.
        weapons.push(i);
        carriedWeight._addWeight(i.system.weight.value, 1); // Weapons are always quantity 1
      } else if (i.type === "armor") {
        // Append to armors.
        armors.push(i);
        carriedWeight._addWeight(i.system.weight.value, 1); // Armor is always quantity 1
      } else if (i.type === "spell") {
        // Append to spells.
        if (i.system.spellLevel.value !== undefined) {
          spells[i.system.spellLevel.value].push(i);
        }
      } else if (i.type === "feature") {
        // Append to features.
        features.push(i);
      } else if (i.type === "floor") {
        // Append to floors for strongholds.
        floors.push(i);
      } else if (i.type === "wall") {
        // Append to walls for strongholds.
        if (i.system.floor.value !== undefined) {
          if (!walls[i.system.floor.value]) walls[i.system.floor.value] = [];
          walls[i.system.floor.value].push(i);
        }
      }
    }

    // Iterate through money, add to carried weight
    if (context.data.money) {
      let gp = Number(context.data.money.gp.value);
      gp += context.data.money.pp.value;
      gp += context.data.money.ep.value;
      gp += context.data.money.sp.value;
      gp += context.data.money.cp.value;
      carriedWeight._addWeight("*", gp); // '*' will calculate GP weight
    }

    // Assign and return
    context.gear = gear;
    context.weapons = weapons;
    context.armors = armors;
    context.spells = spells;
    context.features = features;
    context.floors = floors;
    context.walls = walls;
    context.carriedWeight = Math.floor(carriedWeight.value); // we discard fractions of weight when we update the sheet
  }
}
