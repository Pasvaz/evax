/**
 * ============================================================================
 * ENEMIES MODULE - Logic File
 * ============================================================================
 *
 * This file handles enemy creation and AI behavior.
 * It reads enemy data from js/data/enemies.js (the ENEMIES array).
 *
 * You DON'T need to edit this file to add new enemies!
 * Just add them to js/data/enemies.js with a valid `type` field.
 *
 * You only need to edit this file if you want to add a NEW ANIMAL TYPE
 * (like a wolf or bear) that needs different 3D geometry.
 *
 * ============================================================================
 */

window.Enemies = (function() {
    'use strict';

    // ========================================================================
    // MODEL BUILDERS
    // ========================================================================
    // These functions create 3D geometry for each animal type.
    // They receive colors from ANIMAL_TYPES and build the mesh.
    //
    // To add a new animal type:
    //   1. Add colors to ANIMAL_TYPES in js/data/enemies.js
    //   2. Add a builder function here (e.g., buildWolfModel)
    //   3. Register it in modelBuilders below

    /**
     * Build a badger 3D model.
     * Badgers are chunky with white face stripes and red eyes.
     *
     * @param {Object} colors - Color values from ANIMAL_TYPES.badger.colors
     * @returns {THREE.Group} - The badger model
     */
    function buildBadgerModel(colors) {
        const model = new THREE.Group();

        // Materials from data colors
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body });
        const stripeMat = new THREE.MeshStandardMaterial({ color: colors.stripes });
        const snoutMat = new THREE.MeshStandardMaterial({ color: colors.snout });
        const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes, emissive: colors.eyeGlow });
        const legMat = new THREE.MeshStandardMaterial({ color: colors.legs });

        // Body (cylinder on its side)
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1, 16);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.5;
        body.castShadow = true;
        model.add(body);

        // Body caps (spheres at each end)
        const capGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const frontCap = new THREE.Mesh(capGeo, bodyMat);
        frontCap.position.set(0.5, 0.5, 0);
        model.add(frontCap);
        const backCap = new THREE.Mesh(capGeo, bodyMat);
        backCap.position.set(-0.5, 0.5, 0);
        model.add(backCap);

        // Head
        const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0.9, 0.55, 0);
        head.scale.set(1.1, 0.9, 0.9);
        model.add(head);

        // White stripes on face
        [-0.12, 0.12].forEach(zPos => {
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.1), stripeMat);
            stripe.position.set(1.0, 0.6, zPos);
            model.add(stripe);
        });

        // Black stripe in middle
        const blackStripe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.08), bodyMat);
        blackStripe.position.set(1.0, 0.65, 0);
        model.add(blackStripe);

        // Snout
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), snoutMat);
        snout.position.set(1.2, 0.45, 0);
        snout.scale.set(1.2, 0.8, 0.9);
        model.add(snout);

        // Eyes (red, menacing)
        [-0.12, 0.12].forEach(zPos => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
            eye.position.set(1.1, 0.6, zPos);
            model.add(eye);
        });

        // Legs (short and stubby)
        [[0.4, 0.2, 0.25], [0.4, 0.2, -0.25], [-0.4, 0.2, 0.25], [-0.4, 0.2, -0.25]].forEach(pos => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8), legMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            model.add(leg);
        });

        // Flip model to face forward
        model.rotation.y = Math.PI;

        return model;
    }

    /**
     * Build a weasel 3D model.
     * Weasels are long and thin with yellow eyes.
     *
     * @param {Object} colors - Color values from ANIMAL_TYPES.weasel.colors
     * @returns {THREE.Group} - The weasel model
     */
    function buildWeaselModel(colors) {
        const model = new THREE.Group();

        // Materials from data colors
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body });
        const snoutMat = new THREE.MeshStandardMaterial({ color: colors.snout });
        const noseMat = new THREE.MeshStandardMaterial({ color: colors.nose });
        const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes, emissive: colors.eyeGlow });
        const earMat = new THREE.MeshStandardMaterial({ color: colors.ears });
        const legMat = new THREE.MeshStandardMaterial({ color: colors.legs });

        // Long body (thin cylinder)
        const bodyGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 16);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.35;
        body.castShadow = true;
        model.add(body);

        // Body caps
        const capGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const frontCap = new THREE.Mesh(capGeo, bodyMat);
        frontCap.position.set(0.6, 0.35, 0);
        model.add(frontCap);
        const backCap = new THREE.Mesh(capGeo, bodyMat);
        backCap.position.set(-0.6, 0.35, 0);
        model.add(backCap);

        // Head
        const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0.9, 0.35, 0);
        head.scale.set(1.2, 1, 0.9);
        model.add(head);

        // Snout
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), snoutMat);
        snout.position.set(1.1, 0.3, 0);
        model.add(snout);

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), noseMat);
        nose.position.set(1.18, 0.3, 0);
        model.add(nose);

        // Eyes (yellow, predatory)
        [-0.08, 0.08].forEach(zPos => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
            eye.position.set(1.0, 0.42, zPos);
            model.add(eye);
        });

        // Ears
        [-0.1, 0.1].forEach(zPos => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), earMat);
            ear.position.set(0.8, 0.5, zPos);
            model.add(ear);
        });

        // Short legs
        [[0.4, 0.15, 0.15], [0.4, 0.15, -0.15], [-0.4, 0.15, 0.15], [-0.4, 0.15, -0.15]].forEach(pos => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8), legMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            model.add(leg);
        });

        // Long tail
        const tailGeo = new THREE.CylinderGeometry(0.05, 0.03, 0.8, 8);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.rotation.z = Math.PI / 2 + 0.3;
        tail.position.set(-1, 0.4, 0);
        model.add(tail);

        // Flip model to face forward
        model.rotation.y = Math.PI;

        return model;
    }

    /**
     * Build a goose 3D model.
     * Geese are beige/white waterfowl that live on riverbanks.
     *
     * @param {Object} colors - Color values for the goose
     * @returns {THREE.Group} - The goose model
     */
    function buildGooseModel(colors) {
        const model = new THREE.Group();

        // Materials from data colors
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body });
        const beakMat = new THREE.MeshStandardMaterial({ color: colors.beak });
        const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes });
        const legMat = new THREE.MeshStandardMaterial({ color: colors.legs });
        const wingMat = new THREE.MeshStandardMaterial({ color: colors.wings || colors.body });

        // Body (oval shape)
        const bodyGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1, 0.8, 1.4);
        body.position.y = 0.5;
        body.castShadow = true;
        model.add(body);

        // Neck (curved cylinder)
        const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8);
        const neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.position.set(0.3, 0.8, 0);
        neck.rotation.z = -0.4;
        model.add(neck);

        // Head
        const headGeo = new THREE.SphereGeometry(0.15, 12, 12);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0.5, 1.1, 0);
        head.scale.set(1.2, 1, 1);
        model.add(head);

        // Beak (orange cone)
        const beakGeo = new THREE.ConeGeometry(0.06, 0.2, 8);
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.rotation.z = -Math.PI / 2;
        beak.position.set(0.7, 1.1, 0);
        model.add(beak);

        // Eyes
        [-0.06, 0.06].forEach(zPos => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
            eye.position.set(0.58, 1.15, zPos);
            model.add(eye);
        });

        // Wings (flattened spheres on sides)
        [-0.25, 0.25].forEach(zPos => {
            const wingGeo = new THREE.SphereGeometry(0.25, 8, 8);
            const wing = new THREE.Mesh(wingGeo, wingMat);
            wing.scale.set(0.8, 0.3, 1.2);
            wing.position.set(-0.05, 0.55, zPos);
            wing.rotation.x = zPos > 0 ? 0.2 : -0.2;
            model.add(wing);
        });

        // Tail feathers
        const tailGeo = new THREE.ConeGeometry(0.15, 0.3, 6);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.rotation.z = Math.PI / 2 + 0.3;
        tail.position.set(-0.5, 0.6, 0);
        model.add(tail);

        // Legs (orange)
        [[-0.05, 0.15, 0.12], [-0.05, 0.15, -0.12]].forEach(pos => {
            const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            model.add(leg);

            // Webbed foot
            const footGeo = new THREE.ConeGeometry(0.08, 0.15, 3);
            const foot = new THREE.Mesh(footGeo, legMat);
            foot.rotation.x = Math.PI / 2;
            foot.position.set(pos[0] + 0.05, 0.02, pos[2]);
            model.add(foot);
        });

        // Flip model to face forward
        model.rotation.y = Math.PI;

        return model;
    }

    // ========================================================================
    // MODEL BUILDERS REGISTRY
    // ========================================================================
    // Maps animal type names to their builder functions.
    // To add a new animal: add the builder function above, then register here.

    const modelBuilders = {
        badger: buildBadgerModel,
        weasel: buildWeaselModel,
        goose: buildGooseModel
    };

    // ========================================================================
    // GENERIC ENEMY CREATOR
    // ========================================================================
    /**
     * Create an enemy from data.
     *
     * This function:
     *   1. Gets the model builder for the enemy's type
     *   2. Builds the 3D model using colors from the enemy data
     *   3. Applies size modifier to scale the model
     *   4. Sets up userData with stats from the enemy data (including health)
     *
     * @param {Object} enemyData - Enemy definition from ENEMIES array
     * @param {number} x - Spawn X position
     * @param {number} z - Spawn Z position
     * @returns {THREE.Group} - The configured enemy
     */
    function createEnemy(enemyData, x, z) {
        const enemy = new THREE.Group();

        // Get the model builder for this animal type
        const builder = modelBuilders[enemyData.type];

        if (!builder) {
            console.warn('No model builder for type:', enemyData.type);
            return null;
        }

        // Check that colors are defined
        if (!enemyData.colors) {
            console.warn('No colors defined for enemy:', enemyData.id);
            return null;
        }

        // Build the 3D model using colors directly from enemy data
        const model = builder(enemyData.colors);

        // Apply size modifier (default to 1 if not specified)
        const size = enemyData.size || 1;
        model.scale.set(size, size, size);

        enemy.add(model);

        // Position the enemy
        enemy.position.set(x, 0, z);

        // Set up userData with stats from enemy data
        enemy.userData = {
            id: enemyData.id,
            type: enemyData.type,
            speed: enemyData.speed + Math.random() * enemyData.speedVariation,
            damage: enemyData.damage,
            radius: enemyData.radius * size,  // Scale hitbox with size
            size: size,
            health: enemyData.health || 1,    // Default to 1 if not specified
            maxHealth: enemyData.health || 1, // Track max for health bars later
            minimapColor: enemyData.minimapColor,
            // Behavior flags from data
            friendly: enemyData.friendly || false,
            attacksEnemies: enemyData.attacksEnemies || false,
            attackRange: enemyData.attackRange || 0,
            immuneToWater: enemyData.immuneToWater || false
        };

        return enemy;
    }

    // ========================================================================
    // WEIGHTED RANDOM SELECTION
    // ========================================================================
    /**
     * Pick a random enemy from the ENEMIES array, weighted by spawnWeight.
     * Higher spawnWeight = more likely to be chosen.
     *
     * @returns {Object} - An enemy definition from ENEMIES
     */
    function pickRandomEnemy() {
        // Calculate total weight
        let totalWeight = 0;
        for (let i = 0; i < ENEMIES.length; i++) {
            totalWeight += (ENEMIES[i].spawnWeight || 1);
        }

        // Pick a random point in the total weight
        let random = Math.random() * totalWeight;

        // Find which enemy that point falls into
        for (let i = 0; i < ENEMIES.length; i++) {
            const weight = ENEMIES[i].spawnWeight || 1;
            if (random < weight) {
                return ENEMIES[i];
            }
            random -= weight;
        }

        // Fallback (shouldn't happen)
        return ENEMIES[0];
    }

    // ========================================================================
    // SPAWN ENEMY
    // ========================================================================
    /**
     * Spawn a new enemy at the edge of the world.
     * Uses weighted random selection from ENEMIES array.
     */
    function spawnEnemy() {
        if (GameState.enemies.length >= CONFIG.MAX_ENEMIES) return;

        // Pick spawn position at world edge
        const angle = Math.random() * Math.PI * 2;
        const distance = CONFIG.WORLD_SIZE * 0.4 + Math.random() * 20;
        const ex = Math.cos(angle) * distance;
        const ez = Math.sin(angle) * distance;

        // Pick a random enemy type (weighted)
        const enemyData = pickRandomEnemy();

        // Create the enemy
        const enemy = createEnemy(enemyData, ex, ez);

        if (enemy) {
            GameState.enemies.push(enemy);
            GameState.scene.add(enemy);
        }
    }

    // ========================================================================
    // SPAWN GEESE ON RIVERBANK
    // ========================================================================
    /**
     * Spawn geese along the riverbank at game start.
     * Geese are friendly and attack hostile enemies that come near.
     * @param {number} count - Number of geese to spawn
     */
    function spawnGeese(count) {
        // Find goose data in ENEMIES array
        const gooseData = ENEMIES.find(e => e.id === 'goose');
        if (!gooseData) {
            console.warn('No goose enemy data found');
            return;
        }

        let spawned = 0;
        let attempts = 0;
        const maxAttempts = count * 20;

        while (spawned < count && attempts < maxAttempts) {
            attempts++;

            // Pick a random position near the river
            const worldSize = CONFIG.WORLD_SIZE;
            const x = (Math.random() - 0.5) * worldSize * 0.8;
            const z = (Math.random() - 0.5) * worldSize * 0.8;

            // Check if on riverbank (near river but not in it)
            if (Environment.isOnRiverbank && Environment.isOnRiverbank(x, z)) {
                const goose = createEnemy(gooseData, x, z);
                if (goose) {
                    // Assign unique entity ID and lifecycle state
                    goose.userData.entityId = 'goose_' + Date.now() + '_' + Math.random();
                    goose.userData.lifecycleState = 'finding_nest';
                    goose.userData.stateTimer = 0;
                    goose.userData.targetNestPos = null;
                    goose.userData.nestId = null;

                    GameState.enemies.push(goose);
                    GameState.scene.add(goose);
                    spawned++;
                }
            }
        }

        console.log('Spawned', spawned, 'geese on riverbank');
    }

    // ========================================================================
    // NEST SYSTEM
    // ========================================================================
    /**
     * Create a nest at the specified position.
     * @param {number} x - X position
     * @param {number} z - Z position
     * @returns {Object} - Nest object with mesh and metadata
     */
    function createNest(x, z) {
        const nest = new THREE.Group();

        // Create twig circle (nest base) - much larger for visibility
        const twigMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const radius = 1.5; // Increased from 0.5
            const twig = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), // Increased from 0.02, 0.3
                twigMat
            );
            twig.position.set(
                Math.cos(angle) * radius,
                0.3, // Raised up
                Math.sin(angle) * radius
            );
            twig.rotation.y = angle;
            twig.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            twig.castShadow = true;
            nest.add(twig);
        }

        // Add moss lining inside nest - much larger
        const mossMat = new THREE.MeshStandardMaterial({ color: 0x6b8e23 });
        const moss = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 16, 16), // Increased from 0.3
            mossMat
        );
        moss.scale.set(1, 0.3, 1);
        moss.position.y = 0.2;
        moss.castShadow = true;
        nest.add(moss);

        nest.position.set(x, 0, z);

        // Create nest object
        const nestObj = {
            mesh: nest,
            position: { x: x, z: z },
            id: 'nest_' + Date.now() + '_' + Math.random(),
            ownerId: null,  // Will be set when goose claims it
            egg: {
                exists: false,
                timePlaced: 0,
                hatchTime: 0,
                mesh: null
            },
            state: 'empty'
        };

        return nestObj;
    }

    /**
     * Update all nests - check for egg hatching.
     * @param {number} delta - Time since last frame
     */
    function updateNests(delta) {
        const currentTime = GameState.clock.elapsedTime;

        for (let i = GameState.nests.length - 1; i >= 0; i--) {
            const nest = GameState.nests[i];

            // Check if egg is ready to hatch
            if (nest.egg.exists && currentTime >= nest.egg.hatchTime) {
                hatchEgg(nest, i);
            }
        }
    }

    /**
     * Hatch an egg into a baby goose.
     * @param {Object} nest - The nest containing the egg
     * @param {number} nestIndex - Index of nest in GameState.nests
     */
    function hatchEgg(nest, nestIndex) {
        // Remove egg mesh from scene
        if (nest.egg.mesh) {
            GameState.scene.remove(nest.egg.mesh);
            GameState.resources = GameState.resources.filter(r => r !== nest.egg.mesh);
        }

        // Find goose data for creating baby
        const gooseData = ENEMIES.find(e => e.id === 'goose');
        if (!gooseData) return;

        // Create baby goose at nest position
        const baby = createEnemy(gooseData, nest.position.x, nest.position.z);
        if (!baby) return;

        // Configure as baby
        baby.userData.lifecycleState = 'baby';
        baby.userData.size = 0.6;
        baby.userData.health = 12;
        baby.userData.maxHealth = 12;
        baby.scale.set(0.6, 0.6, 0.6);
        baby.userData.parentId = nest.ownerId;
        baby.userData.birthTime = GameState.clock.elapsedTime;
        baby.userData.maturityTime = GameState.clock.elapsedTime + 120; // 2 minutes
        baby.userData.entityId = 'baby_goose_' + Date.now() + '_' + Math.random();
        baby.userData.isBaby = true; // Mark as baby for predator targeting

        // Make baby goose grey by changing material colors
        baby.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.color) {
                    // Change to grey tones
                    const currentColor = child.material.color.getHex();
                    // If it's a body part (not beak or legs which are orange)
                    if (currentColor !== 0xff8c00) {
                        child.material.color.setHex(0x999999); // Medium grey
                    }
                }
            }
        });

        // Add to game
        GameState.enemies.push(baby);
        GameState.scene.add(baby);

        // Mark parent as having offspring (double detection range)
        const parent = GameState.enemies.find(e => e.userData.entityId === nest.ownerId);
        if (parent) {
            parent.userData.hasOffspring = true;
        }

        // Reset nest state
        nest.egg.exists = false;
        nest.egg.mesh = null;
        nest.state = 'empty';
        nest.ownerId = null;

        console.log('Baby goose hatched at nest', nest.id);
    }

    // ========================================================================
    // UPDATE ENEMIES (AI & MOVEMENT)
    // ========================================================================
    /**
     * Update all enemies - AI behavior, movement, and collision.
     * @param {number} delta - Time since last frame
     */
    function updateEnemies(delta) {
        let closestDistance = Infinity;
        let closestHostile = Infinity;

        for (let i = GameState.enemies.length - 1; i >= 0; i--) {
            const enemy = GameState.enemies[i];
            const distance = enemy.position.distanceTo(GameState.peccary.position);

            // Track closest hostile enemy for warning indicator
            if (!enemy.userData.friendly) {
                closestHostile = Math.min(closestHostile, distance);
            }
            closestDistance = Math.min(closestDistance, distance);

            // Check if enemy is in water
            const inWater = Environment.isInRiver(enemy.position.x, enemy.position.z);
            enemy.userData.inWater = inWater;

            // Initialize wander direction if not set
            if (!enemy.userData.wanderDir) {
                const angle = Math.random() * Math.PI * 2;
                enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                enemy.userData.wanderTime = 0;
            }

            let direction;
            let speed = enemy.userData.speed * 0.5;

            // Goose lifecycle state machine
            if (enemy.userData.id === 'goose' && enemy.userData.lifecycleState) {
                const state = enemy.userData.lifecycleState;
                const currentTime = GameState.clock.elapsedTime;

                if (state === 'finding_nest') {
                    // Find a random riverbank position and move toward it
                    if (!enemy.userData.targetNestPos) {
                        // Find a riverbank spot
                        for (let attempt = 0; attempt < 20; attempt++) {
                            const rx = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 0.8;
                            const rz = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 0.8;
                            if (Environment.isOnRiverbank(rx, rz) && !Environment.isInVillage(rx, rz)) {
                                enemy.userData.targetNestPos = { x: rx, z: rz };
                                break;
                            }
                        }
                    }

                    if (enemy.userData.targetNestPos) {
                        const targetVec = new THREE.Vector3(
                            enemy.userData.targetNestPos.x,
                            0,
                            enemy.userData.targetNestPos.z
                        );
                        direction = new THREE.Vector3()
                            .subVectors(targetVec, enemy.position)
                            .normalize();
                        speed = enemy.userData.speed;

                        // Check if reached target
                        const distToTarget = enemy.position.distanceTo(targetVec);
                        if (distToTarget < 1) {
                            // Transition to building nest
                            enemy.userData.lifecycleState = 'building_nest';
                            enemy.userData.stateTimer = 0;
                        }
                    } else {
                        // Wander if no target found
                        direction = enemy.userData.wanderDir;
                    }
                } else if (state === 'building_nest') {
                    // Stand still for a moment, then create nest
                    enemy.userData.stateTimer += delta;
                    direction = new THREE.Vector3(0, 0, 0);
                    speed = 0;

                    if (enemy.userData.stateTimer >= 1) {
                        // Create nest at current position
                        const nest = createNest(enemy.position.x, enemy.position.z);
                        nest.ownerId = enemy.userData.entityId;
                        GameState.nests.push(nest);
                        GameState.scene.add(nest.mesh);
                        enemy.userData.nestId = nest.id;

                        // Transition to laying egg
                        enemy.userData.lifecycleState = 'laying_egg';
                        enemy.userData.stateTimer = 0;
                    }
                } else if (state === 'laying_egg') {
                    // Stand still for 3 seconds, then create egg
                    enemy.userData.stateTimer += delta;
                    direction = new THREE.Vector3(0, 0, 0);
                    speed = 0;

                    if (enemy.userData.stateTimer >= 3) {
                        // Find the nest
                        const nest = GameState.nests.find(n => n.id === enemy.userData.nestId);
                        if (nest) {
                            // Create egg mesh
                            const egg = Items.createResource('egg');
                            egg.position.set(nest.position.x, 0, nest.position.z);
                            egg.userData.nestId = nest.id; // Store nest ID in egg
                            GameState.resources.push(egg);
                            GameState.scene.add(egg);

                            // Set nest egg properties
                            nest.egg.exists = true;
                            nest.egg.timePlaced = currentTime;
                            nest.egg.hatchTime = currentTime + 300; // 5 minutes
                            nest.egg.mesh = egg;
                            nest.state = 'occupied';

                            // Transition to guarding
                            enemy.userData.lifecycleState = 'guarding';
                        } else {
                            // No nest found, go back to finding nest
                            enemy.userData.lifecycleState = 'finding_nest';
                            enemy.userData.targetNestPos = null;
                        }
                    }
                } else if (state === 'guarding') {
                    // Patrol around nest, attack hostile enemies
                    const nest = GameState.nests.find(n => n.id === enemy.userData.nestId);
                    if (nest) {
                        const nestVec = new THREE.Vector3(nest.position.x, 0, nest.position.z);
                        const distToNest = enemy.position.distanceTo(nestVec);

                        // Find closest hostile enemy within attack range
                        // Double detection range if goose has offspring
                        const detectionRange = enemy.userData.hasOffspring ?
                            enemy.userData.attackRange * 2 :
                            enemy.userData.attackRange;

                        let closestEnemy = null;
                        let closestEnemyDist = detectionRange;

                        for (let j = 0; j < GameState.enemies.length; j++) {
                            const other = GameState.enemies[j];
                            if (other === enemy || other.userData.friendly) continue;

                            const dist = enemy.position.distanceTo(other.position);
                            if (dist < closestEnemyDist) {
                                closestEnemyDist = dist;
                                closestEnemy = other;
                            }
                        }

                        if (closestEnemy) {
                            // Chase and attack hostile enemy
                            direction = new THREE.Vector3()
                                .subVectors(closestEnemy.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;

                            // Deal damage to enemy on contact
                            if (closestEnemyDist < enemy.userData.radius + closestEnemy.userData.radius) {
                                closestEnemy.userData.health -= enemy.userData.damage * delta;
                                if (closestEnemy.userData.health <= 0) {
                                    // Remove killed enemy
                                    const idx = GameState.enemies.indexOf(closestEnemy);
                                    if (idx !== -1) {
                                        GameState.scene.remove(closestEnemy);
                                        GameState.enemies.splice(idx, 1);
                                        if (idx < i) i--;
                                    }
                                }
                            }
                        } else if (distToNest > 15) {
                            // Too far from nest, move back
                            direction = new THREE.Vector3()
                                .subVectors(nestVec, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;
                        } else {
                            // Wander near nest
                            enemy.userData.wanderTime += delta;
                            if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                                const angle = Math.random() * Math.PI * 2;
                                enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                                enemy.userData.wanderTime = 0;
                            }
                            direction = enemy.userData.wanderDir;
                        }

                        // Check if egg was collected (nest exists but no egg)
                        if (!nest.egg.exists && nest.state === 'empty') {
                            // Egg was collected or hatched, build new nest
                            enemy.userData.lifecycleState = 'finding_nest';
                            enemy.userData.targetNestPos = null;
                            enemy.userData.nestId = null;
                        }
                    } else {
                        // Nest doesn't exist, find a new one
                        enemy.userData.lifecycleState = 'finding_nest';
                        enemy.userData.targetNestPos = null;
                        enemy.userData.nestId = null;
                    }
                } else if (state === 'defending') {
                    // Chase player aggressively at 1.5x speed
                    direction = new THREE.Vector3()
                        .subVectors(GameState.peccary.position, enemy.position)
                        .normalize();
                    speed = enemy.userData.speed * 1.5;

                    // Deal double damage on contact
                    if (distance < enemy.userData.radius + GameState.peccary.userData.radius) {
                        Game.takeDamage(enemy.userData.damage * 2 * delta, enemy.userData.type);
                    }

                    // Check if player reached village (safe zone)
                    if (Environment.isInVillage(GameState.peccary.position.x, GameState.peccary.position.z)) {
                        // Stop chasing, reset to finding nest
                        enemy.userData.lifecycleState = 'finding_nest';
                        enemy.userData.chasingPlayer = false;
                        enemy.userData.friendly = true;
                        enemy.userData.targetNestPos = null;
                        enemy.userData.nestId = null;

                        // Remove from chasing geese list
                        GameState.chasingGeese = GameState.chasingGeese.filter(g => g !== enemy);
                    }
                } else if (state === 'baby') {
                    // Baby goose follows parent
                    const parent = GameState.enemies.find(e => e.userData.entityId === enemy.userData.parentId);

                    if (parent) {
                        const distToParent = enemy.position.distanceTo(parent.position);

                        if (distToParent > 5) {
                            // Too far, move toward parent
                            direction = new THREE.Vector3()
                                .subVectors(parent.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;
                        } else {
                            // Stay near parent, wander
                            enemy.userData.wanderTime += delta;
                            if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                                const angle = Math.random() * Math.PI * 2;
                                enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                                enemy.userData.wanderTime = 0;
                            }
                            direction = enemy.userData.wanderDir;
                            speed = enemy.userData.speed * 0.5;
                        }
                    } else {
                        // Parent doesn't exist, wander
                        enemy.userData.wanderTime += delta;
                        if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                            const angle = Math.random() * Math.PI * 2;
                            enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                            enemy.userData.wanderTime = 0;
                        }
                        direction = enemy.userData.wanderDir;
                    }

                    // Check if mature
                    if (currentTime >= enemy.userData.maturityTime) {
                        // Clear parent's hasOffspring flag
                        const parent = GameState.enemies.find(e => e.userData.entityId === enemy.userData.parentId);
                        if (parent) {
                            parent.userData.hasOffspring = false;
                        }

                        // Grow to full size
                        enemy.scale.set(1, 1, 1);
                        enemy.userData.size = 1;
                        enemy.userData.health = 25;
                        enemy.userData.maxHealth = 25;
                        enemy.userData.lifecycleState = 'finding_nest';
                        enemy.userData.targetNestPos = null;
                        enemy.userData.nestId = null;
                        enemy.userData.entityId = 'goose_' + Date.now() + '_' + Math.random();
                        enemy.userData.isBaby = false; // No longer a baby

                        // Restore adult colors
                        enemy.traverse((child) => {
                            if (child.isMesh && child.material) {
                                if (child.material.color) {
                                    const currentColor = child.material.color.getHex();
                                    // Restore body color if it's grey
                                    if (currentColor === 0x999999) {
                                        child.material.color.setHex(0xf5deb3); // Wheat/beige
                                    }
                                }
                            }
                        });

                        console.log('Baby goose matured into adult');
                    }
                }
            }
            // Friendly enemies that attack other enemies (like geese without lifecycle)
            else if (enemy.userData.attacksEnemies) {
                // Find closest hostile enemy to attack
                let closestEnemy = null;
                let closestEnemyDist = enemy.userData.attackRange;

                for (let j = 0; j < GameState.enemies.length; j++) {
                    const other = GameState.enemies[j];
                    if (other === enemy || other.userData.friendly) continue;

                    const dist = enemy.position.distanceTo(other.position);
                    if (dist < closestEnemyDist) {
                        closestEnemyDist = dist;
                        closestEnemy = other;
                    }
                }

                if (closestEnemy) {
                    // Chase and attack hostile enemy
                    direction = new THREE.Vector3()
                        .subVectors(closestEnemy.position, enemy.position)
                        .normalize();
                    speed = enemy.userData.speed;
                    enemy.userData.isChasing = true;

                    // Deal damage to enemy on contact
                    if (closestEnemyDist < enemy.userData.radius + closestEnemy.userData.radius) {
                        closestEnemy.userData.health -= enemy.userData.damage * delta;
                        if (closestEnemy.userData.health <= 0) {
                            // Remove killed enemy
                            const idx = GameState.enemies.indexOf(closestEnemy);
                            if (idx !== -1) {
                                GameState.scene.remove(closestEnemy);
                                GameState.enemies.splice(idx, 1);
                                // Adjust index if needed
                                if (idx < i) i--;
                            }
                        }
                    }
                } else {
                    // Wander when no targets
                    enemy.userData.isChasing = false;
                    enemy.userData.wanderTime += delta;

                    if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                        const angle = Math.random() * Math.PI * 2;
                        enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                        enemy.userData.wanderTime = 0;
                    }

                    direction = enemy.userData.wanderDir;
                }
            }
            // Hostile enemies (badgers/weasels) hunt baby geese or chase player
            else if (!enemy.userData.friendly) {
                // First check for baby geese within range
                let targetBaby = null;
                let closestBabyDist = CONFIG.ENEMY_DETECTION_RANGE;

                for (let j = 0; j < GameState.enemies.length; j++) {
                    const other = GameState.enemies[j];
                    if (other === enemy || !other.userData.isBaby) continue;

                    const dist = enemy.position.distanceTo(other.position);
                    if (dist < closestBabyDist) {
                        closestBabyDist = dist;
                        targetBaby = other;
                    }
                }

                if (targetBaby) {
                    // Chase baby goose
                    direction = new THREE.Vector3()
                        .subVectors(targetBaby.position, enemy.position)
                        .normalize();
                    speed = enemy.userData.speed * 1.2; // Faster when hunting babies
                    enemy.userData.isChasing = true;

                    // Attack baby on contact
                    if (closestBabyDist < enemy.userData.radius + targetBaby.userData.radius) {
                        targetBaby.userData.health -= enemy.userData.damage * delta;
                        if (targetBaby.userData.health <= 0) {
                            // Clear parent's hasOffspring flag
                            const parent = GameState.enemies.find(e => e.userData.entityId === targetBaby.userData.parentId);
                            if (parent) {
                                parent.userData.hasOffspring = false;
                            }

                            // Kill baby goose
                            const idx = GameState.enemies.indexOf(targetBaby);
                            if (idx !== -1) {
                                GameState.scene.remove(targetBaby);
                                GameState.enemies.splice(idx, 1);
                                if (idx < i) i--;
                            }
                        }
                    }
                } else if (distance < CONFIG.ENEMY_DETECTION_RANGE) {
                    // No baby geese nearby, chase player
                    direction = new THREE.Vector3()
                        .subVectors(GameState.peccary.position, enemy.position)
                        .normalize();

                    speed = enemy.userData.speed;
                    if (distance < 15) speed *= 1.3;

                    enemy.userData.isChasing = true;
                } else {
                    // Wander randomly
                    enemy.userData.isChasing = false;
                    enemy.userData.wanderTime += delta;

                    if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                        const angle = Math.random() * Math.PI * 2;
                        enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                        enemy.userData.wanderTime = 0;
                    }

                    direction = enemy.userData.wanderDir;
                }
            } else {
                // Wander randomly (shouldn't reach here for hostile enemies)
                enemy.userData.isChasing = false;
                enemy.userData.wanderTime += delta;

                if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                    const angle = Math.random() * Math.PI * 2;
                    enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                    enemy.userData.wanderTime = 0;
                }

                direction = enemy.userData.wanderDir;
            }

            // Apply water slowdown (50% speed) - unless immune
            if (inWater && !enemy.userData.immuneToWater) {
                speed *= 0.5;
            }

            // Move enemy
            enemy.position.x += direction.x * speed * delta;
            enemy.position.z += direction.z * speed * delta;

            // Rotate to face movement direction
            const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI / 2;

            let currentEnemyRotation = enemy.rotation.y;
            let enemyDiff = targetRotation - currentEnemyRotation;
            while (enemyDiff > Math.PI) enemyDiff -= Math.PI * 2;
            while (enemyDiff < -Math.PI) enemyDiff += Math.PI * 2;
            enemy.rotation.y = currentEnemyRotation + enemyDiff * 0.1;

            // Animation - swimming or walking
            if (inWater) {
                // Swimming animation - lower body, slower bob
                enemy.position.y = -0.2 + Math.sin(GameState.clock.elapsedTime * 4 + i) * 0.1;
            } else {
                // Normal bobbing animation
                enemy.position.y = Math.abs(Math.sin(GameState.clock.elapsedTime * 12 + i)) * 0.05;
            }

            // Collision with player - only for hostile enemies
            if (!enemy.userData.friendly && distance < enemy.userData.radius + GameState.peccary.userData.radius) {
                Game.takeDamage(enemy.userData.damage * delta, enemy.userData.type);
            }

            // Keep enemies within world bounds
            const bound = CONFIG.WORLD_SIZE * 0.6;
            if (Math.abs(enemy.position.x) > bound || Math.abs(enemy.position.z) > bound) {
                enemy.userData.wanderDir = new THREE.Vector3(
                    -enemy.position.x * 0.1,
                    0,
                    -enemy.position.z * 0.1
                ).normalize();
                enemy.userData.wanderTime = 0;
            }

            // Remove if very far
            if (distance > CONFIG.WORLD_SIZE * 1.5) {
                GameState.scene.remove(enemy);
                GameState.enemies.splice(i, 1);
            }
        }

        // Warning indicator - only for hostile enemies
        const warningEl = document.getElementById('warning-text');
        if (closestHostile < CONFIG.ENEMY_DETECTION_RANGE && closestHostile < 20) {
            warningEl.style.opacity = Math.max(0, 1 - closestHostile / 20);
        } else {
            warningEl.style.opacity = 0;
        }
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================
    return {
        createEnemy: createEnemy,
        spawnEnemy: spawnEnemy,
        spawnGeese: spawnGeese,
        updateEnemies: updateEnemies,
        updateNests: updateNests,
        createNest: createNest,

        // Expose model builders for advanced use
        modelBuilders: modelBuilders
    };
})();
