/**
 * ============================================================================
 * PIGON'S SURVIVAL BOARD GAME
 * ============================================================================
 * A turn-based survival duel on a mini forest board.
 * Pick a meeple (Seal, Badger, or Toad), place it on the board,
 * and survive longer than Pigon!
 *
 * Systems: energy, hunger, thirst, health, movement, combat, AI
 * ============================================================================
 */

window.PigonGame = (function() {
    'use strict';

    // ============================================================
    // CONSTANTS
    // ============================================================
    var BOARD_SIZE = 24;
    var TILE_PX = 24; // Each tile = 24px on the 576px canvas
    var CANVAS_SIZE = BOARD_SIZE * TILE_PX; // 576

    var ENERGY_START = 8;
    var ENERGY_REGEN = 2;
    var HUNGER_START = 80;
    var THIRST_START = 80;
    var HUNGER_DRAIN = 6;   // Per turn — slower drain, more time to find food
    var THIRST_DRAIN = 5;   // Per turn — slower drain, more time to find water
    var EAT_COST = 2;       // Energy to eat
    var DRINK_COST = 2;     // Energy to drink
    var EAT_RESTORE = 25;   // Hunger restored
    var DRINK_RESTORE = 25; // Thirst restored
    var MOVE_COST = 1;      // Energy per tile moved (base)
    var ATTACK_RANGE = 2;   // Tiles — how close to attack (melee)
    var TOKEN_REWARD = 5;   // Tavern tokens for winning

    // Terrain types
    var T_GRASS = 0;
    var T_FOREST = 1;
    var T_WATER = 2;
    var T_BERRY = 3;  // Berry bush (herbivore food)
    var T_FISH = 4;   // Fish spot in water (carnivore food)
    var T_ROCK = 5;   // Impassable
    var T_TREE = 6;   // Climbable tree — only climbers can enter
    // Sandstone Valley terrain
    var T_SAND = 7;        // Desert base terrain
    var T_CACTUS = 8;      // Food+water, deals 1 dmg (unless cactusImmune)
    var T_ROCK_MOUND = 9;  // Climbable by climbers only
    var T_POOL = 10;       // Small desert water pool
    // Ancient Prairie terrain
    var T_PRAIRIE = 11;    // Yellow grassland base
    var T_FLOWER = 12;     // Food source (replaces berry)
    var T_TALL_GRASS = 13; // Blocks non-hikers (replaces trees)

    // Great Mountains terrain
    var T_SNOW = 15;          // Snowy base terrain
    var T_SNOW_ROCK = 16;     // Rocky mound — climbers only, bone break risk for others
    var T_PINE = 17;          // Tall pine tree — climbers only
    var T_SNOW_GRASS = 18;    // Tufts of grass on snow — herbivore food
    var T_SNOW_POOL = 19;     // Scarce mountain water pool

    // Grain plant terrain (granivores + herbivores)
    var T_GRAIN = 14;

    var TERRAIN_COLORS = {};
    TERRAIN_COLORS[T_GRASS] = '#5a8a3a';
    TERRAIN_COLORS[T_FOREST] = '#3a6a2a';
    TERRAIN_COLORS[T_WATER] = '#3a6a9a';
    TERRAIN_COLORS[T_BERRY] = '#7a5a8a';
    TERRAIN_COLORS[T_FISH] = '#4a7aaa';
    TERRAIN_COLORS[T_ROCK] = '#6a6a6a';
    TERRAIN_COLORS[T_TREE] = '#2a5a1a';
    TERRAIN_COLORS[T_SAND] = '#d4b483';
    TERRAIN_COLORS[T_CACTUS] = '#c4a060';
    TERRAIN_COLORS[T_ROCK_MOUND] = '#8b7355';
    TERRAIN_COLORS[T_POOL] = '#5b9bd5';
    TERRAIN_COLORS[T_PRAIRIE] = '#c8b44a';
    TERRAIN_COLORS[T_FLOWER] = '#b8a040';
    TERRAIN_COLORS[T_TALL_GRASS] = '#9a8a2a';
    TERRAIN_COLORS[T_GRAIN] = '#d4b44a'; // Golden grain
    TERRAIN_COLORS[T_SNOW] = '#e8e8f0';     // Snowy white
    TERRAIN_COLORS[T_SNOW_ROCK] = '#7a7a8a'; // Grey rock
    TERRAIN_COLORS[T_PINE] = '#2a5a3a';      // Dark green pine
    TERRAIN_COLORS[T_SNOW_GRASS] = '#a8b898'; // Pale grass on snow
    TERRAIN_COLORS[T_SNOW_POOL] = '#6a9ab8';  // Cold mountain water

    // ============================================================
    // MEEPLE DATA
    // ============================================================
    var MEEPLES = {
        seal: {
            id: 'seal', name: 'Seal', icon: '🦭', cls: 'Carnivore',
            color: '#708090',
            health: 8, maxHealth: 8,
            landSpeed: 1,    // Tiles per energy on land
            waterSpeed: 3,   // Tiles per energy in water
            attacks: [
                { name: 'Bite', damage: 3, cost: 3, range: 2, desc: '3 dmg, close range' },
                { name: 'Body Slam', damage: 5, cost: 5, range: 1.5, stun: true, cooldown: 2, desc: '5 dmg + stun, 2 turn cd' }
            ],
            canEat: ['fish', 'meat'],
            desc: 'Medium health. Slow on land, fast swimmer. Catches fish easily.'
        },
        badger: {
            id: 'badger', name: 'Badger', icon: '🦡', cls: 'Carnivore',
            color: '#8B8B7A',
            health: 12, maxHealth: 12,
            landSpeed: 2,
            waterSpeed: 1,
            attacks: [
                { name: 'Claw Swipe', damage: 2, cost: 2, range: 2, desc: '2 dmg, quick and cheap' },
                { name: 'Frenzy', damage: 4, cost: 4, range: 1.5, selfDmg: 1, desc: '4 dmg but take 1 self-damage' }
            ],
            canEat: ['fish', 'meat'],
            desc: 'High health, fast on land. Strong but takes risks with Frenzy.'
        },
        toad: {
            id: 'toad', name: 'Toad', icon: '🐸', cls: 'Herbivore',
            color: '#556B2F',
            health: 6, maxHealth: 6,
            landSpeed: 1.5,
            waterSpeed: 2.5,
            attacks: [
                { name: 'Tongue Lash', damage: 2, cost: 2, range: 5, desc: '2 dmg, LONG range!' },
                { name: 'Poison Spit', damage: 0, cost: 4, range: 4, poison: { dmg: 1, turns: 3 }, desc: '1 dmg/turn for 3 turns' }
            ],
            canEat: ['berry'],
            desc: 'Low health, but ranged attacks. Eats berries. Fast in water.'
        },
        rabbit: {
            id: 'rabbit', name: 'Rabbit', icon: '🐇', cls: 'Herbivore',
            color: '#C4A882',
            health: 5, maxHealth: 5,
            landSpeed: 2,     // Very fast on land
            waterSpeed: 0.5,  // Terrible in water
            hopRange: 4,      // Free hop once per turn
            attacks: [
                { name: 'Kick', damage: 1, cost: 2, range: 1.5, desc: '1 dmg, weak but cheap' },
                { name: 'Scratch', damage: 2, cost: 3, range: 1.5, desc: '2 dmg, close range' }
            ],
            canEat: ['berry'],
            purchasable: true, cost: 5,
            desc: 'Fragile but super fast! Free 4-tile hop once per turn. Terrible swimmer.'
        },
        squirrel: {
            id: 'squirrel', name: 'Squirrel', icon: '🐿️', cls: 'Herbivore',
            color: '#8B5A2B',
            health: 5, maxHealth: 5,
            landSpeed: 1.5,
            waterSpeed: 0.5,
            climber: true,    // Can enter T_TREE tiles — safe from non-climbers!
            attacks: [
                { name: 'Nut Throw', damage: 2, cost: 2, range: 4, desc: '2 dmg, ranged nut toss' },
                { name: 'Acorn Bomb', damage: 3, cost: 5, range: 3, desc: '3 dmg, explosive!' }
            ],
            canEat: ['berry'],
            canEatInTree: true, // Trees count as food source
            purchasable: true, cost: 5,
            desc: 'Can climb trees! Safe from non-climbers in trees. Eats nuts in treetops.'
        },

        // ========== NEW HAPPY FOREST MEEPLES ==========
        green_mamba: {
            id: 'green_mamba', name: 'Green Mamba', icon: '🐍', cls: 'Carnivore',
            color: '#2e8b2e',
            health: 6, maxHealth: 6,
            landSpeed: 2.5, waterSpeed: 1,
            hungerDrainMult: 0.5,  // Half hunger drain
            thirstDrainMult: 0.5,  // Half thirst drain
            attacks: [
                { name: 'Strike', damage: 2, cost: 2, range: 2, desc: '2 dmg, quick' },
                { name: 'Paralysing Bite', damage: 1, cost: 4, range: 1.5, paralyse: true, poison: { dmg: 1, turns: 2 }, cooldown: 2, desc: '1 dmg + poison + paralyse!' }
            ],
            canEat: ['fish', 'meat'],
            purchasable: true, cost: 10,
            desc: 'Fast venomous snake! Slow hunger/thirst drain. Paralysing Bite makes victims miss turns — weaker = more missed turns. Badgers resist paralysis.'
        },
        sleepy_mouse: {
            id: 'sleepy_mouse', name: 'Sleepy Mouse', icon: '🐭', cls: 'Granivore',
            color: '#c8b8a8',
            health: 4, maxHealth: 4,
            landSpeed: 1.5, waterSpeed: 0.5,
            canSleep: true,      // Toggle sleep mode
            sleepDrainMult: 0.3, // Only 30% food/water drain while sleeping
            sleepDmgMult: 1.5,   // Takes 50% MORE damage while sleeping
            attacks: [
                { name: 'Nibble', damage: 1, cost: 2, range: 1.5, desc: '1 dmg, tiny teeth' }
            ],
            canEat: ['grain', 'berry'],
            granivore: true,     // Gets extra food from grain
            desc: 'Tiny granivore! Eats grain plants for big food boost. Can sleep to conserve food/water, but takes more damage while sleeping.'
        },
        stripy_falcon: {
            id: 'stripy_falcon', name: 'Stripy Falcon', icon: '🦅', cls: 'Carnivore',
            color: '#8B6914', biome: 'ancient_prairie',
            health: 5, maxHealth: 5,
            landSpeed: 2, waterSpeed: 0.5,
            canFly: true,       // Toggle flight mode
            flyEnergyCost: 2,   // Costs 2 energy per turn while flying
            attacks: [
                { name: 'Talon Strike', damage: 3, cost: 3, range: 2, desc: '3 dmg, diving attack' },
                { name: 'Sky Dive', damage: 5, cost: 5, range: 3, cooldown: 2, desc: '5 dmg, devastating aerial dive!' }
            ],
            canEat: ['fish', 'meat'],
            purchasable: true, cost: 8,
            desc: 'Aerial predator! Fly to avoid ground attacks — predators ignore you. Costs energy to stay airborne. Deadly dives!'
        },

        // ========== SANDSTONE VALLEY MEEPLES ==========
        spiky_turtle: {
            id: 'spiky_turtle', name: 'Spiky Turtle', icon: '🐢', cls: 'Herbivore',
            color: '#6B8E23', biome: 'sandstone_valley',
            health: 10, maxHealth: 10,
            landSpeed: 1, waterSpeed: 1.5,
            attacks: [
                { name: 'Snap', damage: 2, cost: 2, range: 1.5, desc: '2 dmg, close range' }
            ],
            canEat: ['berry', 'cactus'],
            canHide: true,
            hideReduction: 0.5,
            hideReflect: 2,
            desc: 'Tank! Can hide in shell — takes less damage and hurts attackers. Slow but tough.'
        },
        dune_hare: {
            id: 'dune_hare', name: 'Dune Hare', icon: '🐇', cls: 'Herbivore',
            color: '#C2B280', biome: 'sandstone_valley',
            health: 5, maxHealth: 5,
            landSpeed: 2, waterSpeed: 0.5,
            hopRange: 4,
            attacks: [
                { name: 'Kick', damage: 1, cost: 2, range: 1.5, desc: '1 dmg, weak' },
                { name: 'Sand Kick', damage: 1, cost: 3, range: 2, blind: true, desc: '1 dmg + blind (miss next atk)' }
            ],
            canEat: ['berry', 'cactus'],
            desc: 'Super fast! Free 4-tile hop per turn. Sand Kick blinds opponents.'
        },
        dune_agama: {
            id: 'dune_agama', name: 'Dune Agama', icon: '🦎', cls: 'Carnivore',
            color: '#CD853F', biome: 'sandstone_valley',
            health: 5, maxHealth: 5,
            landSpeed: 2.5, waterSpeed: 0.5,
            climber: true,
            attacks: [
                { name: 'Bite', damage: 2, cost: 2, range: 1.5, desc: '2 dmg, quick' },
                { name: 'Tail Whip', damage: 3, cost: 4, range: 2, desc: '3 dmg, decent' }
            ],
            canEat: ['fish', 'meat'],
            desc: 'Fast carnivore! Climbs rock mounds. Weak health but very mobile.'
        },
        small_camelopin: {
            id: 'small_camelopin', name: 'Small Camelopin', icon: '🦒', cls: 'Herbivore',
            color: '#DAA520', biome: 'sandstone_valley',
            health: 14, maxHealth: 14,
            landSpeed: 1.5, waterSpeed: 1,
            attacks: [
                { name: 'Stomp', damage: 3, cost: 3, range: 1.5, desc: '3 dmg, heavy' },
                { name: 'Head Slam', damage: 5, cost: 5, range: 1.5, desc: '5 dmg, crushing', cooldown: 2 }
            ],
            canEat: ['berry', 'cactus'],
            cactusImmune: true,
            purchasable: true, cost: 8,
            desc: 'Desert tank! 14 HP, eats cacti safely. Slow but hits HARD.'
        },
        desert_felinidon: {
            id: 'desert_felinidon', name: 'Desert Felinidon', icon: '🐆', cls: 'Carnivore',
            color: '#B8860B', biome: 'sandstone_valley',
            health: 8, maxHealth: 8,
            landSpeed: 3, waterSpeed: 0,
            waterFear: true,
            attacks: [
                { name: 'Pounce', damage: 4, cost: 3, range: 3, desc: '4 dmg, long range leap!' },
                { name: 'Fang Strike', damage: 6, cost: 5, range: 1.5, desc: '6 dmg, devastating!', cooldown: 2 }
            ],
            canEat: ['meat'],
            purchasable: true, cost: 10,
            desc: 'Lightning fast predator! Huge damage but CANNOT enter water.'
        },
        desert_fox: {
            id: 'desert_fox', name: 'Desert Fox', icon: '🦊', cls: 'Carnivore',
            color: '#D2691E', biome: 'sandstone_valley',
            health: 6, maxHealth: 6,
            landSpeed: 2.5, waterSpeed: 0.5,
            dashRange: 5, dashIgnoreObstacles: true,
            attacks: [
                { name: 'Slash', damage: 2, cost: 2, range: 1.5, bleed: { dmg: 1, turns: 3 }, desc: '2 dmg + bleed (1/turn for 3 turns)' },
                { name: 'Nip', damage: 1, cost: 1, range: 1.5, desc: '1 dmg, cheap and quick' }
            ],
            canEat: ['fish', 'meat'],
            purchasable: true, cost: 5,
            desc: 'Hit and run! Dash 5 tiles free, attacks cause bleeding. Fragile but elusive.'
        },

        // ========== ANCIENT PRAIRIE MEEPLES ==========
        prairie_hopper: {
            id: 'prairie_hopper', name: 'Prairie Hopper Gazelle', icon: '🦌', cls: 'Herbivore',
            color: '#C4A55A', biome: 'ancient_prairie',
            health: 4, maxHealth: 4,
            landSpeed: 3, waterSpeed: 1,
            hopRange: 4,
            hiker: true,
            attacks: [
                { name: 'Kick', damage: 1, cost: 2, range: 1.5, desc: '1 dmg, weak but fast' }
            ],
            canEat: ['berry', 'flower'],
            desc: 'Blazing fast! 4-tile hop, crosses tall grass. Built to run, not fight.'
        },
        ringitor: {
            id: 'ringitor', name: 'Ringitor', icon: '🐾', cls: 'Herbivore',
            color: '#8B7355', biome: 'ancient_prairie',
            health: 10, maxHealth: 10,
            landSpeed: 1, waterSpeed: 0.5,
            canHide: true, hideReduction: 0.4, hideReflect: 1,
            canMoveWhileHiding: true,
            attacks: [
                { name: 'Scratch', damage: 2, cost: 2, range: 1.5, desc: '2 dmg, close range' },
                { name: 'Tail Smack', damage: 1, cost: 3, range: 1.5, stun: true, desc: '1 dmg + STUN!' }
            ],
            canEat: ['berry', 'flower'],
            desc: 'Armadillo tank! Can move while hiding. Tail Smack stuns predators.'
        },
        black_viper: {
            id: 'black_viper', name: 'Black Viper', icon: '🐍', cls: 'Carnivore',
            color: '#2a2a2a', biome: 'ancient_prairie',
            health: 5, maxHealth: 5,
            landSpeed: 2, waterSpeed: 1.5,
            hiker: true,
            attacks: [
                { name: 'Strike', damage: 2, cost: 2, range: 2, desc: '2 dmg, quick' },
                { name: 'Venomous Bite', damage: 1, cost: 4, range: 1.5, poison: { dmg: 2, turns: 3 }, cooldown: 2, desc: '1 dmg + poison (2/turn for 3 turns)' }
            ],
            canEat: ['fish', 'meat'],
            desc: 'Sneaky snake! Fast, hides in tall grass, Venomous Bite poisons hard.'
        },
        field_chinchinol: {
            id: 'field_chinchinol', name: 'Field Chinchinol', icon: '🐹', cls: 'Herbivore',
            color: '#DEB887', biome: 'ancient_prairie',
            health: 5, maxHealth: 5,
            landSpeed: 2.5, waterSpeed: 0.5,
            dodgeChance: 0.35,
            attacks: [
                { name: 'Nibble', damage: 1, cost: 2, range: 1.5, desc: '1 dmg, weak' },
                { name: 'Quick Scratch', damage: 2, cost: 3, range: 1.5, desc: '2 dmg, decent' }
            ],
            canEat: ['berry', 'flower'],
            purchasable: true, cost: 5,
            desc: 'Tiny and nimble! 35% chance to dodge any attack. Fast but fragile.'
        },
        field_coyoteya: {
            id: 'field_coyoteya', name: 'Field Coyoteya', icon: '🐺', cls: 'Carnivore',
            color: '#8B7D6B', biome: 'ancient_prairie',
            health: 9, maxHealth: 9,
            landSpeed: 2.5, waterSpeed: 1,
            attacks: [
                { name: 'Bite', damage: 3, cost: 3, range: 2, bleed: { dmg: 1, turns: 3 }, desc: '3 dmg + bleed (1/turn for 3 turns)' },
                { name: 'Savage Lunge', damage: 5, cost: 5, range: 2.5, bleed: { dmg: 2, turns: 2 }, cooldown: 2, desc: '5 dmg + heavy bleed! Lethal.' }
            ],
            canEat: ['meat'],
            purchasable: true, cost: 13,
            desc: 'Apex predator! Fast, powerful, bleeds prey dry. The ultimate hunter.'
        },

        // ========== GREAT MOUNTAINS MEEPLES ==========
        mountain_larilatone: {
            id: 'mountain_larilatone', name: 'Mountain Larilatone', icon: '🐐', cls: 'Herbivore',
            color: '#b8a888', biome: 'great_mountains',
            health: 9, maxHealth: 9,
            landSpeed: 1.5, waterSpeed: 0.5,
            climber: true,
            boneBreakImmune: true, // Goats don't break bones on rocks
            attacks: [
                { name: 'Headbutt', damage: 2, cost: 2, range: 1.5, desc: '2 dmg, solid hit' },
                { name: 'Ram', damage: 3, cost: 4, range: 2, knockback: 3, boneBreakChance: 0.4, cooldown: 2, desc: '3 dmg + knockback 3 tiles, may break bones!' }
            ],
            canEat: ['grass', 'berry'],
            desc: 'Mountain goat! Climbs rocks safely, never breaks bones. Ram knocks back small enemies and can break their bones!'
        },
        chocolate_marten: {
            id: 'chocolate_marten', name: 'Chocolate Marten', icon: '🐿️', cls: 'Carnivore',
            color: '#5c3317', biome: 'great_mountains',
            health: 5, maxHealth: 5,
            landSpeed: 3, waterSpeed: 0.5,
            climber: true,
            attacks: [
                { name: 'Nip', damage: 1, cost: 2, range: 1.5, desc: '1 dmg, weak but fast' },
                { name: 'Quick Bite', damage: 2, cost: 3, range: 1.5, desc: '2 dmg, decent' }
            ],
            canEat: ['fish', 'meat'],
            desc: 'Super speedy tree climber! Not great at fighting, but impossible to catch. Hit and run!'
        },
        climbing_cliffa: {
            id: 'climbing_cliffa', name: 'Climbing Cliffa', icon: '🐁', cls: 'Herbivore',
            color: '#c0a080', biome: 'great_mountains',
            health: 3, maxHealth: 3,
            landSpeed: 2.5, waterSpeed: 0.5,
            climber: true,
            boneBreakImmune: true, // Too light to break bones
            attacks: [
                { name: 'Scratch', damage: 1, cost: 2, range: 1.5, desc: '1 dmg, tiny claws' }
            ],
            canEat: ['grass', 'berry'],
            desc: 'Tiny rodent! Super fast, climbs everything, too light to break bones. But very fragile — 3 HP!'
        },
        hopping_terbal: {
            id: 'hopping_terbal', name: 'Hopping Terbal', icon: '🐺', cls: 'Carnivore',
            color: '#6a5a4a', biome: 'great_mountains',
            health: 11, maxHealth: 11,
            landSpeed: 2, waterSpeed: 1,
            hopRange: 3,
            attacks: [
                { name: 'Bite', damage: 3, cost: 3, range: 2, bleed: { dmg: 1, turns: 3 }, desc: '3 dmg + bleed (1/turn for 3 turns)' },
                { name: 'Savage Mauling', damage: 5, cost: 5, range: 1.5, bleed: { dmg: 2, turns: 3 }, cooldown: 2, desc: '5 dmg + heavy bleed! Devastating.' }
            ],
            canEat: ['meat'],
            purchasable: true, cost: 15,
            desc: 'Powerful mountain canid! Fast, tough, bleeds prey. But vulnerable to bone breaks — be careful on rocky terrain!'
        },
        mountain_chinchinol: {
            id: 'mountain_chinchinol', name: 'Mountain Chinchinol', icon: '🐹', cls: 'Herbivore',
            color: '#d0c0a0', biome: 'great_mountains',
            health: 5, maxHealth: 5,
            landSpeed: 2, waterSpeed: 0.5,
            dodgeChance: 0.3,
            thirstSpeedBoost: true, // Gets faster when low on water
            cheapDrink: true,       // Drinking costs 1 energy instead of 2
            attacks: [
                { name: 'Nibble', damage: 1, cost: 2, range: 1.5, desc: '1 dmg, tiny teeth' },
                { name: 'Quick Scratch', damage: 2, cost: 3, range: 1.5, desc: '2 dmg, decent' }
            ],
            canEat: ['grass', 'berry'],
            desc: 'Mountain cousin of the Chinchinol! 30% dodge, gets faster when thirsty, and drinks for only 1 energy.'
        }
    };

    // ============================================================
    // GAME STATE
    // ============================================================
    var isOpen = false;
    var board = [];       // 24x24 terrain grid
    var phase = 'select'; // 'biome_select', 'select', 'place_player', 'place_pigon', 'player_turn', 'ai_turn', 'gameover'
    var player = null;    // { meeple, x, y, health, hunger, thirst, energy, cooldowns, poison }
    var pigon = null;     // same structure
    var opponents = [];   // All AI entities: [{entity, name, personality}]
    var turnOrder = [];   // All entities in play order (randomized): [{entity, name, isPlayer}]
    var currentTurnIndex = 0;
    var currentBiome = 'happy_forest'; // 'happy_forest' or 'sandstone_valley'
    var invitedGossipers = []; // Names of invited gossipers
    var turnNumber = 0;
    var moveTarget = null;  // Where player wants to move (click target)
    var selectedAction = null; // 'move', 'attack1', 'attack2', 'eat', 'drink'
    var logMessages = [];
    var berrySpots = [];  // Track berry spots for regrowth
    var fishSpots = [];   // Track fish spots for regrowth
    var cactusSpots = []; // Track cactus spots for regrowth (sandstone)
    var grainSpots = [];  // Track grain spots for regrowth

    // ============================================================
    // BOARD GENERATION
    // ============================================================
    function generateBoard() {
        if (currentBiome === 'sandstone_valley') {
            generateSandstoneValley();
        } else if (currentBiome === 'ancient_prairie') {
            generateAncientPrairie();
        } else if (currentBiome === 'great_mountains') {
            generateGreatMountains();
        } else {
            generateHappyForest();
        }
    }

    function generateHappyForest() {
        board = [];
        berrySpots = [];
        fishSpots = [];
        grainSpots = [];

        for (var r = 0; r < BOARD_SIZE; r++) {
            board[r] = [];
            for (var c = 0; c < BOARD_SIZE; c++) {
                board[r][c] = T_GRASS;
            }
        }

        // Create a pond/lake in a random area
        var pondCX = 8 + Math.floor(Math.random() * 8);
        var pondCZ = 8 + Math.floor(Math.random() * 8);
        var pondR = 3 + Math.floor(Math.random() * 2);
        for (var r = 0; r < BOARD_SIZE; r++) {
            for (var c = 0; c < BOARD_SIZE; c++) {
                var dx = r - pondCX;
                var dz = c - pondCZ;
                var dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < pondR) {
                    board[r][c] = T_WATER;
                } else if (dist < pondR + 0.5) {
                    // Beach edge — keep as grass
                }
            }
        }

        // Add a stream connecting to edge
        var streamDir = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        if (streamDir === 'horizontal') {
            var sz = pondCZ;
            for (var sc = pondCX + pondR; sc < BOARD_SIZE; sc++) {
                board[sc][sz] = T_WATER;
                if (Math.random() < 0.3 && sz > 0 && sz < BOARD_SIZE - 1) {
                    board[sc][sz + (Math.random() < 0.5 ? -1 : 1)] = T_WATER;
                }
            }
        } else {
            var sr = pondCX;
            for (var sc2 = pondCZ + pondR; sc2 < BOARD_SIZE; sc2++) {
                board[sr][sc2] = T_WATER;
            }
        }

        // Add fish spots in water
        var fishCount = 0;
        for (var r2 = 0; r2 < BOARD_SIZE && fishCount < 3; r2++) {
            for (var c2 = 0; c2 < BOARD_SIZE && fishCount < 3; c2++) {
                if (board[r2][c2] === T_WATER && Math.random() < 0.15) {
                    board[r2][c2] = T_FISH;
                    fishSpots.push({ r: r2, c: c2, eaten: false, regrowTurn: 0 });
                    fishCount++;
                }
            }
        }

        // Add forest clusters
        for (var fc = 0; fc < 5; fc++) {
            var fx = Math.floor(Math.random() * BOARD_SIZE);
            var fz = Math.floor(Math.random() * BOARD_SIZE);
            var fRadius = 2 + Math.floor(Math.random() * 3);
            for (var fr = -fRadius; fr <= fRadius; fr++) {
                for (var fcc = -fRadius; fcc <= fRadius; fcc++) {
                    var nr = fx + fr;
                    var nc = fz + fcc;
                    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                        if (board[nr][nc] === T_GRASS && Math.random() < 0.6) {
                            board[nr][nc] = T_FOREST;
                        }
                    }
                }
            }
        }

        // Add berry bushes (scattered, on grass or forest)
        var berryCount = 0;
        for (var attempt = 0; attempt < 200 && berryCount < 4; attempt++) {
            var br = Math.floor(Math.random() * BOARD_SIZE);
            var bc = Math.floor(Math.random() * BOARD_SIZE);
            if (board[br][bc] === T_GRASS || board[br][bc] === T_FOREST) {
                board[br][bc] = T_BERRY;
                berrySpots.push({ r: br, c: bc, eaten: false, regrowTurn: 0 });
                berryCount++;
            }
        }

        // Add grain plants (common, scattered on grass)
        var grainCount = 0;
        for (var ga = 0; ga < 200 && grainCount < 8; ga++) {
            var gr = Math.floor(Math.random() * BOARD_SIZE);
            var gc = Math.floor(Math.random() * BOARD_SIZE);
            if (board[gr][gc] === T_GRASS) {
                board[gr][gc] = T_GRAIN;
                grainSpots.push({ r: gr, c: gc, eaten: false, regrowTurn: 0 });
                grainCount++;
            }
        }

        // Add some rocks (impassable)
        for (var ri = 0; ri < 8; ri++) {
            var rr = Math.floor(Math.random() * BOARD_SIZE);
            var rc = Math.floor(Math.random() * BOARD_SIZE);
            if (board[rr][rc] === T_GRASS) {
                board[rr][rc] = T_ROCK;
            }
        }

        // Add climbable trees (scattered in forest areas)
        var treeCount = 0;
        for (var ti = 0; ti < BOARD_SIZE && treeCount < 10; ti++) {
            for (var tj = 0; tj < BOARD_SIZE && treeCount < 10; tj++) {
                if (board[ti][tj] === T_FOREST && Math.random() < 0.08) {
                    board[ti][tj] = T_TREE;
                    treeCount++;
                }
            }
        }
    }

    function generateSandstoneValley() {
        board = [];
        berrySpots = [];
        fishSpots = [];
        cactusSpots = [];

        // Fill with sand
        for (var r = 0; r < BOARD_SIZE; r++) {
            board[r] = [];
            for (var c = 0; c < BOARD_SIZE; c++) {
                board[r][c] = T_SAND;
            }
        }

        // 3-4 small pools scattered around
        var poolCount = 3 + Math.floor(Math.random() * 2);
        for (var pi = 0; pi < poolCount; pi++) {
            var px = 4 + Math.floor(Math.random() * (BOARD_SIZE - 8));
            var pz = 4 + Math.floor(Math.random() * (BOARD_SIZE - 8));
            var pRadius = 1 + Math.random() * 1.5;
            for (var pr = 0; pr < BOARD_SIZE; pr++) {
                for (var pc = 0; pc < BOARD_SIZE; pc++) {
                    var dx = pr - px;
                    var dz = pc - pz;
                    if (Math.sqrt(dx * dx + dz * dz) < pRadius) {
                        board[pr][pc] = T_POOL;
                    }
                }
            }
            // Add fish in some pools
            if (Math.random() < 0.6) {
                var fishR = Math.round(px);
                var fishC = Math.round(pz);
                if (fishR >= 0 && fishR < BOARD_SIZE && fishC >= 0 && fishC < BOARD_SIZE && board[fishR][fishC] === T_POOL) {
                    board[fishR][fishC] = T_FISH;
                    fishSpots.push({ r: fishR, c: fishC, eaten: false, regrowTurn: 0 });
                }
            }
        }

        // Rock mound clusters (replace trees — climbable terrain)
        for (var mc = 0; mc < 4; mc++) {
            var mx = Math.floor(Math.random() * BOARD_SIZE);
            var mz = Math.floor(Math.random() * BOARD_SIZE);
            var mRadius = 1 + Math.floor(Math.random() * 2);
            for (var mr = -mRadius; mr <= mRadius; mr++) {
                for (var mcc = -mRadius; mcc <= mRadius; mcc++) {
                    var nr = mx + mr;
                    var nc = mz + mcc;
                    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                        if (board[nr][nc] === T_SAND && Math.random() < 0.5) {
                            board[nr][nc] = T_ROCK_MOUND;
                        }
                    }
                }
            }
        }

        // Cacti (food+water source, 6-8 scattered)
        var cactusCount = 0;
        for (var attempt = 0; attempt < 200 && cactusCount < 7; attempt++) {
            var cr = Math.floor(Math.random() * BOARD_SIZE);
            var cc = Math.floor(Math.random() * BOARD_SIZE);
            if (board[cr][cc] === T_SAND) {
                board[cr][cc] = T_CACTUS;
                cactusSpots.push({ r: cr, c: cc, eaten: false, regrowTurn: 0 });
                cactusCount++;
            }
        }

        // Scattered rocks (impassable)
        for (var ri = 0; ri < 6; ri++) {
            var rr = Math.floor(Math.random() * BOARD_SIZE);
            var rc = Math.floor(Math.random() * BOARD_SIZE);
            if (board[rr][rc] === T_SAND) {
                board[rr][rc] = T_ROCK;
            }
        }
    }

    function generateAncientPrairie() {
        board = [];
        berrySpots = [];
        fishSpots = [];
        cactusSpots = [];

        // Fill with prairie grass
        for (var r = 0; r < BOARD_SIZE; r++) {
            board[r] = [];
            for (var c = 0; c < BOARD_SIZE; c++) {
                board[r][c] = T_PRAIRIE;
            }
        }

        // One central body of water (lake)
        var lakeX = 10 + Math.floor(Math.random() * 4);
        var lakeZ = 10 + Math.floor(Math.random() * 4);
        var lakeR = 3 + Math.random() * 2;
        for (var r2 = 0; r2 < BOARD_SIZE; r2++) {
            for (var c2 = 0; c2 < BOARD_SIZE; c2++) {
                var dx = r2 - lakeX;
                var dz = c2 - lakeZ;
                if (Math.sqrt(dx * dx + dz * dz) < lakeR) {
                    board[r2][c2] = T_WATER;
                }
            }
        }

        // Fish in the lake
        var fishCount = 0;
        for (var fr = 0; fr < BOARD_SIZE && fishCount < 3; fr++) {
            for (var fc = 0; fc < BOARD_SIZE && fishCount < 3; fc++) {
                if (board[fr][fc] === T_WATER && Math.random() < 0.12) {
                    board[fr][fc] = T_FISH;
                    fishSpots.push({ r: fr, c: fc, eaten: false, regrowTurn: 0 });
                    fishCount++;
                }
            }
        }

        // Tall grass clusters (blocks non-hikers, like trees)
        for (var gc = 0; gc < 6; gc++) {
            var gx = Math.floor(Math.random() * BOARD_SIZE);
            var gz = Math.floor(Math.random() * BOARD_SIZE);
            var gRadius = 1 + Math.floor(Math.random() * 2);
            for (var gr = -gRadius; gr <= gRadius; gr++) {
                for (var gcc = -gRadius; gcc <= gRadius; gcc++) {
                    var nr = gx + gr;
                    var nc = gz + gcc;
                    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                        if (board[nr][nc] === T_PRAIRIE && Math.random() < 0.55) {
                            board[nr][nc] = T_TALL_GRASS;
                        }
                    }
                }
            }
        }

        // Flowers (food source, scattered)
        var flowerCount = 0;
        for (var attempt = 0; attempt < 200 && flowerCount < 6; attempt++) {
            var br = Math.floor(Math.random() * BOARD_SIZE);
            var bc = Math.floor(Math.random() * BOARD_SIZE);
            if (board[br][bc] === T_PRAIRIE) {
                board[br][bc] = T_FLOWER;
                berrySpots.push({ r: br, c: bc, eaten: false, regrowTurn: 0, type: T_FLOWER });
                flowerCount++;
            }
        }

        // Scattered rocks
        for (var ri = 0; ri < 5; ri++) {
            var rr = Math.floor(Math.random() * BOARD_SIZE);
            var rc = Math.floor(Math.random() * BOARD_SIZE);
            if (board[rr][rc] === T_PRAIRIE) {
                board[rr][rc] = T_ROCK;
            }
        }
    }

    function generateGreatMountains() {
        board = [];
        berrySpots = [];
        fishSpots = [];

        // Fill with snow base
        for (var r = 0; r < BOARD_SIZE; r++) {
            board[r] = [];
            for (var c = 0; c < BOARD_SIZE; c++) {
                board[r][c] = T_SNOW;
            }
        }

        // Multi-tile rocky mounds (3-5 clusters, each 2-4 tiles wide)
        for (var rm = 0; rm < 5; rm++) {
            var rx = 2 + Math.floor(Math.random() * (BOARD_SIZE - 4));
            var ry = 2 + Math.floor(Math.random() * (BOARD_SIZE - 4));
            var rSize = 2 + Math.floor(Math.random() * 2); // 2-3 radius
            for (var dr = -rSize; dr <= rSize; dr++) {
                for (var dc = -rSize; dc <= rSize; dc++) {
                    var nr = ry + dr;
                    var nc = rx + dc;
                    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                        var d = Math.sqrt(dr * dr + dc * dc);
                        if (d < rSize && Math.random() < 0.7) {
                            board[nr][nc] = T_SNOW_ROCK;
                        }
                    }
                }
            }
        }

        // Pine tree clusters (tall towering pines)
        for (var pc = 0; pc < 6; pc++) {
            var px = Math.floor(Math.random() * BOARD_SIZE);
            var py = Math.floor(Math.random() * BOARD_SIZE);
            var pRad = 2 + Math.floor(Math.random() * 2);
            for (var pr = -pRad; pr <= pRad; pr++) {
                for (var pcc = -pRad; pcc <= pRad; pcc++) {
                    var pnr = py + pr;
                    var pnc = px + pcc;
                    if (pnr >= 0 && pnr < BOARD_SIZE && pnc >= 0 && pnc < BOARD_SIZE) {
                        if (board[pnr][pnc] === T_SNOW && Math.random() < 0.5) {
                            board[pnr][pnc] = T_PINE;
                        }
                    }
                }
            }
        }

        // Scattered grass tufts (herbivore food)
        var grassCount = 0;
        for (var ga = 0; ga < 300 && grassCount < 10; ga++) {
            var gr = Math.floor(Math.random() * BOARD_SIZE);
            var gc = Math.floor(Math.random() * BOARD_SIZE);
            if (board[gr][gc] === T_SNOW) {
                board[gr][gc] = T_SNOW_GRASS;
                berrySpots.push({ r: gr, c: gc, eaten: false, regrowTurn: 0, type: T_SNOW_GRASS });
                grassCount++;
            }
        }

        // Scarce water pools (only 2-3)
        var poolCount = 0;
        for (var pa = 0; pa < 200 && poolCount < 3; pa++) {
            var pr2 = Math.floor(Math.random() * BOARD_SIZE);
            var pc2 = Math.floor(Math.random() * BOARD_SIZE);
            if (board[pr2][pc2] === T_SNOW) {
                board[pr2][pc2] = T_SNOW_POOL;
                poolCount++;
                // Add 1-2 adjacent pool tiles
                if (pc2 + 1 < BOARD_SIZE && board[pr2][pc2 + 1] === T_SNOW) {
                    board[pr2][pc2 + 1] = T_SNOW_POOL;
                }
            }
        }

        // Fish in pools
        var fCount = 0;
        for (var fr = 0; fr < BOARD_SIZE && fCount < 2; fr++) {
            for (var fc = 0; fc < BOARD_SIZE && fCount < 2; fc++) {
                if (board[fr][fc] === T_SNOW_POOL && Math.random() < 0.3) {
                    board[fr][fc] = T_FISH;
                    fishSpots.push({ r: fr, c: fc, eaten: false, regrowTurn: 0 });
                    fCount++;
                }
            }
        }

        // Some impassable rocks
        for (var ri = 0; ri < 6; ri++) {
            var rr = Math.floor(Math.random() * BOARD_SIZE);
            var rc = Math.floor(Math.random() * BOARD_SIZE);
            if (board[rr][rc] === T_SNOW) board[rr][rc] = T_ROCK;
        }
    }

    // ============================================================
    // RENDERING
    // ============================================================
    function render() {
        var canvas = document.getElementById('pigon-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');

        // Draw terrain
        for (var r = 0; r < BOARD_SIZE; r++) {
            for (var c = 0; c < BOARD_SIZE; c++) {
                var t = board[r][c];
                ctx.fillStyle = TERRAIN_COLORS[t] || '#5a8a3a';
                ctx.fillRect(c * TILE_PX, r * TILE_PX, TILE_PX, TILE_PX);
                // Grid lines (subtle)
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.strokeRect(c * TILE_PX, r * TILE_PX, TILE_PX, TILE_PX);

                // Draw berry bush icon
                if (t === T_BERRY) {
                    ctx.fillStyle = '#cc44aa';
                    ctx.beginPath();
                    ctx.arc(c * TILE_PX + TILE_PX / 2, r * TILE_PX + TILE_PX / 2, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#44aa44';
                    ctx.beginPath();
                    ctx.arc(c * TILE_PX + TILE_PX / 2 - 3, r * TILE_PX + TILE_PX / 2 - 4, 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw fish icon
                if (t === T_FISH) {
                    ctx.fillStyle = '#ffaa44';
                    ctx.beginPath();
                    ctx.ellipse(c * TILE_PX + TILE_PX / 2, r * TILE_PX + TILE_PX / 2, 6, 3, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw rock
                if (t === T_ROCK) {
                    ctx.fillStyle = '#555';
                    ctx.beginPath();
                    ctx.arc(c * TILE_PX + TILE_PX / 2, r * TILE_PX + TILE_PX / 2, 8, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw climbable tree
                if (t === T_TREE) {
                    // Trunk
                    ctx.fillStyle = '#5a3a1a';
                    ctx.fillRect(c * TILE_PX + 9, r * TILE_PX + 10, 6, 14);
                    // Foliage (layered circles for 3D look)
                    ctx.fillStyle = '#2a7a1a';
                    ctx.beginPath();
                    ctx.arc(c * TILE_PX + 12, r * TILE_PX + 8, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#3a8a2a';
                    ctx.beginPath();
                    ctx.arc(c * TILE_PX + 10, r * TILE_PX + 6, 5, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw grain plant
                if (t === T_GRAIN) {
                    var gx = c * TILE_PX + TILE_PX / 2;
                    var gy = r * TILE_PX + TILE_PX / 2;
                    ctx.strokeStyle = '#9a7a2a';
                    ctx.lineWidth = 1;
                    // Three stalks
                    for (var gs = -3; gs <= 3; gs += 3) {
                        ctx.beginPath(); ctx.moveTo(gx + gs, gy + 8); ctx.lineTo(gx + gs, gy - 4); ctx.stroke();
                        // Grain head
                        ctx.fillStyle = '#e8c040';
                        ctx.beginPath(); ctx.ellipse(gx + gs, gy - 6, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
                    }
                }

                // Draw pine tree
                if (t === T_PINE) {
                    var pnx = c * TILE_PX + TILE_PX / 2;
                    var pny = r * TILE_PX + TILE_PX / 2;
                    // Dark trunk
                    ctx.fillStyle = '#4a3020';
                    ctx.fillRect(pnx - 2, pny + 2, 4, 10);
                    // Triangular pine foliage (3 layers)
                    ctx.fillStyle = '#1a5a2a';
                    ctx.beginPath(); ctx.moveTo(pnx, pny - 10); ctx.lineTo(pnx - 7, pny); ctx.lineTo(pnx + 7, pny); ctx.fill();
                    ctx.fillStyle = '#2a6a3a';
                    ctx.beginPath(); ctx.moveTo(pnx, pny - 7); ctx.lineTo(pnx - 6, pny + 2); ctx.lineTo(pnx + 6, pny + 2); ctx.fill();
                    ctx.fillStyle = '#1a5530';
                    ctx.beginPath(); ctx.moveTo(pnx, pny - 4); ctx.lineTo(pnx - 5, pny + 5); ctx.lineTo(pnx + 5, pny + 5); ctx.fill();
                    // Snow cap
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.moveTo(pnx, pny - 10); ctx.lineTo(pnx - 3, pny - 6); ctx.lineTo(pnx + 3, pny - 6); ctx.fill();
                }

                // Draw snow grass tuft
                if (t === T_SNOW_GRASS) {
                    var sgx = c * TILE_PX + TILE_PX / 2;
                    var sgy = r * TILE_PX + TILE_PX / 2;
                    ctx.strokeStyle = '#6a8a5a';
                    ctx.lineWidth = 1.5;
                    for (var gi = -3; gi <= 3; gi += 2) {
                        ctx.beginPath(); ctx.moveTo(sgx + gi, sgy + 5); ctx.lineTo(sgx + gi + 1, sgy - 3); ctx.stroke();
                    }
                }

                // Draw snow rock mound
                if (t === T_SNOW_ROCK) {
                    var srx = c * TILE_PX + TILE_PX / 2;
                    var sry = r * TILE_PX + TILE_PX / 2;
                    // Dark rocky base
                    ctx.fillStyle = '#5a5a6a';
                    ctx.beginPath();
                    ctx.moveTo(srx - 8, sry + 6); ctx.lineTo(srx - 4, sry - 6); ctx.lineTo(srx + 2, sry - 8);
                    ctx.lineTo(srx + 7, sry - 3); ctx.lineTo(srx + 9, sry + 6); ctx.closePath();
                    ctx.fill();
                    // Snow on top
                    ctx.fillStyle = '#e0e0ee';
                    ctx.beginPath();
                    ctx.moveTo(srx - 4, sry - 4); ctx.lineTo(srx, sry - 8); ctx.lineTo(srx + 5, sry - 4); ctx.closePath();
                    ctx.fill();
                }

                // Draw snow pool
                if (t === T_SNOW_POOL) {
                    ctx.fillStyle = '#5a8aaa';
                    ctx.beginPath();
                    ctx.ellipse(c * TILE_PX + TILE_PX / 2, r * TILE_PX + TILE_PX / 2, 8, 6, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Ice edge
                    ctx.strokeStyle = '#c0d8e8';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Draw cactus
                if (t === T_CACTUS) {
                    var cx = c * TILE_PX + TILE_PX / 2;
                    var cy = r * TILE_PX + TILE_PX / 2;
                    // Main trunk
                    ctx.fillStyle = '#2d7a2d';
                    ctx.fillRect(cx - 2, cy - 8, 4, 16);
                    // Left arm
                    ctx.fillRect(cx - 7, cy - 4, 5, 3);
                    ctx.fillRect(cx - 7, cy - 7, 3, 6);
                    // Right arm
                    ctx.fillRect(cx + 2, cy - 1, 5, 3);
                    ctx.fillRect(cx + 4, cy - 5, 3, 7);
                    // Spines (tiny dots)
                    ctx.fillStyle = '#aacc44';
                    ctx.fillRect(cx - 1, cy - 6, 1, 1);
                    ctx.fillRect(cx + 1, cy - 3, 1, 1);
                    ctx.fillRect(cx - 5, cy - 5, 1, 1);
                    ctx.fillRect(cx + 5, cy - 3, 1, 1);
                }

                // Draw rock mound (climbable)
                if (t === T_ROCK_MOUND) {
                    var rx = c * TILE_PX + TILE_PX / 2;
                    var ry = r * TILE_PX + TILE_PX / 2;
                    // Layered rocks
                    ctx.fillStyle = '#7a6a50';
                    ctx.beginPath();
                    ctx.arc(rx, ry + 3, 9, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#8b7b60';
                    ctx.beginPath();
                    ctx.arc(rx - 2, ry - 1, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#9a8a70';
                    ctx.beginPath();
                    ctx.arc(rx + 2, ry - 4, 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw desert pool
                if (t === T_POOL) {
                    ctx.fillStyle = 'rgba(100,180,230,0.3)';
                    ctx.beginPath();
                    ctx.arc(c * TILE_PX + TILE_PX / 2 - 2, r * TILE_PX + TILE_PX / 2 - 2, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw flower
                if (t === T_FLOWER) {
                    var fx = c * TILE_PX + TILE_PX / 2;
                    var fy = r * TILE_PX + TILE_PX / 2;
                    // Stem
                    ctx.strokeStyle = '#4a8a2a';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(fx, fy + 6); ctx.lineTo(fx, fy - 2);
                    ctx.stroke();
                    ctx.lineWidth = 1;
                    // Petals
                    var petalColors = ['#ff6688', '#ffaa44', '#ff44aa', '#ff8866', '#ffcc55'];
                    var pc = petalColors[((r * 7 + c * 3) % petalColors.length)];
                    ctx.fillStyle = pc;
                    for (var pi = 0; pi < 5; pi++) {
                        var angle = (pi / 5) * Math.PI * 2;
                        ctx.beginPath();
                        ctx.arc(fx + Math.cos(angle) * 3, fy - 2 + Math.sin(angle) * 3, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    // Center
                    ctx.fillStyle = '#ffee44';
                    ctx.beginPath();
                    ctx.arc(fx, fy - 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw tall grass
                if (t === T_TALL_GRASS) {
                    var gx = c * TILE_PX + TILE_PX / 2;
                    var gy = r * TILE_PX + TILE_PX / 2;
                    ctx.strokeStyle = '#6a7a1a';
                    ctx.lineWidth = 1.5;
                    // Several grass blades
                    [-4, -2, 0, 2, 4].forEach(function(offset) {
                        ctx.beginPath();
                        ctx.moveTo(gx + offset, gy + 8);
                        ctx.quadraticCurveTo(gx + offset + (offset > 0 ? 2 : -2), gy - 4, gx + offset, gy - 8);
                        ctx.stroke();
                    });
                    ctx.lineWidth = 1;
                }
            }
        }

        // Draw movement range highlight when move is selected
        if (selectedAction === 'move' && phase === 'player_turn' && player) {
            var moveRange = getMoveRange(player);
            ctx.fillStyle = 'rgba(255,255,100,0.2)';
            for (var mr = 0; mr < BOARD_SIZE; mr++) {
                for (var mc = 0; mc < BOARD_SIZE; mc++) {
                    var d = tileDistance(player.x, player.y, mc, mr);
                    if (d > 0 && d <= moveRange && canEnterTile(player, mc, mr)) {
                        ctx.fillRect(mc * TILE_PX, mr * TILE_PX, TILE_PX, TILE_PX);
                    }
                }
            }
        }

        // Draw hop range when hop is selected (rabbit)
        if (selectedAction === 'hop' && phase === 'player_turn' && player) {
            var hopR = MEEPLES[player.meeple].hopRange || 0;
            ctx.fillStyle = 'rgba(100,255,200,0.25)';
            for (var hr = 0; hr < BOARD_SIZE; hr++) {
                for (var hc = 0; hc < BOARD_SIZE; hc++) {
                    var hd = tileDistance(player.x, player.y, hc, hr);
                    if (hd > 0 && hd <= hopR && canEnterTile(player, hc, hr)) {
                        ctx.fillRect(hc * TILE_PX, hr * TILE_PX, TILE_PX, TILE_PX);
                    }
                }
            }
        }

        // Draw attack range when attack is selected
        if ((selectedAction === 'attack1' || selectedAction === 'attack2') && phase === 'player_turn' && player) {
            var atkIdx = selectedAction === 'attack1' ? 0 : 1;
            var atk = MEEPLES[player.meeple].attacks[atkIdx];
            ctx.fillStyle = 'rgba(255,80,80,0.2)';
            for (var ar = 0; ar < BOARD_SIZE; ar++) {
                for (var ac = 0; ac < BOARD_SIZE; ac++) {
                    var ad = tileDistance(player.x, player.y, ac, ar);
                    if (ad > 0 && ad <= atk.range) {
                        ctx.fillRect(ac * TILE_PX, ar * TILE_PX, TILE_PX, TILE_PX);
                    }
                }
            }
        }

        // Draw placement highlight
        if (phase === 'place_player') {
            ctx.fillStyle = 'rgba(100,255,100,0.15)';
            for (var pr = 0; pr < BOARD_SIZE; pr++) {
                for (var pc = 0; pc < BOARD_SIZE; pc++) {
                    if (board[pr][pc] !== T_ROCK && board[pr][pc] !== T_WATER && board[pr][pc] !== T_FISH) {
                        ctx.fillRect(pc * TILE_PX, pr * TILE_PX, TILE_PX, TILE_PX);
                    }
                }
            }
        }

        // Draw dead opponents as bone piles (food for carnivores)
        opponents.forEach(function(opp) {
            if (opp.entity && !opp.entity.alive && opp.entity.x >= 0 && opp.entity.y >= 0) {
                var bx = opp.entity.x * TILE_PX + TILE_PX / 2;
                var by = opp.entity.y * TILE_PX + TILE_PX / 2;
                ctx.fillStyle = '#888';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🦴', bx, by);
            }
        });

        // Draw all alive meeples
        if (player && player.x !== null && player.alive) {
            drawMeeple(ctx, player, true);
        }
        opponents.forEach(function(opp) {
            if (opp.entity && opp.entity.x !== null && opp.entity.alive) {
                drawMeeple(ctx, opp.entity, false);
            }
        });
    }

    function drawMeeple(ctx, entity, isPlayer) {
        var pos = getMeepleDrawPos(entity);
        var px = pos.x;
        var py = pos.y;
        var data = MEEPLES[entity.meeple];

        // 3D-style wooden base (shadow)
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(px + 1, py + 2, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wooden base disc
        var baseGrad = ctx.createRadialGradient(px - 2, py + 1, 1, px, py + 1, 10);
        baseGrad.addColorStop(0, '#c4a06a');
        baseGrad.addColorStop(1, '#8a6a3a');
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.ellipse(px, py + 1, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D animal body with shading
        var bodyGrad = ctx.createRadialGradient(px - 2, py - 4, 1, px, py - 2, 9);
        var baseColor = data.color;
        bodyGrad.addColorStop(0, lightenColor(baseColor, 40));
        bodyGrad.addColorStop(0.7, baseColor);
        bodyGrad.addColorStop(1, darkenColor(baseColor, 40));
        ctx.fillStyle = bodyGrad;

        if (entity.meeple === 'seal') {
            // Seal shape: oval body, small head bump
            ctx.beginPath();
            ctx.ellipse(px, py - 2, 7, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head bump
            ctx.beginPath();
            ctx.arc(px, py - 10, 4, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 2, py - 10, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 10, 1, 0, Math.PI * 2);
            ctx.fill();
            // Whiskers
            ctx.strokeStyle = '#aaa';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(px - 3, py - 9); ctx.lineTo(px - 7, py - 10);
            ctx.moveTo(px + 3, py - 9); ctx.lineTo(px + 7, py - 10);
            ctx.stroke();
        } else if (entity.meeple === 'badger') {
            // Badger shape: stout body, striped head
            ctx.beginPath();
            ctx.ellipse(px, py - 2, 8, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath();
            ctx.arc(px, py - 9, 5, 0, Math.PI * 2);
            ctx.fill();
            // White stripe
            ctx.fillStyle = '#eee';
            ctx.beginPath();
            ctx.ellipse(px, py - 9, 1.5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 3, py - 9, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 3, py - 9, 1, 0, Math.PI * 2);
            ctx.fill();
        } else if (entity.meeple === 'toad') {
            // Toad shape: wide squat body, big eyes
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 9, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Big bulging eyes
            ctx.fillStyle = '#ccdd44';
            ctx.beginPath();
            ctx.arc(px - 5, py - 7, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 5, py - 7, 3.5, 0, Math.PI * 2);
            ctx.fill();
            // Pupils
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 5, py - 7, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 5, py - 7, 1.5, 0, Math.PI * 2);
            ctx.fill();
            // Bumps on back
            ctx.fillStyle = darkenColor(baseColor, 20);
            [[-3, -1], [2, 0], [0, -3], [4, -2]].forEach(function(b) {
                ctx.beginPath();
                ctx.arc(px + b[0], py + b[1], 1.2, 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (entity.meeple === 'rabbit') {
            // Rabbit: oval body, long ears
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 6, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Long ears
            ctx.beginPath();
            ctx.ellipse(px - 3, py - 13, 2, 6, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(px + 3, py - 13, 2, 6, 0.2, 0, Math.PI * 2);
            ctx.fill();
            // Inner ear pink
            ctx.fillStyle = '#EAADA8';
            ctx.beginPath();
            ctx.ellipse(px - 3, py - 13, 1, 4, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(px + 3, py - 13, 1, 4, 0.2, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 2, py - 5, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 5, 1.2, 0, Math.PI * 2);
            ctx.fill();
            // Tail puff
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(px, py + 6, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (entity.meeple === 'squirrel') {
            // Squirrel: round body, big fluffy tail
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 6, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Fluffy tail (big curved shape)
            ctx.fillStyle = lightenColor(baseColor, 20);
            ctx.beginPath();
            ctx.ellipse(px + 5, py - 6, 4, 8, 0.5, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.arc(px - 1, py - 7, 4, 0, Math.PI * 2);
            ctx.fill();
            // Small rounded ears
            ctx.beginPath();
            ctx.arc(px - 4, py - 10, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 10, 2, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 2, py - 7, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 1, py - 7, 1, 0, Math.PI * 2);
            ctx.fill();
        } else if (entity.meeple === 'spiky_turtle') {
            // Turtle shell (dome shape)
            var shellColor = entity.hiding ? darkenColor(baseColor, 30) : baseColor;
            ctx.fillStyle = entity.hiding ? darkenColor(shellColor, 20) : bodyGrad;
            ctx.beginPath();
            ctx.ellipse(px, py - 2, 9, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Shell pattern (hexagonal lines)
            ctx.strokeStyle = darkenColor(baseColor, 30);
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(px - 4, py - 6); ctx.lineTo(px, py - 8); ctx.lineTo(px + 4, py - 6);
            ctx.moveTo(px - 6, py - 1); ctx.lineTo(px - 4, py - 6);
            ctx.moveTo(px + 6, py - 1); ctx.lineTo(px + 4, py - 6);
            ctx.stroke();
            // Spikes on shell
            ctx.fillStyle = '#8B4513';
            [[-5, -5], [0, -8], [5, -5], [-3, -2], [3, -2]].forEach(function(s) {
                ctx.beginPath();
                ctx.moveTo(px + s[0], py + s[1] - 2);
                ctx.lineTo(px + s[0] - 1.5, py + s[1]);
                ctx.lineTo(px + s[0] + 1.5, py + s[1]);
                ctx.fill();
            });
            // Head (peeks out if not hiding)
            if (!entity.hiding) {
                ctx.fillStyle = lightenColor(baseColor, 20);
                ctx.beginPath();
                ctx.arc(px - 7, py - 1, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#111';
                ctx.beginPath();
                ctx.arc(px - 8, py - 2, 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (entity.meeple === 'dune_hare') {
            // Sandy hare body
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 6, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Big back legs
            ctx.fillStyle = darkenColor(baseColor, 10);
            ctx.beginPath();
            ctx.ellipse(px + 3, py + 4, 4, 3, 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Very long ears (taller than rabbit)
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(px - 3, py - 15, 2, 7, -0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(px + 3, py - 15, 2, 7, 0.15, 0, Math.PI * 2);
            ctx.fill();
            // Inner ears
            ctx.fillStyle = '#D4A07A';
            ctx.beginPath();
            ctx.ellipse(px - 3, py - 15, 1, 5, -0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(px + 3, py - 15, 1, 5, 0.15, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 2, py - 5, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 5, 1.2, 0, Math.PI * 2);
            ctx.fill();
        } else if (entity.meeple === 'dune_agama') {
            // Lizard body (long and sleek)
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 5, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Long tail
            ctx.fillStyle = darkenColor(baseColor, 10);
            ctx.beginPath();
            ctx.moveTo(px, py + 5);
            ctx.quadraticCurveTo(px + 6, py + 8, px + 8, py + 4);
            ctx.lineWidth = 2;
            ctx.strokeStyle = bodyGrad;
            ctx.stroke();
            ctx.fillStyle = bodyGrad;
            // Head (triangular)
            ctx.beginPath();
            ctx.moveTo(px, py - 10);
            ctx.lineTo(px - 4, py - 6);
            ctx.lineTo(px + 4, py - 6);
            ctx.fill();
            // Jagged back ridge
            ctx.fillStyle = '#FF8C00';
            for (var si = -5; si <= 3; si += 2) {
                ctx.beginPath();
                ctx.moveTo(px, py + si - 1);
                ctx.lineTo(px - 1, py + si);
                ctx.lineTo(px + 1, py + si);
                ctx.fill();
            }
            // Eyes
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(px - 2, py - 8, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 8, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 2, py - 8, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 8, 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (entity.meeple === 'small_camelopin') {
            // Long neck + stocky body
            ctx.beginPath();
            ctx.ellipse(px, py + 1, 7, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            // Long neck
            ctx.fillRect(px - 2, py - 12, 4, 10);
            // Head
            ctx.beginPath();
            ctx.arc(px, py - 13, 3.5, 0, Math.PI * 2);
            ctx.fill();
            // Spots
            ctx.fillStyle = darkenColor(baseColor, 30);
            [[-3, 0], [2, 2], [4, -1], [-1, 3], [0, -3]].forEach(function(s) {
                ctx.beginPath();
                ctx.arc(px + s[0], py + s[1], 1.5, 0, Math.PI * 2);
                ctx.fill();
            });
            // Small horns (ossicones)
            ctx.fillStyle = '#8B6914';
            ctx.fillRect(px - 3, py - 16, 2, 4);
            ctx.fillRect(px + 1, py - 16, 2, 4);
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(px - 2, py - 16, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 16, 1.2, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 2, py - 13, 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 13, 0.8, 0, Math.PI * 2);
            ctx.fill();
            // Sturdy legs
            ctx.fillStyle = darkenColor(baseColor, 15);
            ctx.fillRect(px - 5, py + 4, 2, 5);
            ctx.fillRect(px + 3, py + 4, 2, 5);
        } else if (entity.meeple === 'desert_felinidon') {
            // Sleek predator body
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 7, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head (cat-like)
            ctx.beginPath();
            ctx.arc(px, py - 8, 4.5, 0, Math.PI * 2);
            ctx.fill();
            // Pointed ears
            ctx.beginPath();
            ctx.moveTo(px - 5, py - 11); ctx.lineTo(px - 3, py - 15); ctx.lineTo(px - 1, py - 11);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(px + 1, py - 11); ctx.lineTo(px + 3, py - 15); ctx.lineTo(px + 5, py - 11);
            ctx.fill();
            // Fierce eyes
            ctx.fillStyle = '#FFAA00';
            ctx.beginPath();
            ctx.ellipse(px - 2, py - 8, 1.8, 1.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(px + 2, py - 8, 1.8, 1.2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Slit pupils
            ctx.fillStyle = '#111';
            ctx.fillRect(px - 2.3, py - 9, 0.8, 2.5);
            ctx.fillRect(px + 1.7, py - 9, 0.8, 2.5);
            // Big fangs
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(px - 2, py - 5); ctx.lineTo(px - 1.5, py - 3); ctx.lineTo(px - 2.5, py - 3);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(px + 2, py - 5); ctx.lineTo(px + 2.5, py - 3); ctx.lineTo(px + 1.5, py - 3);
            ctx.fill();
            // Muscular front legs
            ctx.fillStyle = darkenColor(baseColor, 15);
            ctx.fillRect(px - 6, py + 3, 3, 5);
            ctx.fillRect(px + 3, py + 3, 3, 5);
            // Long tail
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px + 5, py + 2);
            ctx.quadraticCurveTo(px + 10, py - 2, px + 8, py - 6);
            ctx.stroke();
            ctx.lineWidth = 1;
        } else if (entity.meeple === 'desert_fox') {
            // Sleek fox body
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 6, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Pointy head
            ctx.beginPath();
            ctx.arc(px, py - 7, 4, 0, Math.PI * 2);
            ctx.fill();
            // Big ears
            ctx.beginPath();
            ctx.moveTo(px - 4, py - 9); ctx.lineTo(px - 2, py - 15); ctx.lineTo(px, py - 9);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(px, py - 9); ctx.lineTo(px + 2, py - 15); ctx.lineTo(px + 4, py - 9);
            ctx.fill();
            // Inner ears
            ctx.fillStyle = '#EAADA8';
            ctx.beginPath();
            ctx.moveTo(px - 3, py - 10); ctx.lineTo(px - 2, py - 14); ctx.lineTo(px - 1, py - 10);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(px + 1, py - 10); ctx.lineTo(px + 2, py - 14); ctx.lineTo(px + 3, py - 10);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 2, py - 7, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 7, 1, 0, Math.PI * 2);
            ctx.fill();
            // Bushy tail
            ctx.fillStyle = lightenColor(baseColor, 30);
            ctx.beginPath();
            ctx.ellipse(px + 5, py + 3, 3, 6, 0.4, 0, Math.PI * 2);
            ctx.fill();
            // White tail tip
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(px + 7, py + 7, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (entity.meeple === 'prairie_hopper') {
            // Slim gazelle body
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 5, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Long neck
            ctx.fillRect(px - 1.5, py - 10, 3, 6);
            // Head
            ctx.beginPath();
            ctx.arc(px, py - 11, 3, 0, Math.PI * 2);
            ctx.fill();
            // Small horns
            ctx.strokeStyle = darkenColor(baseColor, 30);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px - 2, py - 13); ctx.lineTo(px - 3, py - 16);
            ctx.moveTo(px + 2, py - 13); ctx.lineTo(px + 3, py - 16);
            ctx.stroke();
            ctx.lineWidth = 1;
            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 1.5, py - 11, 0.8, 0, Math.PI * 2);
            ctx.fill();
            // Long legs
            ctx.fillStyle = darkenColor(baseColor, 15);
            ctx.fillRect(px - 4, py + 4, 2, 6);
            ctx.fillRect(px + 2, py + 4, 2, 6);
        } else if (entity.meeple === 'ringitor') {
            // Armadillo shell
            var shellHiding = entity.hiding;
            ctx.fillStyle = shellHiding ? darkenColor(baseColor, 25) : bodyGrad;
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            // Shell bands
            ctx.strokeStyle = darkenColor(baseColor, 30);
            ctx.lineWidth = 0.8;
            for (var bi = -4; bi <= 4; bi += 2) {
                ctx.beginPath();
                ctx.moveTo(px + bi, py - 6); ctx.lineTo(px + bi, py + 4);
                ctx.stroke();
            }
            ctx.lineWidth = 1;
            // Head (peeks out unless hiding)
            if (!shellHiding) {
                ctx.fillStyle = lightenColor(baseColor, 15);
                ctx.beginPath();
                ctx.arc(px - 6, py - 2, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#111';
                ctx.beginPath();
                ctx.arc(px - 7, py - 3, 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
            // Tail
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px + 7, py); ctx.lineTo(px + 11, py + 2);
            ctx.stroke();
            ctx.lineWidth = 1;
        } else if (entity.meeple === 'black_viper') {
            // Coiled snake body
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fill();
            // Snake pattern
            ctx.fillStyle = '#444';
            ctx.beginPath();
            ctx.arc(px - 2, py - 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py + 1, 2, 0, Math.PI * 2);
            ctx.fill();
            // Head rising up
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(px, py - 8, 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Forked tongue
            ctx.strokeStyle = '#cc0000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py - 12);
            ctx.lineTo(px - 2, py - 14);
            ctx.moveTo(px, py - 12);
            ctx.lineTo(px + 2, py - 14);
            ctx.stroke();
            // Eyes (menacing yellow)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(px - 1.5, py - 9, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 1.5, py - 9, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#111';
            ctx.fillRect(px - 1.8, py - 9.5, 0.6, 1.5);
            ctx.fillRect(px + 1.3, py - 9.5, 0.6, 1.5);
        } else if (entity.meeple === 'field_chinchinol') {
            // Small round rodent
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 6, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath();
            ctx.arc(px, py - 6, 3.5, 0, Math.PI * 2);
            ctx.fill();
            // Round ears
            ctx.beginPath();
            ctx.arc(px - 3, py - 9, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 3, py - 9, 2, 0, Math.PI * 2);
            ctx.fill();
            // Inner ears
            ctx.fillStyle = '#EAADA8';
            ctx.beginPath();
            ctx.arc(px - 3, py - 9, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 3, py - 9, 1, 0, Math.PI * 2);
            ctx.fill();
            // Big cute eyes
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 1.5, py - 6, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 1.5, py - 6, 1.2, 0, Math.PI * 2);
            ctx.fill();
            // Tiny whiskers
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(px - 3, py - 5); ctx.lineTo(px - 6, py - 6);
            ctx.moveTo(px + 3, py - 5); ctx.lineTo(px + 6, py - 6);
            ctx.stroke();
            ctx.lineWidth = 1;
        } else if (entity.meeple === 'field_coyoteya') {
            // Wolf-like body
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 7, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath();
            ctx.arc(px, py - 8, 4.5, 0, Math.PI * 2);
            ctx.fill();
            // Pointed snout
            ctx.beginPath();
            ctx.moveTo(px, py - 12); ctx.lineTo(px - 3, py - 8); ctx.lineTo(px + 3, py - 8);
            ctx.fill();
            // Ears
            ctx.beginPath();
            ctx.moveTo(px - 4, py - 10); ctx.lineTo(px - 3, py - 14); ctx.lineTo(px - 1, py - 10);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(px + 1, py - 10); ctx.lineTo(px + 3, py - 14); ctx.lineTo(px + 4, py - 10);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(px - 2, py - 9, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 9, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(px - 2, py - 9, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + 2, py - 9, 0.5, 0, Math.PI * 2);
            ctx.fill();
            // Bushy tail
            ctx.fillStyle = darkenColor(baseColor, 10);
            ctx.beginPath();
            ctx.ellipse(px + 5, py + 2, 3, 5, 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Front legs
            ctx.fillStyle = darkenColor(baseColor, 15);
            ctx.fillRect(px - 5, py + 4, 2, 5);
            ctx.fillRect(px + 3, py + 4, 2, 5);

        } else if (entity.meeple === 'green_mamba') {
            // Snake body — curved S shape
            ctx.beginPath();
            ctx.moveTo(px - 6, py + 4);
            ctx.quadraticCurveTo(px - 3, py - 4, px, py);
            ctx.quadraticCurveTo(px + 3, py + 4, px + 6, py - 2);
            ctx.lineWidth = 4;
            ctx.strokeStyle = baseColor;
            ctx.stroke();
            ctx.lineWidth = 1;
            // Head
            ctx.fillStyle = lightenColor(baseColor, 20);
            ctx.beginPath();
            ctx.ellipse(px + 6, py - 3, 3.5, 3, -0.3, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#ff4444';
            ctx.beginPath(); ctx.arc(px + 5, py - 5, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 7, py - 5, 1, 0, Math.PI * 2); ctx.fill();
            // Tongue
            ctx.strokeStyle = '#ff3333';
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(px + 9, py - 3); ctx.lineTo(px + 11, py - 4); ctx.moveTo(px + 9, py - 3); ctx.lineTo(px + 11, py - 2);
            ctx.stroke();

        } else if (entity.meeple === 'sleepy_mouse') {
            // Tiny round body
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath();
            ctx.arc(px, py - 7, 4, 0, Math.PI * 2);
            ctx.fill();
            // Big round ears
            ctx.fillStyle = lightenColor(baseColor, 30);
            ctx.beginPath(); ctx.arc(px - 3, py - 10, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 3, py - 10, 2.5, 0, Math.PI * 2); ctx.fill();
            // Eyes (closed if sleeping)
            ctx.fillStyle = '#111';
            if (entity.sleeping) {
                ctx.lineWidth = 1; ctx.strokeStyle = '#111';
                ctx.beginPath(); ctx.moveTo(px - 3, py - 7); ctx.lineTo(px - 1, py - 7); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(px + 1, py - 7); ctx.lineTo(px + 3, py - 7); ctx.stroke();
                // Zzz
                ctx.fillStyle = '#88aaff'; ctx.font = '6px sans-serif';
                ctx.fillText('z', px + 5, py - 10); ctx.fillText('Z', px + 7, py - 13);
            } else {
                ctx.beginPath(); ctx.arc(px - 2, py - 7, 1, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(px + 2, py - 7, 1, 0, Math.PI * 2); ctx.fill();
            }
            // Tail
            ctx.strokeStyle = darkenColor(baseColor, 20); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(px, py + 4); ctx.quadraticCurveTo(px + 6, py + 6, px + 4, py + 8); ctx.stroke();

        } else if (entity.meeple === 'stripy_falcon') {
            // Body
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 5, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.fillStyle = lightenColor(baseColor, 15);
            ctx.beginPath(); ctx.arc(px, py - 8, 3.5, 0, Math.PI * 2); ctx.fill();
            // Beak
            ctx.fillStyle = '#ff8800';
            ctx.beginPath(); ctx.moveTo(px, py - 8); ctx.lineTo(px + 4, py - 7); ctx.lineTo(px, py - 6); ctx.fill();
            // Eye
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(px - 1, py - 8, 1, 0, Math.PI * 2); ctx.fill();
            // Stripes on body
            ctx.strokeStyle = darkenColor(baseColor, 40); ctx.lineWidth = 1;
            for (var si = -2; si <= 2; si++) {
                ctx.beginPath(); ctx.moveTo(px - 4, py + si * 2); ctx.lineTo(px + 4, py + si * 2); ctx.stroke();
            }
            // Wings (spread if flying)
            ctx.fillStyle = darkenColor(baseColor, 15);
            if (entity.flying) {
                ctx.beginPath(); ctx.moveTo(px - 4, py - 2); ctx.lineTo(px - 14, py - 5); ctx.lineTo(px - 4, py + 2); ctx.fill();
                ctx.beginPath(); ctx.moveTo(px + 4, py - 2); ctx.lineTo(px + 14, py - 5); ctx.lineTo(px + 4, py + 2); ctx.fill();
            } else {
                ctx.beginPath(); ctx.moveTo(px - 4, py - 1); ctx.lineTo(px - 7, py + 3); ctx.lineTo(px - 3, py + 3); ctx.fill();
                ctx.beginPath(); ctx.moveTo(px + 4, py - 1); ctx.lineTo(px + 7, py + 3); ctx.lineTo(px + 3, py + 3); ctx.fill();
            }
            // Tail feathers
            ctx.fillStyle = darkenColor(baseColor, 25);
            ctx.beginPath(); ctx.moveTo(px - 2, py + 5); ctx.lineTo(px, py + 9); ctx.lineTo(px + 2, py + 5); ctx.fill();

        } else if (entity.meeple === 'mountain_larilatone') {
            // Goat body — stocky
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 6, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath(); ctx.arc(px, py - 8, 4, 0, Math.PI * 2); ctx.fill();
            // Curved horns
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(px - 3, py - 11, 3, 0.5, Math.PI); ctx.stroke();
            ctx.beginPath(); ctx.arc(px + 3, py - 11, 3, 0, 2.6); ctx.stroke();
            // Eyes
            ctx.fillStyle = '#331';
            ctx.beginPath(); ctx.arc(px - 2, py - 8, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 2, py - 8, 1, 0, Math.PI * 2); ctx.fill();
            // Legs
            ctx.fillStyle = darkenColor(baseColor, 20);
            ctx.fillRect(px - 5, py + 4, 2, 5);
            ctx.fillRect(px + 3, py + 4, 2, 5);
            // Beard
            ctx.fillStyle = '#999';
            ctx.beginPath(); ctx.moveTo(px - 1, py - 5); ctx.lineTo(px, py - 2); ctx.lineTo(px + 1, py - 5); ctx.fill();

        } else if (entity.meeple === 'chocolate_marten') {
            // Sleek elongated body
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 4, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.fillStyle = lightenColor(baseColor, 15);
            ctx.beginPath(); ctx.arc(px, py - 8, 3, 0, Math.PI * 2); ctx.fill();
            // Small ears
            ctx.beginPath(); ctx.arc(px - 2.5, py - 10, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 2.5, py - 10, 1.5, 0, Math.PI * 2); ctx.fill();
            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(px - 1.5, py - 8, 0.8, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 1.5, py - 8, 0.8, 0, Math.PI * 2); ctx.fill();
            // Chest patch
            ctx.fillStyle = '#f0d090';
            ctx.beginPath(); ctx.ellipse(px, py - 3, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill();
            // Bushy tail
            ctx.fillStyle = darkenColor(baseColor, 15);
            ctx.beginPath(); ctx.ellipse(px + 4, py + 3, 2.5, 4, 0.4, 0, Math.PI * 2); ctx.fill();

        } else if (entity.meeple === 'climbing_cliffa') {
            // Tiny round body
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 4, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath(); ctx.arc(px, py - 6, 3, 0, Math.PI * 2); ctx.fill();
            // Ears
            ctx.fillStyle = lightenColor(baseColor, 25);
            ctx.beginPath(); ctx.arc(px - 2, py - 8.5, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 2, py - 8.5, 1.5, 0, Math.PI * 2); ctx.fill();
            // Beady eyes
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(px - 1.5, py - 6, 0.8, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 1.5, py - 6, 0.8, 0, Math.PI * 2); ctx.fill();
            // Tiny tail
            ctx.strokeStyle = darkenColor(baseColor, 20); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(px, py + 3); ctx.quadraticCurveTo(px + 4, py + 4, px + 3, py + 6); ctx.stroke();

        } else if (entity.meeple === 'hopping_terbal') {
            // Wolf-like muscular body
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 6, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath(); ctx.arc(px, py - 8, 4.5, 0, Math.PI * 2); ctx.fill();
            // Pointed snout
            ctx.beginPath();
            ctx.moveTo(px, py - 12); ctx.lineTo(px - 3, py - 8); ctx.lineTo(px + 3, py - 8);
            ctx.fill();
            // Ears
            ctx.beginPath();
            ctx.moveTo(px - 4, py - 10); ctx.lineTo(px - 2, py - 14); ctx.lineTo(px - 1, py - 10);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(px + 1, py - 10); ctx.lineTo(px + 2, py - 14); ctx.lineTo(px + 4, py - 10);
            ctx.fill();
            // Eyes — amber
            ctx.fillStyle = '#cc8800';
            ctx.beginPath(); ctx.arc(px - 2, py - 9, 1.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 2, py - 9, 1.2, 0, Math.PI * 2); ctx.fill();
            // Legs
            ctx.fillStyle = darkenColor(baseColor, 15);
            ctx.fillRect(px - 5, py + 4, 2, 5);
            ctx.fillRect(px + 3, py + 4, 2, 5);
            // Bushy tail
            ctx.fillStyle = darkenColor(baseColor, 10);
            ctx.beginPath(); ctx.ellipse(px + 5, py + 2, 3, 5, 0.3, 0, Math.PI * 2); ctx.fill();

        } else if (entity.meeple === 'mountain_chinchinol') {
            // Similar to field chinchinol — tiny hamster
            ctx.beginPath();
            ctx.ellipse(px, py - 1, 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath(); ctx.arc(px, py - 7, 3.5, 0, Math.PI * 2); ctx.fill();
            // Cheek pouches
            ctx.fillStyle = lightenColor(baseColor, 25);
            ctx.beginPath(); ctx.arc(px - 3, py - 6, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 3, py - 6, 2, 0, Math.PI * 2); ctx.fill();
            // Ears
            ctx.fillStyle = lightenColor(baseColor, 15);
            ctx.beginPath(); ctx.arc(px - 2.5, py - 10, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 2.5, py - 10, 1.5, 0, Math.PI * 2); ctx.fill();
            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(px - 1.5, py - 7, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 1.5, py - 7, 1, 0, Math.PI * 2); ctx.fill();
            // Snow cap marking (white patch on head)
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(px, py - 9, 1.5, 0, Math.PI * 2); ctx.fill();
        }

        // Bone break indicator
        if (entity.boneBreak > 0) {
            ctx.fillStyle = '#ff6633';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🦴', px + 8, py - 8);
        }

        // Player/opponent ring (different colors per opponent)
        var ringColor = '#ff6666'; // default red for enemies
        if (isPlayer) {
            ringColor = '#88ff88';
        } else if (entity.name === 'Grunton') {
            ringColor = '#ff8844';
        } else if (entity.name === 'Truffle') {
            ringColor = '#ff66cc';
        } else if (entity.name === 'Snickers') {
            ringColor = '#66aaff';
        }
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py + 1, 11, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;

        // Poison indicator (green glow)
        if (entity.poison && entity.poison.turns > 0) {
            ctx.fillStyle = '#88ff00';
            ctx.beginPath();
            ctx.arc(px + 9, py - 9, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = '5px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('P', px + 9, py - 9);
        }

        // Stun indicator (yellow star)
        if (entity.stunned) {
            ctx.fillStyle = '#ffdd00';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('★', px, py - 15);
        }

        // Blind indicator (sand cloud)
        if (entity.blinded) {
            ctx.fillStyle = '#DAA520';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💫', px - 8, py - 12);
        }

        // Bleed indicator
        if (entity.bleed && entity.bleed.turns > 0) {
            ctx.fillStyle = '#cc0000';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🩸', px - 8, py - 4);
        }

        // Hide indicator (shell icon)
        if (entity.hiding) {
            ctx.fillStyle = '#44aa44';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🛡️', px + 8, py - 12);
        }
    }

    // Color helpers for 3D shading
    function lightenColor(hex, amount) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function darkenColor(hex, amount) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.max(0, r - amount);
        g = Math.max(0, g - amount);
        b = Math.max(0, b - amount);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // ============================================================
    // UI UPDATES
    // ============================================================
    function updateBars() {
        if (!player) return;

        setBar('pigon-p-health', 'pigon-p-health-text', player.health, MEEPLES[player.meeple].maxHealth);
        setBar('pigon-p-hunger', 'pigon-p-hunger-text', player.hunger, HUNGER_START);
        setBar('pigon-p-thirst', 'pigon-p-thirst-text', player.thirst, THIRST_START);
        setBar('pigon-p-energy', 'pigon-p-energy-text', player.energy, ENERGY_START + 10);

        // Dynamically build opponent panels
        var oppContainer = document.getElementById('pigon-opponents-panel');
        if (!oppContainer) return;
        oppContainer.innerHTML = '';

        var ringColors = {
            'Pigon': '#cc6666',
            'Grunton': '#ff8844',
            'Truffle': '#ff66cc',
            'Snickers': '#66aaff'
        };

        opponents.forEach(function(opp) {
            var e = opp.entity;
            var mData = MEEPLES[e.meeple];
            var color = ringColors[opp.name] || '#cc6666';
            var panel = document.createElement('div');
            panel.className = 'pigon-panel';
            if (!e.alive) panel.style.opacity = '0.4';

            var pct = function(val, max) { return Math.max(0, Math.min(100, (val / max) * 100)); };

            panel.innerHTML =
                '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">' +
                    '<span style="font-size:20px;">' + mData.icon + '</span>' +
                    '<span style="color:' + color + ';font-size:13px;font-weight:bold;">' + opp.name + (e.alive ? '' : ' ☠️') + '</span>' +
                    '<span style="color:#888;font-size:11px;">' + mData.name + '</span>' +
                '</div>' +
                '<div class="pigon-bar-label">HP</div>' +
                '<div class="pigon-bar"><div class="pigon-bar-fill health" style="width:' + pct(e.health, mData.maxHealth) + '%"></div><div class="pigon-bar-text">' + Math.round(e.health) + '/' + mData.maxHealth + '</div></div>' +
                '<div class="pigon-bar-label">Hunger</div>' +
                '<div class="pigon-bar"><div class="pigon-bar-fill hunger" style="width:' + pct(e.hunger, HUNGER_START) + '%"></div><div class="pigon-bar-text">' + Math.round(e.hunger) + '/' + HUNGER_START + '</div></div>' +
                '<div class="pigon-bar-label">Thirst</div>' +
                '<div class="pigon-bar"><div class="pigon-bar-fill thirst" style="width:' + pct(e.thirst, THIRST_START) + '%"></div><div class="pigon-bar-text">' + Math.round(e.thirst) + '/' + THIRST_START + '</div></div>' +
                '<div class="pigon-bar-label">Energy</div>' +
                '<div class="pigon-bar"><div class="pigon-bar-fill energy" style="width:' + pct(e.energy, ENERGY_START + 10) + '%"></div><div class="pigon-bar-text">' + Math.round(e.energy) + '/' + (ENERGY_START + 10) + '</div></div>';

            oppContainer.appendChild(panel);
        });
    }

    function setBar(fillId, textId, value, max) {
        var fillEl = document.getElementById(fillId);
        var textEl = document.getElementById(textId);
        if (fillEl) fillEl.style.width = Math.max(0, Math.min(100, (value / max) * 100)) + '%';
        if (textEl) textEl.textContent = Math.round(value) + '/' + max;
    }

    function updateActions() {
        var actionsDiv = document.getElementById('pigon-actions');
        if (!actionsDiv || !player) return;
        actionsDiv.innerHTML = '';

        var data = MEEPLES[player.meeple];
        var isPlayerTurn = phase === 'player_turn';

        var hiding = player.hiding;

        // Move button
        var canMoveHiding = hiding && data.canMoveWhileHiding;
        var moveBtn = makeBtn('🚶 Move (' + MOVE_COST + '/tile)', 'move',
            isPlayerTurn && player.energy >= MOVE_COST && (!hiding || canMoveHiding));
        actionsDiv.appendChild(moveBtn);

        // Attack buttons
        data.attacks.forEach(function(atk, idx) {
            var onCooldown = (player.cooldowns[idx] || 0) > 0;
            var label = '⚔️ ' + atk.name + ' (' + atk.cost + 'E)';
            if (onCooldown) label += ' [CD:' + player.cooldowns[idx] + ']';
            var btn = makeBtn(label, 'attack' + (idx + 1),
                isPlayerTurn && player.energy >= atk.cost && !onCooldown && !player.stunned && !hiding);
            actionsDiv.appendChild(btn);
        });

        // Eat button
        var canEatHere = canEatAt(player);
        var eatBtn = makeBtn('🍖 Eat (' + EAT_COST + 'E)', 'eat',
            isPlayerTurn && player.energy >= EAT_COST && canEatHere && !hiding);
        actionsDiv.appendChild(eatBtn);

        // Drink button
        var drinkCostDisplay = data.cheapDrink ? 1 : DRINK_COST;
        var drinkBtn = makeBtn('💧 Drink (' + drinkCostDisplay + 'E)', 'drink',
            isPlayerTurn && player.energy >= drinkCostDisplay && canDrinkAt(player));
        actionsDiv.appendChild(drinkBtn);

        // Hop button (rabbit/dune hare — free, once per turn)
        if (data.hopRange) {
            var hopBtn = makeBtn('🐇 Hop (' + data.hopRange + ' tiles, FREE)', 'hop',
                isPlayerTurn && !player.hopUsed && !player.stunned);
            actionsDiv.appendChild(hopBtn);
        }

        // Dash button (desert fox — free, ignores obstacles)
        if (data.dashRange) {
            var dashBtn = makeBtn('💨 Dash (' + data.dashRange + ' tiles, FREE)', 'dash',
                isPlayerTurn && !player.hopUsed && !player.stunned && !hiding);
            actionsDiv.appendChild(dashBtn);
        }

        // Hide button (turtle — toggle shell)
        if (data.canHide) {
            var hideLabel = player.hiding ? '🐢 Come Out (1E)' : '🛡️ Hide in Shell (2E)';
            var hideCost = player.hiding ? 1 : 2;
            var hideBtn = makeBtn(hideLabel, 'hide',
                isPlayerTurn && player.energy >= hideCost && !player.stunned);
            actionsDiv.appendChild(hideBtn);
        }

        // Sleep button (sleepy mouse — toggle sleep)
        if (data.canSleep) {
            var sleepLabel = player.sleeping ? '😴 Wake Up (1E)' : '💤 Sleep (1E)';
            var sleepBtn = makeBtn(sleepLabel, 'sleep',
                isPlayerTurn && player.energy >= 1 && !player.stunned);
            actionsDiv.appendChild(sleepBtn);
        }

        // Fly button (falcon — toggle flight)
        if (data.canFly) {
            var flyLabel = player.flying ? '🦅 Land (FREE)' : '🦅 Take Flight (3E)';
            var flyCost = player.flying ? 0 : 3;
            var flyBtn = makeBtn(flyLabel, 'fly',
                isPlayerTurn && player.energy >= flyCost && !player.stunned);
            actionsDiv.appendChild(flyBtn);
        }
    }

    function makeBtn(label, action, enabled) {
        var btn = document.createElement('button');
        btn.className = 'pigon-btn';
        if (selectedAction === action) btn.style.borderColor = '#ffcc00';
        btn.textContent = label;
        btn.disabled = !enabled;
        btn.onclick = function() {
            if (action === 'eat') {
                doEat(player, true);
            } else if (action === 'drink') {
                doDrink(player, true);
            } else if (action === 'hide') {
                doHide(player, true);
            } else if (action === 'sleep') {
                doSleep(player, true);
            } else if (action === 'fly') {
                doFly(player, true);
            } else {
                selectedAction = (selectedAction === action) ? null : action;
                updateActions();
                render();
            }
        };
        return btn;
    }

    function addLog(msg, type) {
        logMessages.push({ msg: msg, type: type || 'system' });
        if (logMessages.length > 50) logMessages.shift();
        var logDiv = document.getElementById('pigon-log');
        if (logDiv) {
            var d = document.createElement('div');
            d.className = 'log-' + (type || 'system');
            d.textContent = msg;
            logDiv.appendChild(d);
            logDiv.scrollTop = logDiv.scrollHeight;
        }
    }

    function showBanner(text, duration) {
        var banner = document.getElementById('pigon-turn-banner');
        if (!banner) return;
        banner.textContent = text;
        banner.style.display = 'block';
        setTimeout(function() { banner.style.display = 'none'; }, duration || 1200);
    }

    // ============================================================
    // HELPERS
    // ============================================================
    function tileDistance(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getMoveRange(entity) {
        var data = MEEPLES[entity.meeple];
        var onWater = isOnTerrain(entity, T_WATER) || isOnTerrain(entity, T_FISH) || isOnTerrain(entity, T_POOL);
        var speed = onWater ? data.waterSpeed : data.landSpeed;
        return Math.floor(entity.energy / MOVE_COST) * speed;
    }

    function isOnTerrain(entity, terrain) {
        if (entity.x === null || entity.y === null) return false;
        return board[entity.y] && board[entity.y][entity.x] === terrain;
    }

    function isNearTerrain(entity, terrain) {
        for (var dr = -1; dr <= 1; dr++) {
            for (var dc = -1; dc <= 1; dc++) {
                var nr = entity.y + dr;
                var nc = entity.x + dc;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    if (board[nr][nc] === terrain) return true;
                }
            }
        }
        return false;
    }

    function getCorpseAt(entity) {
        // Check if there's a dead opponent on this tile
        for (var i = 0; i < turnOrder.length; i++) {
            var t = turnOrder[i];
            if (t.entity !== entity && !t.entity.alive && t.entity.x === entity.x && t.entity.y === entity.y) {
                return t;
            }
        }
        return null;
    }

    function canEatAt(entity) {
        var data = MEEPLES[entity.meeple];
        if (data.canEat.indexOf('berry') !== -1 && isOnTerrain(entity, T_BERRY)) return true;
        if (data.canEat.indexOf('fish') !== -1 && isOnTerrain(entity, T_FISH)) return true;
        if (data.canEatInTree && isOnTerrain(entity, T_TREE)) return true;
        if (data.canEat.indexOf('cactus') !== -1 && isOnTerrain(entity, T_CACTUS)) return true;
        if (data.canEat.indexOf('flower') !== -1 && isOnTerrain(entity, T_FLOWER)) return true;
        if (data.canEat.indexOf('grain') !== -1 && isOnTerrain(entity, T_GRAIN)) return true;
        if (data.canEat.indexOf('grass') !== -1 && isOnTerrain(entity, T_SNOW_GRASS)) return true;
        // Herbivores can also eat grain (but get less)
        if (data.canEat.indexOf('berry') !== -1 && isOnTerrain(entity, T_GRAIN)) return true;
        // Carnivores can eat dead opponents
        if (data.canEat.indexOf('meat') !== -1 && getCorpseAt(entity)) return true;
        return false;
    }

    function canDrinkAt(entity) {
        return isOnTerrain(entity, T_WATER) || isOnTerrain(entity, T_FISH) || isOnTerrain(entity, T_POOL) ||
               isOnTerrain(entity, T_SNOW_POOL) ||
               isNearTerrain(entity, T_WATER) || isNearTerrain(entity, T_FISH) || isNearTerrain(entity, T_POOL) ||
               isNearTerrain(entity, T_SNOW_POOL);
    }

    function canEnterTile(entity, tileX, tileY) {
        var t = board[tileY][tileX];
        var data = MEEPLES[entity.meeple];
        if (t === T_ROCK) return false;
        if (t === T_TREE && !data.climber) return false;
        if (t === T_ROCK_MOUND && !data.climber) return false;
        if (t === T_PINE && !data.climber) return false;
        if (t === T_SNOW_ROCK && !data.climber) return false;
        if (t === T_TALL_GRASS && !data.hiker && !data.climber) return false;
        if ((t === T_WATER || t === T_FISH || t === T_POOL || t === T_SNOW_POOL) && data.waterFear) return false;
        return true;
    }

    function getMoveCost(entity, fromX, fromY, toX, toY) {
        var data = MEEPLES[entity.meeple];
        var dist = tileDistance(fromX, fromY, toX, toY);
        var targetTile = board[toY] && board[toY][toX];
        var isWater = targetTile === T_WATER || targetTile === T_FISH || targetTile === T_POOL || targetTile === T_SNOW_POOL;
        var speed = isWater ? data.waterSpeed : data.landSpeed;
        // Mountain chinchinol: speed boost when thirsty
        if (data.thirstSpeedBoost && entity.thirst < 30) {
            speed *= 1.8; // 80% faster when thirsty
        }
        return Math.ceil(dist / speed) * MOVE_COST;
    }

    // ============================================================
    // ACTIONS
    // ============================================================
    function entityName(entity) {
        if (entity === player) return 'You';
        for (var oi = 0; oi < opponents.length; oi++) {
            if (opponents[oi].entity === entity) return opponents[oi].name;
        }
        return 'Pigon';
    }

    function entityLogType(entity) {
        return entity === player ? 'player' : 'pigon';
    }

    // Movement animation state
    var moveAnim = null; // { entity, fromX, fromY, toX, toY, progress, callback }

    function doMove(entity, toX, toY, isPlayer) {
        if (entity.hiding && !MEEPLES[entity.meeple].canMoveWhileHiding) return false;
        var cost = getMoveCost(entity, entity.x, entity.y, toX, toY);
        if (entity.energy < cost) return false;
        if (!canEnterTile(entity, toX, toY)) return false;

        // Bone break — moving off snow rock without immunity
        var data = MEEPLES[entity.meeple];
        var fromTile = board[entity.y] && board[entity.y][entity.x];
        var toTile = board[toY] && board[toY][toX];
        if (fromTile === T_SNOW_ROCK && toTile !== T_SNOW_ROCK && !data.boneBreakImmune && !entity.boneBreak) {
            if (Math.random() < 0.35) { // 35% chance to break bones
                entity.boneBreak = 5;
                entity.health -= 2;
                addLog(entityName(entity) + ' broke a bone climbing down the rocks! -2 HP, weakened for 5 turns!', 'system');
            }
        }

        // Bone break slows movement — extra cost
        var bonePenalty = entity.boneBreak > 0 ? 1 : 0;
        entity.energy -= (cost + bonePenalty);
        var fromX = entity.x;
        var fromY = entity.y;
        entity.x = toX;
        entity.y = toY;
        addLog(entityName(entity) + ' moved to (' + toX + ',' + toY + ') [-' + (cost + bonePenalty) + 'E]', entityLogType(entity));

        // Start slide animation
        moveAnim = { entity: entity, fromX: fromX, fromY: fromY, toX: toX, toY: toY, progress: 0 };
        animateMove();
        return true;
    }

    function animateMove() {
        if (!moveAnim) return;
        moveAnim.progress += 0.12; // Speed of animation
        if (moveAnim.progress >= 1) {
            moveAnim = null;
            render();
            return;
        }
        render();
        requestAnimationFrame(animateMove);
    }

    function getMeepleDrawPos(entity) {
        // Returns pixel position — smooth interpolated if animating
        if (moveAnim && moveAnim.entity === entity && moveAnim.progress < 1) {
            var t = moveAnim.progress;
            // EaseOut for smooth deceleration
            t = 1 - (1 - t) * (1 - t);
            var ax = (moveAnim.fromX + (moveAnim.toX - moveAnim.fromX) * t) * TILE_PX + TILE_PX / 2;
            var ay = (moveAnim.fromY + (moveAnim.toY - moveAnim.fromY) * t) * TILE_PX + TILE_PX / 2;
            return { x: ax, y: ay };
        }
        return { x: entity.x * TILE_PX + TILE_PX / 2, y: entity.y * TILE_PX + TILE_PX / 2 };
    }

    function doAttack(attacker, defender, atkIndex, isPlayer) {
        var data = MEEPLES[attacker.meeple];
        var atk = data.attacks[atkIndex];
        if (!atk) return false;
        if (attacker.energy < atk.cost) return false;
        if (attacker.stunned) return false;
        if ((attacker.cooldowns[atkIndex] || 0) > 0) return false;

        var dist = tileDistance(attacker.x, attacker.y, defender.x, defender.y);
        if (dist > atk.range) return false;

        // Flying targets can't be hit by non-flyers
        if (defender.flying && !attacker.flying) {
            addLog(entityName(defender) + ' is flying — ' + entityName(attacker) + ' can\'t reach!', 'system');
            return false;
        }

        attacker.energy -= atk.cost;

        // Check if attacker is blinded — attack misses!
        if (attacker.blinded) {
            attacker.blinded = false;
            addLog(entityName(attacker) + ' tried ' + atk.name + ' but missed — blinded by sand!', entityLogType(attacker));
            if (atk.cooldown) attacker.cooldowns[atkIndex] = atk.cooldown;
            updateAfterAction();
            return true;
        }

        // Dodge check
        var defenderData = MEEPLES[defender.meeple];
        if (defenderData.dodgeChance && Math.random() < defenderData.dodgeChance) {
            addLog(entityName(defender) + ' DODGED ' + entityName(attacker) + '\'s ' + atk.name + '!', 'system');
            if (atk.cooldown) attacker.cooldowns[atkIndex] = atk.cooldown;
            updateAfterAction();
            return true;
        }

        // Calculate damage (reduced if defender is hiding in shell)
        var damage = atk.damage;
        if (defender.hiding && defenderData.hideReduction) {
            damage = Math.ceil(damage * (1 - defenderData.hideReduction));
            addLog(entityName(defender) + '\'s shell absorbs some damage! (' + damage + ' instead of ' + atk.damage + ')', 'system');
            if (defenderData.hideReflect) {
                attacker.health -= defenderData.hideReflect;
                addLog(entityName(attacker) + ' took ' + defenderData.hideReflect + ' damage from the spiky shell!', 'system');
            }
        }

        // Bone break modifiers
        if (attacker.boneBreak > 0) {
            damage = Math.max(1, Math.ceil(damage * 0.6)); // 40% less damage
        }
        if (defender.boneBreak > 0) {
            damage = Math.ceil(damage * 1.3); // 30% more damage taken
        }

        // Apply damage
        defender.health -= damage;
        addLog(entityName(attacker) + ' used ' + atk.name + ' on ' + entityName(defender) + '! ' + damage + ' damage. [-' + atk.cost + 'E]',
            entityLogType(attacker));

        // Self damage (Frenzy)
        if (atk.selfDmg) {
            attacker.health -= atk.selfDmg;
            addLog(entityName(attacker) + ' took ' + atk.selfDmg + ' self-damage from ' + atk.name + '!', 'system');
        }

        // Stun
        if (atk.stun) {
            defender.stunned = true;
            addLog(entityName(defender) + ' is STUNNED for 1 turn!', 'system');
        }

        // Blind
        if (atk.blind) {
            defender.blinded = true;
            addLog(entityName(defender) + ' is BLINDED — next attack will miss!', 'system');
        }

        // Poison
        if (atk.poison) {
            defender.poison = { dmg: atk.poison.dmg, turns: atk.poison.turns };
            addLog(entityName(defender) + ' is POISONED! ' + atk.poison.dmg + ' dmg/turn for ' + atk.poison.turns + ' turns.', 'system');
        }

        // Bleed
        if (atk.bleed) {
            defender.bleed = { dmg: atk.bleed.dmg, turns: atk.bleed.turns };
            addLog(entityName(defender) + ' is BLEEDING! ' + atk.bleed.dmg + ' dmg/turn for ' + atk.bleed.turns + ' turns.', 'system');
        }

        // Knockback (Ram)
        if (atk.knockback) {
            var kbDist = atk.knockback;
            var dx = defender.x - attacker.x;
            var dy = defender.y - attacker.y;
            var kbLen = Math.sqrt(dx * dx + dy * dy);
            if (kbLen > 0) {
                var newX = Math.round(defender.x + (dx / kbLen) * kbDist);
                var newY = Math.round(defender.y + (dy / kbLen) * kbDist);
                newX = Math.max(0, Math.min(BOARD_SIZE - 1, newX));
                newY = Math.max(0, Math.min(BOARD_SIZE - 1, newY));
                if (canEnterTile(defender, newX, newY)) {
                    defender.x = newX;
                    defender.y = newY;
                    addLog(entityName(defender) + ' was knocked back to (' + newX + ',' + newY + ')!', 'system');
                }
            }
            // Bone break chance from ram
            if (atk.boneBreakChance && !MEEPLES[defender.meeple].boneBreakImmune && !defender.boneBreak) {
                if (Math.random() < atk.boneBreakChance) {
                    defender.boneBreak = 5;
                    defender.health -= 2;
                    addLog(entityName(defender) + '\'s bones cracked from the impact! -2 HP, weakened for 5 turns!', 'system');
                }
            }
        }

        // Paralyse — turns missed scales with how weak the target is
        if (atk.paralyse) {
            var defData = MEEPLES[defender.meeple];
            var healthPercent = defender.health / defData.maxHealth;
            // Badgers resist paralysis
            if (defender.meeple === 'badger') {
                addLog(entityName(defender) + ' resists paralysis! (Badgers are tough!)', 'system');
            } else {
                // Weaker = more turns: 1 turn above 50%, 2 turns at 25-50%, 3 turns below 25%
                var turns = healthPercent > 0.5 ? 1 : (healthPercent > 0.25 ? 2 : 3);
                defender.paralysed = (defender.paralysed || 0) + turns;
                addLog(entityName(defender) + ' is PARALYSED for ' + turns + ' turn(s)!', 'system');
            }
        }

        // Sleep damage multiplier — sleeping targets take extra damage
        if (defender.sleeping) {
            var extraDmg = Math.ceil(damage * 0.5); // 50% extra
            defender.health -= extraDmg;
            addLog(entityName(defender) + ' took ' + extraDmg + ' extra damage while sleeping!', 'system');
        }

        // Cooldown
        if (atk.cooldown) {
            attacker.cooldowns[atkIndex] = atk.cooldown;
        }

        return true;
    }

    function doHide(entity, isPlayer) {
        var data = MEEPLES[entity.meeple];
        if (!data.canHide) return false;

        if (entity.hiding) {
            // Come out of shell
            entity.energy -= 1;
            entity.hiding = false;
            addLog(entityName(entity) + ' came out of the shell!', entityLogType(entity));
        } else {
            // Hide in shell
            entity.energy -= 2;
            entity.hiding = true;
            addLog(entityName(entity) + ' hid in the shell! 🛡️ Damage reduced, attackers take spike damage.', entityLogType(entity));
        }
        updateAfterAction();
        return true;
    }

    function doSleep(entity, isPlayer) {
        var data = MEEPLES[entity.meeple];
        if (!data.canSleep) return false;

        if (entity.sleeping) {
            entity.energy -= 1;
            entity.sleeping = false;
            addLog(entityName(entity) + ' woke up!', entityLogType(entity));
        } else {
            entity.energy -= 1;
            entity.sleeping = true;
            addLog(entityName(entity) + ' fell asleep! 💤 Less hunger/thirst drain, but vulnerable to attacks.', entityLogType(entity));
        }
        updateAfterAction();
        return true;
    }

    function doFly(entity, isPlayer) {
        var data = MEEPLES[entity.meeple];
        if (!data.canFly) return false;

        if (entity.flying) {
            entity.flying = false;
            addLog(entityName(entity) + ' landed.', entityLogType(entity));
        } else {
            if (entity.energy < 3) return false;
            entity.energy -= 3;
            entity.flying = true;
            addLog(entityName(entity) + ' took flight! 🦅 Predators can\'t reach you, but costs energy each turn.', entityLogType(entity));
        }
        updateAfterAction();
        return true;
    }

    function doEat(entity, isPlayer) {
        if (entity.energy < EAT_COST) return false;

        var data = MEEPLES[entity.meeple];

        // Berry
        if (data.canEat.indexOf('berry') !== -1 && isOnTerrain(entity, T_BERRY)) {
            entity.energy -= EAT_COST;
            entity.hunger = Math.min(HUNGER_START, entity.hunger + EAT_RESTORE);
            // Remove berry (regrows in 3 turns)
            board[entity.y][entity.x] = T_GRASS;
            var spot = berrySpots.find(function(s) { return s.r === entity.y && s.c === entity.x; });
            if (spot) { spot.eaten = true; spot.regrowTurn = turnNumber + 5; }
            addLog(entityName(entity) + ' ate berries! +' + EAT_RESTORE + ' hunger.', entityLogType(entity));
            updateAfterAction();
            return true;
        }

        // Fish
        if (data.canEat.indexOf('fish') !== -1 && isOnTerrain(entity, T_FISH)) {
            entity.energy -= EAT_COST;
            entity.hunger = Math.min(HUNGER_START, entity.hunger + EAT_RESTORE);
            board[entity.y][entity.x] = T_WATER;
            var fSpot = fishSpots.find(function(s) { return s.r === entity.y && s.c === entity.x; });
            if (fSpot) { fSpot.eaten = true; fSpot.regrowTurn = turnNumber + 6; }
            addLog(entityName(entity) + ' caught a fish! +' + EAT_RESTORE + ' hunger.', entityLogType(entity));
            updateAfterAction();
            return true;
        }

        // Tree nuts (squirrel only)
        if (data.canEatInTree && isOnTerrain(entity, T_TREE)) {
            entity.energy -= EAT_COST;
            entity.hunger = Math.min(HUNGER_START, entity.hunger + EAT_RESTORE);
            addLog(entityName(entity) + ' ate tree nuts! +' + EAT_RESTORE + ' hunger.', entityLogType(entity));
            updateAfterAction();
            return true;
        }

        // Cactus (food + water, but prickly!)
        if (data.canEat.indexOf('cactus') !== -1 && isOnTerrain(entity, T_CACTUS)) {
            entity.energy -= EAT_COST;
            entity.hunger = Math.min(HUNGER_START, entity.hunger + EAT_RESTORE);
            entity.thirst = Math.min(THIRST_START, entity.thirst + 10); // Bonus: some water too
            // Cactus damage unless immune
            if (!data.cactusImmune) {
                entity.health -= 1;
                addLog(entityName(entity) + ' ate cactus! +' + EAT_RESTORE + ' hunger, +10 thirst, but took 1 damage from spines!', entityLogType(entity));
            } else {
                addLog(entityName(entity) + ' ate cactus safely! +' + EAT_RESTORE + ' hunger, +10 thirst.', entityLogType(entity));
            }
            board[entity.y][entity.x] = T_SAND;
            var cSpot = cactusSpots.find(function(s) { return s.r === entity.y && s.c === entity.x; });
            if (cSpot) { cSpot.eaten = true; cSpot.regrowTurn = turnNumber + 5; }
            updateAfterAction();
            return true;
        }

        // Flower (prairie food)
        if (data.canEat.indexOf('flower') !== -1 && isOnTerrain(entity, T_FLOWER)) {
            entity.energy -= EAT_COST;
            entity.hunger = Math.min(HUNGER_START, entity.hunger + EAT_RESTORE);
            board[entity.y][entity.x] = T_PRAIRIE;
            var flSpot = berrySpots.find(function(s) { return s.r === entity.y && s.c === entity.x; });
            if (flSpot) { flSpot.eaten = true; flSpot.regrowTurn = turnNumber + 5; }
            addLog(entityName(entity) + ' ate flowers! +' + EAT_RESTORE + ' hunger.', entityLogType(entity));
            updateAfterAction();
            return true;
        }

        // Snow grass (mountain herbivores)
        if (data.canEat.indexOf('grass') !== -1 && isOnTerrain(entity, T_SNOW_GRASS)) {
            entity.energy -= EAT_COST;
            entity.hunger = Math.min(HUNGER_START, entity.hunger + EAT_RESTORE);
            board[entity.y][entity.x] = T_SNOW;
            var sgSpot = berrySpots.find(function(s) { return s.r === entity.y && s.c === entity.x; });
            if (sgSpot) { sgSpot.eaten = true; sgSpot.regrowTurn = turnNumber + 4; }
            addLog(entityName(entity) + ' ate mountain grass! +' + EAT_RESTORE + ' hunger.', entityLogType(entity));
            updateAfterAction();
            return true;
        }

        // Grain (granivores get extra, herbivores get normal)
        if (isOnTerrain(entity, T_GRAIN) && (data.canEat.indexOf('grain') !== -1 || data.canEat.indexOf('berry') !== -1)) {
            entity.energy -= EAT_COST;
            var grainRestore = data.granivore ? EAT_RESTORE + 15 : EAT_RESTORE; // Granivores get big bonus
            entity.hunger = Math.min(HUNGER_START, entity.hunger + grainRestore);
            board[entity.y][entity.x] = T_GRASS;
            var gSpot = grainSpots.find(function(s) { return s.r === entity.y && s.c === entity.x; });
            if (gSpot) { gSpot.eaten = true; gSpot.regrowTurn = turnNumber + 4; }
            addLog(entityName(entity) + ' ate grain! +' + grainRestore + ' hunger.' + (data.granivore ? ' (Granivore bonus!)' : ''), entityLogType(entity));
            updateAfterAction();
            return true;
        }

        // Eat dead opponent (carnivores only)
        var corpse = getCorpseAt(entity);
        if (data.canEat.indexOf('meat') !== -1 && corpse) {
            entity.energy -= EAT_COST;
            entity.hunger = Math.min(HUNGER_START, entity.hunger + EAT_RESTORE + 10); // Meat is filling
            // Remove corpse from board
            corpse.entity.x = -99;
            corpse.entity.y = -99;
            addLog(entityName(entity) + ' fed on ' + corpse.name + '\'s remains! +' + (EAT_RESTORE + 10) + ' hunger.', entityLogType(entity));
            updateAfterAction();
            return true;
        }

        return false;
    }

    function doDrink(entity, isPlayer) {
        var data = MEEPLES[entity.meeple];
        var drinkCost = data.cheapDrink ? 1 : DRINK_COST;
        if (entity.energy < drinkCost) return false;
        if (!canDrinkAt(entity)) return false;

        entity.energy -= drinkCost;
        entity.thirst = Math.min(THIRST_START, entity.thirst + DRINK_RESTORE);
        addLog(entityName(entity) + ' drank water! +' + DRINK_RESTORE + ' thirst.', entityLogType(entity));
        updateAfterAction();
        return true;
    }

    function updateAfterAction() {
        updateBars();
        updateActions();
        render();
        checkDeath();
    }

    // ============================================================
    // TURN SYSTEM
    // ============================================================
    function applyTurnStart(entity, name) {
        var data = MEEPLES[entity.meeple];

        // Flying costs energy per turn
        if (entity.flying && data.canFly) {
            entity.energy -= (data.flyEnergyCost || 2);
            if (entity.energy <= 0) {
                entity.flying = false;
                entity.energy = 0;
                addLog(name + ' ran out of energy and landed!', 'system');
            }
        }

        entity.energy = Math.min(ENERGY_START + 10, entity.energy + ENERGY_REGEN);

        // Hunger/thirst drain — affected by meeple traits and sleep
        var hungerMult = data.hungerDrainMult || 1;
        var thirstMult = data.thirstDrainMult || 1;
        if (entity.sleeping) {
            hungerMult *= (data.sleepDrainMult || 0.3);
            thirstMult *= (data.sleepDrainMult || 0.3);
        }
        entity.hunger -= HUNGER_DRAIN * hungerMult;
        entity.thirst -= THIRST_DRAIN * thirstMult;

        // Paralyse — skip turns based on health
        if (entity.paralysed && entity.paralysed > 0) {
            entity.paralysed--;
            addLog(name + ' is paralysed! Skipping turn. (' + entity.paralysed + ' turns left)', 'system');
        }

        if (entity.poison && entity.poison.turns > 0) {
            entity.health -= entity.poison.dmg;
            entity.poison.turns--;
            addLog(name + ' takes ' + entity.poison.dmg + ' poison damage! (' + entity.poison.turns + ' turns left)', 'system');
        }

        if (entity.bleed && entity.bleed.turns > 0) {
            entity.health -= entity.bleed.dmg;
            entity.bleed.turns--;
            addLog(name + ' takes ' + entity.bleed.dmg + ' bleed damage! (' + entity.bleed.turns + ' turns left)', 'system');
        }

        // Bone break tick
        if (entity.boneBreak > 0) {
            entity.boneBreak--;
            if (entity.boneBreak === 0) {
                addLog(name + '\'s bones have healed!', 'system');
            } else {
                addLog(name + ' has broken bones (' + entity.boneBreak + ' turns left). Slower, weaker, more vulnerable.', 'system');
            }
        }

        entity.hopUsed = false;
        if (entity.stunned) {
            entity.stunned = false;
            addLog(name + ' is no longer stunned.', 'system');
        }

        entity.cooldowns.forEach(function(cd, i) {
            if (cd > 0) entity.cooldowns[i]--;
        });
    }

    function startNextTurn() {
        if (checkDeath()) return;

        // Find next alive entity in turn order
        var attempts = 0;
        while (attempts < turnOrder.length) {
            var current = turnOrder[currentTurnIndex];
            if (current.entity.alive && (current.entity.health > 0 && current.entity.hunger > 0 && current.entity.thirst > 0)) {
                break;
            }
            currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
            attempts++;
        }

        if (attempts >= turnOrder.length) {
            checkDeath();
            return;
        }

        var current = turnOrder[currentTurnIndex];

        // Increment turn number when it's the first player in order's turn again
        if (currentTurnIndex === 0) turnNumber++;

        // Regrow food each full round
        if (currentTurnIndex === 0) regrowFood();

        applyTurnStart(current.entity, current.name);

        // Check if turn start killed this entity (hunger/thirst/poison)
        if (isDead(current.entity)) {
            current.entity.alive = false;
            checkDeath();
            if (phase === 'gameover') return;
            currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
            setTimeout(function() { startNextTurn(); }, 600);
            return;
        }

        // Paralysed entities skip their turn
        if (current.entity.paralysed && current.entity.paralysed > 0) {
            updateBars();
            render();
            currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
            setTimeout(function() { startNextTurn(); }, 800);
            return;
        }

        if (current.isPlayer) {
            if (!player.alive) {
                checkDeath();
                return;
            }
            phase = 'player_turn';
            selectedAction = null;
            showBanner('Your Turn! (Turn ' + turnNumber + ')');
            addLog('--- Turn ' + turnNumber + ': Your turn ---', 'system');
            if (checkDeath()) return;
            updateBars();
            updateActions();
            render();
        } else {
            if (!current.entity.alive) {
                currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
                setTimeout(function() { startNextTurn(); }, 400);
                return;
            }

            phase = 'ai_turn';

            if (current.entity.stunned) {
                addLog(current.name + ' was stunned and skips this turn!', 'pigon');
                current.entity.stunned = false;
                updateBars();
                render();
                currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
                setTimeout(function() { startNextTurn(); }, 600);
                return;
            }

            showBanner(current.name + "'s Turn");
            addLog("--- " + current.name + "'s turn ---", 'system');
            if (checkDeath()) return;
            updateBars();
            updateActions();
            render();

            setTimeout(function() { genericAI(current.entity, current.name, current.personality || 'normal'); }, 800);
        }
    }

    function startPlayerTurn() {
        // Find player in turn order and set index
        for (var i = 0; i < turnOrder.length; i++) {
            if (turnOrder[i].isPlayer) { currentTurnIndex = i; break; }
        }
        startNextTurn();
    }

    function endPlayerTurn() {
        if (phase !== 'player_turn') return;
        selectedAction = null;
        addLog('You end your turn.', 'player');

        currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
        setTimeout(function() { startNextTurn(); }, 600);
    }

    function startPigonTurn() {
        // Legacy — now handled by startNextTurn
        currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
        startNextTurn();
    }

    // Kept for backward compat with pigonAI executeNext
    var _currentAIEntity = null;
    var _currentAIName = null;

    function regrowFood() {
        berrySpots.forEach(function(s) {
            if (s.eaten && turnNumber >= s.regrowTurn) {
                board[s.r][s.c] = s.type || T_BERRY;
                s.eaten = false;
            }
        });
        fishSpots.forEach(function(s) {
            if (s.eaten && turnNumber >= s.regrowTurn) {
                board[s.r][s.c] = T_FISH;
                s.eaten = false;
            }
        });
        cactusSpots.forEach(function(s) {
            if (s.eaten && turnNumber >= s.regrowTurn) {
                board[s.r][s.c] = T_CACTUS;
                s.eaten = false;
            }
        });
        grainSpots.forEach(function(s) {
            if (s.eaten && turnNumber >= s.regrowTurn) {
                board[s.r][s.c] = T_GRAIN;
                s.eaten = false;
            }
        });
    }

    function isDead(entity) {
        return entity.health <= 0 || entity.hunger <= 0 || entity.thirst <= 0;
    }

    function getDeathCause(entity) {
        return entity.health <= 0 ? 'combat injuries' : entity.hunger <= 0 ? 'starvation' : 'dehydration';
    }

    function checkDeath() {
        if (phase === 'gameover') return true;

        // Mark dead entities
        turnOrder.forEach(function(t) {
            if (t.entity.alive && isDead(t.entity)) {
                t.entity.alive = false;
                var cause = getDeathCause(t.entity);
                addLog(t.name + ' died from ' + cause + '!', 'system');
            }
        });

        // Count alive entities
        var aliveEntities = turnOrder.filter(function(t) { return t.entity.alive; });

        // Player died?
        if (!player.alive) {
            phase = 'gameover';
            showBanner('Game Over!', 3000);
            addLog('You died! Game over.', 'system');
            updateBars();
            render();
            setTimeout(function() { close(); }, 2000);
            return true;
        }

        // Player is last one standing?
        if (aliveEntities.length <= 1 && player.alive) {
            phase = 'gameover';
            addLog('You win! +' + TOKEN_REWARD + ' Tavern Tokens!', 'system');
            GameState.tavernTokens = (GameState.tavernTokens || 0) + TOKEN_REWARD;
            showBanner('You Win! +' + TOKEN_REWARD + ' Tokens!', 3000);
            UI.showToast('Survival Game Won!', 'You outlasted everyone! +' + TOKEN_REWARD + ' Tavern Tokens.');
            if (typeof Tavern !== 'undefined') Tavern.showWinLore('pigon');
            updateBars();
            render();
            return true;
        }

        return false;
    }

    // ============================================================
    // PIGON AI
    // ============================================================
    function findNearestTarget(ai) {
        // Find nearest alive entity that isn't this AI
        var closest = null;
        var closestDist = Infinity;
        turnOrder.forEach(function(t) {
            if (t.entity === ai || !t.entity.alive) return;
            if (t.entity.health <= 0 || t.entity.hunger <= 0 || t.entity.thirst <= 0) return;
            var d = tileDistance(ai.x, ai.y, t.entity.x, t.entity.y);
            if (d < closestDist) {
                closestDist = d;
                closest = t.entity;
            }
        });
        return closest;
    }

    function genericAI(ai, aiName, personality) {
        if (phase !== 'ai_turn') return;
        if (!ai.alive) { advanceAfterAI(aiName); return; }
        if (checkDeath()) return;

        var actionQueue = [];
        var data = MEEPLES[ai.meeple];
        var target = findNearestTarget(ai);
        if (!target) { advanceAfterAI(aiName); return; }

        // Personality modifiers
        var aggressiveness = personality === 'aggressive' ? 1.5 : personality === 'defensive' ? 0.3 : personality === 'erratic' ? Math.random() * 2 : 1;

        // Priority 0: Turtle hide
        if (data.canHide) {
            var distToT = tileDistance(ai.x, ai.y, target.x, target.y);
            if (!ai.hiding && ai.health <= data.maxHealth * 0.3 && distToT <= 3 && ai.energy >= 2) {
                actionQueue.push(function() { doHide(ai, false); });
            } else if (ai.hiding && (ai.health > data.maxHealth * 0.5 || distToT > 5)) {
                actionQueue.push(function() { doHide(ai, false); });
            }
            if (ai.hiding) {
                if (actionQueue.length > 0) {
                    executeAIQueue(actionQueue, aiName, 0);
                } else {
                    addLog(aiName + ' stays hidden in shell.', 'pigon');
                    advanceAfterAI(aiName);
                }
                return;
            }
        }

        // Priority 0b: Fly toggle (falcon)
        if (data.canFly) {
            var distToTarget = tileDistance(ai.x, ai.y, target.x, target.y);
            if (!ai.flying && ai.health <= data.maxHealth * 0.4 && ai.energy >= 3) {
                // Take flight when low health
                actionQueue.push(function() { doFly(ai, false); });
            } else if (ai.flying && (ai.energy <= 3 || (ai.health > data.maxHealth * 0.6 && distToTarget <= 3))) {
                // Land when low energy or healthy enough to fight
                actionQueue.push(function() { doFly(ai, false); });
            }
        }

        // Priority 0c: Sleep toggle (mouse)
        if (data.canSleep) {
            if (!ai.sleeping && ai.hunger < 20 && ai.thirst < 20 && !canEatAt(ai)) {
                // Sleep to conserve when starving and no food
                actionQueue.push(function() { doSleep(ai, false); });
            } else if (ai.sleeping && (canEatAt(ai) || ai.hunger > 40)) {
                // Wake up when food available or not starving
                actionQueue.push(function() { doSleep(ai, false); });
            }
        }

        // Priority 1: Drink if thirst is getting low
        // waterFear meeples need to seek water much earlier since they can only drink from edges
        var thirstThreshold = data.waterFear ? 50 : 30;
        if (ai.thirst < thirstThreshold && ai.energy >= DRINK_COST) {
            if (canDrinkAt(ai)) {
                actionQueue.push(function() { doDrink(ai, false); });
            } else {
                var waterTile = findNearest(ai, [T_WATER, T_FISH, T_POOL]);
                if (waterTile) {
                    actionQueue.push(function() { moveToward(ai, waterTile.c, waterTile.r, false); });
                }
            }
        }

        // Priority 2: Eat if hunger is getting low
        var hungerThreshold = 30;
        if (ai.hunger < hungerThreshold && ai.energy >= EAT_COST && actionQueue.length < 2) {
            if (canEatAt(ai)) {
                actionQueue.push(function() { doEat(ai, false); });
            } else {
                var foodTypes = [];
                if (data.canEat.indexOf('berry') !== -1) { foodTypes.push(T_BERRY); foodTypes.push(T_GRAIN); }
                if (data.canEat.indexOf('grain') !== -1) foodTypes.push(T_GRAIN);
                if (data.canEat.indexOf('fish') !== -1) foodTypes.push(T_FISH);
                if (data.canEat.indexOf('cactus') !== -1) foodTypes.push(T_CACTUS);
                if (data.canEat.indexOf('flower') !== -1) foodTypes.push(T_FLOWER);
                var foodTile = findNearest(ai, foodTypes);
                if (foodTile) {
                    actionQueue.push(function() { moveToward(ai, foodTile.c, foodTile.r, false); });
                }
            }
        }

        // Priority 3: Attack nearest target
        var isCarnivore = data.cls === 'Carnivore';
        var willAttack = isCarnivore || ai.health <= data.maxHealth * 0.3 || Math.random() < (0.1 * aggressiveness);
        // Aggressive personality always attacks, defensive rarely
        if (personality === 'aggressive') willAttack = true;
        if (personality === 'defensive' && ai.health > data.maxHealth * 0.5) willAttack = false;

        // Don't attack flying targets if we're not flying
        if (target.flying && !ai.flying) willAttack = false;

        if (willAttack && actionQueue.length < 3 && ai.energy >= 2) {
            var dist = tileDistance(ai.x, ai.y, target.x, target.y);
            for (var aidx = 0; aidx < data.attacks.length; aidx++) {
                var atk = data.attacks[aidx];
                if (dist <= atk.range && ai.energy >= atk.cost && (ai.cooldowns[aidx] || 0) === 0) {
                    (function(idx, tgt) {
                        actionQueue.push(function() { doAttack(ai, tgt, idx, false); });
                    })(aidx, target);
                    break;
                }
            }
            // Carnivores/aggressive try a second attack
            if ((isCarnivore || personality === 'aggressive') && actionQueue.length < 3 && ai.energy >= 4) {
                for (var ai2 = 0; ai2 < data.attacks.length; ai2++) {
                    var atk2 = data.attacks[ai2];
                    if (dist <= atk2.range && ai.energy >= atk2.cost * 2 && (ai.cooldowns[ai2] || 0) <= 1) {
                        (function(idx, tgt) {
                            actionQueue.push(function() { doAttack(ai, tgt, idx, false); });
                        })(ai2, target);
                        break;
                    }
                }
            }
        }

        // Priority 4: Chase or flee
        if (actionQueue.length < 3 && ai.energy >= MOVE_COST && ai.hunger > 20 && ai.thirst > 20) {
            var distToTarget = tileDistance(ai.x, ai.y, target.x, target.y);
            if ((isCarnivore || personality === 'aggressive') && distToTarget > 2) {
                // Carnivores and aggressive personalities chase
                actionQueue.push(function() { moveToward(ai, target.x, target.y, false); });
            } else if (personality === 'defensive' && distToTarget <= 4) {
                // Defensive runs away if close
                actionQueue.push(function() { moveAwayFrom(ai, target.x, target.y, false); });
            } else if (!isCarnivore && distToTarget <= 3) {
                // Herbivores flee if close
                actionQueue.push(function() { moveAwayFrom(ai, target.x, target.y, false); });
            } else if (distToTarget > 4) {
                // Everyone else: slowly approach (curiosity / territorial)
                actionQueue.push(function() { moveToward(ai, target.x, target.y, false); });
            }
        }

        // Priority 4b: Use dash/hop to close distance or flee (free action)
        if (!ai.hopUsed) {
            var hopOrDash = data.hopRange || data.dashRange || 0;
            if (hopOrDash > 0) {
                var distToTarget2 = tileDistance(ai.x, ai.y, target.x, target.y);
                if (isCarnivore && distToTarget2 > 2) {
                    // Dash/hop toward target
                    (function(t, hr) {
                        actionQueue.push(function() {
                            var dx2 = t.x - ai.x;
                            var dy2 = t.y - ai.y;
                            var d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                            if (d2 > 0) {
                                var mx = Math.round(ai.x + (dx2 / d2) * Math.min(hr, d2));
                                var my = Math.round(ai.y + (dy2 / d2) * Math.min(hr, d2));
                                mx = Math.max(0, Math.min(BOARD_SIZE - 1, mx));
                                my = Math.max(0, Math.min(BOARD_SIZE - 1, my));
                                if (board[my][mx] !== T_ROCK) {
                                    ai.x = mx; ai.y = my; ai.hopUsed = true;
                                    addLog(entityName(ai) + ' dashed forward!', 'pigon');
                                    updateAfterAction();
                                }
                            }
                        });
                    })(target, hopOrDash);
                } else if (!isCarnivore && distToTarget2 <= 2) {
                    // Hop/dash away from danger
                    (function(t, hr) {
                        actionQueue.push(function() {
                            var dx2 = ai.x - t.x;
                            var dy2 = ai.y - t.y;
                            var d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                            if (d2 > 0) {
                                var mx = Math.round(ai.x + (dx2 / d2) * hr);
                                var my = Math.round(ai.y + (dy2 / d2) * hr);
                                mx = Math.max(0, Math.min(BOARD_SIZE - 1, mx));
                                my = Math.max(0, Math.min(BOARD_SIZE - 1, my));
                                if (board[my][mx] !== T_ROCK) {
                                    ai.x = mx; ai.y = my; ai.hopUsed = true;
                                    addLog(entityName(ai) + ' hopped away!', 'pigon');
                                    updateAfterAction();
                                }
                            }
                        });
                    })(target, hopOrDash);
                }
            }
        }

        // Priority 5: Erratic personality — random moves sometimes
        if (personality === 'erratic' && actionQueue.length === 0 && ai.energy >= MOVE_COST) {
            var randX = Math.floor(Math.random() * BOARD_SIZE);
            var randY = Math.floor(Math.random() * BOARD_SIZE);
            actionQueue.push(function() { moveToward(ai, randX, randY, false); });
        }

        // Priority 6: Wander toward food
        if (actionQueue.length === 0 && ai.energy >= MOVE_COST) {
            var wanderTargets = [];
            if (data.canEat.indexOf('berry') !== -1) wanderTargets.push(T_BERRY);
            if (data.canEat.indexOf('fish') !== -1) wanderTargets.push(T_FISH);
            if (data.canEat.indexOf('cactus') !== -1) wanderTargets.push(T_CACTUS);
            if (data.canEat.indexOf('flower') !== -1) wanderTargets.push(T_FLOWER);
            var wanderTarget = findNearest(ai, wanderTargets);
            if (wanderTarget) {
                actionQueue.push(function() { moveToward(ai, wanderTarget.c, wanderTarget.r, false); });
            }
        }

        // Priority 7: Wander toward nearest water (proactive survival)
        if (actionQueue.length === 0 && ai.energy >= MOVE_COST) {
            var waterTarget = findNearest(ai, [T_WATER, T_FISH, T_POOL]);
            if (waterTarget) {
                actionQueue.push(function() { moveToward(ai, waterTarget.c, waterTarget.r, false); });
            }
        }

        // Priority 8: Random wander — always do SOMETHING
        if (actionQueue.length === 0 && ai.energy >= MOVE_COST) {
            var rx = Math.floor(Math.random() * BOARD_SIZE);
            var ry = Math.floor(Math.random() * BOARD_SIZE);
            actionQueue.push(function() { moveToward(ai, rx, ry, false); });
        }

        if (actionQueue.length === 0) {
            addLog(aiName + ' rests (no energy).', 'pigon');
            advanceAfterAI(aiName);
        } else {
            executeAIQueue(actionQueue, aiName, 0);
        }
    }

    function executeAIQueue(queue, aiName, index) {
        if (index >= queue.length || phase === 'gameover') {
            updateBars();
            render();
            if (checkDeath()) return;
            advanceAfterAI(aiName);
            return;
        }

        queue[index]();
        updateBars();
        render();
        if (checkDeath()) return;

        setTimeout(function() { executeAIQueue(queue, aiName, index + 1); }, 700);
    }

    function advanceAfterAI(aiName) {
        addLog(aiName + ' ends their turn.', 'pigon');
        currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
        setTimeout(function() { startNextTurn(); }, 600);
    }

    // Keep old pigonAI as alias for backward compat
    function pigonAI() {
        genericAI(pigon, 'Pigon', 'normal');
    }

    function findNearest(entity, terrainTypes) {
        var best = null;
        var bestDist = Infinity;
        for (var r = 0; r < BOARD_SIZE; r++) {
            for (var c = 0; c < BOARD_SIZE; c++) {
                if (terrainTypes.indexOf(board[r][c]) !== -1) {
                    var d = tileDistance(entity.x, entity.y, c, r);
                    if (d < bestDist) {
                        bestDist = d;
                        best = { r: r, c: c };
                    }
                }
            }
        }
        return best;
    }

    function moveToward(entity, targetX, targetY, isPlayer) {
        var data = MEEPLES[entity.meeple];
        var onWater = isOnTerrain(entity, T_WATER) || isOnTerrain(entity, T_FISH) || isOnTerrain(entity, T_POOL);
        var speed = onWater ? data.waterSpeed : data.landSpeed;
        var maxDist = Math.floor(entity.energy / MOVE_COST) * speed;

        var dx = targetX - entity.x;
        var dy = targetY - entity.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= 0) return;

        var moveDist = Math.min(dist, maxDist);
        var newX = Math.round(entity.x + (dx / dist) * moveDist);
        var newY = Math.round(entity.y + (dy / dist) * moveDist);

        // Clamp to board
        newX = Math.max(0, Math.min(BOARD_SIZE - 1, newX));
        newY = Math.max(0, Math.min(BOARD_SIZE - 1, newY));

        // Avoid rocks
        if (board[newY][newX] === T_ROCK) {
            // Try adjacent tiles
            var alternatives = [
                { x: newX + 1, y: newY }, { x: newX - 1, y: newY },
                { x: newX, y: newY + 1 }, { x: newX, y: newY - 1 }
            ];
            var found = false;
            for (var i = 0; i < alternatives.length; i++) {
                var ax = alternatives[i].x;
                var ay = alternatives[i].y;
                if (ax >= 0 && ax < BOARD_SIZE && ay >= 0 && ay < BOARD_SIZE && board[ay][ax] !== T_ROCK) {
                    newX = ax;
                    newY = ay;
                    found = true;
                    break;
                }
            }
            if (!found) return;
        }

        doMove(entity, newX, newY, isPlayer);
    }

    function moveAwayFrom(entity, targetX, targetY, isPlayer) {
        var data = MEEPLES[entity.meeple];
        var onWater = isOnTerrain(entity, T_WATER) || isOnTerrain(entity, T_FISH) || isOnTerrain(entity, T_POOL);
        var speed = onWater ? data.waterSpeed : data.landSpeed;
        var maxDist = Math.floor(entity.energy / MOVE_COST) * speed;

        // Move in opposite direction
        var dx = entity.x - targetX;
        var dy = entity.y - targetY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 0) { dx = 1; dy = 0; dist = 1; }

        var moveDist = Math.min(3, maxDist); // Don't flee too far
        var newX = Math.round(entity.x + (dx / dist) * moveDist);
        var newY = Math.round(entity.y + (dy / dist) * moveDist);

        newX = Math.max(0, Math.min(BOARD_SIZE - 1, newX));
        newY = Math.max(0, Math.min(BOARD_SIZE - 1, newY));

        if (board[newY][newX] === T_ROCK || board[newY][newX] === T_TREE) {
            var alternatives = [
                { x: newX + 1, y: newY }, { x: newX - 1, y: newY },
                { x: newX, y: newY + 1 }, { x: newX, y: newY - 1 }
            ];
            var found = false;
            for (var i = 0; i < alternatives.length; i++) {
                var ax = alternatives[i].x;
                var ay = alternatives[i].y;
                if (ax >= 0 && ax < BOARD_SIZE && ay >= 0 && ay < BOARD_SIZE && board[ay][ax] !== T_ROCK && board[ay][ax] !== T_TREE) {
                    newX = ax; newY = ay; found = true; break;
                }
            }
            if (!found) return;
        }

        doMove(entity, newX, newY, isPlayer);
    }

    // ============================================================
    // CANVAS CLICK HANDLER
    // ============================================================
    function onCanvasClick(e) {
        var canvas = document.getElementById('pigon-canvas');
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        var tileX = Math.floor(mx / TILE_PX);
        var tileY = Math.floor(my / TILE_PX);

        if (tileX < 0 || tileX >= BOARD_SIZE || tileY < 0 || tileY >= BOARD_SIZE) return;
        if (!player || !player.alive) return;

        // Placement phase
        if (phase === 'place_player') {
            if (board[tileY][tileX] === T_ROCK || board[tileY][tileX] === T_WATER || board[tileY][tileX] === T_FISH) return;
            player.x = tileX;
            player.y = tileY;
            addLog('You placed your ' + MEEPLES[player.meeple].name + ' at (' + tileX + ',' + tileY + ').', 'player');
            phase = 'place_pigon';
            render();
            setTimeout(function() { placePigon(); }, 600);
            return;
        }

        if (phase !== 'player_turn') return;

        // Move action
        if (selectedAction === 'move') {
            if (!canEnterTile(player, tileX, tileY)) return;
            var moveCost = getMoveCost(player, player.x, player.y, tileX, tileY);
            if (player.energy >= moveCost) {
                doMove(player, tileX, tileY, true);
                selectedAction = null;
                updateAfterAction();
            }
            return;
        }

        // Hop action (rabbit — free, limited range)
        if (selectedAction === 'hop') {
            if (!canEnterTile(player, tileX, tileY)) return;
            var hopDist = tileDistance(player.x, player.y, tileX, tileY);
            var hopRange = MEEPLES[player.meeple].hopRange || 0;
            if (hopDist <= hopRange && !player.hopUsed) {
                player.x = tileX;
                player.y = tileY;
                player.hopUsed = true;
                addLog('You hopped to (' + tileX + ',' + tileY + ')! [FREE]', 'player');
                selectedAction = null;
                updateAfterAction();
            }
            return;
        }

        // Dash action (desert fox — free, ignores obstacles)
        if (selectedAction === 'dash') {
            var dashDist = tileDistance(player.x, player.y, tileX, tileY);
            var dashRange = MEEPLES[player.meeple].dashRange || 0;
            // Dash ignores obstacles — only blocked by board edges
            if (dashDist <= dashRange && !player.hopUsed && board[tileY][tileX] !== T_ROCK) {
                player.x = tileX;
                player.y = tileY;
                player.hopUsed = true; // Shares cooldown with hop
                addLog('You dashed to (' + tileX + ',' + tileY + ')! [FREE]', 'player');
                selectedAction = null;
                updateAfterAction();
            }
            return;
        }

        // Attack actions
        if (selectedAction === 'attack1' || selectedAction === 'attack2') {
            var atkIdx = selectedAction === 'attack1' ? 0 : 1;
            // Check if clicking on any alive opponent's position
            var clickedTarget = null;
            opponents.forEach(function(opp) {
                if (opp.entity.alive && tileX === opp.entity.x && tileY === opp.entity.y) {
                    clickedTarget = opp.entity;
                }
            });
            if (clickedTarget) {
                doAttack(player, clickedTarget, atkIdx, true);
                selectedAction = null;
                updateAfterAction();
            }
            return;
        }
    }

    // ============================================================
    // MEEPLE SELECTION
    // ============================================================
    function showMeepleSelect() {
        phase = 'select';
        var selectDiv = document.getElementById('pigon-select');
        var container = document.getElementById('pigon-container');
        selectDiv.style.display = 'block';
        container.style.display = 'none';

        var biomeName = currentBiome === 'sandstone_valley' ? 'Sandstone Valley' : 'Happy Forest';
        var html = '<h2>Choose Your Meeple</h2>';
        html += '<p style="color:#aaa;font-size:13px;">Biome: <strong style="color:#DAA520;">' + biomeName + '</strong> — Pick an animal to survive with!</p>';
        html += '<div style="text-align:left;margin-bottom:8px;"><button onclick="PigonGame.showBiomeSelect()" style="background:#333;color:#aaa;border:1px solid #555;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:11px;">← Back to biome select</button></div><div>';

        var unlockedMeeples = GameState.unlockedMeeples || [];
        Object.keys(MEEPLES).forEach(function(id) {
            var m = MEEPLES[id];
            // Filter by biome: show only meeples for current biome (or meeples with no biome = happy_forest)
            var meepleBiome = m.biome || 'happy_forest';
            if (meepleBiome !== currentBiome) return;

            var isLocked = m.purchasable && unlockedMeeples.indexOf(id) === -1;

            if (isLocked) {
                html += '<div class="meeple-card" style="opacity:0.4;cursor:not-allowed;">';
                html += '<div class="meeple-icon">🔒</div>';
                html += '<div class="meeple-name">' + m.name + '</div>';
                html += '<div class="meeple-class" style="color:#aa4444;">LOCKED — Buy from Pigierre (' + m.cost + ' tokens)</div>';
                html += '<div class="meeple-stats"><span style="color:#888;">' + m.desc + '</span></div>';
                html += '</div>';
            } else {
                html += '<div class="meeple-card" data-meeple="' + id + '" onclick="PigonGame.selectMeeple(\'' + id + '\')">';
                html += '<div class="meeple-icon">' + m.icon + '</div>';
                html += '<div class="meeple-name">' + m.name + '</div>';
                html += '<div class="meeple-class">' + m.cls + '</div>';
                html += '<div class="meeple-stats">';
                html += '❤️ HP: ' + m.health + '<br>';
                html += '🏃 Land: ' + m.landSpeed + 'x | 🏊 Water: ' + m.waterSpeed + 'x<br>';
                html += '⚔️ ' + m.attacks.map(function(a) { return a.name; }).join(', ') + '<br>';
                if (m.hopRange) html += '🐇 Free hop: ' + m.hopRange + ' tiles/turn<br>';
                if (m.climber) html += '🌳 Can climb trees!<br>';
                html += '<span style="color:#888;">' + m.desc + '</span>';
                html += '</div></div>';
            }
        });

        html += '</div><button id="pigon-select-btn" disabled onclick="PigonGame.confirmSelect()">Choose & Play</button>';
        selectDiv.innerHTML = html;
    }

    var selectedMeeple = null;

    function selectMeeple(id) {
        selectedMeeple = id;
        document.querySelectorAll('.meeple-card').forEach(function(card) {
            card.classList.toggle('selected', card.dataset.meeple === id);
        });
        var btn = document.getElementById('pigon-select-btn');
        if (btn) btn.disabled = false;
    }

    function makeEntity(meepleId) {
        var d = MEEPLES[meepleId];
        return {
            meeple: meepleId, x: null, y: null,
            health: d.maxHealth, hunger: HUNGER_START, thirst: THIRST_START,
            energy: ENERGY_START, cooldowns: [0, 0], poison: null, stunned: false,
            hopUsed: false, hiding: false, blinded: false, bleed: null, alive: true,
            sleeping: false, flying: false, paralysed: 0,
            boneBreak: 0 // Turns remaining of broken bones
        };
    }

    function pickRandomMeeple(excludeIds) {
        var options = Object.keys(MEEPLES).filter(function(id) {
            if (excludeIds.indexOf(id) !== -1) return false;
            var meepleBiome = MEEPLES[id].biome || 'happy_forest';
            return meepleBiome === currentBiome;
        });
        return options[Math.floor(Math.random() * options.length)];
    }

    function confirmSelect() {
        if (!selectedMeeple) return;

        var mData = MEEPLES[selectedMeeple];
        player = makeEntity(selectedMeeple);

        // Pigon picks a different meeple
        var usedMeeples = [selectedMeeple];
        var pigonMeeple = pickRandomMeeple(usedMeeples);
        usedMeeples.push(pigonMeeple);
        var pData = MEEPLES[pigonMeeple];
        pigon = makeEntity(pigonMeeple);
        pigon.name = 'Pigon';
        pigon.personality = 'normal';

        // Create gossiper opponents
        opponents = [{ entity: pigon, name: 'Pigon', personality: 'normal' }];

        var gossipPersonalities = {
            grunton: 'aggressive',
            truffle: 'defensive',
            snickers: 'erratic'
        };
        var gossipNames = {
            grunton: 'Grunton',
            truffle: 'Truffle',
            snickers: 'Snickers'
        };

        invitedGossipers.forEach(function(gId) {
            var gMeeple = pickRandomMeeple(usedMeeples);
            usedMeeples.push(gMeeple);
            var gEntity = makeEntity(gMeeple);
            gEntity.name = gossipNames[gId];
            gEntity.personality = gossipPersonalities[gId];
            opponents.push({ entity: gEntity, name: gossipNames[gId], personality: gossipPersonalities[gId] });
        });

        // Build randomized turn order
        turnOrder = [{ entity: player, name: 'You', isPlayer: true }];
        opponents.forEach(function(opp) {
            turnOrder.push({ entity: opp.entity, name: opp.name, isPlayer: false, personality: opp.personality });
        });
        // Shuffle turn order
        for (var i = turnOrder.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = turnOrder[i];
            turnOrder[i] = turnOrder[j];
            turnOrder[j] = temp;
        }
        currentTurnIndex = 0;

        // Setup UI
        document.getElementById('pigon-select').style.display = 'none';
        document.getElementById('pigon-container').style.display = 'flex';

        document.getElementById('pigon-player-icon').textContent = mData.icon;
        document.getElementById('pigon-player-name').textContent = mData.name;
        // Opponent panels are built dynamically by updateBars()

        // Show turn order
        var orderNames = turnOrder.map(function(t) { return t.name; });
        addLog('Turn order: ' + orderNames.join(' → '), 'system');

        // Generate board
        generateBoard();
        logMessages = [];
        document.getElementById('pigon-log').innerHTML = '';
        turnNumber = 0;

        var allPicks = [mData.name + ' (You)'];
        opponents.forEach(function(opp) {
            allPicks.push(MEEPLES[opp.entity.meeple].name + ' (' + opp.name + ')');
        });
        addLog('Meeples: ' + allPicks.join(', '), 'system');
        addLog('Turn order: ' + orderNames.join(' → '), 'system');
        addLog('Click on the board to place your meeple!', 'system');

        phase = 'place_player';
        updateBars();
        updateActions();
        render();
    }

    function placeAIEntity(entity, name) {
        // AI places meeple — try to place far from player and near food
        var data = MEEPLES[entity.meeple];
        var best = null;
        var bestScore = -Infinity;

        for (var attempts = 0; attempts < 100; attempts++) {
            var rx = Math.floor(Math.random() * BOARD_SIZE);
            var ry = Math.floor(Math.random() * BOARD_SIZE);
            if (board[ry][rx] === T_ROCK || board[ry][rx] === T_WATER || board[ry][rx] === T_FISH) continue;
            if (!canEnterTile(entity, rx, ry)) continue;

            var distFromPlayer = tileDistance(player.x, player.y, rx, ry);
            var nearFood = 0;
            var foodTypes = [];
            if (data.canEat.indexOf('berry') !== -1) foodTypes.push(T_BERRY);
            if (data.canEat.indexOf('fish') !== -1) foodTypes.push(T_FISH);
            if (data.canEat.indexOf('cactus') !== -1) foodTypes.push(T_CACTUS);
                if (data.canEat.indexOf('flower') !== -1) foodTypes.push(T_FLOWER);
            for (var dr = -5; dr <= 5; dr++) {
                for (var dc = -5; dc <= 5; dc++) {
                    var nr = ry + dr;
                    var nc = rx + dc;
                    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                        if (foodTypes.indexOf(board[nr][nc]) !== -1) nearFood++;
                    }
                }
            }

            // Also stay far from other already-placed opponents
            var minDistFromOthers = Infinity;
            opponents.forEach(function(opp) {
                if (opp.entity !== entity && opp.entity.x !== null) {
                    var d = tileDistance(opp.entity.x, opp.entity.y, rx, ry);
                    if (d < minDistFromOthers) minDistFromOthers = d;
                }
            });
            if (minDistFromOthers === Infinity) minDistFromOthers = 10;

            var score = distFromPlayer * 2 + nearFood * 3 + minDistFromOthers * 3;
            if (score > bestScore) {
                bestScore = score;
                best = { x: rx, y: ry };
            }
        }

        if (best) {
            entity.x = best.x;
            entity.y = best.y;
        } else {
            entity.x = BOARD_SIZE - 3;
            entity.y = BOARD_SIZE - 3;
        }

        addLog(name + ' placed ' + MEEPLES[entity.meeple].name + ' at (' + entity.x + ',' + entity.y + ').', 'pigon');
    }

    function placePigon() {
        // Place all AI opponents
        opponents.forEach(function(opp) {
            placeAIEntity(opp.entity, opp.name);
        });
        render();
        setTimeout(function() { startNextTurn(); }, 600);
    }

    // ============================================================
    // OPEN / CLOSE
    // ============================================================
    function open() {
        if (isOpen) return;
        isOpen = true;
        GameState.gameRunning = false;

        var overlay = document.getElementById('pigon-overlay');
        overlay.classList.remove('hidden');

        showBiomeSelect();
    }

    function showBiomeSelect() {
        phase = 'biome_select';
        var selectDiv = document.getElementById('pigon-select');
        var container = document.getElementById('pigon-container');
        selectDiv.style.display = 'block';
        container.style.display = 'none';

        var unlockedBiomes = GameState.unlockedBiomes || [];
        var sandstoneUnlocked = unlockedBiomes.indexOf('sandstone_valley') !== -1;

        var html = '<h2>Choose a Biome</h2>';
        html += '<p style="color:#aaa;font-size:13px;">Where do you want to play?</p>';
        html += '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:16px 0;">';

        // Happy Forest (always available)
        html += '<div class="meeple-card" style="cursor:pointer;border-color:#4a8a3a;" onclick="PigonGame.selectBiome(\'happy_forest\')">';
        html += '<div class="meeple-icon" style="font-size:28px;">🌲</div>';
        html += '<div class="meeple-name" style="color:#4a8a3a;">Happy Forest</div>';
        html += '<div class="meeple-stats" style="font-size:11px;">Ponds, forests, berries, and fish.<br>Classic animals: Seal, Badger, Toad, Rabbit, Squirrel.</div>';
        html += '</div>';

        // Sandstone Valley
        if (sandstoneUnlocked) {
            html += '<div class="meeple-card" style="cursor:pointer;border-color:#DAA520;" onclick="PigonGame.selectBiome(\'sandstone_valley\')">';
            html += '<div class="meeple-icon" style="font-size:28px;">🏜️</div>';
            html += '<div class="meeple-name" style="color:#DAA520;">Sandstone Valley</div>';
            html += '<div class="meeple-stats" style="font-size:11px;">Desert pools, cacti, rock mounds.<br>Desert animals: Turtle, Hare, Agama, Camelopin, Felinidon.</div>';
            html += '</div>';
        } else {
            html += '<div class="meeple-card" style="opacity:0.4;cursor:not-allowed;">';
            html += '<div class="meeple-icon" style="font-size:28px;">🔒</div>';
            html += '<div class="meeple-name">Sandstone Valley</div>';
            html += '<div class="meeple-class" style="color:#aa4444;">LOCKED — Buy from Pigierre (10 tokens)</div>';
            html += '<div class="meeple-stats" style="font-size:11px;">A scorching desert biome with new terrain and animals!</div>';
            html += '</div>';
        }

        // Ancient Prairie
        var praireUnlocked = unlockedBiomes.indexOf('ancient_prairie') !== -1;
        if (praireUnlocked) {
            html += '<div class="meeple-card" style="cursor:pointer;border-color:#c8b44a;" onclick="PigonGame.selectBiome(\'ancient_prairie\')">';
            html += '<div class="meeple-icon" style="font-size:28px;">🌾</div>';
            html += '<div class="meeple-name" style="color:#c8b44a;">Ancient Prairie</div>';
            html += '<div class="meeple-stats" style="font-size:11px;">Wide grasslands, flowers, tall grass.<br>Prairie animals: Gazelle, Ringitor, Viper, Chinchinol, Coyoteya.</div>';
            html += '</div>';
        } else {
            html += '<div class="meeple-card" style="opacity:0.4;cursor:not-allowed;">';
            html += '<div class="meeple-icon" style="font-size:28px;">🔒</div>';
            html += '<div class="meeple-name">Ancient Prairie</div>';
            html += '<div class="meeple-class" style="color:#aa4444;">LOCKED — Buy from Pigierre (15 tokens)</div>';
            html += '<div class="meeple-stats" style="font-size:11px;">A vast ancient grassland with unique animals!</div>';
            html += '</div>';
        }

        // Great Mountains
        var mountainsUnlocked = unlockedBiomes.indexOf('great_mountains') !== -1;
        if (mountainsUnlocked) {
            html += '<div class="meeple-card" style="cursor:pointer;border-color:#8a8a9a;" onclick="PigonGame.selectBiome(\'great_mountains\')">';
            html += '<div class="meeple-icon" style="font-size:28px;">🏔️</div>';
            html += '<div class="meeple-name" style="color:#8a8a9a;">Great Mountains</div>';
            html += '<div class="meeple-stats" style="font-size:11px;">Snowy peaks, rocky mounds, pine trees. Scarce water!<br>Mountain animals: Larilatone, Marten, Cliffa, Terbal, Chinchinol.</div>';
            html += '</div>';
        } else {
            html += '<div class="meeple-card" style="opacity:0.4;cursor:not-allowed;">';
            html += '<div class="meeple-icon" style="font-size:28px;">🔒</div>';
            html += '<div class="meeple-name">Great Mountains</div>';
            html += '<div class="meeple-class" style="color:#aa4444;">LOCKED — Buy from Pigierre (20 tokens)</div>';
            html += '<div class="meeple-stats" style="font-size:11px;">Snowy peaks with bone-breaking rocky terrain!</div>';
            html += '</div>';
        }

        html += '</div>';
        selectDiv.innerHTML = html;
    }

    function selectBiome(biomeId) {
        currentBiome = biomeId;
        showInviteScreen();
    }

    function showInviteScreen() {
        var selectDiv = document.getElementById('pigon-select');
        invitedGossipers = [];

        var html = '<h2>Invite Opponents</h2>';
        html += '<p style="color:#aaa;font-size:13px;">Pigon always plays. Want to invite tavern regulars for a free-for-all? Last one standing wins!</p>';
        html += '<div style="margin:16px 0;">';

        // Pigon always included
        html += '<div style="color:#ff6666;margin:8px 0;">🎲 <strong>Pigon</strong> — Always plays (Survival Master)</div>';

        // Gossiper checkboxes
        var gossipers = [
            { id: 'grunton', name: 'Grunton', desc: 'Aggressive — attacks everything in sight', icon: '💪' },
            { id: 'truffle', name: 'Truffle', desc: 'Defensive — avoids combat, focuses on survival', icon: '🌸' },
            { id: 'snickers', name: 'Snickers', desc: 'Erratic — unpredictable moves, sometimes brilliant', icon: '⚡' }
        ];

        gossipers.forEach(function(g) {
            html += '<label style="display:block;margin:8px 0;cursor:pointer;padding:6px;border:1px solid #555;border-radius:6px;" id="invite-' + g.id + '">';
            html += '<input type="checkbox" value="' + g.id + '" onchange="PigonGame.toggleInvite(\'' + g.id + '\')" style="margin-right:8px;">';
            html += g.icon + ' <strong>' + g.name + '</strong> — <span style="color:#aaa;">' + g.desc + '</span>';
            html += '</label>';
        });

        html += '</div>';
        html += '<div style="display:flex;gap:8px;justify-content:center;">';
        html += '<button onclick="PigonGame.showBiomeSelect()" style="background:#333;color:#aaa;border:1px solid #555;padding:6px 16px;border-radius:4px;cursor:pointer;">← Back</button>';
        html += '<button onclick="PigonGame.confirmInvites()" style="background:#4a8a3a;color:#fff;border:none;padding:6px 16px;border-radius:4px;cursor:pointer;font-weight:bold;">Continue →</button>';
        html += '</div>';

        selectDiv.innerHTML = html;
    }

    function toggleInvite(id) {
        var idx = invitedGossipers.indexOf(id);
        if (idx !== -1) {
            invitedGossipers.splice(idx, 1);
        } else {
            invitedGossipers.push(id);
        }
        // Highlight selected
        var label = document.getElementById('invite-' + id);
        if (label) {
            label.style.borderColor = invitedGossipers.indexOf(id) !== -1 ? '#ffcc00' : '#555';
        }
    }

    function confirmInvites() {
        showMeepleSelect();
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;
        document.getElementById('pigon-overlay').classList.add('hidden');
        document.getElementById('pigon-container').style.display = 'none';
        GameState.gameRunning = true;
        phase = 'select';
    }

    // ============================================================
    // SETUP
    // ============================================================
    function setup() {
        var canvas = document.getElementById('pigon-canvas');
        if (canvas) {
            canvas.addEventListener('click', onCanvasClick);
        }

        var quitBtn = document.getElementById('pigon-quit');
        if (quitBtn) {
            quitBtn.addEventListener('click', close);
        }

        var endTurnBtn = document.getElementById('pigon-end-turn');
        if (endTurnBtn) {
            endTurnBtn.addEventListener('click', endPlayerTurn);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                close();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }

    return {
        open: open,
        close: close,
        isOpen: function() { return isOpen; },
        selectBiome: selectBiome,
        showBiomeSelect: showBiomeSelect,
        toggleInvite: toggleInvite,
        confirmInvites: confirmInvites,
        selectMeeple: selectMeeple,
        confirmSelect: confirmSelect
    };
})();

// Test: open Pigon's game from console
window.playPigonGame = function() { PigonGame.open(); };
