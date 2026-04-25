/**
 * ============================================================================
 * GAME SETTINGS - Pure Data File
 * ============================================================================
 *
 * This file contains ONLY numbers and simple values.
 * No functions, no logic - just settings you can easily change!
 *
 * HOW TO USE:
 * - Change any number to make the game easier or harder
 * - Save the file and refresh your browser to see changes
 *
 * ============================================================================
 */

window.SETTINGS = {

    // ========================================================================
    // WORLD SIZE
    // ========================================================================
    // How big is the game world? Bigger = more space to explore
    // Default: 500 (a nice medium-sized world)
    // Try: 200 for tiny, 1000 for huge

    WORLD_SIZE: 900,

    // ========================================================================
    // VILLAGE LOCATION
    // ========================================================================
    // Where is the village? The village is a safe zone where enemies don't go.
    // Position is calculated from WORLD_SIZE, so it stays in the corner.

    // How far from center? (multiplied by WORLD_SIZE)
    // -0.6 means 60% toward the negative edge
    VILLAGE_OFFSET: -0.6,

    // How big is the safe village area?
    // Default: 60 (big enough to feel safe)
    VILLAGE_RADIUS: 100,

    // ========================================================================
    // ENEMY SETTINGS
    // ========================================================================
    // These control how difficult the enemies are!

    // How often do new enemies appear? (in milliseconds)
    // Lower number = enemies spawn faster = HARDER
    // 1000 = 1 second, so 4000 = 4 seconds between spawns
    // Default: 4000 (one enemy every 4 seconds)
    // Easy: 10000 (every 10 seconds)
    // Hard: 1000 (every 1 seconds!)
    ENEMY_SPAWN_RATE: 1000,

    // Maximum number of enemies at once
    // More enemies = HARDER
    // Default: 50
    // Easy: 10
    // Hard: 250
    MAX_ENEMIES: 40,

    // How close before enemies notice you and start chasing?
    // Bigger number = enemies see you from farther away = HARDER
    // Default: 40
    // Easy: 20 (enemies almost have to bump into you)
    // Hard: 60 (enemies spot you from far away)
    ENEMY_DETECTION_RANGE: 40,

    // ========================================================================
    // RESOURCE SETTINGS
    // ========================================================================
    // These control how much food appears in the world

    // How often do new berries/nuts/mushrooms appear? (milliseconds)
    // Lower = more food = EASIER
    // Default: 2500 (every 2.5 seconds)
    RESOURCE_SPAWN_RATE: 2500,

    // Maximum resources in the world at once
    // More resources = EASIER to find food
    // Default: 40
    MAX_RESOURCES: 40,

    // ========================================================================
    // RESOURCE VALUES
    // ========================================================================
    // How much is each resource worth when you collect it?

    // Pig coins you get when collecting each resource
    RESOURCE_PRICES: {
        berries: 2,      // Berries are common, worth 2 coins
        nuts: 5,         // Nuts are medium, worth 5 coins
        mushrooms: 10,   // Mushrooms are rare, worth 10 coins
        seaweed: 15,     // Seaweed grows on riverbanks, worth 15 coins
        eggs: 50,        // Eggs are rare and valuable, worth 50 coins
        arsenic_mushrooms: 45,  // Toxic! High risk, high reward
        thous_pine_wood: 35,    // From chopping arboreal trees
        glass: 1                // Crafting material, barely worth selling
    },

    // How much health each food restores when eaten (press 1, 2, 3, 4, or 5)
    FOOD_HEALING: {
        berries: 5,      // Berries heal 5 health
        nuts: 8,         // Nuts heal 8 health
        mushrooms: 12,   // Mushrooms heal 12 health
        seaweed: 20,     // Seaweed heals 20 health
        eggs: 40         // Eggs heal 40 health
    },

    // How much hunger each food restores when eaten
    FOOD_HUNGER: {
        berries: 10,     // Berries fill 10 hunger
        nuts: 15,        // Nuts fill 15 hunger
        mushrooms: 20,   // Mushrooms fill 20 hunger
        seaweed: 12,     // Seaweed fills 12 hunger
        eggs: 25         // Eggs fill 25 hunger
    },

    // Score points for collecting each resource
    RESOURCE_SCORES: {
        berries: 5,
        nuts: 5,   
        mushrooms: 10,
        seaweed: 15,
        eggs: 20,   
        arsenic_mushrooms: 0,  // No score - you collect these for crafting
        thous_pine_wood: 0,    // No score - crafting material
        glass: 0               // No score - crafting material
    },

    // ========================================================================
    // KILL REWARDS
    // ========================================================================
    // What the player gets for killing enemies with weapons
    // Rewards are tiered by enemy max health

    KILL_REWARDS: {
        weak:   { score: 10, coins: 5 },   // maxHealth < 5
        medium: { score: 25, coins: 15 },   // maxHealth 5-9
        tough:  { score: 50, coins: 30 }    // maxHealth >= 10
    },

    // ========================================================================
    // PLAYER SETTINGS
    // ========================================================================
    // These control how the player moves and starts

    // Starting health (max is always 100)
    STARTING_HEALTH: 100,

    // Starting pig coins
    STARTING_COINS: 50,

    // Starting resources
    STARTING_RESOURCES: {
        berries: 0,
        nuts: 0,
        mushrooms: 0,
        seaweed: 0,
        eggs: 0
    },

    // Movement speed (higher = faster)
    PLAYER_WALK_SPEED: 6,
    PLAYER_SPRINT_SPEED: 12,
    PLAYER_SWIM_SPEED: 0.5,

    // Jump power (higher = jump higher)
    PLAYER_JUMP_POWER: 8,

    // Gravity (higher = fall faster)
    GRAVITY: 20,

    // ========================================================================
    // BALANCE SETTINGS
    // ========================================================================
    // Tweak these to adjust game feel without touching code.

    BALANCE: {
        // Stamina
        STAMINA_SPRINT_DRAIN: 10,       // Stamina lost per second while sprinting
        STAMINA_RECOVERY_RATE: 20,      // Stamina gained per second when not sprinting
        MELEE_ATTACKS_PER_STAMINA: 7,   // Full stamina bar = this many melee swings

        // Hunger & Thirst
        HUNGER_DRAIN_RATE: 0.17,        // Hunger lost per second
        THIRST_DRAIN_RATE: 0.12,        // Thirst lost per second
        WATER_THIRST_RESTORE: 8,        // Thirst restored per second when in water
        DEHYDRATION_DAMAGE_INTERVAL: 10, // Seconds at 0 thirst before taking damage

        // Piglet companion abilities
        PIGLET_ABILITY_MAX_RANGE: 20,   // Max distance piglet abilities can reach
        PIGLET_HUNGER_SLOW_MULT: 0.7,   // Hunger drain multiplier with Biscuit piglet
        PIGLET_THIRST_SLOW_MULT: 0.7,   // Thirst drain multiplier with Puddle piglet
        PIGLET_SPEED_BOOST_MULT: 1.3,   // Speed multiplier with Spark piglet
        PIGLET_JUMP_BOOST_MULT: 1.2,    // Jump multiplier with Cotton piglet
        PIGLET_CATCH_DISTANCE: 8,       // How close to catch a wild piglet

        // Easter / seasonal
        SHEEP_POPULATION_CAP: 30,       // Max sheep + lambs in the world
        LAMB_TRANSFORMATION_TIME: 180,  // Seconds before uncaught lamb becomes sheep
        CHERRY_PETAL_COOLDOWN: 2,       // Seconds between petal collections
        PETAL_TRAIL_INTERVAL: 0.2,      // Seconds between petal trail drops
        PETAL_TRAIL_MAX: 100,           // Max petal trail meshes before recycling
        SNOW_PARTICLE_MAX: 500,         // Max snow particles before recycling

        // Sword spin slash
        SWORD_SPIN_RANGE: 6,           // Max distance for spin slash to hit enemies
        SWORD_SPIN_DURATION: 0.4,      // Duration of spin animation in seconds
        SWORD_ATTACK_COOLDOWN: 2,      // Seconds between sword swings

        // Interaction distances
        FLAMINGO_MOUNT_DISTANCE: 10,    // Max distance to mount a flamingo
        MOUNT_DISTANCE: 2.5,            // Max distance to mount rideable animals
        RAFT_BOARD_DISTANCE: 5          // Max distance to board the raft
    }

};

// ============================================================================
// COMPUTED VALUES
// ============================================================================
// These are calculated from the settings above.
// Don't change these directly - change the settings above instead!

// Calculate village center position
SETTINGS.VILLAGE_CENTER = {
    x: SETTINGS.WORLD_SIZE * SETTINGS.VILLAGE_OFFSET,
    z: SETTINGS.WORLD_SIZE * SETTINGS.VILLAGE_OFFSET
};
