// BattleDSL.test.ts
import { GameState, createGameState, createEntity, processCombatTurn, executeAbility, getCombatState, canEntityAct } from './Battle';
import { AbilityBuilder, CombatFlow } from './BattleDSL';
import { BodyPart } from './Battle';

describe('Battle DSL Tests', () => {
    let state: GameState;
    const PLAYER_ID = 'player';
    const ENEMY_ID = 'enemy';
    const HYDRALISK_ID = 'hydra';

    beforeEach(() => {
        state = createGameState();
        // Initialize combat state for all tests
        state.combat = CombatFlow.initiateBetween(PLAYER_ID, ENEMY_ID)
            .inOrder(PLAYER_ID, ENEMY_ID);
    });

    test('should create multi-part scaling attack', () => {
        // Create both attacker and defender with body parts
        state.entities[HYDRALISK_ID] = createEntity(HYDRALISK_ID, {}, [
            { name: 'Head #1', structuralIntegrity: 3, maxStructuralIntegrity: 3 },
            { name: 'Head #2', structuralIntegrity: 3, maxStructuralIntegrity: 3 },
            { name: 'Head #3', structuralIntegrity: 0, maxStructuralIntegrity: 3 },
            { name: 'Body', structuralIntegrity: 10, maxStructuralIntegrity: 10 }
        ]);

        state.entities[ENEMY_ID] = createEntity(ENEMY_ID, {}, [
            { name: 'Body', structuralIntegrity: 10, maxStructuralIntegrity: 10 }
        ]);

        const hydraBite = AbilityBuilder.describe('Multiple heads strike simultaneously')
            .usingParts('Head #', 2)
            .targeting('Body')
            .compose();

        state.abilities.multi_bite = {
            id: 'multi_bite',
            name: 'Multi-Bite',
            description: '',
            effect: hydraBite,
            cost: 15,
            requirements: {}
        };

        state = executeAbility(state, 'multi_bite', HYDRALISK_ID, ENEMY_ID);
        const enemyBody = state.entities[ENEMY_ID].bodyParts.find(bp => bp.name === 'Body')!;

        // 2 functional heads * 2 damage = 4 damage
        expect(enemyBody.structuralIntegrity).toBe(10 - 4);
    });

    test('should create stat modification ability', () => {
        state.entities[PLAYER_ID] = createEntity(PLAYER_ID, { strength: 5 });
        state.entities[ENEMY_ID] = createEntity(ENEMY_ID, { morale: 5 });

        const battleShout = AbilityBuilder.describe('Inspires allies, weakens foes')
            .modifyStats({
                attacker: stats => ({ ...stats, strength: (stats.strength || 0) + 3 }),
                defender: stats => ({ ...stats, morale: (stats.morale || 0) - 2 })
            })
            .withMessage('For the alliance!')
            .compose();

        state.abilities.battle_shout = {
            id: 'battle_shout',
            name: 'Battle Shout',
            description: '',
            effect: battleShout,
            cost: 10,
            requirements: {}
        };

        state = executeAbility(state, 'battle_shout', PLAYER_ID, ENEMY_ID);

        // Verify stat changes
        expect(state.entities[PLAYER_ID].stats.strength).toBe(5 + 3);
        expect(state.entities[ENEMY_ID].stats.morale).toBe(5 - 2);

        // Verify combat log message
        const combatState = getCombatState(state);
        expect(combatState.log[0].message).toBe('For the alliance!');
    });

    test('should enforce ability requirements', () => {
        state.entities[PLAYER_ID] = createEntity(PLAYER_ID, { strength: 5 }, [
            { name: 'Right Arm', structuralIntegrity: 0, maxStructuralIntegrity: 5 }
        ]);

        state.entities[ENEMY_ID] = createEntity(ENEMY_ID, {});

        const heavySwing = AbilityBuilder.describe('Requires functional arm')
            .damageFrom('strength')
            .requiring(['Right Arm'])
            .compose();

        state.abilities.heavy_swing = {
            id: 'heavy_swing',
            name: 'Heavy Swing',
            description: '',
            effect: heavySwing,
            cost: 15,
            requirements: {},
            requiredBodyParts: ['Right Arm'] // Added this line
        };

        const originalState = JSON.parse(JSON.stringify(state));
        state = executeAbility(state, 'heavy_swing', PLAYER_ID, ENEMY_ID);

        // No changes should occur since requirement not met
        expect(state.entities).toEqual(originalState.entities);

        // Verify failure message in log
        const combatLog = getCombatState(state).log[0].message;
        expect(combatLog).toMatch(/lacked the proper condition/);
    });

    
});