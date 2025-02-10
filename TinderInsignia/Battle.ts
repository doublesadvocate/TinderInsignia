// ========================
// Core Types (Functional Foundation)
// ========================

export type StatKey = string;
export type StatBag = Record<StatKey, number>;

/**
 * New: Define body parts for more narrative, “physical” combat.
 * Each part has its own structural integrity and can be “destroyed.”
 */
export interface BodyPart {
    name: string;
    structuralIntegrity: number;
    maxStructuralIntegrity: number;
    vital?: boolean;
}

export type EquipmentSlot = 'weapon' | 'gear' | 'keepsake' | 'utility';

/**
 * Instead of an absolute “HP → 0 = death,” we can check if
 * an entity’s body is so damaged that it cannot move or act.
 */
export interface GameEntity {
    id: EntityID;
    stats: StatBag;
    /**
     * New: track each body part's state. 
     * If *all* vital body parts are destroyed, the entity is incapacitated.
     */
    bodyParts: BodyPart[];
    statusConditions: string[]; // e.g., "stunned", "paralyzed", etc.

    inventory: Item[];
    equipment: Record<EquipmentSlot, Item | null>;
    abilities: Ability[];
    resources: number;
}

export type EntityID = string;
export type ItemID = string;
export type AbilityID = string;

export interface Item {
    id: ItemID;
    name: string;
    slot: EquipmentSlot;
    stats: StatBag;
    generationSource: StatBag;
    description: string;
    creationCost: number;
}

export interface Ability {
    id: AbilityID;
    name: string;
    description: string;
    effect: AbilityEffect;
    cost: number;
    requirements: StatBag;
    /**
     * Optional: You might require certain body parts to be functional,
     * or that certain statuses NOT be present (e.g. not "stunned").
     */
    requiredBodyParts?: string[];
    disallowedStatuses?: string[];
}

export type StatModifier = (stats: StatBag) => StatBag;

export interface AbilityResult {
    newAttacker: GameEntity;
    newDefender: GameEntity;
    damageDealt: number;
    statusEffects: string[];
    /**
     * New: more explicit user-facing text that can incorporate body part details.
     */
    message: string;
}

export type AbilityEffect = (
    attacker: GameEntity,
    defender: GameEntity,
    state?: GameState
) => [GameEntity, GameEntity, AbilityResult];

export interface GameState {
    entities: Record<EntityID, GameEntity>;
    items: Record<ItemID, Item>;
    abilities: Record<AbilityID, Ability>;
    combat?: CombatState;
}

export interface CombatState {
    participants: EntityID[];
    turnOrder: EntityID[];
    currentTurn: number;
    log: AbilityResult[];
}

// ========================
// System Initialization
// ========================

export const createGameState = (): GameState => ({
    entities: {},
    items: {},
    abilities: {},
});

/**
 * Create a brand-new entity with some base stats, plus
 * a default set of body parts. Real usage might accept a param for bodyParts.
 */
export const createEntity = (
    id: EntityID,
    baseStats: StatBag,
    bodyParts?: BodyPart[]
): GameEntity => ({
    id,
    stats: { ...baseStats },
    bodyParts: bodyParts || [
        // A simple default if none provided.
        { name: 'Torso', structuralIntegrity: 10, maxStructuralIntegrity: 10, vital: true },
        { name: 'Left Arm', structuralIntegrity: 5, maxStructuralIntegrity: 5 },
        { name: 'Right Arm', structuralIntegrity: 5, maxStructuralIntegrity: 5 },
    ],
    statusConditions: [],
    inventory: [],
    // Refactored equipment to support `keepsake`
    equipment: { weapon: null, gear: null, keepsake: null, utility: null },
    abilities: [],
    resources: 100,
});

/**
 * Check if the entity can still act. This version simply checks:
 * - At least one vital body part with > 0 structuralIntegrity
 * - Not pinned by a "paralyzed" or "stunned" status
 * Expand as desired for your system.
 */
export const canEntityAct = (entity: GameEntity): boolean => {
    const hasVitalPartIntact = entity.bodyParts.some(
        (part) => part.vital && part.structuralIntegrity > 0
    );
    const isParalyzedOrStunned = entity.statusConditions.some((status) =>
        ['paralyzed', 'stunned'].includes(status)
    );
    return hasVitalPartIntact && !isParalyzedOrStunned;
};


/**
 * Compute the cost of an item based on its stats.
 */
export const computeItemCost = (stats: StatBag): number => {
    return Math.round(Object.values(stats).reduce((sum, val) => sum + (val ?? 0), 0) * 0.5);
};



    export const createItem = (
        id: ItemID,
        name: string,
        slot: EquipmentSlot,
        stats: StatBag,
        description: string
    ): Item => {
        const creationCost = computeItemCost(stats);
        return {
            id,
            name,
            slot,
            stats,
            generationSource: stats,
            description,
            creationCost,
        };
    };

// ========================
// Ability System
// ========================
let abilityCounter = 0;

/**
 * Example logic for checking that the entity meets any custom body part
 * or status requirements for the ability. You can expand or replace this
 * with your own approach.
 */
function checkBodyPartAndStatusRequirements(entity: GameEntity, ability: Ability): boolean {
    // If the ability requires certain body parts:
    if (ability.requiredBodyParts) {
        for (const partName of ability.requiredBodyParts) {
            const part = entity.bodyParts.find(
                (bp) => bp.name.toLowerCase() === partName.toLowerCase()
            );
            if (!part || part.structuralIntegrity <= 0) {
                return false; // required body part is missing or destroyed
            }
        }
    }
    // If the ability disallows certain statuses:
    if (ability.disallowedStatuses) {
        for (const badStatus of ability.disallowedStatuses) {
            if (entity.statusConditions.includes(badStatus)) {
                return false; // has a forbidden status
            }
        }
    }
    return true;
}

/**
 * Create a new ability, deduct resources from creator, limit to last 3 abilities, etc.
 */
export const createAbility = (
    state: GameState,
    creatorId: EntityID,
    params: Omit<Ability, 'id' | 'cost'> & Partial<Pick<Ability, 'id'>>
): GameState => {
    const creator = state.entities[creatorId];
    if (!creator) return state;

    // Example cost calculation
    const cost = Math.round(
        Object.values(creator.stats).reduce((sum, val) => sum + (val ?? 0), 0) * 0.5
    );

    // If not enough resources, skip
    if (creator.resources < cost) {
        return state;
    }

    // If the caller didn't pass an ID, generate one
    const newAbilityId = params.id ?? `ability_${++abilityCounter}`;

    // Build the new Ability
    const newAbility: Ability = {
        id: newAbilityId,
        name: params.name,
        description: params.description,
        effect: params.effect,
        cost,
        requirements: params.requirements,
        requiredBodyParts: params.requiredBodyParts,
        disallowedStatuses: params.disallowedStatuses,
    };

    return {
        ...state,
        entities: {
            ...state.entities,
            [creatorId]: {
                ...creator,
                resources: creator.resources - cost,
                // Keep only the last 3 abilities + the new one
                abilities: [...creator.abilities.slice(-3), newAbility],
            },
        },
        abilities: {
            ...state.abilities,
            [newAbilityId]: newAbility,
        },
    };
};

/**
 * A simple “damage” effect that uses any chosen attacker stat
 * (e.g. “fire”) to reduce some defender stat (e.g. “health”).
 * 
 * We keep it for backward compatibility, but in a purely “body-based”
 * approach, you'd use the new `createBodyPartDamageEffect` below.
 */
export const createDamageEffect =
    (damageStat: StatKey, defenderStat: StatKey = 'health'): AbilityEffect =>
        (attacker, defender) => {
            const damage = attacker.stats[damageStat] ?? 0; // safe fallback to 0
            const newDefenderStats = {
                ...defender.stats,
                [defenderStat]: (defender.stats[defenderStat] ?? 0) - damage,
            };

            const result: AbilityResult = {
                newAttacker: attacker,
                newDefender: { ...defender, stats: newDefenderStats },
                damageDealt: damage,
                statusEffects: [],
                message: `${attacker.id} dealt ${damage} ${damageStat} damage to ${defender.id}!`,
            };

            return [attacker, result.newDefender, result];
        };

/**
 * New: This is an example effect that damages a specific body part,
 * modeling the “destruction of the body” instead of an abstract HP.
 */
export const createBodyPartDamageEffect =
    (targetPartName: string, damageAmount: number): AbilityEffect =>
        (attacker, defender) => {
            // Find the targeted part
            const partIndex = defender.bodyParts.findIndex(
                (bp) => bp.name.toLowerCase() === targetPartName.toLowerCase()
            );
            if (partIndex < 0) {
                // Body part not found: no damage
                const noDamageResult: AbilityResult = {
                    newAttacker: attacker,
                    newDefender: defender,
                    damageDealt: 0,
                    statusEffects: [],
                    message: `${attacker.id} tried to hit ${defender.id}'s ${targetPartName}, but it doesn't exist!`,
                };
                return [attacker, defender, noDamageResult];
            }

            const bodyParts = [...defender.bodyParts];
            const originalIntegrity = bodyParts[partIndex].structuralIntegrity;
            const newIntegrity = Math.max(originalIntegrity - damageAmount, 0);
            bodyParts[partIndex] = {
                ...bodyParts[partIndex],
                structuralIntegrity: newIntegrity,
            };

            const newDefender: GameEntity = {
                ...defender,
                bodyParts,
            };

            const result: AbilityResult = {
                newAttacker: attacker,
                newDefender,
                damageDealt: damageAmount,
                statusEffects: [],
                message: `${attacker.id} strikes ${defender.id}'s ${targetPartName}, dealing ${damageAmount} damage (was ${originalIntegrity}, now ${newIntegrity})!`,
            };

            return [attacker, newDefender, result];
        };

/**
 * A generalized effect that modifies stats for attacker and/or defender.
 */
export const createStatModEffect =
    (
        statModifiers: {
            attacker?: StatModifier;
            defender?: StatModifier;
        },
        message: string
    ): AbilityEffect =>
        (attacker, defender) => {
            const newAttacker = statModifiers.attacker
                ? { ...attacker, stats: statModifiers.attacker(attacker.stats) }
                : attacker;

            const newDefender = statModifiers.defender
                ? { ...defender, stats: statModifiers.defender(defender.stats) }
                : defender;

            const result: AbilityResult = {
                newAttacker,
                newDefender,
                damageDealt: 0,
                statusEffects: [],
                message,
            };

            return [newAttacker, newDefender, result];
        };

// ========================
// Combat System
// ========================

/**
 * Runs one "turn" of the combat, letting you apply a particular action
 * (in your tests or app, typically an ability usage).
 * Then it rotates to the next entity’s turn.
 */
export const processCombatTurn = (
    state: GameState,
    action: (state: GameState) => GameState
): GameState => {
    if (!state.combat) return state;

    const newState = action(state);
    const nextTurn =
        (newState.combat!.currentTurn + 1) % newState.combat!.turnOrder.length;

    return {
        ...newState,
        combat: {
            ...newState.combat!,
            currentTurn: nextTurn,
        },
    };
};

/**
 * Executes an ability from attacker to defender, returning a new state
 * with updated body parts, statuses, etc. 
 */
export const executeAbility = (
    state: GameState,
    abilityId: AbilityID,
    attackerId: EntityID,
    defenderId: EntityID
): GameState => {
    const ability = state.abilities[abilityId];
    const attacker = state.entities[attackerId];
    const defender = state.entities[defenderId];

    if (!ability || !attacker || !defender) return state;

    // Check if attacker meets the stat requirements
    const meetsStatRequirements = Object.entries(ability.requirements).every(
        ([stat, value]) => (attacker.stats[stat] ?? 0) >= value
    );

    // Check if attacker can use this ability (body parts, statuses, etc.)
    if (!meetsStatRequirements || !checkBodyPartAndStatusRequirements(attacker, ability)) {
        // Return a log entry or something indicating it failed
        const failLog: AbilityResult = {
            newAttacker: attacker,
            newDefender: defender,
            damageDealt: 0,
            statusEffects: [],
            message: `${attacker.id} tried to use "${ability.name}" but lacked the proper condition!`,
        };
        return {
            ...state,
            combat: state.combat
                ? {
                    ...state.combat,
                    log: [...state.combat.log, failLog],
                }
                : undefined,
        };
    }

    const [newAttacker, newDefender, result] = ability.effect(attacker, defender, state);

    return {
        ...state,
        entities: {
            ...state.entities,
            [attackerId]: newAttacker,
            [defenderId]: newDefender,
        },
        combat: state.combat
            ? {
                ...state.combat,
                log: [...state.combat.log, result],
            }
            : undefined,
    };
};

// ========================
// UI Feedback System
// ========================

/**
 * Display what items can be equipped, what abilities are available, etc.
 * Note that "equipable" logic is simplistic here (just checks if the slot is empty).
 * We also show if an ability is “usable” from a *stat perspective* only.
 */
export const getAvailableActions = (state: GameState, entityId: EntityID) => {
    const entity = state.entities[entityId];
    return {
        inventory: entity.inventory.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            equipable: !entity.equipment[item.slot],
        })),
        abilities: entity.abilities.map((ability) => {
            const meetsStatRequirements = Object.entries(ability.requirements).every(
                ([stat, value]) => (entity.stats[stat] ?? 0) >= value
            );
            const meetsBodyStatusRequirements = checkBodyPartAndStatusRequirements(
                entity,
                ability
            );

            return {
                id: ability.id,
                name: ability.name,
                description: ability.description,
                cost: ability.cost,
                usable: meetsStatRequirements && meetsBodyStatusRequirements,
            };
        }),
        equipmentSlots: Object.entries(entity.equipment).map(([slot, slotItem]) => ({
            slot,
            item: slotItem ? { name: slotItem.name, stats: slotItem.stats } : null,
        })),
    };
};

/**
 * Return high-level info about the current combat,
 * including log messages and each participant’s stats/condition.
 */
export const getCombatState = (state: GameState) => {
    if (!state.combat) {
        return {
            currentTurn: '',
            log: [],
            participants: [],
        };
    }
    const { turnOrder, currentTurn, participants, log } = state.combat;
    return {
        currentTurn: turnOrder[currentTurn] || '',
        log,
        participants: participants.map((id) => {
            const entity = state.entities[id];
            return {
                id,
                stats: entity ? { ...entity.stats } : {},
                resources: entity?.resources ?? 0,
                bodyParts: entity?.bodyParts.map((bp) => ({
                    name: bp.name,
                    integrity: bp.structuralIntegrity,
                    max: bp.maxStructuralIntegrity,
                })),
                statusConditions: [...(entity?.statusConditions || [])],
            };
        }),
    };
};
