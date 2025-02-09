// ArchetypeAbilities.test.ts

import {
    createGameState,
    createEntity,
    createAbility,
    processCombatTurn,
    executeAbility,
    getAvailableActions,
    getCombatState,
    type GameState,
    type BodyPart,
} from './Battle';

// Import your new archetypes
import {
    singleStatDamageArchetype,
    synergyDamageArchetype,
    targetedBodyPartAttackArchetype,
    multiPartScalingAttackArchetype,
} from './Archetypes';

describe('Archetype-Based Combat Tests', () => {
    //
    // 1) Mage vs Golem using archetypes
    //
    test('Mage vs Golem (Fire/Water Synergy)', () => {
        const MAGE_ID = 'Archmage_Ignis';
        const GOLEM_ID = 'Stone_Colossus';

        // 1. Create a fresh GameState
        let state = createGameState();

        // 2. Create Mage & Golem
        state.entities[MAGE_ID] = {
            ...createEntity(MAGE_ID, { health: 100, arcane: 25, fire: 15, water: 15 }),
            resources: 500,
        };
        state.entities[GOLEM_ID] = {
            ...createEntity(GOLEM_ID, { health: 200, stone: 30, heat: 0 }),
            resources: 500,
        };

        // 3. Create abilities using archetypes
        // "Pyro Blast" -> singleStatDamageArchetype(fire -> health) + increment 'heat' by 5
        state = createAbility(state, MAGE_ID, {
            id: 'mage_pyro_blast',
            name: 'Pyro Blast',
            description: 'Superheats enemy with fire magic',
            effect: singleStatDamageArchetype('fire', 'health', {
                stat: 'heat',
                increment: 5,
            }),
            requirements: { arcane: 10 },
        });

        // "Steam Eruption" -> synergyDamageArchetype(water, heat, multiplier=3, target=health, resetHeat=true)
        state = createAbility(state, MAGE_ID, {
            id: 'mage_steam_eruption',
            name: 'Steam Eruption',
            description: 'Detonates stored heat with water magic',
            effect: synergyDamageArchetype('water', 'heat', 3, 'health', true),
            requirements: { arcane: 15 },
        });

        // Golem's "Mountain Crusher" -> simple single stat damage (stone -> health)
        state = createAbility(state, GOLEM_ID, {
            id: 'golem_mountain_crusher',
            name: 'Mountain Crusher',
            description: 'Devastating physical attack',
            effect: singleStatDamageArchetype('stone', 'health'),
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

        // 5. Simulate a few rounds
        const maxRounds = 5;
        for (let round = 1; round <= maxRounds; round++) {
            const combatUI = getCombatState(state);
            const currentTurnIndex = state.combat?.currentTurn;
            const currentEntityId = combatUI.currentTurn;

            console.log(`\n=== Round ${round} ===`);
            if (!currentEntityId) {
                console.log('No active combatants. Ending battle.');
                break;
            }
            console.log(`It's ${currentEntityId}'s turn!`);

            // Show the available actions (abilities, inventory, etc.)
            const actionsUI = getAvailableActions(state, currentEntityId);
            console.log(`Available Abilities for ${currentEntityId}:`);
            actionsUI.abilities.forEach((ability) => {
                console.log(
                    ` - ${ability.name} (ID: ${ability.id}, Cost: ${ability.cost}) - Usable: ${ability.usable}`
                );
            });

            // Decide which ability to use (like a basic AI or user input)
            let chosenAbilityId: string | null = null;
            if (currentEntityId === MAGE_ID) {
                // Mage logic: Use Steam Eruption if heat >= 15, else Pyro Blast
                const golemHeat = state.entities[GOLEM_ID]?.stats.heat ?? 0;
                const desiredAbility = golemHeat >= 15 ? 'Steam Eruption' : 'Pyro Blast';
                const ability = actionsUI.abilities.find(
                    (a) => a.name === desiredAbility && a.usable
                );
                if (ability) {
                    chosenAbilityId = ability.id;
                } else {
                    console.log(`${currentEntityId} cannot use ${desiredAbility}.`);
                }
            } else if (currentEntityId === GOLEM_ID) {
                // Golem always uses Mountain Crusher if usable
                const ability = actionsUI.abilities.find(
                    (a) => a.name === 'Mountain Crusher' && a.usable
                );
                if (ability) {
                    chosenAbilityId = ability.id;
                } else {
                    console.log(`${currentEntityId} cannot use Mountain Crusher.`);
                }
            }

            if (chosenAbilityId) {
                const defenderId = currentEntityId === MAGE_ID ? GOLEM_ID : MAGE_ID;
                state = processCombatTurn(state, (s: GameState) =>
                    executeAbility(s, chosenAbilityId!, currentEntityId, defenderId)
                );

                // Log latest action
                const updatedCombatUI = getCombatState(state);
                if (updatedCombatUI.log.length > 0) {
                    const lastAction = updatedCombatUI.log[updatedCombatUI.log.length - 1];
                    console.log(`Action: ${lastAction.message} (Damage Dealt: ${lastAction.damageDealt})`);
                }
            } else {
                console.log(`${currentEntityId} has no usable abilities and skips the turn.`);
            }

            // Rotate turn
            if (state.combat && typeof state.combat.currentTurn === 'number') {
                state = {
                    ...state,
                    combat: {
                        ...state.combat,
                        currentTurn: (state.combat.currentTurn + 1) % state.combat.turnOrder.length,
                    },
                };
            }

            // Check for battle conclusion
            if (
                (state.entities[MAGE_ID]?.stats.health ?? 0) <= 0 ||
                (state.entities[GOLEM_ID]?.stats.health ?? 0) <= 0
            ) {
                console.log('\nA combatant has fallen! The battle concludes.');
                break;
            }
        }

        // 6. Print out final statuses
        console.log('\n=== FINAL STATUS ===');
        printEntityStatus(state, MAGE_ID);
        printEntityStatus(state, GOLEM_ID);

        // Optionally, you can add Jest expectations here:
        // expect(state.entities[MAGE_ID]?.stats.health).toBeGreaterThan(0);
        // expect(state.entities[GOLEM_ID]?.stats.health).toBeLessThanOrEqual(0);
    });

    //
    // 2) Knight vs Hydra using archetypes
    //
    test('Knight vs Hydra (Body-Part–Based)', () => {
        // 1. Create state
        let state = createGameState();

        // 2. Create Knight & Hydra
        const KNIGHT_ID = 'Sir_Valiant';
        const HYDRA_ID = 'Abyssal_Hydra';

        // Knight’s body parts
        const knightParts: BodyPart[] = [
            { name: 'Head', structuralIntegrity: 5, maxStructuralIntegrity: 5, vital: true },
            { name: 'Torso', structuralIntegrity: 10, maxStructuralIntegrity: 10, vital: true },
            { name: 'Left Arm', structuralIntegrity: 4, maxStructuralIntegrity: 4 },
            { name: 'Right Arm', structuralIntegrity: 4, maxStructuralIntegrity: 4 },
            { name: 'Legs', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
        ];

        // Hydra’s body parts
        const hydraParts: BodyPart[] = [
            { name: 'Head #1', structuralIntegrity: 3, maxStructuralIntegrity: 3, vital: true },
            { name: 'Head #2', structuralIntegrity: 3, maxStructuralIntegrity: 3, vital: true },
            { name: 'Head #3', structuralIntegrity: 3, maxStructuralIntegrity: 3, vital: true },
            { name: 'Body', structuralIntegrity: 8, maxStructuralIntegrity: 8, vital: true },
        ];

        state.entities[KNIGHT_ID] = {
            ...createEntity(KNIGHT_ID, { strength: 5, agility: 3 }, knightParts),
            resources: 300,
        };
        state.entities[HYDRA_ID] = {
            ...createEntity(HYDRA_ID, { ferocity: 4, scaly: 2 }, hydraParts),
            resources: 300,
        };

        // 3. Create abilities using body-part archetypes
        // Knight's "Head Chop" -> targetedBodyPartAttackArchetype('Head #1', 4)
        state = createAbility(state, KNIGHT_ID, {
            name: 'Head Chop',
            description: 'Attempt to lop off one Hydra head',
            effect: targetedBodyPartAttackArchetype('Head #1', 4),
            requirements: { strength: 3 },
            requiredBodyParts: ['Right Arm'],
        });

        // Knight's "Shield Bash" -> targetedBodyPartAttackArchetype('Body', 1) + inflicted 'stunned'
        state = createAbility(state, KNIGHT_ID, {
            name: 'Shield Bash',
            description: 'Stun the Hydra briefly',
            effect: targetedBodyPartAttackArchetype('Body', 1, 'stunned'),
            requirements: { strength: 2 },
            requiredBodyParts: ['Left Arm'],
        });

        // Hydra's "Multi-Head Bite" -> multiPartScalingAttackArchetype('Head #', 2, 'Torso')
        state = createAbility(state, HYDRA_ID, {
            name: 'Multi-Head Bite',
            description: 'All functional heads chomp the Knight',
            effect: multiPartScalingAttackArchetype('Head #', 2, 'Torso'),
            disallowedStatuses: ['stunned'],
            requirements: {},
        });

        // 4. Initialize combat
        state = {
            ...state,
            combat: {
                participants: [KNIGHT_ID, HYDRA_ID],
                turnOrder: [KNIGHT_ID, HYDRA_ID],
                currentTurn: 0,
                log: [],
            },
        };

        // 5. Simulate a few rounds
        const maxRounds = 6;
        for (let round = 1; round <= maxRounds; round++) {
            const combatUI = getCombatState(state);
            const currentTurnIndex = state.combat?.currentTurn;
            const currentEntityId = combatUI.currentTurn;

            console.log(`\n=== Round ${round} ===`);
            if (!currentEntityId) {
                console.log('No active combatants. Ending battle.');
                break;
            }
            console.log(`It's ${currentEntityId}'s turn!`);

            // Show the available actions (abilities, inventory, etc.)
            const actionsUI = getAvailableActions(state, currentEntityId);
            console.log(`Available Abilities for ${currentEntityId}:`);
            actionsUI.abilities.forEach((ability) => {
                console.log(
                    ` - ${ability.name} (ID: ${ability.id}, Cost: ${ability.cost}) - Usable: ${ability.usable}`
                );
            });

            // Decide which ability to use
            let chosenAbilityId: string | null = null;
            if (currentEntityId === KNIGHT_ID) {
                // Knight tries "Head Chop" if usable; otherwise "Shield Bash"
                const chop = actionsUI.abilities.find(
                    (a) => a.name === 'Head Chop' && a.usable
                );
                const bash = actionsUI.abilities.find(
                    (a) => a.name === 'Shield Bash' && a.usable
                );

                if (chop) {
                    chosenAbilityId = chop.id;
                } else if (bash) {
                    chosenAbilityId = bash.id;
                } else {
                    console.log(`${currentEntityId} has no usable abilities to perform.`);
                }
            } else if (currentEntityId === HYDRA_ID) {
                // Hydra tries "Multi-Head Bite" if usable
                const bite = actionsUI.abilities.find(
                    (a) => a.name === 'Multi-Head Bite' && a.usable
                );
                if (bite) {
                    chosenAbilityId = bite.id;
                } else {
                    console.log(`${currentEntityId} has no usable abilities to perform.`);
                }
            }

            if (chosenAbilityId) {
                const defenderId = currentEntityId === KNIGHT_ID ? HYDRA_ID : KNIGHT_ID;
                state = processCombatTurn(state, (s: GameState) =>
                    executeAbility(s, chosenAbilityId!, currentEntityId, defenderId)
                );

                // Log latest action
                const updatedCombatUI = getCombatState(state);
                if (updatedCombatUI.log.length > 0) {
                    const lastAction = updatedCombatUI.log[updatedCombatUI.log.length - 1];
                    console.log(`Action: ${lastAction.message} (Damage Dealt: ${lastAction.damageDealt})`);
                }
            } else {
                console.log(`${currentEntityId} has no usable abilities and skips the turn.`);
            }

            // Rotate turn
            if (state.combat && typeof state.combat.currentTurn === 'number') {
                state = {
                    ...state,
                    combat: {
                        ...state.combat,
                        currentTurn: (state.combat.currentTurn + 1) % state.combat.turnOrder.length,
                    },
                };
            }

            // Check for battle conclusion
            if (!canContinueFighting(state, KNIGHT_ID) || !canContinueFighting(state, HYDRA_ID)) {
                console.log('\nOne side is incapacitated or all vital parts are destroyed! The battle concludes.');
                break;
            }
        }

        // 6. Print out final statuses
        console.log('\n=== FINAL STATUS ===');
        printEntityStatus(state, KNIGHT_ID);
        printEntityStatus(state, HYDRA_ID);

        // Optionally, you can add Jest expectations here:
        // expect(state.entities[KNIGHT_ID]?.stats.health).toBeGreaterThan(0);
        // expect(state.entities[HYDRA_ID]?.stats.health).toBeLessThanOrEqual(0);
    });
});

/**
 * Simple helper to see if an entity can still fight: 
 * at least one vital part > 0 structuralIntegrity.
 */
function canContinueFighting(state: GameState, entityId: string): boolean {
    const entity = state.entities[entityId];
    if (!entity) return false;
    const vitalPart = entity.bodyParts.find(
        (bp) => bp.vital && bp.structuralIntegrity > 0
    );
    return Boolean(vitalPart);
}

/** 
 * Print entity's body parts and statuses, for debugging 
 */
function printEntityStatus(state: GameState, entityId: string) {
    const e = state.entities[entityId];
    if (!e) {
        console.log(`${entityId} does not exist in the game state.`);
        return;
    }
    console.log(`${e.id} Status: [${e.statusConditions.join(', ') || 'No statuses'}]`);
    e.bodyParts.forEach((bp) => {
        console.log(
            `  * ${bp.name}: ${bp.structuralIntegrity}/${bp.maxStructuralIntegrity} (Vital: ${bp.vital ? 'Yes' : 'No'
            })`
        );
    });
}
