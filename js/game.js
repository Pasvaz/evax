/**
 * GAME CORE
 * Contains shared state, audio, game loop, and core functions.
 */

// Shared game state - accessible by all modules
window.GameState = {
    // Three.js core objects
    scene: null,
    camera: null,
    renderer: null,
    clock: null,

    // Game objects
    peccary: null,
    enemies: [],
    resources: [],
    trees: [],
    villagers: [],
    nests: [],           // Array of nest objects (for geese)
    chasingGeese: [],    // Geese currently chasing player

    // Toad system (savannah biome - separate from goose system)
    toadNests: [],       // Array of toad nest objects
    toadMatingTimer: 0,  // Timer for mating season (every 3 minutes)
    chasingToads: [],    // Toads chasing player (after egg theft)

    // Grass viper system (savannah biome predators)
    grassViperMatingTimer: 0,  // Timer for mating run (every 4 minutes)

    // Antelope herd system (savannah biome)
    antelopeHerds: [],           // Array of herd objects
    antelopeMatingTimer: 0,      // Timer for mating season (every 8 minutes)

    // Wild dog pack system (savannah biome)
    wildDogPacks: [],            // Array of pack objects
    wildDogDens: [],             // Array of den objects
    wildDogMatingTimer: 0,       // Timer for mating (every 5 minutes)
    wildDogHuntTimer: 0,         // Timer for pack hunts (every 8-10 minutes)

    // Saltas Gazella herd system (savannah biome)
    saltasGazellaHerds: [],      // Array of herd objects
    saltasGazellaMatingTimer: 0, // Timer for mating (every 5 minutes)

    // Dronglous Cat system (savannah biome - tree-dwelling predators)
    dronglousCatMatingTimer: 0,  // Timer for mating (every 6 minutes)

    // Deericus Iricus system (snowy mountains biome)
    deerHerds: [],               // Array of deer herd objects
    deerBurrows: [],             // Burrow entrances for deer herds
    grassTufts: [],              // Grass tufts for deer grazing
    deerMatingTimer: 0,          // Timer for mating (every 6 minutes)

    // Riding system
    hasSaddle: false,            // Player has crafted a saddle
    mountedAnimal: null,         // Currently mounted animal reference

    // Game status
    gameRunning: false,
    health: 100,
    lastDamageSource: null,      // What last damaged the player (for death messages)
    hunger: 100,  // Hunger bar - decreases over time, eat food to restore
    thirst: 100,  // Thirst bar - decreases over time, stand in water to restore
    dehydrationTimer: 0,  // Timer for dehydration damage

    // Bathroom mechanic - poo and pee scheduling
    poopQueue: [],  // { time: when to poop (gameTime + 120 sec) }
    peeQueue: [],   // { time: when to pee, duration: seconds of drinking }
    poopsInWorld: [],  // Active poop objects { mesh, removeTime }
    peesInWorld: [],   // Active pee puddles { mesh, removeTime }
    isSquatting: false,  // Animation state
    squatTimer: 0,

    score: 0,
    resourceCounts: { berries: 0, nuts: 0, mushrooms: 0, seaweed: 0, eggs: 0, arsenic_mushrooms: 0, thous_pine_wood: 0, glass: 0, manglecacia_wood: 0, seaspray_birch_wood: 0, cinnamon: 0, bakka_seal_tooth: 0, flour: 0, sugar: 0, butter: 0 },
    pinnedResources: [],
    lastResourceCounts: {},
    resourceLastChanged: {},
    pigCoins: 0,
    timeElapsed: 0,

    // Progression system
    unlockedVillagers: [],
    currentLevel: "Newborn Peccary",

    // Hotbar (Minecraft-style equipment slots)
    hotbarSlots: [null, null, null, null, null, null, null, null, null],
    selectedHotbarSlot: 0,

    // Arsen bomb puddle system
    activePuddles: [],
    arsenBombsUsed: 0,

    // Stamina system
    stamina: 100,           // Current stamina (0-100)
    maxStamina: 100,        // Max stamina
    attackCooldown: 0,      // Time remaining before next sword swing (seconds)
    chopCooldown: 0,        // Time remaining before next axe chop (seconds)

    // Skin system
    currentSkin: 'default',
    unlockedSkins: ['default'],
    easterMode: false,

    // Easter event
    easterEventActive: false,     // Set by startEaster()/stopEaster()
    easterBunniesCaught: 0,       // Persisted across saves
    easterBunnies: [],            // Active bunny objects in world
    chocolateEggs: 0,             // Easter currency (persisted)
    easterQuest: null,            // Active quest { id, goal, progress, reward }
    easterQuestBunnyCaught: 0,    // Bunnies caught during current quest
    easterQuestEggsCollected: 0,  // Easter eggs collected during current quest
    easterStalls: [],             // Easter stall meshes (for cleanup)
    easterNPCs: [],               // Easter NPC villagers (for cleanup)
    rollerSkatesOn: false,        // Whether roller skates are currently active
    easterCherryTrees: [],        // Cherry blossom tree meshes (for cleanup)
    easterPetalSystems: [],       // Petal particle systems (for cleanup)
    easterSkyActive: false,       // Whether Easter sky override is on
    easterLamb: null,             // Active naughty lamb (only one at a time)
    easterSheep: [],              // Permanent sheep (grown from uncaught lambs)
    easterSheepHerds: [],         // Herd objects { leader, members[], matingCooldown }
    easterSheepLambs: [],         // Sheep-born lambs (secondary catchable lambs)
    petalTrails: [],              // Active petal trail particle systems

    // Easter flamingos
    easterFlamingos: [],          // Active flamingo objects in world
    hasFlamingoLicense: false,    // Bought from Clover (persisted)
    mountedFlamingo: null,        // Currently mounted flamingo reference
    flamingoFlyHeight: 0,        // Current altitude above ground when flying
    isFlamingoFlying: false,     // Whether the player is mounted and airborne

    // Easter piglets
    easterPiglets: [],            // Wild piglet objects in world
    ownedPiglets: [],             // All piglets the player owns (inventory)
    activePiglets: [],            // Up to 3 active companion piglets (following Pedro)
    inEasterBiome: false,         // Whether player is in Easter biome area
    easterEggs: 0,                // Currency for Larry's egg shop
    larryQuestIndex: 0,           // Current quest index
    completedLarryQuests: [],     // Completed quest IDs

    // Input handling
    keys: {},

    // Physics
    velocity: null,
    isJumping: false,
    groundLevel: 0,

    // Timers
    spawnIntervals: [],

    // Sprint sound control
    wasSprinting: false,

    // Villager interaction
    nearbyVillager: null,
    isDialogOpen: false,
    currentDialogNode: null,
    currentDialogVillager: null,

    // Crafting system
    isCraftMenuOpen: false,

    // Inventory system
    isInventoryOpen: false,
    inventoryItems: [],          // Array of { id, count } for crafted items

    // Artifact system
    artifacts: [],               // Array of artifact IDs the player is carrying (max 8)
    artifactsGiven: [],          // Array of artifact IDs already given to scientists
    isInsideHut: false,          // Player is inside Ningle's research hut
    hutScene: null,              // Separate THREE.Scene for hut interior
    hutCamera: null,             // Camera for hut interior
    savedOutsidePosition: null,  // Player position before entering hut

    // Shop system
    isShopOpen: false,
    shopQuantities: {},

    // Minimap
    minimapCanvas: null,
    minimapCtx: null,

    // Audio
    audioCtx: null,
    soundCooldowns: { peccary: 0, badger: 0, weasel: 0 },

    // Resource key states
    resourceKeyStates: { '1': false, '2': false, '3': false, '4': false, '5': false },

    // Biome system
    currentBiome: 'arboreal',
    isTransitioning: false,
    transitionTimer: 0,

    // Border transition tracking
    borderTransitionTimer: 0,
    borderTransitionRequired: 2,  // Seconds of standing still required
    lastPlayerPosition: { x: 0, z: 0 },
    onBorder: null,  // Which border: 'north', 'south', or null

    // Camera orbit (click-and-drag to rotate)
    cameraAngle: 0,              // Horizontal orbit angle in radians
    cameraDragging: false,
    cameraDragStartX: 0,
    cameraDragStartAngle: 0,
    cameraDragMoved: false,

    // Testing mode
    isTestingMode: false,
    isTestingMenuOpen: false,

    // Become Animal feature (testing mode only)
    becomeAnimalMode: null,      // 'control' or 'spectate' or null
    becomeAnimalTarget: null,    // The animal being controlled/spectated
    becomeAnimalOriginalPos: null, // Peccary's position before becoming

    // Raft / Boat system
    isPlacingRaft: false,        // Blueprint placement mode active
    raftBlueprint: null,         // The ghost mesh following the mouse
    placedRafts: [],             // Array of placed raft objects in the world
    isInBoat: false,             // Currently sailing a raft
    activeBoat: null,            // The raft mesh being sailed

    // Ocean islands
    oceanIslands: [],            // Array of island data objects in the ocean

    // Uronin Seal colonies
    sealColonies: [],            // Array of colony objects
    sealMatingTimer: 0,          // Timer for mating season (every 300 sec)

    // Underwater / Diving system
    isUnderwater: false,         // Currently swimming underwater
    oxygenLevel: 100,            // Current oxygen (0-100)
    maxOxygenTime: 30,           // Seconds of oxygen when full
    drowningTimer: 0,            // Timer for drowning damage ticks
    divingRaft: null,            // The raft to climb back onto
    normalFogColor: null,        // Stored normal fog color to restore on surface
    normalFogNear: 0,            // Stored normal fog near distance
    normalFogFar: 0              // Stored normal fog far distance
};

window.Game = (function() {
    'use strict';

    /**
     * Initialize the Web Audio API context.
     */
    function initAudio() {
        GameState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    /**
     * Play a synthesized sound effect.
     * @param {string} type - Sound type: 'peccary', 'badger', 'weasel', 'collect', 'hurt', 'jump'
     */
    function playSound(type) {
        if (!GameState.audioCtx || !GameState.gameRunning) return;

        const now = GameState.audioCtx.currentTime;

        if (GameState.soundCooldowns[type] && now < GameState.soundCooldowns[type]) return;

        const oscillator = GameState.audioCtx.createOscillator();
        const gainNode = GameState.audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(GameState.audioCtx.destination);

        switch(type) {
            case 'peccary':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(80, now);
                oscillator.frequency.exponentialRampToValueAtTime(60, now + 0.15);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                GameState.soundCooldowns.peccary = now + 0.3;
                break;

            case 'badger':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(100, now);
                oscillator.frequency.exponentialRampToValueAtTime(70, now + 0.3);
                gainNode.gain.setValueAtTime(0.12, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                oscillator.start(now);
                oscillator.stop(now + 0.35);
                GameState.soundCooldowns.badger = now + 1.5;
                break;

            case 'weasel':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.15);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                GameState.soundCooldowns.weasel = now + 1.2;
                break;

            case 'collect':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case 'hurt':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case 'jump':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                gainNode.gain.setValueAtTime(0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                oscillator.start(now);
                oscillator.stop(now + 0.12);
                break;

            case 'cat_pounce':
                // Scary cat screech/hiss when pouncing from tree
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.25);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                GameState.soundCooldowns.cat_pounce = now + 1.0;
                break;
        }
    }

    /**
     * Handle player taking damage from an enemy.
     */
    function takeDamage(amount, enemyType) {
        // Testing mode - invincible! Skip all damage
        if (GameState.isTestingMode) {
            return;
        }

        // Bubble shield blocks one hit
        if (GameState.pigletBuffs && GameState.pigletBuffs.bubbleShieldActive) {
            if (consumeBubbleShield()) return; // Damage fully blocked
        }

        GameState.health -= amount;
        GameState.lastDamageSource = enemyType || 'unknown';
        playSound('hurt');
        if (enemyType) playSound(enemyType);
        UI.updateUI();

        if (GameState.health <= 0) {
            gameOver();
        }
    }

    /**
     * Update camera position to follow the player.
     */
    function updateCamera() {
        // Flamingo flight camera — behind the flamingo, looking forward
        if (GameState.mountedFlamingo) {
            var flamingo = GameState.mountedFlamingo;
            var fRot = flamingo.rotation.y;
            // Camera behind flamingo (opposite of facing direction)
            var camDist = 16;
            var camHeight = 6;
            var camX = flamingo.position.x - Math.cos(fRot) * camDist;
            var camZ = flamingo.position.z + Math.sin(fRot) * camDist;
            var camY = flamingo.position.y + camHeight;
            var camTarget = new THREE.Vector3(camX, camY, camZ);
            GameState.camera.position.lerp(camTarget, 0.08);
            GameState.camera.lookAt(
                flamingo.position.x,
                flamingo.position.y + 2,
                flamingo.position.z
            );
            return;
        }

        // Camera orbits the player based on cameraAngle
        var distance = 12;
        var height = 8;
        // Underwater camera — closer and lower
        if (GameState.isUnderwater) {
            distance = 8;
            height = 3;
        }
        const angle = GameState.cameraAngle;

        const offset = new THREE.Vector3(
            Math.sin(angle) * distance,
            height,
            Math.cos(angle) * distance
        );
        const targetPosition = new THREE.Vector3()
            .copy(GameState.peccary.position)
            .add(offset);

        GameState.camera.position.lerp(targetPosition, 0.05);
        GameState.camera.lookAt(
            GameState.peccary.position.x,
            GameState.peccary.position.y + 1,
            GameState.peccary.position.z
        );
    }

    /**
     * Death messages — shown on game over screen based on what killed the player.
     * Edit these to change the flavour text!
     */
    var DEATH_MESSAGES = {
        'dehydration':      "You died of thirst! Find water and drink regularly.",
        'drowning':         "You drowned! Watch your oxygen bar when diving.",
        'badger':           "A badger mauled you! Those claws are brutal.",
        'weasel':           "A sneaky weasel got you!",
        'goose':            "A mother goose defended her eggs... fatally!",
        'fox':              "A fox caught you! They're fast and cunning.",
        'leopard_toad':     "Death by toad! Those tongues pack a punch.",
        'grass_viper':      "A grass viper's bite was fatal!",
        'antelope':         "An antelope kicked you! Stay clear of their hooves.",
        'wild_dog':         "The wild dogs hunted you down!",
        'dronglous_cat':    "A Dronglous Cat pounced on you!",
        'drongulinat_cat':  "The Drongulinat Cat was too fierce!",
        'snow_caninon':     "A Snow Caninon got you in the mountains!",
        'baluban_oxen':     "A Baluban Oxen charged you down!",
        'uronin_seal':      "A seal attacked you in the water!",
        'orcleton':         "An Orcleton caught you!",
        'bakka_seal':       "A Bakka Seal got you!",
        'default':          "Something got you! Better luck next time."
    };

    /**
     * Game over handler.
     */
    function gameOver() {
        GameState.gameRunning = false;
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('final-score').textContent = 'Score: ' + GameState.score;

        // Show death cause message
        var cause = GameState.lastDamageSource || 'default';
        var msg = DEATH_MESSAGES[cause] || DEATH_MESSAGES['default'];
        document.querySelector('#game-over-screen .subtitle').textContent = msg;

        document.getElementById('ui-overlay').classList.add('hidden');
        document.getElementById('controls-info').classList.add('hidden');
        document.getElementById('minimap').classList.add('hidden');
        document.getElementById('hunger-panel').classList.add('hidden');
        document.getElementById('thirst-panel').classList.add('hidden');
        document.getElementById('stamina-panel').classList.add('hidden');
        document.getElementById('testing-indicator').classList.add('hidden');
        document.getElementById('testing-menu').classList.add('hidden');

        if (GameState.isCraftMenuOpen) {
            GameState.isCraftMenuOpen = false;
            document.getElementById('craft-menu').classList.add('hidden');
        }

        if (GameState.isShopOpen) {
            UI.closeShop();
        }

        if (GameState.isTestingMenuOpen) {
            GameState.isTestingMenuOpen = false;
        }

        GameState.spawnIntervals.forEach(id => clearInterval(id));
        GameState.spawnIntervals = [];
    }

    /**
     * Start the game.
     * @param {boolean} testingMode - Whether to start in testing mode
     * Content spawning is handled separately by spawnBiomeContent() or restoreSaveData().
     */
    function startGame(testingMode = false) {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('ui-overlay').classList.remove('hidden');
        document.getElementById('controls-info').classList.remove('hidden');
        document.getElementById('minimap').classList.remove('hidden');
        document.getElementById('hunger-panel').classList.remove('hidden');
        document.getElementById('thirst-panel').classList.remove('hidden');
        document.getElementById('stamina-panel').classList.remove('hidden');

        if (!GameState.audioCtx) initAudio();

        // Set testing mode flag
        GameState.isTestingMode = testingMode;

        if (testingMode) {
            // Testing mode - infinite resources, coins, and score
            GameState.pigCoins = 99999;
            GameState.score = 999999;
            GameState.resourceCounts = { berries: 999, nuts: 999, mushrooms: 999, seaweed: 999, eggs: 999, arsenic_mushrooms: 999, thous_pine_wood: 999, glass: 999, manglecacia_wood: 999, seaspray_birch_wood: 999, cinnamon: 999 };
            GameState.hasSaddle = true;  // Give saddle for riding gazella
            // Give all artifacts
            GameState.artifacts = ARTIFACTS.map(a => a.id);
            // Show testing mode indicator
            document.getElementById('testing-indicator').classList.remove('hidden');
        } else {
            // Normal mode
            GameState.pigCoins = CONFIG.STARTING_COINS || 50;
        }

        GameState.hunger = 100;
        GameState.thirst = 100;
        GameState.dehydrationTimer = 0;
        if (!GameState.questClues) GameState.questClues = [];
        if (!GameState.claimedGifts) GameState.claimedGifts = [];
        if (!GameState.artifactsGiven) GameState.artifactsGiven = [];
        if (!GameState.memoriesFound) GameState.memoriesFound = [];
        if (!GameState.lastMemoryScore) GameState.lastMemoryScore = 0;
        if (!GameState.discoveredAnimals) GameState.discoveredAnimals = [];
        if (!GameState.discoveredResources) GameState.discoveredResources = [];
        if (!GameState.discoveredBiomes) GameState.discoveredBiomes = [];
        UI.updateUI();

        GameState.gameRunning = true;
    }

    /**
     * Restart the game.
     */
    function restartGame() {
        // Reset testing mode
        GameState.isTestingMode = false;
        GameState.isTestingMenuOpen = false;
        document.getElementById('testing-indicator').classList.add('hidden');
        document.getElementById('testing-menu').classList.add('hidden');

        GameState.health = CONFIG.STARTING_HEALTH || 100;
        GameState.hunger = 100;
        GameState.thirst = 100;
        GameState.stamina = 100;
        GameState.attackCooldown = 0;
        GameState.chopCooldown = 0;
        GameState.dehydrationTimer = 0;
        GameState.lastDamageSource = null;
        GameState.score = 0;
        GameState.resourceCounts = Object.assign(
            { berries: 0, nuts: 0, mushrooms: 0, seaweed: 0, eggs: 0, arsenic_mushrooms: 0, thous_pine_wood: 0, glass: 0, manglecacia_wood: 0, seaspray_birch_wood: 0, cinnamon: 0 },
            CONFIG.STARTING_RESOURCES || {}
        );
        GameState.pigCoins = CONFIG.STARTING_COINS || 0;
        GameState.timeElapsed = 0;

        // Reset progression
        GameState.unlockedVillagers = [];
        GameState.currentLevel = "Newborn Peccary";

        // Reset hotbar
        GameState.hotbarSlots = [null, null, null, null, null, null, null, null, null];
        GameState.selectedHotbarSlot = 0;

        // Reset inventory and quest state
        GameState.inventoryItems = [];
        GameState.questClues = [];
        GameState.claimedGifts = [];
        GameState.artifactsGiven = [];
        GameState.pinnedResources = [];

        // Reset memory/story state (don't reset introShown — skip intro on replay)
        GameState.memoriesFound = [];
        GameState.lastMemoryScore = 0;
        GameState.chapter1Shown = false;

        // Reset discovery tracking
        GameState.discoveredAnimals = [];
        GameState.discoveredResources = [];
        GameState.discoveredBiomes = [];
        GameState.villageNotified = false;
        GameState.hungerWarned = false;
        GameState.thirstWarned = false;

        // Reset Easter event
        GameState.easterEventActive = false;
        GameState.easterBunniesCaught = 0;
        GameState.easterBunnies = [];
        GameState.chocolateEggs = 0;
        GameState.easterQuest = null;
        GameState.easterQuestBunnyCaught = 0;
        GameState.easterQuestEggsCollected = 0;
        GameState.easterStalls = [];
        GameState.easterNPCs = [];
        GameState.rollerSkatesOn = false;
        GameState.easterCherryTrees = [];
        GameState.easterPetalSystems = [];
        GameState.easterSkyActive = false;
        GameState.easterLamb = null;
        // Remove sheep-born lambs
        if (GameState.easterSheepLambs) {
            GameState.easterSheepLambs.forEach(function(l) { GameState.scene.remove(l); });
        }
        GameState.easterSheepLambs = [];
        // Remove sheep from scene
        if (GameState.easterSheep) {
            GameState.easterSheep.forEach(function(s) { GameState.scene.remove(s); });
        }
        GameState.easterSheep = [];
        GameState.easterSheepHerds = [];
        // Remove petal trails
        if (GameState.petalTrails) {
            GameState.petalTrails.forEach(function(t) { GameState.scene.remove(t.mesh); });
        }
        GameState.petalTrails = [];
        // Remove flamingos
        if (GameState.easterFlamingos) {
            GameState.easterFlamingos.forEach(function(f) { GameState.scene.remove(f); });
        }
        GameState.easterFlamingos = [];
        GameState.mountedFlamingo = null;
        GameState.isFlamingoFlying = false;
        GameState.flamingoFlyHeight = 0;
        GameState.hasFlamingoLicense = false;
        // Remove piglets
        if (GameState.easterPiglets) {
            GameState.easterPiglets.forEach(function(p) { GameState.scene.remove(p); });
        }
        GameState.easterPiglets = [];
        GameState.ownedPiglets = [];
        GameState.activePiglets = [];
        GameState.easterEggs = 0;
        GameState.larryQuestIndex = 0;
        // Clean up piglet ability projectiles
        if (GameState.pigletProjectiles) {
            GameState.pigletProjectiles.forEach(function(p) { GameState.scene.remove(p.mesh); });
        }
        GameState.pigletProjectiles = [];
        GameState.completedLarryQuests = [];
        // Chest + eyepatch reset
        if (GameState.activeChest) GameState.scene.remove(GameState.activeChest);
        GameState.activeChest = null;
        GameState.nearbyChest = null;
        GameState.chestRespawnTimer = undefined;
        GameState.eyepatchEquipped = false;

        // Clear any pending toast notifications
        UI.clearToasts();

        // Clear arsen bomb puddles
        GameState.activePuddles.forEach(function(puddle) {
            GameState.scene.remove(puddle.mesh);
        });
        GameState.activePuddles = [];

        // Clear bathroom mechanic
        GameState.poopQueue = [];
        GameState.peeQueue = [];
        GameState.poopsInWorld.forEach(p => GameState.scene.remove(p.mesh));
        GameState.poopsInWorld = [];
        GameState.peesInWorld.forEach(p => GameState.scene.remove(p.mesh));
        GameState.peesInWorld = [];
        GameState.isSquatting = false;
        GameState.drinkingTime = 0;

        if (GameState.isCraftMenuOpen) {
            GameState.isCraftMenuOpen = false;
            document.getElementById('craft-menu').classList.add('hidden');
        }

        if (GameState.isShopOpen) {
            UI.closeShop();
        }

        // Clear all biome content (enemies, resources, nests, intervals)
        clearBiomeContent();

        // Respawn player in the village (safe zone)
        GameState.peccary.position.set(
            CONFIG.VILLAGE_CENTER.x,
            0,
            CONFIG.VILLAGE_CENTER.z
        );
        GameState.peccary.rotation.y = 0;

        // Always rebuild arboreal terrain (init doesn't build terrain)
        GameState.currentBiome = 'arboreal';
        Environment.rebuildForBiome('arboreal');
        document.getElementById('biome-label').textContent = BIOMES.arboreal.displayName;

        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('ui-overlay').classList.remove('hidden');
        document.getElementById('controls-info').classList.remove('hidden');
        document.getElementById('minimap').classList.remove('hidden');
        document.getElementById('hunger-panel').classList.remove('hidden');
        document.getElementById('thirst-panel').classList.remove('hidden');
        document.getElementById('stamina-panel').classList.remove('hidden');

        UI.updateUI();
        UI.updateHotbar();
        GameState.gameRunning = true;

        // Spawn arboreal content (same as any other biome)
        spawnBiomeContent('arboreal');
    }

    /**
     * Check if player is crossing a biome border.
     * Player must stand still on the border for 2 seconds to transition.
     * Called from the game loop.
     */
    function checkBiomeTransition(delta) {
        if (GameState.isTransitioning) return;

        // Don't check for transitions in the first 2 seconds of gameplay
        if (GameState.timeElapsed < 2) return;

        // Don't transition while in the Easter biome
        if (GameState.inEasterBiome) return;

        // Don't transition if player is in the village safe zone
        if (Environment.isInVillage(GameState.peccary.position.x, GameState.peccary.position.z)) {
            // Reset any border timer if we're in the village
            if (GameState.onBorder !== null) {
                GameState.borderTransitionTimer = 0;
                GameState.onBorder = null;
            }
            return;
        }

        const biomeData = getBiomeData(GameState.currentBiome);
        const worldBorder = CONFIG.WORLD_SIZE * 0.7; // Border at 70% of world size (actual edge)
        const playerX = GameState.peccary.position.x;
        const playerZ = GameState.peccary.position.z;

        // Check if player has moved since last frame
        const moveThreshold = 0.1; // Small threshold to account for tiny movements
        const hasMoved = Math.abs(playerX - GameState.lastPlayerPosition.x) > moveThreshold ||
                         Math.abs(playerZ - GameState.lastPlayerPosition.z) > moveThreshold;

        // Update last position
        GameState.lastPlayerPosition.x = playerX;
        GameState.lastPlayerPosition.z = playerZ;

        // Determine which border player is on (if any)
        let currentBorder = null;
        let targetBiome = null;

        // Check north border (negative Z in Three.js)
        if (playerZ < -worldBorder && biomeData.transitions.north) {
            currentBorder = 'north';
            targetBiome = biomeData.transitions.north;
        }
        // Check south border (positive Z in Three.js)
        else if (playerZ > worldBorder && biomeData.transitions.south) {
            currentBorder = 'south';
            targetBiome = biomeData.transitions.south;
        }
        // Check west border (negative X in Three.js)
        else if (playerX < -worldBorder && biomeData.transitions.west) {
            currentBorder = 'west';
            targetBiome = biomeData.transitions.west;
        }
        // Check east border (positive X in Three.js)
        else if (playerX > worldBorder && biomeData.transitions.east) {
            currentBorder = 'east';
            targetBiome = biomeData.transitions.east;
        }

        // Handle border state changes
        if (currentBorder === null) {
            // Not on any border, reset timer
            if (GameState.onBorder !== null) {
                GameState.borderTransitionTimer = 0;
                GameState.onBorder = null;
            }
            return;
        }

        // Player moved while on border - reset timer
        if (hasMoved) {
            GameState.borderTransitionTimer = 0;
            GameState.onBorder = currentBorder;
            return;
        }

        // Player is standing still on a border
        if (GameState.onBorder === currentBorder) {
            // Continue counting
            GameState.borderTransitionTimer += delta;

            // Check if enough time has passed
            if (GameState.borderTransitionTimer >= GameState.borderTransitionRequired) {
                GameState.borderTransitionTimer = 0;
                GameState.onBorder = null;
                transitionToBiome(targetBiome, currentBorder);
            }
        } else {
            // Just arrived at this border
            GameState.onBorder = currentBorder;
            GameState.borderTransitionTimer = 0;
        }
    }

    /**
     * Show an on-screen message when the player is blocked from entering a biome.
     * Reuses the biome transition banner but with red border.
     */
    function showBlockedMessage(text) {
        const el = document.getElementById('biome-transition');
        const textEl = document.getElementById('biome-transition-text');
        textEl.textContent = text;
        el.style.display = 'block';
        el.style.borderColor = '#ff6666';
        setTimeout(function() {
            el.style.display = 'none';
            el.style.borderColor = '#ffcc00';
        }, 3000);
    }

    /**
     * Transition to a new biome.
     * @param {string} targetBiome - The biome ID to transition to
     * @param {string} direction - The direction of travel ('north' or 'south')
     */
    function transitionToBiome(targetBiome, direction) {
        if (GameState.isTransitioning) return;

        const targetData = getBiomeData(targetBiome);

        // Check if this biome requires a minimum score to enter
        if (targetData.requiredScore && !GameState.isTestingMode) {
            if (GameState.score < targetData.requiredScore) {
                showBlockedMessage('You need ' + targetData.requiredScore + ' score to enter ' + targetData.displayName + '! Talk to all the villagers first.');
                GameState.borderTransitionTimer = 0;
                GameState.onBorder = null;
                return;
            }
        }

        // Check if this biome requires an artifact to enter
        // Player can enter if they HAVE the artifact OR have already GIVEN it to a scientist
        if (targetData.requiresArtifact) {
            const hasIt = GameState.artifacts && GameState.artifacts.includes(targetData.requiresArtifact);
            const gaveIt = GameState.artifactsGiven && GameState.artifactsGiven.includes(targetData.requiresArtifact);
            if (!hasIt && !gaveIt) {
                const artifactData = window.getArtifactData(targetData.requiresArtifact);
                const artifactName = artifactData ? artifactData.name : 'a special artifact';
                showBlockedMessage('You need the ' + artifactName + ' to enter ' + targetData.displayName + '!');
                GameState.borderTransitionTimer = 0;
                GameState.onBorder = null;
                return;
            }
        }

        GameState.isTransitioning = true;

        // Show transition message
        const transitionEl = document.getElementById('biome-transition');
        const transitionText = document.getElementById('biome-transition-text');
        transitionText.textContent = 'Entering ' + targetData.displayName;
        transitionEl.style.display = 'block';

        // Clear current biome content
        clearBiomeContent();

        // After 3 seconds, complete the transition
        setTimeout(() => {
            // Update current biome
            GameState.currentBiome = targetBiome;

            // Position player at the opposite border (at the very edge)
            const worldSize = CONFIG.WORLD_SIZE;
            if (direction === 'north') {
                // Came from south, spawn at the very south border of new biome
                GameState.peccary.position.z = worldSize * 0.69;
                GameState.peccary.position.x = 0;
            } else if (direction === 'south') {
                // Came from north, spawn at the very north border of new biome
                GameState.peccary.position.z = -worldSize * 0.69;
                GameState.peccary.position.x = 0;
            } else if (direction === 'west') {
                // Came from east, spawn at the very east border of new biome
                GameState.peccary.position.x = worldSize * 0.69;
                GameState.peccary.position.z = 0;
            } else if (direction === 'east') {
                // Came from west, spawn at the very west border of new biome
                GameState.peccary.position.x = -worldSize * 0.69;
                GameState.peccary.position.z = 0;
            }

            // Reset border tracking to prevent immediate re-transition
            GameState.lastPlayerPosition.x = GameState.peccary.position.x;
            GameState.lastPlayerPosition.z = GameState.peccary.position.z;
            GameState.borderTransitionTimer = 0;
            GameState.onBorder = null;

            // Rebuild environment for new biome
            Environment.rebuildForBiome(targetBiome);

            // Update biome label
            document.getElementById('biome-label').textContent = targetData.displayName;

            // First-time biome discovery notification
            if (!GameState.discoveredBiomes) GameState.discoveredBiomes = [];
            if (GameState.discoveredBiomes.indexOf(targetBiome) === -1) {
                GameState.discoveredBiomes.push(targetBiome);
                UI.showToast('New Biome Discovered!', 'You discovered ' + targetData.displayName + '!');
            }

            // Spawn all biome-specific content (animals, resources, intervals)
            spawnBiomeContent(targetBiome);

            // Re-apply Easter atmosphere if event is active
            if (GameState.easterEventActive) {
                applyEasterSky();
                // Re-spawn Easter content when returning to arboreal
                if (targetBiome === 'arboreal') {
                    spawnEasterStalls();
                    spawnCherryBlossoms();
                }
            }

            // Hide transition message
            transitionEl.style.display = 'none';
            GameState.isTransitioning = false;

            // Check for biome-triggered memory fragments
            if (typeof MEMORIES !== 'undefined') {
                MEMORIES.forEach(function(fragment) {
                    if (fragment.trigger === 'biome' && fragment.biomeId === targetBiome) {
                        setTimeout(function() {
                            UI.showMemoryFlashback(fragment.id);
                        }, 1500);
                    }
                });
            }

        }, 3000);
    }

    /**
     * Spawn all biome-specific content (animals, resources, artifacts, intervals).
     * Used by both biome transition and save/load restore.
     * @param {string} biomeId - The biome to populate
     */
    function spawnBiomeContent(biomeId) {
        var targetData = getBiomeData(biomeId);

        // Spawn biome-specific animals
        if (targetData.spawnGeese && targetData.geese > 0) {
            Enemies.spawnGeese(targetData.geese);
        }
        if (targetData.spawnToads && targetData.toads > 0) {
            Enemies.spawnToads(targetData.toads);
            GameState.toadMatingTimer = 0;
        }
        if (targetData.spawnGrassVipers && targetData.grassVipers > 0) {
            Enemies.spawnGrassVipers(targetData.grassVipers);
            GameState.grassViperMatingTimer = 0;
        }
        if (targetData.spawnAntelope && targetData.antelope > 0) {
            Enemies.spawnAntelopeHerd(targetData.antelope);
            GameState.antelopeMatingTimer = 0;
        }
        if (targetData.spawnWildDogs && targetData.wildDogs > 0) {
            Enemies.spawnWildDogPack(targetData.wildDogs);
            GameState.wildDogMatingTimer = 0;
            GameState.wildDogHuntTimer = 0;
        }
        if (targetData.spawnSaltasGazella && targetData.saltasGazella > 0) {
            Enemies.spawnSaltasGazellaHerd(targetData.saltasGazella);
            GameState.saltasGazellaMatingTimer = 0;
        }
        if (targetData.spawnDronglousCats && targetData.dronglousCats > 0) {
            Enemies.spawnDronglousCats(targetData.dronglousCats);
            GameState.dronglousCatMatingTimer = 0;
        }
        if (targetData.spawnDeer && targetData.deer > 0) {
            for (let i = 0; i < targetData.deer; i++) {
                const herdSize = 2 + Math.floor(Math.random() * 7);
                Enemies.spawnDeericusIricusHerd(herdSize);
            }
            GameState.deerMatingTimer = 0;
        }
        if (targetData.spawnDrongulinatCats && targetData.drongulinatCats > 0) {
            Enemies.spawnDrongulinatCats(targetData.drongulinatCats);
            GameState.drongulinatCatMatingTimer = 0;
        }
        if (targetData.spawnSnowCaninons && targetData.snowCaninonPacks > 0) {
            for (let i = 0; i < targetData.snowCaninonPacks; i++) {
                Enemies.spawnSnowCaninonPack(i);
            }
        }
        if (targetData.spawnBalubanOxen && targetData.balubanOxenHerds > 0) {
            for (let i = 0; i < targetData.balubanOxenHerds; i++) {
                Enemies.spawnBalubanOxenHerd(18, i);
            }
        }
        // Spawn Uronin Seal colonies on islands
        if (targetData.spawnSeals && targetData.sealColonyIslands) {
            targetData.sealColonyIslands.forEach(function(islandIdx) {
                Enemies.spawnUroninSealColony(islandIdx);
            });
            GameState.sealMatingTimer = 0;
        }
        // Spawn bakka seals in the ocean
        if (targetData.spawnBakkaSeals && targetData.bakkaSeals > 0) {
            Enemies.spawnBakkaSeals(targetData.bakkaSeals);
            GameState.bakkaSealMatingTimer = 0;
        }
        // Spawn seagulls on the beach
        if (targetData.spawnSeagulls && targetData.seagullCount > 0) {
            Enemies.spawnPilferaCoastalisFlock(targetData.seagullCount);
        }
        // Spawn fish in the ocean
        if (targetData.spawnFish) {
            for (var si = 0; si < (targetData.sardineShoals || 3); si++) {
                Enemies.spawnSardineShoal();
            }
            for (var oi = 0; oi < (targetData.orcletons || 5); oi++) {
                Enemies.spawnOrcleton();
            }
        }

        // Spawn treasure chest on a random island (coastal only)
        if (biomeId === 'coastal' && !GameState.chestRespawnTimer) {
            spawnTreasureChest();
        }

        // Spawn initial resources
        for (let i = 0; i < 10; i++) {
            Items.spawnResource();
        }

        // Spawn artifacts (small chance for each type)
        if (Math.random() < 0.3) {
            Items.spawnArtifact('random');
            if (Math.random() < 0.3) Items.spawnArtifact('random');
        }
        if (Math.random() < 0.2) {
            Items.spawnArtifact('hidden');
        }

        // Restart spawn intervals
        if (biomeId === 'arboreal') {
            GameState.spawnIntervals.push(setInterval(() => {
                if (GameState.gameRunning) Enemies.spawnEnemy();
            }, CONFIG.ENEMY_SPAWN_RATE));

            // Delayed initial enemy spawn
            setTimeout(() => {
                if (GameState.gameRunning && GameState.currentBiome === 'arboreal') {
                    Enemies.spawnEnemy();
                    Enemies.spawnEnemy();
                }
            }, 3000);
        }
        GameState.spawnIntervals.push(setInterval(() => {
            if (GameState.gameRunning) Items.spawnResource();
        }, CONFIG.RESOURCE_SPAWN_RATE));
    }

    /**
     * Clear all biome-specific content (enemies, nests, resources).
     * Player keeps their inventory.
     */
    function clearBiomeContent() {
        // Stop spawn intervals
        GameState.spawnIntervals.forEach(id => clearInterval(id));
        GameState.spawnIntervals = [];

        // Stop any chasing geese
        GameState.chasingGeese = [];

        // Stop any chasing toads
        GameState.chasingToads = [];

        // Remove all enemies
        GameState.enemies.forEach(e => GameState.scene.remove(e));
        GameState.enemies = [];

        // Remove all carcasses
        if (GameState.carcasses) {
            GameState.carcasses.forEach(c => GameState.scene.remove(c));
            GameState.carcasses = [];
        }

        // Remove all resources from scene
        GameState.resources.forEach(r => GameState.scene.remove(r));
        GameState.resources = [];

        // Remove all artifacts from scene (but keep in inventory!)
        Items.clearArtifacts();

        // Remove all goose nests
        GameState.nests.forEach(n => {
            GameState.scene.remove(n.mesh);
            if (n.egg && n.egg.mesh) GameState.scene.remove(n.egg.mesh);
        });
        GameState.nests = [];

        // Remove all toad nests
        GameState.toadNests.forEach(n => {
            GameState.scene.remove(n.mesh);
            if (n.eggs) {
                n.eggs.forEach(egg => {
                    if (egg.mesh) GameState.scene.remove(egg.mesh);
                });
            }
        });
        GameState.toadNests = [];
        GameState.toadMatingTimer = 0;
        GameState.grassViperMatingTimer = 0;
        GameState.antelopeHerds = [];
        GameState.antelopeMatingTimer = 0;
        GameState.saltasGazellaHerds = [];
        GameState.saltasGazellaMatingTimer = 0;

        // Clear deer herds and burrows
        GameState.deerHerds = [];
        if (GameState.deerBurrows) {
            GameState.deerBurrows.forEach(b => GameState.scene.remove(b));
            GameState.deerBurrows = [];
        }
        if (GameState.grassTufts) {
            GameState.grassTufts.forEach(t => GameState.scene.remove(t));
            GameState.grassTufts = [];
        }
        GameState.deerMatingTimer = 0;

        // Clear snow caninon packs and dens
        GameState.snowCaninonPacks = [];
        if (GameState.snowCaninonDens) {
            GameState.snowCaninonDens.forEach(d => GameState.scene.remove(d.mesh));
            GameState.snowCaninonDens = [];
        }

        // Clear baluban oxen herds
        GameState.balubanOxenHerds = [];

        // Clear placed rafts
        if (GameState.placedRafts) {
            GameState.placedRafts.forEach(r => GameState.scene.remove(r));
            GameState.placedRafts = [];
        }
        if (GameState.raftBlueprint) {
            GameState.scene.remove(GameState.raftBlueprint);
            GameState.raftBlueprint = null;
        }
        GameState.isPlacingRaft = false;
        GameState.isInBoat = false;
        GameState.activeBoat = null;

        // Clear ocean islands
        GameState.oceanIslands = [];

        // Clear seal colonies
        GameState.sealColonies = [];
        GameState.sealMatingTimer = 0;
        GameState.bakkaSealMatingTimer = 0;
        GameState.fishRespawnTimer = 0;

        // Reset underwater state
        if (GameState.isUnderwater) {
            GameState.isUnderwater = false;
            GameState.oxygenLevel = 100;
            GameState.drowningTimer = 0;
            GameState.divingRaft = null;
            // Restore fog
            GameState.scene.fog = new THREE.Fog(0x87ceeb, 200, 1200);
            GameState.scene.background = new THREE.Color(0x87ceeb);
        }

        // Clear ocean water references
        GameState.oceanWater = null;
        GameState.oceanShoreZ = null;
        GameState.oceanDeepZ = null;

        // Clear temple position and reset ground level
        GameState.templePosition = null;
        GameState.groundLevel = 0;

        // Remove villagers
        GameState.villagers.forEach(v => GameState.scene.remove(v));
        GameState.villagers = [];
    }

    /**
     * Update snow particles (falling snowflakes).
     * @param {number} delta - Time elapsed since last frame
     */
    function updateSnowParticles(delta) {
        if (!GameState.snowParticles) return;

        const particles = GameState.snowParticles;
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.userData.velocities;
        const resetHeight = particles.userData.resetHeight;

        for (let i = 0; i < positions.length; i += 3) {
            // Update position based on velocity
            positions[i] += velocities[i / 3].x * delta * 10;  // X
            positions[i + 1] += velocities[i / 3].y * delta * 10;  // Y
            positions[i + 2] += velocities[i / 3].z * delta * 10;  // Z

            // Reset snowflake if it falls below ground
            if (positions[i + 1] < 0) {
                positions[i + 1] = resetHeight;
                positions[i] = (Math.random() - 0.5) * 150;  // New random X
                positions[i + 2] = (Math.random() - 0.5) * 150;  // New random Z
            }
        }

        // Mark geometry as needing update
        particles.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * Main game loop.
     */
    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(GameState.clock.getDelta(), 0.1);

        if (GameState.gameRunning) {
            // Check if inside research hut - pauses outside world
            if (GameState.isInsideHut) {
                // Only update interior when inside hut
                ResearchHut.updateInterior(delta);
                ResearchHut.renderInterior();
                return; // Skip normal game loop
            }

            // Pause game during piglet catching minigame
            if (GameState.pigletMinigameActive) {
                // Still render the scene but don't update anything
                GameState.renderer.render(GameState.scene, GameState.camera);
                return;
            }

            GameState.timeElapsed += delta;

            // Handle become animal mode
            if (GameState.becomeAnimalMode) {
                updateBecomeAnimal(delta);
            } else {
                Player.updatePlayer(delta);
            }
            Enemies.updateEnemies(delta);
            Enemies.updateNests(delta);
            Enemies.updateSeagullNests(delta);
            Enemies.updateEasterBunnies(delta);
            Items.updateResources(delta);
            Items.updateArtifacts(delta);
            Dialogs.updateVillagers(delta);
            updateSnowParticles(delta);
            Environment.updateGrassTufts(delta);
            updatePuddles(delta);
            updateEasterPetals(delta);
            updateEasterLamb(delta);
            updateSheepBornLambs(delta);
            updateEasterSheep(delta);
            updatePetalTrails(delta);
            updateEasterFlamingos(delta);
            updateWildPiglets(delta);
            updateCompanionPiglets(delta);
            updatePigletAbilities(delta);
            updatePigletCombatEffects(delta);
            updateTreasureChests(delta);

            // Skin effects (fuse flicker, sparkles)
            if (GameState.fuseTipRef && GameState.fuseTipRef.material) {
                GameState.fuseTipRef.material.emissiveIntensity = 1.0 + Math.sin(Date.now() * 0.01) * 0.5;
            }
            Player.updateSkinSparkles(delta);
            Player.updateBackBasket();

            checkBiomeTransition(delta);
            updateCamera();
            UI.updateMinimap();
            UI.updateUI();
            UI.updateHotbar(); // Update cooldown overlays every frame
            Player.updateBackSword(); // Show/hide sword on Pedro's back

            // Village safe zone notification (once per save)
            if (!GameState.villageNotified && GameState.currentBiome === 'arboreal' &&
                Environment.isInVillage(GameState.peccary.position.x, GameState.peccary.position.z)) {
                GameState.villageNotified = true;
                UI.showToast('Safe Zone', 'You entered the village. Enemies cannot follow you here.');
            }

            // Testing mode - keep resources infinite
            if (GameState.isTestingMode) {
                GameState.resourceCounts = { berries: 999, nuts: 999, mushrooms: 999, seaweed: 999, eggs: 999, arsenic_mushrooms: 999, thous_pine_wood: 999, glass: 999, manglecacia_wood: 999, seaspray_birch_wood: 999, cinnamon: 999 };
                GameState.pigCoins = 99999;
                GameState.score = 999999;
                GameState.hunger = 100;
                GameState.thirst = 100;
            }

            // Stamina system — recharge while walking, drain while sprinting
            // Each swing costs ~14.3 stamina (100 / 7 swings = ~14.3)
            // ALWAYS runs (even in testing mode) so combat cooldowns work
            var isSprinting = GameState.keys['shift'] && (
                GameState.keys['w'] || GameState.keys['s'] || GameState.keys['a'] || GameState.keys['d'] ||
                GameState.keys['arrowup'] || GameState.keys['arrowdown'] || GameState.keys['arrowleft'] || GameState.keys['arrowright']
            );

            if (isSprinting) {
                // Sprint drains stamina — about 10 seconds of sprinting empties the bar
                GameState.stamina = Math.max(0, GameState.stamina - delta * 10);
            } else {
                // Recharge slowly while walking (full recharge in ~8 seconds)
                GameState.stamina = Math.min(GameState.maxStamina, GameState.stamina + delta * 20);
            }

            // Tick down cooldowns
            if (GameState.attackCooldown > 0) {
                GameState.attackCooldown = Math.max(0, GameState.attackCooldown - delta);
            }
            if (GameState.chopCooldown > 0) {
                GameState.chopCooldown = Math.max(0, GameState.chopCooldown - delta);
            }

            // --- Non-testing-only: hunger/thirst drain ---
            if (!GameState.isTestingMode) {
                // Normal mode - hunger/thirst decrease over time
                // Hunger decreases slowly over time (about 1 point every 6 seconds)
                var hungerMult = (GameState.pigletBuffs ? GameState.pigletBuffs.hungerDrainMultiplier : 1.0);
                GameState.hunger = Math.max(0, GameState.hunger - delta * 0.17 * hungerMult);

                // Thirst decreases slower than hunger
                var thirstMult = (GameState.pigletBuffs ? GameState.pigletBuffs.thirstDrainMultiplier : 1.0);
                GameState.thirst = Math.max(0, GameState.thirst - delta * 0.12 * thirstMult);

                // Hunger/thirst warnings (session-only cooldown)
                if (GameState.hunger < 20 && !GameState.hungerWarned) {
                    GameState.hungerWarned = true;
                    UI.showToast('You are hungry!', 'Find food soon or you will starve.');
                } else if (GameState.hunger > 30) {
                    GameState.hungerWarned = false;
                }
                if (GameState.thirst < 20 && !GameState.thirstWarned) {
                    GameState.thirstWarned = true;
                    UI.showToast('You are thirsty!', 'Find water soon or you will dehydrate.');
                } else if (GameState.thirst > 30) {
                    GameState.thirstWarned = false;
                }

                // Dehydration damage - lose 5 health every 10 seconds when thirst is 0
                if (GameState.thirst <= 0) {
                    GameState.dehydrationTimer += delta;
                    if (GameState.dehydrationTimer >= 10) {
                        GameState.dehydrationTimer = 0;
                        GameState.lastDamageSource = 'dehydration';
                        GameState.health = Math.max(0, GameState.health - 5);
                        if (GameState.health <= 0) {
                            gameOver();
                        }
                    }
                } else {
                    GameState.dehydrationTimer = 0;  // Reset timer when not dehydrated
                }
            }

            // Toad mating season timer (savannah biome only)
            if (GameState.currentBiome === 'savannah') {
                // Update toad nests (egg collection, hatching)
                Enemies.updateToadNests(delta);

                GameState.toadMatingTimer += delta;
                // Every 3 minutes (180 seconds), trigger mating season
                if (GameState.toadMatingTimer >= 180) {
                    GameState.toadMatingTimer = 0;
                    Enemies.triggerToadMating();
                }

                // Grass viper mating run timer
                GameState.grassViperMatingTimer += delta;
                // Every 4 minutes (240 seconds), 55% chance of mating run
                if (GameState.grassViperMatingTimer >= 240) {
                    GameState.grassViperMatingTimer = 0;
                    Enemies.triggerViperMating();
                }

                // Antelope mating season timer
                GameState.antelopeMatingTimer += delta;
                // Every 8 minutes (480 seconds), trigger mating season
                if (GameState.antelopeMatingTimer >= 480) {
                    GameState.antelopeMatingTimer = 0;
                    Enemies.triggerAntelopeMating();
                }

                // Wild dog mating timer - every 5 minutes (300 seconds)
                GameState.wildDogMatingTimer += delta;
                if (GameState.wildDogMatingTimer >= 300) {
                    GameState.wildDogMatingTimer = 0;
                    Enemies.triggerWildDogMating();
                }

                // Wild dog hunt timer - every 8-10 minutes (480-600 seconds)
                GameState.wildDogHuntTimer += delta;
                // Use 540 seconds (9 minutes) as average
                if (GameState.wildDogHuntTimer >= 480 + Math.random() * 120) {
                    GameState.wildDogHuntTimer = 0;
                    Enemies.triggerWildDogHunt();
                }

                // Saltas Gazella mating timer - every 5 minutes (300 seconds)
                GameState.saltasGazellaMatingTimer += delta;
                if (GameState.saltasGazellaMatingTimer >= 300) {
                    GameState.saltasGazellaMatingTimer = 0;
                    Enemies.triggerSaltasGazellaMating();
                }

                GameState.dronglousCatMatingTimer += delta;
                // Every 6 minutes (360 seconds), trigger mating
                if (GameState.dronglousCatMatingTimer >= 360) {
                    GameState.dronglousCatMatingTimer = 0;
                    Enemies.triggerDronglousCatMating();
                }
            }

            // Deer updates — always run when deer exist (they live in snowy biome
            // but need to keep updating even when player visits other biomes)
            if (GameState.deerHerds && GameState.deerHerds.length > 0) {
                // Update deer maturation (babies grow up after 3 minutes)
                Enemies.updateDeerMaturation(delta);

                // Update bachelor herd formation (males leave crowded herds)
                Enemies.updateBachelorHerdFormation(delta);

                // Update deer mating behaviors (gestation, displays, fighting)
                Enemies.updateDeerMating(delta);

                // Update deer AI behaviors (grazing, burrows, defense, walking animation)
                GameState.enemies.forEach(enemy => {
                    if (enemy.userData.id && enemy.userData.id.includes('deericus_iricus')) {
                        Enemies.updateDeerBehavior(enemy, delta);
                    }
                });

                // Deer mating timer - every 6 minutes (360 seconds)
                GameState.deerMatingTimer += delta;
                if (GameState.deerMatingTimer >= 360) {
                    GameState.deerMatingTimer = 0;
                    Enemies.triggerDeerMating();
                }
            }

            // Dronglous Cat update - runs in all biomes for testing
            Enemies.updateDronglousCats(delta);

            // Drongulinat Cat update - snowy mountain predators
            Enemies.updateDrongulinatCats(delta);

            // Snow Caninon update - pack dogs
            Enemies.updateSnowCaninonBehavior(delta);

            // Baluban Oxen update - musk ox herds
            Enemies.updateBalubanOxenBehavior(delta);

            // Baluban Oxen mating timer - every 10 minutes (600 seconds)
            if (!GameState.balubanOxenMatingTimer) GameState.balubanOxenMatingTimer = 0;
            if (GameState.balubanOxenHerds && GameState.balubanOxenHerds.length > 0) {
                GameState.balubanOxenMatingTimer += delta;
                if (GameState.balubanOxenMatingTimer >= 600) {
                    GameState.balubanOxenMatingTimer = 0;
                    Enemies.triggerBalubanOxenMating();
                }
            }

            // Ocean wave animation (coastal biome)
            if (GameState.currentBiome === 'coastal') {
                Environment.updateOceanWaves(delta);

                // Bob placed rafts on the waves
                if (GameState.placedRafts) {
                    GameState.placedRafts.forEach(function(raft) {
                        if (raft !== GameState.activeBoat) { // Active boat has its own bobbing
                            raft.userData.bobTime = (raft.userData.bobTime || 0) + delta;
                            raft.position.y = 0.3 + Math.sin(raft.userData.bobTime * 2) * 0.15;
                        }
                    });
                }

                // Uronin Seal mating timer — every 5 minutes (300 seconds)
                if (GameState.sealColonies && GameState.sealColonies.length > 0) {
                    GameState.sealMatingTimer += delta;
                    if (GameState.sealMatingTimer >= 300) {
                        GameState.sealMatingTimer = 0;
                        Enemies.triggerSealMating();
                    }
                }

                // Bakka seal mating timer — every 5 minutes
                GameState.bakkaSealMatingTimer = (GameState.bakkaSealMatingTimer || 0) + delta;
                if (GameState.bakkaSealMatingTimer >= 300) {
                    GameState.bakkaSealMatingTimer = 0;
                    Enemies.triggerBakkaSealMating();
                }

                // Seagull nesting timer — every 3 minutes
                GameState.seagullMatingTimer = (GameState.seagullMatingTimer || 0) + delta;
                if (GameState.seagullMatingTimer >= 180) {
                    GameState.seagullMatingTimer = 0;
                    Enemies.triggerSeagullMating();
                }

                // Fish respawn check — maintain minimum populations every 30s
                GameState.fishRespawnTimer = (GameState.fishRespawnTimer || 0) + delta;
                if (GameState.fishRespawnTimer >= 30) {
                    GameState.fishRespawnTimer = 0;
                    var sardineCount = 0;
                    var orcletonCount = 0;
                    for (var fi = 0; fi < GameState.enemies.length; fi++) {
                        if (GameState.enemies[fi].userData.type === 'slitted_sardine') sardineCount++;
                        if (GameState.enemies[fi].userData.type === 'orcleton') orcletonCount++;
                    }
                    var targetData = getBiomeData(GameState.currentBiome);
                    var minSardines = (targetData.sardineShoals || 3) * 15; // ~75% of full shoals
                    var minOrcletons = Math.max(2, (targetData.orcletons || 5) - 2);
                    if (sardineCount < minSardines) {
                        Enemies.spawnSardineShoal(); // Spawn a new shoal
                    }
                    if (orcletonCount < minOrcletons) {
                        Enemies.spawnOrcleton();
                    }
                }

                // Update all seal and fish behaviors
                GameState.enemies.forEach(function(enemy) {
                    if (enemy.userData.type === 'uronin_seal') {
                        Enemies.updateUroninSealBehavior(enemy, delta);
                    } else if (enemy.userData.type === 'bakka_seal') {
                        Enemies.updateBakkaSealBehavior(enemy, delta);
                    } else if (enemy.userData.isFish) {
                        Enemies.updateFishBehavior(enemy, delta);
                    }
                });
            }

            // Update carcasses - decomposition, color changes, sinking
            Enemies.updateCarcasses(delta);

            GameState.renderer.render(GameState.scene, GameState.camera);
        }
    }

    /**
     * Handle window resize.
     */
    function onWindowResize() {
        GameState.camera.aspect = window.innerWidth / window.innerHeight;
        GameState.camera.updateProjectionMatrix();
        GameState.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Main initialization function.
     */
    function init() {
        try {
            GameState.velocity = new THREE.Vector3();

            // Scene setup
            GameState.scene = new THREE.Scene();
            GameState.scene.background = new THREE.Color(0x87ceeb);
            GameState.scene.fog = new THREE.Fog(0x87ceeb, 200, 1200);

            // Camera setup
            GameState.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                2000
            );
            GameState.camera.position.set(0, 10, 15);

            // Renderer setup
            GameState.renderer = new THREE.WebGLRenderer({ antialias: true });
            GameState.renderer.setSize(window.innerWidth, window.innerHeight);
            GameState.renderer.shadowMap.enabled = true;
            GameState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.getElementById('game-container').appendChild(GameState.renderer.domElement);

            GameState.clock = new THREE.Clock();

            // Set up scene essentials (lighting + player) — terrain is deferred
            // until we know the biome (New Game, Continue, Load, or Test)
            Environment.setupLighting();
            Player.createPeccary();
            Player.createBackSword();
            Player.createSkinSparkles();
            Player.createBackBasket();
            UI.setupMinimap();
            Inventory.init();
            ResearchHut.init();

            // Event listeners
            window.addEventListener('resize', onWindowResize);

            window.addEventListener('keydown', (e) => {
                GameState.keys[e.key.toLowerCase()] = true;
                if (e.key === ' ') e.preventDefault();

                // Escape — close overlays
                if (e.key === 'Escape' && !document.getElementById('saves-modal').classList.contains('hidden')) {
                    closeSavesModal();
                    return;
                }
                if (e.key === 'Escape' && WorldMap.isOpen()) {
                    WorldMap.close();
                    return;
                }

                if (e.key.toLowerCase() === 'e') {
                    // Handle interactions based on context
                    console.log('[E KEY DEBUG] isPlacingRaft=' + GameState.isPlacingRaft + ' isInsideHut=' + GameState.isInsideHut + ' isDialogOpen=' + GameState.isDialogOpen + ' nearbyVillager=' + !!GameState.nearbyVillager + ' checkEnterHut=' + ResearchHut.checkEnterHut() + ' mountedFlamingo=' + !!GameState.mountedFlamingo + ' easterActive=' + GameState.easterEventActive);
                    if (GameState.isPlacingRaft) {
                        // Cancel raft placement
                        cancelRaftPlacement();
                    } else if (GameState.isInsideHut) {
                        // Inside hut - handle hut interactions
                        ResearchHut.handleInteraction();
                    } else if (GameState.isDialogOpen) {
                        // Try clicking the first dialog option (works for both villager and scientist dialogs)
                        var firstOpt = document.querySelector('[data-option-number="1"]');
                        if (firstOpt) {
                            firstOpt.click();
                        } else {
                            Dialogs.advanceDialog();
                        }
                    } else if (GameState.nearbyVillager) {
                        Dialogs.openDialog(GameState.nearbyVillager);
                    } else if (ResearchHut.checkEnterHut()) {
                        // Near research hut entrance
                        ResearchHut.enterHut();
                    } else if (GameState.mountedFlamingo) {
                        // Dismount flamingo
                        dismountFlamingo();
                    } else if (GameState.easterEventActive && tryMountFlamingo()) {
                        // Mounted a flamingo!
                    } else if (GameState.easterEventActive && tryCatchPiglet()) {
                        // Started piglet catching minigame!
                    } else if (GameState.easterEventActive && collectCherryPetals()) {
                        // Collected petals from nearby cherry blossom
                    } else if (GameState.nearbyChest && openTreasureChest()) {
                        // Opened a treasure chest!
                    } else if (GameState.gameRunning && !GameState.isInBoat) {
                        var hotbarItem = UI.getSelectedHotbarItem();
                        if (hotbarItem && hotbarItem.id === 'basic_rook_boat' && GameState.currentBiome === 'coastal') {
                            startRaftPlacement();
                        } else if (hotbarItem && hotbarItem.id === 'chocolate_goggles') {
                            // Activate goggles — highlight all bunnies for 10 seconds
                            activateChocolateGoggles();
                            // Consume one
                            hotbarItem.count--;
                            if (hotbarItem.count <= 0) {
                                GameState.hotbarSlots[GameState.selectedHotbarSlot] = null;
                            }
                            UI.updateHotbar();
                        } else if (hotbarItem && hotbarItem.id === 'pirate_eyepatch') {
                            // Toggle eyepatch on/off
                            toggleEyepatch();
                        } else if (hotbarItem && hotbarItem.id === 'roller_skates') {
                            // Toggle roller skates on/off
                            GameState.rollerSkatesOn = !GameState.rollerSkatesOn;
                            if (GameState.rollerSkatesOn) {
                                UI.showToast('Roller Skates ON!', 'You are zooming! Press E again to take them off.');
                            } else {
                                UI.showToast('Roller Skates OFF', 'Back to normal speed.');
                            }
                        }
                    }
                }

                if (e.key === 'Escape') {
                    if (pigletPickerOpen) {
                        closePigletPicker();
                    } else if (document.getElementById('egg-shop-overlay').classList.contains('active')) {
                        closeEggShop();
                    } else if (GameState.isPlacingRaft) {
                        cancelRaftPlacement();
                    } else if (GameState.isDialogOpen) {
                        Dialogs.closeDialog();
                    } else if (GameState.isShopOpen) {
                        UI.closeShop();
                    } else if (GameState.isInventoryOpen) {
                        Inventory.close();
                    }
                }

                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (GameState.gameRunning && !GameState.isDialogOpen && !GameState.isInventoryOpen) {
                        Items.toggleCraftMenu();
                    }
                }

                // Inventory shortcuts: I=toggle, B=bestiary, Q=quest, J=journal
                var inventoryShortcuts = { i: null, b: 'bestiary', q: 'quest', j: 'journal' };
                var inventoryTab = inventoryShortcuts[e.key.toLowerCase()];
                if (inventoryTab !== undefined && GameState.gameRunning && !GameState.isDialogOpen && !GameState.isCraftMenuOpen && !GameState.isShopOpen) {
                    if (inventoryTab) {
                        Inventory.openToTab(inventoryTab);
                    } else {
                        Inventory.toggle();
                    }
                }

                // T key - Testing Menu (only in testing mode)
                if (e.key.toLowerCase() === 't') {
                    if (GameState.isTestingMode && GameState.gameRunning && !GameState.isDialogOpen && !GameState.isInsideHut) {
                        toggleTestingMenu();
                    }
                }

                // M key - World Map
                if (e.key.toLowerCase() === 'm') {
                    if (GameState.gameRunning && !GameState.isDialogOpen && !GameState.isShopOpen && !GameState.isInventoryOpen && !GameState.isCraftMenuOpen && !GameState.isInsideHut) {
                        WorldMap.toggle();
                    }
                }

                // P key - Piglet Picker
                if (e.key.toLowerCase() === 'p') {
                    if (GameState.gameRunning && !GameState.isDialogOpen && !GameState.isShopOpen && !GameState.isInventoryOpen && !GameState.isCraftMenuOpen && !GameState.isInsideHut) {
                        togglePigletPicker();
                    }
                }

                // Q key — take control of nearest combat piglet
                if (e.key.toLowerCase() === 'q') {
                    if (GameState.gameRunning && !GameState.isDialogOpen && !GameState.isShopOpen && !GameState.isInventoryOpen && !GameState.isCraftMenuOpen && !GameState.isInsideHut) {
                        handlePigletControl();
                    }
                }

                // Punctuation keys: hotbar selection (when not in dialog/menu)
                var hotbarKeys = [',', '.', '/', ';', "'", '[', ']', '-', '='];
                var hotbarIndex = hotbarKeys.indexOf(e.key);
                if (hotbarIndex !== -1 && !GameState.isDialogOpen && !GameState.isShopOpen && !GameState.isInventoryOpen && !GameState.isCraftMenuOpen) {
                    GameState.selectedHotbarSlot = hotbarIndex;
                    UI.updateHotbar();
                }

                if (GameState.isDialogOpen && /^[1-9]$/.test(e.key)) {
                    const optionNumber = parseInt(e.key);
                    const optionDiv = document.querySelector(`[data-option-number="${optionNumber}"]`);
                    if (optionDiv) {
                        optionDiv.click();
                    }
                }
            });

            window.addEventListener('keyup', (e) => GameState.keys[e.key.toLowerCase()] = false);

            // Camera orbit — click and drag to rotate camera around player
            window.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;  // Left click only
                if (!GameState.gameRunning) return;
                GameState.cameraDragging = true;
                GameState.cameraDragStartX = e.clientX;
                GameState.cameraDragStartAngle = GameState.cameraAngle;
                GameState.cameraDragMoved = false;
            });

            window.addEventListener('mousemove', (e) => {
                // Raft blueprint follows mouse during placement mode
                if (GameState.isPlacingRaft) {
                    updateRaftBlueprint(e);
                }

                if (!GameState.cameraDragging) return;
                const deltaX = e.clientX - GameState.cameraDragStartX;
                if (Math.abs(deltaX) > 3) GameState.cameraDragMoved = true;
                GameState.cameraAngle = GameState.cameraDragStartAngle - deltaX * 0.005;
            });

            window.addEventListener('mouseup', () => {
                GameState.cameraDragging = false;
            });

            // Start screen buttons
            function launchNewGame() {
                startGame(false);
                GameState.currentBiome = 'arboreal';
                Environment.rebuildForBiome('arboreal');
                document.getElementById('biome-label').textContent = BIOMES.arboreal.displayName;
                spawnBiomeContent('arboreal');
            }

            document.getElementById('new-game-btn').addEventListener('click', function() {
                if (!GameState.introShown) {
                    // Show intro screen first
                    document.getElementById('start-screen').classList.add('hidden');
                    document.getElementById('memory-intro').classList.remove('hidden');
                } else {
                    launchNewGame();
                }
            });

            // Intro "Let's go!" button
            var introGoBtn = document.getElementById('intro-go-btn');
            if (introGoBtn) introGoBtn.addEventListener('click', function() {
                document.getElementById('memory-intro').classList.add('hidden');
                GameState.introShown = true;
                if (!GameState.memoriesFound) GameState.memoriesFound = [];
                if (GameState.memoriesFound.indexOf('awakening') === -1) {
                    GameState.memoriesFound.push('awakening');
                }
                launchNewGame();
            });
            document.getElementById('restart-btn').addEventListener('click', restartGame);

            // Continue button — loads most recent save
            document.getElementById('continue-btn').addEventListener('click', () => {
                var recent = SaveSystem.getMostRecentSave();
                if (recent) {
                    startGame(false);
                    var result = SaveSystem.restoreSaveData(recent);
                    if (result.warnings.length > 0) {
                        console.warn('Load warnings:', result.warnings);
                        SaveSystem.showSaveNotification('Loaded (with warnings)');
                    } else {
                        SaveSystem.showSaveNotification('Game Loaded!');
                    }
                }
            });

            // Load Game button — opens saves modal in load mode
            document.getElementById('load-game-btn').addEventListener('click', () => {
                openSavesModal('load');
            });

            // Show Continue/Load buttons if saves exist
            var existingSaves = SaveSystem.getAllSaves();
            if (existingSaves.length > 0) {
                document.getElementById('continue-btn').style.display = '';
                document.getElementById('load-game-btn').style.display = '';
            }

            // ==========================================
            // SKINS SCREEN
            // ==========================================
            var skinsPreviewState = {
                scene: null,
                camera: null,
                renderer: null,
                model: null,
                animFrame: null,
                selectedSkin: GameState.currentSkin || 'default'
            };

            function openSkinsScreen() {
                var fade = document.getElementById('screen-fade');
                fade.classList.add('active');

                setTimeout(function() {
                    document.getElementById('start-screen').classList.add('hidden');
                    document.getElementById('skins-screen').classList.remove('hidden');
                    document.getElementById('skin-cheat-box').classList.add('hidden');
                    renderSkinCards();
                    initSkinsPreview();
                    updateSkinsPreview(skinsPreviewState.selectedSkin);

                    // Fade out
                    fade.classList.remove('active');
                }, 500);
            }

            function closeSkinsScreen() {
                var fade = document.getElementById('screen-fade');
                fade.classList.add('active');

                setTimeout(function() {
                    // Apply selected skin
                    GameState.currentSkin = skinsPreviewState.selectedSkin;

                    // Rebuild Pedro if in-game
                    if (GameState.peccary) {
                        Player.rebuildPeccary();
                        Player.createBackSword();
                        Player.createSkinSparkles();
                        Player.createBackBasket();
                    }

                    document.getElementById('skins-screen').classList.add('hidden');
                    document.getElementById('skin-cheat-box').classList.add('hidden');
                    document.getElementById('start-screen').classList.remove('hidden');
                    disposeSkinsPreview();

                    fade.classList.remove('active');
                }, 500);
            }

            // Open skins screen from in-game (via lobby return)
            function openSkinsFromGame() {
                var fade = document.getElementById('screen-fade');
                fade.classList.add('active');

                setTimeout(function() {
                    // Pause the game
                    GameState.gameRunning = false;
                    document.getElementById('ui-overlay').classList.add('hidden');
                    document.getElementById('controls-info').classList.add('hidden');
                    document.getElementById('minimap').classList.add('hidden');
                    document.getElementById('hunger-panel').classList.add('hidden');
                    document.getElementById('thirst-panel').classList.add('hidden');

                    document.getElementById('skins-screen').classList.remove('hidden');
                    document.getElementById('skin-cheat-box').classList.add('hidden');
                    // Override back button to return to game instead of start screen
                    skinsPreviewState.returnToGame = true;
                    renderSkinCards();
                    initSkinsPreview();
                    updateSkinsPreview(skinsPreviewState.selectedSkin);

                    fade.classList.remove('active');
                }, 500);
            }

            function closeSkinsToGame() {
                var fade = document.getElementById('screen-fade');
                fade.classList.add('active');

                setTimeout(function() {
                    GameState.currentSkin = skinsPreviewState.selectedSkin;
                    Player.rebuildPeccary();
                    Player.createBackSword();
                    Player.createSkinSparkles();
                    Player.createBackBasket();

                    document.getElementById('skins-screen').classList.add('hidden');
                    document.getElementById('skin-cheat-box').classList.add('hidden');
                    document.getElementById('ui-overlay').classList.remove('hidden');
                    document.getElementById('controls-info').classList.remove('hidden');
                    document.getElementById('minimap').classList.remove('hidden');
                    document.getElementById('hunger-panel').classList.remove('hidden');
                    document.getElementById('thirst-panel').classList.remove('hidden');
                    disposeSkinsPreview();
                    skinsPreviewState.returnToGame = false;

                    // Resume game
                    GameState.gameRunning = true;

                    fade.classList.remove('active');
                }, 500);
            }

            function initSkinsPreview() {
                var canvas = document.getElementById('skins-preview-canvas');
                var container = document.getElementById('skins-preview');
                var w = container.clientWidth;
                var h = container.clientHeight;

                skinsPreviewState.scene = new THREE.Scene();
                skinsPreviewState.scene.background = new THREE.Color(0x1a2a10);

                skinsPreviewState.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
                skinsPreviewState.camera.position.set(3, 2.5, 3);
                skinsPreviewState.camera.lookAt(0, 0.7, 0);

                skinsPreviewState.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
                skinsPreviewState.renderer.setSize(w, h);
                skinsPreviewState.renderer.setPixelRatio(window.devicePixelRatio);

                // Lighting
                var ambient = new THREE.AmbientLight(0xffffff, 0.5);
                skinsPreviewState.scene.add(ambient);
                var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
                dirLight.position.set(5, 8, 5);
                skinsPreviewState.scene.add(dirLight);

                // Ground circle
                var groundGeo = new THREE.CircleGeometry(2, 32);
                var groundMat = new THREE.MeshStandardMaterial({ color: 0x2a4a1a });
                var ground = new THREE.Mesh(groundGeo, groundMat);
                ground.rotation.x = -Math.PI / 2;
                ground.position.y = -0.01;
                skinsPreviewState.scene.add(ground);

                // Start render loop
                function animatePreview() {
                    skinsPreviewState.animFrame = requestAnimationFrame(animatePreview);
                    if (skinsPreviewState.model) {
                        skinsPreviewState.model.rotation.y += 0.008;

                        // Fuse tip flicker (cached reference)
                        if (skinsPreviewState.fuseTip && skinsPreviewState.fuseTip.material) {
                            skinsPreviewState.fuseTip.material.emissiveIntensity = 1.0 + Math.sin(Date.now() * 0.01) * 0.5;
                        }
                    }
                    skinsPreviewState.renderer.render(skinsPreviewState.scene, skinsPreviewState.camera);
                }
                animatePreview();
            }

            function updateSkinsPreview(skinId) {
                var skin = SKINS[skinId] || SKINS['default'];

                // Remove old model
                if (skinsPreviewState.model) {
                    skinsPreviewState.scene.remove(skinsPreviewState.model);
                    skinsPreviewState.model.traverse(function(obj) {
                        if (obj.geometry) obj.geometry.dispose();
                        if (obj.material) obj.material.dispose();
                    });
                }

                // Build new model
                var model = Player.buildPeccaryModel(skin);
                skinsPreviewState.scene.add(model);
                skinsPreviewState.model = model;

                // Cache fuse tip reference
                skinsPreviewState.fuseTip = null;
                model.traverse(function(obj) {
                    if (obj.userData && obj.userData.isFuseTip) skinsPreviewState.fuseTip = obj;
                });
            }

            function disposeSkinsPreview() {
                if (skinsPreviewState.animFrame) {
                    cancelAnimationFrame(skinsPreviewState.animFrame);
                    skinsPreviewState.animFrame = null;
                }
                // Dispose all scene objects (model, lights, ground)
                if (skinsPreviewState.scene) {
                    skinsPreviewState.scene.traverse(function(obj) {
                        if (obj.geometry) obj.geometry.dispose();
                        if (obj.material) obj.material.dispose();
                    });
                }
                if (skinsPreviewState.renderer) {
                    skinsPreviewState.renderer.dispose();
                    skinsPreviewState.renderer = null;
                }
                skinsPreviewState.model = null;
                skinsPreviewState.fuseTip = null;
                skinsPreviewState.scene = null;
                skinsPreviewState.camera = null;
            }

            function isSkinUnlocked(skinId) {
                var skin = SKINS[skinId];
                if (!skin) return false;
                if (skin.unlocked) return true;
                if (GameState.unlockedSkins.indexOf(skinId) !== -1) return true;
                // Check condition
                if (skin.unlockCondition) {
                    if (skin.unlockCondition.type === 'arsenBombsUsed') {
                        return (GameState.arsenBombsUsed || 0) >= skin.unlockCondition.count;
                    }
                    if (skin.unlockCondition.type === 'easterEvent') {
                        return (GameState.easterBunniesCaught || 0) >= 5;
                    }
                    if (skin.unlockCondition.type === 'memoriesFound') {
                        return (GameState.memoriesFound || []).length >= skin.unlockCondition.count;
                    }
                }
                return false;
            }

            function getUnlockText(skin) {
                if (!skin.unlockCondition) return '';
                if (skin.unlockCondition.type === 'arsenBombsUsed') {
                    var used = GameState.arsenBombsUsed || 0;
                    return 'Use Arsenic Bombs ' + used + '/' + skin.unlockCondition.count;
                }
                if (skin.unlockCondition.type === 'easterEvent') {
                    var bunnies = GameState.easterBunniesCaught || 0;
                    return 'Catch Bunnies ' + bunnies + '/5';
                }
                if (skin.unlockCondition.type === 'memoriesFound') {
                    var found = (GameState.memoriesFound || []).length;
                    return 'Find Memories ' + found + '/' + skin.unlockCondition.count;
                }
                if (skin.unlockCondition.type === 'lambCaught') {
                    return 'Catch a ' + (skin.unlockCondition.lambId || '').replace(/_/g, ' ') + ' lamb during Easter';
                }
                return 'Locked';
            }

            function renderSkinCards() {
                var list = document.getElementById('skins-list');
                list.innerHTML = '';

                Object.keys(SKINS).forEach(function(skinId) {
                    var skin = SKINS[skinId];
                    // Hide event-only skins unless easter is active OR the skin is already unlocked
                    if (skin.eventOnly && !GameState.easterEventActive && !isSkinUnlocked(skinId)) return;

                    var unlocked = isSkinUnlocked(skinId);
                    var isSelected = skinId === skinsPreviewState.selectedSkin;

                    var card = document.createElement('div');
                    card.className = 'skin-card' + (unlocked ? '' : ' locked') + (isSelected ? ' selected' : '');
                    card.dataset.skinId = skinId;

                    var nameDiv = document.createElement('div');
                    nameDiv.className = 'skin-card-name';
                    nameDiv.textContent = (unlocked ? '' : '🔒 ') + skin.name;
                    card.appendChild(nameDiv);

                    var descDiv = document.createElement('div');
                    descDiv.className = 'skin-card-desc';
                    descDiv.textContent = skin.description;
                    card.appendChild(descDiv);

                    var statusDiv = document.createElement('div');
                    statusDiv.className = 'skin-card-status';
                    if (isSelected && unlocked) {
                        statusDiv.textContent = 'Selected';
                    } else if (!unlocked) {
                        statusDiv.textContent = getUnlockText(skin);
                    }
                    card.appendChild(statusDiv);

                    card.addEventListener('click', function() {
                        var clickedId = this.dataset.skinId;
                        var clickedSkin = SKINS[clickedId];
                        var isUnlocked = isSkinUnlocked(clickedId);

                        // Update preview regardless of lock status
                        updateSkinsPreview(clickedId);

                        if (isUnlocked) {
                            // Select this skin
                            skinsPreviewState.selectedSkin = clickedId;
                            document.getElementById('skin-cheat-box').classList.add('hidden');
                        } else {
                            // Show cheat code box for locked skins
                            if (clickedSkin.cheatCode) {
                                document.getElementById('skin-cheat-box').classList.remove('hidden');
                                document.getElementById('skin-cheat-input').value = '';
                                document.getElementById('skin-cheat-input').dataset.targetSkin = clickedId;
                                document.getElementById('skin-cheat-input').focus();
                            }
                        }

                        renderSkinCards();
                    });

                    list.appendChild(card);
                });
            }

            // Skins button (commented out in HTML until home screen gets a proper image asset)
            var skinsBtn = document.getElementById('skins-btn');
            if (skinsBtn) skinsBtn.addEventListener('click', openSkinsScreen);

            // Skins back button — returns to game or start screen depending on context
            var skinsBackBtn = document.getElementById('skins-back-btn');
            if (skinsBackBtn) skinsBackBtn.addEventListener('click', function() {
                if (skinsPreviewState.returnToGame) {
                    closeSkinsToGame();
                } else {
                    closeSkinsScreen();
                }
            });

            // Cheat code submit
            var cheatSubmit = document.getElementById('skin-cheat-submit');
            if (cheatSubmit) cheatSubmit.addEventListener('click', function() {
                var input = document.getElementById('skin-cheat-input');
                var targetSkinId = input.dataset.targetSkin;
                var skin = SKINS[targetSkinId];

                if (skin && skin.cheatCode && input.value === skin.cheatCode) {
                    // Unlock!
                    if (GameState.unlockedSkins.indexOf(targetSkinId) === -1) {
                        GameState.unlockedSkins.push(targetSkinId);
                    }
                    skinsPreviewState.selectedSkin = targetSkinId;
                    document.getElementById('skin-cheat-box').classList.add('hidden');
                    renderSkinCards();
                    showBlockedMessage('Skin unlocked: ' + skin.name + '!');
                } else {
                    // Wrong code — shake
                    input.classList.add('shake');
                    setTimeout(function() { input.classList.remove('shake'); }, 400);
                }
            });

            // Enter key in cheat input triggers submit
            var cheatInput = document.getElementById('skin-cheat-input');
            if (cheatInput) cheatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById('skin-cheat-submit').click();
                }
            });

            // In-game skins button
            var skinsIngameBtn = document.getElementById('skins-ingame-btn');
            if (skinsIngameBtn) skinsIngameBtn.addEventListener('click', function() {
                if (GameState.gameRunning) {
                    openSkinsFromGame();
                }
            });

            // Save button in HUD
            document.getElementById('save-btn').addEventListener('click', () => {
                if (GameState.gameRunning) {
                    openSavesModal('save');
                }
            });

            // Saves modal close button
            document.getElementById('saves-close-btn').addEventListener('click', closeSavesModal);
            document.getElementById('saves-new-slot-btn').addEventListener('click', () => {
                var name = prompt('Name your save:', '');
                if (name === null) return;  // Cancelled
                SaveSystem.saveGame(null, name || null);
                SaveSystem.showSaveNotification('Game Saved!');
                renderSavesList('save');  // Refresh the list
            });

            // Testing menu biome buttons
            document.querySelectorAll('.testing-biome-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    teleportToBiome(btn.dataset.biome);
                });
            });

            // Testing menu section headers (collapsible)
            document.querySelectorAll('.testing-section-header').forEach(header => {
                header.addEventListener('click', () => {
                    const sectionId = 'section-' + header.dataset.section;
                    const content = document.getElementById(sectionId);
                    if (content) {
                        header.classList.toggle('expanded');
                        content.classList.toggle('expanded');
                    }
                });
            });

            // Spawn category headers (collapsible)
            document.querySelectorAll('.spawn-category-header').forEach(header => {
                header.addEventListener('click', () => {
                    const categoryId = 'spawn-' + header.dataset.category;
                    const content = document.getElementById(categoryId);
                    if (content) {
                        header.classList.toggle('expanded');
                        content.classList.toggle('hidden');
                    }
                });
            });

            // Become animal buttons
            document.getElementById('become-control-btn').addEventListener('click', () => startBecomeAnimal('control'));
            document.getElementById('become-spectate-btn').addEventListener('click', () => startBecomeAnimal('spectate'));
            document.getElementById('become-stop-btn').addEventListener('click', stopBecomeAnimal);

            // Event trigger buttons
            document.getElementById('trigger-hunt-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerWildDogHunt) {
                    Enemies.triggerWildDogHunt();
                    console.log('Wild dog hunt triggered!');
                }
            });
            document.getElementById('trigger-toad-mating-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerToadMating) {
                    Enemies.triggerToadMating();
                    console.log('Toad mating triggered!');
                }
            });
            document.getElementById('trigger-viper-mating-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerViperMating) {
                    Enemies.triggerViperMating();
                    console.log('Viper mating triggered!');
                }
            });
            document.getElementById('trigger-antelope-mating-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerAntelopeMating) {
                    Enemies.triggerAntelopeMating();
                    console.log('Antelope mating triggered!');
                }
            });
            document.getElementById('trigger-dog-mating-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerWildDogMating) {
                    Enemies.triggerWildDogMating();
                    console.log('Wild dog mating triggered!');
                }
            });
            document.getElementById('trigger-gazella-mating-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerSaltasGazellaMating) {
                    Enemies.triggerSaltasGazellaMating();
                    console.log('Saltas Gazella mating triggered!');
                }
            });
            document.getElementById('trigger-cat-mating-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerDronglousCatMating) {
                    Enemies.triggerDronglousCatMating();
                    console.log('Dronglous Cat mating triggered!');
                }
            });
            document.getElementById('trigger-cat-hunt-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerDronglousCatHunt) {
                    Enemies.triggerDronglousCatHunt();
                    console.log('Dronglous Cat hunt triggered!');
                }
            });
            document.getElementById('trigger-snow-caninon-hunt-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerSnowCaninonHunt && GameState.snowCaninonPacks) {
                    GameState.snowCaninonPacks.forEach(pack => {
                        if (!pack.currentHunt) {
                            Enemies.triggerSnowCaninonHunt(pack);
                        }
                    });
                    console.log('Snow Caninon hunt triggered!');
                }
            });
            document.getElementById('trigger-oxen-mating-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerBalubanOxenMating) {
                    Enemies.triggerBalubanOxenMating();
                    console.log('Baluban Oxen mating triggered!');
                }
            });
            document.getElementById('trigger-seal-mating-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerSealMating) {
                    Enemies.triggerSealMating();
                    console.log('Seal mating triggered!');
                }
            });
            document.getElementById('trigger-bakka-seal-mating-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerBakkaSealMating) {
                    Enemies.triggerBakkaSealMating();
                    console.log('Bakka seal mating triggered!');
                }
            });
            document.getElementById('trigger-seagull-nesting-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerSeagullMating) {
                    Enemies.triggerSeagullMating();
                    console.log('Seagull nesting triggered!');
                }
            });

            // Memory fragment test buttons
            document.getElementById('trigger-memory-next-btn').addEventListener('click', () => {
                if (typeof MEMORIES === 'undefined') return;
                if (!GameState.memoriesFound) GameState.memoriesFound = [];
                // Find the first unfound memory
                for (var i = 0; i < MEMORIES.length; i++) {
                    if (GameState.memoriesFound.indexOf(MEMORIES[i].id) === -1) {
                        UI.showMemoryFlashback(MEMORIES[i].id);
                        var statusEl = document.getElementById('memory-test-status');
                        if (statusEl) statusEl.textContent = 'Triggered: ' + MEMORIES[i].title + ' (' + (i + 1) + '/' + MEMORIES.length + ')';
                        break;
                    }
                }
            });
            document.getElementById('trigger-memory-reset-btn').addEventListener('click', () => {
                GameState.memoriesFound = [];
                GameState.lastMemoryScore = 0;
                GameState.chapter1Shown = false;
                var statusEl = document.getElementById('memory-test-status');
                if (statusEl) statusEl.textContent = 'All memories reset!';
                console.log('All memory fragments reset');
            });

            document.getElementById('trigger-dog-hunt-oxen-btn').addEventListener('click', () => {
                if (typeof Enemies !== 'undefined' && Enemies.triggerSnowCaninonHunt && GameState.snowCaninonPacks) {
                    // Force dogs to hunt oxen specifically
                    GameState.snowCaninonPacks.forEach(pack => {
                        if (!pack.currentHunt) {
                            Enemies.triggerSnowCaninonHunt(pack);
                        }
                    });
                    console.log('Dog Hunt Oxen triggered!');
                }
            });
            document.getElementById('spawn-test-cat-btn').addEventListener('click', () => {
                // Spawn a cat in a tree right next to the player for testing
                // Use camera position if player not ready
                let playerPos = { x: 0, z: 0 };
                if (GameState.player && GameState.player.position) {
                    playerPos = GameState.player.position;
                } else if (GameState.camera) {
                    playerPos = { x: GameState.camera.position.x, z: GameState.camera.position.z };
                }

                // Create a test acacia tree RIGHT IN FRONT of the player
                // Get camera forward direction
                const camera = GameState.camera;
                const forward = new THREE.Vector3();
                camera.getWorldDirection(forward);
                forward.y = 0; // Keep on ground plane
                forward.normalize();
                forward.multiplyScalar(3); // 3 meters in front (outside hunting range for testing)

                const treeX = playerPos.x + forward.x;
                const treeZ = playerPos.z + forward.z;

                console.log('🌳 Spawning tree at X:', treeX.toFixed(1), 'Z:', treeZ.toFixed(1), '(3 meters in front of you)');

                // Create simple tree (simplified acacia) - bright and easy to see
                const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
                const trunkMat = new THREE.MeshStandardMaterial({
                    color: 0x8B4513, // Brown
                    emissive: 0x4a3520,
                    emissiveIntensity: 0.2
                });
                const trunk = new THREE.Mesh(trunkGeo, trunkMat);
                trunk.position.set(0, 2, 0); // Relative to tree group!
                trunk.castShadow = true;
                trunk.receiveShadow = true;

                const leavesGeo = new THREE.SphereGeometry(2, 8, 8);
                const leavesMat = new THREE.MeshStandardMaterial({
                    color: 0x00ff00, // Bright green
                    emissive: 0x2a5a1a,
                    emissiveIntensity: 0.3
                });
                const leaves = new THREE.Mesh(leavesGeo, leavesMat);
                leaves.position.set(0, 5, 0); // Relative to tree group!
                leaves.castShadow = true;

                const testTree = new THREE.Group();
                testTree.add(trunk);
                testTree.add(leaves);
                testTree.position.set(treeX, 0, treeZ); // Tree at this world position
                testTree.userData.treeType = 'acacia';

                GameState.scene.add(testTree);
                GameState.trees.push(testTree);

                // Spawn a male cat in this tree
                if (typeof Enemies !== 'undefined' && Enemies.spawnSpecificEnemy) {
                    // Function signature: spawnSpecificEnemy(animalType, variant, x, z)
                    const cat = Enemies.spawnSpecificEnemy('dronglous_cat', 'male', treeX, treeZ);
                    if (cat) {
                        cat.position.y = 4; // High in tree

                        // CRITICAL: Prevent gravity from pulling cat to ground
                        cat.userData.ignoreGravity = true;

                        cat.userData.homeTree = testTree;
                        cat.userData.treePosition = testTree.position.clone();
                        cat.userData.lifecycleState = 'in_tree';
                        cat.userData.stateTimer = 0;
                        cat.userData.huntTarget = null;
                        cat.userData.babies = [];
                        cat.userData.isMother = false;
                        cat.userData.gender = 'male';

                        testTree.userData.dronglousCat = cat;

                        console.log('✅ Spawned test cat at', treeX.toFixed(1), treeZ.toFixed(1));
                        console.log('🔍 Cat position: X:', cat.position.x.toFixed(1), 'Y:', cat.position.y.toFixed(1), 'Z:', cat.position.z.toFixed(1));
                    }
                }
            });
            document.getElementById('trigger-pregnancy-btn').addEventListener('click', makeSelectedPregnant);

            // Spawn animal buttons
            document.querySelectorAll('.spawn-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    spawnTestAnimal(btn.dataset.spawn);
                });
            });

            // Easter testing buttons
            document.getElementById('start-easter-btn').addEventListener('click', () => { startEaster(); });
            document.getElementById('stop-easter-btn').addEventListener('click', () => { stopEaster(); });
            document.getElementById('spawn-test-bunny-btn').addEventListener('click', () => { spawnTestBunny(); });
            document.getElementById('spawn-test-lamb-btn').addEventListener('click', () => { spawnTestLamb(); });
            document.getElementById('spawn-moonbeam-lamb-btn').addEventListener('click', () => { spawnTestLamb('moonbeam'); });
            document.getElementById('give-petals-btn').addEventListener('click', () => {
                GameState.resourceCounts.cherry_petals = (GameState.resourceCounts.cherry_petals || 0) + 30;
                UI.showToast('Petals Added!', 'You now have ' + GameState.resourceCounts.cherry_petals + ' cherry petals.');
                UI.updateHUD();
            });
            document.getElementById('give-choco-eggs-btn').addEventListener('click', () => {
                GameState.chocolateEggs = (GameState.chocolateEggs || 0) + 100;
                UI.showToast('Chocolate Eggs!', 'You now have ' + GameState.chocolateEggs + ' chocolate eggs.');
            });
            document.getElementById('spawn-blossom-lamb-btn').addEventListener('click', () => { spawnTestLamb('blossom'); });
            document.getElementById('spawn-sheep-btn').addEventListener('click', () => { spawnTestSheep(); });
            document.getElementById('spawn-sheep-pair-btn').addEventListener('click', () => { spawnTestSheepPair(); });
            document.getElementById('force-lamb-grow-btn').addEventListener('click', () => {
                if (GameState.easterLamb) {
                    transformLambToSheep(GameState.easterLamb);
                    UI.showToast('Forced Growth', 'Lamb transformed into a sheep!');
                } else {
                    UI.showToast('No Lamb', 'Spawn a lamb first!');
                }
            });
            document.getElementById('spawn-flamingo-btn').addEventListener('click', () => { spawnTestFlamingo(); });
            document.getElementById('spawn-blood-flamingo-btn').addEventListener('click', () => { spawnTestFlamingo('blood'); });
            document.getElementById('give-flamingo-license-btn').addEventListener('click', () => { giveFlamingoLicense(); });
            document.getElementById('create-easter-biome-btn').addEventListener('click', () => { createTestEasterBiome(); });
            document.getElementById('spawn-piglet-btn').addEventListener('click', () => { spawnTestPiglet(); });
            document.getElementById('spawn-celestial-piglet-btn').addEventListener('click', () => { spawnTestPiglet('celestial'); });

            // Click to select animal (for become/pregnancy)
            document.addEventListener('click', onTestingClick);

            // Combat click handler — sword attacks, axe chops, bomb throws
            document.addEventListener('click', onCombatClick);

            document.getElementById('loading').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');

            animate();

        } catch (error) {
            console.error('Game initialization error:', error);
            document.getElementById('loading').textContent = 'Error loading game: ' + error.message;
        }
    }

    // ========================================================================
    // TESTING MODE FUNCTIONS
    // ========================================================================

    /**
     * Toggle the testing menu (T key).
     */
    function toggleTestingMenu() {
        if (!GameState.isTestingMode) return;

        const menu = document.getElementById('testing-menu');
        if (GameState.isTestingMenuOpen) {
            menu.classList.add('hidden');
            GameState.isTestingMenuOpen = false;
        } else {
            menu.classList.remove('hidden');
            GameState.isTestingMenuOpen = true;
            updateTestingMenuState();
        }
    }

    /**
     * Teleport to a specific biome (testing mode only).
     * @param {string} biomeId - The biome to teleport to
     */
    function teleportToBiome(biomeId) {
        if (!GameState.isTestingMode) return;

        // Close the testing menu
        document.getElementById('testing-menu').classList.add('hidden');
        GameState.isTestingMenuOpen = false;

        // If already in this biome, just reset position
        if (GameState.currentBiome === biomeId) {
            GameState.peccary.position.set(0, 0, 0);
            return;
        }

        // Transition to the new biome (bypass normal requirements)
        transitionToBiome(biomeId, 'north');
    }

    // Track selected animal for testing
    let selectedTestAnimal = null;

    /**
     * Update testing menu UI state based on current selections.
     */
    function updateTestingMenuState() {
        const hasSelection = selectedTestAnimal !== null;
        const isFemale = hasSelection && selectedTestAnimal.userData &&
            (selectedTestAnimal.userData.gender === 'female' ||
             selectedTestAnimal.userData.id && selectedTestAnimal.userData.id.includes('female'));
        const isBecoming = GameState.becomeAnimalMode !== null;

        // Update become buttons
        document.getElementById('become-control-btn').disabled = !hasSelection || isBecoming;
        document.getElementById('become-spectate-btn').disabled = !hasSelection || isBecoming;
        document.getElementById('become-stop-btn').disabled = !isBecoming;

        // Update become status
        const becomeStatus = document.getElementById('become-status');
        if (isBecoming) {
            const mode = GameState.becomeAnimalMode === 'control' ? 'Controlling' : 'Spectating';
            const name = GameState.becomeAnimalTarget?.userData?.type || 'animal';
            becomeStatus.textContent = mode + ': ' + name;
        } else if (hasSelection) {
            const name = selectedTestAnimal.userData?.type || 'Unknown';
            becomeStatus.textContent = 'Selected: ' + name;
        } else {
            becomeStatus.textContent = 'No animal selected';
        }

        // Update pregnancy button
        document.getElementById('trigger-pregnancy-btn').disabled = !isFemale;
        const pregStatus = document.getElementById('pregnancy-status');
        if (isFemale) {
            pregStatus.textContent = 'Ready to make ' + (selectedTestAnimal.userData?.type || 'animal') + ' pregnant';
        } else if (hasSelection) {
            pregStatus.textContent = 'Selected animal is not female';
        } else {
            pregStatus.textContent = 'Select a female animal first';
        }
    }

    /**
     * Handle click events for selecting animals in testing mode.
     */
    function onTestingClick(event) {
        if (!GameState.isTestingMode || !GameState.gameRunning) return;
        if (GameState.isTestingMenuOpen) return; // Don't select while menu open
        if (GameState.cameraDragMoved) return;   // Don't select after camera drag

        // Raycast to find clicked animal
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, GameState.camera);

        const intersects = raycaster.intersectObjects(GameState.enemies, true);

        if (intersects.length > 0) {
            // Find the root enemy object
            let obj = intersects[0].object;
            while (obj.parent && !obj.userData.type) {
                obj = obj.parent;
            }

            if (obj.userData && obj.userData.type) {
                selectedTestAnimal = obj;
                console.log('Selected animal:', obj.userData.type, obj.userData);

                // Visual feedback - brief highlight
                if (obj.children[0] && obj.children[0].material) {
                    const origColor = obj.children[0].material.emissive?.getHex() || 0;
                    obj.children[0].material.emissive = new THREE.Color(0xffff00);
                    setTimeout(() => {
                        if (obj.children[0] && obj.children[0].material) {
                            obj.children[0].material.emissive = new THREE.Color(origColor);
                        }
                    }, 300);
                }
            }
        }
    }

    // ========================================================================
    // ARSEN BOMB PUDDLE SYSTEM
    // ========================================================================

    /**
     * Create a toxic puddle at the given position.
     * The puddle damages any enemy that walks through it.
     */
    function createArsenPuddle(position) {
        // Create the visual puddle — dark semi-transparent circle on the ground
        var puddleGeo = new THREE.CircleGeometry(7.5, 32);
        var puddleMat = new THREE.MeshStandardMaterial({
            color: 0x1a0a2e,       // Dark purple-black
            transparent: true,
            opacity: 0.7,
            roughness: 0.3,
            metalness: 0.2
        });
        var puddleMesh = new THREE.Mesh(puddleGeo, puddleMat);
        puddleMesh.rotation.x = -Math.PI / 2; // Lay flat on ground
        puddleMesh.position.set(position.x, 0.05, position.z); // Just above ground
        GameState.scene.add(puddleMesh);

        // Add some toxic bubbles on top for visual effect
        var bubbleGroup = new THREE.Group();
        var bubbleMat = new THREE.MeshStandardMaterial({
            color: 0x00ff44,
            transparent: true,
            opacity: 0.6,
            emissive: 0x00ff44,
            emissiveIntensity: 0.3
        });
        for (var i = 0; i < 8; i++) {
            var angle = (i / 8) * Math.PI * 2;
            var dist = Math.random() * 5;
            var bubble = new THREE.Mesh(
                new THREE.SphereGeometry(0.15 + Math.random() * 0.2, 8, 8),
                bubbleMat
            );
            bubble.position.set(
                Math.cos(angle) * dist,
                0.15,
                Math.sin(angle) * dist
            );
            bubbleGroup.add(bubble);
        }
        bubbleGroup.position.set(position.x, 0, position.z);
        GameState.scene.add(bubbleGroup);

        // Store the puddle data
        GameState.activePuddles.push({
            mesh: puddleMesh,
            bubbles: bubbleGroup,
            position: new THREE.Vector3(position.x, 0, position.z),
            radius: 7.5,
            createdAt: GameState.timeElapsed,
            duration: 30,  // 30 seconds
            damagedEnemies: {} // Track which enemies are inside (by id)
        });
    }

    /**
     * Update all active arsen bomb puddles.
     * - Damages enemies inside puddles (2 dmg/sec)
     * - Deals 5 exit damage when an enemy leaves
     * - Removes expired puddles after 30 seconds
     */
    function updatePuddles(delta) {
        if (GameState.activePuddles.length === 0) return;

        var currentTime = GameState.timeElapsed;
        var toRemove = [];

        for (var p = 0; p < GameState.activePuddles.length; p++) {
            var puddle = GameState.activePuddles[p];

            // Check if puddle has expired
            if (currentTime - puddle.createdAt >= puddle.duration) {
                // Fade out and remove
                GameState.scene.remove(puddle.mesh);
                GameState.scene.remove(puddle.bubbles);
                toRemove.push(p);
                continue;
            }

            // Fade out during last 5 seconds
            var timeLeft = puddle.duration - (currentTime - puddle.createdAt);
            if (timeLeft < 5) {
                puddle.mesh.material.opacity = 0.7 * (timeLeft / 5);
                puddle.bubbles.children.forEach(function(b) {
                    b.material.opacity = 0.6 * (timeLeft / 5);
                });
            }

            // Animate bubbles — bob up and down
            puddle.bubbles.children.forEach(function(bubble, i) {
                bubble.position.y = 0.15 + Math.sin(currentTime * 3 + i) * 0.1;
            });

            // Track which enemies are currently inside this puddle
            var currentlyInside = {};

            // Check all enemies against this puddle
            for (var e = 0; e < GameState.enemies.length; e++) {
                var enemy = GameState.enemies[e];
                if (!enemy || !enemy.userData || !enemy.userData.type) continue;

                var enemyId = enemy.userData.id || e;
                var dist = enemy.position.distanceTo(puddle.position);

                if (dist <= puddle.radius) {
                    // Enemy is INSIDE the puddle
                    currentlyInside[enemyId] = true;

                    // Deal 2 damage per second (scaled by delta)
                    if (!puddle.damagedEnemies[enemyId]) {
                        puddle.damagedEnemies[enemyId] = { damageAccum: 0 };
                    }
                    puddle.damagedEnemies[enemyId].damageAccum += delta;

                    // Apply 2 damage for every full second accumulated
                    if (puddle.damagedEnemies[enemyId].damageAccum >= 1) {
                        puddle.damagedEnemies[enemyId].damageAccum -= 1;
                        Enemies.damageEnemy(enemy, 2);
                    }
                }
            }

            // Check for enemies that LEFT the puddle (were inside, now outside)
            for (var prevId in puddle.damagedEnemies) {
                if (!currentlyInside[prevId]) {
                    // Enemy left the puddle! Deal 5 exit damage after 1 second
                    var leavingEnemy = null;
                    for (var e2 = 0; e2 < GameState.enemies.length; e2++) {
                        var eid = GameState.enemies[e2].userData.id || e2;
                        if (String(eid) === String(prevId)) {
                            leavingEnemy = GameState.enemies[e2];
                            break;
                        }
                    }
                    if (leavingEnemy) {
                        // Delayed exit damage
                        (function(enemy) {
                            setTimeout(function() {
                                if (enemy && enemy.userData && enemy.userData.health > 0) {
                                    Enemies.damageEnemy(enemy, 5);
                                }
                            }, 1000);
                        })(leavingEnemy);
                    }
                    delete puddle.damagedEnemies[prevId];
                }
            }
        }

        // Remove expired puddles (iterate backwards to avoid index issues)
        for (var r = toRemove.length - 1; r >= 0; r--) {
            GameState.activePuddles.splice(toRemove[r], 1);
        }
    }

    // ========================================================================
    // RAFT PLACEMENT SYSTEM
    // ========================================================================

    /**
     * Start raft placement mode — create a blueprint ghost that follows the mouse.
     */
    function startRaftPlacement() {
        if (GameState.isPlacingRaft) return;
        if (GameState.currentBiome !== 'coastal') {
            showBlockedMessage("You can only place rafts at the coast!");
            return;
        }

        GameState.isPlacingRaft = true;

        // Create the blueprint ghost raft
        var blueprint = Environment.createRaftModel(true); // transparent blue
        blueprint.position.set(0, 0.3, GameState.oceanDeepZ + 5); // Start near shore
        GameState.scene.add(blueprint);
        GameState.raftBlueprint = blueprint;
        GameState.raftBlueprintValid = false;

        showBlockedMessage("Click on deep water near shore to place your raft!");
    }

    /**
     * Cancel raft placement — remove blueprint, exit mode.
     */
    function cancelRaftPlacement() {
        if (!GameState.isPlacingRaft) return;

        if (GameState.raftBlueprint) {
            GameState.scene.remove(GameState.raftBlueprint);
            GameState.raftBlueprint = null;
        }
        GameState.isPlacingRaft = false;
        GameState.raftBlueprintValid = false;
    }

    /**
     * Check if a position is valid for raft placement.
     * Valid near mainland shore OR near an island's shallow zone.
     */
    function isValidRaftPosition(x, z) {
        if (!GameState.oceanDeepZ) return false;
        // Valid near mainland shore (within 11 units)
        if (z > GameState.oceanDeepZ && z <= GameState.oceanDeepZ + 11) return true;
        // Valid near an island's shallow zone
        if (Environment.isNearIsland(x, z)) return true;
        return false;
    }

    /**
     * Update the blueprint raft position to follow the mouse.
     * Called on mousemove when in placement mode.
     */
    function updateRaftBlueprint(event) {
        if (!GameState.isPlacingRaft || !GameState.raftBlueprint) return;

        // Raycast from mouse to ground plane
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, GameState.camera);

        var groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        var intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, intersectPoint);

        if (intersectPoint) {
            GameState.raftBlueprint.position.set(intersectPoint.x, 0.3, intersectPoint.z);

            // Check if position is valid
            var valid = isValidRaftPosition(intersectPoint.x, intersectPoint.z);
            GameState.raftBlueprintValid = valid;

            // Change color based on validity
            var color = valid ? 0x4488ff : 0xff4444; // Blue = valid, Red = invalid
            GameState.raftBlueprint.traverse(function(child) {
                if (child.isMesh && child.material) {
                    child.material.color.setHex(color);
                }
            });
        }
    }

    /**
     * Place the raft at the blueprint position.
     * Called on left click during placement mode.
     */
    function placeRaft(event) {
        if (!GameState.isPlacingRaft || !GameState.raftBlueprint) return;
        if (!GameState.raftBlueprintValid) {
            showBlockedMessage("Can't place here! Must be near shore or an island.");
            return;
        }

        var pos = GameState.raftBlueprint.position.clone();

        // Remove the blueprint
        GameState.scene.remove(GameState.raftBlueprint);
        GameState.raftBlueprint = null;
        GameState.isPlacingRaft = false;
        GameState.raftBlueprintValid = false;

        // Create the solid raft
        var raft = Environment.createRaftModel(false);
        raft.position.copy(pos);
        raft.userData.bobTime = 0; // For wave bobbing animation
        GameState.scene.add(raft);
        GameState.placedRafts.push(raft);

        // Remove raft item from hotbar
        var slot = GameState.selectedHotbarSlot;
        var hotbarItem = GameState.hotbarSlots[slot];
        if (hotbarItem && hotbarItem.id === 'basic_rook_boat') {
            if (hotbarItem.count > 1) {
                hotbarItem.count--;
            } else {
                GameState.hotbarSlots[slot] = null;
            }
            UI.updateHotbar();
        }

        showBlockedMessage("Raft placed! Press E near it to board.");
        Game.playSound('collect');
    }

    /**
     * Handle click events for combat — sword, axe, bomb.
     * Uses TOOL_STATS to look up damage/behavior instead of hardcoding.
     */
    function onCombatClick(event) {
        if (!GameState.gameRunning) return;

        // Handle raft placement click
        if (GameState.isPlacingRaft) {
            placeRaft(event);
            return;
        }

        if (GameState.isDialogOpen || GameState.isCraftMenuOpen || GameState.isInventoryOpen) return;
        if (GameState.cameraDragMoved) return; // Don't attack after camera drag
        if (GameState.isInsideHut) return;

        // Easter bunnies can be caught with bare hands (no weapon needed)
        if (GameState.easterBunnies && GameState.easterBunnies.length > 0) {
            var bunnyMouse = new THREE.Vector2();
            bunnyMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            bunnyMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            var bunnyRay = new THREE.Raycaster();
            bunnyRay.setFromCamera(bunnyMouse, GameState.camera);
            var bunnyHits = bunnyRay.intersectObjects(GameState.easterBunnies, true);
            if (bunnyHits.length > 0) {
                var bunnyObj = bunnyHits[0].object;
                while (bunnyObj.parent && !bunnyObj.userData.isEasterBunny) {
                    bunnyObj = bunnyObj.parent;
                }
                if (bunnyObj.userData && bunnyObj.userData.isEasterBunny) {
                    var bunnyDist = GameState.peccary.position.distanceTo(bunnyObj.position);
                    // Catcher Net doubles catching range (10 -> 20)
                    var hotbarNow = UI.getSelectedHotbarItem();
                    var catchRange = (hotbarNow && hotbarNow.id === 'catcher_net') ? 20 : 10;
                    if (bunnyDist <= catchRange) {
                        Enemies.catchEasterBunny(bunnyObj);
                        return;
                    } else {
                        showBlockedMessage('Too far away! Get closer!');
                        return;
                    }
                }
            }
        }

        // Easter lambs can be caught by clicking (primary + sheep-born)
        if (GameState.easterLamb) {
            if (tryClickLamb(event.clientX, event.clientY)) return;
        }
        if (GameState.easterSheepLambs && GameState.easterSheepLambs.length > 0) {
            if (tryClickSheepBornLamb(event.clientX, event.clientY)) return;
        }

        // Get the selected hotbar item
        const hotbarItem = UI.getSelectedHotbarItem();
        if (!hotbarItem) return;

        const itemId = hotbarItem.id;

        // Check if this is a known tool type using TOOL_STATS
        var isAxe = TOOL_STATS.axes[itemId] !== undefined;
        var isSword = TOOL_STATS.swords[itemId] !== undefined;
        if (!isAxe && !isSword && itemId !== 'arsen_bomb') return;

        // Raycast from mouse position
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, GameState.camera);

        if (isSword) {
            // SWORD: cooldown + stamina check before allowing attack
            if (GameState.attackCooldown > 0) {
                showBlockedMessage('Sword not ready! (' + Math.ceil(GameState.attackCooldown) + 's)');
                return;
            }
            var swingCost = GameState.maxStamina / 7; // 7 swings to empty
            if (GameState.stamina < swingCost) {
                showBlockedMessage('Too exhausted to swing!');
                return;
            }

            var swordStats = TOOL_STATS.swords[itemId];
            const intersects = raycaster.intersectObjects(GameState.enemies, true);
            if (intersects.length > 0) {
                // Walk up to the root enemy group
                let obj = intersects[0].object;
                while (obj.parent && !obj.userData.type) {
                    obj = obj.parent;
                }

                if (obj.userData && obj.userData.type) {
                    const distance = GameState.peccary.position.distanceTo(obj.position);
                    if (distance <= 15) {
                        // Hit! Damage comes from the sword's stats
                        Enemies.damageEnemy(obj, swordStats.damage);
                        Game.playSound('hurt');
                        // Apply cooldown and stamina cost
                        GameState.attackCooldown = 3;
                        GameState.stamina = Math.max(0, GameState.stamina - swingCost);
                    } else {
                        showBlockedMessage('Too far away to hit!');
                    }
                }
            }
        }
        if (isAxe) {
            // AXE: cooldown check (no stamina cost for chopping)
            if (GameState.chopCooldown > 0) {
                showBlockedMessage('Axe not ready! (' + Math.ceil(GameState.chopCooldown) + 's)');
                return;
            }

            var axeStats = TOOL_STATS.axes[itemId];
            const intersects = raycaster.intersectObjects(GameState.trees, true);
            if (intersects.length > 0) {
                // Walk up to the root tree group
                let obj = intersects[0].object;
                while (obj.parent && obj.userData.type !== 'tree') {
                    obj = obj.parent;
                }

                if (obj.userData && obj.userData.type === 'tree') {
                    // Check if this axe can chop this tree type
                    var treeBiome = obj.userData.biome;
                    if (axeStats.canChop.indexOf(treeBiome) === -1) {
                        showBlockedMessage("This axe can't chop this tree!");
                        return;
                    }
                    const distance = GameState.peccary.position.distanceTo(obj.position);
                    if (distance <= 15) {
                        // Chop! Pass the axeId so damageTree knows the stats
                        Environment.damageTree(obj, itemId);
                        GameState.chopCooldown = 3;
                    } else {
                        showBlockedMessage('Too far away to chop!');
                    }
                }
            }
        }
        if (itemId === 'arsen_bomb') {
            // BOMB: raycast to find where on the ground the player clicked
            // Create a horizontal plane at y=0 to intersect with
            const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const intersectPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(groundPlane, intersectPoint);

            if (intersectPoint) {
                const distance = GameState.peccary.position.distanceTo(intersectPoint);
                if (distance <= 35) {
                    // Consume 1 bomb from the hotbar slot
                    // (when you equip to hotbar, items move OUT of inventory INTO the hotbar)
                    if (!hotbarItem || hotbarItem.count <= 0) {
                        showBlockedMessage('No bombs left!');
                        return;
                    }
                    hotbarItem.count--;
                    if (hotbarItem.count <= 0) {
                        // Clear the hotbar slot — no bombs left
                        GameState.hotbarSlots[GameState.selectedHotbarSlot] = null;
                    }
                    UI.updateHotbar();

                    // Create the puddle!
                    createArsenPuddle(intersectPoint);
                    Game.playSound('hurt');

                    // Track bomb usage for skin unlock
                    GameState.arsenBombsUsed = (GameState.arsenBombsUsed || 0) + 1;
                    if (GameState.arsenBombsUsed >= 3 && GameState.unlockedSkins.indexOf('shimmering_bomb') === -1) {
                        GameState.unlockedSkins.push('shimmering_bomb');
                        showBlockedMessage('Skin unlocked: Shimmering Bomb!');
                    }
                } else {
                    showBlockedMessage('Too far away to throw!');
                }
            }
        }
    }

    /**
     * Start "become animal" mode.
     * @param {string} mode - 'control' or 'spectate'
     */
    function startBecomeAnimal(mode) {
        if (!selectedTestAnimal || !GameState.isTestingMode) return;

        GameState.becomeAnimalMode = mode;
        GameState.becomeAnimalTarget = selectedTestAnimal;
        GameState.becomeAnimalOriginalPos = GameState.peccary.position.clone();

        // Hide peccary
        GameState.peccary.visible = false;

        // Show indicator
        const indicator = document.getElementById('become-indicator');
        const nameSpan = document.getElementById('become-animal-name');
        nameSpan.textContent = (mode === 'control' ? 'CTRL ' : 'WATCH ') +
            (selectedTestAnimal.userData?.type || 'Animal');
        indicator.classList.remove('hidden');

        // Close menu
        document.getElementById('testing-menu').classList.add('hidden');
        GameState.isTestingMenuOpen = false;

        console.log('Started ' + mode + ' mode for:', selectedTestAnimal.userData?.type);
    }

    /**
     * Stop "become animal" mode.
     */
    function stopBecomeAnimal() {
        if (!GameState.becomeAnimalMode) return;

        // Restore peccary
        GameState.peccary.visible = true;
        if (GameState.becomeAnimalOriginalPos) {
            GameState.peccary.position.copy(GameState.becomeAnimalOriginalPos);
        }

        // Clear state
        GameState.becomeAnimalMode = null;
        GameState.becomeAnimalTarget = null;
        GameState.becomeAnimalOriginalPos = null;

        // Hide indicator
        document.getElementById('become-indicator').classList.add('hidden');

        updateTestingMenuState();
        console.log('Stopped become animal mode');
    }

    /**
     * Update become animal mode (called from game loop).
     */
    function updateBecomeAnimal(delta) {
        if (!GameState.becomeAnimalMode || !GameState.becomeAnimalTarget) return;

        const target = GameState.becomeAnimalTarget;

        // Check if target was removed
        if (!GameState.enemies.includes(target)) {
            stopBecomeAnimal();
            return;
        }

        if (GameState.becomeAnimalMode === 'control') {
            // Control mode - player controls the animal
            const isSprinting = GameState.keys['shift'];
            let moveSpeed = (target.userData.speed || 5) * (isSprinting ? 1.5 : 1);

            const rawDir = new THREE.Vector3();
            if (GameState.keys['w'] || GameState.keys['arrowup']) rawDir.z -= 1;
            if (GameState.keys['s'] || GameState.keys['arrowdown']) rawDir.z += 1;
            if (GameState.keys['a'] || GameState.keys['arrowleft']) rawDir.x -= 1;
            if (GameState.keys['d'] || GameState.keys['arrowright']) rawDir.x += 1;

            if (rawDir.length() > 0) {
                rawDir.normalize();

                // Rotate input direction by camera angle so movement is relative to camera view
                const angle = GameState.cameraAngle;
                const direction = new THREE.Vector3(
                    rawDir.x * Math.cos(angle) + rawDir.z * Math.sin(angle),
                    0,
                    -rawDir.x * Math.sin(angle) + rawDir.z * Math.cos(angle)
                );

                target.position.x += direction.x * moveSpeed * delta;
                target.position.z += direction.z * moveSpeed * delta;

                // Rotate to face direction
                const targetRotation = -Math.atan2(direction.z, direction.x);
                target.rotation.y = targetRotation;
            }

            // Keep in bounds (skip when in Easter biome)
            if (!GameState.inEasterBiome) {
                const bound = CONFIG.WORLD_SIZE * 0.65;
                target.position.x = Math.max(-bound, Math.min(bound, target.position.x));
                target.position.z = Math.max(-bound, Math.min(bound, target.position.z));
            }
        }

        // Both modes: camera follows target with orbit angle
        const distance = 12;
        const height = 8;
        const angle = GameState.cameraAngle;
        const offset = new THREE.Vector3(
            Math.sin(angle) * distance,
            height,
            Math.cos(angle) * distance
        );
        const cameraTarget = new THREE.Vector3()
            .copy(target.position)
            .add(offset);
        GameState.camera.position.lerp(cameraTarget, 0.05);
        GameState.camera.lookAt(target.position.x, target.position.y + 1, target.position.z);

        // Update peccary position for minimap
        GameState.peccary.position.copy(target.position);
    }

    /**
     * Make the selected female animal pregnant.
     */
    function makeSelectedPregnant() {
        if (!selectedTestAnimal || !GameState.isTestingMode) return;

        const animal = selectedTestAnimal;
        const type = animal.userData?.type;

        // Check if female
        const isFemale = animal.userData?.gender === 'female' ||
            (animal.userData?.id && animal.userData.id.includes('female'));

        if (!isFemale) {
            console.log('Cannot make pregnant: not a female');
            return;
        }

        // Set pregnancy state
        animal.userData.isPregnant = true;
        animal.userData.pregnancyTimer = 0;

        // Visual feedback - scale up slightly
        animal.scale.set(1.15, 1.15, 1.15);

        console.log('Made ' + type + ' pregnant!');
        document.getElementById('pregnancy-status').textContent = type + ' is now pregnant!';
    }

    /**
     * Spawn a test animal near the player.
     * @param {string} spawnId - The animal spawn ID (e.g., 'badger', 'goose_male')
     */
    function spawnTestAnimal(spawnId) {
        if (!GameState.isTestingMode) return;

        // Parse spawn ID
        let animalType, variant;

        // Handle different naming patterns
        if (spawnId === 'badger' || spawnId === 'weasel' || spawnId === 'fox') {
            animalType = spawnId;
            variant = 'default';
        } else if (spawnId.includes('_baby') || spawnId.includes('_pup')) {
            // Baby variants
            animalType = spawnId.replace('_baby', '').replace('_pup', '');
            variant = 'baby';
        } else if (spawnId.includes('_leader')) {
            animalType = spawnId.replace('_leader', '');
            variant = 'leader';
        } else if (spawnId.includes('_alpha')) {
            animalType = spawnId.replace('_alpha', '');
            variant = 'alpha';
        } else if (spawnId.includes('_male')) {
            animalType = spawnId.replace('_male', '');
            variant = 'male';
        } else if (spawnId.includes('_female')) {
            animalType = spawnId.replace('_female', '');
            variant = 'female';
        } else {
            animalType = spawnId;
            variant = 'default';
        }

        // Find spawn position near player
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 5;
        const spawnX = GameState.peccary.position.x + Math.cos(angle) * distance;
        const spawnZ = GameState.peccary.position.z + Math.sin(angle) * distance;

        // Use Enemies module to spawn
        if (typeof Enemies !== 'undefined' && Enemies.spawnSpecificEnemy) {
            const enemy = Enemies.spawnSpecificEnemy(animalType, variant, spawnX, spawnZ);
            if (enemy) {
                console.log('Spawned:', animalType, variant, 'at', spawnX.toFixed(1), spawnZ.toFixed(1));
            } else {
                console.log('Failed to spawn:', animalType, variant);
            }
        } else {
            console.log('Enemies.spawnSpecificEnemy not available');
        }
    }

    // ========================================================================
    // SAVES MODAL
    // ========================================================================

    /**
     * Open the saves modal in 'save' or 'load' mode.
     * @param {string} mode - 'save' or 'load'
     */
    function openSavesModal(mode) {
        var modal = document.getElementById('saves-modal');
        var title = document.getElementById('saves-modal-title');
        var newSlotBtn = document.getElementById('saves-new-slot-btn');

        modal.classList.remove('hidden');
        modal.dataset.mode = mode;

        if (mode === 'save') {
            title.textContent = 'Save Game';
            newSlotBtn.style.display = '';
        } else {
            title.textContent = 'Load Game';
            newSlotBtn.style.display = 'none';
        }

        renderSavesList(mode);
    }

    /**
     * Close the saves modal.
     */
    function closeSavesModal() {
        document.getElementById('saves-modal').classList.add('hidden');
    }

    /**
     * Render the saves list inside the modal.
     * @param {string} mode - 'save' or 'load'
     */
    function renderSavesList(mode) {
        var container = document.getElementById('saves-list');
        var saves = SaveSystem.getAllSaves();

        container.innerHTML = '';

        if (saves.length === 0) {
            container.innerHTML = '<div class="saves-empty">No saved games yet.</div>';
            return;
        }

        saves.forEach(function(save, index) {
            var slot = document.createElement('div');
            slot.className = 'save-slot';

            var date = new Date(save.timestamp);
            var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
            var dateStr = pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear() +
                          ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());

            var biomeNames = {
                arboreal: 'Arboreal',
                savannah: 'Savannah',
                snowy_mountains: 'Snowy Mountains',
                coastal: 'Coastal'
            };

            slot.innerHTML =
                '<div class="save-slot-info">' +
                    '<div class="save-slot-name">' + (save.name || 'Unnamed Save') + '</div>' +
                    '<div class="save-slot-details">' +
                        'Score: ' + (save.score || 0) +
                        ' | ' + (biomeNames[save.currentBiome] || save.currentBiome) +
                        ' | ' + dateStr +
                    '</div>' +
                '</div>' +
                '<div class="save-slot-actions">' +
                    (mode === 'save' ?
                        '<button class="overwrite-btn" data-index="' + index + '">Overwrite</button>' :
                        '<button class="load-btn" data-index="' + index + '">Load</button>'
                    ) +
                    '<button class="export-btn" data-index="' + index + '" title="Export JSON">{ }</button>' +
                    '<button class="delete-btn" data-index="' + index + '" title="Delete">X</button>' +
                '</div>';

            container.appendChild(slot);
        });

        // Wire up buttons
        container.querySelectorAll('.overwrite-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var idx = parseInt(btn.dataset.index);
                var existingName = saves[idx] ? saves[idx].name : null;
                SaveSystem.saveGame(idx, existingName);
                SaveSystem.showSaveNotification('Game Saved!');
                renderSavesList(mode);
            });
        });

        container.querySelectorAll('.load-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var idx = parseInt(btn.dataset.index);
                closeSavesModal();

                // If game isn't running yet, boot it first
                if (!GameState.gameRunning) {
                    startGame(false);
                }

                var result = SaveSystem.loadGame(idx);
                if (result.success) {
                    if (result.warnings.length > 0) {
                        console.warn('Load warnings:', result.warnings);
                        SaveSystem.showSaveNotification('Loaded (with warnings)');
                    } else {
                        SaveSystem.showSaveNotification('Game Loaded!');
                    }
                } else {
                    SaveSystem.showSaveNotification('Load Failed!');
                }
            });
        });

        container.querySelectorAll('.export-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var idx = parseInt(btn.dataset.index);
                var json = SaveSystem.exportSave(idx);
                if (json) {
                    // Copy to clipboard and trigger download
                    var blob = new Blob([json], { type: 'application/json' });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'evax-save-' + idx + '.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    SaveSystem.showSaveNotification('Save exported!');
                }
            });
        });

        container.querySelectorAll('.delete-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var idx = parseInt(btn.dataset.index);
                if (confirm('Delete this save?')) {
                    SaveSystem.deleteSave(idx);
                    renderSavesList(mode);
                }
            });
        });
    }

    // ========================================================================
    // CONSOLE TESTING MODE - Game.test() / Game.test(false)
    // ========================================================================
    var testSnapshot = null;

    function toggleTestMode(enable) {
        if (enable === false) return disableTestingMode();
        return enableTestingMode();
    }

    function enableTestingMode() {
        if (!GameState.gameRunning) {
            startGame(true);
            GameState.currentBiome = 'arboreal';
            Environment.rebuildForBiome('arboreal');
            document.getElementById('biome-label').textContent = BIOMES.arboreal.displayName;
            spawnBiomeContent('arboreal');
            Inventory.refreshBestiary();
            console.log('%c TESTING MODE ACTIVATED ', 'background: #ff4444; color: white; font-size: 16px; padding: 4px;');
            return;
        }

        // Snapshot current values before testing overwrites them
        testSnapshot = {
            health: GameState.health,
            hunger: GameState.hunger,
            thirst: GameState.thirst,
            pigCoins: GameState.pigCoins,
            resourceCounts: Object.assign({}, GameState.resourceCounts),
            hasSaddle: GameState.hasSaddle,
            artifacts: (GameState.artifacts || []).slice()
        };

        GameState.isTestingMode = true;
        GameState.pigCoins = 99999;
        GameState.resourceCounts = { berries: 999, nuts: 999, mushrooms: 999, seaweed: 999, eggs: 999, arsenic_mushrooms: 999, thous_pine_wood: 999, glass: 999, manglecacia_wood: 999, seaspray_birch_wood: 999, cinnamon: 999 };
        GameState.hasSaddle = true;
        GameState.artifacts = ARTIFACTS.map(a => a.id);
        document.getElementById('testing-indicator').classList.remove('hidden');
        UI.updateUI();
        Inventory.refreshBestiary();
        console.log('%c TESTING MODE ACTIVATED ', 'background: #ff4444; color: white; font-size: 16px; padding: 4px;');
        console.log('Press T to open testing menu. Type Game.play() to exit.');
    }

    function disableTestingMode() {
        if (!GameState.isTestingMode) {
            console.log('Not in testing mode.');
            return;
        }

        GameState.isTestingMode = false;
        GameState.isTestingMenuOpen = false;
        document.getElementById('testing-indicator').classList.add('hidden');
        document.getElementById('testing-menu').classList.add('hidden');

        if (testSnapshot) {
            GameState.health = testSnapshot.health;
            GameState.hunger = testSnapshot.hunger;
            GameState.thirst = testSnapshot.thirst;
            GameState.pigCoins = testSnapshot.pigCoins;
            GameState.resourceCounts = testSnapshot.resourceCounts;
            GameState.hasSaddle = testSnapshot.hasSaddle;
            GameState.artifacts = testSnapshot.artifacts;
            testSnapshot = null;
        }

        UI.updateUI();
        console.log('%c TESTING MODE OFF — stats restored ', 'background: #44aa44; color: white; font-size: 16px; padding: 4px;');
    }

    // Public API
    return {
        init: init,
        playSound: playSound,
        takeDamage: takeDamage,
        startGame: startGame,
        restartGame: restartGame,
        gameOver: gameOver,
        transitionToBiome: transitionToBiome,
        clearBiomeContent: clearBiomeContent,
        toggleTestingMenu: toggleTestingMenu,
        teleportToBiome: teleportToBiome,
        updateBecomeAnimal: updateBecomeAnimal,
        stopBecomeAnimal: stopBecomeAnimal,
        showBlockedMessage: showBlockedMessage,
        openSavesModal: openSavesModal,
        closeSavesModal: closeSavesModal,
        spawnBiomeContent: spawnBiomeContent,
        test: toggleTestMode
    };
})();

// ============================================================================
// COASTAL TREASURE CHESTS
// ============================================================================
// One chest spawns on a random island. After collecting, 15 min until next.
// Three tiers: Common (70%), Uncommon (25%), Seafarer (5%).
// ============================================================================

var CHEST_TIERS = [
    {
        id: 'common',
        name: 'Common Chest',
        weight: 70,
        color: 0x8B6914,       // Brown wood
        bandColor: 0x666666,   // Iron bands
        loot: function() {
            return {
                coins: 250,
                score: 300,
                items: [],
                description: '250 Pig Coins + 300 Score'
            };
        }
    },
    {
        id: 'uncommon',
        name: 'Uncommon Chest',
        weight: 25,
        color: 0x4A7A4A,       // Green-tinted wood
        bandColor: 0xC0C0C0,   // Silver bands
        loot: function() {
            // Random rare resources
            var resourceRoll = Math.random();
            var bonusItems = [];
            var bonusDesc = '';
            if (resourceRoll < 0.4) {
                bonusItems.push({ id: 'seaspray_birch_wood', count: 3 + Math.floor(Math.random() * 3) });
                bonusDesc = bonusItems[0].count + ' Seaspray Birch Wood';
            } else if (resourceRoll < 0.7) {
                bonusItems.push({ id: 'glass', count: 2 + Math.floor(Math.random() * 2) });
                bonusDesc = bonusItems[0].count + ' Glass';
            } else {
                bonusItems.push({ id: 'cinnamon', count: 2 + Math.floor(Math.random() * 2) });
                bonusDesc = bonusItems[0].count + ' Cinnamon';
            }
            return {
                coins: 500,
                score: 500,
                items: bonusItems,
                description: '500 Pig Coins + 500 Score + ' + bonusDesc
            };
        }
    },
    {
        id: 'seafarer',
        name: 'Seafarer Chest',
        weight: 5,
        color: 0x2C1810,       // Dark mahogany
        bandColor: 0xFFD700,   // Gold bands
        loot: function() {
            var bonusItems = [];
            var bonusDesc = '';
            // Rare resources
            bonusItems.push({ id: 'seaspray_birch_wood', count: 5 });
            bonusItems.push({ id: 'glass', count: 3 });
            bonusDesc = '5 Seaspray Birch Wood + 3 Glass';
            // Eyepatch (only if player doesn't have one)
            var hasEyepatch = GameState.inventoryItems &&
                GameState.inventoryItems.some(function(it) { return it.id === 'pirate_eyepatch'; });
            if (!hasEyepatch) {
                bonusItems.push({ id: 'pirate_eyepatch', count: 1 });
                bonusDesc += ' + Pirate Eyepatch!';
            } else {
                // Already have eyepatch — give extra coins instead
                bonusDesc += ' + 500 bonus coins';
            }
            return {
                coins: 1000,
                score: 1000,
                items: bonusItems,
                hasEyepatch: hasEyepatch,
                description: '1000 Pig Coins + 1000 Score + ' + bonusDesc
            };
        }
    }
];

function rollChestTier() {
    var totalWeight = 0;
    for (var i = 0; i < CHEST_TIERS.length; i++) totalWeight += CHEST_TIERS[i].weight;
    var roll = Math.random() * totalWeight;
    var running = 0;
    for (var j = 0; j < CHEST_TIERS.length; j++) {
        running += CHEST_TIERS[j].weight;
        if (roll < running) return CHEST_TIERS[j];
    }
    return CHEST_TIERS[0];
}

/**
 * Build a 3D treasure chest model.
 */
function buildChestModel(tier) {
    var group = new THREE.Group();
    var woodColor = tier.color;
    var bandColor = tier.bandColor;
    var woodMat = new THREE.MeshStandardMaterial({ color: woodColor, roughness: 0.8 });
    var bandMat = new THREE.MeshStandardMaterial({ color: bandColor, metalness: 0.7, roughness: 0.3 });

    // Base box (bottom half)
    var base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.2), woodMat);
    base.position.y = 0.4;
    group.add(base);

    // Lid (rounded top)
    var lidGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.82, 12, 1, false, 0, Math.PI);
    var lid = new THREE.Mesh(lidGeo, woodMat);
    lid.rotation.z = Math.PI / 2;
    lid.rotation.y = Math.PI / 2;
    lid.position.y = 0.8;
    group.add(lid);

    // Metal bands (3 horizontal)
    for (var b = 0; b < 3; b++) {
        var band = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 1.25), bandMat);
        band.position.set(-0.6 + b * 0.6, 0.4, 0);
        group.add(band);
        // Band on lid too
        var lidBand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 1.25), bandMat);
        lidBand.position.set(-0.6 + b * 0.6, 0.83, 0);
        group.add(lidBand);
    }

    // Lock/clasp on front
    var lock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.05), bandMat);
    lock.position.set(0, 0.55, 0.63);
    group.add(lock);
    var lockHole = new THREE.Mesh(
        new THREE.TorusGeometry(0.06, 0.02, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    lockHole.position.set(0, 0.5, 0.66);
    group.add(lockHole);

    // Seafarer chest gets a gold sparkle
    if (tier.id === 'seafarer') {
        var sparkle = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0xFFAA00, emissiveIntensity: 0.6 })
        );
        sparkle.position.set(0, 1.1, 0);
        sparkle.name = 'sparkle';
        group.add(sparkle);
    }

    group.scale.set(0.8, 0.8, 0.8);
    return group;
}

/**
 * Spawn a treasure chest on a random island.
 */
function spawnTreasureChest() {
    if (GameState.currentBiome !== 'coastal') return;
    if (GameState.activeChest) return; // Only one chest at a time

    // Pick a random island
    var islands = GameState.oceanIslands;
    if (!islands || islands.length === 0) return;
    var island = islands[Math.floor(Math.random() * islands.length)];

    // Roll tier
    var tier = rollChestTier();

    // Build model
    var chest = buildChestModel(tier);
    // Place on top of island
    var angle = Math.random() * Math.PI * 2;
    var dist = Math.random() * (island.radius * 0.5); // Within inner half of island
    chest.position.set(
        island.x + Math.cos(angle) * dist,
        island.height + 0.1,
        island.z + Math.sin(angle) * dist
    );

    chest.userData = {
        type: 'treasure_chest',
        tierId: tier.id,
        tierName: tier.name,
        tierData: tier,
        interactRange: 5,
        islandIdx: islands.indexOf(island)
    };

    GameState.scene.add(chest);
    GameState.activeChest = chest;

    console.log('[CHEST] Spawned ' + tier.name + ' on island at (' +
        Math.round(chest.position.x) + ', ' + Math.round(chest.position.z) + ')');
}

/**
 * Open the active chest and give loot to the player.
 */
function openTreasureChest() {
    var chest = GameState.activeChest;
    if (!chest) return false;

    var playerDist = GameState.peccary.position.distanceTo(chest.position);
    if (playerDist > chest.userData.interactRange) return false;

    var tier = chest.userData.tierData;
    var loot = tier.loot();

    // Give coins and score
    GameState.pigCoins += loot.coins;
    GameState.score += loot.score;

    // Give resource items
    for (var i = 0; i < loot.items.length; i++) {
        var item = loot.items[i];
        if (item.id === 'pirate_eyepatch') {
            // Special: add eyepatch to inventory
            var hasIt = GameState.inventoryItems.some(function(it) { return it.id === 'pirate_eyepatch'; });
            if (!hasIt) {
                GameState.inventoryItems.push({
                    id: 'pirate_eyepatch',
                    name: "Pirate's Eyepatch",
                    description: 'A fearsome eyepatch! Equip from hotbar — non-hostile animals flee in terror.',
                    effect: { type: 'item', item: 'pirate_eyepatch' },
                    count: 1
                });
            }
        } else {
            // Resources go to resourceCounts
            if (GameState.resourceCounts[item.id] !== undefined) {
                GameState.resourceCounts[item.id] += item.count;
            }
        }
    }

    // Seafarer chest without eyepatch gives bonus coins
    if (loot.hasEyepatch) {
        GameState.pigCoins += 500;
    }

    // Rarity color for toast
    var tierColors = { common: '#aaaaaa', uncommon: '#55cc55', seafarer: '#ffdd00' };
    var tierColor = tierColors[tier.id] || '#ffffff';

    UI.showToast(
        '<span style="color:' + tierColor + '">' + tier.name + ' Opened!</span>',
        loot.description
    );

    Game.playSound('collect');

    // Remove chest from world
    GameState.scene.remove(chest);
    GameState.activeChest = null;

    // Start 15 minute respawn timer
    GameState.chestRespawnTimer = 15 * 60; // 15 minutes in seconds

    UI.updateUI();
    return true;
}

/**
 * Update treasure chest system (called each frame).
 */
function updateTreasureChests(delta) {
    if (GameState.currentBiome !== 'coastal') return;

    // Respawn timer
    if (!GameState.activeChest && GameState.chestRespawnTimer !== undefined) {
        GameState.chestRespawnTimer -= delta;
        if (GameState.chestRespawnTimer <= 0) {
            GameState.chestRespawnTimer = undefined;
            spawnTreasureChest();
        }
    }

    // Proximity check — show "Press E" prompt
    if (GameState.activeChest && GameState.peccary) {
        var dist = GameState.peccary.position.distanceTo(GameState.activeChest.position);
        if (dist < GameState.activeChest.userData.interactRange) {
            GameState.nearbyChest = GameState.activeChest;
            // Show prompt
            var prompt = document.getElementById('interact-prompt');
            if (prompt) {
                prompt.textContent = 'Press E to open ' + GameState.activeChest.userData.tierName;
                prompt.classList.remove('hidden');
            }
        } else {
            if (GameState.nearbyChest === GameState.activeChest) {
                GameState.nearbyChest = null;
                var prompt2 = document.getElementById('interact-prompt');
                if (prompt2 && !GameState.nearbyVillager) {
                    prompt2.classList.add('hidden');
                }
            }
        }

        // Animate chest — gentle bob and sparkle for seafarer
        var ch = GameState.activeChest;
        ch.rotation.y += delta * 0.3;
        if (ch.userData.tierId === 'seafarer') {
            ch.children.forEach(function(child) {
                if (child.name === 'sparkle') {
                    child.position.y = 1.1 + Math.sin(Date.now() * 0.003) * 0.15;
                    child.material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.005) * 0.4;
                }
            });
        }
    }
}

// ============================================================================
// PIRATE'S EYEPATCH — Equippable item, makes animals flee
// ============================================================================

GameState.eyepatchEquipped = false;

/**
 * Build eyepatch mesh and attach to Pedro's head.
 */
function attachEyepatchToPedro() {
    if (!GameState.peccary) return;
    // Remove old one if exists
    GameState.peccary.traverse(function(child) {
        if (child.name === 'pirate_eyepatch') {
            child.parent.remove(child);
        }
    });

    if (!GameState.eyepatchEquipped) return;

    // Find Pedro's head
    var head = null;
    GameState.peccary.traverse(function(child) {
        if (child.name === 'head') head = child;
    });
    if (!head) head = GameState.peccary; // fallback

    // Build eyepatch
    var patchGroup = new THREE.Group();
    patchGroup.name = 'pirate_eyepatch';

    // The patch (dark circle over eye)
    var patchMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    var patch = new THREE.Mesh(new THREE.CircleGeometry(0.15, 12), patchMat);
    patch.position.set(0.25, 0.15, 0.35); // Right eye position
    patch.rotation.y = 0.4;
    patchGroup.add(patch);

    // Strap (thin band going around head)
    var strapMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    var strap = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.02, 6, 16, Math.PI), strapMat);
    strap.position.set(0, 0.15, 0.05);
    strap.rotation.x = Math.PI / 2;
    strap.rotation.z = 0.3;
    patchGroup.add(strap);

    head.add(patchGroup);
}

/**
 * Toggle eyepatch on/off when used from hotbar.
 */
function toggleEyepatch() {
    GameState.eyepatchEquipped = !GameState.eyepatchEquipped;
    attachEyepatchToPedro();
    if (GameState.eyepatchEquipped) {
        UI.showToast("Yarr!", "Pirate's Eyepatch equipped! Animals will flee in terror!");
    } else {
        UI.showToast("Eyepatch Off", "Animals no longer fear you.");
    }
}

// ============================================================================
// EASTER — Chocolate Goggles effect
// ============================================================================
function activateChocolateGoggles() {
    var bunnies = GameState.easterBunnies || [];
    if (bunnies.length === 0) {
        UI.showToast('No Bunnies!', 'There are no naughty bunnies nearby to highlight.');
        return;
    }

    UI.showToast('Goggles Activated!', 'All bunnies highlighted for 10 seconds!');
    Game.playSound('collect');

    // Store original materials and apply glow
    var glowMat = new THREE.MeshStandardMaterial({
        color: 0xffdd00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.8
    });

    var originals = [];
    bunnies.forEach(function(bunny) {
        bunny.traverse(function(child) {
            if (child.isMesh) {
                originals.push({ mesh: child, material: child.material });
                child.material = glowMat;
            }
        });
    });

    // Remove glow after 10 seconds
    setTimeout(function() {
        originals.forEach(function(entry) {
            if (entry.mesh && entry.mesh.parent) {
                entry.mesh.material = entry.material;
            }
        });
        UI.showToast('Goggles Expired', 'The glow has faded.');
    }, 10000);
}

// ============================================================================
// EASTER EVENT — Stall + NPC builders
// ============================================================================

/**
 * Build a market stall mesh.
 */
function buildEasterStall(color) {
    var stall = new THREE.Group();
    var woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5e3c });
    var fabricMat = new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide });

    // Four wooden legs
    [[-1.2, -0.8], [1.2, -0.8], [-1.2, 0.8], [1.2, 0.8]].forEach(function(pos) {
        var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 8), woodMat);
        leg.position.set(pos[0], 1.5, pos[1]);
        leg.castShadow = true;
        stall.add(leg);
    });

    // Counter top
    var counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.8), woodMat);
    counter.position.set(0, 1.1, 0);
    counter.castShadow = true;
    stall.add(counter);

    // Fabric canopy
    var canopy = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 2.2), fabricMat);
    canopy.position.set(0, 3.05, 0);
    canopy.rotation.x = 0.1;
    canopy.castShadow = true;
    stall.add(canopy);

    // Fabric valances (front + back drapes)
    var valance = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.5), fabricMat);
    valance.position.set(0, 2.8, -1.1);
    stall.add(valance);
    var backValance = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.5), fabricMat);
    backValance.position.set(0, 2.8, 1.1);
    backValance.rotation.y = Math.PI;
    stall.add(backValance);

    return stall;
}

/**
 * Build a big bunny NPC model (larger upright version of naughty bunnies).
 */
function buildBunnyNPC(bodyColor, innerEarColor) {
    var bunny = new THREE.Group();
    var model = new THREE.Group();
    var bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor });
    var bellyMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var earInnerMat = new THREE.MeshStandardMaterial({ color: innerEarColor });

    // Body
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), bodyMat);
    body.scale.set(0.9, 1.2, 0.8);
    body.position.y = 1.4;
    body.castShadow = true;
    model.add(body);

    // Belly patch
    var belly = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), bellyMat);
    belly.scale.set(0.7, 0.9, 0.3);
    belly.position.set(0, 1.3, 0.35);
    model.add(belly);

    // Head
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), bodyMat);
    head.position.y = 2.6;
    head.castShadow = true;
    model.add(head);

    // Cheeks
    [-0.25, 0.25].forEach(function(offset) {
        var cheek = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), bodyMat);
        cheek.position.set(offset, 2.45, 0.3);
        model.add(cheek);
    });

    // Eyes
    var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var pupilMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    [-0.18, 0.18].forEach(function(offset) {
        var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), eyeWhiteMat);
        eyeWhite.position.set(offset, 2.75, 0.35);
        model.add(eyeWhite);
        var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pupilMat);
        pupil.position.set(offset, 2.75, 0.45);
        model.add(pupil);
    });

    // Pink nose
    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffaaaa }));
    nose.position.set(0, 2.6, 0.48);
    model.add(nose);

    // Tall ears
    [-0.2, 0.2].forEach(function(offset) {
        var ear = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.0, 8), bodyMat);
        ear.position.set(offset, 3.4, -0.05);
        ear.rotation.z = offset > 0 ? -0.15 : 0.15;
        ear.castShadow = true;
        model.add(ear);
        var inner = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.8, 8), earInnerMat);
        inner.position.set(offset, 3.4, 0.02);
        inner.rotation.z = offset > 0 ? -0.15 : 0.15;
        model.add(inner);
    });

    // Arms
    [-0.55, 0.55].forEach(function(offset) {
        var arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8), bodyMat);
        arm.position.set(offset, 1.7, 0);
        arm.rotation.z = offset > 0 ? -0.4 : 0.4;
        model.add(arm);
        var paw = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), bodyMat);
        paw.position.set(offset * 1.2, 1.35, 0);
        model.add(paw);
    });

    // Legs
    [-0.25, 0.25].forEach(function(offset) {
        var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.6, 8), bodyMat);
        leg.position.set(offset, 0.6, 0);
        model.add(leg);
        var foot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), bodyMat);
        foot.scale.set(0.8, 0.5, 1.3);
        foot.position.set(offset, 0.2, 0.1);
        model.add(foot);
    });

    // Cotton tail
    var tail = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), bellyMat);
    tail.position.set(0, 1.2, -0.6);
    model.add(tail);

    bunny.add(model);
    return bunny;
}

/**
 * Spawn Easter stalls and NPC bunnies in the village.
 */
function spawnEasterStalls() {
    var vx = CONFIG.VILLAGE_CENTER.x;
    var vz = CONFIG.VILLAGE_CENTER.z;

    // === PINK STALL — Marshmallow (quest giver) ===
    var pinkStall = buildEasterStall(0xff88bb);
    pinkStall.position.set(vx - 5, 0, vz - 35);
    pinkStall.rotation.y = Math.PI;
    GameState.scene.add(pinkStall);
    GameState.easterStalls.push(pinkStall);

    // Marshmallow NPC — big white bunny behind stall
    var marshmallow = buildBunnyNPC(0xffffff, 0xffccdd);
    marshmallow.position.set(vx - 5, 0, vz - 36);
    marshmallow.rotation.y = Math.PI;
    marshmallow.userData = {
        type: 'villager',
        name: 'Marshmallow',
        role: 'Easter Quest Bunny',
        interactRange: 5,
        conversationTree: buildMarshmallowDialog()
    };
    GameState.scene.add(marshmallow);
    GameState.villagers.push(marshmallow);
    GameState.easterNPCs.push(marshmallow);

    // === GREEN STALL — Clover (shop) ===
    var greenStall = buildEasterStall(0x66cc66);
    greenStall.position.set(vx + 5, 0, vz - 35);
    greenStall.rotation.y = Math.PI;
    GameState.scene.add(greenStall);
    GameState.easterStalls.push(greenStall);

    // Clover NPC — big green bunny behind stall
    var clover = buildBunnyNPC(0x88dd88, 0xccffcc);
    clover.position.set(vx + 5, 0, vz - 36);
    clover.rotation.y = Math.PI;
    clover.userData = {
        type: 'villager',
        name: 'Clover',
        role: 'Easter Shopkeeper',
        interactRange: 5,
        conversationTree: buildCloverDialog()
    };
    GameState.scene.add(clover);
    GameState.villagers.push(clover);
    GameState.easterNPCs.push(clover);
}

/**
 * Remove Easter stalls and NPCs from the scene.
 */
function removeEasterStalls() {
    GameState.easterStalls.forEach(function(stall) {
        GameState.scene.remove(stall);
    });
    GameState.easterStalls = [];

    GameState.easterNPCs.forEach(function(npc) {
        GameState.scene.remove(npc);
        var idx = GameState.villagers.indexOf(npc);
        if (idx !== -1) GameState.villagers.splice(idx, 1);
    });
    GameState.easterNPCs = [];
}

// ============================================================================
// EASTER DIALOG TREES
// ============================================================================

function buildMarshmallowDialog() {
    var nodes = {};

    nodes['greeting'] = {
        text: "*Marshmallow's big ears wiggle* Welcome, Pedro! I'm Marshmallow, the Easter Quest Bunny! Those naughty little bunnies have been causing chaos. Can you help me round them up?",
        choices: [
            { text: "I'd like a quest!", nextNode: 'quest_menu' },
            { text: "Turn in quest", nextNode: 'turn_in_check' },
            { text: "How many chocolate eggs do I have?", nextNode: 'check_eggs' },
            { text: "Goodbye.", nextNode: null }
        ]
    };

    nodes['check_eggs'] = {
        text: "DYNAMIC_EGGS",
        choices: [
            { text: "Give me a quest!", nextNode: 'quest_menu' },
            { text: "Goodbye.", nextNode: null }
        ]
    };

    nodes['quest_menu'] = {
        text: "DYNAMIC_QUEST_MENU",
        choices: [
            { text: "Back.", nextNode: 'greeting' }
        ]
    };

    nodes['turn_in_check'] = {
        text: "DYNAMIC_TURN_IN",
        choices: [
            { text: "Back.", nextNode: 'greeting' }
        ]
    };

    nodes['quest_accepted'] = {
        text: "DYNAMIC_QUEST_ACCEPTED",
        choices: [
            { text: "I'm on it!", nextNode: null }
        ]
    };

    nodes['quest_turned_in'] = {
        text: "DYNAMIC_QUEST_TURNED_IN",
        choices: [
            { text: "Another quest!", nextNode: 'quest_menu' },
            { text: "Thanks! Goodbye.", nextNode: null }
        ]
    };

    nodes['already_has_quest'] = {
        text: "DYNAMIC_ALREADY_HAS_QUEST",
        choices: [
            { text: "I'll keep going!", nextNode: null },
            { text: "I want to abandon it.", nextNode: 'abandon_confirm' }
        ]
    };

    nodes['abandon_confirm'] = {
        text: "Are you sure? You'll lose all progress on this quest!",
        choices: [
            { text: "Yes, abandon it.", nextNode: 'quest_abandoned', effectData: { type: 'easter_abandon_quest' } },
            { text: "No, I'll keep going.", nextNode: null }
        ]
    };

    nodes['lamb_quest_info'] = {
        text: "*Marshmallow whispers excitedly* Pedro! A naughty little LAMB has been spotted near the cherry blossoms! It's super rare and SO hard to catch — you need to grab it 3 times because it keeps wriggling free!\n\nBut first I need 30 cherry blossom petals as payment. The reward? 30 chocolate eggs AND a special lamb costume skin!",
        choices: [
            { text: "Accept! (costs 30 petals)", nextNode: 'lamb_quest_accepted', effectData: { type: 'easter_accept_lamb_quest' } },
            { text: "I don't have enough petals...", nextNode: 'greeting' },
            { text: "Maybe later.", nextNode: 'greeting' }
        ]
    };

    nodes['lamb_quest_accepted'] = {
        text: "*Marshmallow bounces with excitement* The lamb has appeared! Hurry, find it near the cherry blossom trees! Remember — you need to catch it 3 TIMES! It gets faster each time it escapes!",
        choices: [
            { text: "I'm on it!", nextNode: null }
        ]
    };

    nodes['lamb_quest_failed'] = {
        text: "You don't have 30 cherry blossom petals yet! Go press E near the cherry blossom trees to collect some.",
        choices: [
            { text: "Got it!", nextNode: null }
        ]
    };

    nodes['quest_abandoned'] = {
        text: "Alright, the quest has been cancelled. Come back when you want a new one!",
        choices: [
            { text: "Give me a new quest.", nextNode: 'quest_menu' },
            { text: "Goodbye.", nextNode: null }
        ]
    };

    nodes['not_complete'] = {
        text: "DYNAMIC_NOT_COMPLETE",
        choices: [
            { text: "I'll keep at it!", nextNode: null }
        ]
    };

    nodes['no_quest'] = {
        text: "You don't have an active quest to turn in! Want to pick one up?",
        choices: [
            { text: "Sure!", nextNode: 'quest_menu' },
            { text: "Goodbye.", nextNode: null }
        ]
    };

    return { startNode: 'greeting', nodes: nodes };
}

function buildCloverDialog() {
    var nodes = {};

    nodes['greeting'] = {
        text: "*Clover adjusts a basket of chocolate* Hey there, Pedro! I'm Clover! I've got the best Easter gear in town. Everything runs on chocolate eggs — earn them from Marshmallow's quests!",
        choices: [
            { text: "Open Easter Shop", nextNode: 'shop_opened', effectData: { type: 'open_easter_shop' } },
            { text: "How many chocolate eggs do I have?", nextNode: 'check_eggs' },
            { text: "What do you sell?", nextNode: 'item_info' },
            { text: "Goodbye.", nextNode: null }
        ]
    };

    nodes['shop_opened'] = {
        text: "Take your pick! Everything's chocolate-egg priced!",
        choices: [
            { text: "Open shop again", nextNode: 'shop_opened', effectData: { type: 'open_easter_shop' } },
            { text: "Thanks!", nextNode: null }
        ]
    };

    nodes['check_eggs'] = {
        text: "DYNAMIC_EGGS",
        choices: [
            { text: "Open Easter Shop", nextNode: 'shop_opened', effectData: { type: 'open_easter_shop' } },
            { text: "Goodbye.", nextNode: null }
        ]
    };

    nodes['item_info'] = {
        text: "I've got three amazing items!\n\n🥅 Catcher Net (10 eggs) — Doubles your bunny catching range!\n🥽 Chocolate Goggles (20 eggs) — One-time use! Highlights ALL bunnies for 10 seconds.\n⛸️ Roller Skates (30 eggs) — Speed boost! Press E to put on or take off.",
        choices: [
            { text: "Open Easter Shop", nextNode: 'shop_opened', effectData: { type: 'open_easter_shop' } },
            { text: "Interesting!", nextNode: 'greeting' }
        ]
    };

    return { startNode: 'greeting', nodes: nodes };
}

// ============================================================================
// EASTER EVENT — Console commands
// ============================================================================
// EASTER LAMB SYSTEM — Rare quest, naughty lamb, 3-catch mechanic
// ============================================================================

/**
 * Build a cute little lamb 3D model.
 * @param {number} bodyColor - The lamb's body color (from EASTER_LAMB_COLORS)
 */
function buildLambModel(bodyColor) {
    var lamb = new THREE.Group();

    var bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor });
    var whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

    // Fluffy wool body (slightly squashed sphere)
    var bodyGeo = new THREE.SphereGeometry(0.7, 10, 10);
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1, 0.85, 1.2);
    body.position.y = 0.8;
    lamb.add(body);

    // Head (white face)
    var headGeo = new THREE.SphereGeometry(0.35, 8, 8);
    var head = new THREE.Mesh(headGeo, whiteMat);
    head.position.set(0, 1.2, 0.7);
    lamb.add(head);

    // Eyes
    var eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
    var leftEye = new THREE.Mesh(eyeGeo, darkMat);
    leftEye.position.set(-0.12, 1.28, 0.95);
    lamb.add(leftEye);
    var rightEye = new THREE.Mesh(eyeGeo, darkMat);
    rightEye.position.set(0.12, 1.28, 0.95);
    lamb.add(rightEye);

    // Nose (tiny pink dot)
    var noseMat = new THREE.MeshStandardMaterial({ color: 0xffaaaa });
    var noseGeo = new THREE.SphereGeometry(0.04, 6, 6);
    var nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 1.18, 1.02);
    lamb.add(nose);

    // Floppy ears (long droopy cylinders)
    var earMat = new THREE.MeshStandardMaterial({ color: bodyColor });
    var earGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.35, 6);
    var leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.25, 1.15, 0.65);
    leftEar.rotation.z = 0.5;
    leftEar.rotation.x = 0.3;
    lamb.add(leftEar);
    var rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.25, 1.15, 0.65);
    rightEar.rotation.z = -0.5;
    rightEar.rotation.x = 0.3;
    lamb.add(rightEar);

    // Four little legs
    var legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6);
    var hoofMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    var legPositions = [
        [-0.3, 0.25, 0.35], [0.3, 0.25, 0.35],
        [-0.3, 0.25, -0.35], [0.3, 0.25, -0.35]
    ];
    for (var i = 0; i < 4; i++) {
        var leg = new THREE.Mesh(legGeo, hoofMat);
        leg.position.set(legPositions[i][0], legPositions[i][1], legPositions[i][2]);
        lamb.add(leg);
    }

    // Fluffy little tail (small sphere)
    var tailGeo = new THREE.SphereGeometry(0.15, 6, 6);
    var tail = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.set(0, 0.9, -0.75);
    lamb.add(tail);

    return lamb;
}

/**
 * Spawn a naughty Easter lamb under a random cherry blossom tree.
 * @param {string} [forceLambId] - Force a specific lamb color ID (for testing)
 */
function spawnEasterLamb(forceLambId) {
    // Pick color
    var lambData;
    if (forceLambId) {
        lambData = EASTER_LAMB_COLORS.find(function(c) { return c.id === forceLambId; });
    }
    if (!lambData) lambData = pickRandomLambColor();

    // Pick a random cherry blossom tree position (or near village if no trees)
    var spawnX, spawnZ;
    if (GameState.easterCherryTrees && GameState.easterCherryTrees.length > 0) {
        var tree = GameState.easterCherryTrees[Math.floor(Math.random() * GameState.easterCherryTrees.length)];
        spawnX = tree.position.x + (Math.random() - 0.5) * 3;
        spawnZ = tree.position.z + (Math.random() - 0.5) * 3;
    } else {
        spawnX = CONFIG.VILLAGE_CENTER.x + (Math.random() - 0.5) * 20;
        spawnZ = CONFIG.VILLAGE_CENTER.z + (Math.random() - 0.5) * 20;
    }

    var lamb = buildLambModel(lambData.color);
    lamb.position.set(spawnX, 0, spawnZ);
    lamb.userData = {
        isEasterLamb: true,
        lambColorId: lambData.id,
        lambColorName: lambData.name,
        lambRarity: lambData.rarity,
        lambColor: lambData.color,
        catchesNeeded: 3,
        catchCount: 0,
        // AI state
        state: 'idle',         // idle, running, looking_back
        stateTimer: 0,
        speed: 8,              // base speed, increases after each catch
        fleeDirection: new THREE.Vector3(),
        radius: 0.7,
        spawnTime: GameState.clock.elapsedTime, // for 3-min sheep transformation
        isBlossom: lambData.id === 'blossom',   // blossom lambs leave petal trails
        trailTimer: 0                            // cooldown between trail drops
    };

    GameState.scene.add(lamb);
    GameState.easterLamb = lamb;

    console.log('A ' + lambData.rarity + ' ' + lambData.name + ' lamb appeared!');
    UI.showToast('A Naughty Lamb!',
        'A ' + lambData.rarity.toLowerCase() + ' ' + lambData.name + ' lamb appeared near the cherry blossoms! Click it to catch it — but it takes 3 catches!');
}

/**
 * Update Easter lamb AI (called from animate loop).
 * Behavior: idle → player approaches → sprint burst → stop & look back → repeat
 * Gets faster with each successful catch.
 */
function updateEasterLamb(delta) {
    var lamb = GameState.easterLamb;
    if (!lamb) return;

    var playerPos = GameState.peccary.position;
    var lambPos = lamb.position;
    var distToPlayer = playerPos.distanceTo(lambPos);
    var ud = lamb.userData;

    // Check 3-minute sheep transformation (180 seconds since spawn)
    var ageSeconds = GameState.clock.elapsedTime - ud.spawnTime;
    if (ageSeconds >= 180 && ud.catchCount === 0) {
        transformLambToSheep(lamb);
        return;
    }

    // Blossom lamb drops petal trails while running
    if (ud.isBlossom && ud.state === 'running') {
        ud.trailTimer -= delta;
        if (ud.trailTimer <= 0) {
            dropPetalTrail(lambPos.x, lambPos.z);
            ud.trailTimer = 0.15; // drop a petal every 0.15s
        }
    }

    ud.stateTimer -= delta;

    if (ud.state === 'idle') {
        // Gentle bob
        lamb.position.y = Math.sin(GameState.clock.elapsedTime * 2) * 0.05;
        // Face player gently
        lamb.lookAt(playerPos.x, lamb.position.y, playerPos.z);

        // Player approaches — start fleeing!
        if (distToPlayer < 8) {
            ud.state = 'running';
            ud.stateTimer = 1.5 + Math.random() * 1; // run for 1.5-2.5 seconds
            // Flee direction = away from player with some randomness
            ud.fleeDirection.subVectors(lambPos, playerPos).normalize();
            ud.fleeDirection.x += (Math.random() - 0.5) * 0.6;
            ud.fleeDirection.z += (Math.random() - 0.5) * 0.6;
            ud.fleeDirection.normalize();
        }
    } else if (ud.state === 'running') {
        // Sprint away
        lambPos.x += ud.fleeDirection.x * ud.speed * delta;
        lambPos.z += ud.fleeDirection.z * ud.speed * delta;
        lambPos.y = Math.sin(GameState.clock.elapsedTime * 8) * 0.15; // bouncy run

        // Face running direction
        lamb.lookAt(lambPos.x + ud.fleeDirection.x, lambPos.y, lambPos.z + ud.fleeDirection.z);

        // Keep in bounds (within world)
        var worldLimit = CONFIG.WORLD_SIZE * 0.65;
        if (Math.abs(lambPos.x) > worldLimit) ud.fleeDirection.x *= -1;
        if (Math.abs(lambPos.z) > worldLimit) ud.fleeDirection.z *= -1;

        // Timer up — stop and look back
        if (ud.stateTimer <= 0) {
            ud.state = 'looking_back';
            ud.stateTimer = 2 + Math.random() * 1.5; // stop for 2-3.5 seconds
        }

        // If player catches up while running, keep fleeing harder
        if (distToPlayer < 5) {
            ud.stateTimer = Math.max(ud.stateTimer, 1);
            ud.fleeDirection.subVectors(lambPos, playerPos).normalize();
        }
    } else if (ud.state === 'looking_back') {
        // Stand still, look at player (adorable!)
        lamb.lookAt(playerPos.x, lamb.position.y, playerPos.z);
        lamb.position.y = Math.sin(GameState.clock.elapsedTime * 2) * 0.05;

        // Player gets close again — run!
        if (distToPlayer < 10) {
            ud.state = 'running';
            ud.stateTimer = 1.5 + Math.random() * 1;
            ud.fleeDirection.subVectors(lambPos, playerPos).normalize();
            ud.fleeDirection.x += (Math.random() - 0.5) * 0.6;
            ud.fleeDirection.z += (Math.random() - 0.5) * 0.6;
            ud.fleeDirection.normalize();
        }

        // Timer up — go back to idle
        if (ud.stateTimer <= 0) {
            ud.state = 'idle';
        }
    }
}

/**
 * Attempt to catch the Easter lamb (called on click).
 * Returns true if caught (or partially caught).
 */
function tryClickLamb(clickX, clickY) {
    var lamb = GameState.easterLamb;
    if (!lamb) return false;

    // Raycast to check click hit
    var mouse = new THREE.Vector2();
    mouse.x = (clickX / window.innerWidth) * 2 - 1;
    mouse.y = -(clickY / window.innerHeight) * 2 + 1;
    var ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, GameState.camera);
    var hits = ray.intersectObject(lamb, true);
    if (hits.length === 0) return false;

    // Check distance
    var dist = GameState.peccary.position.distanceTo(lamb.position);
    var hotbarItem = UI.getSelectedHotbarItem();
    var catchRange = (hotbarItem && hotbarItem.id === 'catcher_net') ? 20 : 10;
    if (dist > catchRange) {
        UI.showToast('Too Far!', 'Get closer to the lamb!');
        return true;
    }

    var ud = lamb.userData;
    ud.catchCount++;

    if (ud.catchCount >= ud.catchesNeeded) {
        // FULLY CAUGHT!
        completeLambCatch(lamb);
    } else {
        // Escaped! Gets faster
        var catchNum = ud.catchCount;
        ud.speed += 4; // gets 4 faster each escape
        ud.state = 'running';
        ud.stateTimer = 2 + Math.random();
        ud.fleeDirection.subVectors(lamb.position, GameState.peccary.position).normalize();
        ud.fleeDirection.x += (Math.random() - 0.5) * 0.8;
        ud.fleeDirection.z += (Math.random() - 0.5) * 0.8;
        ud.fleeDirection.normalize();

        UI.showToast('Escaped! (' + catchNum + '/' + ud.catchesNeeded + ')',
            'The ' + ud.lambColorName + ' lamb wriggled free! It\'s getting faster!');
        Game.playSound('collect');
    }
    return true;
}

/**
 * Try clicking a sheep-born lamb (not the primary easterLamb).
 */
function tryClickSheepBornLamb(clickX, clickY) {
    if (!GameState.easterSheepLambs || GameState.easterSheepLambs.length === 0) return false;

    var mouse = new THREE.Vector2();
    mouse.x = (clickX / window.innerWidth) * 2 - 1;
    mouse.y = -(clickY / window.innerHeight) * 2 + 1;
    var ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, GameState.camera);

    for (var i = 0; i < GameState.easterSheepLambs.length; i++) {
        var lamb = GameState.easterSheepLambs[i];
        var hits = ray.intersectObject(lamb, true);
        if (hits.length === 0) continue;

        var dist = GameState.peccary.position.distanceTo(lamb.position);
        var hotbarItem = UI.getSelectedHotbarItem();
        var catchRange = (hotbarItem && hotbarItem.id === 'catcher_net') ? 20 : 10;
        if (dist > catchRange) {
            UI.showToast('Too Far!', 'Get closer to the lamb!');
            return true;
        }

        var ud = lamb.userData;
        ud.catchCount++;

        if (ud.catchCount >= ud.catchesNeeded) {
            GameState.easterSheepLambs.splice(i, 1);
            completeLambCatch(lamb);
        } else {
            var catchNum = ud.catchCount;
            ud.speed += 4;
            ud.state = 'running';
            ud.stateTimer = 2 + Math.random();
            ud.fleeDirection.subVectors(lamb.position, GameState.peccary.position).normalize();
            ud.fleeDirection.x += (Math.random() - 0.5) * 0.8;
            ud.fleeDirection.z += (Math.random() - 0.5) * 0.8;
            ud.fleeDirection.normalize();
            UI.showToast('Escaped! (' + catchNum + '/' + ud.catchesNeeded + ')',
                'The ' + ud.lambColorName + ' lamb wriggled free! It\'s getting faster!');
            Game.playSound('collect');
        }
        return true;
    }
    return false;
}

/**
 * Complete a lamb catch — award rewards and unlock skin.
 */
function completeLambCatch(lamb) {
    var ud = lamb.userData;

    // Remove lamb from scene
    GameState.scene.remove(lamb);
    if (GameState.easterLamb === lamb) {
        GameState.easterLamb = null;
    }

    // Award 30 chocolate eggs
    GameState.chocolateEggs += 30;

    // Complete the quest
    if (GameState.easterQuest && GameState.easterQuest.id === 'catch_naughty_lamb') {
        GameState.easterQuest = null;
        GameState.easterQuestBunnyCaught = 0;
        GameState.easterQuestEggsCollected = 0;
    }

    // Unlock the matching lamb skin
    var skinId = 'lamb_' + ud.lambColorId;
    if (SKINS[skinId]) {
        SKINS[skinId].unlocked = true;
        if (!GameState.unlockedSkins.includes(skinId)) {
            GameState.unlockedSkins.push(skinId);
        }
    }

    Game.playSound('collect');
    UI.showToast('Lamb Caught!',
        'You caught the ' + ud.lambRarity + ' ' + ud.lambColorName + ' lamb! +30 chocolate eggs & "Lamb: ' + ud.lambColorName + '" skin unlocked!');

    console.log('CAUGHT ' + ud.lambRarity + ' ' + ud.lambColorName + ' lamb!');
    console.log('Skin "lamb_' + ud.lambColorId + '" unlocked!');
    console.log('Chocolate eggs: ' + GameState.chocolateEggs);
}

// ============================================================================
// PETAL TRAIL SYSTEM — Blossom lambs & Blossom skin leave petal trails
// ============================================================================

/**
 * Drop a single petal trail particle at a position.
 * Petals float gently and fade out after a few seconds.
 */
function dropPetalTrail(x, z) {
    var petalMat = new THREE.MeshStandardMaterial({
        color: 0xFF69B4,
        transparent: true,
        opacity: 0.9
    });
    var petalGeo = new THREE.SphereGeometry(0.08, 4, 4);
    petalGeo.scale(1.5, 0.3, 1); // flat oval petal shape
    var petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(
        x + (Math.random() - 0.5) * 0.5,
        0.1 + Math.random() * 0.2,
        z + (Math.random() - 0.5) * 0.5
    );
    petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    GameState.scene.add(petal);
    GameState.petalTrails.push({
        mesh: petal,
        life: 4 + Math.random() * 2, // 4-6 second lifetime
        maxLife: 4 + Math.random() * 2,
        swaySpeed: 1 + Math.random() * 2
    });
}

/**
 * Update all petal trail particles — fade out and remove.
 */
function updatePetalTrails(delta) {
    // Drop petals for player if wearing Blossom skin and moving
    var skin = SKINS[GameState.currentSkin];
    if (skin && skin.leavesPetalTrail && GameState.peccary) {
        GameState._blossomTrailTimer = (GameState._blossomTrailTimer || 0) - delta;
        var vel = GameState.velocity;
        var isMoving = vel && (Math.abs(vel.x) > 0.5 || Math.abs(vel.z) > 0.5);
        if (isMoving && GameState._blossomTrailTimer <= 0) {
            dropPetalTrail(GameState.peccary.position.x, GameState.peccary.position.z);
            GameState._blossomTrailTimer = 0.2;
        }
    }

    for (var i = GameState.petalTrails.length - 1; i >= 0; i--) {
        var trail = GameState.petalTrails[i];
        trail.life -= delta;
        if (trail.life <= 0) {
            GameState.scene.remove(trail.mesh);
            GameState.petalTrails.splice(i, 1);
            continue;
        }
        // Fade out
        var alpha = trail.life / trail.maxLife;
        trail.mesh.material.opacity = alpha * 0.9;
        // Gentle float + sway
        trail.mesh.position.y += delta * 0.02;
        trail.mesh.rotation.y += delta * trail.swaySpeed;
    }
}

// ============================================================================
// SHEEP SYSTEM — Lambs grow into permanent sheep after 3 minutes
// ============================================================================

/**
 * Build a sheep model (bigger, more realistic than lamb).
 * Males are slightly larger with thicker necks. Females are sleeker.
 */
function buildSheepModel(bodyColor, gender) {
    var sheep = new THREE.Group();

    var bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor });
    var woolMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    var noseMat = new THREE.MeshStandardMaterial({ color: 0xffaaaa });

    var scale = gender === 'male' ? 1.15 : 1.0;

    // Woolly body — main barrel shape
    var bodyGeo = new THREE.SphereGeometry(1.0 * scale, 12, 12);
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1.3, 0.9, 1.1);
    body.position.y = 1.2 * scale;
    sheep.add(body);

    // Wool tufts on body (white fluffy lumps)
    var woolPositions = [
        [0.4, 1.8, 0], [-0.3, 1.8, 0], [0, 1.85, 0.3], [0, 1.85, -0.3],
        [0.5, 1.4, 0.6], [-0.5, 1.4, 0.6], [0.5, 1.4, -0.6], [-0.5, 1.4, -0.6],
        [0.3, 1.6, 0.7], [-0.3, 1.6, -0.7], [0, 1.7, 0.5], [0, 1.7, -0.5]
    ];
    for (var w = 0; w < woolPositions.length; w++) {
        var tuftSize = (0.18 + Math.random() * 0.08) * scale;
        var tuft = new THREE.Mesh(new THREE.SphereGeometry(tuftSize, 6, 6), woolMat);
        tuft.position.set(
            woolPositions[w][0] * scale,
            woolPositions[w][1] * scale,
            woolPositions[w][2] * scale
        );
        sheep.add(tuft);
    }

    // Head — colored to match body, more elongated than lamb
    var headGeo = new THREE.SphereGeometry(0.35 * scale, 8, 8);
    var head = new THREE.Mesh(headGeo, bodyMat);
    head.scale.set(0.9, 1.1, 1.3);
    head.position.set(0, 1.6 * scale, 1.0 * scale);
    sheep.add(head);

    // Woolly crown on top of head
    var crownGeo = new THREE.SphereGeometry(0.2 * scale, 6, 6);
    var crown = new THREE.Mesh(crownGeo, woolMat);
    crown.position.set(0, 1.85 * scale, 0.9 * scale);
    sheep.add(crown);

    // Eyes
    var eyeGeo = new THREE.SphereGeometry(0.06 * scale, 6, 6);
    var eyeWhiteGeo = new THREE.SphereGeometry(0.09 * scale, 6, 6);
    var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    [-0.15, 0.15].forEach(function(xOff) {
        var ew = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
        ew.position.set(xOff * scale, 1.68 * scale, 1.25 * scale);
        sheep.add(ew);
        var eye = new THREE.Mesh(eyeGeo, darkMat);
        eye.position.set(xOff * scale, 1.68 * scale, 1.3 * scale);
        sheep.add(eye);
    });

    // Nose
    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale, 6, 6), noseMat);
    nose.position.set(0, 1.52 * scale, 1.35 * scale);
    sheep.add(nose);

    // Floppy ears (bigger than lamb)
    var earMat = new THREE.MeshStandardMaterial({ color: bodyColor });
    var earGeo = new THREE.CylinderGeometry(0.07 * scale, 0.1 * scale, 0.4 * scale, 6);
    [-1, 1].forEach(function(side) {
        var ear = new THREE.Mesh(earGeo, earMat);
        ear.position.set(side * 0.3 * scale, 1.5 * scale, 0.9 * scale);
        ear.rotation.z = side * 0.7;
        ear.rotation.x = 0.3;
        sheep.add(ear);
    });

    // Legs — longer than lamb, with hooves
    var legGeo = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.8 * scale, 6);
    var hoofGeo = new THREE.CylinderGeometry(0.1 * scale, 0.08 * scale, 0.12 * scale, 6);
    var hoofMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    var legPositions = [
        [-0.35, 0.4, 0.5], [0.35, 0.4, 0.5],
        [-0.35, 0.4, -0.5], [0.35, 0.4, -0.5]
    ];
    for (var l = 0; l < 4; l++) {
        var leg = new THREE.Mesh(legGeo, darkMat);
        leg.position.set(
            legPositions[l][0] * scale,
            legPositions[l][1] * scale,
            legPositions[l][2] * scale
        );
        sheep.add(leg);
        var hoof = new THREE.Mesh(hoofGeo, hoofMat);
        hoof.position.set(
            legPositions[l][0] * scale,
            0.05,
            legPositions[l][2] * scale
        );
        sheep.add(hoof);
    }

    // Fluffy tail
    var tailGeo = new THREE.SphereGeometry(0.18 * scale, 6, 6);
    var tail = new THREE.Mesh(tailGeo, woolMat);
    tail.position.set(0, 1.3 * scale, -1.0 * scale);
    sheep.add(tail);

    // Male marker: thicker neck wool
    if (gender === 'male') {
        var neckWool = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), woolMat);
        neckWool.position.set(0, 1.45 * scale, 0.75 * scale);
        sheep.add(neckWool);
    }

    return sheep;
}

/**
 * Transform a naughty lamb into a permanent sheep.
 * Called when a lamb has been alive for 3+ minutes without being caught.
 */
function transformLambToSheep(lamb) {
    var ud = lamb.userData;
    var gender = LAMB_GENDERS[ud.lambColorId] || 'female';
    var sheepModel = buildSheepModel(ud.lambColor, gender);
    sheepModel.position.copy(lamb.position);

    sheepModel.userData = {
        isSheep: true,
        sheepColorId: ud.lambColorId,
        sheepColorName: ud.lambColorName,
        sheepRarity: ud.lambRarity,
        sheepColor: ud.lambColor,
        gender: gender,
        rarityRank: LAMB_RARITY_RANK[ud.lambRarity] || 1,
        // AI
        state: 'idle',
        stateTimer: 2 + Math.random() * 3,
        wanderDirection: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
        speed: 3,
        herdId: null,
        isLeader: false,
        // Mating
        isMating: false,
        mateTarget: null,
        isPregnant: false,
        pregnancyTimer: 0,
        matingCooldown: 0,
        // Blossom trail
        isBlossom: ud.lambColorId === 'blossom',
        trailTimer: 0
    };

    // Remove the lamb
    GameState.scene.remove(lamb);
    if (GameState.easterLamb === lamb) {
        GameState.easterLamb = null;
        // Cancel the quest since the lamb grew up
        if (GameState.easterQuest && GameState.easterQuest.id === 'catch_naughty_lamb') {
            GameState.easterQuest = null;
        }
    }

    // Add sheep to scene and tracking
    GameState.scene.add(sheepModel);
    GameState.easterSheep.push(sheepModel);

    // Try to join or form a herd
    assignSheepToHerd(sheepModel);

    UI.showToast('Lamb Grew Up!',
        'The ' + ud.lambColorName + ' lamb became a ' + gender + ' sheep! It can no longer be caught.');
    console.log(ud.lambColorName + ' lamb transformed into a ' + gender + ' sheep.');
}

/**
 * Assign a sheep to an existing herd or create a new one.
 * Leader is always the rarest sheep in the herd.
 */
function assignSheepToHerd(sheep) {
    var ud = sheep.userData;

    // Try to find a nearby herd (within 30 units)
    var closestHerd = null;
    var closestDist = 30;
    for (var h = 0; h < GameState.easterSheepHerds.length; h++) {
        var herd = GameState.easterSheepHerds[h];
        if (herd.members.length > 0) {
            var leaderPos = herd.members[0].position;
            var dist = sheep.position.distanceTo(leaderPos);
            if (dist < closestDist) {
                closestDist = dist;
                closestHerd = herd;
            }
        }
    }

    if (closestHerd) {
        // Join existing herd
        closestHerd.members.push(sheep);
        ud.herdId = closestHerd.id;
        // Recalculate leader
        recalcHerdLeader(closestHerd);
    } else {
        // Only form a herd if there's at least this one sheep
        // (more will join as more lambs transform)
        var newHerd = {
            id: 'herd_' + Date.now(),
            members: [sheep],
            matingCooldown: 60 + Math.random() * 60 // first mating 1-2 min after forming
        };
        GameState.easterSheepHerds.push(newHerd);
        ud.herdId = newHerd.id;
        ud.isLeader = true;
    }
}

/**
 * Recalculate herd leader (rarest sheep becomes leader).
 */
function recalcHerdLeader(herd) {
    var bestRank = -1;
    var bestSheep = null;
    for (var m = 0; m < herd.members.length; m++) {
        var s = herd.members[m];
        s.userData.isLeader = false;
        if (s.userData.rarityRank > bestRank) {
            bestRank = s.userData.rarityRank;
            bestSheep = s;
        }
    }
    if (bestSheep) bestSheep.userData.isLeader = true;
}

/**
 * Get the herd for a given sheep.
 */
function getHerdForSheep(sheep) {
    var herdId = sheep.userData.herdId;
    if (!herdId) return null;
    for (var h = 0; h < GameState.easterSheepHerds.length; h++) {
        if (GameState.easterSheepHerds[h].id === herdId) return GameState.easterSheepHerds[h];
    }
    return null;
}

/**
 * Main sheep update — herding AI, mating, and baby production.
 */
function updateEasterSheep(delta) {
    if (GameState.easterSheep.length === 0) return;

    // Update each herd's mating cooldown
    for (var h = 0; h < GameState.easterSheepHerds.length; h++) {
        var herd = GameState.easterSheepHerds[h];

        // Clean up dead references
        for (var c = herd.members.length - 1; c >= 0; c--) {
            if (!herd.members[c].parent) herd.members.splice(c, 1);
        }
        if (herd.members.length === 0) {
            GameState.easterSheepHerds.splice(h, 1);
            h--;
            continue;
        }

        herd.matingCooldown -= delta;

        // Check mating conditions: cooldown done, has male + female, both idle
        if (herd.matingCooldown <= 0 && herd.members.length >= 2) {
            var males = [];
            var females = [];
            for (var m = 0; m < herd.members.length; m++) {
                var sm = herd.members[m].userData;
                if (sm.gender === 'male' && !sm.isMating && !sm.isPregnant && sm.matingCooldown <= 0) males.push(herd.members[m]);
                if (sm.gender === 'female' && !sm.isMating && !sm.isPregnant && sm.matingCooldown <= 0) females.push(herd.members[m]);
            }
            if (males.length > 0 && females.length > 0) {
                initiateSheepMating(males[0], females[0]);
                herd.matingCooldown = 120 + Math.random() * 60; // 2-3 min between matings
            }
        }
    }

    // Update individual sheep
    for (var i = GameState.easterSheep.length - 1; i >= 0; i--) {
        var sheep = GameState.easterSheep[i];
        if (!sheep.parent) {
            GameState.easterSheep.splice(i, 1);
            continue;
        }
        var ud = sheep.userData;
        ud.stateTimer -= delta;
        ud.matingCooldown = Math.max(0, (ud.matingCooldown || 0) - delta);

        // Blossom sheep trail
        if (ud.isBlossom && ud.state === 'wandering') {
            ud.trailTimer -= delta;
            if (ud.trailTimer <= 0) {
                dropPetalTrail(sheep.position.x, sheep.position.z);
                ud.trailTimer = 0.3;
            }
        }

        // Handle pregnancy
        if (ud.isPregnant) {
            ud.pregnancyTimer -= delta;
            if (ud.pregnancyTimer <= 0) {
                giveBirthToLamb(sheep);
                ud.isPregnant = false;
            }
            // Pregnant sheep stay put
            sheep.position.y = Math.sin(GameState.clock.elapsedTime * 1.5) * 0.03;
            continue;
        }

        // Handle mating approach
        if (ud.isMating && ud.mateTarget) {
            var target = ud.mateTarget;
            if (!target.parent) {
                ud.isMating = false;
                ud.mateTarget = null;
                continue;
            }
            var distToMate = sheep.position.distanceTo(target.position);
            if (distToMate > 1.5) {
                // Walk toward mate
                var dir = new THREE.Vector3().subVectors(target.position, sheep.position).normalize();
                sheep.position.x += dir.x * ud.speed * delta;
                sheep.position.z += dir.z * ud.speed * delta;
                sheep.lookAt(target.position.x, sheep.position.y, target.position.z);
            } else {
                // Close enough — mate!
                completeSheepMating(sheep, target);
            }
            continue;
        }

        // Normal herding behavior
        var herd = getHerdForSheep(sheep);
        var leader = herd ? herd.members.find(function(m) { return m.userData.isLeader; }) : null;

        if (ud.state === 'idle') {
            // Bob gently
            sheep.position.y = Math.sin(GameState.clock.elapsedTime * 1.5 + i) * 0.04;

            if (ud.stateTimer <= 0) {
                ud.state = 'wandering';
                ud.stateTimer = 3 + Math.random() * 4;
                // If in a herd, wander toward leader (with some randomness)
                if (leader && leader !== sheep) {
                    var toLeader = new THREE.Vector3().subVectors(leader.position, sheep.position).normalize();
                    toLeader.x += (Math.random() - 0.5) * 1.5;
                    toLeader.z += (Math.random() - 0.5) * 1.5;
                    ud.wanderDirection = toLeader.normalize();
                } else {
                    ud.wanderDirection = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
                }
            }
        } else if (ud.state === 'wandering') {
            sheep.position.x += ud.wanderDirection.x * ud.speed * 0.4 * delta;
            sheep.position.z += ud.wanderDirection.z * ud.speed * 0.4 * delta;
            sheep.position.y = Math.sin(GameState.clock.elapsedTime * 3 + i) * 0.06;
            sheep.lookAt(
                sheep.position.x + ud.wanderDirection.x,
                sheep.position.y,
                sheep.position.z + ud.wanderDirection.z
            );

            // Stay within world bounds
            var worldLimit = CONFIG.WORLD_SIZE * 0.65;
            if (Math.abs(sheep.position.x) > worldLimit) ud.wanderDirection.x *= -1;
            if (Math.abs(sheep.position.z) > worldLimit) ud.wanderDirection.z *= -1;

            // Stay close to leader (within 15 units)
            if (leader && leader !== sheep) {
                var distToLeader = sheep.position.distanceTo(leader.position);
                if (distToLeader > 15) {
                    ud.wanderDirection.subVectors(leader.position, sheep.position).normalize();
                }
            }

            if (ud.stateTimer <= 0) {
                ud.state = 'idle';
                ud.stateTimer = 2 + Math.random() * 3;
            }
        }
    }
}

/**
 * Start mating between a male and female sheep.
 * Male walks toward female (like antelope, no rutting).
 */
function initiateSheepMating(male, female) {
    male.userData.isMating = true;
    male.userData.mateTarget = female;
    female.userData.isMating = true;
    female.userData.mateTarget = male;
}

/**
 * Complete mating — female becomes pregnant.
 */
function completeSheepMating(sheep1, sheep2) {
    var female = (sheep1.userData.gender === 'female') ? sheep1 : sheep2;
    var male = (sheep1.userData.gender === 'male') ? sheep1 : sheep2;

    // End mating state
    sheep1.userData.isMating = false;
    sheep1.userData.mateTarget = null;
    sheep2.userData.isMating = false;
    sheep2.userData.mateTarget = null;

    // Cooldowns
    male.userData.matingCooldown = 120; // 2 min before can mate again
    female.userData.matingCooldown = 180; // 3 min before can mate again

    // Female becomes pregnant
    female.userData.isPregnant = true;
    female.userData.pregnancyTimer = 180; // 3 minutes pregnancy
}

/**
 * A pregnant sheep gives birth to a naughty lamb!
 * The lamb is fully catchable for rewards (30 eggs + skin).
 */
function giveBirthToLamb(mother) {
    // Pick a random lamb color (weighted by rarity)
    var lambData = pickRandomLambColor();

    // Build and spawn the lamb near the mother
    var lamb = buildLambModel(lambData.color);
    var offset = (Math.random() - 0.5) * 2;
    lamb.position.set(
        mother.position.x + offset,
        0,
        mother.position.z + offset
    );
    lamb.userData = {
        isEasterLamb: true,
        lambColorId: lambData.id,
        lambColorName: lambData.name,
        lambRarity: lambData.rarity,
        lambColor: lambData.color,
        catchesNeeded: 3,
        catchCount: 0,
        state: 'idle',
        stateTimer: 0,
        speed: 8,
        fleeDirection: new THREE.Vector3(),
        radius: 0.7,
        spawnTime: GameState.clock.elapsedTime,
        isBlossom: lambData.id === 'blossom',
        trailTimer: 0,
        bornFromSheep: true // marks this as a sheep-born lamb
    };

    GameState.scene.add(lamb);

    // If no active quest lamb, this becomes the active one
    if (!GameState.easterLamb) {
        GameState.easterLamb = lamb;
    } else {
        // There's already an active lamb — add this one to the sheep-born lambs
        if (!GameState.easterSheepLambs) GameState.easterSheepLambs = [];
        GameState.easterSheepLambs.push(lamb);
    }

    UI.showToast('A Lamb is Born!',
        'A ' + lambData.rarity.toLowerCase() + ' ' + lambData.name + ' lamb was born! Catch it before it grows up!');
    console.log('Sheep-born ' + lambData.rarity + ' ' + lambData.name + ' lamb appeared!');
}

/**
 * Update sheep-born lambs that aren't the primary easterLamb.
 * Called from updateEasterLamb at the end.
 */
function updateSheepBornLambs(delta) {
    if (!GameState.easterSheepLambs) return;

    var playerPos = GameState.peccary.position;

    for (var i = GameState.easterSheepLambs.length - 1; i >= 0; i--) {
        var lamb = GameState.easterSheepLambs[i];
        if (!lamb.parent) {
            GameState.easterSheepLambs.splice(i, 1);
            continue;
        }

        var ud = lamb.userData;
        var lambPos = lamb.position;
        var distToPlayer = playerPos.distanceTo(lambPos);
        ud.stateTimer -= delta;

        // 3-minute transformation
        var age = GameState.clock.elapsedTime - ud.spawnTime;
        if (age >= 180 && ud.catchCount === 0) {
            GameState.easterSheepLambs.splice(i, 1);
            transformLambToSheep(lamb);
            continue;
        }

        // Blossom trail
        if (ud.isBlossom && ud.state === 'running') {
            ud.trailTimer -= delta;
            if (ud.trailTimer <= 0) {
                dropPetalTrail(lambPos.x, lambPos.z);
                ud.trailTimer = 0.15;
            }
        }

        // Simple AI (same as primary lamb)
        if (ud.state === 'idle') {
            lamb.position.y = Math.sin(GameState.clock.elapsedTime * 2) * 0.05;
            lamb.lookAt(playerPos.x, lamb.position.y, playerPos.z);
            if (distToPlayer < 8) {
                ud.state = 'running';
                ud.stateTimer = 1.5 + Math.random();
                ud.fleeDirection.subVectors(lambPos, playerPos).normalize();
                ud.fleeDirection.x += (Math.random() - 0.5) * 0.6;
                ud.fleeDirection.z += (Math.random() - 0.5) * 0.6;
                ud.fleeDirection.normalize();
            }
        } else if (ud.state === 'running') {
            lambPos.x += ud.fleeDirection.x * ud.speed * delta;
            lambPos.z += ud.fleeDirection.z * ud.speed * delta;
            lambPos.y = Math.sin(GameState.clock.elapsedTime * 8) * 0.15;
            lamb.lookAt(lambPos.x + ud.fleeDirection.x, lambPos.y, lambPos.z + ud.fleeDirection.z);
            var wl = CONFIG.WORLD_SIZE * 0.65;
            if (Math.abs(lambPos.x) > wl) ud.fleeDirection.x *= -1;
            if (Math.abs(lambPos.z) > wl) ud.fleeDirection.z *= -1;
            if (ud.stateTimer <= 0) {
                ud.state = 'looking_back';
                ud.stateTimer = 2 + Math.random() * 1.5;
            }
            if (distToPlayer < 5) {
                ud.stateTimer = Math.max(ud.stateTimer, 1);
                ud.fleeDirection.subVectors(lambPos, playerPos).normalize();
            }
        } else if (ud.state === 'looking_back') {
            lamb.lookAt(playerPos.x, lamb.position.y, playerPos.z);
            lamb.position.y = Math.sin(GameState.clock.elapsedTime * 2) * 0.05;
            if (distToPlayer < 10) {
                ud.state = 'running';
                ud.stateTimer = 1.5 + Math.random();
                ud.fleeDirection.subVectors(lambPos, playerPos).normalize();
                ud.fleeDirection.x += (Math.random() - 0.5) * 0.6;
                ud.fleeDirection.z += (Math.random() - 0.5) * 0.6;
                ud.fleeDirection.normalize();
            }
            if (ud.stateTimer <= 0) ud.state = 'idle';
        }

        // Promote to primary easterLamb if slot is open
        if (!GameState.easterLamb) {
            GameState.easterLamb = lamb;
            GameState.easterSheepLambs.splice(i, 1);
        }
    }
}

// ============================================================================
// EASTER ATMOSPHERE — Pink sky, cherry blossoms, falling petals
// ============================================================================

var EASTER_SKY_COLOR = 0xf5b8c4;   // Soft cotton candy pink
var EASTER_FOG_COLOR = 0xf0c0cc;   // Matching pink fog
var NORMAL_SKY_COLOR = 0x87ceeb;   // Default sky blue

/**
 * Apply Easter pink sky and fog.
 */
function applyEasterSky() {
    if (!GameState.scene) return;
    GameState.easterSkyActive = true;
    GameState.scene.background = new THREE.Color(EASTER_SKY_COLOR);
    GameState.scene.fog = new THREE.Fog(EASTER_FOG_COLOR, 200, 1200);
}

/**
 * Restore normal sky and fog.
 */
function restoreNormalSky() {
    if (!GameState.scene) return;
    GameState.easterSkyActive = false;
    // Re-apply biome sky if available
    var biomeData = BIOMES[GameState.currentBiome];
    if (biomeData && biomeData.skyColor !== undefined) {
        GameState.scene.background = new THREE.Color(biomeData.skyColor);
    } else {
        GameState.scene.background = new THREE.Color(NORMAL_SKY_COLOR);
    }
    if (biomeData && biomeData.fogColor !== undefined && biomeData.fogDensity !== undefined) {
        GameState.scene.fog = new THREE.FogExp2(biomeData.fogColor, biomeData.fogDensity);
    } else {
        GameState.scene.fog = new THREE.Fog(NORMAL_SKY_COLOR, 200, 1200);
    }
}

/**
 * Build a cherry blossom tree model.
 */
function buildCherryBlossomTree() {
    var tree = new THREE.Group();

    // Dark brown trunk
    var trunkGeo = new THREE.CylinderGeometry(0.4, 0.7, 7 + Math.random() * 3, 8);
    var trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21 });
    var trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 3.5;
    trunk.castShadow = true;
    tree.add(trunk);

    // Pink blossom clusters (spheres instead of cones — rounder, fluffier)
    var blossomColors = [0xffb7c5, 0xff99aa, 0xffc0cb];
    for (var i = 0; i < 4; i++) {
        var size = 3.5 - i * 0.4 + Math.random() * 0.5;
        var blossomGeo = new THREE.SphereGeometry(size, 8, 8);
        var blossomMat = new THREE.MeshStandardMaterial({
            color: blossomColors[i % blossomColors.length]
        });
        var blossom = new THREE.Mesh(blossomGeo, blossomMat);
        blossom.position.y = 7 + i * 1.5 + Math.random();
        blossom.position.x = (Math.random() - 0.5) * 2;
        blossom.position.z = (Math.random() - 0.5) * 2;
        blossom.castShadow = true;
        tree.add(blossom);
    }

    tree.userData.type = 'cherry_blossom';
    tree.userData.radius = 1.5;
    tree.userData.isEasterDecor = true;
    return tree;
}

/**
 * Create a falling petal particle system for a cherry blossom tree.
 */
function createPetalSystem(treePosition) {
    var petalCount = 30;
    var positions = new Float32Array(petalCount * 3);
    var velocities = [];
    var spread = 5;

    for (var i = 0; i < petalCount; i++) {
        positions[i * 3] = treePosition.x + (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = treePosition.y + 7 + Math.random() * 6;
        positions[i * 3 + 2] = treePosition.z + (Math.random() - 0.5) * spread;
        velocities.push({
            x: (Math.random() - 0.5) * 0.3,
            y: -0.3 - Math.random() * 0.4,
            z: (Math.random() - 0.5) * 0.3,
            sway: Math.random() * Math.PI * 2
        });
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var material = new THREE.PointsMaterial({
        color: 0xffb7c5,
        size: 0.4,
        transparent: true,
        opacity: 0.8
    });

    var petals = new THREE.Points(geometry, material);
    petals.userData.velocities = velocities;
    petals.userData.treePos = treePosition.clone();
    petals.userData.spread = spread;
    petals.userData.isEasterPetals = true;
    return petals;
}

/**
 * Update all petal particle systems (called from animate loop).
 */
function updateEasterPetals(delta) {
    if (!GameState.easterEventActive) return;
    var time = GameState.clock ? GameState.clock.elapsedTime : 0;

    for (var s = 0; s < GameState.easterPetalSystems.length; s++) {
        var petals = GameState.easterPetalSystems[s];
        var positions = petals.geometry.attributes.position.array;
        var velocities = petals.userData.velocities;
        var treePos = petals.userData.treePos;
        var spread = petals.userData.spread;

        for (var i = 0; i < velocities.length; i++) {
            var v = velocities[i];
            // Gentle sway
            positions[i * 3] += (v.x + Math.sin(time + v.sway) * 0.1) * delta;
            positions[i * 3 + 1] += v.y * delta;
            positions[i * 3 + 2] += (v.z + Math.cos(time + v.sway) * 0.1) * delta;

            // Reset petal when it falls below ground
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3] = treePos.x + (Math.random() - 0.5) * spread;
                positions[i * 3 + 1] = treePos.y + 7 + Math.random() * 6;
                positions[i * 3 + 2] = treePos.z + (Math.random() - 0.5) * spread;
            }
        }
        petals.geometry.attributes.position.needsUpdate = true;
    }
}

/**
 * Spawn 5-8 cherry blossom trees near the village.
 */
function spawnCherryBlossoms() {
    var vx = CONFIG.VILLAGE_CENTER.x;
    var vz = CONFIG.VILLAGE_CENTER.z;
    var radius = CONFIG.VILLAGE_RADIUS;
    var count = 5 + Math.floor(Math.random() * 4); // 5-8 trees

    for (var i = 0; i < count; i++) {
        // Place just outside village edge in a ring
        var angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        var dist = radius * 0.7 + Math.random() * 15;
        var tx = vx + Math.cos(angle) * dist;
        var tz = vz + Math.sin(angle) * dist;

        var tree = buildCherryBlossomTree();
        tree.position.set(tx, 0, tz);
        GameState.scene.add(tree);
        GameState.easterCherryTrees.push(tree);

        // Add petal particle system for this tree
        var petalSystem = createPetalSystem(tree.position);
        GameState.scene.add(petalSystem);
        GameState.easterPetalSystems.push(petalSystem);
    }
}

/**
 * Remove all cherry blossom trees and petal systems.
 */
function removeCherryBlossoms() {
    for (var i = 0; i < GameState.easterCherryTrees.length; i++) {
        GameState.scene.remove(GameState.easterCherryTrees[i]);
    }
    GameState.easterCherryTrees = [];

    for (var j = 0; j < GameState.easterPetalSystems.length; j++) {
        GameState.scene.remove(GameState.easterPetalSystems[j]);
    }
    GameState.easterPetalSystems = [];
}

/**
 * Check if player is near a cherry blossom tree (for petal collection).
 * Returns the nearest tree within range, or null.
 */
function getNearestCherryTree(range) {
    if (!GameState.peccary) return null;
    var playerPos = GameState.peccary.position;
    var nearest = null;
    var nearestDist = range;

    for (var i = 0; i < GameState.easterCherryTrees.length; i++) {
        var tree = GameState.easterCherryTrees[i];
        var dist = playerPos.distanceTo(tree.position);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = tree;
        }
    }
    return nearest;
}

/**
 * Collect cherry blossom petals from a nearby tree.
 */
function collectCherryPetals() {
    var tree = getNearestCherryTree(5);
    if (!tree) return false;

    // Give 1-3 petals
    var amount = 1 + Math.floor(Math.random() * 3);
    GameState.resourceCounts.cherry_petals = (GameState.resourceCounts.cherry_petals || 0) + amount;
    GameState.score += amount;

    Game.playSound('collect');
    UI.showToast('Cherry Petals!', 'You collected ' + amount + ' cherry blossom petal' + (amount > 1 ? 's' : '') + '!');
    UI.updateHUD();
    return true;
}

// ============================================================================

window.startEaster = function() {
    if (GameState.easterEventActive) {
        console.log('Easter event is already active!');
        return;
    }
    GameState.easterEventActive = true;

    // Spawn Easter stalls, cherry blossoms, and apply sky if game is running
    if (GameState.peccary && GameState.scene) {
        spawnEasterStalls();
        spawnCherryBlossoms();
        spawnEasterFlamingos();
        spawnWildPiglets();
        applyEasterSky();
    }

    console.log('Easter event ACTIVATED!');
    console.log('- Marshmallow and Clover stalls in north village');
    console.log('- Cherry blossom trees near village (press E nearby to collect petals)');
    console.log('- Pink cotton candy sky');
    console.log('- Goose eggs have 10% chance to become decorated Easter eggs');
    console.log('- Chocolate eggs: ' + GameState.chocolateEggs);
    console.log('- Bunnies caught: ' + GameState.easterBunniesCaught + '/5');
    if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast('Easter Event!', 'Marshmallow and Clover have arrived! Visit their stalls in the north village!');
    }
};

window.stopEaster = function() {
    if (!GameState.easterEventActive) {
        console.log('Easter event is not active.');
        return;
    }
    GameState.easterEventActive = false;

    // Remove all active Easter bunnies
    var removed = 0;
    for (var i = GameState.easterBunnies.length - 1; i >= 0; i--) {
        var bunny = GameState.easterBunnies[i];
        GameState.scene.remove(bunny);
        var idx = GameState.enemies.indexOf(bunny);
        if (idx !== -1) GameState.enemies.splice(idx, 1);
        removed++;
    }
    GameState.easterBunnies = [];

    // Cancel active quest (chocolate eggs kept!)
    if (GameState.easterQuest) {
        console.log('Active quest "' + GameState.easterQuest.id + '" cancelled.');
        GameState.easterQuest = null;
        GameState.easterQuestBunnyCaught = 0;
        GameState.easterQuestEggsCollected = 0;
    }

    // Remove stalls and NPCs
    removeEasterStalls();

    // Remove cherry blossoms and restore sky
    removeCherryBlossoms();
    restoreNormalSky();

    // Remove active lamb (but sheep-born lambs transform into sheep)
    if (GameState.easterLamb) {
        GameState.scene.remove(GameState.easterLamb);
        GameState.easterLamb = null;
    }
    // Transform any sheep-born lambs into sheep instead of removing
    if (GameState.easterSheepLambs) {
        for (var sl = GameState.easterSheepLambs.length - 1; sl >= 0; sl--) {
            transformLambToSheep(GameState.easterSheepLambs[sl]);
        }
        GameState.easterSheepLambs = [];
    }

    // NOTE: Sheep (GameState.easterSheep) are NOT removed — they persist forever!

    // Remove flamingos and dismount if mounted
    if (GameState.mountedFlamingo) {
        dismountFlamingo();
    }
    if (GameState.easterFlamingos) {
        for (var fi = GameState.easterFlamingos.length - 1; fi >= 0; fi--) {
            GameState.scene.remove(GameState.easterFlamingos[fi]);
        }
        GameState.easterFlamingos = [];
    }

    // Remove wild piglets (but NOT companion piglets — those are permanent!)
    if (GameState.easterPiglets) {
        for (var pi = GameState.easterPiglets.length - 1; pi >= 0; pi--) {
            var pg = GameState.easterPiglets[pi];
            if (pg.userData.isWild) {
                GameState.scene.remove(pg);
                GameState.easterPiglets.splice(pi, 1);
            }
        }
    }

    // Remove Easter biome
    removeEasterBiome();

    // Remove roller skates effect
    GameState.rollerSkatesOn = false;

    // Convert decorated eggs back to normal
    GameState.nests.forEach(function(nest) {
        if (nest.egg && nest.egg.isEasterEgg) {
            nest.egg.isEasterEgg = false;
        }
    });

    console.log('Easter event DEACTIVATED. Removed ' + removed + ' bunnies.');
    console.log('Chocolate eggs (' + GameState.chocolateEggs + ') saved!');
    if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast('Easter Event Over', 'Marshmallow and Clover have packed up. Your chocolate eggs are saved!');
    }
};

window.spawnTestBunny = function() {
    if (!GameState.peccary) {
        console.log('Start the game first!');
        return;
    }
    GameState.easterEventActive = true;
    var px = GameState.peccary.position.x + 5;
    var pz = GameState.peccary.position.z + 5;
    Enemies.spawnEasterBunny(px, pz);
    console.log('Test bunny spawned near Pedro!');
    console.log('Bunnies caught: ' + GameState.easterBunniesCaught + '/5');
};

/**
 * Testing: Spawn a naughty lamb (with optional color ID).
 * Usage: spawnTestLamb()          — random color
 *        spawnTestLamb('moonbeam') — force Moonbeam (godly!)
 */
window.spawnTestLamb = function(colorId) {
    if (!GameState.peccary) {
        console.log('Start the game first!');
        return;
    }
    if (!GameState.easterEventActive) {
        console.log('Starting Easter event first...');
        startEaster();
    }
    if (GameState.easterLamb) {
        console.log('Removing existing lamb first...');
        GameState.scene.remove(GameState.easterLamb);
        GameState.easterLamb = null;
    }
    // Set quest to lamb quest
    GameState.easterQuest = {
        id: 'catch_naughty_lamb',
        name: 'Catch the Naughty Lamb',
        difficulty: 'RARE',
        reward: 30,
        goal: { type: 'catch_lamb', count: 1 }
    };
    spawnEasterLamb(colorId || null);
    console.log('Test lamb spawned! Click it 3 times to catch it.');
    console.log('Use spawnTestLamb("moonbeam") to force a specific color.');
    console.log('Available colors: ' + EASTER_LAMB_COLORS.map(function(c) { return c.id; }).join(', '));
};

/**
 * Spawn a test sheep near the player (random color).
 */
window.spawnTestSheep = function(colorId) {
    if (!GameState.peccary) { console.log('Start the game first!'); return; }
    var lambData;
    if (colorId) {
        lambData = EASTER_LAMB_COLORS.find(function(c) { return c.id === colorId; });
    }
    if (!lambData) lambData = pickRandomLambColor();
    var gender = LAMB_GENDERS[lambData.id] || 'female';
    var sheepModel = buildSheepModel(lambData.color, gender);
    var px = GameState.peccary.position.x + 5 + Math.random() * 5;
    var pz = GameState.peccary.position.z + 5 + Math.random() * 5;
    sheepModel.position.set(px, 0, pz);
    sheepModel.userData = {
        isSheep: true,
        sheepColorId: lambData.id,
        sheepColorName: lambData.name,
        sheepRarity: lambData.rarity,
        sheepColor: lambData.color,
        gender: gender,
        rarityRank: LAMB_RARITY_RANK[lambData.rarity] || 1,
        state: 'idle',
        stateTimer: 2 + Math.random() * 3,
        wanderDirection: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
        speed: 3,
        herdId: null,
        isLeader: false,
        isMating: false,
        mateTarget: null,
        isPregnant: false,
        pregnancyTimer: 0,
        matingCooldown: 0,
        isBlossom: lambData.id === 'blossom',
        trailTimer: 0
    };
    GameState.scene.add(sheepModel);
    GameState.easterSheep.push(sheepModel);
    assignSheepToHerd(sheepModel);
    console.log('Spawned ' + gender + ' ' + lambData.name + ' sheep!');
    UI.showToast('Test Sheep!', gender + ' ' + lambData.name + ' sheep spawned!');
};

/**
 * Spawn a male+female sheep pair for testing mating.
 */
window.spawnTestSheepPair = function() {
    if (!GameState.peccary) { console.log('Start the game first!'); return; }
    // Find a male color and female color
    var maleColors = Object.keys(LAMB_GENDERS).filter(function(k) { return LAMB_GENDERS[k] === 'male'; });
    var femaleColors = Object.keys(LAMB_GENDERS).filter(function(k) { return LAMB_GENDERS[k] === 'female'; });
    var maleId = maleColors[Math.floor(Math.random() * maleColors.length)];
    var femaleId = femaleColors[Math.floor(Math.random() * femaleColors.length)];
    spawnTestSheep(maleId);
    spawnTestSheep(femaleId);
    console.log('Spawned a mating pair! They will mate after their cooldown expires (wait ~1-2 minutes or the herd cooldown).');
};

// ============================================================================
// EASTER FLAMINGO SYSTEM
// ============================================================================
// Flamingos spawn near cherry blossom trees during Easter.
// Player buys a riding license from Clover, then presses E to mount.
// Full 3D flight: WASD + Space (up) + Shift (down).
// Behind-camera follows the flamingo.
// Flamingos are the ONLY way to reach the Easter Biome.
// ============================================================================

/**
 * Build a 3D flamingo model.
 * Flamingos face +X (same convention as all animals).
 */
function buildFlamingoModel(flamingoData) {
    var group = new THREE.Group();
    var bodyColor = flamingoData.color;
    var detailColor = flamingoData.detailColor;
    var legColor = flamingoData.legColor;
    var eyeColor = flamingoData.eyeColor;

    var bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor });
    var detailMat = new THREE.MeshStandardMaterial({ color: detailColor });
    var legMat = new THREE.MeshStandardMaterial({ color: legColor });
    var eyeMat = new THREE.MeshStandardMaterial({ color: eyeColor });
    var blackMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    var whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    // Body — oval shape (horizontal, faces +X)
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 10), bodyMat);
    body.scale.set(1.4, 0.9, 1.0);
    body.position.set(0, 2.8, 0);
    body.castShadow = true;
    group.add(body);

    // Tail feathers (back of body, short fan)
    var tailFeather = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 6), detailMat);
    tailFeather.rotation.z = Math.PI / 2;
    tailFeather.position.set(-1.2, 2.9, 0);
    group.add(tailFeather);

    // Wings (two flat ellipses on each side)
    [-0.7, 0.7].forEach(function(z) {
        var wing = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), bodyMat);
        wing.scale.set(1.5, 0.3, 0.8);
        wing.position.set(-0.1, 2.9, z);
        wing.name = z > 0 ? 'wingRight' : 'wingLeft';
        group.add(wing);
        // Wing tip (darker)
        var tip = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 4), detailMat);
        tip.scale.set(1.2, 0.3, 0.8);
        tip.position.set(-0.7, 2.85, z * 1.3);
        tip.name = z > 0 ? 'wingTipRight' : 'wingTipLeft';
        group.add(tip);
    });

    // Neck — long curved cylinder (uses multiple segments to simulate curve)
    // Lower neck (vertical)
    var neckLower = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8), bodyMat);
    neckLower.position.set(0.6, 3.8, 0);
    neckLower.rotation.z = -0.3;
    group.add(neckLower);

    // Upper neck (curves forward toward head)
    var neckUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.0, 8), bodyMat);
    neckUpper.position.set(0.9, 4.7, 0);
    neckUpper.rotation.z = -0.6;
    group.add(neckUpper);

    // Head — small sphere
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), bodyMat);
    head.position.set(1.2, 5.2, 0);
    head.scale.set(1.2, 1.0, 0.9);
    group.add(head);

    // Beak — curved cone, black with pink/detail base
    var beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 6), blackMat);
    beak.rotation.z = Math.PI / 2;
    beak.position.set(1.55, 5.15, 0);
    group.add(beak);
    // Beak base (colored part)
    var beakBase = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), detailMat);
    beakBase.position.set(1.4, 5.18, 0);
    group.add(beakBase);

    // Eyes
    [-0.12, 0.12].forEach(function(z) {
        var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), whiteMat);
        eyeWhite.position.set(1.3, 5.3, z);
        group.add(eyeWhite);
        var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), eyeMat);
        pupil.position.set(1.33, 5.31, z);
        group.add(pupil);
    });

    // Blood flamingo: add glowing red eye effect
    if (flamingoData.id === 'blood') {
        group.children.forEach(function(child) {
            if (child.material === eyeMat) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xFF0000,
                    emissive: 0xFF0000,
                    emissiveIntensity: 1.5
                });
            }
        });
    }

    // Legs — two long thin cylinders, grouped for walk animation
    [-0.2, 0.2].forEach(function(z) {
        var legGroup = new THREE.Group();
        legGroup.position.set(0, 2.3, z);
        legGroup.name = z < 0 ? 'legLeft' : 'legRight';

        // Upper leg
        var upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.5, 6), legMat);
        upperLeg.position.set(0, -0.7, 0);
        legGroup.add(upperLeg);

        // Knee joint
        var knee = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), legMat);
        knee.position.set(0, -1.4, 0);
        legGroup.add(knee);

        // Lower leg (thinner)
        var lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.0, 6), legMat);
        lowerLeg.position.set(0, -1.9, 0);
        legGroup.add(lowerLeg);

        // Foot — flat webbed foot
        var foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.15), legMat);
        foot.position.set(0.05, -2.35, 0);
        legGroup.add(foot);

        group.add(legGroup);
    });

    return group;
}

/**
 * Spawn flamingos near cherry blossom trees when Easter starts.
 * 4 guaranteed (1 of each main type) + 1% chance of a Blood flamingo.
 */
function spawnEasterFlamingos() {
    if (!GameState.easterCherryTrees || GameState.easterCherryTrees.length === 0) return;
    if (!EASTER_FLAMINGO_TYPES) return;

    var guaranteed = EASTER_FLAMINGO_TYPES.filter(function(f) { return f.spawnWeight > 0; });
    var flamingosToSpawn = [];

    // Add guaranteed flamingos
    for (var i = 0; i < guaranteed.length; i++) {
        flamingosToSpawn.push(guaranteed[i]);
    }

    // 1% chance for Blood flamingo
    var bloodType = EASTER_FLAMINGO_TYPES.find(function(f) { return f.id === 'blood'; });
    if (bloodType && Math.random() < (bloodType.bloodSpawnChance || 0.01)) {
        flamingosToSpawn.push(bloodType);
    }

    // Spawn each flamingo near a random cherry blossom tree
    for (var j = 0; j < flamingosToSpawn.length; j++) {
        var fData = flamingosToSpawn[j];
        var tree = GameState.easterCherryTrees[j % GameState.easterCherryTrees.length];
        var angle = Math.random() * Math.PI * 2;
        var dist = 3 + Math.random() * 5;
        var fx = tree.position.x + Math.cos(angle) * dist;
        var fz = tree.position.z + Math.sin(angle) * dist;

        var flamingo = buildFlamingoModel(fData);
        flamingo.position.set(fx, 0, fz);
        flamingo.rotation.y = Math.random() * Math.PI * 2;
        flamingo.userData = {
            isFlamingo: true,
            flamingoType: fData.id,
            flamingoName: fData.name,
            speed: fData.speed,
            flySpeed: fData.flySpeed,
            abilities: fData.abilities.slice(),
            description: fData.description,
            state: 'idle',           // idle, wandering, flying_idle
            stateTimer: 2 + Math.random() * 4,
            wanderDirection: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
            homeTree: tree,          // Cherry tree this flamingo lives near
            bobPhase: Math.random() * Math.PI * 2,
            wingPhase: 0,
            isMounted: false
        };

        GameState.scene.add(flamingo);
        GameState.easterFlamingos.push(flamingo);
    }

    console.log('Spawned ' + flamingosToSpawn.length + ' Easter flamingos!');
    if (flamingosToSpawn.some(function(f) { return f.id === 'blood'; })) {
        console.log('*** BLOOD FLAMINGO SPAWNED! ***');
        UI.showToast('A dark presence...', 'Something sinister lurks near the blossoms...');
    }
}

// ============================================================================
// EASTER PIGLET SYSTEM
// ============================================================================

/**
 * Build a 3D piglet model. Small, round baby pig with unique visual features.
 * Faces +X direction (model rotation convention).
 */
function buildPigletModel(pigletData) {
    var group = new THREE.Group();
    var bodyColor = pigletData.color;
    var detailColor = pigletData.detailColor;

    var bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor });
    var detailMat = new THREE.MeshStandardMaterial({ color: detailColor });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    var pinkMat = new THREE.MeshStandardMaterial({ color: 0xFFAAAA });
    var whiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

    // Body — round and chubby (faces +X)
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), bodyMat);
    body.scale.set(1.3, 0.95, 1.0);
    body.position.set(0, 0.55, 0);
    body.castShadow = true;
    group.add(body);

    // Head — slightly smaller sphere, forward (+X)
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), bodyMat);
    head.position.set(0.55, 0.7, 0);
    head.castShadow = true;
    group.add(head);

    // Snout — flat cylinder on front of head
    var snout = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.1, 8), pinkMat);
    snout.rotation.z = Math.PI / 2;
    snout.position.set(0.85, 0.65, 0);
    group.add(snout);

    // Nostrils — two tiny dark dots on snout
    [-0.05, 0.05].forEach(function(z) {
        var nostril = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), darkMat);
        nostril.position.set(0.9, 0.65, z);
        group.add(nostril);
    });

    // Eyes — on sides of head
    [-0.18, 0.18].forEach(function(z) {
        var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), whiteMat);
        eyeWhite.position.set(0.75, 0.8, z);
        group.add(eyeWhite);
        var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), darkMat);
        pupil.position.set(0.78, 0.81, z);
        group.add(pupil);
    });

    // Ears — two floppy triangles
    [-0.15, 0.15].forEach(function(z) {
        var ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 4), bodyMat);
        ear.position.set(0.5, 1.0, z);
        ear.rotation.x = z > 0 ? -0.4 : 0.4;
        ear.rotation.z = -0.3;
        ear.name = z > 0 ? 'earRight' : 'earLeft';
        group.add(ear);
    });

    // Legs — four stubby legs in groups for walking animation
    var legPositions = [
        { x: 0.25, z: -0.2, name: 'legFrontLeft' },
        { x: 0.25, z: 0.2, name: 'legFrontRight' },
        { x: -0.25, z: -0.2, name: 'legBackLeft' },
        { x: -0.25, z: 0.2, name: 'legBackRight' }
    ];
    var hoofMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    legPositions.forEach(function(lp) {
        var legGroup = new THREE.Group();
        legGroup.position.set(lp.x, 0.3, lp.z);
        legGroup.name = lp.name;

        var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.3, 6), bodyMat);
        leg.position.set(0, -0.1, 0);
        legGroup.add(leg);

        var hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.06, 6), hoofMat);
        hoof.position.set(0, -0.25, 0);
        legGroup.add(hoof);

        group.add(legGroup);
    });

    // Curly tail — small spiral at the back
    var tail = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 8, Math.PI * 1.5), pinkMat);
    tail.position.set(-0.6, 0.7, 0);
    tail.rotation.y = Math.PI / 2;
    tail.name = 'tail';
    group.add(tail);

    // ====================================================================
    // UNIQUE VISUAL FEATURES per piglet type
    // ====================================================================

    if (pigletData.feature === 'flower_nose') {
        // Daffodil on the snout
        var petalRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.03, 6, 8), new THREE.MeshStandardMaterial({ color: 0xFFFF00 }));
        petalRing.position.set(0.88, 0.65, 0);
        petalRing.rotation.y = Math.PI / 2;
        group.add(petalRing);
    }

    if (pigletData.feature === 'leaf_ears') {
        // Replace ears with clover-green
        group.children.forEach(function(c) {
            if (c.name === 'earLeft' || c.name === 'earRight') {
                c.material = new THREE.MeshStandardMaterial({ color: 0x228B22 });
            }
        });
    }

    if (pigletData.feature === 'fluffy') {
        // Extra fluffy body — add small puff spheres
        for (var f = 0; f < 6; f++) {
            var puff = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), bodyMat);
            puff.position.set(
                (Math.random() - 0.5) * 0.6,
                0.55 + (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.5
            );
            group.add(puff);
        }
    }

    if (pigletData.feature === 'water_drops') {
        // Tiny blue droplets on body
        for (var w = 0; w < 4; w++) {
            var drop = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4),
                new THREE.MeshStandardMaterial({ color: 0x4444FF, transparent: true, opacity: 0.7 }));
            drop.position.set(
                (Math.random() - 0.5) * 0.5,
                0.6 + Math.random() * 0.3,
                (Math.random() - 0.5) * 0.4
            );
            group.add(drop);
        }
    }

    if (pigletData.feature === 'crumbs') {
        // Small tan crumb particles around feet
        for (var cr = 0; cr < 5; cr++) {
            var crumb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.04),
                new THREE.MeshStandardMaterial({ color: 0xDEB887 }));
            crumb.position.set(
                (Math.random() - 0.5) * 0.8,
                0.02,
                (Math.random() - 0.5) * 0.5
            );
            crumb.rotation.y = Math.random() * Math.PI;
            group.add(crumb);
        }
    }

    if (pigletData.feature === 'hairy') {
        // Spiky hair strands sticking out
        for (var h = 0; h < 10; h++) {
            var hair = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.15, 4),
                new THREE.MeshStandardMaterial({ color: 0x5A3A1A }));
            var hAngle = Math.random() * Math.PI * 2;
            hair.position.set(
                Math.cos(hAngle) * 0.35,
                0.55 + Math.random() * 0.3,
                Math.sin(hAngle) * 0.35
            );
            hair.rotation.set(Math.random() - 0.5, 0, Math.random() - 0.5);
            group.add(hair);
        }
    }

    if (pigletData.feature === 'bubble') {
        // Pink bubble hovering near head
        var bubble = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xFF69B4, transparent: true, opacity: 0.4 }));
        bubble.position.set(0.6, 1.15, 0.15);
        bubble.name = 'bubble';
        group.add(bubble);
    }

    if (pigletData.feature === 'snout_glow') {
        // Glowing snout
        snout.material = new THREE.MeshStandardMaterial({ color: 0xFFDD44, emissive: 0xFFDD44, emissiveIntensity: 0.5 });
    }

    if (pigletData.feature === 'root_body') {
        // Gnarled root texture — add bumpy protrusions
        for (var rt = 0; rt < 5; rt++) {
            var root = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.15, 5), detailMat);
            root.position.set(
                (Math.random() - 0.5) * 0.5,
                0.35,
                (Math.random() - 0.5) * 0.4
            );
            root.rotation.set(Math.random(), 0, Math.random());
            group.add(root);
        }
    }

    if (pigletData.feature === 'lightning') {
        // Tiny yellow spark shapes around body
        for (var sp = 0; sp < 3; sp++) {
            var sparkGeo = new THREE.ConeGeometry(0.04, 0.12, 3);
            var sparkMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 0.8 });
            var sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
            sparkMesh.position.set(
                (Math.random() - 0.5) * 0.7,
                0.5 + Math.random() * 0.4,
                (Math.random() - 0.5) * 0.5
            );
            sparkMesh.rotation.z = Math.random() * Math.PI;
            group.add(sparkMesh);
        }
    }

    if (pigletData.feature === 'petal_crown') {
        // Ring of flower petals on head
        for (var pc = 0; pc < 5; pc++) {
            var petalAngle = (pc / 5) * Math.PI * 2;
            var petalMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4),
                new THREE.MeshStandardMaterial({ color: 0xFF69B4 }));
            petalMesh.scale.set(1.5, 0.4, 1.0);
            petalMesh.position.set(
                0.55 + Math.cos(petalAngle) * 0.18,
                1.0,
                Math.sin(petalAngle) * 0.18
            );
            group.add(petalMesh);
        }
    }

    if (pigletData.feature === 'fire_body') {
        // Orange/red glow + emissive body
        body.material = new THREE.MeshStandardMaterial({ color: bodyColor, emissive: 0xFF4500, emissiveIntensity: 0.3 });
        head.material = new THREE.MeshStandardMaterial({ color: bodyColor, emissive: 0xFF4500, emissiveIntensity: 0.3 });
    }

    if (pigletData.feature === 'ice_crystals') {
        // Light blue ice crystal shapes
        for (var ic = 0; ic < 4; ic++) {
            var crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0),
                new THREE.MeshStandardMaterial({ color: 0xADD8E6, transparent: true, opacity: 0.7 }));
            crystal.position.set(
                (Math.random() - 0.5) * 0.6,
                0.7 + Math.random() * 0.3,
                (Math.random() - 0.5) * 0.5
            );
            group.add(crystal);
        }
    }

    if (pigletData.feature === 'smoke_trail') {
        // Dark semi-transparent smoky wisps
        for (var sm = 0; sm < 3; sm++) {
            var smoke = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6),
                new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true, opacity: 0.3 }));
            smoke.position.set(
                -0.4 - sm * 0.2,
                0.5 + Math.random() * 0.2,
                (Math.random() - 0.5) * 0.3
            );
            smoke.name = 'smoke' + sm;
            group.add(smoke);
        }
    }

    if (pigletData.feature === 'gem_shine') {
        // Emissive emerald glow + faceted body
        body.material = new THREE.MeshStandardMaterial({
            color: bodyColor, emissive: 0x50C878, emissiveIntensity: 0.5,
            metalness: 0.6, roughness: 0.2
        });
        head.material = new THREE.MeshStandardMaterial({
            color: bodyColor, emissive: 0x50C878, emissiveIntensity: 0.5,
            metalness: 0.6, roughness: 0.2
        });
    }

    if (pigletData.feature === 'halo') {
        // Golden glowing halo above head
        var halo = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 16),
            new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 1.0 }));
        halo.position.set(0.55, 1.2, 0);
        halo.rotation.x = Math.PI / 2;
        halo.name = 'halo';
        group.add(halo);

        // Divine glow on body
        body.material = new THREE.MeshStandardMaterial({
            color: bodyColor, emissive: 0xFFD700, emissiveIntensity: 0.3
        });
    }

    // Tiny wings (hidden by default, shown when flying with flamingo)
    var wingMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.7 });
    var wingGeo = new THREE.PlaneGeometry(0.6, 0.4);

    var wingLeft = new THREE.Mesh(wingGeo, wingMat);
    wingLeft.position.set(0, 1.1, -0.5);
    wingLeft.rotation.y = -0.3;
    wingLeft.name = 'wingLeft';
    wingLeft.visible = false;
    group.add(wingLeft);

    var wingRight = new THREE.Mesh(wingGeo, wingMat);
    wingRight.position.set(0, 1.1, 0.5);
    wingRight.rotation.y = 0.3;
    wingRight.name = 'wingRight';
    wingRight.visible = false;
    group.add(wingRight);

    // Scale the whole piglet to be small and cute
    group.scale.set(0.7, 0.7, 0.7);

    return group;
}

/**
 * Spawn wild piglets near cherry blossom trees during Easter.
 * Spawns 2-4 piglets near cherry trees in the main world.
 */
function spawnWildPiglets() {
    if (!GameState.easterCherryTrees || GameState.easterCherryTrees.length === 0) return;
    if (!EASTER_PIGLET_TYPES) return;
    if (!GameState.easterPiglets) GameState.easterPiglets = [];

    var pigletCount = 2 + Math.floor(Math.random() * 3); // 2-4 piglets

    for (var i = 0; i < pigletCount; i++) {
        var pigletData = pickRandomWildPiglet();
        var tree = GameState.easterCherryTrees[Math.floor(Math.random() * GameState.easterCherryTrees.length)];
        var angle = Math.random() * Math.PI * 2;
        var dist = 3 + Math.random() * 6;
        var px = tree.position.x + Math.cos(angle) * dist;
        var pz = tree.position.z + Math.sin(angle) * dist;

        var piglet = buildPigletModel(pigletData);
        piglet.position.set(px, 0, pz);
        piglet.rotation.y = Math.random() * Math.PI * 2;
        piglet.userData = {
            isPiglet: true,
            pigletType: pigletData.id,
            pigletName: pigletData.name,
            pigletRarity: pigletData.rarity,
            pigletColor: pigletData.color,
            ability: pigletData.ability,
            abilityType: pigletData.abilityType,
            abilityDesc: pigletData.abilityDesc,
            catchDifficulty: pigletData.catchDifficulty,
            description: pigletData.description,
            feature: pigletData.feature,
            state: 'idle',
            stateTimer: 2 + Math.random() * 4,
            wanderDirection: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
            homeTree: tree,
            walkPhase: Math.random() * Math.PI * 2,
            bobPhase: Math.random() * Math.PI * 2,
            isWild: true,
            fleeSpeed: 8 + Math.random() * 4, // How fast they run from player
            fleeTimer: 0
        };

        GameState.scene.add(piglet);
        GameState.easterPiglets.push(piglet);
    }

    console.log('Spawned ' + pigletCount + ' wild Easter piglets!');
}

/**
 * Update wild piglet AI — idle, wander, and flee from player.
 */
function updateWildPiglets(delta) {
    if (!GameState.easterPiglets) return;
    if (!GameState.peccary) return;

    var playerPos = GameState.peccary.position;

    for (var i = GameState.easterPiglets.length - 1; i >= 0; i--) {
        var piglet = GameState.easterPiglets[i];
        var ud = piglet.userData;
        if (!ud.isWild) continue; // Skip companion piglets

        ud.stateTimer -= delta;

        // Check distance to player
        var dx = piglet.position.x - playerPos.x;
        var dz = piglet.position.z - playerPos.z;
        var distToPlayer = Math.sqrt(dx * dx + dz * dz);

        // Flee from player when nearby
        if (distToPlayer < 10 && ud.state !== 'fleeing') {
            ud.state = 'fleeing';
            ud.stateTimer = 2 + Math.random() * 2;
            ud.fleeTimer = 0;
        }

        // Walking animation for all moving states
        if (ud.state === 'wandering' || ud.state === 'fleeing') {
            ud.walkPhase += delta * (ud.state === 'fleeing' ? 12 : 6);
            var legSwing = Math.sin(ud.walkPhase) * 0.4;
            piglet.children.forEach(function(child) {
                if (child.name === 'legFrontRight' || child.name === 'legBackLeft') {
                    child.rotation.x = legSwing;
                } else if (child.name === 'legFrontLeft' || child.name === 'legBackRight') {
                    child.rotation.x = -legSwing;
                }
            });
            // Ear bounce
            piglet.children.forEach(function(child) {
                if (child.name === 'earLeft' || child.name === 'earRight') {
                    child.rotation.z = (child.name === 'earRight' ? -0.5 : 0.5) + Math.sin(ud.walkPhase * 0.8) * 0.15;
                }
            });
        } else {
            // Legs return to rest when idle
            piglet.children.forEach(function(child) {
                if (child.name && child.name.indexOf('leg') === 0) {
                    child.rotation.x *= 0.9;
                }
            });
        }

        // Gentle bob
        ud.bobPhase += delta * 2;
        piglet.position.y = Math.sin(ud.bobPhase) * 0.03;

        // Tail wiggle
        piglet.children.forEach(function(child) {
            if (child.name === 'tail') {
                child.rotation.z = Math.sin(ud.bobPhase * 3) * 0.3;
            }
        });

        if (ud.state === 'idle') {
            if (ud.stateTimer <= 0) {
                ud.state = 'wandering';
                ud.stateTimer = 3 + Math.random() * 4;
                ud.wanderDirection = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
            }
        } else if (ud.state === 'wandering') {
            piglet.position.x += ud.wanderDirection.x * 2 * delta;
            piglet.position.z += ud.wanderDirection.z * 2 * delta;

            // Face direction
            var targetRot = -Math.atan2(ud.wanderDirection.z, ud.wanderDirection.x);
            piglet.rotation.y += (targetRot - piglet.rotation.y) * 0.1;

            // Stay near home tree
            if (ud.homeTree) {
                var hdx = piglet.position.x - ud.homeTree.position.x;
                var hdz = piglet.position.z - ud.homeTree.position.z;
                if (Math.sqrt(hdx * hdx + hdz * hdz) > 15) {
                    ud.wanderDirection.set(-hdx, 0, -hdz).normalize();
                }
            }

            if (ud.stateTimer <= 0) {
                ud.state = 'idle';
                ud.stateTimer = 2 + Math.random() * 4;
            }
        } else if (ud.state === 'fleeing') {
            // Run away from player!
            var fleeDirX = dx / distToPlayer;
            var fleeDirZ = dz / distToPlayer;
            piglet.position.x += fleeDirX * ud.fleeSpeed * delta;
            piglet.position.z += fleeDirZ * ud.fleeSpeed * delta;

            // Face flee direction
            var fleeRot = -Math.atan2(fleeDirZ, fleeDirX);
            piglet.rotation.y += (fleeRot - piglet.rotation.y) * 0.15;

            ud.fleeTimer += delta;
            if (ud.stateTimer <= 0 || distToPlayer > 20) {
                ud.state = 'idle';
                ud.stateTimer = 2 + Math.random() * 3;
            }
        }
    }
}

// ============================================================================
// PIGLET COMPANION SYSTEM
// ============================================================================

/**
 * Summon a piglet from ownedPiglets into the world as a companion.
 * Max 3 active at a time. Returns true if summoned.
 */
function summonCompanionPiglet(pigletData) {
    if (!GameState.peccary) return false;
    if (!GameState.activePiglets) GameState.activePiglets = [];
    if (!GameState.easterPiglets) GameState.easterPiglets = [];

    // Max 3 active companions
    if (GameState.activePiglets.length >= 3) {
        UI.showToast('Team Full!', 'You already have 3 active piglets. Dismiss one first.');
        return false;
    }

    // Check if this piglet is already active
    for (var i = 0; i < GameState.activePiglets.length; i++) {
        if (GameState.activePiglets[i].userData.pigletType === pigletData.id) {
            UI.showToast('Already Active!', pigletData.name + ' is already following you.');
            return false;
        }
    }

    // Build the 3D model
    var piglet = buildPigletModel(pigletData);
    var px = GameState.peccary.position.x + (Math.random() - 0.5) * 6;
    var pz = GameState.peccary.position.z + (Math.random() - 0.5) * 6;
    piglet.position.set(px, 0, pz);

    // HP by rarity — rarer piglets are tougher
    var pigletHPByRarity = {
        'Common': 15, 'Uncommon': 25, 'Rare': 35,
        'Ultra Rare': 50, 'Epic': 70, 'Godly': 90, 'Easter Symbol': 120
    };
    var maxHP = pigletHPByRarity[pigletData.rarity] || 15;

    // Companion userData
    piglet.userData = {
        isPiglet: true,
        isWild: false,
        isCompanion: true,
        pigletType: pigletData.id,
        pigletName: pigletData.name,
        pigletRarity: pigletData.rarity,
        pigletColor: pigletData.color,
        ability: pigletData.ability,
        abilityType: pigletData.abilityType,
        abilityDesc: pigletData.abilityDesc,
        feature: pigletData.feature,
        catchDifficulty: pigletData.catchDifficulty,
        description: pigletData.description,
        // Piglet health
        health: maxHP,
        maxHealth: maxHP,
        // Companion AI state
        state: 'following',
        walkPhase: Math.random() * Math.PI * 2,
        bobPhase: Math.random() * Math.PI * 2,
        // Each companion picks a random offset spot near Pedro
        orbitAngle: Math.random() * Math.PI * 2,
        orbitDist: 2 + Math.random() * 2,      // 2-4 units from Pedro
        orbitDriftSpeed: 0.3 + Math.random() * 0.4, // Slowly drifts around
        isFlying: false,
        flyWingPhase: 0
    };

    GameState.scene.add(piglet);
    GameState.easterPiglets.push(piglet);
    GameState.activePiglets.push(piglet);

    UI.showToast(pigletData.name + ' Summoned!', pigletData.abilityDesc);
    return true;
}

/**
 * Dismiss an active companion piglet (put it back in inventory only).
 */
function dismissCompanionPiglet(pigletType) {
    if (!GameState.activePiglets) return false;

    for (var i = 0; i < GameState.activePiglets.length; i++) {
        var piglet = GameState.activePiglets[i];
        if (piglet.userData.pigletType === pigletType) {
            // Remove from scene and arrays
            GameState.scene.remove(piglet);
            var idx = GameState.easterPiglets.indexOf(piglet);
            if (idx !== -1) GameState.easterPiglets.splice(idx, 1);
            GameState.activePiglets.splice(i, 1);

            UI.showToast('Dismissed!', piglet.userData.pigletName + ' returned to your collection.');
            return true;
        }
    }
    return false;
}

/**
 * Update companion piglets each frame — random cluster around Pedro.
 */
function updateCompanionPiglets(delta) {
    if (!GameState.activePiglets || GameState.activePiglets.length === 0) return;
    if (!GameState.peccary) return;

    var playerPos = GameState.peccary.position;
    var isMounted = !!GameState.mountedFlamingo;

    for (var i = 0; i < GameState.activePiglets.length; i++) {
        var piglet = GameState.activePiglets[i];
        var ud = piglet.userData;

        // Drift the orbit angle slowly so they wander around Pedro naturally
        ud.orbitAngle += ud.orbitDriftSpeed * delta;
        // Occasionally shift orbit distance a tiny bit
        ud.orbitDist += (Math.random() - 0.5) * 0.5 * delta;
        ud.orbitDist = Math.max(1.5, Math.min(4.5, ud.orbitDist));

        if (isMounted) {
            // ===== FLYING MODE =====
            ud.isFlying = true;
            var flamingo = GameState.mountedFlamingo;
            var targetX = flamingo.position.x + Math.cos(ud.orbitAngle) * (ud.orbitDist + 2);
            var targetZ = flamingo.position.z + Math.sin(ud.orbitAngle) * (ud.orbitDist + 2);
            var targetY = flamingo.position.y + Math.sin(ud.orbitAngle * 0.7) * 1.5; // Bobbing up/down

            // Smooth move toward target
            piglet.position.x += (targetX - piglet.position.x) * 3 * delta;
            piglet.position.z += (targetZ - piglet.position.z) * 3 * delta;
            piglet.position.y += (targetY - piglet.position.y) * 3 * delta;

            // Wing flapping animation
            ud.flyWingPhase += delta * 12;
            var wingFlap = Math.sin(ud.flyWingPhase) * 0.6;
            piglet.children.forEach(function(child) {
                if (child.name === 'wingLeft') {
                    child.rotation.z = 0.3 + wingFlap;
                } else if (child.name === 'wingRight') {
                    child.rotation.z = -0.3 - wingFlap;
                }
            });

            // Show wings if not already visible
            piglet.children.forEach(function(child) {
                if (child.name === 'wingLeft' || child.name === 'wingRight') {
                    child.visible = true;
                }
            });

            // Face direction of movement
            var dx = targetX - piglet.position.x;
            var dz = targetZ - piglet.position.z;
            if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
                piglet.rotation.y = -Math.atan2(dz, dx);
            }

            // Legs tucked in flight
            piglet.children.forEach(function(child) {
                if (child.name && child.name.indexOf('leg') === 0) {
                    child.rotation.x = -0.4;
                }
            });

        } else {
            // ===== GROUND FOLLOWING MODE =====
            if (ud.isFlying) {
                // Just landed — hide wings
                ud.isFlying = false;
                piglet.children.forEach(function(child) {
                    if (child.name === 'wingLeft' || child.name === 'wingRight') {
                        child.visible = false;
                    }
                });
            }

            // Target position: orbit around Pedro
            var targetX2 = playerPos.x + Math.cos(ud.orbitAngle) * ud.orbitDist;
            var targetZ2 = playerPos.z + Math.sin(ud.orbitAngle) * ud.orbitDist;

            var dx2 = targetX2 - piglet.position.x;
            var dz2 = targetZ2 - piglet.position.z;
            var dist = Math.sqrt(dx2 * dx2 + dz2 * dz2);

            // Move speed depends on how far they are
            var speed;
            if (dist > 15) {
                // Teleport if too far (e.g., after biome change)
                piglet.position.x = targetX2;
                piglet.position.z = targetZ2;
                speed = 0;
            } else if (dist > 6) {
                speed = 8; // Sprint to catch up
            } else if (dist > 1.5) {
                speed = 3 + dist * 0.5; // Casual follow
            } else {
                speed = 0; // Close enough, idle
            }

            if (speed > 0) {
                var moveX = (dx2 / dist) * speed * delta;
                var moveZ = (dz2 / dist) * speed * delta;
                piglet.position.x += moveX;
                piglet.position.z += moveZ;

                // Face movement direction
                piglet.rotation.y += (-Math.atan2(dz2, dx2) - piglet.rotation.y) * 0.1;

                // Walking animation
                ud.walkPhase += delta * (speed > 5 ? 10 : 6);
                var legSwing = Math.sin(ud.walkPhase) * 0.4;
                piglet.children.forEach(function(child) {
                    if (child.name === 'legFrontRight' || child.name === 'legBackLeft') {
                        child.rotation.x = legSwing;
                    } else if (child.name === 'legFrontLeft' || child.name === 'legBackRight') {
                        child.rotation.x = -legSwing;
                    }
                });

                // Ear bounce
                piglet.children.forEach(function(child) {
                    if (child.name === 'earLeft' || child.name === 'earRight') {
                        child.rotation.z = (child.name === 'earRight' ? -0.5 : 0.5) + Math.sin(ud.walkPhase * 0.8) * 0.15;
                    }
                });
            } else {
                // Idle — ease legs to rest
                piglet.children.forEach(function(child) {
                    if (child.name && child.name.indexOf('leg') === 0) {
                        child.rotation.x *= 0.9;
                    }
                });
            }

            // Ground level
            piglet.position.y = Math.sin(ud.bobPhase) * 0.03;
        }

        // Always: gentle bob + tail wiggle
        ud.bobPhase += delta * 2;
        piglet.children.forEach(function(child) {
            if (child.name === 'tail') {
                child.rotation.z = Math.sin(ud.bobPhase * 3) * 0.3;
            }
        });
    }
}

// ============================================================================
// PIGLET ABILITY SYSTEM
// ============================================================================
// Each ability runs on timers every frame. Active piglets apply effects
// automatically. Combat piglets auto-attack but player can press Q near
// a companion to take direct control of its ability.
// ============================================================================

// Ability state tracked per-piglet in userData:
//   abilityTimer   — countdown for periodic effects
//   abilityCooldown — cooldown for combat abilities
//   abilityActive  — whether ability is currently firing
//   controlledByPlayer — Q-targeted combat override

// Global ability flags (reset each frame by updatePigletAbilities)
GameState.pigletBuffs = {
    speedMultiplier: 1.0,
    hungerDrainMultiplier: 1.0,
    thirstDrainMultiplier: 1.0,
    noFallDamage: false,
    jumpBoost: 1.0,
    bubbleShieldActive: false,
    luckyDrops: false,
    invisible: false,
    charmActive: false,
    resourceFinderActive: false
};

function hasActiveAbility(abilityId) {
    if (!GameState.activePiglets) return false;
    for (var i = 0; i < GameState.activePiglets.length; i++) {
        var ab = GameState.activePiglets[i].userData.ability;
        if (ab === abilityId || ab === 'all_abilities') return true;
    }
    return false;
}

function updatePigletAbilities(delta) {
    if (!GameState.activePiglets || GameState.activePiglets.length === 0) {
        // Reset all buffs when no piglets active
        GameState.pigletBuffs.speedMultiplier = 1.0;
        GameState.pigletBuffs.hungerDrainMultiplier = 1.0;
        GameState.pigletBuffs.thirstDrainMultiplier = 1.0;
        GameState.pigletBuffs.noFallDamage = false;
        GameState.pigletBuffs.jumpBoost = 1.0;
        GameState.pigletBuffs.bubbleShieldActive = false;
        GameState.pigletBuffs.luckyDrops = false;
        GameState.pigletBuffs.invisible = false;
        GameState.pigletBuffs.charmActive = false;
        GameState.pigletBuffs.resourceFinderActive = false;
        return;
    }

    // Reset buffs each frame — piglets re-apply them
    GameState.pigletBuffs.speedMultiplier = 1.0;
    GameState.pigletBuffs.hungerDrainMultiplier = 1.0;
    GameState.pigletBuffs.thirstDrainMultiplier = 1.0;
    GameState.pigletBuffs.noFallDamage = false;
    GameState.pigletBuffs.jumpBoost = 1.0;
    GameState.pigletBuffs.bubbleShieldActive = false;
    GameState.pigletBuffs.luckyDrops = false;
    GameState.pigletBuffs.invisible = false;
    GameState.pigletBuffs.charmActive = false;
    GameState.pigletBuffs.resourceFinderActive = false;

    var playerPos = GameState.peccary ? GameState.peccary.position : null;
    if (!playerPos) return;

    for (var i = 0; i < GameState.activePiglets.length; i++) {
        var piglet = GameState.activePiglets[i];
        var ud = piglet.userData;
        var ability = ud.ability;

        // Initialize ability state if not set
        if (ud.abilityTimer === undefined) ud.abilityTimer = 0;
        if (ud.abilityCooldown === undefined) ud.abilityCooldown = 0;

        // Tick down cooldowns
        if (ud.abilityCooldown > 0) ud.abilityCooldown -= delta;

        // Celestial has ALL abilities — run each one
        if (ability === 'all_abilities') {
            applyBuff_passiveHeal(piglet, ud, delta);
            applyBuff_hungerSlow(piglet, ud, delta);
            applyBuff_thirstSlow(piglet, ud, delta);
            applyBuff_speedBoost(piglet, ud, delta);
            applyBuff_softLanding(piglet, ud, delta);
            applyBuff_bubbleShield(piglet, ud, delta);
            applyCombat_hairShot(piglet, ud, delta, playerPos);
            applyCombat_spiceAttack(piglet, ud, delta, playerPos);
            applyCombat_fireCharge(piglet, ud, delta, playerPos);
            applyCombat_freezeAura(piglet, ud, delta, playerPos);
            applyUtility_luckyDrops(piglet, ud, delta);
            applyUtility_resourceFinder(piglet, ud, delta, playerPos);
            applyUtility_charm(piglet, ud, delta, playerPos);
            applyUtility_invisibility(piglet, ud, delta, playerPos);
            continue;
        }

        // Emerald mimic — pick a random ability every 15 seconds
        if (ability === 'mimic') {
            if (ud.mimicTimer === undefined) ud.mimicTimer = 0;
            if (!ud.mimicAbility) {
                // Pick first random ability
                var allAbilities = ['passive_heal','hunger_slow','thirst_slow','speed_boost',
                    'soft_landing','bubble_shield','hair_shot','spice_attack','fire_charge',
                    'freeze_aura','lucky_drops','resource_finder','charm','invisibility'];
                ud.mimicAbility = allAbilities[Math.floor(Math.random() * allAbilities.length)];
                ud.mimicTimer = 15;
            }
            ud.mimicTimer -= delta;
            if (ud.mimicTimer <= 0) {
                var allAb = ['passive_heal','hunger_slow','thirst_slow','speed_boost',
                    'soft_landing','bubble_shield','hair_shot','spice_attack','fire_charge',
                    'freeze_aura','lucky_drops','resource_finder','charm','invisibility'];
                ud.mimicAbility = allAb[Math.floor(Math.random() * allAb.length)];
                ud.mimicTimer = 15;
                UI.showToast('Emerald Shifted!', 'Now mimicking: ' + ud.mimicAbility.replace(/_/g, ' '));
            }
            // Apply the mimicked ability
            applyAbilityById(ud.mimicAbility, piglet, ud, delta, playerPos);
            continue;
        }

        // Normal single-ability piglets
        applyAbilityById(ability, piglet, ud, delta, playerPos);
    }
}

function applyAbilityById(abilityId, piglet, ud, delta, playerPos) {
    switch (abilityId) {
        case 'passive_heal':    applyBuff_passiveHeal(piglet, ud, delta); break;
        case 'hunger_slow':     applyBuff_hungerSlow(piglet, ud, delta); break;
        case 'thirst_slow':     applyBuff_thirstSlow(piglet, ud, delta); break;
        case 'speed_boost':     applyBuff_speedBoost(piglet, ud, delta); break;
        case 'soft_landing':    applyBuff_softLanding(piglet, ud, delta); break;
        case 'bubble_shield':   applyBuff_bubbleShield(piglet, ud, delta); break;
        case 'hair_shot':       applyCombat_hairShot(piglet, ud, delta, playerPos); break;
        case 'spice_attack':    applyCombat_spiceAttack(piglet, ud, delta, playerPos); break;
        case 'fire_charge':     applyCombat_fireCharge(piglet, ud, delta, playerPos); break;
        case 'freeze_aura':     applyCombat_freezeAura(piglet, ud, delta, playerPos); break;
        case 'lucky_drops':     applyUtility_luckyDrops(piglet, ud, delta); break;
        case 'resource_finder': applyUtility_resourceFinder(piglet, ud, delta, playerPos); break;
        case 'charm':           applyUtility_charm(piglet, ud, delta, playerPos); break;
        case 'invisibility':    applyUtility_invisibility(piglet, ud, delta, playerPos); break;
    }
}

// ============================================================================
// BUFF ABILITIES
// ============================================================================

function applyBuff_passiveHeal(piglet, ud, delta) {
    // +1 HP every 8 seconds
    if (ud.healTimer === undefined) ud.healTimer = 0;
    ud.healTimer += delta;
    if (ud.healTimer >= 8) {
        ud.healTimer -= 8;
        if (GameState.health < 100) {
            GameState.health = Math.min(100, GameState.health + 1);
            // Small green flash on piglet
            spawnAbilityParticle(piglet.position, 0x00FF00, '+1');
        }
    }
}

function applyBuff_hungerSlow(piglet, ud, delta) {
    GameState.pigletBuffs.hungerDrainMultiplier *= 0.7; // 30% slower
}

function applyBuff_thirstSlow(piglet, ud, delta) {
    GameState.pigletBuffs.thirstDrainMultiplier *= 0.7; // 30% slower
}

function applyBuff_speedBoost(piglet, ud, delta) {
    GameState.pigletBuffs.speedMultiplier *= 1.3; // 30% faster
}

function applyBuff_softLanding(piglet, ud, delta) {
    GameState.pigletBuffs.noFallDamage = true;
    GameState.pigletBuffs.jumpBoost = 1.2; // 20% higher jumps
}

function applyBuff_bubbleShield(piglet, ud, delta) {
    // Blocks one hit every 30 seconds
    if (ud.bubbleCooldown === undefined) ud.bubbleCooldown = 0;
    if (ud.bubbleCooldown > 0) {
        ud.bubbleCooldown -= delta;
    } else {
        GameState.pigletBuffs.bubbleShieldActive = true;
    }
    // Visual: bubble around piglet when shield is ready
    if (!ud.bubbleVisual) {
        var bubbleGeo = new THREE.SphereGeometry(1.2, 12, 8);
        var bubbleMat = new THREE.MeshStandardMaterial({
            color: 0xFF69B4, transparent: true, opacity: 0.15, side: THREE.DoubleSide
        });
        ud.bubbleVisual = new THREE.Mesh(bubbleGeo, bubbleMat);
        ud.bubbleVisual.name = 'bubbleShield';
        piglet.add(ud.bubbleVisual);
    }
    ud.bubbleVisual.visible = (ud.bubbleCooldown <= 0);
}

// Called from takeDamage when bubble is active
function consumeBubbleShield() {
    if (!GameState.activePiglets) return false;
    for (var i = 0; i < GameState.activePiglets.length; i++) {
        var ud = GameState.activePiglets[i].userData;
        if (ud.ability === 'bubble_shield' || ud.ability === 'all_abilities') {
            if (ud.bubbleCooldown === undefined || ud.bubbleCooldown <= 0) {
                ud.bubbleCooldown = 30; // 30 second cooldown
                UI.showToast('Bubble Shield!', 'Bubblegum blocked a hit! Recharging...');
                spawnAbilityParticle(GameState.activePiglets[i].position, 0xFF69B4, 'POP!');
                return true; // Damage blocked
            }
        }
    }
    return false;
}

// ============================================================================
// COMBAT ABILITIES (auto-attack, Q for player control)
// ============================================================================

function findNearestHostileEnemy(position, range) {
    if (!GameState.enemies) return null;
    var closest = null;
    var closestDist = range;
    for (var i = 0; i < GameState.enemies.length; i++) {
        var enemy = GameState.enemies[i];
        if (!enemy.userData || enemy.userData.friendly) continue;
        if (enemy.userData.health <= 0) continue;
        // Skip Easter animals and piglets
        if (enemy.userData.isEasterBunny || enemy.userData.isPiglet) continue;
        var dist = position.distanceTo(enemy.position);
        if (dist < closestDist) {
            closestDist = dist;
            closest = enemy;
        }
    }
    return closest;
}

function findNearestEnemy(position, range) {
    // Finds ANY enemy (hostile or not) for combat piglets
    if (!GameState.enemies) return null;
    var closest = null;
    var closestDist = range;
    for (var i = 0; i < GameState.enemies.length; i++) {
        var enemy = GameState.enemies[i];
        if (!enemy.userData) continue;
        if (enemy.userData.health <= 0) continue;
        if (enemy.userData.isEasterBunny || enemy.userData.isPiglet) continue;
        // Only target enemies that are near the player (not random far-away ones)
        if (GameState.peccary) {
            var toPlayer = GameState.peccary.position.distanceTo(enemy.position);
            if (toPlayer > range * 2) continue;
        }
        var dist = position.distanceTo(enemy.position);
        if (dist < closestDist) {
            closestDist = dist;
            closest = enemy;
        }
    }
    return closest;
}

function applyCombat_hairShot(piglet, ud, delta, playerPos) {
    // Shoots hairs every 3 seconds at nearest enemy within 12 units, repels them
    if (ud.hairShotTimer === undefined) ud.hairShotTimer = 0;
    ud.hairShotTimer += delta;
    if (ud.hairShotTimer < 3) return;
    ud.hairShotTimer = 0;

    var target = findNearestEnemy(piglet.position, 12);
    if (!target) return;

    // Create hair projectile
    var hairGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 4);
    var hairMat = new THREE.MeshStandardMaterial({ color: 0x8B6914 });
    var hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.copy(piglet.position);
    hair.position.y += 0.5;
    GameState.scene.add(hair);

    // Animate toward target and repel on hit
    var targetPos = target.position.clone();
    var projectile = {
        mesh: hair,
        target: target,
        targetPos: targetPos,
        speed: 20,
        lifetime: 2,
        type: 'hair_shot'
    };
    if (!GameState.pigletProjectiles) GameState.pigletProjectiles = [];
    GameState.pigletProjectiles.push(projectile);
}

function applyCombat_spiceAttack(piglet, ud, delta, playerPos) {
    // Shakes spice every 5 seconds — slows nearby enemies 40%, halves their damage
    if (ud.spiceTimer === undefined) ud.spiceTimer = 0;
    ud.spiceTimer += delta;
    if (ud.spiceTimer < 5) return;
    ud.spiceTimer = 0;

    var spiceRange = 10;
    var hitAny = false;
    if (GameState.enemies) {
        for (var i = 0; i < GameState.enemies.length; i++) {
            var enemy = GameState.enemies[i];
            if (!enemy.userData || enemy.userData.isEasterBunny || enemy.userData.isPiglet) continue;
            if (enemy.userData.health <= 0) continue;
            var dist = piglet.position.distanceTo(enemy.position);
            if (dist < spiceRange) {
                enemy.userData.spiced = true;
                enemy.userData.spicedTimer = 4; // 4 seconds of slow+weak
                hitAny = true;
            }
        }
    }
    if (hitAny) {
        // Orange particle burst
        spawnAbilityParticle(piglet.position, 0xFF8C00, 'SPICE!');
    }
}

function applyCombat_fireCharge(piglet, ud, delta, playerPos) {
    // Charges into nearest enemy every 8 seconds, burns for 5s (3 dmg/tick)
    if (ud.fireChargeTimer === undefined) ud.fireChargeTimer = 0;
    if (ud.fireCharging === undefined) ud.fireCharging = false;
    if (ud.fireTarget === undefined) ud.fireTarget = null;

    if (ud.fireCharging && ud.fireTarget) {
        // Currently charging — move toward target fast
        var dx = ud.fireTarget.position.x - piglet.position.x;
        var dz = ud.fireTarget.position.z - piglet.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 1.5 || dist > 30) {
            // Hit or lost target
            if (dist < 1.5 && ud.fireTarget.userData) {
                ud.fireTarget.userData.burning = true;
                ud.fireTarget.userData.burnTimer = 5;
                ud.fireTarget.userData.burnDamageRate = 3;
                spawnAbilityParticle(ud.fireTarget.position, 0xFF4500, 'BURN!');
            }
            ud.fireCharging = false;
            ud.fireTarget = null;
            ud.fireChargeTimer = 0;
            return;
        }
        piglet.position.x += (dx / dist) * 15 * delta;
        piglet.position.z += (dz / dist) * 15 * delta;
        piglet.rotation.y = -Math.atan2(dz, dx);
        return; // Skip normal companion movement this frame
    }

    ud.fireChargeTimer += delta;
    if (ud.fireChargeTimer < 8) return;

    var target = findNearestEnemy(piglet.position, 15);
    if (!target) return;
    ud.fireCharging = true;
    ud.fireTarget = target;
    ud.fireChargeTimer = 0;
}

function applyCombat_freezeAura(piglet, ud, delta, playerPos) {
    // Freezes enemies within 8 units for 3 seconds, checks every 4 seconds
    if (ud.freezeTimer === undefined) ud.freezeTimer = 0;
    ud.freezeTimer += delta;
    if (ud.freezeTimer < 4) return;
    ud.freezeTimer = 0;

    var freezeRange = 8;
    var hitAny = false;
    if (GameState.enemies) {
        for (var i = 0; i < GameState.enemies.length; i++) {
            var enemy = GameState.enemies[i];
            if (!enemy.userData || enemy.userData.isEasterBunny || enemy.userData.isPiglet) continue;
            if (enemy.userData.health <= 0) continue;
            var dist = piglet.position.distanceTo(enemy.position);
            if (dist < freezeRange) {
                enemy.userData.frozen = true;
                enemy.userData.frozenTimer = 3;
                hitAny = true;
            }
        }
    }
    if (hitAny) {
        spawnAbilityParticle(piglet.position, 0xAFEEEE, 'FREEZE!');
    }
}

// ============================================================================
// UTILITY ABILITIES
// ============================================================================

function applyUtility_luckyDrops(piglet, ud, delta) {
    GameState.pigletBuffs.luckyDrops = true; // Checked in items.js collectResource
}

function applyUtility_resourceFinder(piglet, ud, delta, playerPos) {
    // Make nearby resources glow (pulse emissive every frame)
    GameState.pigletBuffs.resourceFinderActive = true;
    if (ud.finderPulse === undefined) ud.finderPulse = 0;
    ud.finderPulse += delta * 3;
    var glowIntensity = 0.3 + Math.sin(ud.finderPulse) * 0.3;

    if (GameState.resources) {
        for (var i = 0; i < GameState.resources.length; i++) {
            var res = GameState.resources[i];
            if (!res || !res.position) continue;
            var dist = playerPos.distanceTo(res.position);
            if (dist < 20) {
                // Make it glow by boosting emissive
                res.traverse(function(child) {
                    if (child.material && !child.userData.originalEmissive) {
                        child.userData.originalEmissive = child.material.emissive ? child.material.emissive.getHex() : 0;
                        child.userData.hadResourceGlow = true;
                    }
                    if (child.material && child.material.emissive) {
                        child.material.emissive.setHex(0xFFFF00);
                        child.material.emissiveIntensity = glowIntensity;
                    }
                });
            } else {
                // Reset glow for distant resources
                res.traverse(function(child) {
                    if (child.userData.hadResourceGlow && child.material && child.material.emissive) {
                        child.material.emissive.setHex(child.userData.originalEmissive || 0);
                        child.material.emissiveIntensity = 0;
                        delete child.userData.hadResourceGlow;
                        delete child.userData.originalEmissive;
                    }
                });
            }
        }
    }
}

function applyUtility_charm(piglet, ud, delta, playerPos) {
    // Passive animals follow Pedro instead of fleeing
    GameState.pigletBuffs.charmActive = true;
    // Attract nearby passive animals toward player
    if (GameState.enemies) {
        for (var i = 0; i < GameState.enemies.length; i++) {
            var enemy = GameState.enemies[i];
            if (!enemy.userData || !enemy.userData.friendly) continue;
            if (enemy.userData.isEasterBunny || enemy.userData.isPiglet) continue;
            var dist = playerPos.distanceTo(enemy.position);
            if (dist < 20 && dist > 3) {
                // Gently move toward player
                var dx = playerPos.x - enemy.position.x;
                var dz = playerPos.z - enemy.position.z;
                var len = Math.sqrt(dx * dx + dz * dz);
                enemy.position.x += (dx / len) * 2 * delta;
                enemy.position.z += (dz / len) * 2 * delta;
                enemy.userData.charmed = true;
            }
        }
    }
}

function applyUtility_invisibility(piglet, ud, delta, playerPos) {
    // Pedro invisible when standing still for 2 seconds
    if (ud.stillTimer === undefined) ud.stillTimer = 0;
    if (ud.lastPlayerX === undefined) {
        ud.lastPlayerX = playerPos.x;
        ud.lastPlayerZ = playerPos.z;
    }

    var moved = Math.abs(playerPos.x - ud.lastPlayerX) > 0.05 ||
                Math.abs(playerPos.z - ud.lastPlayerZ) > 0.05;
    ud.lastPlayerX = playerPos.x;
    ud.lastPlayerZ = playerPos.z;

    if (moved) {
        ud.stillTimer = 0;
        // Become visible again
        if (GameState.peccary) {
            GameState.peccary.traverse(function(child) {
                if (child.material) {
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                }
            });
        }
        GameState.pigletBuffs.invisible = false;
    } else {
        ud.stillTimer += delta;
        if (ud.stillTimer >= 2) {
            // Fade Pedro to near-invisible
            GameState.pigletBuffs.invisible = true;
            if (GameState.peccary) {
                GameState.peccary.traverse(function(child) {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = 0.15;
                    }
                });
            }
        }
    }
}

// ============================================================================
// COMBAT EFFECT PROCESSING (burn, freeze, spice — runs in game loop)
// ============================================================================

function updatePigletCombatEffects(delta) {
    if (!GameState.enemies) return;

    for (var i = 0; i < GameState.enemies.length; i++) {
        var enemy = GameState.enemies[i];
        if (!enemy.userData) continue;

        // BURN effect (from Fiery)
        if (enemy.userData.burning) {
            enemy.userData.burnTimer -= delta;
            if (enemy.userData.burnTimer <= 0) {
                enemy.userData.burning = false;
            } else {
                // Deal damage over time
                enemy.userData.health -= enemy.userData.burnDamageRate * delta;
                if (enemy.userData.health <= 0) {
                    // Enemy defeated by burn — give score
                    GameState.score += 5;
                }
            }
        }

        // FREEZE effect (from Frost)
        if (enemy.userData.frozen) {
            enemy.userData.frozenTimer -= delta;
            if (enemy.userData.frozenTimer <= 0) {
                enemy.userData.frozen = false;
                // Restore tint
                enemy.traverse(function(child) {
                    if (child.material && child.userData.preFreezeColor !== undefined) {
                        child.material.color.setHex(child.userData.preFreezeColor);
                        delete child.userData.preFreezeColor;
                    }
                });
            } else {
                // Tint enemy blue while frozen
                enemy.traverse(function(child) {
                    if (child.material && child.userData.preFreezeColor === undefined) {
                        child.userData.preFreezeColor = child.material.color.getHex();
                    }
                    if (child.material) {
                        child.material.color.setHex(0xAFEEEE);
                    }
                });
            }
        }

        // SPICE effect (from Ginger) — slow + weaken
        if (enemy.userData.spiced) {
            enemy.userData.spicedTimer -= delta;
            if (enemy.userData.spicedTimer <= 0) {
                enemy.userData.spiced = false;
            }
            // Speed and damage reduction applied in enemies.js movement code
        }
    }

    // Update projectiles (hair shots)
    if (GameState.pigletProjectiles) {
        for (var p = GameState.pigletProjectiles.length - 1; p >= 0; p--) {
            var proj = GameState.pigletProjectiles[p];
            proj.lifetime -= delta;

            if (proj.lifetime <= 0) {
                GameState.scene.remove(proj.mesh);
                GameState.pigletProjectiles.splice(p, 1);
                continue;
            }

            // Move toward target
            var dx = proj.targetPos.x - proj.mesh.position.x;
            var dz = proj.targetPos.z - proj.mesh.position.z;
            var dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < 1) {
                // Hit! Repel the target
                if (proj.target && proj.target.userData) {
                    var repelDx = proj.target.position.x - proj.mesh.position.x;
                    var repelDz = proj.target.position.z - proj.mesh.position.z;
                    var repelLen = Math.sqrt(repelDx * repelDx + repelDz * repelDz) || 1;
                    proj.target.position.x += (repelDx / repelLen) * 5;
                    proj.target.position.z += (repelDz / repelLen) * 5;
                    // Small damage
                    proj.target.userData.health -= 2;
                    spawnAbilityParticle(proj.target.position, 0x8B6914, 'OUCH!');
                }
                GameState.scene.remove(proj.mesh);
                GameState.pigletProjectiles.splice(p, 1);
                continue;
            }

            proj.mesh.position.x += (dx / dist) * proj.speed * delta;
            proj.mesh.position.z += (dz / dist) * proj.speed * delta;
            proj.mesh.lookAt(proj.targetPos);
        }
    }
}

// ============================================================================
// ABILITY PARTICLE EFFECTS
// ============================================================================

function spawnAbilityParticle(position, color, text) {
    // Simple floating text/sphere that rises and fades
    var group = new THREE.Group();
    group.position.copy(position);
    group.position.y += 1.5;

    var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 4),
        new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.8 })
    );
    group.add(sphere);

    GameState.scene.add(group);

    // Also show toast for important effects
    // (not every particle — only the first one occasionally)

    // Float up and remove after 1 second
    var startY = group.position.y;
    var life = 0;
    var animateParticle = function() {
        life += 0.016;
        group.position.y = startY + life * 2;
        sphere.material.opacity = Math.max(0, 1 - life);
        sphere.material.transparent = true;
        if (life < 1) {
            requestAnimationFrame(animateParticle);
        } else {
            GameState.scene.remove(group);
        }
    };
    requestAnimationFrame(animateParticle);
}

// ============================================================================
// Q KEY — TAKE CONTROL OF NEAREST COMBAT PIGLET
// ============================================================================

function handlePigletControl() {
    if (!GameState.activePiglets || GameState.activePiglets.length === 0) return;
    if (!GameState.peccary) return;

    var playerPos = GameState.peccary.position;
    var closest = null;
    var closestDist = 8; // Must be within 8 units

    for (var i = 0; i < GameState.activePiglets.length; i++) {
        var piglet = GameState.activePiglets[i];
        var ability = piglet.userData.ability;
        // Only combat piglets can be controlled
        var isCombat = (ability === 'hair_shot' || ability === 'spice_attack' ||
                        ability === 'fire_charge' || ability === 'freeze_aura' ||
                        ability === 'all_abilities');
        if (!isCombat) continue;

        var dist = playerPos.distanceTo(piglet.position);
        if (dist < closestDist) {
            closestDist = dist;
            closest = piglet;
        }
    }

    if (closest) {
        // Force-trigger the combat ability immediately
        var ud = closest.userData;
        var ability = ud.ability === 'all_abilities' ? 'freeze_aura' : ud.ability;

        switch (ability) {
            case 'hair_shot':
                ud.hairShotTimer = 3; // Trigger immediately
                break;
            case 'spice_attack':
                ud.spiceTimer = 5;
                break;
            case 'fire_charge':
                var target = findNearestEnemy(closest.position, 20);
                if (target) {
                    ud.fireCharging = true;
                    ud.fireTarget = target;
                    ud.fireChargeTimer = 0;
                }
                break;
            case 'freeze_aura':
                ud.freezeTimer = 4;
                break;
        }
        UI.showToast(ud.pigletName + '!', 'Activated ' + ability.replace(/_/g, ' ') + '!');
    } else {
        UI.showToast('No Combat Piglet', 'Get closer to a combat piglet to control it.');
    }
}

// ============================================================================
// PIGLET DAMAGE & KNOCKOUT SYSTEM
// ============================================================================
// Enemies target piglets before the player. If a piglet's HP reaches 0,
// it gets knocked out, dismissed, and marked in inventory.
// Larry can heal knocked-out piglets for Easter Eggs.
// ============================================================================

var PIGLET_HEAL_COST = {
    'Common': 5, 'Uncommon': 10, 'Rare': 20,
    'Ultra Rare': 35, 'Epic': 50, 'Godly': 75, 'Easter Symbol': 100
};

/**
 * Deal damage to an active companion piglet.
 * Returns true if piglet absorbed the hit (enemies should stop chasing player).
 */
function damagePiglet(piglet, amount) {
    if (!piglet || !piglet.userData) return false;
    var ud = piglet.userData;

    ud.health -= amount;

    // Flash piglet red briefly
    piglet.traverse(function(child) {
        if (child.material) {
            if (!child.userData.pigletOrigColor) {
                child.userData.pigletOrigColor = child.material.color.getHex();
            }
            child.material.color.setHex(0xFF0000);
        }
    });
    setTimeout(function() {
        piglet.traverse(function(child) {
            if (child.material && child.userData.pigletOrigColor !== undefined) {
                child.material.color.setHex(child.userData.pigletOrigColor);
                delete child.userData.pigletOrigColor;
            }
        });
    }, 200);

    if (ud.health <= 0) {
        knockOutPiglet(piglet);
    }
    return true;
}

/**
 * Knock out a piglet — dismiss it and mark as knocked out in inventory.
 */
function knockOutPiglet(piglet) {
    var ud = piglet.userData;

    // Show knockout toast
    UI.showToast(
        ud.pigletName + ' is Knocked Out!',
        'Your piglet is knocked out and hurt! Larry might know something about how to help it.'
    );

    // Mark as knocked out in inventory
    if (GameState.ownedPiglets) {
        for (var i = 0; i < GameState.ownedPiglets.length; i++) {
            if (GameState.ownedPiglets[i].id === ud.pigletType) {
                GameState.ownedPiglets[i].knockedOut = true;
                break;
            }
        }
    }

    // Dismiss from world
    dismissCompanionPiglet(ud.pigletType);
}

/**
 * Find the closest active companion piglet to a given position.
 * Used by enemies to decide whether to attack a piglet or the player.
 */
function findClosestCompanionPiglet(enemyPos, range) {
    if (!GameState.activePiglets || GameState.activePiglets.length === 0) return null;
    var closest = null;
    var closestDist = range;
    for (var i = 0; i < GameState.activePiglets.length; i++) {
        var piglet = GameState.activePiglets[i];
        if (!piglet.userData || piglet.userData.health <= 0) continue;
        var dist = enemyPos.distanceTo(piglet.position);
        if (dist < closestDist) {
            closestDist = dist;
            closest = piglet;
        }
    }
    return closest;
}

// ============================================================================
// PIGLET PICKER UI
// ============================================================================

var pigletPickerOpen = false;

function togglePigletPicker() {
    if (pigletPickerOpen) {
        closePigletPicker();
    } else {
        openPigletPicker();
    }
}

function openPigletPicker() {
    if (!GameState.ownedPiglets || GameState.ownedPiglets.length === 0) {
        UI.showToast('No Piglets!', 'Catch wild piglets or buy mystery eggs to get companions.');
        return;
    }

    pigletPickerOpen = true;
    var overlay = document.getElementById('piglet-picker-overlay');
    overlay.classList.add('active');
    refreshPigletPicker();
}

function closePigletPicker() {
    pigletPickerOpen = false;
    var overlay = document.getElementById('piglet-picker-overlay');
    overlay.classList.remove('active');
}

function refreshPigletPicker() {
    var list = document.getElementById('piglet-picker-list');
    list.innerHTML = '';

    var activeTypes = [];
    if (GameState.activePiglets) {
        for (var a = 0; a < GameState.activePiglets.length; a++) {
            activeTypes.push(GameState.activePiglets[a].userData.pigletType);
        }
    }

    var activeCount = GameState.activePiglets ? GameState.activePiglets.length : 0;
    document.getElementById('piglet-picker-count').textContent = activeCount + '/3 Active';

    for (var i = 0; i < GameState.ownedPiglets.length; i++) {
        var p = GameState.ownedPiglets[i];
        var isActive = activeTypes.indexOf(p.id) !== -1;
        var isKO = !!p.knockedOut;

        var card = document.createElement('div');
        card.className = 'piglet-picker-card' + (isActive ? ' active' : '') + (isKO ? ' knocked-out' : '');

        var rarityColor = (typeof LAMB_RARITY_COLORS !== 'undefined' && LAMB_RARITY_COLORS[p.rarity]) || '#ffffff';

        var btnText = isActive ? 'Dismiss' : (isKO ? 'Hurt!' : 'Summon');
        var btnClass = 'piglet-picker-btn' + (isKO ? ' ko-btn' : '');
        var healCost = PIGLET_HEAL_COST[p.rarity] || 5;

        card.innerHTML =
            '<div class="piglet-picker-icon" style="background:#' + (p.color || 0xffffff).toString(16).padStart(6, '0') + (isKO ? ';opacity:0.4' : '') + '"></div>' +
            '<div class="piglet-picker-info">' +
                '<div class="piglet-picker-name">' + p.name + (isKO ? ' <span style="color:#ff4444">(KO)</span>' : '') + '</div>' +
                '<div class="piglet-picker-rarity" style="color:' + rarityColor + '">' + p.rarity + '</div>' +
                '<div class="piglet-picker-ability">' + (isKO ? 'Visit Larry to heal (' + healCost + ' Easter Eggs)' : (p.abilityDesc || '')) + '</div>' +
            '</div>' +
            '<div class="' + btnClass + '">' + btnText + '</div>';

        // Closure for click handler
        (function(pigletData, active, knockedOut) {
            card.addEventListener('click', function() {
                if (knockedOut) {
                    UI.showToast('Piglet Hurt!', pigletData.name + ' is knocked out! Talk to Larry the Lamb to heal it.');
                    return;
                }
                if (active) {
                    dismissCompanionPiglet(pigletData.id);
                } else {
                    // Find full data from EASTER_PIGLET_TYPES for the 3D model
                    var fullData = EASTER_PIGLET_TYPES.find(function(t) { return t.id === pigletData.id; });
                    if (fullData) {
                        summonCompanionPiglet(fullData);
                    }
                }
                refreshPigletPicker();
            });
        })(p, isActive, isKO);

        list.appendChild(card);
    }
}

// ============================================================================
// PIGLET CATCHING MINIGAME
// ============================================================================

var catchMinigameState = {
    active: false,
    piglet: null,          // The wild piglet being caught
    sliderPos: 0,          // 0-1 position of red slider
    sliderSpeed: 1.8,      // How fast the slider moves (higher = harder)
    sliderDirection: 1,    // 1 = right, -1 = left
    whiteZoneStart: 0,     // 0-1 where white zone begins
    whiteZoneWidth: 0.3,   // 0-1 width of white zone (from catchDifficulty)
    resultTimer: 0,        // Timer for showing result before closing
    caught: false,
    animFrame: null
};

/**
 * Try to catch a nearby wild piglet (called when E is pressed).
 */
function tryCatchPiglet() {
    if (!GameState.peccary || !GameState.easterPiglets) return false;
    if (catchMinigameState.active) return false;
    if (GameState.mountedFlamingo) return false;

    var playerPos = GameState.peccary.position;
    var nearest = null;
    var nearestDist = 8; // Must be within 8 units (piglets flee at 10)

    console.log('[PIGLET DEBUG] Trying to catch. Piglets in world: ' + (GameState.easterPiglets ? GameState.easterPiglets.length : 0));

    for (var i = 0; i < GameState.easterPiglets.length; i++) {
        var piglet = GameState.easterPiglets[i];
        if (!piglet.userData.isWild) continue;
        var dist = playerPos.distanceTo(piglet.position);
        console.log('[PIGLET DEBUG] ' + piglet.userData.pigletName + ' dist=' + dist.toFixed(1) + ' isWild=' + piglet.userData.isWild);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = piglet;
        }
    }

    if (!nearest) {
        console.log('[PIGLET DEBUG] No piglet within ' + nearestDist + ' units');
        return false;
    }

    // Start the minigame!
    startCatchMinigame(nearest);
    return true;
}

/**
 * Start the catching minigame for a specific piglet.
 */
function startCatchMinigame(piglet) {
    var ud = piglet.userData;
    catchMinigameState.active = true;
    catchMinigameState.piglet = piglet;
    catchMinigameState.caught = false;
    catchMinigameState.resultTimer = 0;

    // White zone size from piglet's catch difficulty (0.06 to 0.35)
    catchMinigameState.whiteZoneWidth = ud.catchDifficulty || 0.25;
    // Random position for white zone each attempt
    catchMinigameState.whiteZoneStart = 0.05 + Math.random() * (0.9 - catchMinigameState.whiteZoneWidth);

    // Slider speed scales with rarity (rarer = faster)
    var speedByRarity = {
        'Common': 1.2, 'Uncommon': 1.5, 'Rare': 1.9,
        'Ultra Rare': 2.4, 'Epic': 3.0, 'Godly': 3.8, 'Easter Symbol': 4.5
    };
    catchMinigameState.sliderSpeed = speedByRarity[ud.pigletRarity] || 2.0;
    catchMinigameState.sliderPos = 0;
    catchMinigameState.sliderDirection = 1;

    // Show the overlay
    var overlay = document.getElementById('piglet-catch-overlay');
    overlay.classList.add('active');

    // Set piglet info
    document.getElementById('piglet-catch-title').textContent = 'Wild ' + ud.pigletName + '!';
    var rarityEl = document.getElementById('piglet-catch-rarity');
    rarityEl.textContent = ud.pigletRarity;
    rarityEl.style.color = LAMB_RARITY_COLORS[ud.pigletRarity] || '#ffffff';

    // Position white zone
    var bar = document.getElementById('piglet-catch-bar-container');
    var whiteZone = document.getElementById('piglet-catch-white-zone');
    whiteZone.style.left = (catchMinigameState.whiteZoneStart * 100) + '%';
    whiteZone.style.width = (catchMinigameState.whiteZoneWidth * 100) + '%';

    // Reset slider and result
    document.getElementById('piglet-catch-slider').style.left = '0%';
    document.getElementById('piglet-catch-result').textContent = '';

    // Pause the game loop
    GameState.pigletMinigameActive = true;

    // Start animation
    catchMinigameAnimate();

    // Listen for Space key
    document.addEventListener('keydown', catchMinigameKeyHandler);
}

/**
 * Animate the red slider bouncing back and forth.
 */
function catchMinigameAnimate() {
    if (!catchMinigameState.active) return;

    // If showing result, count down then close
    if (catchMinigameState.resultTimer > 0) {
        catchMinigameState.resultTimer -= 0.016;
        if (catchMinigameState.resultTimer <= 0) {
            endCatchMinigame();
            return;
        }
        catchMinigameState.animFrame = requestAnimationFrame(catchMinigameAnimate);
        return;
    }

    // Move slider
    catchMinigameState.sliderPos += catchMinigameState.sliderDirection * catchMinigameState.sliderSpeed * 0.016;

    // Bounce at edges
    if (catchMinigameState.sliderPos >= 1) {
        catchMinigameState.sliderPos = 1;
        catchMinigameState.sliderDirection = -1;
    } else if (catchMinigameState.sliderPos <= 0) {
        catchMinigameState.sliderPos = 0;
        catchMinigameState.sliderDirection = 1;
    }

    // Update slider visual
    document.getElementById('piglet-catch-slider').style.left = (catchMinigameState.sliderPos * 100) + '%';

    catchMinigameState.animFrame = requestAnimationFrame(catchMinigameAnimate);
}

/**
 * Handle Space key press during catching minigame.
 */
function catchMinigameKeyHandler(e) {
    if (e.code !== 'Space' && e.key !== ' ') return;
    if (catchMinigameState.resultTimer > 0) return; // Already showing result
    e.preventDefault();

    var pos = catchMinigameState.sliderPos;
    var zoneStart = catchMinigameState.whiteZoneStart;
    var zoneEnd = zoneStart + catchMinigameState.whiteZoneWidth;

    var resultEl = document.getElementById('piglet-catch-result');

    if (pos >= zoneStart && pos <= zoneEnd) {
        // SUCCESS!
        catchMinigameState.caught = true;
        resultEl.textContent = 'CAUGHT!';
        resultEl.style.color = '#44ff44';
    } else {
        // MISS!
        catchMinigameState.caught = false;
        resultEl.textContent = 'MISSED! The piglet escaped!';
        resultEl.style.color = '#ff4444';
    }

    // Show result for 1.5 seconds then close
    catchMinigameState.resultTimer = 1.5;
}

/**
 * End the catching minigame and apply result.
 */
function endCatchMinigame() {
    catchMinigameState.active = false;
    GameState.pigletMinigameActive = false;

    // Remove key listener
    document.removeEventListener('keydown', catchMinigameKeyHandler);

    // Cancel animation
    if (catchMinigameState.animFrame) {
        cancelAnimationFrame(catchMinigameState.animFrame);
        catchMinigameState.animFrame = null;
    }

    // Hide overlay
    document.getElementById('piglet-catch-overlay').classList.remove('active');

    var piglet = catchMinigameState.piglet;
    if (!piglet) return;

    if (catchMinigameState.caught) {
        // Add to owned piglets
        var ud = piglet.userData;
        if (!GameState.ownedPiglets) GameState.ownedPiglets = [];
        GameState.ownedPiglets.push({
            id: ud.pigletType,
            name: ud.pigletName,
            rarity: ud.pigletRarity,
            color: ud.pigletColor,
            ability: ud.ability,
            abilityType: ud.abilityType,
            abilityDesc: ud.abilityDesc,
            feature: ud.feature
        });

        // Remove from world
        GameState.scene.remove(piglet);
        var idx = GameState.easterPiglets.indexOf(piglet);
        if (idx !== -1) GameState.easterPiglets.splice(idx, 1);

        var rarityCol = (typeof LAMB_RARITY_COLORS !== 'undefined' && LAMB_RARITY_COLORS[ud.pigletRarity]) || '#ffffff';
        UI.showToast(
            'Piglet Caught!',
            'You caught a <b>' + ud.pigletName + '</b> piglet! ' +
            '<span style="color:' + rarityCol + '">(' + ud.pigletRarity + ')</span><br>' +
            '<i>' + (ud.abilityDesc || '') + '</i><br>' +
            'Press <b>P</b> to open your piglet menu!'
        );
        console.log('Caught ' + ud.pigletName + '! Ability: ' + ud.abilityDesc);
        console.log('Owned piglets: ' + GameState.ownedPiglets.length);
    } else {
        // Piglet runs away fast!
        var ud2 = piglet.userData;
        ud2.state = 'fleeing';
        ud2.stateTimer = 5;
        ud2.fleeSpeed = 15; // Extra fast escape!
    }

    catchMinigameState.piglet = null;
}

/**
 * Update all Easter flamingos (AI behavior when not mounted).
 */
function updateEasterFlamingos(delta) {
    if (!GameState.easterFlamingos) return;

    // If mounted, handle flight controls instead of AI
    if (GameState.mountedFlamingo) {
        updateFlamingoFlight(delta);
        updateFlamingoAbilities(delta);
        return;
    }

    for (var i = 0; i < GameState.easterFlamingos.length; i++) {
        var flamingo = GameState.easterFlamingos[i];
        var ud = flamingo.userData;
        if (ud.isMounted) continue; // Skip mounted flamingo

        ud.stateTimer -= delta;

        // Gentle bob animation
        ud.bobPhase += delta * 2;
        flamingo.position.y = Math.sin(ud.bobPhase) * 0.05;

        // Wing idle animation (slight fold movement)
        ud.wingPhase += delta * 1.5;
        if (!ud.walkPhase) ud.walkPhase = 0;

        if (ud.state === 'idle') {
            // Legs return to resting position
            flamingo.children.forEach(function(child) {
                if (child.name === 'legLeft' || child.name === 'legRight') {
                    child.rotation.x *= 0.9; // Ease back to zero
                }
            });

            if (ud.stateTimer <= 0) {
                // Switch to wandering
                ud.state = 'wandering';
                ud.stateTimer = 3 + Math.random() * 4;
                ud.wanderDirection = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
            }
        } else if (ud.state === 'wandering') {
            // Walk slowly
            flamingo.position.x += ud.wanderDirection.x * 2 * delta;
            flamingo.position.z += ud.wanderDirection.z * 2 * delta;

            // Walking leg animation — alternate legs swinging forward/back
            ud.walkPhase += delta * 5;
            var legSwing = Math.sin(ud.walkPhase) * 0.35;
            flamingo.children.forEach(function(child) {
                if (child.name === 'legRight') {
                    child.rotation.x = legSwing;
                } else if (child.name === 'legLeft') {
                    child.rotation.x = -legSwing;
                }
            });

            // Face movement direction
            var targetRot = -Math.atan2(ud.wanderDirection.z, ud.wanderDirection.x);
            flamingo.rotation.y += (targetRot - flamingo.rotation.y) * 0.1;

            // Stay near home tree (within 15 units)
            if (ud.homeTree) {
                var dx = flamingo.position.x - ud.homeTree.position.x;
                var dz = flamingo.position.z - ud.homeTree.position.z;
                var distFromHome = Math.sqrt(dx * dx + dz * dz);
                if (distFromHome > 15) {
                    // Turn back toward home
                    ud.wanderDirection.set(-dx, 0, -dz).normalize();
                }
            }

            if (ud.stateTimer <= 0) {
                ud.state = 'idle';
                ud.stateTimer = 3 + Math.random() * 5;
            }
        }
    }
}

/**
 * Try to mount the nearest flamingo (called when E is pressed).
 */
function tryMountFlamingo() {
    if (!GameState.peccary || !GameState.easterFlamingos) return false;
    if (GameState.mountedFlamingo) return false;

    // First check if there's even a flamingo nearby before checking license
    var playerPos = GameState.peccary.position;
    var nearest = null;
    var nearestDist = 5; // Must be within 5 units

    for (var j = 0; j < GameState.easterFlamingos.length; j++) {
        var flamingo = GameState.easterFlamingos[j];
        if (flamingo.userData.isMounted) continue;
        var dist = playerPos.distanceTo(flamingo.position);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = flamingo;
        }
    }

    if (!nearest) return false;

    // Check for license only when a flamingo IS nearby
    if (!GameState.hasFlamingoLicense) {
        var hasLicense = false;
        if (GameState.inventoryItems) {
            for (var i = 0; i < GameState.inventoryItems.length; i++) {
                if (GameState.inventoryItems[i].id === 'flamingo_license') {
                    hasLicense = true;
                    break;
                }
            }
        }
        if (hasLicense) {
            GameState.hasFlamingoLicense = true;
        } else {
            UI.showToast('No License!', 'Buy a Flamingo Riding License from Clover for 50 chocolate eggs!');
            return true; // Consume the E press
        }
    }

    // Mount!
    mountFlamingo(nearest);
    return true;
}

/**
 * Mount a flamingo.
 */
function mountFlamingo(flamingo) {
    GameState.mountedFlamingo = flamingo;
    flamingo.userData.isMounted = true;
    GameState.isFlamingoFlying = true;
    GameState.flamingoFlyHeight = flamingo.position.y;

    // Hide Pedro (he's "on" the flamingo)
    if (GameState.peccary) {
        GameState.peccary.visible = false;
    }

    // Tuck legs back for flight
    flamingo.children.forEach(function(child) {
        if (child.name === 'legLeft' || child.name === 'legRight') {
            child.rotation.x = -0.6; // Legs trail behind
        }
    });

    var fName = flamingo.userData.flamingoName || 'Flamingo';
    UI.showToast('Mounted ' + fName + '!', 'WASD to fly, Space=up, Shift=down, E=dismount');

    // Show abilities
    var abilities = flamingo.userData.abilities || [];
    if (abilities.length > 0) {
        var abilityNames = [];
        if (abilities.indexOf('petal_trail') !== -1) abilityNames.push('Petal Trail');
        if (abilities.indexOf('egg_radar') !== -1) abilityNames.push('Egg Radar');
        if (abilities.indexOf('score_boost') !== -1) abilityNames.push('2x Score');
        if (abilities.indexOf('fear_aura') !== -1) abilityNames.push('Fear Aura');
        UI.showToast('Abilities Active', abilityNames.join(', '));
    }
}

/**
 * Dismount from the current flamingo.
 */
function dismountFlamingo() {
    if (!GameState.mountedFlamingo) return;

    var flamingo = GameState.mountedFlamingo;

    // If high in the air, descend to ground first
    if (flamingo.position.y > 1) {
        // Instant land for now (smooth landing would need async)
        flamingo.position.y = 0;
    }

    flamingo.userData.isMounted = false;
    GameState.mountedFlamingo = null;
    GameState.isFlamingoFlying = false;
    GameState.flamingoFlyHeight = 0;

    // Untuck legs (back to standing)
    flamingo.children.forEach(function(child) {
        if (child.name === 'legLeft' || child.name === 'legRight') {
            child.rotation.x = 0;
        }
    });

    // Show Pedro next to the flamingo
    if (GameState.peccary) {
        GameState.peccary.visible = true;
        GameState.peccary.position.set(
            flamingo.position.x + 2,
            0,
            flamingo.position.z
        );
    }

    // Land companion piglets near Pedro
    if (GameState.activePiglets) {
        for (var cp = 0; cp < GameState.activePiglets.length; cp++) {
            var comp = GameState.activePiglets[cp];
            comp.position.set(
                flamingo.position.x + (Math.random() - 0.5) * 5,
                0,
                flamingo.position.z + (Math.random() - 0.5) * 5
            );
        }
    }

    UI.showToast('Dismounted!', 'The flamingo will wait here for you.');
}

/**
 * Handle flamingo flight controls (called every frame while mounted).
 */
function updateFlamingoFlight(delta) {
    var flamingo = GameState.mountedFlamingo;
    if (!flamingo) return;

    var ud = flamingo.userData;
    var flySpeed = ud.flySpeed || 24;
    var moveSpeed = flySpeed;

    // Movement direction (camera-relative using cameraAngle)
    var rawDir = new THREE.Vector3();
    if (GameState.keys['w'] || GameState.keys['arrowup']) rawDir.z -= 1;
    if (GameState.keys['s'] || GameState.keys['arrowdown']) rawDir.z += 1;
    if (GameState.keys['a'] || GameState.keys['arrowleft']) rawDir.x -= 1;
    if (GameState.keys['d'] || GameState.keys['arrowright']) rawDir.x += 1;

    // Vertical movement
    var verticalSpeed = 12;
    if (GameState.keys[' ']) {
        // Ascend
        flamingo.position.y += verticalSpeed * delta;
        if (flamingo.position.y > 80) flamingo.position.y = 80; // Max altitude
    }
    if (GameState.keys['shift']) {
        // Descend
        flamingo.position.y -= verticalSpeed * delta;
        if (flamingo.position.y < 0) flamingo.position.y = 0; // Ground level
    }

    if (rawDir.length() > 0) {
        rawDir.normalize();

        // Rotate input by camera angle
        var angle = GameState.cameraAngle;
        var direction = new THREE.Vector3(
            rawDir.x * Math.cos(angle) + rawDir.z * Math.sin(angle),
            0,
            -rawDir.x * Math.sin(angle) + rawDir.z * Math.cos(angle)
        );

        flamingo.position.x += direction.x * moveSpeed * delta;
        flamingo.position.z += direction.z * moveSpeed * delta;

        // Rotate flamingo to face direction
        var targetRot = -Math.atan2(direction.z, direction.x);
        flamingo.rotation.y += (targetRot - flamingo.rotation.y) * 0.15;

        // Wing flap animation when moving
        ud.wingPhase += delta * 8;
        var wingAngle = Math.sin(ud.wingPhase) * 0.3;
        flamingo.children.forEach(function(child) {
            if (child.name === 'wingRight' || child.name === 'wingTipRight') {
                child.rotation.x = -wingAngle;
            } else if (child.name === 'wingLeft' || child.name === 'wingTipLeft') {
                child.rotation.x = wingAngle;
            }
        });

        // Slight tilt when moving
        flamingo.rotation.z = direction.x * 0.1;
    } else {
        // Gentle hover wing movement
        ud.wingPhase += delta * 3;
        var hoverAngle = Math.sin(ud.wingPhase) * 0.1;
        flamingo.children.forEach(function(child) {
            if (child.name === 'wingRight' || child.name === 'wingTipRight') {
                child.rotation.x = -hoverAngle;
            } else if (child.name === 'wingLeft' || child.name === 'wingTipLeft') {
                child.rotation.x = hoverAngle;
            }
        });
        flamingo.rotation.z *= 0.95; // Return to level
    }

    // Keep Pedro's position synced (for minimap, biome checks, etc.)
    if (GameState.peccary) {
        GameState.peccary.position.copy(flamingo.position);
    }

    // World bounds (extended for Easter biome access)
    var bound = CONFIG.WORLD_SIZE * 1.5;
    flamingo.position.x = Math.max(-bound, Math.min(bound, flamingo.position.x));
    flamingo.position.z = Math.max(-bound, Math.min(bound, flamingo.position.z));

    // Check if entering Easter biome area
    checkEasterBiomeEntry(flamingo);
}

/**
 * Update flamingo abilities each frame while mounted.
 */
function updateFlamingoAbilities(delta) {
    var flamingo = GameState.mountedFlamingo;
    if (!flamingo) return;

    var abilities = flamingo.userData.abilities || [];

    // Petal trail — drop petals from the sky while flying
    if (abilities.indexOf('petal_trail') !== -1 && flamingo.position.y > 2) {
        flamingo.userData.trailTimer = (flamingo.userData.trailTimer || 0) - delta;
        if (flamingo.userData.trailTimer <= 0) {
            flamingo.userData.trailTimer = 0.1;
            // Drop a falling petal
            var petalColors = [0xFF69B4, 0xFFB6C1, 0xFF1493, 0xFFCCDD];
            var petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];
            var petalGeo = new THREE.SphereGeometry(0.15, 4, 4);
            var petalMat = new THREE.MeshStandardMaterial({ color: petalColor, transparent: true, opacity: 0.8 });
            var petal = new THREE.Mesh(petalGeo, petalMat);
            petal.scale.set(1.5, 0.3, 1.0);
            petal.position.set(
                flamingo.position.x + (Math.random() - 0.5) * 2,
                flamingo.position.y - 1,
                flamingo.position.z + (Math.random() - 0.5) * 2
            );
            petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            GameState.scene.add(petal);
            GameState.petalTrails.push({
                mesh: petal,
                lifetime: 5,
                velocityY: -3 - Math.random() * 2,
                velocityX: (Math.random() - 0.5) * 1.5,
                velocityZ: (Math.random() - 0.5) * 1.5,
                rotSpeed: Math.random() * 2
            });
        }
    }

    // Egg radar — make nearby Easter eggs glow
    if (abilities.indexOf('egg_radar') !== -1) {
        var radarRange = 30;
        for (var i = 0; i < GameState.resources.length; i++) {
            var res = GameState.resources[i];
            if (res && res.isEasterEgg) {
                var dist = flamingo.position.distanceTo(res.position);
                if (dist < radarRange) {
                    // Make egg glow by boosting emissive
                    if (res.material && !res.userData.radarGlowing) {
                        res.userData.radarGlowing = true;
                        res.userData.origEmissive = res.material.emissive ? res.material.emissive.getHex() : 0;
                        res.material.emissive = new THREE.Color(0xFFD700);
                        res.material.emissiveIntensity = 1.0;
                    }
                } else if (res.userData && res.userData.radarGlowing) {
                    res.material.emissive = new THREE.Color(res.userData.origEmissive || 0);
                    res.material.emissiveIntensity = 0;
                    res.userData.radarGlowing = false;
                }
            }
        }
        // Also check decorated eggs in nests
        if (GameState.nests) {
            for (var n = 0; n < GameState.nests.length; n++) {
                var nest = GameState.nests[n];
                if (nest.egg && nest.egg.isEasterEgg && nest.egg.mesh) {
                    var eDist = flamingo.position.distanceTo(nest.egg.mesh.position);
                    if (eDist < radarRange && !nest.egg.radarGlowing) {
                        nest.egg.radarGlowing = true;
                        if (nest.egg.mesh.material) {
                            nest.egg.mesh.material.emissive = new THREE.Color(0xFFD700);
                            nest.egg.mesh.material.emissiveIntensity = 1.0;
                        }
                    } else if (eDist >= radarRange && nest.egg.radarGlowing) {
                        nest.egg.radarGlowing = false;
                        if (nest.egg.mesh.material) {
                            nest.egg.mesh.material.emissive = new THREE.Color(0);
                            nest.egg.mesh.material.emissiveIntensity = 0;
                        }
                    }
                }
            }
        }
    }

    // Fear aura — nearby enemies flee (Blood flamingo only)
    if (abilities.indexOf('fear_aura') !== -1) {
        var fearRange = 25;
        for (var e = 0; e < GameState.enemies.length; e++) {
            var enemy = GameState.enemies[e];
            if (!enemy || !enemy.position) continue;
            var eDist2 = flamingo.position.distanceTo(enemy.position);
            if (eDist2 < fearRange) {
                // Push enemy away from flamingo
                var fleeDir = new THREE.Vector3()
                    .subVectors(enemy.position, flamingo.position)
                    .normalize();
                enemy.position.x += fleeDir.x * 15 * delta;
                enemy.position.z += fleeDir.z * 15 * delta;
                // Override state to fleeing if possible
                if (enemy.userData) {
                    enemy.userData.state = 'fleeing';
                    enemy.userData.fleeTimer = 3;
                }
            }
        }
    }
}

// ============================================================================
// EASTER BIOME
// ============================================================================
// A pink blossom paradise, accessible only by flying a flamingo.
// Located far beyond the normal map bounds (south of arboreal, high altitude path).
// The biome is a separate ground plane with its own atmosphere.
// ============================================================================

var easterBiomeCreated = false;
var easterBiomeObjects = []; // Track all objects for cleanup

/**
 * Check if the flamingo has flown to the Easter biome entry zone.
 */
function checkEasterBiomeEntry(flamingo) {
    // Easter biome is far west (x < -WORLD_SIZE * 1.0) and at altitude > 15
    var entryX = -CONFIG.WORLD_SIZE * 1.0;
    if (flamingo.position.x < entryX && flamingo.position.y > 15) {
        if (!easterBiomeCreated) {
            createEasterBiome();
            UI.showToast('Easter Paradise Found!', 'Welcome to the Easter Biome! A magical blossom paradise!');
        }
    }

    // Track whether player is in the Easter biome area
    var biomeWestEdge = -CONFIG.WORLD_SIZE * 0.9;
    if (easterBiomeCreated && flamingo.position.x < biomeWestEdge) {
        GameState.inEasterBiome = true;
    } else if (GameState.inEasterBiome && flamingo.position.x > -CONFIG.WORLD_SIZE * 0.7) {
        GameState.inEasterBiome = false;
    }
}

/**
 * Create the Easter biome — a pink blossom paradise.
 */
function createEasterBiome() {
    if (easterBiomeCreated) return;
    easterBiomeCreated = true;
    GameState.inEasterBiome = true;

    var biomeCenter = new THREE.Vector3(-CONFIG.WORLD_SIZE * 1.5, 0, 0);
    var biomeSize = CONFIG.WORLD_SIZE * 0.8;

    // Pink ground plane
    var groundGeo = new THREE.PlaneGeometry(biomeSize * 2, biomeSize * 2, 30, 30);
    var groundMat = new THREE.MeshStandardMaterial({
        color: 0xFFE4E1, // Misty rose pink
        roughness: 0.9
    });
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(biomeCenter.x, -0.01, biomeCenter.z);
    ground.receiveShadow = true;
    GameState.scene.add(ground);
    easterBiomeObjects.push(ground);

    // Cherry blossom trees (lots of them!)
    var treeCount = 25 + Math.floor(Math.random() * 10);
    for (var t = 0; t < treeCount; t++) {
        var tx = biomeCenter.x + (Math.random() - 0.5) * biomeSize * 1.5;
        var tz = biomeCenter.z + (Math.random() - 0.5) * biomeSize * 1.5;
        var tree = buildCherryBlossomTree();
        tree.position.set(tx, 0, tz);
        tree.scale.set(0.8 + Math.random() * 0.5, 0.8 + Math.random() * 0.5, 0.8 + Math.random() * 0.5);
        GameState.scene.add(tree);
        easterBiomeObjects.push(tree);

        // Petal system for each tree
        var petals = createPetalSystem(tree.position);
        GameState.scene.add(petals);
        GameState.easterPetalSystems.push(petals);
        easterBiomeObjects.push(petals);
    }

    // Pink flower patches on the ground
    for (var f = 0; f < 60; f++) {
        var fx = biomeCenter.x + (Math.random() - 0.5) * biomeSize * 1.5;
        var fz = biomeCenter.z + (Math.random() - 0.5) * biomeSize * 1.5;
        var flowerColors = [0xFF69B4, 0xFFB6C1, 0xFF1493, 0xFFC0CB, 0xFFCCDD, 0xC4A7E7, 0x98FB98];
        var flower = new THREE.Mesh(
            new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 6, 4),
            new THREE.MeshStandardMaterial({ color: flowerColors[Math.floor(Math.random() * flowerColors.length)] })
        );
        flower.position.set(fx, 0.15, fz);
        flower.scale.set(1, 0.4, 1);
        GameState.scene.add(flower);
        easterBiomeObjects.push(flower);
    }

    // Soft pink fog for the biome
    // (We don't change global fog — just add a visual hint with a pink ambient light)
    var pinkLight = new THREE.PointLight(0xFF69B4, 0.5, biomeSize * 2);
    pinkLight.position.set(biomeCenter.x, 30, biomeCenter.z);
    GameState.scene.add(pinkLight);
    easterBiomeObjects.push(pinkLight);

    // Spawn some sheep in the Easter biome
    for (var s = 0; s < 6; s++) {
        var sx = biomeCenter.x + (Math.random() - 0.5) * biomeSize;
        var sz = biomeCenter.z + (Math.random() - 0.5) * biomeSize;
        var lambData = pickRandomLambColor();
        var gender = LAMB_GENDERS[lambData.id] || 'female';
        var sheep = buildSheepModel(lambData.color, gender);
        sheep.position.set(sx, 0, sz);
        sheep.userData = {
            isSheep: true,
            sheepColorId: lambData.id,
            sheepColorName: lambData.name,
            sheepRarity: lambData.rarity,
            sheepColor: lambData.color,
            gender: gender,
            rarityRank: LAMB_RARITY_RANK[lambData.rarity] || 1,
            state: 'idle',
            stateTimer: 2 + Math.random() * 3,
            wanderDirection: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
            speed: 3,
            herdId: null,
            isLeader: false,
            isMating: false,
            mateTarget: null,
            isPregnant: false,
            pregnancyTimer: 0,
            matingCooldown: 0,
            isBlossom: lambData.id === 'blossom',
            trailTimer: 0
        };
        GameState.scene.add(sheep);
        GameState.easterSheep.push(sheep);
        assignSheepToHerd(sheep);
    }

    // Spawn a few more flamingos in the Easter biome
    if (EASTER_FLAMINGO_TYPES) {
        var biomeFlamingos = EASTER_FLAMINGO_TYPES.filter(function(f) { return f.spawnWeight > 0; });
        for (var bf = 0; bf < 3; bf++) {
            var fData = biomeFlamingos[bf % biomeFlamingos.length];
            var bfx = biomeCenter.x + (Math.random() - 0.5) * biomeSize;
            var bfz = biomeCenter.z + (Math.random() - 0.5) * biomeSize;
            var bfModel = buildFlamingoModel(fData);
            bfModel.position.set(bfx, 0, bfz);
            bfModel.rotation.y = Math.random() * Math.PI * 2;
            bfModel.userData = {
                isFlamingo: true,
                flamingoType: fData.id,
                flamingoName: fData.name,
                speed: fData.speed,
                flySpeed: fData.flySpeed,
                abilities: fData.abilities.slice(),
                description: fData.description,
                state: 'idle',
                stateTimer: 2 + Math.random() * 4,
                wanderDirection: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                homeTree: easterBiomeObjects[1 + Math.floor(Math.random() * treeCount)],
                bobPhase: Math.random() * Math.PI * 2,
                wingPhase: 0,
                isMounted: false
            };
            GameState.scene.add(bfModel);
            GameState.easterFlamingos.push(bfModel);
            easterBiomeObjects.push(bfModel);
        }
    }

    // Spawn Larry the Lamb — chef NPC at the center of Easter biome
    var larry = buildLarryModel();
    larry.position.set(biomeCenter.x, 0, biomeCenter.z + 5);
    larry.rotation.y = 0;
    larry.userData = {
        type: 'villager',
        name: 'Larry',
        role: 'Easter Chef & Egg Merchant',
        interactRange: 6,
        conversationTree: buildLarryDialog()
    };
    GameState.scene.add(larry);
    GameState.villagers.push(larry);
    GameState.easterNPCs.push(larry);
    easterBiomeObjects.push(larry);

    // Small cooking stall for Larry
    var larryStall = buildEasterStall(0xFFD700);
    larryStall.position.set(biomeCenter.x, 0, biomeCenter.z + 7);
    larryStall.rotation.y = Math.PI;
    GameState.scene.add(larryStall);
    easterBiomeObjects.push(larryStall);

    console.log('Easter Biome created! A pink paradise with ' + treeCount + ' blossom trees!');
}

/**
 * Remove the Easter biome when Easter ends.
 */
function removeEasterBiome() {
    for (var i = 0; i < easterBiomeObjects.length; i++) {
        GameState.scene.remove(easterBiomeObjects[i]);
    }
    easterBiomeObjects = [];
    easterBiomeCreated = false;
    GameState.inEasterBiome = false;
}

// ============================================================================
// LARRY THE LAMB — 3D MODEL
// ============================================================================

function buildLarryModel() {
    var group = new THREE.Group();
    var model = new THREE.Group();

    var woolMat = new THREE.MeshStandardMaterial({ color: 0xFFF8DC }); // Creamy wool
    var skinMat = new THREE.MeshStandardMaterial({ color: 0xFFE4C4 }); // Bisque skin
    var apronMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White apron
    var chefMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White chef hat

    // Woolly body
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), woolMat);
    body.scale.set(1, 1.1, 0.95);
    body.position.y = 1.3;
    body.castShadow = true;
    model.add(body);

    // Wool texture bumps (little spheres on body for woolly look)
    for (var wb = 0; wb < 12; wb++) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.random() * Math.PI * 0.8 + 0.3;
        var bump = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 6, 6),
            woolMat
        );
        bump.position.set(
            Math.sin(phi) * Math.cos(theta) * 0.8,
            1.3 + Math.cos(phi) * 0.85,
            Math.sin(phi) * Math.sin(theta) * 0.75
        );
        model.add(bump);
    }

    // Chest (upper body)
    var chest = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), woolMat);
    chest.position.y = 2.1;
    chest.castShadow = true;
    model.add(chest);

    // Apron (flat box in front of body)
    var apron = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.1), apronMat);
    apron.position.set(0, 1.3, 0.65);
    model.add(apron);

    // Apron strap
    var strapMat = new THREE.MeshStandardMaterial({ color: 0xDDDDDD });
    var strap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), strapMat);
    strap.position.set(-0.3, 2.0, 0.5);
    model.add(strap);
    var strap2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), strapMat);
    strap2.position.set(0.3, 2.0, 0.5);
    model.add(strap2);

    // Head (lamb-like, slightly elongated)
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), skinMat);
    head.scale.set(1, 1.1, 1.05);
    head.position.y = 2.85;
    head.castShadow = true;
    model.add(head);

    // Woolly hair on top of head
    for (var wh = 0; wh < 8; wh++) {
        var hairBump = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 6, 6),
            woolMat
        );
        hairBump.position.set(
            (Math.random() - 0.5) * 0.3,
            3.1 + Math.random() * 0.15,
            (Math.random() - 0.5) * 0.3
        );
        model.add(hairBump);
    }

    // Chef hat!
    var hatBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.1, 16), chefMat);
    hatBase.position.y = 3.3;
    model.add(hatBase);
    var hatPuff = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), chefMat);
    hatPuff.scale.set(1, 1.5, 1);
    hatPuff.position.y = 3.6;
    model.add(hatPuff);

    // Snout (small lamb nose)
    var snout = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        skinMat
    );
    snout.scale.set(1.2, 0.8, 1);
    snout.position.set(0, 2.7, 0.45);
    model.add(snout);

    // Pink nose tip
    var noseMat = new THREE.MeshStandardMaterial({ color: 0xFFAAAA });
    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), noseMat);
    nose.position.set(0, 2.7, 0.58);
    model.add(nose);

    // Eyes
    var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a });
    [-0.16, 0.16].forEach(function(offset) {
        var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeWhiteMat);
        eyeWhite.position.set(offset, 2.95, 0.35);
        model.add(eyeWhite);
        var eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
        eye.position.set(offset, 2.95, 0.41);
        model.add(eye);
    });

    // Floppy lamb ears (hanging down)
    [-0.35, 0.35].forEach(function(offset) {
        var earGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.35, 8);
        var ear = new THREE.Mesh(earGeo, skinMat);
        ear.position.set(offset, 2.7, 0);
        ear.rotation.z = offset > 0 ? -1.2 : 1.2; // Floppy!
        ear.rotation.x = 0.2;
        model.add(ear);
    });

    // Arms
    var outfitMat2 = new THREE.MeshStandardMaterial({ color: 0xDEB887 }); // Tan sleeves
    [-0.7, 0.7].forEach(function(offset) {
        var upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.45, 8), outfitMat2);
        upperArm.position.set(offset, 1.9, 0);
        upperArm.rotation.z = offset > 0 ? -0.3 : 0.3;
        model.add(upperArm);

        var lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 8), skinMat);
        lowerArm.position.set(offset * 1.15, 1.55, 0);
        model.add(lowerArm);

        var hoofMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
        var hoof = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), hoofMat);
        hoof.position.set(offset * 1.15, 1.35, 0);
        model.add(hoof);
    });

    // Legs
    [-0.3, 0.3].forEach(function(offset) {
        var upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.45, 8), woolMat);
        upperLeg.position.set(offset, 0.65, 0);
        model.add(upperLeg);

        var lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8), skinMat);
        lowerLeg.position.set(offset, 0.32, 0);
        model.add(lowerLeg);

        var footMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
        var foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.25), footMat);
        foot.position.set(offset, 0.08, 0.03);
        model.add(foot);
    });

    // Little fluffy tail
    var tail = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), woolMat);
    tail.position.set(0, 1.1, -0.75);
    model.add(tail);

    // Wooden spoon in right hand!
    var spoonMat = new THREE.MeshStandardMaterial({ color: 0x8B6914 });
    var spoonHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), spoonMat);
    spoonHandle.position.set(0.85, 1.6, 0.15);
    spoonHandle.rotation.z = -0.5;
    model.add(spoonHandle);
    var spoonBowl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), spoonMat);
    spoonBowl.scale.set(1, 0.5, 1);
    spoonBowl.position.set(1.05, 1.9, 0.15);
    model.add(spoonBowl);

    group.add(model);
    return group;
}

// ============================================================================
// LARRY'S DIALOG & SHOP SYSTEM
// ============================================================================

function buildLarryDialog() {
    var nodes = {};

    nodes['greeting'] = {
        text: "*Larry adjusts his chef hat* Baaa-maste! I'm Larry the Lamb, Easter's finest chef! I cook up Mystery Eggs with secret piglet recipes. What can I do for you?",
        choices: [
            { text: "Show me the Mystery Eggs!", nextNode: 'shop_open' },
            { text: "Got any quests for me?", nextNode: 'quest_check' },
            { text: "My piglet is hurt...", nextNode: 'heal_check' },
            { text: "What are Mystery Eggs?", nextNode: 'explain_eggs' },
            { text: "How many Easter Eggs do I have?", nextNode: 'check_balance' },
            { text: "Goodbye, Larry!", nextNode: null }
        ]
    };

    nodes['explain_eggs'] = {
        text: "Mystery Eggs contain baby piglets! Each egg tier has different odds of getting rare piglets. Bronze is cheap but mostly commons. Legendary? That's where the REAL magic happens! You pay with Easter Eggs — collect them by completing my quests!",
        choices: [
            { text: "I want to see the eggs!", nextNode: 'shop_open' },
            { text: "Got any quests?", nextNode: 'quest_check' },
            { text: "Goodbye!", nextNode: null }
        ]
    };

    nodes['check_balance'] = {
        text: "DYNAMIC_LARRY_BALANCE",
        choices: [
            { text: "Show me the shop!", nextNode: 'shop_open' },
            { text: "Back.", nextNode: 'greeting' }
        ]
    };

    nodes['shop_open'] = {
        text: "DYNAMIC_LARRY_SHOP",
        choices: [
            { text: "Back.", nextNode: 'greeting' }
        ]
    };

    nodes['quest_check'] = {
        text: "DYNAMIC_LARRY_QUEST",
        choices: [
            { text: "Back.", nextNode: 'greeting' }
        ]
    };

    nodes['quest_complete'] = {
        text: "DYNAMIC_LARRY_COMPLETE",
        choices: [
            { text: "Back.", nextNode: 'greeting' }
        ]
    };

    nodes['heal_check'] = {
        text: "DYNAMIC_LARRY_HEAL",
        choices: [
            { text: "Back.", nextNode: 'greeting' }
        ]
    };

    nodes['heal_confirm'] = {
        text: "DYNAMIC_LARRY_HEAL_CONFIRM",
        choices: [
            { text: "Back.", nextNode: 'greeting' }
        ]
    };

    return { startNode: 'greeting', nodes: nodes };
}

/**
 * Handle Larry's special dialog actions (shop, quests).
 * Called from the dialog system when a node has an 'action' field.
 */
function handleLarryAction(action) {
    if (action === 'open_egg_shop') {
        openEggShop();
    } else if (action === 'show_quest') {
        showLarryQuest();
    }
}

// ============================================================================
// MYSTERY EGG SHOP
// ============================================================================

function openEggShop() {
    // Close dialog first
    Dialogs.closeDialog();

    var overlay = document.getElementById('egg-shop-overlay');
    overlay.classList.add('active');
    GameState.isShopOpen = true;

    refreshEggShop();
}

function closeEggShop() {
    var overlay = document.getElementById('egg-shop-overlay');
    overlay.classList.remove('active');
    GameState.isShopOpen = false;
}

function refreshEggShop() {
    var list = document.getElementById('egg-shop-list');
    list.innerHTML = '';

    var eggs = window.PIGLET_MYSTERY_EGGS || [];
    var playerEggs = GameState.easterEggs || 0;

    document.getElementById('egg-shop-balance').textContent = playerEggs + ' Easter Eggs';

    for (var i = 0; i < eggs.length; i++) {
        var egg = eggs[i];
        var canAfford = playerEggs >= egg.price;

        var card = document.createElement('div');
        card.className = 'egg-shop-card' + (canAfford ? '' : ' too-expensive');

        // Build rarity odds text
        var oddsText = '';
        if (egg.weights) {
            var rarities = Object.keys(egg.weights);
            for (var r = 0; r < rarities.length; r++) {
                if (egg.weights[rarities[r]] > 0) {
                    oddsText += rarities[r] + ' ';
                }
            }
        }

        card.innerHTML =
            '<div class="egg-shop-icon">' + (egg.icon || '🥚') + '</div>' +
            '<div class="egg-shop-info">' +
                '<div class="egg-shop-name">' + egg.name + '</div>' +
                '<div class="egg-shop-price">' + egg.price + ' Easter Eggs</div>' +
                '<div class="egg-shop-odds">' + (egg.description || oddsText) + '</div>' +
            '</div>' +
            '<div class="egg-shop-buy-btn">' + (canAfford ? 'Buy!' : 'Not enough') + '</div>';

        if (canAfford) {
            (function(eggData) {
                card.addEventListener('click', function() {
                    buyMysteryEgg(eggData);
                });
            })(egg);
        }

        list.appendChild(card);
    }
}

function buyMysteryEgg(eggData) {
    var playerEggs = GameState.easterEggs || 0;
    if (playerEggs < eggData.price) return;

    // Deduct currency
    GameState.easterEggs -= eggData.price;

    // Roll for piglet!
    var pigletData = rollMysteryEgg(eggData.id);
    if (!pigletData) {
        UI.showToast('Empty Egg?', 'Something went wrong...');
        refreshEggShop();
        return;
    }

    // Add to collection
    if (!GameState.ownedPiglets) GameState.ownedPiglets = [];
    GameState.ownedPiglets.push({
        id: pigletData.id,
        name: pigletData.name,
        rarity: pigletData.rarity,
        color: pigletData.color,
        ability: pigletData.ability,
        abilityType: pigletData.abilityType,
        abilityDesc: pigletData.abilityDesc,
        feature: pigletData.feature
    });

    var rarityColor = (typeof LAMB_RARITY_COLORS !== 'undefined' && LAMB_RARITY_COLORS[pigletData.rarity]) || '#ffffff';
    UI.showToast('🥚 ' + pigletData.name + '!', '<span style="color:' + rarityColor + '">' + pigletData.rarity + '</span> — ' + pigletData.abilityDesc);

    console.log('Mystery Egg hatched: ' + pigletData.name + ' (' + pigletData.rarity + ')!');

    refreshEggShop();
}

// ============================================================================
// LARRY'S QUEST SYSTEM
// ============================================================================

var larryQuests = [
    {
        id: 'quest_berries',
        name: 'Berry Surprise',
        description: 'Larry needs 10 berries for his famous Easter Berry Cake!',
        requirement: { item: 'berries', count: 10 },
        reward: { easterEggs: 25, recipe: 'easter_berry_cake' },
        rewardText: '25 Easter Eggs + Easter Berry Cake recipe!'
    },
    {
        id: 'quest_mushrooms',
        name: 'Mushroom Medley',
        description: 'Larry wants 8 mushrooms for a special Easter stew.',
        requirement: { item: 'mushrooms', count: 8 },
        reward: { easterEggs: 30, recipe: 'easter_stew' },
        rewardText: '30 Easter Eggs + Easter Stew recipe!'
    },
    {
        id: 'quest_nuts',
        name: 'Nutty Delight',
        description: 'Bring Larry 12 nuts for his crunchy Easter cookies!',
        requirement: { item: 'nuts', count: 12 },
        reward: { easterEggs: 25, recipe: 'easter_cookies' },
        rewardText: '25 Easter Eggs + Easter Cookies recipe!'
    },
    {
        id: 'quest_seaweed',
        name: 'Coastal Salad',
        description: 'Larry heard seaweed makes great Easter wraps. Find 6!',
        requirement: { item: 'seaweed', count: 6 },
        reward: { easterEggs: 35, recipe: 'easter_wraps' },
        rewardText: '35 Easter Eggs + Easter Wraps recipe!'
    },
    {
        id: 'quest_eggs',
        name: 'Egg-ceptional Omelette',
        description: "Larry's masterpiece needs 5 eggs. The irony isn't lost on him.",
        requirement: { item: 'eggs', count: 5 },
        reward: { easterEggs: 40, recipe: 'easter_omelette' },
        rewardText: '40 Easter Eggs + Easter Omelette recipe!'
    }
];

function showLarryQuest() {
    Dialogs.closeDialog();

    // Find current quest
    if (!GameState.larryQuestIndex) GameState.larryQuestIndex = 0;
    if (!GameState.completedLarryQuests) GameState.completedLarryQuests = [];

    if (GameState.larryQuestIndex >= larryQuests.length) {
        UI.showToast('All Done!', "Larry has no more quests. You've completed them all!");
        return;
    }

    var quest = larryQuests[GameState.larryQuestIndex];
    var playerHas = (GameState.resourceCounts && GameState.resourceCounts[quest.requirement.item]) || 0;
    var needed = quest.requirement.count;

    if (playerHas >= needed) {
        // Complete the quest!
        GameState.resourceCounts[quest.requirement.item] -= needed;
        GameState.easterEggs = (GameState.easterEggs || 0) + quest.reward.easterEggs;
        GameState.completedLarryQuests.push(quest.id);
        GameState.larryQuestIndex++;

        UI.showToast('Quest Complete! 🎉', quest.rewardText);
        console.log('Completed Larry quest: ' + quest.name);
    } else {
        UI.showToast('📋 ' + quest.name, quest.description + ' (' + playerHas + '/' + needed + ')');
    }
}

// ============================================================================
// FLAMINGO TESTING FUNCTIONS
// ============================================================================

/**
 * Spawn a test flamingo near the player.
 */
window.spawnTestFlamingo = function(typeId) {
    if (!GameState.peccary) { console.log('Start the game first!'); return; }
    if (!EASTER_FLAMINGO_TYPES) { console.log('Easter data not loaded!'); return; }

    var fData;
    if (typeId) {
        fData = EASTER_FLAMINGO_TYPES.find(function(f) { return f.id === typeId; });
    }
    if (!fData) {
        fData = EASTER_FLAMINGO_TYPES[Math.floor(Math.random() * EASTER_FLAMINGO_TYPES.length)];
    }

    var flamingo = buildFlamingoModel(fData);
    var px = GameState.peccary.position.x + 3;
    var pz = GameState.peccary.position.z + 3;
    flamingo.position.set(px, 0, pz);
    flamingo.userData = {
        isFlamingo: true,
        flamingoType: fData.id,
        flamingoName: fData.name,
        speed: fData.speed,
        flySpeed: fData.flySpeed,
        abilities: fData.abilities.slice(),
        description: fData.description,
        state: 'idle',
        stateTimer: 3,
        wanderDirection: new THREE.Vector3(1, 0, 0),
        homeTree: null,
        bobPhase: 0,
        wingPhase: 0,
        isMounted: false
    };

    GameState.scene.add(flamingo);
    GameState.easterFlamingos.push(flamingo);
    console.log('Spawned ' + fData.name + '! Walk close and press E to mount.');
    console.log('Available types: ' + EASTER_FLAMINGO_TYPES.map(function(f) { return f.id; }).join(', '));
    UI.showToast('Test Flamingo!', fData.name + ' spawned near you!');
};

/**
 * Give the player a flamingo riding license for testing.
 */
window.giveFlamingoLicense = function() {
    GameState.hasFlamingoLicense = true;
    console.log('Flamingo riding license granted!');
    UI.showToast('License Acquired!', 'You can now ride flamingos. Press E near one!');
};

/**
 * Force-create the Easter biome for testing.
 */
window.createTestEasterBiome = function() {
    createEasterBiome();
    console.log('Easter biome created! Fly west (x < ' + (-CONFIG.WORLD_SIZE * 1.0) + ') at altitude > 15 to reach it.');
};

/**
 * Spawn a test piglet near the player.
 */
window.spawnTestPiglet = function(typeId) {
    if (!GameState.peccary) { console.log('Start the game first!'); return; }
    if (!EASTER_PIGLET_TYPES) { console.log('Easter data not loaded!'); return; }

    var pData;
    if (typeId) {
        pData = EASTER_PIGLET_TYPES.find(function(p) { return p.id === typeId; });
    }
    if (!pData) {
        pData = pickRandomWildPiglet();
    }

    if (!GameState.easterPiglets) GameState.easterPiglets = [];

    // Enable Easter event so test piglets are catchable with E key
    if (!GameState.easterEventActive) {
        GameState.easterEventActive = true;
        console.log('[TEST] Enabled easterEventActive for piglet testing');
    }

    var piglet = buildPigletModel(pData);
    var px = GameState.peccary.position.x + 3;
    var pz = GameState.peccary.position.z + 3;
    piglet.position.set(px, 0, pz);
    piglet.userData = {
        isPiglet: true,
        pigletType: pData.id,
        pigletName: pData.name,
        pigletRarity: pData.rarity,
        pigletColor: pData.color,
        ability: pData.ability,
        abilityType: pData.abilityType,
        abilityDesc: pData.abilityDesc,
        catchDifficulty: pData.catchDifficulty,
        description: pData.description,
        feature: pData.feature,
        state: 'idle',
        stateTimer: 3,
        wanderDirection: new THREE.Vector3(1, 0, 0),
        homeTree: null,
        walkPhase: 0,
        bobPhase: 0,
        isWild: true,
        fleeSpeed: 8 + Math.random() * 4,
        fleeTimer: 0
    };

    GameState.scene.add(piglet);
    GameState.easterPiglets.push(piglet);
    console.log('Spawned ' + pData.name + ' (' + pData.rarity + ')! Ability: ' + pData.abilityDesc);
    UI.showToast('Wild Piglet!', pData.name + ' (' + pData.rarity + ') appeared near you!');
};

// Test: give Easter Eggs currency
window.giveEasterEggs = function(amount) {
    GameState.easterEggs = (GameState.easterEggs || 0) + (amount || 100);
    console.log('Easter Eggs: ' + GameState.easterEggs);
    UI.showToast('Test', 'You now have ' + GameState.easterEggs + ' Easter Eggs!');
};

// Test: give owned piglet directly
window.giveTestPiglet = function(typeId) {
    var pData = EASTER_PIGLET_TYPES.find(function(p) { return p.id === typeId; });
    if (!pData) pData = EASTER_PIGLET_TYPES[Math.floor(Math.random() * EASTER_PIGLET_TYPES.length)];
    if (!GameState.ownedPiglets) GameState.ownedPiglets = [];
    GameState.ownedPiglets.push({
        id: pData.id, name: pData.name, rarity: pData.rarity, color: pData.color,
        ability: pData.ability, abilityType: pData.abilityType, abilityDesc: pData.abilityDesc, feature: pData.feature
    });
    console.log('Added ' + pData.name + ' to owned piglets! Total: ' + GameState.ownedPiglets.length);
    UI.showToast('Test', pData.name + ' added to your collection!');
};

// Quick test: give + summon a piglet in one command
window.summonTestPiglet = function(typeId) {
    window.giveTestPiglet(typeId);
    var pData = EASTER_PIGLET_TYPES.find(function(p) { return p.id === typeId; });
    if (!pData) pData = EASTER_PIGLET_TYPES[0];
    summonCompanionPiglet(pData);
};

// Test: check what buffs are active right now
window.checkPigletBuffs = function() {
    console.log('=== ACTIVE PIGLET BUFFS ===');
    console.log('Speed multiplier:', GameState.pigletBuffs.speedMultiplier);
    console.log('Hunger drain:', GameState.pigletBuffs.hungerDrainMultiplier);
    console.log('Thirst drain:', GameState.pigletBuffs.thirstDrainMultiplier);
    console.log('No fall damage:', GameState.pigletBuffs.noFallDamage);
    console.log('Bubble shield:', GameState.pigletBuffs.bubbleShieldActive);
    console.log('Lucky drops:', GameState.pigletBuffs.luckyDrops);
    console.log('Invisible:', GameState.pigletBuffs.invisible);
    console.log('Charm:', GameState.pigletBuffs.charmActive);
    console.log('Resource finder:', GameState.pigletBuffs.resourceFinderActive);
    console.log('Active piglets:', (GameState.activePiglets || []).map(function(p) {
        return p.userData.pigletName + ' (' + p.userData.ability + ')';
    }));
};

// Test: spawn a chest immediately
window.spawnChest = function() { spawnTreasureChest(); };
// Test: give yourself an eyepatch
window.giveEyepatch = function() {
    var has = GameState.inventoryItems.some(function(it) { return it.id === 'pirate_eyepatch'; });
    if (!has) {
        GameState.inventoryItems.push({
            id: 'pirate_eyepatch', name: "Pirate's Eyepatch",
            description: 'A fearsome eyepatch! Equip from hotbar, press E — non-hostile animals flee in terror.',
            effect: { type: 'item', item: 'pirate_eyepatch' }, count: 1
        });
    }
    console.log('Eyepatch added to inventory! Equip it to your hotbar and press E.');
};
// Test: skip chest timer
window.skipChestTimer = function() { GameState.chestRespawnTimer = 1; };
