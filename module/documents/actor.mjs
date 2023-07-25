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
    const actorData = this;
    const data = actorData.system;
    const flags = actorData.flags.basicfantasyrpg || {};

    // Make separate methods for each Actor type (character, monster, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareMonsterData(actorData);
    this._prepareSiegeEngineData(actorData);
    this._prepareVehicleData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const data = actorData.system;

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

    const data = actorData.system;
    data.xp.value = function () {
      let xpLookup = [10, 25, 75, 145, 240, 360, 500, 670, 875, 1075, 1300, 1575, 1875, 2175, 2500, 2850, 3250, 3600, 4000, 4500, 5250, 6000, 6750, 7500, 8250, 9000];
      let specialAbilityLookup = [3, 12, 25, 30, 40, 45, 55, 65, 70, 75, 90, 95, 100, 110, 115, 125, 135, 145, 160, 175, 200, 225, 250, 275, 300, 325];
      let xpValue = 0;
      let xpSpecialAbilityBonus = 0;
      if (data.hitDice.number < 1 || (data.hitDice.number === 1 && data.hitDice.mod < 0) || data.hitDice.size < 'd8') {
        xpValue = xpLookup[0];
        xpSpecialAbilityBonus = specialAbilityLookup[0] * data.specialAbility.value;
      } else if (data.hitDice.number > 25) {
        xpValue = 9000 + (data.hitDice.number - 25) * 750;
        xpSpecialAbilityBonus = (325 + (data.hitDice.number - 25) * 25) * data.specialAbility.value;
      } else {
        xpValue = xpLookup[data.hitDice.number];
        xpSpecialAbilityBonus = specialAbilityLookup[data.hitDice.number] * data.specialAbility.value;
      }
      return xpValue + Math.max(0, xpSpecialAbilityBonus); // never return a negative special ability bonus
    };

    data.attackBonus.value = this._calculateMonsterAttackBonus();
  }

  /**
   * Calculate monster attack bonus
   */
  _calculateMonsterAttackBonus() {
    if (this.system.hitDice.number < 1) {
      return 0;
    } else if (this.system.hitDice.number > 31) {
      return 16;
    }
    switch (this.system.hitDice.number) {
      case 9: return 8;
      case 10:
      case 11: return 9
      case 12:
      case 13: return 10;
      case 14:
      case 15: return 11;
      case 16:
      case 17:
      case 18:
      case 19: return 12;
      case 20:
      case 21:
      case 22:
      case 23: return 13;
      case 24:
      case 25:
      case 26:
      case 27: return 14;
      case 28:
      case 29:
      case 30:
      case 31: return 15;
      default: return this.system.hitDice.number; // this handles 1-9
    }
  }


  /**
   * Prepare Siege Engine type specific data
   */
  _prepareSiegeEngineData(actorData) {
    if (actorData.type !== 'siegeEngine') return;

    // Prepare additional Siege Engine data here

  }


  /**
   * Prepare Vehicle type specific data
   */
  _prepareVehicleData(actorData) {
    if (actorData.type !== 'vehicle') return;

    const data = actorData.system;
    data.hitPoints.value = 0;
    data.hitPoints.max = 0;

    // Calculate totals for HP value and HP max
    for (let [key, side] of Object.entries(data.hitPoints)) {
      if (['forward', 'aft', 'port', 'starboard'].includes(key)) {
        data.hitPoints.value += side.value;
        data.hitPoints.max += side.max;
      }
    }

    // Check if any 1 or 2 sides are reduced to 0 HP
    let sidesAtZeroHP = 0;
    for (let [key, side] of Object.entries(data.hitPoints)) {
      if (['forward', 'aft', 'port', 'starboard'].includes(key) && side.value === 0) {
        ++sidesAtZeroHP;
      }
    }
    if (sidesAtZeroHP === 1) {
      data.move.current = Math.floor(data.move.value / 2);
    } else if (sidesAtZeroHP > 1) {
      data.move.current = 0;
    } else {
      data.move.current = data.move.value;
    }
  }



  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getMonsterRollData(data);
    this._getSiegeEngineRollData(data);
    this._getVehicleRollData(data);
    this._getActorRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

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
    if (this.type !== 'monster') return;

    // Process additional NPC data here.

  }

  /**
   * Prepare Siege Engine roll data.
   */
  _getSiegeEngineRollData(data) {
    if (this.type !== 'siegeEngine') return;

    // Process additional Siege Engine data here.

  }

  /**
   * Prepare Vehicle roll data.
   */
  _getVehicleRollData(data) {
    if (this.type !== 'vehicle') return;

    // Process additional Vehicle data here.

  }

  /**
   * Prepare shared Actor roll data.
   */
  _getActorRollData(data) {
    // Add attack bonus for easier access, or fall back to 0.
    if (data.attackBonus) {
      data.ab = data.attackBonus.value ?? 0;
    }
  }
}