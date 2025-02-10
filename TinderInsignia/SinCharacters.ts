// SinCharacters.ts

import {
    createAbility,
    createEntity,
    createItem,
    GameState,
    AbilityEffect,
    Ability,
    GameEntity,
    BodyPart,
    StatBag,
    createGameState,
} from './Battle';
import {
    singleStatDamageArchetype,
    simpleStatModArchetype,
} from './Archetypes';

/**
 * Enumeration of the Seven Deadly Sins
 */
export enum SevenDeadlySins {
    Pride = 'Pride',
    Greed = 'Greed',
    Lust = 'Lust',
    Envy = 'Envy',
    Gluttony = 'Gluttony',
    Wrath = 'Wrath',
    Sloth = 'Sloth',
}

/**
 * Defines unique stats and abilities for each sin character
 */
export class SinCharacterFactory {
    static createSinCharacter(sin: SevenDeadlySins, id: string): GameEntity {
        const baseBodyParts: BodyPart[] = [
            { name: 'Head', structuralIntegrity: 5, maxStructuralIntegrity: 5, vital: true },
            { name: 'Torso', structuralIntegrity: 10, maxStructuralIntegrity: 10, vital: true },
            { name: 'Left Arm', structuralIntegrity: 5, maxStructuralIntegrity: 5 },
            { name: 'Right Arm', structuralIntegrity: 5, maxStructuralIntegrity: 5 },
            { name: 'Legs', structuralIntegrity: 5, maxStructuralIntegrity: 5 },
        ];

        let stats: StatBag = {};
        let abilities: Ability[] = [];
        let inventory: GameEntity['inventory'] = [];

        switch (sin) {
            case SevenDeadlySins.Pride:
                stats = { pride: 10 };
                abilities.push(
                    createSinAbility('Overconfidence', 'Increases own pride.', simpleStatModArchetype(
                        (stats) => ({ ...stats, pride: (stats.pride ?? 0) + 2 }),
                        undefined,
                        `${id} feels an overwhelming sense of pride!`
                    ))
                );
                break;

            case SevenDeadlySins.Greed:
                stats = { greed: 10 };
                abilities.push(
                    createSinAbility('Steal', 'Steals resources from the enemy.', stealResourcesEffect)
                );
                break;

            case SevenDeadlySins.Lust:
                stats = { lust: 10 };
                abilities.push(
                    createSinAbility('Charm', 'Charms the enemy, reducing their will to fight.', simpleStatModArchetype(
                        undefined,
                        (stats) => ({ ...stats, lust: (stats.lust ?? 0) - 2 }),
                        `${id} charms the enemy, reducing their lust!`
                    ))
                );
                break;

            case SevenDeadlySins.Envy:
                stats = { envy: 10 };
                abilities.push(
                    createSinAbility('Copycat', 'Copies an ability from the enemy.', copyAbilityEffect)
                );
                break;

            case SevenDeadlySins.Gluttony:
                stats = { gluttony: 10 };
                abilities.push(
                    createSinAbility('Consume', 'Consumes a body part from the enemy.', consumeBodyPartEffect)
                );
                break;

            case SevenDeadlySins.Wrath:
                stats = { wrath: 10 };
                abilities.push(
                    createSinAbility('Fury Strike', 'Deals damage based on accumulated wrath.', singleStatDamageArchetype(
                        'wrath',
                        undefined,
                        undefined
                    ))
                );
                break;

            case SevenDeadlySins.Sloth:
                stats = { sloth: 10 };
                abilities.push(
                    createSinAbility('Hibernate', 'Restores own body parts over time.', regenerateEffect)
                );
                break;
        }

        // Initialize the sin character
        const entity: GameEntity = {
            id,
            stats,
            bodyParts: baseBodyParts,
            statusConditions: [],
            inventory,
            equipment: { weapon: null, gear: null, keepsake: null, utility: null },
            abilities,
            resources: 100,
        };

        return entity;
    }
}

/**
 * Helper function to create abilities for sin characters
 */
function createSinAbility(
    name: string,
    description: string,
    effect: AbilityEffect
): Ability {
    return {
        id: `ability_${name.toLowerCase().replace(/\s+/g, '_')}`,
        name,
        description,
        effect,
        cost: 0,
        requirements: {},
    };
}

/**
 * Custom ability effects for specific sins
 */

// Greed's "Steal" ability
const stealResourcesEffect: AbilityEffect = (attacker, defender, state) => {
    const stealAmount = 10;
    const newAttacker = { ...attacker, resources: attacker.resources + stealAmount };
    const newDefender = { ...defender, resources: defender.resources - stealAmount };

    const result = {
        newAttacker,
        newDefender,
        damageDealt: 0,
        statusEffects: [],
        message: `${attacker.id} steals ${stealAmount} resources from ${defender.id}!`,
    };

    return [newAttacker, newDefender, result];
};

// Envy's "Copycat" ability
const copyAbilityEffect: AbilityEffect = (attacker, defender, state) => {
    if (defender.abilities.length > 0) {
        const copiedAbility = defender.abilities[0];
        const newAttacker = { ...attacker, abilities: [...attacker.abilities, copiedAbility] };

        const result = {
            newAttacker,
            newDefender: defender,
            damageDealt: 0,
            statusEffects: [],
            message: `${attacker.id} copies ${defender.id}'s ability "${copiedAbility.name}"!`,
        };

        return [newAttacker, defender, result];
    } else {
        const result = {
            newAttacker: attacker,
            newDefender: defender,
            damageDealt: 0,
            statusEffects: [],
            message: `${defender.id} has no abilities to copy!`,
        };

        return [attacker, defender, result];
    }
};

// Gluttony's "Consume" ability
const consumeBodyPartEffect: AbilityEffect = (attacker, defender, state) => {
    const targetPart = defender.bodyParts.find((part) => !part.vital && part.structuralIntegrity > 0);

    if (targetPart) {
        const newDefenderBodyParts = defender.bodyParts.map((part) =>
            part.name === targetPart.name ? { ...part, structuralIntegrity: 0 } : part
        );
        const newDefender = { ...defender, bodyParts: newDefenderBodyParts };

        // Heal attacker by consuming the body part
        const healAmount = 5;
        const newAttacker = {
            ...attacker,
            bodyParts: attacker.bodyParts.map((part) =>
                part.structuralIntegrity < part.maxStructuralIntegrity
                    ? { ...part, structuralIntegrity: part.structuralIntegrity + healAmount }
                    : part
            ),
        };

        const result = {
            newAttacker,
            newDefender,
            damageDealt: 0,
            statusEffects: [],
            message: `${attacker.id} consumes ${defender.id}'s ${targetPart.name}, restoring their own body parts!`,
        };

        return [newAttacker, newDefender, result];
    } else {
        const result = {
            newAttacker: attacker,
            newDefender: defender,
            damageDealt: 0,
            statusEffects: [],
            message: `${attacker.id} tries to consume a body part, but there's nothing left!`,
        };

        return [attacker, defender, result];
    }
};

// Sloth's "Hibernate" ability
const regenerateEffect: AbilityEffect = (attacker, defender, state) => {
    const healAmount = 2;
    const newAttacker = {
        ...attacker,
        bodyParts: attacker.bodyParts.map((part) => ({
            ...part,
            structuralIntegrity: Math.min(part.structuralIntegrity + healAmount, part.maxStructuralIntegrity),
        })),
    };

    const result = {
        newAttacker,
        newDefender: defender,
        damageDealt: 0,
        statusEffects: [],
        message: `${attacker.id} hibernates, slowly regenerating their body parts.`,
    };

    return [newAttacker, defender, result];
};

/**
 * Example of adding these characters into the game state
 */
function initializeGameStateWithSinCharacters(): GameState {
    let state = createGameState();

    // Create sin characters
    const characterIds = Object.values(SevenDeadlySins).map((sin) => `${sin}_Character`);
    characterIds.forEach((id, index) => {
        const sin = Object.values(SevenDeadlySins)[index];
        const character = SinCharacterFactory.createSinCharacter(sin as SevenDeadlySins, id);
        state.entities[id] = character;

        // Optionally, you can create default items and add them to the characters
        const defaultItem = createItem(
            `item_${sin.toLowerCase()}`,
            `${sin} Relic`,
            'keepsake',
            { [sin.toLowerCase()]: 5 },
            `A relic imbued with the essence of ${sin}.`
        );
        character.inventory.push(defaultItem);
        character.equipment.keepsake = defaultItem;
    });

    return state;
}
