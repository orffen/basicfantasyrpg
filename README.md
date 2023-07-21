# Basic Fantasy RPG for FoundryVTT

This is the [Basic Fantasy RPG](https://www.basicfantasy.org/) system for FoundryVTT. Please also see the [companion compendium module](https://github.com/Stew-rt/basicfantasyrpg-corerules-en), which contains items, spells, monsters etc. for easy use with the system.

## Installation

This system is available within FoundryVTT, or you can manually install it by using the manifest link below:

https://raw.githubusercontent.com/orffen/basicfantasyrpg/main/system.json

## Usage

### Initiative

Initiative automatically includes the character's Dexterity modifier. The character sheet has a field for Initiative Bonus which can be used to add the Halfling's initiative bonus, or any bonuses from magic items.

The system does not yet automatically reset initiative at the end of each combat round, but this can be manually done in FoundryVTT's initiative tracker.

### Roll Formulas

To add ability bonuses/penalties to roll formulas (damage or special ability), you can use `@str.bonus`. Replace `str` with `int`, `wis`, `dex`, `con` or `cha`. You can use the full ability value with `@str.value`, for example if you wanted to do something like `d20<=@str.value`. `@lvl` is available as short-hand for the character level.

### Character Special Abilities

Special Abilities are a flexible item type with just a description and a roll formula and an optional target number. They can be used for thief abilities (formula: d100), open doors checks (d6), or even just as text (formula left blank). Clicking the icon in the list will either roll the formula if present, or output the description to the chat window.

### Monster Special Abilities

The monster sheet has a "special abilities" field. This field should be 0, 1, or 2, depending on how many asterisks appear after the monster's hit dice value. XP values and attack bonus for monsters are automatically calculated.

## License

All software components are licensed under the MIT license - see [LICENSE.txt](https://raw.githubusercontent.com/orffen/basicfantasyrpg/main/LICENSE.txt) for details.

Basic Fantasy Role-Playing Game content is distributed under the terms of the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/).

### Copyright Notices

- Basic Fantasy Role-Playing Game Copyright © 2006-2023 Chris Gonnerman.
- Boilerplate System Copyright © 2020 Asacolips Projects / Foundry Mods.
- Basic Fantasy RPG for FoundryVTT © 2022 Steve Simenic.
