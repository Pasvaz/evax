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
    resourceCounts: { berries: 0, nuts: 0, mushrooms: 0, seaweed: 0, eggs: 0 },
    pigCoins: 0,
    timeElapsed: 0,

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
        const offset = new THREE.Vector3(0, 8, 12);
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
            GameState.resourceCounts = { berries: 999, nuts: 999, mushrooms: 999, seaweed: 999, eggs: 999 };
            GameState.hasSaddle = true;  // Give saddle for riding gazella
            // Give all artifacts
            GameState.artifacts = ARTIFACTS.map(a => a.id);
            // Show testing mode indicator
            document.getElementById('testing-indicator').classList.remove('hidden');
        } else {
            // Normal mode
            GameState.pigCoins = 50;
        }

        GameState.hunger = 100;
        GameState.thirst = 100;
        GameState.dehydrationTimer = 0;
        UI.updateUI();

        GameState.gameRunning = true;

        for (let i = 0; i < 10; i++) {
            Items.spawnResource();
        }

        // Spawn geese on riverbank (friendly guardians)
        Enemies.spawnGeese(5);

        GameState.spawnIntervals.push(setInterval(() => {
            if (GameState.gameRunning) Enemies.spawnEnemy();
        }, CONFIG.ENEMY_SPAWN_RATE));

        GameState.spawnIntervals.push(setInterval(() => {
            if (GameState.gameRunning) Items.spawnResource();
        }, CONFIG.RESOURCE_SPAWN_RATE));

        setTimeout(() => {
            if (GameState.gameRunning) {
                Enemies.spawnEnemy();
                Enemies.spawnEnemy();
            }
        }, 3000);
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

        GameState.health = 100;
        GameState.hunger = 100;
        GameState.thirst = 100;
        GameState.dehydrationTimer = 0;
        GameState.score = 0;
        GameState.resourceCounts = { berries: 0, nuts: 0, mushrooms: 0, seaweed: 0, eggs: 0 };
        GameState.pigCoins = 50;
        GameState.timeElapsed = 0;

        // Clear bathroom mechanic
        GameState.poopQueue = [];
        GameState.peeQueue = [];
        GameState.poopsInWorld.forEach(p => GameState.scene.remove(p.mesh));
        GameState.poopsInWorld = [];
        GameState.peesInWorld.forEach(p => GameState.scene.remove(p.mesh));
        GameState.peesInWorld = [];
        GameState.isSquatting = false;
        GameState.drinkingTime = 0;

        // Reset biome to arboreal if in a different biome
        if (GameState.currentBiome !== 'arboreal') {
            GameState.currentBiome = 'arboreal';
            Environment.rebuildForBiome('arboreal');
            document.getElementById('biome-label').textContent = 'Arboreal Biome';
        }

        if (GameState.isCraftMenuOpen) {
            GameState.isCraftMenuOpen = false;
            document.getElementById('craft-menu').classList.add('hidden');
        }

        if (GameState.isShopOpen) {
            UI.closeShop();
        }

        GameState.enemies.forEach(e => GameState.scene.remove(e));
        GameState.resources.forEach(r => GameState.scene.remove(r));
        GameState.nests.forEach(n => {
            GameState.scene.remove(n.mesh);
            if (n.egg && n.egg.mesh) GameState.scene.remove(n.egg.mesh);
        });
        GameState.enemies = [];
        GameState.resources = [];
        GameState.nests = [];
        GameState.chasingGeese = [];

        // Respawn player in the village (safe zone)
        GameState.peccary.position.set(
            CONFIG.VILLAGE_CENTER.x,
            0,
            CONFIG.VILLAGE_CENTER.z
        );
        GameState.peccary.rotation.y = 0;

        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('ui-overlay').classList.remove('hidden');
        document.getElementById('controls-info').classList.remove('hidden');
        document.getElementById('minimap').classList.remove('hidden');
        document.getElementById('hunger-panel').classList.remove('hidden');
        document.getElementById('thirst-panel').classList.remove('hidden');

        UI.updateUI();
        GameState.gameRunning = true;

        for (let i = 0; i < 10; i++) {
            Items.spawnResource();
        }

        // Spawn geese on riverbank (friendly guardians)
        Enemies.spawnGeese(5);

        GameState.spawnIntervals.push(setInterval(() => {
            if (GameState.gameRunning) Enemies.spawnEnemy();
        }, CONFIG.ENEMY_SPAWN_RATE));

        GameState.spawnIntervals.push(setInterval(() => {
            if (GameState.gameRunning) Items.spawnResource();
        }, CONFIG.RESOURCE_SPAWN_RATE));

        setTimeout(() => {
            if (GameState.gameRunning) {
                Enemies.spawnEnemy();
                Enemies.spawnEnemy();
            }
        }, 3000);
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
     * Transition to a new biome.
     * @param {string} targetBiome - The biome ID to transition to
     * @param {string} direction - The direction of travel ('north' or 'south')
     */
    function transitionToBiome(targetBiome, direction) {
        if (GameState.isTransitioning) return;

        GameState.isTransitioning = true;
        const targetData = getBiomeData(targetBiome);

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
            } else {
                // Came from north, spawn at the very north border of new biome
                GameState.peccary.position.z = -worldSize * 0.69;
            }
            GameState.peccary.position.x = 0;

            // Reset border tracking to prevent immediate re-transition
            GameState.lastPlayerPosition.x = GameState.peccary.position.x;
            GameState.lastPlayerPosition.z = GameState.peccary.position.z;
            GameState.borderTransitionTimer = 0;
            GameState.onBorder = null;

            // Rebuild environment for new biome
            Environment.rebuildForBiome(targetBiome);

            // Update biome label
            document.getElementById('biome-label').textContent = targetData.displayName;

            // Spawn biome-specific content
            if (targetData.spawnGeese && targetData.geese > 0) {
                Enemies.spawnGeese(targetData.geese);
            }

            // Spawn leopard toads in savannah biome
            if (targetData.spawnToads && targetData.toads > 0) {
                Enemies.spawnToads(targetData.toads);
                // Reset toad mating timer for the new biome
                GameState.toadMatingTimer = 0;
            }

            // Spawn grass viper weasels in savannah biome
            if (targetData.spawnGrassVipers && targetData.grassVipers > 0) {
                Enemies.spawnGrassVipers(targetData.grassVipers);
                // Reset grass viper mating timer
                GameState.grassViperMatingTimer = 0;
            }

            // Spawn antelope herd in savannah biome
            if (targetData.spawnAntelope && targetData.antelope > 0) {
                Enemies.spawnAntelopeHerd(targetData.antelope);
                // Reset antelope mating timer
                GameState.antelopeMatingTimer = 0;
            }

            // Spawn wild dog pack in savannah biome
            if (targetData.spawnWildDogs && targetData.wildDogs > 0) {
                Enemies.spawnWildDogPack(targetData.wildDogs);
                // Reset wild dog timers
                GameState.wildDogMatingTimer = 0;
                GameState.wildDogHuntTimer = 0;
            }

            // Spawn Saltas Gazella herd in savannah biome
            if (targetData.spawnSaltasGazella && targetData.saltasGazella > 0) {
                Enemies.spawnSaltasGazellaHerd(targetData.saltasGazella);
                // Reset gazella mating timer
                GameState.saltasGazellaMatingTimer = 0;
            }

            // Spawn Dronglous Cats in savannah biome (live in acacia trees)
            if (targetData.spawnDronglousCats && targetData.dronglousCats > 0) {
                Enemies.spawnDronglousCats(targetData.dronglousCats);
                // Reset dronglous cat mating timer
                GameState.dronglousCatMatingTimer = 0;
            }

            // Spawn initial resources
            for (let i = 0; i < 10; i++) {
                Items.spawnResource();
            }

            // Spawn artifacts (small chance for each type)
            // Random artifacts - 30% chance to spawn 1-2
            if (Math.random() < 0.3) {
                Items.spawnArtifact('random');
                if (Math.random() < 0.3) Items.spawnArtifact('random');
            }
            // Hidden artifacts - 20% chance to spawn 1
            if (Math.random() < 0.2) {
                Items.spawnArtifact('hidden');
            }

            // Restart spawn intervals only for biomes that have enemies
            // For now, only arboreal biome has enemies
            if (targetBiome === 'arboreal') {
                GameState.spawnIntervals.push(setInterval(() => {
                    if (GameState.gameRunning) Enemies.spawnEnemy();
                }, CONFIG.ENEMY_SPAWN_RATE));
            }

            // Always restart resource spawning
            GameState.spawnIntervals.push(setInterval(() => {
                if (GameState.gameRunning) Items.spawnResource();
            }, CONFIG.RESOURCE_SPAWN_RATE));

            // Hide transition message
            transitionEl.style.display = 'none';
            GameState.isTransitioning = false;

        }, 3000);
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

        // Remove villagers
        GameState.villagers.forEach(v => GameState.scene.remove(v));
        GameState.villagers = [];
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
            checkBiomeTransition(delta);
            updateCamera();
            UI.updateMinimap();
            UI.updateUI();

            // Testing mode - keep resources infinite
            if (GameState.isTestingMode) {
                GameState.resourceCounts = { berries: 999, nuts: 999, mushrooms: 999, seaweed: 999, eggs: 999 };
                GameState.pigCoins = 99999;
                GameState.hunger = 100;
                GameState.thirst = 100;
            } else {
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
        }

        // Dronglous Cat update - runs in all biomes for testing
        Enemies.updateDronglousCats(delta);

        GameState.renderer.render(GameState.scene, GameState.camera);
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

            // Create game world
            Environment.setupLighting();
            Environment.createGround();
            Environment.createForest();
            Player.createPeccary();
            UI.setupMinimap();
            Inventory.init();
            ResearchHut.init();

            // Event listeners
            window.addEventListener('resize', onWindowResize);

            window.addEventListener('keydown', (e) => {
                GameState.keys[e.key.toLowerCase()] = true;
                if (e.key === ' ') e.preventDefault();

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

                if (GameState.isDialogOpen && /^[1-9]$/.test(e.key)) {
                    const optionNumber = parseInt(e.key);
                    const optionDiv = document.querySelector(`[data-option-number="${optionNumber}"]`);
                    if (optionDiv) {
                        optionDiv.click();
                    }
                }
            });

            window.addEventListener('keyup', (e) => GameState.keys[e.key.toLowerCase()] = false);

            // Start screen buttons
            document.getElementById('explore-btn').addEventListener('click', () => startGame(false));
            document.getElementById('testing-btn').addEventListener('click', showPasswordPopup);
            document.getElementById('restart-btn').addEventListener('click', restartGame);

            // Password popup buttons
            document.getElementById('password-submit').addEventListener('click', checkPassword);
            document.getElementById('password-cancel').addEventListener('click', hidePasswordPopup);
            document.getElementById('password-input').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') checkPassword();
                if (e.key === 'Escape') hidePasswordPopup();
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
     * Show the password popup for testing mode.
     */
    function showPasswordPopup() {
        document.getElementById('password-popup').classList.remove('hidden');
        document.getElementById('password-input').value = '';
        document.getElementById('password-error').classList.add('hidden');
        document.getElementById('password-input').focus();
    }

    /**
     * Hide the password popup.
     */
    function hidePasswordPopup() {
        document.getElementById('password-popup').classList.add('hidden');
        document.getElementById('password-input').value = '';
        document.getElementById('password-error').classList.add('hidden');
    }

    /**
     * Check the entered password and start testing mode if correct.
     */
    function checkPassword() {
        const input = document.getElementById('password-input').value;
        if (input === 'claude123') {
            hidePasswordPopup();
            startGame(true);  // Start in testing mode
        } else {
            document.getElementById('password-error').classList.remove('hidden');
            document.getElementById('password-input').value = '';
            document.getElementById('password-input').focus();
        }
    }

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

            const direction = new THREE.Vector3();
            if (GameState.keys['w'] || GameState.keys['arrowup']) direction.z -= 1;
            if (GameState.keys['s'] || GameState.keys['arrowdown']) direction.z += 1;
            if (GameState.keys['a'] || GameState.keys['arrowleft']) direction.x -= 1;
            if (GameState.keys['d'] || GameState.keys['arrowright']) direction.x += 1;

            if (direction.length() > 0) {
                direction.normalize();
                target.position.x += direction.x * moveSpeed * delta;
                target.position.z += direction.z * moveSpeed * delta;

                // Rotate to face direction
                const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI / 2;
                target.rotation.y = targetRotation;
            }

            // Keep in bounds
            const bound = CONFIG.WORLD_SIZE * 0.65;
            target.position.x = Math.max(-bound, Math.min(bound, target.position.x));
            target.position.z = Math.max(-bound, Math.min(bound, target.position.z));
        }

        // Both modes: camera follows target
        const offset = new THREE.Vector3(0, 8, 12);
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
        showPasswordPopup: showPasswordPopup,
        hidePasswordPopup: hidePasswordPopup,
        checkPassword: checkPassword,
        toggleTestingMenu: toggleTestingMenu,
        teleportToBiome: teleportToBiome,
        updateBecomeAnimal: updateBecomeAnimal,
        stopBecomeAnimal: stopBecomeAnimal
    };
})();
