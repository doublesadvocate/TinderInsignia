# Overview
This document provides a comprehensive guide on how to use the core functionalities of the battle system. It covers the core types, system functions, and usage examples to help you understand and implement the system effectively.

# Core Types

## StatKey and StatBag
- **StatKey**: A string representing the name of a stat (e.g., 'health', 'strength').
- **StatBag**: A record mapping StatKeys to their respective values.

## BodyPart
Represents a part of a game entity's body with structural integrity.
- **name**: The name of the body part.
- **structuralIntegrity**: Current integrity of the body part.
- **maxStructuralIntegrity**: Maximum integrity of the body part.
- **vital**: (Optional) Indicates if the body part is vital.

## GameEntity
Represents an entity in the game with stats, body parts, status conditions, inventory, equipment, abilities, and resources.
- **id**: Unique identifier for the entity.
- **stats**: A StatBag containing the entity's stats.
- **bodyParts**: An array of BodyPart objects.
- **statusConditions**: An array of strings representing status conditions.
- **inventory**: An array of Item objects.
- **equipment**: A record mapping equipment slots to items.
- **abilities**: An array of Ability objects.
- **resources**: Number of resources the entity has.

## Item
Represents an item that can be equipped by a game entity.
- **id**: Unique identifier for the item.
- **name**: Name of the item.
- **slot**: Equipment slot the item occupies.
- **stats**: A StatBag containing the item's stats.
- **generationSource**: Source stats used to generate the item.
- **description**: Description of the item.
- **creationCost**: Cost to create the item.

## Ability
Represents an ability that can be used by a game entity.
- **id**: Unique identifier for the ability.
- **name**: Name of the ability.
- **description**: Description of the ability.
- **effect**: The effect of the ability (AbilityEffect).
- **cost**: Cost to use the ability.
- **requirements**: StatBag containing the requirements to use the ability.
- **requiredBodyParts**: (Optional) Array of body parts required to use the ability.
- **disallowedStatuses**: (Optional) Array of statuses that disallow the use of the ability.

## AbilityEffect and AbilityResult
- **AbilityEffect**: A function that takes an attacker, defender, and optional state, and returns a tuple of updated attacker, defender, and AbilityResult.
- **AbilityResult**: Represents the result of using an ability, including updated entities, damage dealt, status effects, and a message.

## GameState
Represents the overall state of the game, including entities, items, abilities, and combat state.
- **entities**: Record mapping EntityIDs to GameEntity objects.
- **items**: Record mapping ItemIDs to Item objects.
- **abilities**: Record mapping AbilityIDs to Ability objects.
- **combat**: (Optional) CombatState representing the current combat state.

## CombatState
Represents the state of combat, including participants, turn order, current turn, and combat log.
- **participants**: Array of EntityIDs participating in the combat.
- **turnOrder**: Array of EntityIDs representing the turn order.
- **currentTurn**: Index of the current turn in the turn order.
- **log**: Array of AbilityResult objects representing the combat log.

# System Functions

## Initialization Functions
- **createGameState**: Creates a new GameState.
- **createEntity**: Creates a new GameEntity with base stats and optional body parts.
- **createItem**: Creates a new Item with specified attributes.

## Ability System Functions
- **createAbility**: Creates a new Ability and adds it to the game state.
- **createDamageEffect**: Creates a simple damage effect that reduces a defender's stat.
- **createBodyPartDamageEffect**: Creates a damage effect targeting a specific body part.
- **createStatModEffect**: Creates an effect that modifies stats for the attacker and/or defender.

## Combat System Functions
- **processCombatTurn**: Processes a combat turn by applying an action and rotating to the next turn.
- **executeAbility**: Executes an ability from an attacker to a defender, updating the game state.

## Utility Functions
- **getAvailableActions**: Returns available actions (abilities, inventory) for a given entity.
- **getCombatState**: Returns high-level information about the current combat state.

# Usage Examples

## Creating a Game State and Entities
## Creating and Using Abilities
## Processing Combat Turns
## Managing Items and Equipment
## UI Feedback and Combat Status
# Advanced Concepts

## Body Parts and Targeted Damage
Use `createBodyPartDamageEffect` to create abilities that target specific body parts.
## Status Conditions and Effects
Use `createStatModEffect` to create abilities that apply status conditions or modify stats.
