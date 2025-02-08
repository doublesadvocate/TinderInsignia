// tests file

import {
    createGameState,
    createEntity,
    createAbility,
    processCombatTurn,
    executeAbility,
    GameState,
    AbilityResult,
} from './Battle';

// Enhanced Battle Simulation Helper
function simulateBattle(rounds: number, state: GameState, actions: Record<string, Function>) {
    for (let i = 0; i < rounds; i++) {
        state = processCombatTurn(state, (s) => {
            const currentEntityId = s.combat!.turnOrder[s.combat!.currentTurn];
            const action = actions[currentEntityId];
            return action ? action(s, currentEntityId) : s;
        });
    }
    return state;
}

function printCombatNarrative(log: AbilityResult[]) {
    console.log('\n=== BATTLE NARRATIVE ===');
    log.forEach((entry, index) => {
        console.log(`Turn ${index + 1}: ${entry.message}`);
        console.log(`   Damage: ${entry.damageDealt}`);
        if (entry.statusEffects.length > 0) {
            console.log(`   Effects: ${entry.statusEffects.join(', ')}`);
        }
    });
    console.log('========================\n');
}

describe('Epic Battle Simulations', () => {
    test('Mage vs Golem Elemental Showdown', () => {
        let state = createGameState();
        const MAGE_ID = 'Archmage_Ignis';
        const GOLEM_ID = 'Stone_Colossus';

        // Create Combatants with proper resource initialization
        state = {
            ...state,
            entities: {
                [MAGE_ID]: {
                    ...createEntity(MAGE_ID, {
                        health: 100,
                        arcane: 25,
                        fire: 15,
                        water: 15
                    }),
                    resources: 500
                },
                [GOLEM_ID]: {
                    ...createEntity(GOLEM_ID, {
                        health: 200,
                        stone: 30,
                        heat: 0
                    }),
                    resources: 500
                }
            }
        };

        // Mage Abilities
        state = createAbility(state, MAGE_ID, {
            name: 'Pyro Blast',
            description: 'Superheats enemy with fire magic',
            effect: (attacker, defender) => {
                const damage = attacker.stats.fire;
                const newHeat = (defender.stats.heat || 0) + 5;
                const newDefender = {
                    ...defender,
                    stats: {
                        ...defender.stats,
                        health: defender.stats.health - damage,
                        heat: newHeat
                    }
                };
                const result: AbilityResult = {
                    newAttacker: attacker,
                    newDefender,
                    damageDealt: damage,
                    statusEffects: [],
                    message: `🔥 ${attacker.id} hurls molten rock at ${defender.id}! (Heat +5 → ${newHeat})`
                };
                return [attacker, newDefender, result];
            },
            requirements: { arcane: 10 }
        });

        state = createAbility(state, MAGE_ID, {
            name: 'Steam Eruption',
            description: 'Explodes heated enemy with water magic',
            effect: (attacker, defender) => {
                const baseDamage = attacker.stats.water;
                const heatDamage = (defender.stats.heat || 0) * 3;
                const newDefender = {
                    ...defender,
                    stats: {
                        ...defender.stats,
                        health: defender.stats.health - (baseDamage + heatDamage),
                        heat: 0
                    }
                };
                const result: AbilityResult = {
                    newAttacker: attacker,
                    newDefender,
                    damageDealt: baseDamage + heatDamage,
                    statusEffects: [],
                    message: `💧 ${attacker.id} triggers steam explosion! ${defender.id} takes ${heatDamage} bonus damage!`
                };
                return [attacker, newDefender, result];
            },
            requirements: { arcane: 15 }
        });

        // Golem Abilities
        state = createAbility(state, GOLEM_ID, {
            name: 'Mountain Crusher',
            description: 'Devastating physical attack',
            effect: (attacker, defender) => {
                const damage = attacker.stats.stone;
                const newDefender = {
                    ...defender,
                    stats: {
                        ...defender.stats,
                        health: defender.stats.health - damage
                    }
                };
                const result: AbilityResult = {
                    newAttacker: attacker,
                    newDefender,
                    damageDealt: damage,
                    statusEffects: [],
                    message: `🌋 ${attacker.id} smashes the ground with titanic force! ${defender.id} takes ${damage} crushing damage!`
                };
                return [attacker, newDefender, result];
            },
            requirements: {}
        });

        // Initiate Combat
        state = {
            ...state,
            combat: {
                participants: [MAGE_ID, GOLEM_ID],
                turnOrder: [MAGE_ID, GOLEM_ID],
                currentTurn: 0,
                log: [],
            },
        };

        // Simulate Battle with proper ability ID lookup
        const finalState = simulateBattle(5, state, {
            [MAGE_ID]: (s: GameState) => {
                const heatLevel = s.entities[GOLEM_ID].stats.heat || 0;
                const abilityName = heatLevel >= 15 ? 'Steam Eruption' : 'Pyro Blast';
                const ability = s.entities[MAGE_ID].abilities.find(a => a.name === abilityName);
                return ability ? executeAbility(s, ability.id, MAGE_ID, GOLEM_ID) : s;
            },
            [GOLEM_ID]: (s: GameState) => {
                const ability = s.entities[GOLEM_ID].abilities.find(a => a.name === 'Mountain Crusher');
                return ability ? executeAbility(s, ability.id, GOLEM_ID, MAGE_ID) : s;
            }
        });

        // Display Results
        printCombatNarrative(finalState.combat?.log || []);
        console.log('=== FINAL STATUS ===');
        console.log('Golem:', finalState.entities[GOLEM_ID].stats);
        console.log('Mage:', finalState.entities[MAGE_ID].stats);
        console.log('Golem Resources:', finalState.entities[GOLEM_ID].resources);
        console.log('Mage Resources:', finalState.entities[MAGE_ID].resources);
    });

    test('Necromancer vs Paladin Undead Clash', () => {
        let state = createGameState();
        const NECRO_ID = 'Lich_King_Malathar';
        const PALADIN_ID = 'Highlord_Aurelius';

        // Create Combatants with proper resource initialization
        state = {
            ...state,
            entities: {
                [NECRO_ID]: {
                    ...createEntity(NECRO_ID, {
                        health: 150,
                        darkPower: 40,
                        minions: 0
                    }),
                    resources: 500
                },
                [PALADIN_ID]: {
                    ...createEntity(PALADIN_ID, {
                        health: 200,
                        holyPower: 35
                    }),
                    resources: 500
                }
            }
        };

        // Necromancer Abilities
        state = createAbility(state, NECRO_ID, {
            name: 'Army of the Damned',
            description: 'Summons undead minions',
            effect: (attacker, defender) => {
                const newMinions = attacker.stats.minions + 3;
                const newAttacker = {
                    ...attacker,
                    stats: {
                        ...attacker.stats,
                        minions: newMinions,
                        darkPower: attacker.stats.darkPower - 15
                    }
                };
                const result: AbilityResult = {
                    newAttacker,
                    newDefender: defender,
                    damageDealt: 0,
                    statusEffects: [],
                    message: `💀 ${attacker.id} raises ${newMinions} skeletal warriors from the grave!`
                };
                return [newAttacker, defender, result];
            },
            requirements: { darkPower: 15 }
        });

        // Paladin Abilities
        state = createAbility(state, PALADIN_ID, {
            name: 'Divine Judgment',
            description: 'Holy strike that purges undead',
            effect: (attacker, defender) => {
                const minionCount = defender.stats.minions || 0;
                const damage = attacker.stats.holyPower + (minionCount * 8);
                const newDefender = {
                    ...defender,
                    stats: {
                        ...defender.stats,
                        health: defender.stats.health - damage,
                        minions: Math.floor(minionCount * 0.5)
                    }
                };
                const result: AbilityResult = {
                    newAttacker: attacker,
                    newDefender,
                    damageDealt: damage,
                    statusEffects: [],
                    message: `✨ ${attacker.id}'s hammer erupts with holy light! ${damage} damage destroys ${Math.floor(minionCount / 2)} undead!`
                };
                return [attacker, newDefender, result];
            },
            requirements: { holyPower: 20 }
        });

        // Initiate Combat
        state = {
            ...state,
            combat: {
                participants: [NECRO_ID, PALADIN_ID],
                turnOrder: [NECRO_ID, PALADIN_ID],
                currentTurn: 0,
                log: [],
            },
        };

        // Simulate Battle with proper ability ID lookup
        const finalState = simulateBattle(8, state, {
            [NECRO_ID]: (s: GameState) => {
                const ability = s.entities[NECRO_ID].abilities.find(a => a.name === 'Army of the Damned');
                return ability && s.entities[NECRO_ID].stats.darkPower >= 15
                    ? executeAbility(s, ability.id, NECRO_ID, NECRO_ID)
                    : s;
            },
            [PALADIN_ID]: (s: GameState) => {
                const ability = s.entities[PALADIN_ID].abilities.find(a => a.name === 'Divine Judgment');
                return ability ? executeAbility(s, ability.id, PALADIN_ID, NECRO_ID) : s;
            }
        });

        // Display Results
        printCombatNarrative(finalState.combat?.log || []);
        console.log('=== FINAL STATUS ===');
        console.log('Necromancer:', finalState.entities[NECRO_ID].stats);
        console.log('Paladin:', finalState.entities[PALADIN_ID].stats);
        console.log('Necromancer Resources:', finalState.entities[NECRO_ID].resources);
        console.log('Paladin Resources:', finalState.entities[PALADIN_ID].resources);
    });
});