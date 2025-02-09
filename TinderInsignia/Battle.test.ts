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
} from './Battle';

describe('Epic Battle Simulations (UI-Based Approach)', () => {
    test('Mage vs Golem with Custom Ability IDs', () => {
        const MAGE_ID = 'Archmage_Ignis';
        const GOLEM_ID = 'Stone_Colossus';

        // 1. Create a fresh GameState
        let state = createGameState();

        // 2. Create our entities and insert them into state
        state = {
            ...state,
            entities: {
                [MAGE_ID]: {
                    ...createEntity(MAGE_ID, {
                        health: 100,
                        arcane: 25,
                        fire: 15,
                        water: 15,
                    }),
                    resources: 500,
                },
                [GOLEM_ID]: {
                    ...createEntity(GOLEM_ID, {
                        health: 200,
                        stone: 30,
                        heat: 0,
                    }),
                    resources: 500,
                },
            },
        };

        // 3. Create abilities with explicit IDs
        state = createAbility(state, MAGE_ID, {
            id: 'mage_pyro_blast', // <--- custom ID
            name: 'Pyro Blast',
            description: 'Superheats enemy with fire magic',
            effect: (attacker, defender) => {
                const damage = attacker.stats.fire ?? 0; // safe fallback to 0
                const newHeat = (defender.stats.heat ?? 0) + 5;
                const newDefender = {
                    ...defender,
                    stats: {
                        ...defender.stats,
                        health: (defender.stats.health ?? 0) - damage,
                        heat: newHeat,
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
                        message: `🔥 ${attacker.id} casts Pyro Blast on ${defender.id} (Heat +5 → ${newHeat})`,
                    },
                ];
            },
            requirements: { arcane: 10 },
        });

        state = createAbility(state, MAGE_ID, {
            id: 'mage_steam_eruption', // <--- custom ID
            name: 'Steam Eruption',
            description: 'Explodes heated enemy with water magic',
            effect: (attacker, defender) => {
                const baseDamage = attacker.stats.water ?? 0;
                const heatDamage = (defender.stats.heat ?? 0) * 3;
                const totalDamage = baseDamage + heatDamage;
                const newDefender = {
                    ...defender,
                    stats: {
                        ...defender.stats,
                        health: (defender.stats.health ?? 0) - totalDamage,
                        heat: 0,
                    },
                };
                return [
                    attacker,
                    newDefender,
                    {
                        newAttacker: attacker,
                        newDefender,
                        damageDealt: totalDamage,
                        statusEffects: [],
                        message: `💧 ${attacker.id} triggers Steam Eruption! ${defender.id} takes ${heatDamage} bonus damage!`,
                    },
                ];
            },
            requirements: { arcane: 15 },
        });

        state = createAbility(state, GOLEM_ID, {
            id: 'golem_mountain_crusher', // <--- custom ID
            name: 'Mountain Crusher',
            description: 'Devastating physical attack',
            effect: (attacker, defender) => {
                const damage = attacker.stats.stone ?? 0; // safe fallback to 0
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
                        message: `🌋 ${attacker.id} smashes the ground! ${defender.id} takes ${damage} crushing damage!`,
                    },
                ];
            },
            requirements: {},
        });

        // 4. Initialize combat
        state = {
            ...state,
            combat: {
                participants: [MAGE_ID, GOLEM_ID],
                turnOrder: [MAGE_ID, GOLEM_ID],
                currentTurn: 0,
                log: [],
            },
        };

        // 5. Simulate multiple rounds of combat
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
            if (currentEntityId === MAGE_ID) {
                // If the Golem is heated to 15 or more, use Steam Eruption; else Pyro Blast
                const golemHeat = state.entities[GOLEM_ID].stats.heat ?? 0;
                const wantsSteamEruption = golemHeat >= 15;
                const chosenName = wantsSteamEruption ? 'Steam Eruption' : 'Pyro Blast';

                const found = actionsUI.abilities.find(
                    (a) => a.name === chosenName && a.usable
                );
                chosenAbilityId = found?.id ?? null;
            } else if (currentEntityId === GOLEM_ID) {
                // Golem tries "Mountain Crusher"
                const found = actionsUI.abilities.find(
                    (a) => a.name === 'Mountain Crusher' && a.usable
                );
                chosenAbilityId = found?.id ?? null;
            }

            // Process the turn via processCombatTurn
            state = processCombatTurn(state, (s: GameState) => {
                if (chosenAbilityId) {
                    // Pick the other participant as the defender
                    const defenderId =
                        currentEntityId === MAGE_ID ? GOLEM_ID : MAGE_ID;
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
                state.entities[MAGE_ID].stats.health <= 0 ||
                state.entities[GOLEM_ID].stats.health <= 0
            ) {
                console.log('\nA combatant has fallen! Battle ends early.');
                break;
            }
        }

        // 6. Print out final results
        console.log('\n=== FINAL STATUS ===');
        console.log('Golem Stats:', state.entities[GOLEM_ID].stats);
        console.log('Mage Stats:', state.entities[MAGE_ID].stats);

        // Optionally add assertions here:
        // expect(...).toBe(...);
    });
});
