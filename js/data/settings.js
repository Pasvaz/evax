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

    WORLD_SIZE: 500,

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
    VILLAGE_RADIUS: 60,

    // ========================================================================
    // ENEMY SETTINGS
    // ========================================================================
    // These control how difficult the enemies are!

    // How often do new enemies appear? (in milliseconds)
    // Lower number = enemies spawn faster = HARDER
    // 1000 = 1 second, so 4000 = 4 seconds between spawns
    // Default: 4000 (one enemy every 4 seconds)
    // Easy: 10000 (every 10 seconds)
    // Hard: 2000 (every 2 seconds!)
    ENEMY_SPAWN_RATE: 1000,

    // Maximum number of enemies at once
    // More enemies = HARDER
    // Default: 50
    // Easy: 10
    // Hard: 250
    MAX_ENEMIES: 50,

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
        mushrooms: 10    // Mushrooms are rare, worth 10 coins
    },

    // How much health each food restores when eaten (press 1, 2, or 3)
    FOOD_HEALING: {
        berries: 5,      // Berries heal 5 health
        nuts: 8,         // Nuts heal 8 health
        mushrooms: 12    // Mushrooms heal 12 health
    },

    // Score points for collecting each resource
    RESOURCE_SCORES: {
        berries: 10,     // 10 points per berry
        nuts: 15,        // 15 points per nut
        mushrooms: 20    // 20 points per mushroom
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
        mushrooms: 0
    },

    // Movement speed (higher = faster)
    PLAYER_WALK_SPEED: 6,
    PLAYER_SPRINT_SPEED: 12,

    // Jump power (higher = jump higher)
    PLAYER_JUMP_POWER: 8,

    // Gravity (higher = fall faster)
    GRAVITY: 20

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
