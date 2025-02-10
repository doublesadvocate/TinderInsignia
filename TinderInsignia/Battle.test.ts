// Battle.test.ts

import {
    createGameState,
    createEntity,
    createAbility,
    processCombatTurn,
    executeAbility,
    getAvailableActions,
    getCombatState,
    GameState,
    createItem,
} from './Battle';

describe('Epic Battle Simulations with Items', () => {
    test('Warrior vs Rogue with Items', () => {
        const WARRIOR_ID = 'Warrior_Thorin';
        const ROGUE_ID = 'Rogue_Lyra';

        // 1. Create a fresh GameState
        let state = createGameState();

        // 2. Create our entities and insert them into state
        state = {
            ...state,
            entities: {
                [WARRIOR_ID]: {
                    ...createEntity(WARRIOR_ID, {
                        health: 150,
                        strength: 20,
                        defense: 10,
                    }),
                    resources: 300,
                },
                [ROGUE_ID]: {
                    ...createEntity(ROGUE_ID, {
                        health: 100,
                        agility: 25,
                        stealth: 15,
                    }),
                    resources: 300,
                },
            },
        };

        // 3. Create items and add them to the inventory
        const sword = createItem(
            'sword_001',
            'Sword of Valor',
            'weapon',
            { strength: 10 },
            'A powerful sword that increases strength.'
        );

        const dagger = createItem(
            'dagger_001',
            'Dagger of Shadows',
            'weapon',
            { agility: 5, stealth: 5 },
            'A dagger that enhances agility and stealth.'
        );

        state.entities[WARRIOR_ID].inventory.push(sword);
        state.entities[ROGUE_ID].inventory.push(dagger);

        // 4. Equip items
        state.entities[WARRIOR_ID].equipment.weapon = sword;
        state.entities[ROGUE_ID].equipment.weapon = dagger;

        // 5. Create abilities
        state = createAbility(state, WARRIOR_ID, {
            id: 'warrior_sword_strike',
            name: 'Sword Strike',
            description: 'A powerful strike with the sword.',
            effect: (attacker, defender) => {
                const damage = (attacker.stats.strength ?? 0) + (attacker.equipment.weapon?.stats.strength ?? 0);
                const newDefender = {
                    ...defender,
                    stats: {
                        ...defender.stats,
                        health: (defender.stats.health ?? 0) - damage,
                    },
                };
                return [
                    attacker,
                    newDefender,
                    {
                        newAttacker: attacker,
                        newDefender,
                        damageDealt: damage,
                        statusEffects: [],
                        message: `${attacker.id} strikes ${defender.id} with ${attacker.equipment.weapon?.name}, dealing ${damage} damage!`,
                    },
                ];
            },
            requirements: { strength: 10 },
        });

        state = createAbility(state, ROGUE_ID, {
            id: 'rogue_dagger_stab',
            name: 'Dagger Stab',
            description: 'A quick stab with the dagger.',
            effect: (attacker, defender) => {
                const damage = (attacker.stats.agility ?? 0) + (attacker.equipment.weapon?.stats.agility ?? 0);
                const newDefender = {
                    ...defender,
                    stats: {
                        ...defender.stats,
                        health: (defender.stats.health ?? 0) - damage,
                    },
                };
                return [
                    attacker,
                    newDefender,
                    {
                        newAttacker: attacker,
                        newDefender,
                        damageDealt: damage,
                        statusEffects: [],
                        message: `${attacker.id} stabs ${defender.id} with ${attacker.equipment.weapon?.name}, dealing ${damage} damage!`,
                    },
                ];
            },
            requirements: { agility: 10 },
        });

        // 6. Initialize combat
        state = {
            ...state,
            combat: {
                participants: [WARRIOR_ID, ROGUE_ID],
                turnOrder: [WARRIOR_ID, ROGUE_ID],
                currentTurn: 0,
                log: [],
            },
        };

        // 7. Simulate multiple rounds of combat
        const maxRounds = 5;
        for (let round = 1; round <= maxRounds; round++) {
            const combatUI = getCombatState(state);
            const currentEntityId = combatUI.currentTurn;

            console.log(`\n=== Round ${round} ===`);
            console.log(`Current turn: ${currentEntityId}`);

            // Show the available actions (abilities, inventory, etc.)
            const actionsUI = getAvailableActions(state, currentEntityId);

            console.log(`Abilities for ${currentEntityId}:`);
            actionsUI.abilities.forEach((ability) =>
                console.log(
                    ` - ${ability.name} (id: ${ability.id}, cost: ${ability.cost}), usable: ${ability.usable}`
                )
            );

            // Decide which ability to use (like a basic AI or user input)
            let chosenAbilityId: string | null = null;
            if (currentEntityId === WARRIOR_ID) {
                // Warrior uses Sword Strike
                const found = actionsUI.abilities.find(
                    (a) => a.name === 'Sword Strike' && a.usable
                );
                chosenAbilityId = found?.id ?? null;
            } else if (currentEntityId === ROGUE_ID) {
                // Rogue uses Dagger Stab
                const found = actionsUI.abilities.find(
                    (a) => a.name === 'Dagger Stab' && a.usable
                );
                chosenAbilityId = found?.id ?? null;
            }

            // Process the turn via processCombatTurn
            state = processCombatTurn(state, (s: GameState) => {
                if (chosenAbilityId) {
                    // Pick the other participant as the defender
                    const defenderId =
                        currentEntityId === WARRIOR_ID ? ROGUE_ID : WARRIOR_ID;
                    return executeAbility(s, chosenAbilityId, currentEntityId, defenderId);
                }
                return s; // No action if no ability
            });

            // Display the latest action
            const updatedCombatUI = getCombatState(state);
            if (updatedCombatUI.log.length > 0) {
                const lastAction =
                    updatedCombatUI.log[updatedCombatUI.log.length - 1];
                console.log(
                    `Action: ${lastAction.message} (Damage: ${lastAction.damageDealt})`
                );
            }

            // Check if someone is at 0 HP or below → end the battle
            if (
                state.entities[WARRIOR_ID].stats.health <= 0 ||
                state.entities[ROGUE_ID].stats.health <= 0
            ) {
                console.log('\nA combatant has fallen! Battle ends early.');
                break;
            }
        }

        // 8. Print out final results
        console.log('\n=== FINAL STATUS ===');
        console.log('Warrior Stats:', state.entities[WARRIOR_ID].stats);
        console.log('Rogue Stats:', state.entities[ROGUE_ID].stats);

        // Optionally add assertions here:
        // expect(...).toBe(...);
    });
});
