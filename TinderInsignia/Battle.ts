// ========================
// Core Types (Functional Foundation)
// ========================
export type StatKey = string;
export type StatBag = Record<StatKey, number>;
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory' | 'utility';
export type EntityID = string;
export type ItemID = string;
export type AbilityID = string;

export interface GameEntity {
    id: EntityID;
    stats: StatBag;
    inventory: Item[];
    equipment: Record<EquipmentSlot, Item | null>;
    abilities: Ability[];
    resources: number;
}

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
}

export type StatModifier = (stats: StatBag) => StatBag;
export interface AbilityResult {
    newAttacker: GameEntity;
    newDefender: GameEntity;
    damageDealt: number;
    statusEffects: string[];
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

export const createEntity = (id: EntityID, baseStats: StatBag): GameEntity => ({
    id,
    stats: { ...baseStats },
    inventory: [],
    equipment: { weapon: null, armor: null, accessory: null, utility: null },
    abilities: [],
    resources: 100,
});

// ========================
// Ability System
// ========================
export const createAbility = (
    state: GameState,
    creatorId: EntityID,
    params: Omit<Ability, 'id' | 'cost'>
): GameState => {
    const creator = state.entities[creatorId];
    const cost = Math.round(Object.values(creator.stats).reduce((sum, val) => sum + val, 0) * 0.5);

    if (creator.resources < cost) return state;

    const newAbility: Ability = {
        id: `ability_${Date.now()}`,
        ...params,
        cost,
    };

    return {
        ...state,
        entities: {
            ...state.entities,
            [creatorId]: {
                ...creator,
                resources: creator.resources - cost,
                abilities: [...creator.abilities.slice(-3), newAbility],
            },
        },
        abilities: { ...state.abilities, [newAbility.id]: newAbility },
    };
};

export const createDamageEffect = (
    damageStat: StatKey,
    defenderStat: StatKey = 'health'
): AbilityEffect => (attacker, defender) => {
    const damage = attacker.stats[damageStat] || 0;
    const newDefenderStats = {
        ...defender.stats,
        [defenderStat]: (defender.stats[defenderStat] || 0) - damage
    };

    const result: AbilityResult = {
        newAttacker: attacker,
        newDefender: { ...defender, stats: newDefenderStats },
        damageDealt: damage,
        statusEffects: [],
        message: `${attacker.id} dealt ${damage} ${damageStat} damage to ${defender.id}!`
    };

    return [attacker, result.newDefender, result];
};

export const createStatModEffect = (
    statModifiers: {
        attacker?: StatModifier;
        defender?: StatModifier;
    },
    message: string
): AbilityEffect => (attacker, defender) => {
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
        message
    };

    return [newAttacker, newDefender, result];
};

// ========================
// Combat System
// ========================
export const processCombatTurn = (
    state: GameState,
    action: (state: GameState) => GameState
): GameState => {
    if (!state.combat) return state;

    const newState = action(state);
    const nextTurn = (newState.combat!.currentTurn + 1) % newState.combat!.turnOrder.length;

    return {
        ...newState,
        combat: {
            ...newState.combat!,
            currentTurn: nextTurn,
        },
    };
};

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

    const [newAttacker, newDefender, result] = ability.effect(attacker, defender, state);

    return {
        ...state,
        entities: {
            ...state.entities,
            [attackerId]: newAttacker,
            [defenderId]: newDefender
        },
        combat: state.combat ? {
            ...state.combat,
            log: [...state.combat.log, result]
        } : undefined
    };
};

// ========================
// UI Feedback System
// ========================
export const getAvailableActions = (state: GameState, entityId: EntityID) => ({
    inventory: state.entities[entityId].inventory.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        equipable: !state.entities[entityId].equipment[item.slot],
    })),
    abilities: state.entities[entityId].abilities.map(ability => ({
        id: ability.id,
        name: ability.name,
        description: ability.description,
        cost: ability.cost,
        usable: Object.entries(ability.requirements).every(([stat, value]) =>
            (state.entities[entityId].stats[stat] || 0) >= value
        ),
    })),
    equipmentSlots: Object.entries(state.entities[entityId].equipment).map(([slot, item]) => ({
        slot,
        item: item ? { name: item.name, stats: item.stats } : null,
    })),
});

export const getCombatState = (state: GameState) => ({
    currentTurn: state.combat?.turnOrder[state.combat.currentTurn] || '',
    log: state.combat?.log || [],
    participants: state.combat?.participants.map(id => {
        const entity = state.entities[id];
        return {
            id,
            stats: entity ? { ...entity.stats } : {},
            resources: entity?.resources || 0
        };
    }) || [],
});