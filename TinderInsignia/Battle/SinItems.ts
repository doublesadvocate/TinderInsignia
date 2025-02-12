// SinItems.ts

import { createItem, Item, EquipmentSlot } from '../Battle';

/**
 * SinItemsFactory creates themed items for each of the seven deadly sins.
 * For each sin, it creates four items corresponding to the equipment slots:
 * 'weapon', 'gear', 'keepsake', and 'utility'. The item stat boosts are
 * chosen to correlate with that sin’s unique stat values and intended ability archetypes.
 */
export class SinItemsFactory {
    // ============================
    // Lust Items
    // Unique Stats: allure, temptation, passion, charm
    // ============================
    static createLustItems(): Item[] {
        const weapon: Item = createItem(
            'lust_weapon',
            "Lust's Enchanted Blade",
            'weapon',
            { allure: 5 },
            "A sleek blade that amplifies seductive allure."
        );
        const gear: Item = createItem(
            'lust_gear',
            "Silken Robes of Temptation",
            'gear',
            { temptation: 5 },
            "Robes that exude a mesmerizing aura, distracting foes."
        );
        const keepsake: Item = createItem(
            'lust_keepsake',
            "Heart's Desire Pendant",
            'keepsake',
            { passion: 5 },
            "A pendant that burns with fervent passion."
        );
        const utility: Item = createItem(
            'lust_utility',
            "Mirror of Charm",
            'utility',
            { charm: 5 },
            "A mystical mirror that enhances the wearer’s charm."
        );
        return [weapon, gear, keepsake, utility];
    }

    // ============================
    // Gluttony Items
    // Unique Stats: appetite, consumption, overindulgence, satiety
    // ============================
    static createGluttonyItems(): Item[] {
        const weapon: Item = createItem(
            'gluttony_weapon',
            "Voracious Cleaver",
            'weapon',
            { appetite: 5 },
            "A massive cleaver that intensifies the hunger for destruction."
        );
        const gear: Item = createItem(
            'gluttony_gear',
            "Gourmand's Apron",
            'gear',
            { consumption: 5 },
            "An apron imbued with the power of endless consumption."
        );
        const keepsake: Item = createItem(
            'gluttony_keepsake',
            "Bloating Brooch",
            'keepsake',
            { overindulgence: 5 },
            "A brooch that symbolizes excessive indulgence."
        );
        const utility: Item = createItem(
            'gluttony_utility',
            "Satiety Charm",
            'utility',
            { satiety: 5 },
            "A charm that calms the relentless hunger."
        );
        return [weapon, gear, keepsake, utility];
    }

    // ============================
    // Greed Items
    // Unique Stats: avarice, hoarding, possessiveness, materialism
    // ============================
    static createGreedItems(): Item[] {
        const weapon: Item = createItem(
            'greed_weapon',
            "Covetous Rapier",
            'weapon',
            { avarice: 5 },
            "A slender rapier that strikes with the force of greed."
        );
        const gear: Item = createItem(
            'greed_gear',
            "Hoarder's Vest",
            'gear',
            { hoarding: 5 },
            "A vest that seems to attract and store treasures untold."
        );
        const keepsake: Item = createItem(
            'greed_keepsake',
            "Grasping Gauntlet",
            'keepsake',
            { possessiveness: 5 },
            "A gauntlet that clamps down with a miser's grip."
        );
        const utility: Item = createItem(
            'greed_utility',
            "Materialist's Coin",
            'utility',
            { materialism: 5 },
            "A coin that gleams with the promise of wealth."
        );
        return [weapon, gear, keepsake, utility];
    }

    // ============================
    // Sloth Items
    // Unique Stats: lethargy, inertia, procrastination, apathy
    // ============================
    static createSlothItems(): Item[] {
        const weapon: Item = createItem(
            'sloth_weapon',
            "Drowsy Mace",
            'weapon',
            { lethargy: 5 },
            "A heavy mace that strikes slowly but relentlessly."
        );
        const gear: Item = createItem(
            'sloth_gear',
            "Inertial Cloak",
            'gear',
            { inertia: 5 },
            "A cloak that weighs down movement, mirroring its wearer's lethargy."
        );
        const keepsake: Item = createItem(
            'sloth_keepsake',
            "Procrastinator's Watch",
            'keepsake',
            { procrastination: 5 },
            "A timepiece that seems to tick at its own unhurried pace."
        );
        const utility: Item = createItem(
            'sloth_utility',
            "Apathetic Amulet",
            'utility',
            { apathy: 5 },
            "An amulet exuding an aura of indifference."
        );
        return [weapon, gear, keepsake, utility];
    }

    // ============================
    // Wrath Items
    // Unique Stats: fury, aggression, vengeance, tempest
    // ============================
    static createWrathItems(): Item[] {
        const weapon: Item = createItem(
            'wrath_weapon',
            "Furious Battleaxe",
            'weapon',
            { fury: 5 },
            "A battleaxe that roars with untamed fury."
        );
        const gear: Item = createItem(
            'wrath_gear',
            "Aggressor's Armor",
            'gear',
            { aggression: 5 },
            "Armor that intensifies the wearer's aggressive might."
        );
        const keepsake: Item = createItem(
            'wrath_keepsake',
            "Vengeance Medallion",
            'keepsake',
            { vengeance: 5 },
            "A medallion that pulses with the promise of retribution."
        );
        const utility: Item = createItem(
            'wrath_utility',
            "Tempest Ring",
            'utility',
            { tempest: 5 },
            "A ring that channels the chaos of a raging storm."
        );
        return [weapon, gear, keepsake, utility];
    }

    // ============================
    // Envy Items
    // Unique Stats: jealousy, covet, resentment, mimicry
    // ============================
    static createEnvyItems(): Item[] {
        const weapon: Item = createItem(
            'envy_weapon',
            "Jealous Dagger",
            'weapon',
            { jealousy: 5 },
            "A dagger that stabs with envious malice."
        );
        const gear: Item = createItem(
            'envy_gear',
            "Covetous Cloak",
            'gear',
            { covet: 5 },
            "A cloak that shrouds the wearer in envious shadows."
        );
        const keepsake: Item = createItem(
            'envy_keepsake',
            "Resentment Brooch",
            'keepsake',
            { resentment: 5 },
            "A brooch that burns with bitter resentment."
        );
        const utility: Item = createItem(
            'envy_utility',
            "Mimicry Locket",
            'utility',
            { mimicry: 5 },
            "A locket that subtly mirrors the abilities of foes."
        );
        return [weapon, gear, keepsake, utility];
    }

    // ============================
    // Pride Items
    // Unique Stats: vanity, ego, superiority, grandeur
    // ============================
    static createPrideItems(): Item[] {
        const weapon: Item = createItem(
            'pride_weapon',
            "Arrogant Saber",
            'weapon',
            { vanity: 5 },
            "A saber that dazzles with self-importance."
        );
        const gear: Item = createItem(
            'pride_gear',
            "Egotist's Vestments",
            'gear',
            { ego: 5 },
            "Regal attire that elevates the wearer’s ego."
        );
        const keepsake: Item = createItem(
            'pride_keepsake',
            "Superiority Talisman",
            'keepsake',
            { superiority: 5 },
            "A talisman that radiates an air of unmatched superiority."
        );
        const utility: Item = createItem(
            'pride_utility',
            "Grandeur Pendant",
            'utility',
            { grandeur: 5 },
            "A pendant that exudes majestic grandeur."
        );
        return [weapon, gear, keepsake, utility];
    }
}
