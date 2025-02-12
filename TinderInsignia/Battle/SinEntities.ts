// SinFactory.ts

import { createEntity, GameEntity, BodyPart } from '../Battle';

/**
 * SinFactory provides static functions to create the seven deadly sin entities.
 * Each sin is an undead creature (sharing a "regeneration" stat) with four unique stats.
 * Each unique stat is intended to correlate with an ability archetype whose effect
 * will typically target one or more random body parts. Additionally, each sin is constructed
 * with a custom set of body parts that may represent both common anatomy and sin‑specific features.
 */
export class SinFactory {
    /**
     * Lust:
     * - Unique Stats:
     *   - allure: Empowers "Seductive Strike" (targets a random vital part, e.g. head or heart)
     *   - temptation: Fuels "Distracting Glance" (aimed at confusing enemy sensory organs)
     *   - passion: Drives "Fervent Embrace" (capable of affecting multiple body parts)
     *   - charm: Supports "Mesmerizing Touch" (reduces enemy defenses on a randomly chosen part)
     *
     * - Body Parts:
     *   - Head (vital)
     *   - Torso (vital)
     *   - Left Arm
     *   - Right Arm
     *   - Heart (vital)
     */
    static createLust(id: string = 'Lust'): GameEntity {
        const bodyParts: BodyPart[] = [
            { name: 'Head', structuralIntegrity: 8, maxStructuralIntegrity: 8, vital: true },
            { name: 'Torso', structuralIntegrity: 12, maxStructuralIntegrity: 12, vital: true },
            { name: 'Left Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Right Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Heart', structuralIntegrity: 5, maxStructuralIntegrity: 5, vital: true },
        ];
        return createEntity(id, {
            regeneration: 10,
            allure: 15,
            temptation: 12,
            passion: 14,
            charm: 16,
        }, bodyParts);
    }

    /**
     * Gluttony:
     * - Unique Stats:
     *   - appetite: Powers "Voracious Bite" (targets a random enemy limb or appendage)
     *   - consumption: Enables "Devour" (an ability that can affect multiple body parts)
     *   - overindulgence: Drives "Bloating Smash" (delivers unpredictable multi-part damage)
     *   - satiety: Supports "Sated Roar" (designed to disorient enemy defenses on random parts)
     *
     * - Body Parts:
     *   - Head (vital)
     *   - Torso (vital)
     *   - Left Arm
     *   - Right Arm
     *   - Stomach (vital)
     */
    static createGluttony(id: string = 'Gluttony'): GameEntity {
        const bodyParts: BodyPart[] = [
            { name: 'Head', structuralIntegrity: 8, maxStructuralIntegrity: 8, vital: true },
            { name: 'Torso', structuralIntegrity: 12, maxStructuralIntegrity: 12, vital: true },
            { name: 'Left Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Right Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Stomach', structuralIntegrity: 7, maxStructuralIntegrity: 7, vital: true },
        ];
        return createEntity(id, {
            regeneration: 10,
            appetite: 20,
            consumption: 18,
            overindulgence: 15,
            satiety: 12,
        }, bodyParts);
    }

    /**
     * Greed:
     * - Unique Stats:
     *   - avarice: Empowers "Covetous Strike" (delivers a focused hit on a random enemy body part)
     *   - hoarding: Enhances "Pillage" (an ability that can target multiple parts simultaneously)
     *   - possessiveness: Drives "Grasping Clutch" (aimed to disable enemy limbs)
     *   - materialism: Bolsters "Resource Siphon" (targeting a vital enemy part for extra effect)
     *
     * - Body Parts:
     *   - Head (vital)
     *   - Torso (vital)
     *   - Left Arm
     *   - Right Arm
     *   - Greedy Grasp (a unique appendage symbolizing the desire to take)
     */
    static createGreed(id: string = 'Greed'): GameEntity {
        const bodyParts: BodyPart[] = [
            { name: 'Head', structuralIntegrity: 8, maxStructuralIntegrity: 8, vital: true },
            { name: 'Torso', structuralIntegrity: 12, maxStructuralIntegrity: 12, vital: true },
            { name: 'Left Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Right Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Greedy Grasp', structuralIntegrity: 4, maxStructuralIntegrity: 4 },
        ];
        return createEntity(id, {
            regeneration: 10,
            avarice: 18,
            hoarding: 16,
            possessiveness: 14,
            materialism: 15,
        }, bodyParts);
    }

    /**
     * Sloth:
     * - Unique Stats:
     *   - lethargy: Powers "Drowsy Smash" (a slow but steady strike on a random body part)
     *   - inertia: Supports "Weighted Strike" (designed to reduce the integrity of enemy parts)
     *   - procrastination: Fuels "Delayed Blow" (an ability with a chance to affect multiple parts over time)
     *   - apathy: Enhances "Indifferent Claw" (aimed to bypass enemy defenses on a random part)
     *
     * - Body Parts:
     *   - Head (vital)
     *   - Torso (vital)
     *   - Left Arm
     *   - Right Arm
     *   - Left Leg
     *   - Right Leg
     */
    static createSloth(id: string = 'Sloth'): GameEntity {
        const bodyParts: BodyPart[] = [
            { name: 'Head', structuralIntegrity: 8, maxStructuralIntegrity: 8, vital: true },
            { name: 'Torso', structuralIntegrity: 14, maxStructuralIntegrity: 14, vital: true },
            { name: 'Left Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Right Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Left Leg', structuralIntegrity: 7, maxStructuralIntegrity: 7 },
            { name: 'Right Leg', structuralIntegrity: 7, maxStructuralIntegrity: 7 },
        ];
        return createEntity(id, {
            regeneration: 10,
            lethargy: 25,
            inertia: 20,
            procrastination: 18,
            apathy: 22,
        }, bodyParts);
    }

    /**
     * Wrath:
     * - Unique Stats:
     *   - fury: Drives "Raging Blow" (delivers explosive damage to a random enemy body part)
     *   - aggression: Empowers "Berserk Charge" (capable of targeting multiple enemy parts)
     *   - vengeance: Supports "Revenge Strike" (has an increased chance to hit vital parts)
     *   - tempest: Fuels "Storm of Anger" (randomly selects several enemy body parts for damage)
     *
     * - Body Parts:
     *   - Head (vital)
     *   - Torso (vital)
     *   - Left Arm
     *   - Right Arm
     *   - Heart (vital)
     */
    static createWrath(id: string = 'Wrath'): GameEntity {
        const bodyParts: BodyPart[] = [
            { name: 'Head', structuralIntegrity: 8, maxStructuralIntegrity: 8, vital: true },
            { name: 'Torso', structuralIntegrity: 12, maxStructuralIntegrity: 12, vital: true },
            { name: 'Left Arm', structuralIntegrity: 7, maxStructuralIntegrity: 7 },
            { name: 'Right Arm', structuralIntegrity: 7, maxStructuralIntegrity: 7 },
            { name: 'Heart', structuralIntegrity: 6, maxStructuralIntegrity: 6, vital: true },
        ];
        return createEntity(id, {
            regeneration: 10,
            fury: 30,
            aggression: 28,
            vengeance: 26,
            tempest: 24,
        }, bodyParts);
    }

    /**
     * Envy:
     * - Unique Stats:
     *   - jealousy: Powers "Green-Eyed Strike" (targets a random enemy part with malice)
     *   - covet: Drives "Envious Swipe" (designed to steal or diminish an enemy part's effectiveness)
     *   - resentment: Enhances "Bitter Lash" (capable of affecting multiple enemy parts simultaneously)
     *   - mimicry: Supports "Imitative Strike" (mirrors and counters enemy actions on random parts)
     *
     * - Body Parts:
     *   - Head (vital)
     *   - Torso (vital)
     *   - Left Arm
     *   - Right Arm
     *   - Eyes (vital)
     */
    static createEnvy(id: string = 'Envy'): GameEntity {
        const bodyParts: BodyPart[] = [
            { name: 'Head', structuralIntegrity: 8, maxStructuralIntegrity: 8, vital: true },
            { name: 'Torso', structuralIntegrity: 12, maxStructuralIntegrity: 12, vital: true },
            { name: 'Left Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Right Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Eyes', structuralIntegrity: 4, maxStructuralIntegrity: 4, vital: true },
        ];
        return createEntity(id, {
            regeneration: 10,
            jealousy: 17,
            covet: 16,
            resentment: 15,
            mimicry: 14,
        }, bodyParts);
    }

    /**
     * Pride:
     * - Unique Stats:
     *   - vanity: Empowers "Arrogant Smite" (delivers a flourish of damage to a random enemy part)
     *   - ego: Drives "Hubristic Strike" (has the potential to bypass defenses on a selected part)
     *   - superiority: Enhances "Overbearing Crush" (targets multiple enemy parts simultaneously)
     *   - grandeur: Fuels "Majestic Blow" (delivers decisive damage to a vital enemy part)
     *
     * - Body Parts:
     *   - Head (vital)
     *   - Torso (vital)
     *   - Left Arm
     *   - Right Arm
     *   - Crown (a symbolic, non‑vital part representing regal pride)
     */
    static createPride(id: string = 'Pride'): GameEntity {
        const bodyParts: BodyPart[] = [
            { name: 'Head', structuralIntegrity: 8, maxStructuralIntegrity: 8, vital: true },
            { name: 'Torso', structuralIntegrity: 12, maxStructuralIntegrity: 12, vital: true },
            { name: 'Left Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Right Arm', structuralIntegrity: 6, maxStructuralIntegrity: 6 },
            { name: 'Crown', structuralIntegrity: 5, maxStructuralIntegrity: 5 },
        ];
        return createEntity(id, {
            regeneration: 10,
            vanity: 20,
            ego: 22,
            superiority: 18,
            grandeur: 19,
        }, bodyParts);
    }
}
