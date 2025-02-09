// NewBodyPartCombat.test.ts

import {
    createGameState,
    createEntity,
    createAbility,
    createBodyPartDamageEffect,
    createStatModEffect,
    processCombatTurn,
    executeAbility,
    getAvailableActions,
    getCombatState,
    type GameState,
    type BodyPart,
} from './Battle';

describe('Body-Part–Based Combat Scenarios', () => {
    test('Knight vs Hydra: Head-Chopping & Multi-Head Attacks', () => {
        // 1. Create a fresh GameState
        let state = createGameState();

        // Define body parts for a Knight
        const knightParts: BodyPart[] = [
            { name: 'Head', structuralIntegrity: 5, maxStructuralIntegrity: 5, vital: true },
            { name: 'Torso', structuralIntegrity: 10, maxStructuralIntegrity: 10, vital: true },
            { name: 'Left Arm', structuralIntegrity: 4, maxStructuralIntegrity: 4 },
            { name: 'Right Arm', structuralIntegrity: 4, maxStructuralIntegrity: 4 },
            { name: 'Legs', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
        ];

        // Define body parts for a Hydra (multiple heads, each vital).
        const hydraParts: BodyPart[] = [
            { name: 'Head #1', structuralIntegrity: 3, maxStructuralIntegrity: 3, vital: true },
            { name: 'Head #2', structuralIntegrity: 3, maxStructuralIntegrity: 3, vital: true },
            { name: 'Head #3', structuralIntegrity: 3, maxStructuralIntegrity: 3, vital: true },
            { name: 'Body', structuralIntegrity: 8, maxStructuralIntegrity: 8, vital: true },
            // Hydra might have more non-vital body parts if you want
        ];

        // 2. Create our entities
        const KNIGHT_ID = 'Sir_Valiant';
        const HYDRA_ID = 'Abyssal_Hydra';

        // Insert them into state
        state.entities[KNIGHT_ID] = {
            ...createEntity(KNIGHT_ID, { strength: 5, agility: 3 }, knightParts),
            resources: 300,
        };
        state.entities[HYDRA_ID] = {
            ...createEntity(HYDRA_ID, { ferocity: 4, scaly: 2 }, hydraParts),
            resources: 300,
        };

        // 3. Create abilities using body-part–based damage or special effects

        // Knight's "Head Chop" requires a functional Right Arm to wield a sword,
        // and it targets one of the Hydra's heads by name.
        state = createAbility(state, KNIGHT_ID, {
            name: 'Head Chop',
            description: 'Target a specific head of the Hydra to lop it off.',
            effect: createBodyPartDamageEffect('Head #1', 4),
            requirements: { strength: 3 },
            requiredBodyParts: ['Right Arm'],  // must have right arm to swing the weapon
            disallowedStatuses: [],            // no statuses that prevent usage
        });

        // Knight's "Shield Bash" that stuns the Hydra
        state = createAbility(state, KNIGHT_ID, {
            name: 'Shield Bash',
            description: 'Bash the Hydra to possibly stun it.',
            effect: (attacker, defender) => {
                // We'll do minimal "damage," but apply a "stunned" status
                const [newAttacker, newDefender, baseResult] = createBodyPartDamageEffect(
                    'Body', // hitting the Hydra's main body
                    1
                )(attacker, defender);
                // Add "stunned" status to Hydra if it's a successful hit
                newDefender.statusConditions = [
                    ...newDefender.statusConditions,
                    'stunned',
                ];
                return [
                    newAttacker,
                    newDefender,
                    {
                        ...baseResult,
                        newAttacker,
                        newDefender,
                        statusEffects: ['stunned'],
                        message: `${attacker.id} bashes ${defender.id}'s body. ${defender.id} is stunned!`,
                    },
                ];
            },
            requirements: { strength: 2 },
            requiredBodyParts: ['Left Arm'], // let's say the shield is on the left arm
            disallowedStatuses: [],
        });

        // Hydra's "Multi-Head Bite": requires at least one head to be intact
        // We'll say it targets the Knight's torso by default. If that is destroyed,
        // the Hydra might go for something else, but let's keep it simple.
        state = createAbility(state, HYDRA_ID, {
            name: 'Multi-Head Bite',
            description: 'All functional heads chomp down on the foe!',
            effect: (attacker, defender) => {
                // Count how many heads are still functional
                const functionalHeads = attacker.bodyParts.filter(
                    (bp) => bp.name.startsWith('Head #') && bp.structuralIntegrity > 0
                ).length;
                const damage = functionalHeads * 2; // e.g., each head deals 2 damage
                const [newAttacker, newDefender, baseResult] = createBodyPartDamageEffect(
                    'Torso',
                    damage
                )(attacker, defender);

                return [
                    newAttacker,
                    newDefender,
                    {
                        ...baseResult,
                        newAttacker,
                        newDefender,
                        damageDealt: damage,
                        message: `${attacker.id} uses ${functionalHeads} head(s) to bite ${defender.id}'s Torso for ${damage} damage!`,
                    },
                ];
            },
            // No stat requirement in this example, but require at least one head vital part:
            requirements: {},
            requiredBodyParts: ['Head #1', 'Head #2', 'Head #3'],
            // Actually, we can interpret "requiredBodyParts" as "any one of these must exist"
            // but for simplicity, we won't incorporate that logic here. 
            // We'll rely on the effect's internal logic for damage if heads are destroyed.
            disallowedStatuses: ['stunned'], // Hydra can't bite if it's stunned
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
            console.log(`\n=== Round ${round} ===`);
            const combatUI = getCombatState(state);
            const currentEntityId = combatUI.currentTurn;
            console.log(`Current turn: ${currentEntityId}`);

            // Check if the current entity can act (based on vital parts, status, etc.)
            const currentEntity = state.entities[currentEntityId];
            if (!currentEntity) break; // failsafe

            // Show available actions
            const actionsUI = getAvailableActions(state, currentEntityId);
            console.log(`Possible Abilities for ${currentEntityId}:`);
            actionsUI.abilities.forEach((ability) => {
                console.log(
                    ` - ${ability.name} (ID: ${ability.id}, cost: ${ability.cost}), usable: ${ability.usable}`
                );
            });

            // Pick an ability to use (simple AI or logic)
            let chosenAbilityId: string | null = null;

            if (currentEntityId === KNIGHT_ID) {
                // Knight tries "Head Chop" if it's usable, else tries "Shield Bash"
                const chop = actionsUI.abilities.find((a) => a.name === 'Head Chop' && a.usable);
                const bash = actionsUI.abilities.find((a) => a.name === 'Shield Bash' && a.usable);

                // Knight's logic: always try to chop first to remove a head
                // if that can't be used (maybe right arm destroyed?), then shield bash
                if (chop) chosenAbilityId = chop.id;
                else if (bash) chosenAbilityId = bash.id;
            } else if (currentEntityId === HYDRA_ID) {
                // Hydra tries "Multi-Head Bite" if usable
                const bite = actionsUI.abilities.find(
                    (a) => a.name === 'Multi-Head Bite' && a.usable
                );
                if (bite) chosenAbilityId = bite.id;
            }

            // Process the turn
            state = processCombatTurn(state, (s: GameState) => {
                if (chosenAbilityId) {
                    const defenderId = currentEntityId === KNIGHT_ID ? HYDRA_ID : KNIGHT_ID;
                    return executeAbility(s, chosenAbilityId!, currentEntityId, defenderId);
                }
                return s; // no action if no ability chosen
            });

            // Log latest action
            const updatedCombatUI = getCombatState(state);
            if (updatedCombatUI.log.length > 0) {
                const lastAction = updatedCombatUI.log[updatedCombatUI.log.length - 1];
                console.log(`Action: ${lastAction.message} (Damage: ${lastAction.damageDealt})`);
            }

            // Check if either side is fully incapacitated
            const knightCanAct = canContinueFighting(state, KNIGHT_ID);
            const hydraCanAct = canContinueFighting(state, HYDRA_ID);
            if (!knightCanAct || !hydraCanAct) {
                console.log('\nOne side is incapacitated or all vital parts destroyed!');
                break;
            }
        }

        // 6. Print out final statuses
        console.log('\n=== FINAL STATUS ===');
        printEntityStatus(state, KNIGHT_ID);
        printEntityStatus(state, HYDRA_ID);

        // Optionally, you can add Jest expectations here:
        // expect(...).toBe(...);
    });
});

/**
 * Simple helper to check if an entity is still able to fight:
 * (1) Must have at least one vital part with > 0 integrity
 * (2) Not pinned by some final condition 
 *
 * (Alternatively, you could rely on your existing 'canEntityAct' 
 * or expand logic in your test.)
 */
function canContinueFighting(state: GameState, entityId: string): boolean {
    const entity = state.entities[entityId];
    if (!entity) return false;
    const vitalPart = entity.bodyParts.find((bp) => bp.vital && bp.structuralIntegrity > 0);
    return Boolean(vitalPart);
}

/** 
 * Print entity's body parts and status 
 */
function printEntityStatus(state: GameState, entityId: string) {
    const e = state.entities[entityId];
    if (!e) return;
    console.log(`-- ${e.id}'s body parts --`);
    e.bodyParts.forEach((bp) => {
        console.log(
            `  * ${bp.name}: ${bp.structuralIntegrity}/${bp.maxStructuralIntegrity} (vital: ${bp.vital ? 'yes' : 'no'
            })`
        );
    });
    console.log(`Statuses: ${e.statusConditions.join(', ') || 'None'}`);
}
