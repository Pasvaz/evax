/**
 * ============================================================================
 * TOOL STATS - Pure Data File
 * ============================================================================
 *
 * This file is the "brain" of the axe and sword system.
 * Instead of hardcoding each tool's stats in game.js or environment.js,
 * we put ALL the numbers here in ONE place.
 *
 * When you want to change how an axe works, come HERE and change one number.
 * You never have to hunt through other files!
 *
 * ============================================================================
 * HOW TO ADD A NEW AXE
 * ============================================================================
 *
 * 1. Add a new entry to the axes object
 * 2. Set its damage, woodPerChop, and which biomes it can chop
 * 3. Add a recipe in recipes.js so players can craft it
 * 4. Add its case in effects.js executeItem function
 * 5. Save and refresh!
 *
 * ============================================================================
 */

window.TOOL_STATS = {

    // ========================================================================
    // AXE STATS - Which axe can chop what, how hard, what you get
    // ========================================================================
    axes: {
        // The basic axe — only works on arboreal forest trees
        wood_axe: {
            name: 'Wood Axe',
            description: 'A sharp wooden axe. Chops arboreal trees only!',
            icon: '🪓',
            damage: 1,           // 1 damage per chop (tree health 10 = 10 chops)
            woodPerChop: 1,      // 1 wood given per chop
            canChop: ['arboreal']
        },

        // The Barbanit Axe — unlocks savannah and coastal trees
        barbanit_axe: {
            name: 'Barbanit Axe',
            description: 'A sturdy barbanit axe. Chops savannah and coastal trees!',
            icon: '🪓',
            damage: 1,           // 1 damage per chop (tree health 7 = 7 chops)
            woodPerChop: 2,      // 2 wood per chop
            canChop: ['savannah', 'coastal']
        },

        // Manglecacia Axe — chops ANY tree, faster
        manglecacia_axe: {
            name: 'Manglecacia Axe',
            description: 'A powerful axe made from manglecacia wood. Chops any tree!',
            icon: '🪓',
            damage: 2,           // 2 damage per chop (health 10 = 5 chops)
            woodPerChop: 3,      // 3 wood per chop
            canChop: ['arboreal', 'savannah', 'coastal']
        },

        // Seaspray Birch Axe — the ULTIMATE axe
        seaspray_birch_axe: {
            name: 'Seaspray Birch Axe',
            description: 'The ultimate axe. Chops any tree incredibly fast!',
            icon: '🪓',
            damage: 3,           // 3 damage per chop (health 9 = 3 chops)
            woodPerChop: 7,      // 7 wood per chop!
            canChop: ['arboreal', 'savannah', 'coastal']
        }
    },

    // ========================================================================
    // SWORD STATS - Damage per hit for each sword type
    // ========================================================================
    swords: {
        wood_sword: {
            name: 'Wood Sword',
            description: 'A sturdy wooden sword. Equip from hotbar to fight!',
            icon: '🗡️',
            price: 30,             // Pig coins
            damage: 2,
            spinRange: 6,          // Max distance to hit enemies
            spinDuration: 0.4,     // Spin animation length (seconds)
            attackCooldown: 2,     // Seconds between swings
            staminaCost: 7         // Attacks per full stamina bar
        },
        manglecacia_sword: {
            name: 'Manglecacia Sword',
            description: 'A strong sword carved from manglecacia wood! Does 5 damage.',
            icon: '🗡️',
            price: 80,
            damage: 5,
            spinRange: 7,
            spinDuration: 0.35,
            attackCooldown: 1.8,
            staminaCost: 7
        },
        seaspray_birch_sword: {
            name: 'Seaspray Birch Sword',
            description: 'A mighty sword made from seaspray birch wood! Does 8 damage.',
            icon: '🗡️',
            price: 150,
            damage: 8,
            spinRange: 8,
            spinDuration: 0.3,
            attackCooldown: 1.5,
            staminaCost: 6
        },
        fishing_spear: {
            name: 'Fishing Spear',
            description: 'A spear for catching fish. Equip from hotbar, click on fish to spear them!',
            icon: '🔱',
            price: 40,
            damage: 3,
            spinRange: 5,
            spinDuration: 0.4,
            attackCooldown: 2,
            staminaCost: 8
        },
        thunder_scythe: {
            name: 'Super Thunder Scythe Hammer',
            description: 'A legendary blue fizzing hammer-scythe! Left click: 15 dmg spin. Right click: thunderbolt (6-25 dmg, 5s cooldown).',
            icon: '⚡',
            price: 1000,
            damage: 15,
            spinRange: 9,
            spinDuration: 0.5,
            attackCooldown: 2.5,
            staminaCost: 5,
            thunderMinDmg: 6,
            thunderMaxDmg: 25,
            thunderMaxRange: 50,
            thunderCooldown: 5
        }
    },

    // ========================================================================
    // TREE WOOD MAPPING - Which wood type each biome's trees drop
    // ========================================================================
    treeWoodType: {
        arboreal: 'thous_pine_wood',
        savannah: 'manglecacia_wood',
        coastal: 'seaspray_birch_wood'
    },

    // ========================================================================
    // BONUS DROPS - Extra loot when a tree falls down
    // ========================================================================
    bonusDrops: {
        savannah: { resource: 'cinnamon', amount: 3 }
        // Add more biomes here if needed!
    }
};
