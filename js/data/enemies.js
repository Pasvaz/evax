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
 * ⚠️  REMINDER: Adding a new animal requires updating 5 FILES:
 *    1. THIS FILE (js/data/enemies.js) - stats and colors
 *    2. js/enemies.js - 3D model builder function
 *    3. js/data/bestiary.js - encyclopedia entry
 *    4. index.html - test spawn buttons
 *    5. js/enemies.js - lifecycle state mapping
 *    See ~/.claude/memory/adding-new-animals.md for full guide!
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
//   category: Animal type - 'carnivore', 'herbivore', or 'omnivore'
//   speed: How fast (player walks at 6, sprints at 12)
//   speedVariation: Random 0 to this amount added to speed
//   damage: Health lost per second when touching
//   radius: Collision hitbox size (player is ~0.5)
//   size: Scale of the 3D model (1 = normal, 2 = double, 0.5 = half)
//   health: Hits to kill (1 = one hit kill)
//   spawnWeight: Spawn frequency (1 = normal, 0.1 = rare, 0.01 = very rare)
//   minimapColor: Color of the dot on the minimap
//   groundY: Y position when on ground (0.3 = normal, 0.05 = flat like snake, -0.1 = swimming)
//   colors: (optional) Custom colors to override the default model colors

window.ENEMIES = [

    // ========================================================================
    // BADGER - Slow but hits hard
    // ========================================================================
    {
        id: 'badger',
        type: 'badger',                // Uses badger 3D model
        category: 'carnivore',         // Predator
        speed: 3,                      // Slow (player walks at 6)
        speedVariation: 1,             // Final speed: 3-4
        chaseSpeed: 7,                 // Sprint speed when chasing player
        damage: 15,                    // High damage per second!
        radius: 0.8,                   // Chunky hitbox
        size: 1,                       // Normal size
        health: 17,                    // Dies in one hit
        spawnWeight: 1,                // Normal spawn rate
        minimapColor: '#ff4444',       // Red dot on minimap
        groundY: 0.25,                 // Low, sturdy body

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
        category: 'carnivore',         // Predator
        speed: 4.5,                    // Faster than badger
        speedVariation: 1.5,           // Final speed: 4.5-6
        chaseSpeed: 9,                 // Sprint speed when chasing player
        damage: 10,                    // Less damage than badger
        radius: 0.6,                   // Slim hitbox
        size: 1,                       // Normal size
        health: 10,                    // Dies in one hit
        spawnWeight: 1,                // Normal spawn rate
        minimapColor: '#ff8800',       // Orange dot on minimap
        groundY: 0.2,                  // Slim, low to ground

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
        category: 'omnivore',          // Eats plants and small animals
        speed: 3,                      // Moderate speed
        speedVariation: 1,             // Final speed: 3-4
        damage: 8,                     // Attacks enemies, not player
        radius: 0.6,                   // Medium hitbox
        size: 1,                       // Normal size
        health: 25,                    // Takes 2 hits
        spawnWeight: 0,                // Does NOT spawn randomly! Spawned on riverbank
        minimapColor: '#ffffaa',       // Light yellow dot (friendly)
        groundY: 0.3,                  // Tall bird, higher center

        // Special behavior flags
        friendly: true,                // Does NOT attack the player
        defendsNest: true,             // Attacks hostile animals near its nest/territory
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
    },

    // ========================================================================
    // FOX - Cunning egg thief
    // ========================================================================
    {
        id: 'fox',
        type: 'fox',                   // Uses fox 3D model
        category: 'carnivore',         // Predator and egg thief
        speed: 4.5,                    // Same as weasel
        speedVariation: 1.5,           // Final speed: 4.5-6
        chaseSpeed: 10,                // Sprint speed when chasing player (fastest predator!)
        damage: 15,                    // Same as badger
        radius: 0.7,                   // Medium hitbox
        size: 1,                       // Normal size
        health: 20,                    // Tougher than weasel
        spawnWeight: 1,                // Less common than badger/weasel
        minimapColor: '#ff6600',       // Orange-red dot on minimap
        groundY: 0.3,                  // Medium height, agile

        // Special behavior flags
        dodgeChance: 0.15,             // 15% chance to dodge attacks
        canStealEggs: true,            // Can steal eggs from nests
        fightsNestGuards: true,        // Will fight back against nest-guarding animals (like geese)

        // Fox colors (orange-red with white chest)
        colors: {
            body: 0xd35400,            // Dark orange body
            chest: 0xffffff,           // White chest/belly
            snout: 0xffffff,           // White snout
            nose: 0x1a1a1a,            // Black nose
            eyes: 0xffaa00,            // Amber eyes
            eyeGlow: 0x331100,         // Amber eye glow
            ears: 0xd35400,            // Orange ears
            earInner: 0x1a1a1a,        // Black inner ears
            legs: 0x1a1a1a,            // Black legs/paws
            tail: 0xd35400,            // Orange tail
            tailTip: 0xffffff          // White tail tip
        }
    }

    // ========================================================================
    // LEOPARD TOAD (MALE) - Yellow with brown spots, savannah biome
    // ========================================================================
    ,{
        id: 'leopard_toad_male',
        type: 'leopard_toad',          // Uses leopard toad 3D model
        category: 'omnivore',          // Eats insects and plants
        speed: 4,                      // Normal hopping speed
        speedVariation: 0.5,           // Final speed: 4-4.5
        fleeSpeed: 15,                 // FAST! Faster than player sprint (12)
        damage: 3,                     // Light damage when defending
        radius: 0.4,                   // Small hitbox
        size: 1,                       // Normal size (still small toad)
        health: 15,                    // Moderate health
        spawnWeight: 0,                // Does NOT spawn randomly! Spawned at watering hole
        minimapColor: '#ffd700',       // Gold dot (male color)
        groundY: 0.1,                  // Very low, flat toad body

        // Special behavior flags
        friendly: true,                // Does NOT attack the player normally
        defendsNest: false,            // Toads don't defend against enemies
        immuneToWater: true,           // Lives in/near water
        biome: 'savannah',             // Only spawns in savannah biome

        // Male leopard toad colors - yellow with brown spots
        colors: {
            body: 0xFFD700,            // Golden yellow body
            spots: 0x4A3728,           // Dark brown spots (10 random spots)
            belly: 0xFFF8DC,           // Cream/cornsilk belly
            eyes: 0x2F2F2F,            // Dark eyes
            eyeBulge: 0xFFE55C,        // Lighter yellow eye bulge
            legs: 0xE6BE00             // Slightly darker yellow legs
        }
    },

    // ========================================================================
    // LEOPARD TOAD (FEMALE) - Black, slightly smaller
    // ========================================================================
    {
        id: 'leopard_toad_female',
        type: 'leopard_toad',          // Uses same leopard toad 3D model
        category: 'omnivore',          // Eats insects and plants
        speed: 4,                      // Same hopping speed
        speedVariation: 0.5,           // Final speed: 4-4.5
        fleeSpeed: 15,                 // Same flee speed
        damage: 5,                     // Stronger when defending eggs!
        radius: 0.35,                  // Slightly smaller hitbox
        size: 0.85,                    // 85% size of male
        health: 12,                    // Slightly less health
        spawnWeight: 0,                // Does NOT spawn randomly!
        minimapColor: '#1a1a1a',       // Black dot (female color)
        groundY: 0.08,                 // Smaller toad, even lower

        // Special behavior flags
        friendly: true,                // Does NOT attack the player normally
        defendsNest: false,            // Toads don't defend against enemies
        immuneToWater: true,           // Lives in/near water
        biome: 'savannah',             // Only spawns in savannah biome
        canLayEggs: true,              // Females lay eggs

        // Female leopard toad colors - black
        colors: {
            body: 0x1A1A1A,            // Black body
            spots: 0x0A0A0A,           // Very dark spots (barely visible)
            belly: 0x2A2A2A,           // Dark gray belly
            eyes: 0x3F3F3F,            // Dark eyes
            eyeBulge: 0x2A2A2A,        // Dark gray eye bulge
            legs: 0x151515             // Very dark legs
        }
    },

    // ========================================================================
    // GRASS VIPER WEASEL (MALE) - Black, savannah predator
    // ========================================================================
    {
        id: 'grass_viper_male',
        type: 'grass_viper',           // Uses grass viper weasel 3D model
        category: 'carnivore',         // Hunts toads
        speed: 5,                      // Faster than regular weasel
        speedVariation: 1,             // Final speed: 5-6
        creepSpeed: 2,                 // Speed when stalking toads
        damage: 12,                    // High damage - can one-shot female toads
        radius: 0.5,                   // Slim hitbox
        size: 0.85,                    // Smaller than regular weasel
        health: 17,                    // Less health than regular weasel (10)
        spawnWeight: 0,                // Does NOT spawn randomly! Spawned in savannah
        minimapColor: '#1a1a1a',       // Black dot (male color)
        groundY: 0.05,                 // Snake-like, almost flat on ground

        // Special behavior flags
        friendly: false,               // Hostile to toads (not player directly)
        biome: 'savannah',             // Only in savannah
        huntRange: 17,                 // Can spot toads from 17 units away
        huntsToads: true,              // Hunts leopard toads
        prefersYoung: true,            // Targets baby toads first

        // Black grass viper colors
        colors: {
            body: 0x0a0a0a,            // Very dark black body
            snout: 0x1a1a1a,           // Slightly lighter snout
            nose: 0x000000,            // Pure black nose
            eyes: 0x33ff33,            // Green predator eyes
            eyeGlow: 0x003300,         // Green eye glow
            ears: 0x0a0a0a,            // Black ears
            legs: 0x050505             // Almost black legs
        }
    },

    // ========================================================================
    // GRASS VIPER WEASEL (FEMALE) - Grey, slightly smaller
    // ========================================================================
    {
        id: 'grass_viper_female',
        type: 'grass_viper',           // Uses same grass viper model
        category: 'carnivore',         // Hunts toads
        speed: 5,                      // Same speed
        speedVariation: 1,             // Final speed: 5-6
        creepSpeed: 2,                 // Speed when stalking
        damage: 12,                    // Same damage
        radius: 0.45,                  // Slightly smaller hitbox
        size: 0.75,                    // Smaller than male (75% vs 85%)
        health: 15,                    // Slightly less health
        spawnWeight: 0,                // Does NOT spawn randomly!
        minimapColor: '#555555',       // Grey dot (female color)
        groundY: 0.04,                 // Even smaller snake, very flat

        // Special behavior flags
        friendly: false,               // Hostile to toads
        biome: 'savannah',             // Only in savannah
        huntRange: 17,                 // Same hunt range
        huntsToads: true,              // Hunts leopard toads
        prefersYoung: true,            // Targets baby toads first
        canGiveBirth: true,            // Can get pregnant and give birth

        // Grey grass viper colors
        colors: {
            body: 0x444444,            // Medium grey body
            snout: 0x555555,           // Slightly lighter snout
            nose: 0x222222,            // Dark grey nose
            eyes: 0x33ff33,            // Same green eyes
            eyeGlow: 0x003300,         // Green eye glow
            ears: 0x444444,            // Grey ears
            legs: 0x333333             // Darker grey legs
        }
    },

    // ========================================================================
    // NEW WORLD RHUBARB ANTELOPE (MALE) - Rhubarb red, has horns
    // ========================================================================
    {
        id: 'antelope_male',
        type: 'antelope',              // Uses hartebeest-style antelope model
        category: 'herbivore',         // Plant eater
        speed: 6,                      // Fast runners
        speedVariation: 1,             // Final speed: 6-7
        damage: 15,                    // Strong kick when defensive
        radius: 1.0,                   // Large hitbox
        size: 1,                       // Normal size
        health: 40,                    // Tough animals
        spawnWeight: 0,                // Does NOT spawn randomly
        minimapColor: '#8B0000',       // Dark red dot
        groundY: 0.5,                  // Tall animal, high center

        // Behavior flags
        friendly: true,                // Friendly until provoked
        defensive: true,               // Will fight back if attacked
        biome: 'savannah',
        isHerdAnimal: true,
        hasHorns: true,                // Males have horns
        hornSize: 1,                   // Normal horn size (leader has 1.5)

        // Rhubarb red male colors
        colors: {
            body: 0x8B2252,            // Rhubarb red (dark pinkish-red)
            belly: 0xA85670,           // Lighter rhubarb underneath
            legs: 0x5C1530,            // Darker red-brown legs
            face: 0x9B3060,            // Face slightly different shade
            muzzle: 0x2A1520,          // Dark muzzle
            horns: 0x3D2817,           // Dark brown horns
            hooves: 0x1A1A1A,          // Black hooves
            eyes: 0x1A1A1A,            // Dark eyes
            ears: 0x8B2252,            // Same as body
            tail: 0x5C1530             // Dark tail tuft
        }
    },

    // ========================================================================
    // NEW WORLD RHUBARB ANTELOPE (FEMALE) - Blue-grey, no horns
    // ========================================================================
    {
        id: 'antelope_female',
        type: 'antelope',              // Same model but no horns
        category: 'herbivore',         // Plant eater
        speed: 6,                      // Same speed
        speedVariation: 1,
        damage: 12,                    // Slightly less damage
        radius: 0.9,                   // Slightly smaller
        size: 0.9,                     // 90% size of male
        health: 35,                    // Slightly less health
        spawnWeight: 0,                // Does NOT spawn randomly
        minimapColor: '#4A5568',       // Blue-grey dot
        groundY: 0.45,                 // Slightly smaller than male

        // Behavior flags
        friendly: true,
        defensive: true,
        biome: 'savannah',
        isHerdAnimal: true,
        hasHorns: false,               // Females don't have horns
        canGetPregnant: true,

        // Blue-grey female colors
        colors: {
            body: 0x4A5568,            // Blue-grey body
            belly: 0x718096,           // Lighter grey underneath
            legs: 0x2D3748,            // Darker grey legs
            face: 0x5A6578,            // Face slightly different shade
            muzzle: 0x1A202C,          // Dark muzzle
            horns: 0x3D2817,           // (not used but included for consistency)
            hooves: 0x1A1A1A,          // Black hooves
            eyes: 0x1A1A1A,            // Dark eyes
            ears: 0x4A5568,            // Same as body
            tail: 0x2D3748             // Dark tail tuft
        }
    },

    // ========================================================================
    // NEW WORLD HUNTER'S WILD DOG - Pack hunting canine with alpha female
    // ========================================================================
    // African wild dog inspired body. Female-led pack structure.
    // Alpha female is golden yellow, leads the pack.
    // Pack hunts antelope together every 8-10 minutes.

    // Male Wild Dog - Brown, larger
    {
        id: 'wild_dog_male',
        type: 'wild_dog',
        category: 'carnivore',         // Pack hunter
        speed: 8,                      // Fast runners
        speedVariation: 1,
        chaseSpeed: 12,                // Sprint when hunting prey
        damage: 18,
        radius: 0.7,
        size: 1,
        health: 30,
        spawnWeight: 0,                // Pack-spawned only
        minimapColor: '#8B4513',       // Brown
        groundY: 0.35,                 // Medium height dog

        friendly: true,                // Friendly unless hunting
        defensive: false,
        biome: 'savannah',
        isPackAnimal: true,

        // Brown male colors with African wild dog patches
        colors: {
            body: 0x8B4513,            // Saddle brown
            belly: 0xD2B48C,           // Tan underbelly
            chest: 0xA0522D,           // Sienna chest
            patches: 0x2F2F2F,         // Dark patches
            patchesLight: 0xFAF0E6,    // Light cream patches
            muzzle: 0x1A1A1A,          // Black muzzle
            nose: 0x000000,
            eyes: 0x4A3728,            // Dark brown eyes
            eyeGlow: 0x1A0A00,
            ears: 0x2A2A2A,            // Dark rounded ears
            earInner: 0xDEB887,        // Lighter inner ear
            legs: 0x1A1A1A,            // Black legs
            paws: 0x2F2F2F,
            tail: 0x8B4513,            // Brown base
            tailTip: 0xFFFFFF          // White tail tip
        }
    },

    // Female Wild Dog - Potato brown, slightly smaller
    {
        id: 'wild_dog_female',
        type: 'wild_dog',
        category: 'carnivore',         // Pack hunter
        speed: 8,
        speedVariation: 1,
        chaseSpeed: 12,                // Sprint when hunting prey
        damage: 16,
        radius: 0.65,                  // Slightly smaller
        size: 0.95,                    // 95% male size
        health: 29,                    // Only 1 less health than male
        spawnWeight: 0,
        minimapColor: '#A0522D',       // Sienna (potato brown)
        groundY: 0.33,                 // Slightly smaller than male

        friendly: true,
        defensive: false,
        biome: 'savannah',
        isPackAnimal: true,
        canGetPregnant: true,

        // Potato brown female colors
        colors: {
            body: 0xA0522D,            // Sienna (potato brown)
            belly: 0xDEB887,           // Burlywood
            chest: 0xB8860B,           // Dark goldenrod chest
            patches: 0x4A3728,         // Dark brown patches
            patchesLight: 0xF5DEB3,    // Wheat color patches
            muzzle: 0x1A1A1A,
            nose: 0x000000,
            eyes: 0x4A3728,
            eyeGlow: 0x1A0A00,
            ears: 0x2A2A2A,
            earInner: 0xCD853F,
            legs: 0x1A1A1A,
            paws: 0x2F2F2F,
            tail: 0xA0522D,
            tailTip: 0xFFFFFF
        }
    },

    // Alpha Female Wild Dog - Golden yellow, pack leader
    {
        id: 'wild_dog_alpha',
        type: 'wild_dog',
        category: 'carnivore',         // Pack leader
        speed: 8,
        speedVariation: 1,
        damage: 20,                    // Alpha is stronger
        radius: 0.68,
        size: 0.97,
        health: 35,
        spawnWeight: 0,
        minimapColor: '#FFD700',       // Gold
        groundY: 0.34,                 // Between male and female

        friendly: true,
        defensive: false,
        biome: 'savannah',
        isPackAnimal: true,
        isAlpha: true,

        // Golden yellow alpha female colors
        colors: {
            body: 0xDAA520,            // Goldenrod
            belly: 0xFFE4B5,           // Moccasin
            chest: 0xFFD700,           // Gold chest
            patches: 0x8B6914,         // Dark goldenrod patches
            patchesLight: 0xFFF8DC,    // Cornsilk patches
            muzzle: 0x1A1A1A,
            nose: 0x000000,
            eyes: 0xB8860B,            // Dark goldenrod eyes
            eyeGlow: 0x332200,
            ears: 0x2A2A2A,
            earInner: 0xF0E68C,        // Khaki
            legs: 0x1A1A1A,
            paws: 0x2F2F2F,
            tail: 0xDAA520,
            tailTip: 0xFFFFFF
        }
    },

    // ========================================================================
    // SALTAS GAZELLA - Fastest animal in the game, rideable
    // ========================================================================
    // Springbok-like body build, extremely fast when fleeing.
    // Both sexes have horns. Can be ridden with a saddle.
    // Males: black with white underbelly
    // Females: creamy yellow with white underbelly
    // Baby males: fully grey
    // Baby females: fully sunflower orange

    // Male Saltas Gazella - Black with white underbelly
    {
        id: 'saltas_gazella_male',
        type: 'saltas_gazella',
        category: 'herbivore',         // Grazer
        speed: 10,                     // Fast base speed
        fleeSpeed: 25,                 // EXTREMELY fast when hunted!
        speedVariation: 1,
        damage: 12,
        radius: 0.8,
        size: 0.85,
        health: 30,
        spawnWeight: 0,                // Herd-spawned only
        minimapColor: '#1a1a1a',       // Black
        groundY: 0.4,                  // Slender gazelle

        friendly: true,
        defensive: true,               // Will fight back if cornered
        biome: 'savannah',
        isHerdAnimal: true,
        gender: 'male',
        hasHorns: true,

        // Black male with white underbelly
        colors: {
            body: 0x1a1a1a,            // Black
            belly: 0xffffff,           // White underbelly
            legs: 0x0d0d0d,            // Darker black legs
            face: 0x1a1a1a,            // Black face
            muzzle: 0x333333,          // Dark grey muzzle
            horns: 0x2a2a2a,           // Dark grey horns
            hooves: 0x1a1a1a,          // Black hooves
            eyes: 0x1a1a1a,            // Dark eyes
            ears: 0x1a1a1a,            // Black ears
            tail: 0x1a1a1a             // Black tail
        }
    },

    // Female Saltas Gazella - Creamy yellow with white underbelly
    {
        id: 'saltas_gazella_female',
        type: 'saltas_gazella',
        category: 'herbivore',         // Grazer
        speed: 10,
        fleeSpeed: 25,
        speedVariation: 1,
        damage: 10,
        radius: 0.75,
        size: 0.8,
        health: 28,
        spawnWeight: 0,
        minimapColor: '#f5deb3',       // Wheat
        groundY: 0.38,                 // Slightly smaller than male

        friendly: true,
        defensive: true,
        biome: 'savannah',
        isHerdAnimal: true,
        gender: 'female',
        hasHorns: true,                // Both sexes have horns
        canGetPregnant: true,

        // Creamy yellow female with white underbelly
        colors: {
            body: 0xf5deb3,            // Creamy yellow (wheat)
            belly: 0xffffff,           // White underbelly
            legs: 0xd4c4a8,            // Slightly darker cream legs
            face: 0xf5deb3,            // Cream face
            muzzle: 0xc4a882,          // Tan muzzle
            horns: 0x8b7355,           // Brown horns
            hooves: 0x1a1a1a,          // Black hooves
            eyes: 0x1a1a1a,            // Dark eyes
            ears: 0xf5deb3,            // Cream ears
            tail: 0xd4c4a8             // Tan tail
        }
    },

    // ========================================================================
    // DRONGLOUS CAT - Tree-dwelling predator (Savannah)
    // ========================================================================
    // Discovered by Professor Snoutworth! Lives in acacia trees.
    // Males: Black, Females: Dull grey (smaller), Baby males: Dark grey, Baby females: White
    // Hunts baby gazella, baby antelope, toads, wild dog pups, and vipers.
    // Only dangerous to peccary if you get too close to babies.

    // Male Dronglous Cat - Black coat
    {
        id: 'dronglous_cat_male',
        type: 'dronglous_cat',
        category: 'carnivore',         // Tree-dwelling predator
        speed: 8,                      // Fast hunter
        speedVariation: 1,
        damage: 12,                    // Moderate damage
        radius: 0.6,                   // Small lynx size
        size: 0.9,                     // Slightly smaller than lynx
        health: 20,
        spawnWeight: 0,                // Spawned via special system, not random
        minimapColor: '#222222',       // Dark dot
        groundY: 0.3,                  // Cat height when on ground
        friendly: false,               // Neutral unless provoked
        gender: 'male',

        colors: {
            body: 0x1a1a1a,            // Black
            belly: 0x2a2a2a,           // Slightly lighter black belly
            face: 0x1a1a1a,            // Black face
            ears: 0x0a0a0a,            // Darker black ears
            earInner: 0x3a2020,        // Dark reddish inner ear
            nose: 0x2a1a1a,            // Dark nose
            eyes: 0xccaa00,            // Golden yellow eyes (cat eyes!)
            eyePupil: 0x111111,        // Dark pupils
            whiskers: 0x444444,        // Grey whiskers
            pawPads: 0x2a1a1a,         // Dark paw pads
            tail: 0x1a1a1a             // Black tail
        }
    },

    // Female Dronglous Cat - Dull grey coat (smaller)
    {
        id: 'dronglous_cat_female',
        type: 'dronglous_cat',
        category: 'carnivore',         // Tree-dwelling predator
        speed: 7,                      // Slightly slower than male
        speedVariation: 1,
        damage: 10,
        radius: 0.5,                   // Smaller than male
        size: 0.75,                    // Noticeably smaller
        health: 15,
        spawnWeight: 0,
        minimapColor: '#666666',       // Grey dot
        groundY: 0.25,                 // Smaller cat
        friendly: false,
        gender: 'female',

        colors: {
            body: 0x5a5a5a,            // Dull grey
            belly: 0x6a6a6a,           // Lighter grey belly
            face: 0x5a5a5a,            // Grey face
            ears: 0x4a4a4a,            // Darker grey ears
            earInner: 0x6a4a4a,        // Pinkish inner ear
            nose: 0x4a3a3a,            // Greyish-pink nose
            eyes: 0xccaa00,            // Golden yellow eyes
            eyePupil: 0x111111,
            whiskers: 0x7a7a7a,        // Light grey whiskers
            pawPads: 0x4a3a3a,
            tail: 0x5a5a5a             // Grey tail
        }
    },

    // Baby Male Dronglous Cat - Dark grey
    {
        id: 'dronglous_cat_baby_male',
        type: 'dronglous_cat',
        category: 'carnivore',         // Baby predator
        speed: 5,                      // Slower baby
        speedVariation: 1,
        damage: 3,                     // Weak
        radius: 0.3,                   // Tiny
        size: 0.4,                     // Small baby
        health: 8,
        spawnWeight: 0,
        minimapColor: '#444444',
        groundY: 0.15,                 // Tiny baby
        friendly: true,                // Babies don't attack
        gender: 'male',
        isBaby: true,

        colors: {
            body: 0x3a3a3a,            // Dark grey
            belly: 0x4a4a4a,           // Lighter grey belly
            face: 0x3a3a3a,
            ears: 0x2a2a2a,
            earInner: 0x5a3a3a,
            nose: 0x3a2a2a,
            eyes: 0x88cc88,            // Baby green-yellow eyes
            eyePupil: 0x111111,
            whiskers: 0x5a5a5a,
            pawPads: 0x3a2a2a,
            tail: 0x3a3a3a
        }
    },

    // Baby Female Dronglous Cat - White
    {
        id: 'dronglous_cat_baby_female',
        type: 'dronglous_cat',
        category: 'carnivore',         // Baby predator
        speed: 5,
        speedVariation: 1,
        damage: 3,
        radius: 0.3,
        size: 0.35,                    // Even smaller than baby male
        health: 6,
        spawnWeight: 0,
        minimapColor: '#cccccc',       // Light dot
        groundY: 0.12,                 // Even tinier baby
        friendly: true,
        gender: 'female',
        isBaby: true,

        colors: {
            body: 0xe8e8e8,            // White
            belly: 0xffffff,           // Pure white belly
            face: 0xe8e8e8,
            ears: 0xd8d8d8,
            earInner: 0xffcccc,        // Pink inner ear
            nose: 0xffaaaa,            // Pink nose
            eyes: 0x88ccff,            // Baby blue eyes
            eyePupil: 0x111111,
            whiskers: 0xcccccc,
            pawPads: 0xffaaaa,         // Pink paw pads
            tail: 0xe8e8e8
        }
    },

    // ========================================================================
    // DEERICUS IRICUS - Tiny furry mountain deer (Snowy Mountains)
    // ========================================================================
    // Small deer that live in burrows in snow mounds. Males are brown with horns,
    // females are white without horns. Live in herds of 2-8. Come out to graze
    // on grass tufts. Babies grow up after 3 minutes. Excess males form bachelor herds.

    // Male Deericus Iricus - Brown with horns
    {
        id: 'deericus_iricus_male',
        type: 'deericus_iricus',
        category: 'herbivore',         // Grazer
        speed: 5,                      // Moderate speed
        speedVariation: 0.5,
        damage: 8,                     // Defensive kicks
        radius: 0.5,                   // Small-medium deer
        size: 0.7,                     // Between fox and gazella
        health: 20,
        spawnWeight: 0,                // Herd-spawned only
        minimapColor: '#8B4513',       // Brown
        groundY: 0.25,                 // Small deer height
        friendly: true,
        defensive: true,
        biome: 'snowy_mountains',
        gender: 'male',
        hasHorns: true,
        isHerdAnimal: true,

        colors: {
            body: 0x8B4513,            // Saddle brown
            belly: 0xD2B48C,           // Tan belly
            legs: 0x6B3410,            // Darker brown legs
            face: 0x8B4513,
            muzzle: 0x5C3A1A,          // Dark muzzle
            horns: 0x4A3020,           // Dark brown horns
            ears: 0x8B4513,
            earInner: 0xFFB6C1,        // Light pink inner ear
            eyes: 0x1a1a1a,            // Dark eyes
            tail: 0x6B3410,            // Dark tail
            fur: 0xA0826D              // Lighter furry texture
        }
    },

    // Female Deericus Iricus - White, no horns
    {
        id: 'deericus_iricus_female',
        type: 'deericus_iricus',
        category: 'herbivore',
        speed: 5,
        speedVariation: 0.5,
        damage: 6,                     // Slightly weaker
        radius: 0.45,
        size: 0.65,                    // Slightly smaller than male
        health: 18,
        spawnWeight: 0,
        minimapColor: '#FFFFFF',       // White
        groundY: 0.23,
        friendly: true,
        defensive: true,
        biome: 'snowy_mountains',
        gender: 'female',
        hasHorns: false,
        isHerdAnimal: true,
        canGetPregnant: true,

        colors: {
            body: 0xFFFFFF,            // Pure white
            belly: 0xF5F5F5,           // Slightly off-white belly
            legs: 0xE8E8E8,            // Light grey legs
            face: 0xFFFFFF,
            muzzle: 0xD3D3D3,          // Light grey muzzle
            horns: 0x4A3020,           // (not used)
            ears: 0xFFFFFF,
            earInner: 0xFFB6C1,        // Light pink inner ear
            eyes: 0x1a1a1a,
            tail: 0xE8E8E8,
            fur: 0xFAFAFA              // Fluffy white
        }
    },

    // Baby Male Deericus Iricus - Ochre (yellowish-brown)
    {
        id: 'deericus_iricus_baby_male',
        type: 'deericus_iricus',
        category: 'herbivore',
        speed: 3,                      // Slower baby
        speedVariation: 0.5,
        damage: 2,                     // Weak
        radius: 0.25,
        size: 0.35,                    // Tiny baby
        health: 10,
        spawnWeight: 0,
        minimapColor: '#CC7722',       // Ochre
        groundY: 0.15,
        friendly: true,
        biome: 'snowy_mountains',
        gender: 'male',
        isBaby: true,
        hasHorns: false,               // Babies don't have horns yet
        isHerdAnimal: true,

        colors: {
            body: 0xCC7722,            // Ochre/yellow-brown
            belly: 0xE6B84D,           // Lighter ochre belly
            legs: 0xAA6610,            // Darker ochre legs
            face: 0xCC7722,
            muzzle: 0x996633,
            horns: 0x4A3020,           // (not used)
            ears: 0xCC7722,
            earInner: 0xFFCCCC,        // Pink inner ear
            eyes: 0x4A3020,            // Brown eyes
            tail: 0xAA6610,
            fur: 0xD4984F              // Fluffy ochre
        }
    },

    // Baby Female Deericus Iricus - Beige
    {
        id: 'deericus_iricus_baby_female',
        type: 'deericus_iricus',
        category: 'herbivore',
        speed: 3,
        speedVariation: 0.5,
        damage: 2,
        radius: 0.23,
        size: 0.33,                    // Slightly smaller than baby male
        health: 9,
        spawnWeight: 0,
        minimapColor: '#F5F5DC',       // Beige
        groundY: 0.14,
        friendly: true,
        biome: 'snowy_mountains',
        gender: 'female',
        isBaby: true,
        hasHorns: false,
        isHerdAnimal: true,

        colors: {
            body: 0xF5F5DC,            // Beige
            belly: 0xFFF8E7,           // Lighter beige belly
            legs: 0xE3D5B8,            // Slightly darker beige legs
            face: 0xF5F5DC,
            muzzle: 0xD9C9A8,
            horns: 0x4A3020,           // (not used)
            ears: 0xF5F5DC,
            earInner: 0xFFCCCC,        // Pink inner ear
            eyes: 0x4A3020,            // Brown eyes
            tail: 0xE3D5B8,
            fur: 0xFAF0E6              // Fluffy beige
        }
    },

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
