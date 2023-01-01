# Basic Fantasy RPG for FoundryVTT

This is the [Basic Fantasy RPG](https://www.basicfantasy.org/) system for FoundryVTT. Please also see the [companium compendium module](https://github.com/Stew-rt/basicfantasyrpg-corerules-en), which contains items, spells, monsters etc. for easy use with the system.

## Installation

This system is available within FoundryVTT, or you can manually install it by using the manifest link below:

https://raw.githubusercontent.com/orffen/basicfantasyrpg/main/system.json

## Usage

### Initiative

Initiative automatically includes the character's Dexterity modifier. The character sheet has a field for Initiative Bonus which can be used to add the Halfling's initiative bonus, or any bonuses from magic items.

The system does not yet automatically reset initiative at the end of each combat round, but this can be manually done in FoundryVTT's initiative tracker.

### Roll Formulas

To add ability bonuses/penalties to roll formulas (damage or special ability), you can use `@abilities.str.bonus`. Replace `str` with `int`, `wis`, `dex`, `con` or `cha`. You can use the full ability with just `@str`, for example if you wanted to do something like `d20<=@str`. `@lvl` is available as short-hand for the character level.

### Character Special Abilities

Special Abilities are a flexible item type with just a description and a roll formula. They can be used for thief abilities (formula: d100), open doors checks (d6), or even just as text (formula left blank). Clicking the icon in the list will either roll the formula if present, or output the description to the chat window.

### Monster Special Abilities

The monster sheet has a "special abilities" field. This field should be 0, 1, or 2, depending on how many asterisks appear after the monster's hit dice value. XP values and attack bonus for monsters are automatically calculated.

## License

All software components are licensed under the MIT license - see *LICENSE.txt* for details.

All Basic Fantasy Role-Playing Game content is licensed under the [Open Game License and Basic Fantasy Role-Playing Game Product Identity License](https://www.basicfantasy.org/srd/#open_game_license).

### Copyright Notices

- Open Game License v 1.0 Copyright 2000, Wizards of the Coast, Inc.
- System Reference Document Copyright 2000-2003, Wizards of the Coast, Inc.; Authors Jonathan Tweet, Monte Cook, Skip Williams, Rich Baker, Andy Collins, David Noonan, Rich Redman, Bruce R. Cordell, John D. Rateliff, Thomas Reid, James Wyatt, based on original material by E. Gary Gygax and Dave Arneson.
- Castles & Crusades: Players Handbook, Copyright 2004, Troll Lord Games; Authors Davis Chenault and Mac Golden.
- Castles & Crusades: Monsters Product Support, Copyright 2005, Troll Lord Games.
- The Basic Fantasy Field Guide Copyright © 2010 Chris Gonnerman and Contributors.
- Basic Fantasy Role-Playing Game Copyright © 2006-2015 Chris Gonnerman.
- Boilerplate System Copyright © 2020 Asacolips Projects / Foundry Mods.
- Basic Fantasy RPG for FoundryVTT © 2022 Steve Simenic.
