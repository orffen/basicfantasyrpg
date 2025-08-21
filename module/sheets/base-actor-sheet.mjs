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

  _onRender(context, options) {
    super._onRender(context, options);

    // Item editing - always available
    this.element.addEventListener('click', this._onItemEdit.bind(this));

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Use event delegation for better performance
    this.element.addEventListener('click', this._onSheetClick.bind(this));
    
    // Drag and drop for macros
    if (this.document.isOwner) {
      this._setupDragAndDrop();
    }
  }

  /**
   * Handle click events using event delegation
   * @param {Event} event The click event
   */
  _onSheetClick(event) {
    const target = event.target;
    const control = target.closest('.item-control, .rollable, input[name="rangeBonus"]');
    
    if (!control) return;

    // Item creation
    if (control.classList.contains('item-create')) {
      event.preventDefault();
      this._onItemCreate(event);
    }
    // Item deletion  
    else if (control.classList.contains('item-delete')) {
      event.preventDefault();
      this._onItemDelete(event);
    }
    // Spell preparation
    else if (control.classList.contains('spell-prepare')) {
      event.preventDefault();
      this._onSpellPrepare(event);
    }
    // Quantity adjustment
    else if (control.classList.contains('quantity')) {
      event.preventDefault();
      this._onQuantityAdjust(event);
    }
    // Active effect management
    else if (control.classList.contains('effect-control')) {
      event.preventDefault();
      onManageActiveEffect(event, this.document);
    }
    // Rollable abilities
    else if (control.classList.contains('rollable')) {
      event.preventDefault();
      this._onRoll(event);
    }
    // Siege engine range bonus (specific to siege engines)
    else if (control.matches('input[name="rangeBonus"]') && this.document.type === 'siegeEngine') {
      this.document.update({'system.rangeBonus.value': Number(control.value)});
    }
  }

  /**
   * Handle item editing
   * @param {Event} event The click event
   */
  _onItemEdit(event) {
    if (!event.target.closest('.item-edit')) return;
    
    event.preventDefault();
    const li = event.target.closest('.item');
    if (!li) return;
    
    const item = this.document.items.get(li.dataset.itemId);
    if (item) {
      item.sheet.render(true);
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event The originating click event
   */
  async _onItemCreate(event) {
    const header = event.target.closest('.item-create');
    const type = header.dataset.type;
    const data = foundry.utils.duplicate(header.dataset);
    
    if (type === 'spell') {
      data.spellLevel = {
        'value': data.spellLevelValue
      };
      delete data.spellLevelValue;
    } else if (type === 'wall') {
      data.floor = {
        "value": data.floorNumber
      };
      delete data.floorNumber;
    }
    
    const name = `New ${type.capitalize()}`;
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    delete itemData.system['type'];

    return await Item.create(itemData, {parent: this.document});
  }

  /**
   * Handle item deletion with animation
   * @param {Event} event The click event
   */
  _onItemDelete(event) {
    const li = event.target.closest('.item');
    if (!li) return;
    
    const item = this.document.items.get(li.dataset.itemId);
    if (!item) return;

    // Modern animation approach instead of jQuery slideUp
    li.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
    li.style.opacity = '0';
    li.style.transform = 'translateX(-100%)';
    
    setTimeout(() => {
      item.delete();
      this.render(false);
    }, 200);
  }

  /**
   * Handle spell preparation adjustments
   * @param {Event} event The click event
   */
  _onSpellPrepare(event) {
    const change = event.target.closest('.spell-prepare').dataset.change;
    if (!parseInt(change)) return;
    
    const li = event.target.closest('.item');
    if (!li) return;
    
    const item = this.document.items.get(li.dataset.itemId);
    if (!item) return;
    
    const newValue = item.system.prepared.value + parseInt(change);
    item.update({'system.prepared.value': newValue});
  }

  /**
   * Handle quantity adjustments
   * @param {Event} event The click event
   */
  _onQuantityAdjust(event) {
    const change = event.target.closest('.quantity').dataset.change;
    if (!parseInt(change)) return;
    
    const li = event.target.closest('.item');
    if (!li) return;
    
    const item = this.document.items.get(li.dataset.itemId);
    if (!item) return;
    
    const newValue = item.system.quantity.value + parseInt(change);
    item.update({'system.quantity.value': newValue});
  }

  /**
   * Handle clickable rolls
   * @param {Event} event The originating click event
   */
  async _onRoll(event) {
    const element = event.target.closest('.rollable');
    const dataset = element.dataset;

    if (dataset.rollType) {
      // Handle weapon rolls
      if (dataset.rollType === 'weapon') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.document.items.get(itemId);
        let label = dataset.label ? 
          `<span class="chat-item-name">${game.i18n.localize('BASICFANTASYRPG.Roll')}: ${dataset.label}</span>` : 
          `<span class="chat-item-name">${game.i18n.localize('BASICFANTASYRPG.Roll')}: ${dataset.attack.capitalize()} attack with ${item.name}</span>`;
        
        let rollFormula = 'd20+@ab';
        if (this.document.type === 'character') {
          if (dataset.attack === 'melee') {
            rollFormula += '+@str.bonus';
          } else if (dataset.attack === 'ranged') {
            rollFormula += '+@dex.bonus';
          }
        }
        rollFormula += '+' + item.system.bonusAb.value;
        
        let roll = new Roll(rollFormula, this.document.getRollData());
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.document }),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }

      // Handle item rolls
      if (dataset.rollType === 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.document.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly
    if (dataset.roll) {
      let label = dataset.label ? 
        `<span class="chat-item-name">${game.i18n.localize('BASICFANTASYRPG.Roll')}: ${dataset.label}</span>` : '';
      let roll = new Roll(dataset.roll, this.document.getRollData());
      await roll.roll();
      label += successChatMessage(roll.total, dataset.targetNumber, dataset.rollUnder);
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.document }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  /**
   * Setup drag and drop functionality for items
   */
  _setupDragAndDrop() {
    const handler = ev => this._onDragStart(ev);
    this.element.querySelectorAll('li.item').forEach(li => {
      if (li.classList.contains('inventory-header')) return;
      li.setAttribute('draggable', true);
      li.addEventListener('dragstart', handler, false);
    });
  }

  /**
   * Handle beginning of drag workflows
   * @param {Event} event The drag start event
   */
  _onDragStart(event) {
    const li = event.currentTarget;
    if (event.target.classList.contains('content-link')) return;

    let dragData = null;

    // Owned Items
    if (li.dataset.itemId) {
      const item = this.document.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

}
