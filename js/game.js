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
    nests: [],           // Array of nest objects
    chasingGeese: [],    // Geese currently chasing player

    // Game status
    gameRunning: false,
    health: 100,
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
    resourceKeyStates: { '1': false, '2': false, '3': false, '4': false, '5': false }
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
        }
    }

    /**
     * Handle player taking damage from an enemy.
     */
    function takeDamage(amount, enemyType) {
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

        if (GameState.isCraftMenuOpen) {
            GameState.isCraftMenuOpen = false;
            document.getElementById('craft-menu').classList.add('hidden');
        }

        if (GameState.isShopOpen) {
            UI.closeShop();
        }

        GameState.spawnIntervals.forEach(id => clearInterval(id));
        GameState.spawnIntervals = [];
    }

    /**
     * Start the game.
     */
    function startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('ui-overlay').classList.remove('hidden');
        document.getElementById('controls-info').classList.remove('hidden');
        document.getElementById('minimap').classList.remove('hidden');

        if (!GameState.audioCtx) initAudio();

        GameState.pigCoins = 50;
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
        GameState.health = 100;
        GameState.score = 0;
        GameState.resourceCounts = { berries: 0, nuts: 0, mushrooms: 0, seaweed: 0, eggs: 0 };
        GameState.pigCoins = 50;
        GameState.timeElapsed = 0;

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
     * Main game loop.
     */
    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(GameState.clock.getDelta(), 0.1);

        if (GameState.gameRunning) {
            GameState.timeElapsed += delta;
            Player.updatePlayer(delta);
            Enemies.updateEnemies(delta);
            Enemies.updateNests(delta);
            Items.updateResources(delta);
            Dialogs.updateVillagers(delta);
            updateCamera();
            UI.updateMinimap();
            UI.updateUI();
        }

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

            // Event listeners
            window.addEventListener('resize', onWindowResize);

            window.addEventListener('keydown', (e) => {
                GameState.keys[e.key.toLowerCase()] = true;
                if (e.key === ' ') e.preventDefault();

                if (e.key.toLowerCase() === 'e') {
                    if (GameState.isDialogOpen) {
                        Dialogs.advanceDialog();
                    } else if (GameState.nearbyVillager) {
                        Dialogs.openDialog(GameState.nearbyVillager);
                    }
                }

                if (e.key === 'Escape') {
                    if (GameState.isDialogOpen) {
                        Dialogs.closeDialog();
                    } else if (GameState.isShopOpen) {
                        UI.closeShop();
                    }
                }

                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (GameState.gameRunning && !GameState.isDialogOpen) {
                        Items.toggleCraftMenu();
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

            document.getElementById('start-btn').addEventListener('click', startGame);
            document.getElementById('restart-btn').addEventListener('click', restartGame);

            document.getElementById('loading').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');

            animate();

        } catch (error) {
            console.error('Game initialization error:', error);
            document.getElementById('loading').textContent = 'Error loading game: ' + error.message;
        }
    }

    // Public API
    return {
        init: init,
        playSound: playSound,
        takeDamage: takeDamage,
        startGame: startGame,
        restartGame: restartGame,
        gameOver: gameOver
    };
})();
