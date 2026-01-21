/**
 * ============================================================================
 * ENEMY DATA - Pure Data File
 * ============================================================================
 *
 * This file defines all enemies that spawn in the game.
 * Each enemy has stats AND colors - everything in one place!
 *
 * ============================================================================
 * HOW TO ADD A NEW ENEMY
 * ============================================================================
 *
 * Just copy an existing enemy and change the values!
 *
 * Example - A giant rare weasel:
 *
 *   {
 *       id: 'giant_weasel',
 *       type: 'weasel',          // Which 3D model to use
 *       speed: 3,
 *       speedVariation: 1,
 *       damage: 20,
 *       radius: 1.0,
 *       size: 1.5,               // 50% bigger!
 *       health: 3,               // Takes 3 hits to kill
 *       spawnWeight: 0.1,        // Very rare (10% as common as normal)
 *       minimapColor: '#ff0000'  // Red dot on minimap
 *   }
 *
 * ============================================================================
 * SPAWN WEIGHT EXPLAINED
 * ============================================================================
 *
 * spawnWeight controls how often each enemy spawns relative to others.
 *
 *   spawnWeight: 1    = Normal (baseline)
 *   spawnWeight: 2    = Twice as common
 *   spawnWeight: 0.5  = Half as common
 *   spawnWeight: 0.1  = Very rare (10% as common)
 *   spawnWeight: 0.01 = Extremely rare (1% as common)
 *
 * Example with 3 enemies:
 *   - Badger (weight 1) + Weasel (weight 1) + Giant (weight 0.1)
 *   - Total weight = 2.1
 *   - Badger spawns 1/2.1 = 47.6% of the time
 *   - Weasel spawns 1/2.1 = 47.6% of the time
 *   - Giant spawns 0.1/2.1 = 4.8% of the time
 *
 * ============================================================================
 */


// ============================================================================
// ENEMIES - All enemies that can spawn in the game
// ============================================================================
//
// STATS EXPLAINED:
//   id: Unique name for this enemy
//   type: Which 3D model to use ('badger' or 'weasel')
//   speed: How fast (player walks at 6, sprints at 12)
//   speedVariation: Random 0 to this amount added to speed
//   damage: Health lost per second when touching
//   radius: Collision hitbox size (player is ~0.5)
//   size: Scale of the 3D model (1 = normal, 2 = double, 0.5 = half)
//   health: Hits to kill (1 = one hit kill)
//   spawnWeight: Spawn frequency (1 = normal, 0.1 = rare, 0.01 = very rare)
//   minimapColor: Color of the dot on the minimap
//   colors: (optional) Custom colors to override the default model colors

window.ENEMIES = [

    // ========================================================================
    // BADGER - Slow but hits hard
    // ========================================================================
    {
        id: 'badger',
        type: 'badger',                // Uses badger 3D model
        speed: 3,                      // Slow (player walks at 6)
        speedVariation: 1,             // Final speed: 3-4
        damage: 15,                    // High damage per second!
        radius: 0.8,                   // Chunky hitbox
        size: 1,                       // Normal size
        health: 17,                     // Dies in one hit
        spawnWeight: 1,                // Normal spawn rate
        minimapColor: '#ff4444',       // Red dot on minimap

        // Badger colors (dark gray with white face stripes)
        colors: {
            body: 0x2f2f2f,            // Dark gray body
            stripes: 0xffffff,         // White face stripes
            snout: 0x1a1a1a,           // Almost black snout
            eyes: 0xff3333,            // Red menacing eyes
            eyeGlow: 0x330000,         // Dark red eye glow
            legs: 0x1a1a1a             // Black legs
        }
    },

    // ========================================================================
    // WEASEL - Fast but weaker
    // ========================================================================
    {
        id: 'weasel',
        type: 'weasel',                // Uses weasel 3D model
        speed: 4.5,                    // Faster than badger
        speedVariation: 1.5,           // Final speed: 4.5-6
        damage: 10,                    // Less damage than badger
        radius: 0.6,                   // Slim hitbox
        size: 1,                       // Normal size
        health: 10,                     // Dies in one hit
        spawnWeight: 1,                // Normal spawn rate
        minimapColor: '#ff8800',       // Orange dot on minimap

        // Weasel colors (brown with yellow eyes)
        colors: {
            body: 0x8b4513,            // Saddle brown body
            snout: 0xd2691e,           // Chocolate tan snout
            nose: 0x1a1a1a,            // Black nose
            eyes: 0xffff00,            // Yellow predator eyes
            eyeGlow: 0x333300,         // Yellow eye glow
            ears: 0x8b4513,            // Brown ears (same as body)
            legs: 0x6b3310             // Darker brown legs
        }
    },

    // ========================================================================
    // GOOSE - Friendly river guardian
    // ========================================================================
    {
        id: 'goose',
        type: 'goose',                 // Uses goose 3D model
        speed: 3,                      // Moderate speed
        speedVariation: 1,             // Final speed: 3-4
        damage: 8,                     // Attacks enemies, not player
        radius: 0.6,                   // Medium hitbox
        size: 1,                       // Normal size
        health: 25,                     // Takes 2 hits
        spawnWeight: 0,                // Does NOT spawn randomly! Spawned on riverbank
        minimapColor: '#ffffaa',       // Light yellow dot (friendly)

        // Special behavior flags
        friendly: true,                // Does NOT attack the player
        attacksEnemies: true,          // Attacks badgers and weasels
        attackRange: 20,               // How close enemies need to be
        immuneToWater: true,           // Not slowed by water

        // Beige/cream goose colors
        colors: {
            body: 0xf5deb3,            // Wheat/beige body
            beak: 0xff8c00,            // Dark orange beak
            eyes: 0x1a1a1a,            // Black eyes
            legs: 0xff8c00,            // Orange legs
            wings: 0xfaebd7            // Antique white wings
        }
    }

    // ========================================================================
    // ADD MORE ENEMIES HERE!
    // ========================================================================
    //
    // Example: A giant rare weasel (just copy and modify!)
    //
    // ,{
    //     id: 'giant_weasel',
    //     type: 'weasel',            // Same 3D model as regular weasel
    //     speed: 3,                  // Slower because it's big
    //     speedVariation: 1,
    //     damage: 20,                // Hits harder!
    //     radius: 1.0,               // Bigger hitbox
    //     size: 1.5,                 // 50% larger model!
    //     health: 3,                 // Takes 3 hits to kill!
    //     spawnWeight: 0.1,          // Very rare! (10% as common)
    //     minimapColor: '#ff0000',   // Red dot (danger!)
    //
    //     // Can use same colors as regular weasel, or customize:
    //     colors: {
    //         body: 0x4a2508,        // Darker brown
    //         snout: 0xd2691e,
    //         nose: 0x1a1a1a,
    //         eyes: 0xff0000,        // Red eyes!
    //         eyeGlow: 0x330000,
    //         ears: 0x4a2508,
    //         legs: 0x3a1800
    //     }
    // }
    //
    // Example: A tiny fast weasel
    //
    // ,{
    //     id: 'tiny_weasel',
    //     type: 'weasel',
    //     speed: 7,                  // Super fast!
    //     speedVariation: 1,
    //     damage: 3,                 // Low damage
    //     radius: 0.3,               // Tiny hitbox
    //     size: 0.5,                 // Half size!
    //     health: 1,
    //     spawnWeight: 0.3,          // Uncommon
    //     minimapColor: '#ffcc00',   // Yellow dot
    //     colors: {
    //         body: 0xd2691e,        // Lighter brown
    //         snout: 0xffa500,
    //         nose: 0x1a1a1a,
    //         eyes: 0xffff00,
    //         eyeGlow: 0x333300,
    //         ears: 0xd2691e,
    //         legs: 0xb8860b
    //     }
    // }
    //
    // Example: An alpha badger boss
    //
    // ,{
    //     id: 'alpha_badger',
    //     type: 'badger',
    //     speed: 4,
    //     speedVariation: 1,
    //     damage: 25,                // Dangerous!
    //     radius: 1.2,
    //     size: 1.8,                 // Almost double size!
    //     health: 5,                 // Very tough!
    //     spawnWeight: 0.05,         // Extremely rare (5% as common)
    //     minimapColor: '#ff0000',
    //     colors: {
    //         body: 0x1a1a1a,        // Almost black
    //         stripes: 0xcccccc,     // Gray stripes
    //         snout: 0x0a0a0a,
    //         eyes: 0xff0000,        // Blood red eyes
    //         eyeGlow: 0x660000,
    //         legs: 0x0a0a0a
    //     }
    // }

];


// ============================================================================
// DIFFICULTY PRESETS
// ============================================================================
// Quick ways to change game difficulty!
// To use: Apply preset values to enemies in your game settings

window.ENEMY_PRESETS = {

    // EASY MODE - Slow enemies, low damage
    easy: {
        speedMultiplier: 0.7,
        damageMultiplier: 0.5
    },

    // NORMAL MODE - Default settings
    normal: {
        speedMultiplier: 1,
        damageMultiplier: 1
    },

    // HARD MODE - Fast enemies, high damage!
    hard: {
        speedMultiplier: 1.3,
        damageMultiplier: 1.5
    },

    // NIGHTMARE MODE - Good luck!
    nightmare: {
        speedMultiplier: 1.6,
        damageMultiplier: 2
    },

    // PEACEFUL MODE - Enemies don't hurt you (for exploring)
    peaceful: {
        speedMultiplier: 0.5,
        damageMultiplier: 0
    }
};
