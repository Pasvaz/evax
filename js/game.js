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
    resourceCounts: { berries: 0, nuts: 0, mushrooms: 0, seaweed: 0, eggs: 0, arsenic_mushrooms: 0, thous_pine_wood: 0, glass: 0, manglecacia_wood: 0, seaspray_birch_wood: 0, cinnamon: 0 },
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
    becomeAnimalOriginalPos: null // Peccary's position before becoming
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

        GameState.health -= amount;
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
        // Camera orbits the player based on cameraAngle
        const distance = 12;
        const height = 8;
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
     * Game over handler.
     */
    function gameOver() {
        GameState.gameRunning = false;
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('final-score').textContent = 'Score: ' + GameState.score;

        document.getElementById('ui-overlay').classList.add('hidden');
        document.getElementById('controls-info').classList.add('hidden');
        document.getElementById('minimap').classList.add('hidden');
        document.getElementById('hunger-panel').classList.add('hidden');
        document.getElementById('thirst-panel').classList.add('hidden');
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

        if (!GameState.audioCtx) initAudio();

        // Set testing mode flag
        GameState.isTestingMode = testingMode;

        if (testingMode) {
            // Testing mode - infinite resources and coins
            GameState.pigCoins = 99999;
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
        if (!GameState.artifactsGiven) GameState.artifactsGiven = [];
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
        GameState.dehydrationTimer = 0;
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

        UI.updateUI();
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

            // Spawn all biome-specific content (animals, resources, intervals)
            spawnBiomeContent(targetBiome);

            // Hide transition message
            transitionEl.style.display = 'none';
            GameState.isTransitioning = false;

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

            GameState.timeElapsed += delta;

            // Handle become animal mode
            if (GameState.becomeAnimalMode) {
                updateBecomeAnimal(delta);
            } else {
                Player.updatePlayer(delta);
            }
            Enemies.updateEnemies(delta);
            Enemies.updateNests(delta);
            Items.updateResources(delta);
            Items.updateArtifacts(delta);
            Dialogs.updateVillagers(delta);
            updateSnowParticles(delta);
            Environment.updateGrassTufts(delta);
            updatePuddles(delta);
            checkBiomeTransition(delta);
            updateCamera();
            UI.updateMinimap();
            UI.updateUI();

            // Testing mode - keep resources infinite
            if (GameState.isTestingMode) {
                GameState.resourceCounts = { berries: 999, nuts: 999, mushrooms: 999, seaweed: 999, eggs: 999, arsenic_mushrooms: 999, thous_pine_wood: 999, glass: 999, manglecacia_wood: 999, seaspray_birch_wood: 999, cinnamon: 999 };
                GameState.pigCoins = 99999;
                GameState.hunger = 100;
                GameState.thirst = 100;
            }

            // --- Non-testing-only: hunger/thirst drain ---
            if (!GameState.isTestingMode) {
                // Normal mode - hunger/thirst decrease over time
                // Hunger decreases slowly over time (about 1 point every 6 seconds)
                GameState.hunger = Math.max(0, GameState.hunger - delta * 0.17);

                // Thirst decreases slower than hunger
                GameState.thirst = Math.max(0, GameState.thirst - delta * 0.12);

                // Dehydration damage - lose 5 health every 10 seconds when thirst is 0
                if (GameState.thirst <= 0) {
                    GameState.dehydrationTimer += delta;
                    if (GameState.dehydrationTimer >= 10) {
                        GameState.dehydrationTimer = 0;
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
            UI.setupMinimap();
            Inventory.init();
            ResearchHut.init();

            // Event listeners
            window.addEventListener('resize', onWindowResize);

            window.addEventListener('keydown', (e) => {
                GameState.keys[e.key.toLowerCase()] = true;
                if (e.key === ' ') e.preventDefault();

                // Escape — also closes saves modal
                if (e.key === 'Escape' && !document.getElementById('saves-modal').classList.contains('hidden')) {
                    closeSavesModal();
                    return;
                }

                if (e.key.toLowerCase() === 'e') {
                    // Handle interactions based on context
                    if (GameState.isInsideHut) {
                        // Inside hut - handle hut interactions
                        ResearchHut.handleInteraction();
                    } else if (GameState.isDialogOpen) {
                        Dialogs.advanceDialog();
                    } else if (GameState.nearbyVillager) {
                        Dialogs.openDialog(GameState.nearbyVillager);
                    } else if (ResearchHut.checkEnterHut()) {
                        // Near research hut entrance
                        ResearchHut.enterHut();
                    }
                }

                if (e.key === 'Escape') {
                    if (GameState.isDialogOpen) {
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

                // I key - Inventory & Bestiary
                if (e.key.toLowerCase() === 'i') {
                    if (GameState.gameRunning && !GameState.isDialogOpen && !GameState.isCraftMenuOpen && !GameState.isShopOpen) {
                        Inventory.toggle();
                    }
                }

                // T key - Testing Menu (only in testing mode)
                if (e.key.toLowerCase() === 't') {
                    if (GameState.isTestingMode && GameState.gameRunning && !GameState.isDialogOpen && !GameState.isInsideHut) {
                        toggleTestingMenu();
                    }
                }

                // Number keys: hotbar selection (when not in dialog/menu)
                if (/^[1-9]$/.test(e.key) && !GameState.isDialogOpen && !GameState.isShopOpen && !GameState.isInventoryOpen && !GameState.isCraftMenuOpen) {
                    GameState.selectedHotbarSlot = parseInt(e.key) - 1;
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
                if (!GameState.cameraDragging) return;
                const deltaX = e.clientX - GameState.cameraDragStartX;
                if (Math.abs(deltaX) > 3) GameState.cameraDragMoved = true;
                GameState.cameraAngle = GameState.cameraDragStartAngle - deltaX * 0.005;
            });

            window.addEventListener('mouseup', () => {
                GameState.cameraDragging = false;
            });

            // Start screen buttons
            document.getElementById('new-game-btn').addEventListener('click', () => {
                startGame(false);
                GameState.currentBiome = 'arboreal';
                Environment.rebuildForBiome('arboreal');
                document.getElementById('biome-label').textContent = BIOMES.arboreal.displayName;
                spawnBiomeContent('arboreal');
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

    /**
     * Handle click events for combat — sword, axe, bomb.
     * Uses TOOL_STATS to look up damage/behavior instead of hardcoding.
     */
    function onCombatClick(event) {
        if (!GameState.gameRunning) return;
        if (GameState.isDialogOpen || GameState.isCraftMenuOpen || GameState.isInventoryOpen) return;
        if (GameState.cameraDragMoved) return; // Don't attack after camera drag
        if (GameState.isInsideHut) return;

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
            // SWORD: raycast against enemies, damage from TOOL_STATS
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
                    } else {
                        showBlockedMessage('Too far away to hit!');
                    }
                }
            }
        }
        if (isAxe) {
            // AXE: raycast against trees, check compatibility, pass axeId
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

            // Keep in bounds
            const bound = CONFIG.WORLD_SIZE * 0.65;
            target.position.x = Math.max(-bound, Math.min(bound, target.position.x));
            target.position.z = Math.max(-bound, Math.min(bound, target.position.z));
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
