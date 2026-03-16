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
            body: "#2F2F2F",            // Dark gray body
            stripes: "#FFFFFF",         // White face stripes
            snout: "#1A1A1A",           // Almost black snout
            eyes: "#FF3333",            // Red menacing eyes
            eyeGlow: "#330000",         // Dark red eye glow
            legs: "#1A1A1A"             // Black legs
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
            body: "#8B4513",            // Saddle brown body
            snout: "#D2691E",           // Chocolate tan snout
            nose: "#1A1A1A",            // Black nose
            eyes: "#FFFF00",            // Yellow predator eyes
            eyeGlow: "#333300",         // Yellow eye glow
            ears: "#8B4513",            // Brown ears (same as body)
            legs: "#6B3310"             // Darker brown legs
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
            body: "#F5DEB3",            // Wheat/beige body
            beak: "#FF8C00",            // Dark orange beak
            eyes: "#1A1A1A",            // Black eyes
            legs: "#FF8C00",            // Orange legs
            wings: "#FAEBD7"            // Antique white wings
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
            body: "#D35400",            // Dark orange body
            chest: "#FFFFFF",           // White chest/belly
            snout: "#FFFFFF",           // White snout
            nose: "#1A1A1A",            // Black nose
            eyes: "#FFAA00",            // Amber eyes
            eyeGlow: "#331100",         // Amber eye glow
            ears: "#D35400",            // Orange ears
            earInner: "#1A1A1A",        // Black inner ears
            legs: "#1A1A1A",            // Black legs/paws
            tail: "#D35400",            // Orange tail
            tailTip: "#FFFFFF"          // White tail tip
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
            body: "#FFD700",            // Golden yellow body
            spots: "#4A3728",           // Dark brown spots (10 random spots)
            belly: "#FFF8DC",           // Cream/cornsilk belly
            eyes: "#2F2F2F",            // Dark eyes
            eyeBulge: "#FFE55C",        // Lighter yellow eye bulge
            legs: "#E6BE00"             // Slightly darker yellow legs
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
            body: "#1A1A1A",            // Black body
            spots: "#0A0A0A",           // Very dark spots (barely visible)
            belly: "#2A2A2A",           // Dark gray belly
            eyes: "#3F3F3F",            // Dark eyes
            eyeBulge: "#2A2A2A",        // Dark gray eye bulge
            legs: "#151515"             // Very dark legs
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
            body: "#0A0A0A",            // Very dark black body
            snout: "#1A1A1A",           // Slightly lighter snout
            nose: "#000000",            // Pure black nose
            eyes: "#33FF33",            // Green predator eyes
            eyeGlow: "#003300",         // Green eye glow
            ears: "#0A0A0A",            // Black ears
            legs: "#050505"             // Almost black legs
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
            body: "#444444",            // Medium grey body
            snout: "#555555",           // Slightly lighter snout
            nose: "#222222",            // Dark grey nose
            eyes: "#33FF33",            // Same green eyes
            eyeGlow: "#003300",         // Green eye glow
            ears: "#444444",            // Grey ears
            legs: "#333333"             // Darker grey legs
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
            body: "#8B2252",            // Rhubarb red (dark pinkish-red)
            belly: "#A85670",           // Lighter rhubarb underneath
            legs: "#5C1530",            // Darker red-brown legs
            face: "#9B3060",            // Face slightly different shade
            muzzle: "#2A1520",          // Dark muzzle
            horns: "#3D2817",           // Dark brown horns
            hooves: "#1A1A1A",          // Black hooves
            eyes: "#1A1A1A",            // Dark eyes
            ears: "#8B2252",            // Same as body
            tail: "#5C1530"             // Dark tail tuft
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
            body: "#4A5568",            // Blue-grey body
            belly: "#718096",           // Lighter grey underneath
            legs: "#2D3748",            // Darker grey legs
            face: "#5A6578",            // Face slightly different shade
            muzzle: "#1A202C",          // Dark muzzle
            horns: "#3D2817",           // (not used but included for consistency)
            hooves: "#1A1A1A",          // Black hooves
            eyes: "#1A1A1A",            // Dark eyes
            ears: "#4A5568",            // Same as body
            tail: "#2D3748"             // Dark tail tuft
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
            body: "#8B4513",            // Saddle brown
            belly: "#D2B48C",           // Tan underbelly
            chest: "#A0522D",           // Sienna chest
            patches: "#2F2F2F",         // Dark patches
            patchesLight: "#FAF0E6",    // Light cream patches
            muzzle: "#1A1A1A",          // Black muzzle
            nose: "#000000",
            eyes: "#4A3728",            // Dark brown eyes
            eyeGlow: "#1A0A00",
            ears: "#2A2A2A",            // Dark rounded ears
            earInner: "#DEB887",        // Lighter inner ear
            legs: "#1A1A1A",            // Black legs
            paws: "#2F2F2F",
            tail: "#8B4513",            // Brown base
            tailTip: "#FFFFFF"          // White tail tip
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
            body: "#A0522D",            // Sienna (potato brown)
            belly: "#DEB887",           // Burlywood
            chest: "#B8860B",           // Dark goldenrod chest
            patches: "#4A3728",         // Dark brown patches
            patchesLight: "#F5DEB3",    // Wheat color patches
            muzzle: "#1A1A1A",
            nose: "#000000",
            eyes: "#4A3728",
            eyeGlow: "#1A0A00",
            ears: "#2A2A2A",
            earInner: "#CD853F",
            legs: "#1A1A1A",
            paws: "#2F2F2F",
            tail: "#A0522D",
            tailTip: "#FFFFFF"
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
            body: "#DAA520",            // Goldenrod
            belly: "#FFE4B5",           // Moccasin
            chest: "#FFD700",           // Gold chest
            patches: "#8B6914",         // Dark goldenrod patches
            patchesLight: "#FFF8DC",    // Cornsilk patches
            muzzle: "#1A1A1A",
            nose: "#000000",
            eyes: "#B8860B",            // Dark goldenrod eyes
            eyeGlow: "#332200",
            ears: "#2A2A2A",
            earInner: "#F0E68C",        // Khaki
            legs: "#1A1A1A",
            paws: "#2F2F2F",
            tail: "#DAA520",
            tailTip: "#FFFFFF"
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
            body: "#1A1A1A",            // Black
            belly: "#FFFFFF",           // White underbelly
            legs: "#0D0D0D",            // Darker black legs
            face: "#1A1A1A",            // Black face
            muzzle: "#333333",          // Dark grey muzzle
            horns: "#2A2A2A",           // Dark grey horns
            hooves: "#1A1A1A",          // Black hooves
            eyes: "#1A1A1A",            // Dark eyes
            ears: "#1A1A1A",            // Black ears
            tail: "#1A1A1A"             // Black tail
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
            body: "#F5DEB3",            // Creamy yellow (wheat)
            belly: "#FFFFFF",           // White underbelly
            legs: "#D4C4A8",            // Slightly darker cream legs
            face: "#F5DEB3",            // Cream face
            muzzle: "#C4A882",          // Tan muzzle
            horns: "#8B7355",           // Brown horns
            hooves: "#1A1A1A",          // Black hooves
            eyes: "#1A1A1A",            // Dark eyes
            ears: "#F5DEB3",            // Cream ears
            tail: "#D4C4A8"             // Tan tail
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
            body: "#1A1A1A",            // Black
            belly: "#2A2A2A",           // Slightly lighter black belly
            face: "#1A1A1A",            // Black face
            ears: "#0A0A0A",            // Darker black ears
            earInner: "#3A2020",        // Dark reddish inner ear
            nose: "#2A1A1A",            // Dark nose
            eyes: "#CCAA00",            // Golden yellow eyes (cat eyes!)
            eyePupil: "#111111",        // Dark pupils
            whiskers: "#444444",        // Grey whiskers
            pawPads: "#2A1A1A",         // Dark paw pads
            tail: "#1A1A1A"             // Black tail
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
            body: "#5A5A5A",            // Dull grey
            belly: "#6A6A6A",           // Lighter grey belly
            face: "#5A5A5A",            // Grey face
            ears: "#4A4A4A",            // Darker grey ears
            earInner: "#6A4A4A",        // Pinkish inner ear
            nose: "#4A3A3A",            // Greyish-pink nose
            eyes: "#CCAA00",            // Golden yellow eyes
            eyePupil: "#111111",
            whiskers: "#7A7A7A",        // Light grey whiskers
            pawPads: "#4A3A3A",
            tail: "#5A5A5A"             // Grey tail
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
            body: "#3A3A3A",            // Dark grey
            belly: "#4A4A4A",           // Lighter grey belly
            face: "#3A3A3A",
            ears: "#2A2A2A",
            earInner: "#5A3A3A",
            nose: "#3A2A2A",
            eyes: "#88CC88",            // Baby green-yellow eyes
            eyePupil: "#111111",
            whiskers: "#5A5A5A",
            pawPads: "#3A2A2A",
            tail: "#3A3A3A"
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
            body: "#E8E8E8",            // White
            belly: "#FFFFFF",           // Pure white belly
            face: "#E8E8E8",
            ears: "#D8D8D8",
            earInner: "#FFCCCC",        // Pink inner ear
            nose: "#FFAAAA",            // Pink nose
            eyes: "#88CCFF",            // Baby blue eyes
            eyePupil: "#111111",
            whiskers: "#CCCCCC",
            pawPads: "#FFAAAA",         // Pink paw pads
            tail: "#E8E8E8"
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
            body: "#8B4513",            // Saddle brown
            belly: "#D2B48C",           // Tan belly
            legs: "#6B3410",            // Darker brown legs
            face: "#8B4513",
            muzzle: "#5C3A1A",          // Dark muzzle
            horns: "#4A3020",           // Dark brown horns
            ears: "#8B4513",
            earInner: "#FFB6C1",        // Light pink inner ear
            eyes: "#1A1A1A",            // Dark eyes
            tail: "#6B3410",            // Dark tail
            fur: "#A0826D"              // Lighter furry texture
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
            body: "#FFFFFF",            // Pure white
            belly: "#F5F5F5",           // Slightly off-white belly
            legs: "#E8E8E8",            // Light grey legs
            face: "#FFFFFF",
            muzzle: "#D3D3D3",          // Light grey muzzle
            horns: "#4A3020",           // (not used)
            ears: "#FFFFFF",
            earInner: "#FFB6C1",        // Light pink inner ear
            eyes: "#1A1A1A",
            tail: "#E8E8E8",
            fur: "#FAFAFA"              // Fluffy white
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
            body: "#CC7722",            // Ochre/yellow-brown
            belly: "#E6B84D",           // Lighter ochre belly
            legs: "#AA6610",            // Darker ochre legs
            face: "#CC7722",
            muzzle: "#996633",
            horns: "#4A3020",           // (not used)
            ears: "#CC7722",
            earInner: "#FFCCCC",        // Pink inner ear
            eyes: "#4A3020",            // Brown eyes
            tail: "#AA6610",
            fur: "#D4984F"              // Fluffy ochre
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
            body: "#F5F5DC",            // Beige
            belly: "#FFF8E7",           // Lighter beige belly
            legs: "#E3D5B8",            // Slightly darker beige legs
            face: "#F5F5DC",
            muzzle: "#D9C9A8",
            horns: "#4A3020",           // (not used)
            ears: "#F5F5DC",
            earInner: "#FFCCCC",        // Pink inner ear
            eyes: "#4A3020",            // Brown eyes
            tail: "#E3D5B8",
            fur: "#FAF0E6"              // Fluffy beige
        }
    },

    // ========================================================================
    // DRONGULINAT CAT - Living relative of Felis Dronglaticus (Snow Biome)
    // ========================================================================
    // Larger than dronglous cat with BIG paws for snow. Males are grey-white,
    // females are pure white. Hunts deer, mates randomly, gives birth to 3 kittens.
    // Only attacks player if provoked (hit first).
    // Baby males are reddish purple, baby females are pumpkin seed green.

    // Male Drongulinat Cat - Grey-white coat
    {
        id: 'drongulinat_cat_male',
        type: 'drongulinat_cat',
        category: 'carnivore',
        speed: 8,
        speedVariation: 1,
        damage: 15,
        radius: 0.7,
        size: 1.1,                     // Larger than dronglous (0.9)
        health: 25,
        spawnWeight: 0,                // Spawned via special system
        minimapColor: '#C0C8D0',
        groundY: 0.33,
        friendly: false,
        gender: 'male',

        colors: {
            body: "#C0C8D0",            // Grey-white
            belly: "#D0D8E0",           // Lighter grey-white belly
            face: "#C0C8D0",
            ears: "#B0B8C0",            // Slightly darker ears
            earInner: "#E8D0D0",        // Pinkish inner ear
            nose: "#3A2A2A",            // Dark nose
            eyes: "#CCAA00",            // Golden yellow eyes (like ancestor)
            eyePupil: "#111111",
            whiskers: "#E8E8E8",        // Light grey whiskers
            pawPads: "#3A2A2A",         // Dark paw pads
            tail: "#C0C8D0"
        }
    },

    // Female Drongulinat Cat - Full white coat
    {
        id: 'drongulinat_cat_female',
        type: 'drongulinat_cat',
        category: 'carnivore',
        speed: 7,
        speedVariation: 1,
        damage: 12,
        radius: 0.6,
        size: 0.95,                    // Slightly smaller than male
        health: 20,
        spawnWeight: 0,
        minimapColor: '#F0F0F0',
        groundY: 0.3,
        friendly: false,
        gender: 'female',
        canGetPregnant: true,

        colors: {
            body: "#F0F0F0",            // Full white
            belly: "#FAFAFA",           // Near-white belly
            face: "#F0F0F0",
            ears: "#E8E8E8",
            earInner: "#FFD0D0",        // Pink inner ear
            nose: "#FFA0A0",            // Pink nose
            eyes: "#CCAA00",            // Golden yellow eyes
            eyePupil: "#111111",
            whiskers: "#FFFFFF",
            pawPads: "#FFA0A0",         // Pink paw pads
            tail: "#F0F0F0"
        }
    },

    // Baby Male Drongulinat Cat - Reddish purple
    {
        id: 'drongulinat_cat_baby_male',
        type: 'drongulinat_cat',
        category: 'carnivore',
        speed: 5,
        speedVariation: 1,
        damage: 3,
        radius: 0.35,
        size: 0.5,
        health: 10,
        spawnWeight: 0,
        minimapColor: '#8B3A62',
        groundY: 0.18,
        friendly: true,                // Babies don't attack
        gender: 'male',
        isBaby: true,

        colors: {
            body: "#8B3A62",            // Reddish purple
            belly: "#9B4A72",           // Lighter reddish purple belly
            face: "#8B3A62",
            ears: "#7B2A52",
            earInner: "#C08090",
            nose: "#5A2040",
            eyes: "#88CC88",            // Baby green-yellow eyes
            eyePupil: "#111111",
            whiskers: "#A05080",
            pawPads: "#5A2040",
            tail: "#8B3A62"
        }
    },

    // Baby Female Drongulinat Cat - Pumpkin seed green
    {
        id: 'drongulinat_cat_baby_female',
        type: 'drongulinat_cat',
        category: 'carnivore',
        speed: 5,
        speedVariation: 1,
        damage: 3,
        radius: 0.33,
        size: 0.45,
        health: 8,
        spawnWeight: 0,
        minimapColor: '#7A9A4A',
        groundY: 0.16,
        friendly: true,
        gender: 'female',
        isBaby: true,

        colors: {
            body: "#7A9A4A",            // Pumpkin seed green
            belly: "#8AAA5A",           // Lighter green belly
            face: "#7A9A4A",
            ears: "#6A8A3A",
            earInner: "#B0C080",
            nose: "#5A7030",
            eyes: "#88CCFF",            // Baby blue eyes
            eyePupil: "#111111",
            whiskers: "#90AA60",
            pawPads: "#5A7030",
            tail: "#7A9A4A"
        }
    },

    // ========================================================================
    // SNOW CANINON LARTUS - XL Bully Pack Dogs (Snowy Mountains)
    // ========================================================================
    // XL bully dog morphology with larger paws for snow. Male-led packs.
    // Males: black, Females: dark grey.
    // Pups: lighter versions (male pups = dark grey, female pups = light grey).
    // Hunt deer in packs, dig dens for pups, interact with drongulinat cats.

    // Male Snow Caninon - Black coat, muscular
    {
        id: 'snow_caninon_male',
        type: 'snow_caninon',
        category: 'carnivore',
        speed: 7,
        speedVariation: 1,
        chaseSpeed: 11,
        damage: 22,
        radius: 0.75,
        size: 1.1,
        health: 40,
        spawnWeight: 0,
        minimapColor: '#0a0a0a',
        groundY: 0.4,

        friendly: true,
        defensive: false,
        biome: 'snowy_mountains',
        isPackAnimal: true,

        colors: {
            body: "#0a0a0a",            // Black body
            belly: "#1a1a1a",           // Very dark grey belly
            chest: "#0f0f0f",           // Near-black chest
            patches: "#000000",         // Pure black patches
            muzzle: "#1a1a1a",          // Dark grey muzzle
            nose: "#000000",            // Black nose
            eyes: "#CC8800",            // Amber eyes
            eyeGlow: "#221100",         // Amber glow
            ears: "#0a0a0a",            // Black ears
            earInner: "#2a1a1a",        // Dark reddish inner ear
            legs: "#050505",            // Near-black legs
            paws: "#1a1a1a",            // Dark grey paws (BIG!)
            tail: "#0a0a0a",            // Black tail
            tailTip: "#2a2a2a"          // Dark grey tail tip
        }
    },

    // Female Snow Caninon - Dark grey coat, slightly smaller
    {
        id: 'snow_caninon_female',
        type: 'snow_caninon',
        category: 'carnivore',
        speed: 7,
        speedVariation: 1,
        chaseSpeed: 11,
        damage: 18,
        radius: 0.7,
        size: 1.0,
        health: 35,
        spawnWeight: 0,
        minimapColor: '#3a3a3a',
        groundY: 0.38,

        friendly: true,
        defensive: false,
        biome: 'snowy_mountains',
        isPackAnimal: true,
        canGetPregnant: true,

        colors: {
            body: "#3a3a3a",            // Dark grey body
            belly: "#4a4a4a",           // Medium grey belly
            chest: "#333333",           // Grey chest
            patches: "#2a2a2a",         // Darker grey patches
            muzzle: "#2a2a2a",          // Dark grey muzzle
            nose: "#000000",            // Black nose
            eyes: "#CC8800",            // Amber eyes
            eyeGlow: "#221100",         // Amber glow
            ears: "#3a3a3a",            // Dark grey ears
            earInner: "#4a3030",        // Greyish-pink inner ear
            legs: "#2a2a2a",            // Dark grey legs
            paws: "#3a3a3a",            // Grey paws (BIG!)
            tail: "#3a3a3a",            // Grey tail
            tailTip: "#4a4a4a"          // Lighter grey tail tip
        }
    },

    // ========================================================================
    // SNOW BALUBAN OXEN - Musk Ox Herds (Snowy Mountains)
    // ========================================================================
    // Largest beast in the game. Musk ox build with shaggy fur skirt.
    // Males: blue-grey, Females: black. Both have horns (males larger).
    // Live in herds of 18 (6M + 12F). Hunted by Snow Caninon packs.
    // Calves: mud brown (males), potato colour (females).

    // Male Baluban Oxen - Blue-grey coat, massive build
    {
        id: 'baluban_oxen_male',
        type: 'baluban_oxen',
        category: 'herbivore',
        speed: 4,
        speedVariation: 0.5,
        chaseSpeed: 7,
        damage: 25,
        radius: 1.1,
        size: 1.2,
        health: 60,
        spawnWeight: 0,
        minimapColor: '#6B7B8B',
        groundY: 0.55,

        friendly: true,
        defensive: true,
        biome: 'snowy_mountains',
        isHerdAnimal: true,
        hasHorns: true,
        hornSize: 1,

        colors: {
            body: "#6B7B8B",            // Blue-grey body
            belly: "#8090A0",           // Lighter blue-grey belly
            chest: "#7A8A9A",           // Slightly lighter chest
            shoulder: "#5A6A7A",        // Darker shoulder hump
            rump: "#6B7B8B",            // Same as body
            muzzle: "#3A4A5A",          // Dark blue-grey muzzle
            nose: "#1A1A1A",            // Black nose
            eyes: "#1A1A1A",            // Dark eyes
            ears: "#5A6A7A",            // Blue-grey ears
            earInner: "#7A6A6A",        // Pinkish inner ear
            legs: "#4A5A6A",            // Darker blue-grey legs
            hooves: "#1A1A1A",          // Black hooves
            horns: "#3D2817",           // Dark brown horns
            tail: "#5A6A7A",            // Blue-grey tail
            skirt: "#4A5A6A"            // Darker shaggy fur skirt
        }
    },

    // Female Baluban Oxen - Black coat, slightly smaller
    {
        id: 'baluban_oxen_female',
        type: 'baluban_oxen',
        category: 'herbivore',
        speed: 4,
        speedVariation: 0.5,
        chaseSpeed: 7,
        damage: 15,
        radius: 1.0,
        size: 1.1,
        health: 50,
        spawnWeight: 0,
        minimapColor: '#1A1A1A',
        groundY: 0.5,

        friendly: true,
        defensive: true,
        biome: 'snowy_mountains',
        isHerdAnimal: true,
        hasHorns: true,
        hornSize: 0.6,
        canGetPregnant: true,

        colors: {
            body: "#1A1A1A",            // Black body
            belly: "#2A2A2A",           // Dark grey belly
            chest: "#222222",           // Near-black chest
            shoulder: "#151515",        // Very dark shoulder
            rump: "#1A1A1A",            // Black rump
            muzzle: "#0D0D0D",          // Near-black muzzle
            nose: "#000000",            // Black nose
            eyes: "#1A1A1A",            // Dark eyes
            ears: "#1A1A1A",            // Black ears
            earInner: "#3A2A2A",        // Dark pinkish inner ear
            legs: "#0D0D0D",            // Near-black legs
            hooves: "#000000",          // Black hooves
            horns: "#2A1A0A",           // Very dark brown horns
            tail: "#151515",            // Dark tail
            skirt: "#0D0D0D"            // Very dark shaggy skirt
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
    //         body: "#4A2508",        // Darker brown
    //         snout: "#D2691E",
    //         nose: "#1A1A1A",
    //         eyes: "#FF0000",        // Red eyes!
    //         eyeGlow: "#330000",
    //         ears: "#4A2508",
    //         legs: "#3A1800"
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
    //         body: "#D2691E",        // Lighter brown
    //         snout: "#FFA500",
    //         nose: "#1A1A1A",
    //         eyes: "#FFFF00",
    //         eyeGlow: "#333300",
    //         ears: "#D2691E",
    //         legs: "#B8860B"
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
    //         body: "#1A1A1A",        // Almost black
    //         stripes: "#CCCCCC",     // Gray stripes
    //         snout: "#0A0A0A",
    //         eyes: "#FF0000",        // Blood red eyes
    //         eyeGlow: "#660000",
    //         legs: "#0A0A0A"
    //     }
    // }

    // =====================================================================
    // URONIN SEALS — Colony marine mammals on ocean islands
    // Descended from the extinct Uronal Seal
    // =====================================================================

    {
        id: 'uronin_seal_male',
        type: 'uronin_seal',
        category: 'herbivore',
        speed: 2,
        speedVariation: 0.5,
        damage: 12,
        radius: 1.0,
        size: 1.2,
        health: 40,
        spawnWeight: 0,
        minimapColor: '#708090',
        groundY: 0.2,
        friendly: true,
        biome: 'coastal',
        gender: 'male',
        isHerdAnimal: true,
        immuneToWater: true,
        colors: {
            body: "#808080",
            belly: "#A0A0A0",
            patches: "#6688AA",
            flippers: "#606060",
            face: "#909090",
            nose: "#2A2A2A",
            whiskers: "#CCCCCC",
            eyes: "#1A1A1A",
            mouth: "#3A3A3A"
        }
    },
    {
        id: 'uronin_seal_female',
        type: 'uronin_seal',
        category: 'herbivore',
        speed: 2,
        speedVariation: 0.5,
        damage: 8,
        radius: 0.85,
        size: 1.0,
        health: 35,
        spawnWeight: 0,
        minimapColor: '#B0B0B0',
        groundY: 0.18,
        friendly: true,
        biome: 'coastal',
        gender: 'female',
        isHerdAnimal: true,
        immuneToWater: true,
        canGetPregnant: true,
        colors: {
            body: "#B0B0B0",
            belly: "#C8C8C8",
            patches: "#E0E0E0",
            flippers: "#909090",
            face: "#B8B8B8",
            nose: "#3A3A3A",
            whiskers: "#DDDDDD",
            eyes: "#1A1A1A",
            mouth: "#4A4A4A"
        }
    },
    {
        id: 'uronin_seal_baby_male',
        type: 'uronin_seal',
        category: 'herbivore',
        speed: 1.5,
        speedVariation: 0.3,
        damage: 1,
        radius: 0.4,
        size: 0.5,
        health: 15,
        spawnWeight: 0,
        minimapColor: '#FFFFFF',
        groundY: 0.1,
        friendly: true,
        biome: 'coastal',
        gender: 'male',
        isBaby: true,
        isHerdAnimal: true,
        immuneToWater: true,
        colors: {
            body: "#F0F0F0",
            belly: "#FFFFFF",
            patches: "#F5F5F5",
            flippers: "#E0E0E0",
            face: "#F0F0F0",
            nose: "#2A2A2A",
            whiskers: "#FFFFFF",
            eyes: "#000000",
            eyeSize: 1.5,
            mouth: "#3A3A3A"
        }
    },
    {
        id: 'uronin_seal_baby_female',
        type: 'uronin_seal',
        category: 'herbivore',
        speed: 1.5,
        speedVariation: 0.3,
        damage: 1,
        radius: 0.35,
        size: 0.45,
        health: 13,
        spawnWeight: 0,
        minimapColor: '#1A1A1A',
        groundY: 0.09,
        friendly: true,
        biome: 'coastal',
        gender: 'female',
        isBaby: true,
        isHerdAnimal: true,
        immuneToWater: true,
        colors: {
            body: "#1A1A1A",
            belly: "#2A2A2A",
            patches: "#222222",
            flippers: "#111111",
            face: "#1A1A1A",
            nose: "#0A0A0A",
            whiskers: "#444444",
            eyes: "#000000",
            eyeSize: 1.5,
            mouth: "#111111"
        }
    },

    // =====================================================================
    // SLITTED SARDINES — Shoaling fish in the coastal ocean
    // Males have a distinctive blue slit along their back
    // =====================================================================

    {
        id: 'slitted_sardine_male',
        type: 'slitted_sardine',
        category: 'fish',
        speed: 2,
        speedVariation: 0.5,
        damage: 0,
        radius: 0.3,
        size: 0.2,
        health: 1,
        spawnWeight: 0,
        minimapColor: '#C0C0C0',
        groundY: -0.5,
        friendly: true,
        biome: 'coastal',
        gender: 'male',
        immuneToWater: true,
        isFish: true,
        colors: {
            body: "#C0C0C0",
            slit: "#4466AA",
            tail: "#A0A0A0",
            eyes: "#1A1A1A",
            fins: "#B0B0B0"
        }
    },
    {
        id: 'slitted_sardine_female',
        type: 'slitted_sardine',
        category: 'fish',
        speed: 2,
        speedVariation: 0.5,
        damage: 0,
        radius: 0.3,
        size: 0.2,
        health: 1,
        spawnWeight: 0,
        minimapColor: '#C0C0C0',
        groundY: -0.5,
        friendly: true,
        biome: 'coastal',
        gender: 'female',
        immuneToWater: true,
        isFish: true,
        colors: {
            body: "#C0C0C0",
            slit: "#C0C0C0",
            tail: "#A0A0A0",
            eyes: "#1A1A1A",
            fins: "#B0B0B0"
        }
    },

    // =====================================================================
    // ORCLETONS — Large solitary fish
    // Males are blue, females are orange
    // =====================================================================

    {
        id: 'orcleton_male',
        type: 'orcleton',
        category: 'fish',
        speed: 1.5,
        speedVariation: 0.3,
        damage: 0,
        radius: 0.5,
        size: 0.6,
        health: 3,
        spawnWeight: 0,
        minimapColor: '#3355AA',
        groundY: -1.0,
        friendly: true,
        biome: 'coastal',
        gender: 'male',
        immuneToWater: true,
        isFish: true,
        colors: {
            body: "#3355AA",
            tail: "#224488",
            fins: "#4466BB",
            eyes: "#1A1A1A",
            belly: "#5577CC"
        }
    },
    {
        id: 'orcleton_female',
        type: 'orcleton',
        category: 'fish',
        speed: 1.5,
        speedVariation: 0.3,
        damage: 0,
        radius: 0.5,
        size: 0.6,
        health: 3,
        spawnWeight: 0,
        minimapColor: '#DD7733',
        groundY: -1.0,
        friendly: true,
        biome: 'coastal',
        gender: 'female',
        immuneToWater: true,
        isFish: true,
        colors: {
            body: "#DD7733",
            tail: "#BB5522",
            fins: "#EE8844",
            eyes: "#1A1A1A",
            belly: "#FFAA66"
        }
    },

    // =====================================================================
    // BAKKA SEALS — Solitary territorial marine mammals
    // Males are beige, females are grey, babies are burgundy/maroon
    // =====================================================================

    {
        id: 'bakka_seal_male',
        type: 'bakka_seal',
        category: 'carnivore',
        speed: 3,
        speedVariation: 0.5,
        chaseSpeed: 4,
        damage: 10,
        radius: 0.85,
        size: 0.9,
        health: 25,
        spawnWeight: 0,
        minimapColor: '#D2B48C',
        groundY: -0.3,
        friendly: false,
        biome: 'coastal',
        gender: 'male',
        immuneToWater: true,
        colors: {
            body: "#D2B48C",
            belly: "#E8D5B0",
            flippers: "#C0A07A",
            face: "#D8C098",
            nose: "#2A2A2A",
            whiskers: "#F0E0C0",
            eyes: "#1A1A1A",
            mouth: "#3A3A3A"
        }
    },
    {
        id: 'bakka_seal_female',
        type: 'bakka_seal',
        category: 'carnivore',
        speed: 3,
        speedVariation: 0.5,
        chaseSpeed: 4,
        damage: 8,
        radius: 0.75,
        size: 0.8,
        health: 20,
        spawnWeight: 0,
        minimapColor: '#808080',
        groundY: -0.3,
        friendly: false,
        biome: 'coastal',
        gender: 'female',
        immuneToWater: true,
        canGetPregnant: true,
        colors: {
            body: "#808080",
            belly: "#9A9A9A",
            flippers: "#6A6A6A",
            face: "#888888",
            nose: "#2A2A2A",
            whiskers: "#BBBBBB",
            eyes: "#1A1A1A",
            mouth: "#3A3A3A"
        }
    },
    {
        id: 'bakka_seal_baby_male',
        type: 'bakka_seal',
        category: 'carnivore',
        speed: 2,
        speedVariation: 0.3,
        damage: 1,
        radius: 0.35,
        size: 0.4,
        health: 8,
        spawnWeight: 0,
        minimapColor: '#800020',
        groundY: -0.3,
        friendly: true,
        biome: 'coastal',
        gender: 'male',
        isBaby: true,
        immuneToWater: true,
        colors: {
            body: "#800020",
            belly: "#992233",
            flippers: "#660018",
            face: "#880022",
            nose: "#1A1A1A",
            whiskers: "#AA4455",
            eyes: "#000000",
            eyeSize: 1.5,
            mouth: "#2A2A2A"
        }
    },
    {
        id: 'bakka_seal_baby_female',
        type: 'bakka_seal',
        category: 'carnivore',
        speed: 2,
        speedVariation: 0.3,
        damage: 1,
        radius: 0.3,
        size: 0.35,
        health: 7,
        spawnWeight: 0,
        minimapColor: '#800000',
        groundY: -0.3,
        friendly: true,
        biome: 'coastal',
        gender: 'female',
        isBaby: true,
        immuneToWater: true,
        colors: {
            body: "#800000",
            belly: "#992222",
            flippers: "#660000",
            face: "#880000",
            nose: "#1A1A1A",
            whiskers: "#AA3333",
            eyes: "#000000",
            eyeSize: 1.5,
            mouth: "#2A2A2A"
        }
    }

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
