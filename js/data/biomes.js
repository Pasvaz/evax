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
            south: 'arboreal',         // Go south to return to arboreal
            west: 'snowy_mountains'    // Go west to reach snowy mountains (requires skull!)
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
        toads: 4,  // 2 male, 2 female

        // Grass viper weasels - predators that hunt toads
        spawnGrassVipers: true,
        grassVipers: 2,  // 1 male, 1 female

        // New World Rhubarb Antelope - herd animals at east border
        spawnAntelope: true,
        antelope: 6,  // 3 male, 3 female (one male becomes leader)

        // New World Hunter's Wild Dogs - pack predators at west border
        spawnWildDogs: true,
        wildDogs: 6,  // 3 male, 3 female (first female becomes alpha)

        // Saltas Gazella - fastest animal, rideable
        spawnSaltasGazella: true,
        saltasGazella: 8,  // 4 male, 4 female

        // Dronglous Cat - tree-dwelling predator discovered by Professor Snoutworth
        // Lives in acacia trees, hunts baby gazella, baby antelope, toads, pups, vipers
        spawnDronglousCats: true,
        dronglousCats: 4  // 2 male, 2 female (each gets their own tree)
    },

    // The snowy mountains - homeland of the ancient cats
    snowy_mountains: {
        id: 'snowy_mountains',
        name: 'Snowy Mountains',
        displayName: 'Snowy Mountains',

        // Colors
        groundColor: 0xf0f0f0,         // White snow
        grassColor: 0xe8e8e8,          // Light grey snow
        minimapBackground: '#c0c0c0',  // Light grey

        // Sky
        skyColor: 0x8899aa,            // Grey cloudy sky
        fogColor: 0xaabbcc,            // Light grey fog
        fogDensity: 0.02,              // Thicker fog for snowy atmosphere

        // Water feature
        waterFeature: 'none',          // No water in the mountains (frozen)

        // Transitions
        transitions: {
            east: 'savannah'           // Go east to return to savannah
        },

        // Spawn position when entering this biome
        spawnOffset: {
            fromEast: { x: -10, z: 0 } // 10 units from west border when coming from east
        },

        // Features
        hasVillage: false,
        hasForest: false,
        spawnGeese: false,
        geese: 0,

        // Environmental features
        hasSnow: true,                 // Falling snow particles
        snowParticles: 200,            // Number of snowflakes
        spawnRocks: true,              // Snow-covered rock mounds
        rocks: 15,                     // Number of rocks

        // Deericus Iricus - mountain deer
        spawnDeer: true,
        deer: 2,                       // 2 herds

        // Requirements
        requiresArtifact: 'felis_dronglaticus_skull'  // Need the skull to enter!
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
