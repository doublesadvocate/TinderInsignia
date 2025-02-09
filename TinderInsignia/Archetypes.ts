// AbilityArchetypes.ts

import {
    AbilityEffect,
    createBodyPartDamageEffect,
    createDamageEffect,
    createStatModEffect,
    AbilityResult,
    GameEntity,
    GameState
} from './Battle';

/**
 * 1) Archetype: Single-stat direct damage (Test #1 style).
 *
 * Takes the attacker's `attackerStat` (e.g. 'fire') and
 * deals that amount to the defender's `defenderStat` (e.g. 'health').
 * Optionally, it can also modify a second defender stat (like 'heat').
 */
export function singleStatDamageArchetype(
    attackerStat: string,
    defenderStat: string = 'health',
    secondaryDefenderStat?: {
        stat: string;
        increment: number;
    }
): AbilityEffect {
    return (attacker, defender, state) => {
        // 1. Base damage effect from existing createDamageEffect
        const [newAttacker, intermediateDefender, baseResult] =
            createDamageEffect(attackerStat, defenderStat)(attacker, defender, state);

        // 2. If we want to also increment some secondary stat:
        let finalDefender = intermediateDefender;
        if (secondaryDefenderStat) {
            const { stat, increment } = secondaryDefenderStat;
            finalDefender = {
                ...intermediateDefender,
                stats: {
                    ...intermediateDefender.stats,
                    [stat]: (intermediateDefender.stats[stat] ?? 0) + increment,
                },
            };
        }

        // 3. Construct a new result message
        const messageParts = [baseResult.message];
        if (secondaryDefenderStat) {
            messageParts.push(
                `${defender.id}'s ${secondaryDefenderStat.stat} increased by ${secondaryDefenderStat.increment}!`
            );
        }

        const finalResult: AbilityResult = {
            ...baseResult,
            newDefender: finalDefender,
            message: messageParts.join(' ')
        };

        return [newAttacker, finalDefender, finalResult];
    };
}

/**
 * 2) Archetype: Synergy-based damage (like Steam Eruption).
 * 
 * Possibly uses one stat from attacker plus a "multiplier × defender's stat."
 * Then can zero out that defender stat afterwards.
 */
export function synergyDamageArchetype(
    attackerBaseStat: string,    // e.g. 'water'
    synergyDefenderStat: string, // e.g. 'heat'
    synergyMultiplier: number,   // e.g. 3
    targetDefenderStat: string = 'health',
    resetSynergyStat?: boolean   // e.g. true if we want to reset 'heat' to 0
): AbilityEffect {
    return (attacker, defender) => {
        const baseDamage = attacker.stats[attackerBaseStat] ?? 0;
        const synergyValue = (defender.stats[synergyDefenderStat] ?? 0) * synergyMultiplier;
        const totalDamage = baseDamage + synergyValue;

        const newDefender = {
            ...defender,
            stats: {
                ...defender.stats,
                [targetDefenderStat]: (defender.stats[targetDefenderStat] ?? 0) - totalDamage,
                ...(resetSynergyStat
                    ? { [synergyDefenderStat]: 0 } // reset synergy stat if requested
                    : {}
                )
            }
        };

        const result: AbilityResult = {
            newAttacker: attacker,
            newDefender,
            damageDealt: totalDamage,
            statusEffects: [],
            message: `${attacker.id} deals ${totalDamage} by combining ${attackerBaseStat} with ${defender.id}'s ${synergyDefenderStat}!`
        };

        return [attacker, newDefender, result];
    };
}

/**
 * 3) Archetype: Body-part damage with optional status infliction.
 *
 * For test #2 style single-part hits (like "Head Chop" or "Shield Bash").
 * Allows you to specify which part name you’re targeting and how
 * much damage to do. You can also pass an optional status to inflict.
 */
export function targetedBodyPartAttackArchetype(
    targetPartName: string,
    damage: number,
    inflictedStatus?: string
): AbilityEffect {
    return (attacker, defender) => {
        // Reuse existing body-part damage effect
        const [newAttacker, partialDefender, baseResult] =
            createBodyPartDamageEffect(targetPartName, damage)(attacker, defender);

        let finalDefender = partialDefender;
        let inflictedStatuses: string[] = [];

        if (inflictedStatus && damage > 0) {
            inflictedStatuses = [inflictedStatus];
            finalDefender = {
                ...partialDefender,
                statusConditions: [...partialDefender.statusConditions, inflictedStatus],
            };
        }

        const finalResult: AbilityResult = {
            ...baseResult,
            newDefender: finalDefender,
            statusEffects: inflictedStatuses,
            message: baseResult.message +
                (inflictedStatus ? ` ${defender.id} is inflicted with [${inflictedStatus}]!` : '')
        };

        return [newAttacker, finalDefender, finalResult];
    };
}

/**
 * 4) Archetype: Multi-head or multi-limb scaling attack.
 *
 * This pattern is for something like the Hydra’s "Multi-Head Bite":
 * the total damage depends on how many parts are intact. 
 */
export function multiPartScalingAttackArchetype(
    partNamePrefix: string,
    damagePerPart: number,
    defaultTargetPart: string = 'Torso'
): AbilityEffect {
    return (attacker, defender) => {
        // Count how many parts matching `partNamePrefix` are functional
        const functionalParts = attacker.bodyParts.filter(
            (bp) =>
                bp.name.startsWith(partNamePrefix) &&
                bp.structuralIntegrity > 0
        ).length;

        const totalDamage = functionalParts * damagePerPart;

        // Perform body-part damage on the defender's "defaultTargetPart"
        const [newAttacker, newDefender, baseResult] =
            createBodyPartDamageEffect(defaultTargetPart, totalDamage)(attacker, defender);

        // Modify the message
        const finalResult: AbilityResult = {
            ...baseResult,
            message: `${attacker.id} uses ${functionalParts} functional ${partNamePrefix}(s) to deal ${totalDamage} damage to ${defender.id}'s ${defaultTargetPart}!`
        };

        return [newAttacker, newDefender, finalResult];
    };
}

/**
 * 5) Archetype: Simple stat buff/debuff effect (attacker or defender).
 * Reuses createStatModEffect under the hood. 
 */
export function simpleStatModArchetype(
    modifyAttacker?: (stats: Record<string, number>) => Record<string, number>,
    modifyDefender?: (stats: Record<string, number>) => Record<string, number>,
    customMessage: string = 'Stats modified!'
): AbilityEffect {
    return createStatModEffect(
        { attacker: modifyAttacker, defender: modifyDefender },
        customMessage
    );
}
