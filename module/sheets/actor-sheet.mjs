import {successChatMessage} from '../helpers/chat.mjs';
import {onManageActiveEffect, prepareActiveEffectCategories} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BasicFantasyRPGActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['basicfantasyrpg', 'sheet', 'actor'],
      template: 'systems/basicfantasyrpg/templates/actor/actor-sheet.html',
      width: 600,
      height: 600,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'combat' }]
    });
  }

  /** @override */
  get template() {
    return `systems/basicfantasyrpg/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    //enrichedBiography -- enriches system.biography for editor
    context.enrichedBiography = await TextEditor.enrichHTML(this.object.system.biography, {async: true});

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type === 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
      this._prepareActorData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type === 'monster') {
      this._prepareItems(context);
      this._prepareActorData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareActorData(context) {
    // Handle saves.
    for (let [k, v] of Object.entries(context.data.saves)) {
      v.label = game.i18n.localize(CONFIG.BASICFANTASYRPG.saves[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.data.abilities)) {
      v.label = game.i18n.localize(CONFIG.BASICFANTASYRPG.abilities[k]) ?? k;
    }
    // Handle money.
    for (let [k, v] of Object.entries(context.data.money)) {
      v.label = game.i18n.localize(CONFIG.BASICFANTASYRPG.money[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
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
      6: []
    };
    const features = [];

    // Define an object to store carried weight.
    let carriedWeight = {
      'value': 0,
      _addWeight (moreWeight, quantity) {
        if (!quantity || quantity === '' || Number.isNaN(quantity) || quantity < 0) {
          return; // check we have a valid quantity, and do nothing if we do not
        }
        let q = Math.floor(quantity / 20);
        if (!Number.isNaN(parseFloat(moreWeight))) {
          this.value += parseFloat(moreWeight) * quantity;
        } else if (moreWeight === '*' && q > 0) { // '*' is gold pieces
          this.value += q;
        }
      }
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
        carriedWeight._addWeight(i.system.weight.value, i.system.quantity.value);
      } else if (i.type === 'weapon') { // Append to weapons.
        weapons.push(i);
        carriedWeight._addWeight(i.system.weight.value, 1); // Weapons are always quantity 1
      } else if (i.type === 'armor') { // Append to armors.
        armors.push(i);
        carriedWeight._addWeight(i.system.weight.value, 1); // Armor is always quantity 1
      } else if (i.type === 'spell') { // Append to spells.
        if (i.system.spellLevel.value !== undefined) {
          spells[i.system.spellLevel.value].push(i);
        }
      } else if (i.type === 'feature') { // Append to features.
        features.push(i);
      }
    }

    // Iterate through money, add to carried weight
    if (context.data.money) {
      let gp = Number(context.data.money.gp.value);
      gp += context.data.money.pp.value * 5;
      gp += context.data.money.ep.value / 5;
      gp += context.data.money.sp.value / 10;
      gp += context.data.money.cp.value / 100;
      carriedWeight._addWeight('*', gp);  // '*' will calculate GP weight
    }

    // Assign and return
    context.gear = gear;
    context.weapons = weapons;
    context.armors = armors;
    context.spells = spells;
    context.features = features;
    context.carriedWeight = Math.floor(carriedWeight.value); // we discard fractions of weight when we update the sheet
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Prepare Spells
    html.find('.spell-prepare').click(ev => {
      const change = ev.currentTarget.dataset.change;
      if (parseInt(change)) {
        const li = $(ev.currentTarget).parents('.item');
        const item = this.actor.items.get(li.data('itemId'));
        let newValue = item.system.prepared.value + parseInt(change);
        item.update({'system.prepared.value': newValue});
      }
    });

    // Active Effect management
    html.find('.effect-control').click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Siege Engine range bonuses
    if (this.actor.type === 'siegeEngine') {
      html.find('input[name="rangeBonus"]').click(ev => this.actor.update({'system.rangeBonus.value': Number(ev.currentTarget.value)}));
    }

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    if (type === 'spell') {
      // Move dataset spellLevelValue into spellLevel.value
      data.spellLevel = {
        'value': data.spellLevelValue
      };
      delete data.spellLevelValue;
    }
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data['type'];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.rollType) {
      // Handle weapon rolls.
      if (dataset.rollType === 'weapon') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        let label = dataset.label ? `<span class="chat-item-name">${game.i18n.localize('BASICFANTASYRPG.Roll')}: ${dataset.label}</span>` : `<span class="chat-item-name">${game.i18n.localize('BASICFANTASYRPG.Roll')}: ${dataset.attack.capitalize()} attack with ${item.name}</span>`;
        let rollFormula = 'd20+@ab';
        if (this.actor.type === 'character') {
          if (dataset.attack === 'melee') {
            rollFormula += '+@str.bonus';
          } else if (dataset.attack === 'ranged') {
            rollFormula += '+@dex.bonus';
          }
        }
        rollFormula += '+' + item.system.bonusAb.value;
        let roll = new Roll(rollFormula, this.actor.getRollData());
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }

      // Handle item rolls.
      if (dataset.rollType === 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `<span class="chat-item-name">${game.i18n.localize('BASICFANTASYRPG.Roll')}: ${dataset.label}</span>` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      await roll.roll();
      label += successChatMessage(roll.total, dataset.targetNumber);
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
}
