# Purpose of the codebase

This codebase is the implementation of the RPG system Basic Fantasy RPG to Foundry VTT.

The current task is to port it to Foundry v13, which introduce a number of API changes, including the
usage of the Application v2. 

# Resources 

Look for online documentation whenever necessary to understand how to migrate to Application v2 and how to properly implement necessary methods.

Good sources can be found under the domains foundryvtt.com and foundryvtt.wiki

# Foundry Entities

In Foundry, there are top-level entities like "Actors" (which can be characters, monsters, 
vehicles, etc.), and "Items" (which can be equipment, spells, special abilities, etc.).

Usually, there is a single class for Actor and a single class for Items, and it also implements
subtype-specific behavior (like for monsters or characters in the case of Actor).

Besides the Actor and Item class, there are also corresponding Sheet classes, like an Actor Sheet and 
Item Sheet, responsible for rendering the relevant information about that entity on a sheet, which is 
visible on the Foundry UI. 

## Entity Structure

The structure of which types of entities exist can be found in the file `template.json`. It also defines
which attributes each type has.

## Templates

The folder `templates` contains HTML templates for rendering sheets. Notice that there are the higher
level actor sheet and item sheet, as well as more specific ones for monsters or vehicles.