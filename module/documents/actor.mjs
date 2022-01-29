/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class BasicFantasyRPGActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.basicfantasyrpg || {};

    // Make separate methods for each Actor type (character, monster, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareMonsterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const data = actorData.data;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) {
      // Calculate the ability bonus
      ability.bonus = this._calculateAbilityBonus(ability.value);
    }
  }

  /**
   * Determine ability score modifiers
   */

  _calculateAbilityBonus(abilityScore) {
    switch (abilityScore) {
      case 3: return -3;
      case 4:
      case 5: return -2;
      case 6:
      case 7:
      case 8: return -1;
      case 13:
      case 14:
      case 15: return 1;
      case 16:
      case 17: return 2;
      case 18: return 3;
      default: return 0;
    };
  }

  /**
   * Prepare Monster type specific data.
   */
  _prepareMonsterData(actorData) {
    if (actorData.type !== 'monster') return;

    // Make modifications to data here. For example:
    const data = actorData.data;
    data.xp = function () {
      let xpLookup = [10, 25, 75, 145, 240, 360, 500, 670, 875, 1075, 1300, 1575, 1875, 2175, 2500, 2850, 3250, 3600, 4000, 4500, 5250, 6000, 6750, 7500, 8250, 9000];
      let specialAbilityLookup = [3, 12, 25, 30, 40, 45, 55, 65, 70, 75, 90, 95, 100, 110, 115, 125, 135, 145, 160, 175, 200, 225, 250, 275, 300, 325];
      return xpLookup[data.hitDice] + (specialAbilityLookup[data.hitDice] * data.specialAbility);
    };
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getMonsterRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.data.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.bonus + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.level) {
      data.lvl = data.level.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getMonsterRollData(data) {
    if (this.data.type !== 'monster') return;

    // Process additional NPC data here.
  }

}