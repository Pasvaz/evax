/**
 * ============================================================================
 * BIOMES DATA FILE
 * ============================================================================
 *
 * This file defines all the biomes in the game.
 * Each biome has its own ground color, water features, and settings.
 *
 * To add a new biome:
 *   1. Add a new entry to the BIOMES object
 *   2. Define the biome's properties (colors, features, etc.)
 *   3. Add transitions to/from the biome
 *
 * ============================================================================
 */

window.BIOMES = {
    // The starting forest biome
    arboreal: {
        id: 'arboreal',
        name: 'Arboreal Biome',
        displayName: 'Arboreal Biome',

        // Colors
        groundColor: 0x3d6b3d,        // Forest green
        grassColor: 0x228b22,          // Grass green
        minimapBackground: '#1a3d1a',  // Dark green

        // Water feature
        waterFeature: 'river',         // Has a river

        // Transitions (which direction leads to which biome)
        transitions: {
            north: 'savannah'          // Go north to reach savannah
        },

        // Spawn position when entering this biome
        spawnOffset: {
            fromSouth: { x: 0, z: -10 }  // 10 units from south border when coming from south
        },

        // Features
        hasVillage: true,
        hasForest: true,
        spawnGeese: true,
        geese: 5
    },

    // The new savannah biome
    savannah: {
        id: 'savannah',
        name: 'New World Savannah',
        displayName: 'New World Savannah',

        // Colors
        groundColor: 0xc2a83e,         // Yellow/golden savannah
        grassColor: 0xb8a030,          // Dry grass color
        minimapBackground: '#5a4a1a',  // Dark yellow/brown

        // Water feature
        waterFeature: 'wateringHole',  // Has a watering hole instead of river
        wateringHoleRadius: 7.5,       // 15 diameter = 7.5 radius
        wateringHolePosition: { x: 0, z: 0 },  // Center of map

        // Transitions
        transitions: {
            south: 'arboreal'          // Go south to return to arboreal
        },

        // Spawn position when entering this biome
        spawnOffset: {
            fromNorth: { x: 0, z: 10 } // 10 units from south border when coming from north
        },

        // Features
        hasVillage: false,
        hasForest: false,
        spawnGeese: false,
        geese: 0,

        // Leopard toads live near the watering hole
        spawnToads: true,
        toads: 4  // 2 male, 2 female
    }
};

/**
 * Get the biome data by ID
 * @param {string} biomeId - The biome ID
 * @returns {Object} - The biome data
 */
window.getBiomeData = function(biomeId) {
    return BIOMES[biomeId] || BIOMES.arboreal;
};
