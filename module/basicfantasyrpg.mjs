// Import document classes.
import { BasicFantasyRPGActor } from './documents/actor.mjs';
import { BasicFantasyRPGItem } from './documents/item.mjs';
// Import sheet classes.
import { BasicFantasyRPGActorSheet } from './sheets/actor-sheet.mjs';
import { BasicFantasyRPGItemSheet } from './sheets/item-sheet.mjs';
import { CharacterSheet } from './sheets/character-sheet.mjs';
import { MonsterSheet } from './sheets/monster-sheet.mjs';

// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { BASICFANTASYRPG } from './helpers/config.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.basicfantasyrpg = {
    BasicFantasyRPGActor,
    BasicFantasyRPGItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.BASICFANTASYRPG = BASICFANTASYRPG;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: 'max(1, 1d6 + @abilities.dex.bonus + @initBonus.value)',
    decimals: 0
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = BasicFantasyRPGActor;
  CONFIG.Item.documentClass = BasicFantasyRPGItem;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('basicfantasyrpg', BasicFantasyRPGActorSheet,
      { makeDefault: false }
  );
  Actors.registerSheet('basicfantasyrpg',
      CharacterSheet,
      { types: ['character'], makeDefault: true, label: "Character Sheet V2"}
  );
  Actors.registerSheet('basicfantasyrpg',
      MonsterSheet,
      { types: ['monster'], makeDefault: true, label: "Monster Sheet V2"}
  );
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('basicfantasyrpg', BasicFantasyRPGItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers & Partials               */
/* -------------------------------------------- */

Handlebars.registerHelper('calculateAbilityTargetNumber', function(lvl) {
  return Math.floor(17 - (lvl / 2 - lvl % 2));
});

Handlebars.registerHelper('localizeFloorMaterial', function(type) {
  switch (type) {
    case 'roofThatch': return game.i18n.localize('BASICFANTASYRPG.RoofThatched');
    case 'roofSlate' : return game.i18n.localize('BASICFANTASYRPG.RoofSlate');
    case 'roofWood'  : return game.i18n.localize('BASICFANTASYRPG.RoofWood');
    default          : return game.i18n.localize('ITEM.TypeFloor');
  }
});

Handlebars.registerHelper('localizeWallMaterial', function(type) {
  switch (type) {
    case 'stoneHard' : return game.i18n.localize('BASICFANTASYRPG.MaterialStoneHard');
    case 'stoneSoft' : return game.i18n.localize('BASICFANTASYRPG.MaterialStoneSoft');
    case 'brick'     : return game.i18n.localize('BASICFANTASYRPG.MaterialBrick');
    case 'wood'      : return game.i18n.localize('BASICFANTASYRPG.MaterialWood');
    default          : return game.i18n.localize('ITEM.TypeFloor');
  }
});

Handlebars.registerHelper('localizeItemNameForActor', function(type) {
  if (type === 'stronghold') {
    return game.i18n.localize('ITEM.TypeFloor');
  } else if (type === 'vehicle') {
    return game.i18n.localize('BASICFANTASYRPG.Cargo');
  } else {
    return game.i18n.localize('ITEM.TypeItem');
  }
});

Handlebars.registerHelper('localizeLowerCase', function(str) {
  return game.i18n.localize(str).toLowerCase();
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('selected', function(value) {
  return value ? "selected" : "";
});

Handlebars.registerPartial('iconDamage', `<i class="fa-solid fa-heart-crack fa-2xl" title="{{localize 'BASICFANTASYRPG.Roll'}} {{localize 'BASICFANTASYRPG.Damage'}}"></i>`);
//`<img src="systems/basicfantasyrpg/styles/damage.svg" title="{{localize 'BASICFANTASYRPG.Roll'}} {{localize 'BASICFANTASYRPG.Damage'}}" width="24" height="24"/>`

Handlebars.registerPartial('iconMelee', `<i class="fa-solid fa-hand-fist fa-2xl" title="{{localize 'BASICFANTASYRPG.Roll'}} {{localize 'BASICFANTASYRPG.Melee'}} {{localize 'BASICFANTASYRPG.Attack'}}"></i>`);
//`<img src="systems/basicfantasyrpg/styles/melee.svg" title="{{localize 'BASICFANTASYRPG.Roll'}} {{localize 'BASICFANTASYRPG.Melee'}} {{localize 'BASICFANTASYRPG.Attack'}}" width="24" height="24"/>`

Handlebars.registerPartial('iconRanged', `<i class="fa-solid fa-crosshairs fa-2xl" title="{{localize 'BASICFANTASYRPG.Roll'}} {{localize 'BASICFANTASYRPG.Ranged'}} {{localize 'BASICFANTASYRPG.Attack'}}"></i>`);
//`<img src="systems/basicfantasyrpg/styles/ranged.svg" title="{{localize 'BASICFANTASYRPG.Roll'}} {{localize 'BASICFANTASYRPG.Ranged'}} {{localize 'BASICFANTASYRPG.Attack'}}" width="24" height="24"/>`

/* -------------------------------------------- */
/*  Ready Hook & Others                         */
/* -------------------------------------------- */

Hooks.once('ready', async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

// Hide certain types from being created through the UI
Hooks.on("renderDialog", (dialog, html) => {
  let hiddenTypes = ["floor", "wall"];
  Array.from(html.find("#document-create option")).forEach(i => {if (hiddenTypes.includes(i.value)) i.remove()});
});

/* -------------------------------------------- */
/*  Character Creation Hooks                    */
/* -------------------------------------------- */

Hooks.on('createActor', async function(actor) {
  if (actor.type === 'character') {
    actor.updateSource({
      prototypeToken: {
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY
      }
    });
  } else if (actor.type === 'monster') {
    actor.updateSource({
      prototypeToken: {
        appendNumber: true,
        displayName: CONST.TOKEN_DISPLAY_MODES.OWNER
      }
    });
  } else if (actor.type === 'stronghold') {
    const floor = {
      name: `New ${game.i18n.localize('ITEM.TypeFloor')}`,
      type: 'floor'
    };
    if (!actor.items.size) await actor.createEmbeddedDocuments('Item', [floor]);
  }
});

/* -------------------------------------------- */
/*  Token Creation Hooks                        */
/* -------------------------------------------- */

Hooks.on('createToken', async function(token, options, id) {
  if (token.actor.type === 'monster') {
    let newHitPoints = new Roll(`${token.actor.system.hitDice.number}${token.actor.system.hitDice.size}+${token.actor.system.hitDice.mod}`);
    await newHitPoints.evaluate({ async: true });
    token.actor.system.hitPoints.value = Math.max(1, newHitPoints.total);
    token.actor.system.hitPoints.max = Math.max(1, newHitPoints.total);
  }
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  if (data.type !== 'Item') return;
  if (!('data' in data)) return ui.notifications.warn('You can only create macro buttons for owned Items');
  const item = data.data;

  // Create the macro command
  const command = `game.basicfantasyrpg.rollItemMacro('${item.name}');`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'basicfantasyrpg.itemMacro': true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}