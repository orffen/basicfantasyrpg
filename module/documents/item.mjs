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
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');

    // If there's no roll data, or the formula is empty, send a chat message.
    if (!this.system.formula || !this.system.formula.value) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: `<span class="chat-item-name">${game.i18n.localize('ITEM.Type' + item.type.capitalize())} - ${item.name}</span>`,
        content: item.description ?? ''
      });
    } else { // Otherwise, create a roll and send a chat message from it.
      let label = `<span class="chat-item-name">Roll: ${game.i18n.localize('ITEM.Type' + item.type.capitalize())} - ${item.name}</span>`;
      if (this.type == 'feature' && this.system.description) {
        label += `<span class="chat-item-description">${this.system.description}</span>`;
      }

      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula.value, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label
      });
      return roll;
    }
  }
}
