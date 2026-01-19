/**
 * ============================================================================
 * ENEMY TYPES - Pure Data File
 * ============================================================================
 *
 * This file contains all the enemy types in the game.
 * Change these values to make enemies easier or harder!
 *
 * ============================================================================
 * HOW ENEMIES WORK
 * ============================================================================
 *
 * 1. Enemies spawn at the edge of the world
 * 2. They wander around randomly until they spot you
 * 3. When you're within DETECTION_RANGE, they chase you!
 * 4. If they touch you, they deal damage every second
 * 5. Run away or hide in the village (it's safe there!)
 *
 * ============================================================================
 * STATS EXPLAINED
 * ============================================================================
 *
 * speed: How fast the enemy moves
 *   - Higher = faster = harder to escape!
 *   - Player walks at 6, sprints at 12
 *   - So speed 4 = can outrun easily, speed 10 = hard to escape!
 *
 * speedVariation: Random bonus to speed
 *   - Adds 0 to this amount randomly
 *   - Makes each enemy slightly different
 *
 * damage: Health lost per second when touching enemy
 *   - Higher = more dangerous!
 *   - 10 = 10% health per second
 *   - 25 = 25% health per second (very dangerous!)
 *
 * radius: How big the enemy's hitbox is
 *   - Bigger = easier to get hit
 *   - Player radius is about 0.5
 *
 * ============================================================================
 * COLOR CODES
 * ============================================================================
 *
 * Colors use 0xRRGGBB format:
 *   0xff0000 = Red       0x00ff00 = Green     0x0000ff = Blue
 *   0xffff00 = Yellow    0x800080 = Purple    0xffa500 = Orange
 *   0x2f2f2f = Dark Gray 0x8b4513 = Brown     0x1a1a1a = Almost Black
 *
 * ============================================================================
 */

window.ENEMY_TYPES = {

    // ========================================================================
    // BADGER
    // ========================================================================
    // Slow but tough! Deals more damage.
    // Visual: Dark gray body with white face stripes, red eyes
    badger: {
        // --------------------------------------------------------------------
        // STATS - How the badger behaves
        // --------------------------------------------------------------------
        speed: 3,                      // Base movement speed (slow)
        speedVariation: 1,             // Random 0-1 added (so 3-4 total)
        damage: 15,                    // Damage per second (high!)
        radius: 0.8,                   // Collision radius (chunky)

        // --------------------------------------------------------------------
        // COLORS - How the badger looks
        // --------------------------------------------------------------------
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
    // WEASEL
    // ========================================================================
    // Fast but weaker! Quick and hard to escape.
    // Visual: Brown body, tan snout, yellow predator eyes
    weasel: {
        // --------------------------------------------------------------------
        // STATS
        // --------------------------------------------------------------------
        speed: 4.5,                    // Base speed (fast!)
        speedVariation: 1.5,           // Random 0-1.5 added (so 4.5-6 total)
        damage: 10,                    // Damage per second (lower than badger)
        radius: 0.6,                   // Collision radius (slim)

        // --------------------------------------------------------------------
        // COLORS
        // --------------------------------------------------------------------
        colors: {
            body: 0x8b4513,            // Saddle brown body
            snout: 0xd2691e,           // Chocolate tan snout
            nose: 0x1a1a1a,            // Black nose
            eyes: 0xffff00,            // Yellow predator eyes
            eyeGlow: 0x333300,         // Yellow eye glow
            ears: 0x8b4513,            // Brown ears
            legs: 0x6b3310             // Darker brown legs
        }
    }

    // ========================================================================
    // ADD MORE ENEMY TYPES HERE!
    // ========================================================================
    //
    // Want to add a new enemy? Here's a template:
    //
    // wolf: {
    //     speed: 5,
    //     speedVariation: 2,
    //     damage: 20,
    //     radius: 1.0,
    //     colors: {
    //         body: 0x808080,        // Gray
    //         snout: 0x606060,
    //         eyes: 0x00ff00,        // Green eyes
    //         eyeGlow: 0x003300,
    //         legs: 0x505050
    //     }
    // }
    //
    // NOTE: Adding a new enemy type also requires adding code in enemies.js
    // to create the 3D model. The data here only stores the stats and colors!

};

// ============================================================================
// DIFFICULTY PRESETS
// ============================================================================
// Quick ways to change game difficulty!
// To use: Copy one preset's values into ENEMY_TYPES above

window.ENEMY_PRESETS = {

    // EASY MODE - Slow enemies, low damage
    easy: {
        badger: { speed: 2, speedVariation: 0.5, damage: 8, radius: 0.8 },
        weasel: { speed: 3, speedVariation: 1, damage: 5, radius: 0.6 }
    },

    // NORMAL MODE - Default settings
    normal: {
        badger: { speed: 3, speedVariation: 1, damage: 15, radius: 0.8 },
        weasel: { speed: 4.5, speedVariation: 1.5, damage: 10, radius: 0.6 }
    },

    // HARD MODE - Fast enemies, high damage!
    hard: {
        badger: { speed: 4, speedVariation: 1.5, damage: 25, radius: 0.8 },
        weasel: { speed: 6, speedVariation: 2, damage: 18, radius: 0.6 }
    },

    // NIGHTMARE MODE - Good luck!
    nightmare: {
        badger: { speed: 5, speedVariation: 2, damage: 35, radius: 1.0 },
        weasel: { speed: 8, speedVariation: 2, damage: 25, radius: 0.7 }
    },

    // PEACEFUL MODE - Enemies don't hurt you (for exploring)
    peaceful: {
        badger: { speed: 2, speedVariation: 0, damage: 0, radius: 0.8 },
        weasel: { speed: 3, speedVariation: 0, damage: 0, radius: 0.6 }
    }
};
