// BattleDSL.ts
import {
    singleStatDamageArchetype,
    synergyDamageArchetype,
    targetedBodyPartAttackArchetype,
    multiPartScalingAttackArchetype,
    simpleStatModArchetype,
} from './Archetypes';
import { AbilityEffect, AbilityResult, StatModifier } from './Battle';

type StatKey = string;

export class AbilityBuilder {
    private config: {
        type?: 'damage' | 'synergy' | 'body' | 'multi' | 'stat';
        damageStat?: StatKey;
        targetStat?: StatKey;
        bodyPart?: string;
        damageAmount?: number;
        secondaryStat?: { stat: StatKey; amount: number };
        statusEffect?: string;
        synergy?: { stat: StatKey; multiplier: number; reset: boolean };
        multiPart?: { prefix: string; perPart: number; target: string };
        statMod?: { attacker?: StatModifier; defender?: StatModifier };
        message?: string;
        requirements?: { bodyParts?: string[]; statuses?: string[] };
    } = {};

    static describe(action: string): AbilityBuilder {
        return new AbilityBuilder().withMessage(action);
    }

    deal(amount: number): this {
        this.config.damageAmount = amount;
        return this;
    }

    damageFrom(stat: StatKey): this {
        this.config.damageStat = stat;
        this.config.type = 'damage';
        return this;
    }

    toStat(stat: StatKey): this {
        this.config.targetStat = stat;
        return this;
    }

    toBodyPart(part: string): this {
        this.config.bodyPart = part;
        this.config.type = 'body';
        return this;
    }

    andBoost(stat: StatKey, amount: number): this {
        this.config.secondaryStat = { stat, amount };
        return this;
    }

    inflicting(status: string): this {
        this.config.statusEffect = status;
        return this;
    }

    leveraging(stat: StatKey, multiplier: number, reset = false): this {
        this.config.synergy = { stat, multiplier, reset };
        this.config.type = 'synergy';
        return this;
    }

    usingParts(prefix: string, damagePerPart: number): this {
        this.config.multiPart = { prefix, perPart: damagePerPart, target: 'Torso' };
        this.config.type = 'multi';
        return this;
    }

    targeting(part: string): this {
        if (this.config.multiPart) {
            this.config.multiPart.target = part;
        }
        return this;
    }

    modifyStats(mods: {
        attacker?: StatModifier;
        defender?: StatModifier;
    }): this {
        this.config.statMod = mods;
        this.config.type = 'stat';
        return this;
    }

    requiring(parts: string[]): this {
        this.config.requirements = {
            ...this.config.requirements,
            bodyParts: parts,
        };
        return this;
    }

    whenNot(statuses: string[]): this {
        this.config.requirements = {
            ...this.config.requirements,
            statuses,
        };
        return this;
    }

    withMessage(message: string): this {
        this.config.message = message;
        return this;
    }

    compose(): AbilityEffect {
        switch (this.config.type) {
            case 'damage':
                return singleStatDamageArchetype(
                    this.config.damageStat!,
                    this.config.targetStat,
                    this.config.secondaryStat
                        ? {
                            stat: this.config.secondaryStat.stat,
                            increment: this.config.secondaryStat.amount,
                        }
                        : undefined
                );

            case 'synergy':
                return synergyDamageArchetype(
                    this.config.damageStat!,
                    this.config.synergy!.stat,
                    this.config.synergy!.multiplier,
                    this.config.targetStat,
                    this.config.synergy!.reset
                );

            case 'body':
                return targetedBodyPartAttackArchetype(
                    this.config.bodyPart!,
                    this.config.damageAmount!,
                    this.config.statusEffect
                );

            case 'multi':
                return multiPartScalingAttackArchetype(
                    this.config.multiPart!.prefix,
                    this.config.multiPart!.perPart,
                    this.config.multiPart!.target
                );

            case 'stat':
                return simpleStatModArchetype(
                    this.config.statMod?.attacker,
                    this.config.statMod?.defender,
                    this.config.message
                );

            default:
                throw new Error('Invalid ability configuration');
        }
    }
}

// Utility function for natural language combat setup
export const CombatFlow = {
    initiateBetween: (...participants: string[]) => ({
        inOrder: (...order: string[]) => ({
            log: [] as AbilityResult[],
            currentTurn: 0,
            participants,
            turnOrder: order,
        }),
    }),
};