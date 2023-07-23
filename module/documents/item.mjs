import {successChatMessage} from '../helpers/chat.mjs';

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class BasicFantasyRPGItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: item.actor });
    const rollMode = game.settings.get('core', 'rollMode');

    // If there's no roll data, or the formula is empty, just send a chat message.
    if (!item.system.formula || !item.system.formula.value) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: `<span class="chat-item-name">${game.i18n.localize('ITEM.Type' + item.type.capitalize())} - ${item.name}</span>`,
        content: item.system.description ? `<span class="chat-item-description">${item.system.description}</span>` : ''
      });
    } else { // Otherwise, create a roll and send a chat message from it.
      let label = `<span class="chat-item-name">${game.i18n.localize('BASICFANTASYRPG.Roll')}: ${game.i18n.localize('ITEM.Type' + item.type.capitalize())} - ${item.name}</span>`;
      if (item.type === 'feature' && item.system.description) {
        label += `<span class="chat-item-description">${item.system.description}</span>`;
      }

      // Retrieve roll data and invoke the roll
      const rollData = item.getRollData();
      const roll = new Roll(rollData.item.formula.value, rollData);
      await roll.roll();
      label += successChatMessage(roll.total, rollData.item.targetNumber.value, true);
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label
      });
      return roll;
    }
  }
}
