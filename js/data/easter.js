/**
 * ============================================================================
 * EASTER EVENT DATA - Pure Data File
 * ============================================================================
 *
 * This file contains all Easter event data:
 *   - Quest definitions (given by Marshmallow)
 *   - Shop items (sold by Clover)
 *   - NPC definitions (Marshmallow + Clover)
 *
 * ============================================================================
 * QUEST DIFFICULTIES
 * ============================================================================
 *
 *   Easy            = 1 chocolate egg
 *   Medium          = 5 chocolate eggs
 *   Challenging     = 10 chocolate eggs
 *   Hard            = 15 chocolate eggs
 *   Almost Impossible = 20 chocolate eggs
 *
 * ============================================================================
 */

window.EASTER_QUESTS = [

    // ========================================================================
    // EASY QUESTS (1 chocolate egg reward)
    // ========================================================================
    {
        id: 'catch_1_bunny',
        name: 'Bunny Beginner',
        description: 'Catch 1 naughty bunny.',
        difficulty: 'Easy',
        reward: 1,
        goal: { type: 'catch_bunnies', count: 1 }
    },
    {
        id: 'collect_2_eggs',
        name: 'Egg Picker',
        description: 'Pick up 2 decorated Easter eggs.',
        difficulty: 'Easy',
        reward: 1,
        goal: { type: 'collect_easter_eggs', count: 2 }
    },

    // ========================================================================
    // MEDIUM QUESTS (5 chocolate eggs reward)
    // ========================================================================
    {
        id: 'catch_3_bunnies',
        name: 'Bunny Chaser',
        description: 'Catch 3 naughty bunnies.',
        difficulty: 'Medium',
        reward: 5,
        goal: { type: 'catch_bunnies', count: 3 }
    },
    {
        id: 'collect_4_eggs',
        name: 'Egg Collector',
        description: 'Pick up 4 decorated Easter eggs.',
        difficulty: 'Medium',
        reward: 5,
        goal: { type: 'collect_easter_eggs', count: 4 }
    },

    // ========================================================================
    // CHALLENGING QUESTS (10 chocolate eggs reward)
    // ========================================================================
    {
        id: 'catch_5_bunnies',
        name: 'Bunny Hunter',
        description: 'Catch 5 naughty bunnies.',
        difficulty: 'Challenging',
        reward: 10,
        goal: { type: 'catch_bunnies', count: 5 }
    },
    {
        id: 'collect_8_eggs',
        name: 'Easter Basket',
        description: 'Pick up 8 decorated Easter eggs.',
        difficulty: 'Challenging',
        reward: 10,
        goal: { type: 'collect_easter_eggs', count: 8 }
    },

    // ========================================================================
    // HARD QUESTS (15 chocolate eggs reward)
    // ========================================================================
    {
        id: 'catch_8_bunnies',
        name: 'Bunny Wrangler',
        description: 'Catch 8 naughty bunnies. They are getting crafty!',
        difficulty: 'Hard',
        reward: 15,
        goal: { type: 'catch_bunnies', count: 8 }
    },
    {
        id: 'collect_12_eggs',
        name: 'Egg Hoarder',
        description: 'Pick up 12 decorated Easter eggs.',
        difficulty: 'Hard',
        reward: 15,
        goal: { type: 'collect_easter_eggs', count: 12 }
    },

    // ========================================================================
    // ALMOST IMPOSSIBLE QUESTS (20 chocolate eggs reward)
    // ========================================================================
    {
        id: 'catch_15_bunnies',
        name: 'Bunny Master',
        description: 'Catch 15 naughty bunnies! Are you fast enough?',
        difficulty: 'Almost Impossible',
        reward: 20,
        goal: { type: 'catch_bunnies', count: 15 }
    },
    {
        id: 'collect_20_eggs',
        name: 'Easter Legend',
        description: 'Pick up 20 decorated Easter eggs. A true champion!',
        difficulty: 'Almost Impossible',
        reward: 20,
        goal: { type: 'collect_easter_eggs', count: 20 }
    }
];

// ============================================================================
// EASTER LAMB COLORS & RARITY
// ============================================================================
//
// Special quest: "Collect 30 cherry blossom petals" (5% chance from Marshmallow)
// Spawns a naughty lamb under a random cherry blossom tree.
// Must be caught 3 times (it escapes and gets faster each time).
// Reward: 30 chocolate eggs + matching lamb skin unlocked.
//
// Rarity tiers:
//   Common (60%) — 12% each
//   Uncommon (20%) — ~6.7% each
//   Rare (12%) — 4% each
//   Ultra Rare (5%) — 2.5% each
//   Epic (2%)
//   Godly (1%)
//
// ============================================================================

window.EASTER_LAMB_COLORS = [
    // COMMON (60% total)
    { id: 'cotton_candy',  name: 'Cotton Candy',  rarity: 'Common',     color: 0xFFB6C1, weight: 12 },
    { id: 'buttercup',     name: 'Buttercup',     rarity: 'Common',     color: 0xFFD700, weight: 12 },
    { id: 'mint',          name: 'Mint',          rarity: 'Common',     color: 0x98FB98, weight: 12 },
    { id: 'peach',         name: 'Peach',         rarity: 'Common',     color: 0xFFCBA4, weight: 12 },
    { id: 'snowdrop',      name: 'Snowdrop',      rarity: 'Common',     color: 0xF5F5F5, weight: 12 },

    // UNCOMMON (20% total)
    { id: 'bluebell',      name: 'Bluebell',      rarity: 'Uncommon',   color: 0x7EC8E3, weight: 6.7 },
    { id: 'coral',         name: 'Coral',         rarity: 'Uncommon',   color: 0xFF7F7F, weight: 6.7 },
    { id: 'sky',           name: 'Sky',           rarity: 'Uncommon',   color: 0x87CEEB, weight: 6.6 },

    // RARE (12% total)
    { id: 'lavender',      name: 'Lavender',      rarity: 'Rare',       color: 0xC4A7E7, weight: 4 },
    { id: 'honey',         name: 'Honey',         rarity: 'Rare',       color: 0xDAA520, weight: 4 },
    { id: 'strawberry',    name: 'Strawberry',    rarity: 'Rare',       color: 0xFF6B81, weight: 4 },

    // ULTRA RARE (5% total)
    { id: 'lilac',         name: 'Lilac',         rarity: 'Ultra Rare', color: 0xB589D6, weight: 2.5 },
    { id: 'cocoa',         name: 'Cocoa',         rarity: 'Ultra Rare', color: 0x8B6914, weight: 2.5 },

    // EPIC (2%)
    { id: 'ocean',         name: 'Ocean',         rarity: 'Epic',       color: 0x4ECDC4, weight: 2 },

    // GODLY (0.9999%)
    { id: 'moonbeam',      name: 'Moonbeam',      rarity: 'Godly',      color: 0xC0C0C0, weight: 0.9999 },

    // EASTER SYMBOL (0.0001%) — practically impossible!
    { id: 'blossom',       name: 'Blossom',        rarity: 'Easter Symbol', color: 0xFF69B4, weight: 0.0001 }
];

/**
 * Pick a random lamb color using weighted rarity.
 */
window.pickRandomLambColor = function() {
    var totalWeight = 0;
    for (var i = 0; i < EASTER_LAMB_COLORS.length; i++) {
        totalWeight += EASTER_LAMB_COLORS[i].weight;
    }
    var roll = Math.random() * totalWeight;
    var running = 0;
    for (var j = 0; j < EASTER_LAMB_COLORS.length; j++) {
        running += EASTER_LAMB_COLORS[j].weight;
        if (roll < running) return EASTER_LAMB_COLORS[j];
    }
    return EASTER_LAMB_COLORS[0]; // fallback
};

// Rarity colors for UI display
window.LAMB_RARITY_COLORS = {
    'Common': '#aaaaaa',
    'Uncommon': '#55cc55',
    'Rare': '#5599ff',
    'Ultra Rare': '#cc55ff',
    'Epic': '#ff9900',
    'Godly': '#ffdd00',
    'Easter Symbol': '#ff69b4'
};

// ============================================================================
// LAMB GENDER ASSIGNMENTS
// ============================================================================
// When a lamb grows into a sheep, its color determines gender.
// 8 male colors, 8 female colors — balanced across rarities.

window.LAMB_GENDERS = {
    // MALE (warm/dark tones)
    buttercup: 'male',     // Common
    peach: 'male',         // Common
    coral: 'male',         // Uncommon
    sky: 'male',           // Uncommon
    honey: 'male',         // Rare
    cocoa: 'male',         // Ultra Rare
    ocean: 'male',         // Epic
    moonbeam: 'male',      // Godly

    // FEMALE (cool/pastel tones)
    cotton_candy: 'female', // Common
    mint: 'female',         // Common
    snowdrop: 'female',     // Common
    bluebell: 'female',     // Uncommon
    lavender: 'female',     // Rare
    strawberry: 'female',   // Rare
    lilac: 'female',        // Ultra Rare
    blossom: 'female'       // Easter Symbol
};

// Rarity ranking for determining herd leader (higher = rarer)
window.LAMB_RARITY_RANK = {
    'Common': 1,
    'Uncommon': 2,
    'Rare': 3,
    'Ultra Rare': 4,
    'Epic': 5,
    'Godly': 6,
    'Easter Symbol': 7
};

// ============================================================================
// EASTER SHOP ITEMS (Sold by Clover)
// ============================================================================

window.EASTER_SHOP_ITEMS = [
    {
        id: 'catcher_net',
        name: 'Catcher Net',
        description: 'Doubles your bunny catching range! (20 units instead of 10)',
        price: 10,
        icon: '🥅',
        type: 'equippable'
    },
    {
        id: 'chocolate_goggles',
        name: 'Chocolate Goggles',
        description: 'One-time use: highlights all bunnies for 10 seconds! Equip and press E.',
        price: 20,
        icon: '🥽',
        type: 'consumable'
    },
    {
        id: 'roller_skates',
        name: 'Roller Skates',
        description: 'Speed boost to 20! Equip and press E to put on/take off.',
        price: 30,
        icon: '⛸️',
        type: 'equippable_toggle'
    },
    {
        id: 'flamingo_license',
        name: 'Flamingo Riding License',
        description: 'Official license to ride Easter flamingos! Approach a flamingo and press E to mount.',
        price: 50,
        icon: '🦩',
        type: 'permanent_unlock'
    }
];

// ============================================================================
// EASTER FLAMINGO TYPES
// ============================================================================
//
// Flamingos spawn near cherry blossom trees during Easter.
// 4 always spawn (1 of each color), plus a 1% chance of a 5th Blood flamingo.
// Player needs a Flamingo Riding License (50 chocolate eggs from Clover) to ride.
// Flamingos are the ONLY way to reach the Easter Biome!
//
// Controls while mounted:
//   WASD = horizontal movement (camera-relative)
//   Space = ascend
//   Shift = descend
//   E = dismount (lands if in air)
//
// ============================================================================

window.EASTER_FLAMINGO_TYPES = [
    {
        id: 'rose',
        name: 'Rose Flamingo',
        color: 0xFF69B4,          // Hot pink
        detailColor: 0xE0559A,    // Darker pink (wing tips, beak)
        legColor: 0xFF8899,       // Pale pink legs
        eyeColor: 0x111111,       // Black eyes
        speed: 25,                // Fastest
        flySpeed: 30,             // Air speed
        abilities: [],            // No special ability — pure speed
        spawnWeight: 1,           // Always spawns (1 guaranteed)
        description: 'The fastest flier. No tricks, just raw speed.'
    },
    {
        id: 'lavender',
        name: 'Lavender Flamingo',
        color: 0xC4A7E7,          // Soft purple
        detailColor: 0xAA8ECC,
        legColor: 0xBB99DD,
        eyeColor: 0x6633AA,
        speed: 20,
        flySpeed: 24,
        abilities: ['petal_trail'],  // Drops blossom petals while flying
        spawnWeight: 1,
        description: 'Leaves a trail of cherry blossom petals in the sky.'
    },
    {
        id: 'mint',
        name: 'Mint Flamingo',
        color: 0x98FB98,          // Mint green
        detailColor: 0x80DD80,
        legColor: 0x88EE88,
        eyeColor: 0x228B22,
        speed: 18,
        flySpeed: 22,
        abilities: ['egg_radar'],    // Nearby Easter eggs glow
        spawnWeight: 1,
        description: 'Easter eggs glow when you fly near them.'
    },
    {
        id: 'gold',
        name: 'Gold Flamingo',
        color: 0xFFD700,          // Gold
        detailColor: 0xE0BD00,
        legColor: 0xEECC33,
        eyeColor: 0x8B6914,
        speed: 20,
        flySpeed: 24,
        abilities: ['score_boost'],  // 2x score while mounted
        spawnWeight: 1,
        description: 'Everything collected gives double score while riding!'
    },
    {
        id: 'blood',
        name: 'Blood Flamingo',
        color: 0x111111,          // Black body
        detailColor: 0x220000,    // Very dark red
        legColor: 0x330000,
        eyeColor: 0xFF0000,       // Glowing red eyes
        speed: 25,
        flySpeed: 30,
        abilities: ['petal_trail', 'egg_radar', 'score_boost', 'fear_aura'],
        spawnWeight: 0,           // Never in normal rotation — 1% bonus spawn
        bloodSpawnChance: 0.01,   // 1% chance to spawn as 5th flamingo
        description: 'The legendary Blood Flamingo. All abilities. Animals flee in terror.'
    }
];

// ============================================================================
// EASTER PIGLET DATA
// ============================================================================
// 16 collectible piglets — pastel colours, unique abilities.
// Players can have 3 active at once, unlimited in inventory.
// Obtainable from mystery eggs (Larry) or caught wild near cherry trees.
//
// Ability categories:
//   BUFF     — passive benefit to the player
//   COMBAT   — attacks or debuffs enemies
//   UTILITY  — helps with exploration/collection
// ============================================================================

window.EASTER_PIGLET_TYPES = [

    // ========================================================================
    // COMMON (5 piglets) — simple, useful abilities
    // ========================================================================
    {
        id: 'daffodil',
        name: 'Daffodil',
        rarity: 'Common',
        color: 0xFFFF99,          // Pale yellow
        detailColor: 0xFFDD44,    // Daffodil orange center
        feature: 'flower_nose',   // Has a daffodil on its nose
        ability: 'passive_heal',
        abilityType: 'BUFF',
        abilityDesc: 'Slowly heals Pedro over time (+1 HP every 8 seconds)',
        description: 'A gentle piglet with a daffodil on its snout. Its presence is soothing.',
        catchDifficulty: 0.22,    // White zone = 22% of bar
        weight: 12
    },
    {
        id: 'clover',
        name: 'Clover',
        rarity: 'Common',
        color: 0x90EE90,          // Light green
        detailColor: 0x55AA55,
        feature: 'leaf_ears',     // Clover-shaped ears
        ability: 'lucky_drops',
        abilityType: 'UTILITY',
        abilityDesc: 'Resources drop 25% more often when collected',
        description: 'A lucky little piglet with clover-shaped ears. Good things happen around it.',
        catchDifficulty: 0.22,
        weight: 12
    },
    {
        id: 'cotton',
        name: 'Cotton',
        rarity: 'Common',
        color: 0xFFF0F5,          // Lavender blush (almost white pink)
        detailColor: 0xFFCCDD,
        feature: 'fluffy',        // Extra fluffy fur
        ability: 'soft_landing',
        abilityType: 'BUFF',
        abilityDesc: 'Pedro takes no fall damage and jumps 20% higher',
        description: 'So fluffy it looks like a cloud! Bouncy and soft.',
        catchDifficulty: 0.22,
        weight: 12
    },
    {
        id: 'puddle',
        name: 'Puddle',
        rarity: 'Common',
        color: 0xADD8E6,          // Light blue
        detailColor: 0x77BBDD,
        feature: 'water_drops',   // Drips water drops
        ability: 'thirst_slow',
        abilityType: 'BUFF',
        abilityDesc: 'Thirst drains 30% slower',
        description: 'Always slightly damp. Leaves tiny puddles wherever it goes.',
        catchDifficulty: 0.22,
        weight: 12
    },
    {
        id: 'biscuit',
        name: 'Biscuit',
        rarity: 'Common',
        color: 0xF5DEB3,          // Wheat / biscuit tan
        detailColor: 0xDEB887,
        feature: 'crumbs',        // Leaves crumb trail
        ability: 'hunger_slow',
        abilityType: 'BUFF',
        abilityDesc: 'Hunger drains 30% slower',
        description: 'Smells like fresh cookies. Always nibbling on something.',
        catchDifficulty: 0.22,
        weight: 12
    },

    // ========================================================================
    // UNCOMMON (3 piglets) — more interesting abilities
    // ========================================================================
    {
        id: 'coconut',
        name: 'Coconut',
        rarity: 'Uncommon',
        color: 0x8B6914,          // Brown / hairy
        detailColor: 0x6B4914,
        feature: 'hairy',         // Covered in coarse hair
        ability: 'hair_shot',
        abilityType: 'COMBAT',
        abilityDesc: 'Shoots irritating hairs at nearby enemies, repelling them',
        description: 'Looks like a tiny coconut with legs. Its coarse hairs are surprisingly sharp!',
        catchDifficulty: 0.18,
        weight: 6.7
    },
    {
        id: 'bubblegum',
        name: 'Bubblegum',
        rarity: 'Uncommon',
        color: 0xFF69B4,          // Hot pink
        detailColor: 0xFF1493,
        feature: 'bubble',        // Blows bubbles
        ability: 'bubble_shield',
        abilityType: 'BUFF',
        abilityDesc: 'Blocks one hit every 30 seconds with a bubble shield',
        description: 'Blows sticky pink bubbles that pop with a sparkle!',
        catchDifficulty: 0.18,
        weight: 6.7
    },
    {
        id: 'truffle',
        name: 'Truffle',
        rarity: 'Uncommon',
        color: 0x4A3728,          // Dark brown
        detailColor: 0x2E1F14,
        feature: 'snout_glow',    // Glowing snout
        ability: 'resource_finder',
        abilityType: 'UTILITY',
        abilityDesc: 'Nearby hidden resources and Easter eggs glow (20 unit range)',
        description: 'Has an incredible nose! Can sniff out treasures buried underground.',
        catchDifficulty: 0.18,
        weight: 6.6
    },

    // ========================================================================
    // RARE (3 piglets) — powerful and desirable
    // ========================================================================
    {
        id: 'ginger',
        name: 'Ginger',
        rarity: 'Rare',
        color: 0xCD853F,          // Ginger / root brown
        detailColor: 0xA0522D,
        feature: 'root_body',     // Looks rootish/gnarled
        ability: 'spice_attack',
        abilityType: 'COMBAT',
        abilityDesc: 'Shakes spice onto enemies — slows them 40% and reduces damage by half',
        description: 'Looks like a walking ginger root. The spice it shakes off burns and stings!',
        catchDifficulty: 0.14,
        weight: 4
    },
    {
        id: 'spark',
        name: 'Spark',
        rarity: 'Rare',
        color: 0xFFD700,          // Electric gold
        detailColor: 0xFFA500,
        feature: 'lightning',     // Tiny sparks around body
        ability: 'speed_boost',
        abilityType: 'BUFF',
        abilityDesc: 'Pedro runs 30% faster',
        description: 'Tiny lightning bolts crackle around this energetic piglet. It never sits still!',
        catchDifficulty: 0.14,
        weight: 4
    },
    {
        id: 'petal',
        name: 'Petal',
        rarity: 'Rare',
        color: 0xFFB7C5,          // Cherry blossom pink
        detailColor: 0xFF69B4,
        feature: 'petal_crown',   // Flower petals on head
        ability: 'charm',
        abilityType: 'UTILITY',
        abilityDesc: 'Passive animals follow Pedro instead of fleeing (sheep, deer, bunnies)',
        description: 'Wears a crown of cherry blossom petals. Animals find it irresistible.',
        catchDifficulty: 0.14,
        weight: 4
    },

    // ========================================================================
    // ULTRA RARE (2 piglets) — very strong
    // ========================================================================
    {
        id: 'fiery',
        name: 'Fiery',
        rarity: 'Ultra Rare',
        color: 0xFF4500,          // Orange-red
        detailColor: 0xFF0000,
        feature: 'fire_body',     // Flame particles around it
        ability: 'fire_charge',
        abilityType: 'COMBAT',
        abilityDesc: 'Charges into enemies, setting them ablaze for 5 seconds (3 damage/tick)',
        description: 'A blazing piglet wreathed in flames! It charges fearlessly into battle.',
        catchDifficulty: 0.10,
        weight: 2.5
    },
    {
        id: 'frost',
        name: 'Frost',
        rarity: 'Ultra Rare',
        color: 0xE0FFFF,          // Light cyan / icy
        detailColor: 0xAFEEEE,
        feature: 'ice_crystals',  // Ice crystals on body
        ability: 'freeze_aura',
        abilityType: 'COMBAT',
        abilityDesc: 'Freezes nearby enemies for 3 seconds when they get within 8 units',
        description: 'Leaves frost wherever it walks. Enemies near it slow to a crawl.',
        catchDifficulty: 0.10,
        weight: 2.5
    },

    // ========================================================================
    // EPIC (1 piglet)
    // ========================================================================
    {
        id: 'shadow',
        name: 'Shadow',
        rarity: 'Epic',
        color: 0x2C2C2C,          // Very dark grey
        detailColor: 0x111111,
        feature: 'smoke_trail',   // Dark smoke particles
        ability: 'invisibility',
        abilityType: 'UTILITY',
        abilityDesc: 'Pedro becomes invisible to enemies when standing still for 2 seconds',
        description: 'A mysterious piglet that fades in and out of shadows. Is it even there?',
        catchDifficulty: 0.08,
        weight: 2
    },

    // ========================================================================
    // GODLY (1 piglet)
    // ========================================================================
    {
        id: 'emerald',
        name: 'Emerald',
        rarity: 'Godly',
        color: 0x50C878,          // Emerald green
        detailColor: 0x2E8B57,
        feature: 'gem_shine',     // Glows and sparkles like a gemstone
        ability: 'mimic',
        abilityType: 'UTILITY',
        abilityDesc: 'Randomly copies a different piglet ability each combat encounter',
        description: 'Shines like a real emerald! It can mimic any piglet — you never know what you\'ll get.',
        catchDifficulty: 0.07,
        weight: 0.9999
    },

    // ========================================================================
    // EASTER SYMBOL (1 piglet) — practically impossible to find wild
    // ========================================================================
    {
        id: 'celestial',
        name: 'Celestial',
        rarity: 'Easter Symbol',
        color: 0xFFF8DC,          // Cornsilk / glowing white-gold
        detailColor: 0xFFD700,
        feature: 'halo',          // Glowing halo above head
        ability: 'all_abilities',
        abilityType: 'BUFF',
        abilityDesc: 'Has ALL piglet abilities at once — the ultimate companion',
        description: 'A divine piglet with a golden halo. Legend says only the worthiest can tame it.',
        catchDifficulty: 0.06,    // Tiny white zone — nearly impossible
        weight: 0.0001
    }
];

// ============================================================================
// PIGLET MYSTERY EGGS — 4 tiers sold by Larry the Lamb
// ============================================================================

window.PIGLET_MYSTERY_EGGS = [
    {
        id: 'bronze_egg',
        name: 'Bronze Mystery Egg',
        price: 15,
        icon: '🥚',
        description: 'A simple egg. Mostly common piglets.',
        // Rarity chances: Common 70%, Uncommon 20%, Rare 8%, Ultra Rare 2%
        rarityWeights: {
            'Common': 70, 'Uncommon': 20, 'Rare': 8, 'Ultra Rare': 2,
            'Epic': 0, 'Godly': 0, 'Easter Symbol': 0
        }
    },
    {
        id: 'silver_egg',
        name: 'Silver Mystery Egg',
        price: 35,
        icon: '🪺',
        description: 'A shimmering egg. Better odds for rare piglets!',
        // Rarity chances: Common 40%, Uncommon 30%, Rare 20%, Ultra Rare 8%, Epic 2%
        rarityWeights: {
            'Common': 40, 'Uncommon': 30, 'Rare': 20, 'Ultra Rare': 8,
            'Epic': 2, 'Godly': 0, 'Easter Symbol': 0
        }
    },
    {
        id: 'gold_egg',
        name: 'Gold Mystery Egg',
        price: 75,
        icon: '✨',
        description: 'A golden egg! Rare piglet guaranteed!',
        // Rarity chances: Rare 50%, Ultra Rare 30%, Epic 15%, Godly 5%
        rarityWeights: {
            'Common': 0, 'Uncommon': 0, 'Rare': 50, 'Ultra Rare': 30,
            'Epic': 15, 'Godly': 5, 'Easter Symbol': 0
        }
    },
    {
        id: 'legendary_egg',
        name: 'Legendary Easter Egg',
        price: 150,
        icon: '🌟',
        description: 'A radiant egg pulsing with energy. Ultra Rare minimum!',
        // Rarity chances: Ultra Rare 50%, Epic 30%, Godly 15%, Easter Symbol 5%
        rarityWeights: {
            'Common': 0, 'Uncommon': 0, 'Rare': 0, 'Ultra Rare': 50,
            'Epic': 30, 'Godly': 15, 'Easter Symbol': 5
        }
    }
];

/**
 * Pick a random piglet from a mystery egg based on its rarity weights.
 * Returns a piglet type object from EASTER_PIGLET_TYPES.
 */
window.rollMysteryEgg = function(eggTier) {
    var egg = null;
    for (var i = 0; i < PIGLET_MYSTERY_EGGS.length; i++) {
        if (PIGLET_MYSTERY_EGGS[i].id === eggTier) {
            egg = PIGLET_MYSTERY_EGGS[i];
            break;
        }
    }
    if (!egg) return EASTER_PIGLET_TYPES[0]; // fallback

    // First, roll for rarity
    var totalWeight = 0;
    var rarities = Object.keys(egg.rarityWeights);
    for (var r = 0; r < rarities.length; r++) {
        totalWeight += egg.rarityWeights[rarities[r]];
    }
    var roll = Math.random() * totalWeight;
    var running = 0;
    var chosenRarity = 'Common';
    for (var r2 = 0; r2 < rarities.length; r2++) {
        running += egg.rarityWeights[rarities[r2]];
        if (roll < running) {
            chosenRarity = rarities[r2];
            break;
        }
    }

    // Then pick a random piglet of that rarity
    var candidates = [];
    for (var p = 0; p < EASTER_PIGLET_TYPES.length; p++) {
        if (EASTER_PIGLET_TYPES[p].rarity === chosenRarity) {
            candidates.push(EASTER_PIGLET_TYPES[p]);
        }
    }
    if (candidates.length === 0) {
        // No piglets of that rarity — fall back to Common
        candidates = EASTER_PIGLET_TYPES.filter(function(pg) { return pg.rarity === 'Common'; });
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
};

/**
 * Pick a random wild piglet using weighted spawn chances.
 */
window.pickRandomWildPiglet = function() {
    var totalWeight = 0;
    for (var i = 0; i < EASTER_PIGLET_TYPES.length; i++) {
        totalWeight += EASTER_PIGLET_TYPES[i].weight;
    }
    var roll = Math.random() * totalWeight;
    var running = 0;
    for (var j = 0; j < EASTER_PIGLET_TYPES.length; j++) {
        running += EASTER_PIGLET_TYPES[j].weight;
        if (roll < running) return EASTER_PIGLET_TYPES[j];
    }
    return EASTER_PIGLET_TYPES[0];
};
