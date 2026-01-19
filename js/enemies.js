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

    // ========================================================================
    // MODEL BUILDERS REGISTRY
    // ========================================================================
    // Maps animal type names to their builder functions.
    // To add a new animal: add the builder function above, then register here.

    const modelBuilders = {
        badger: buildBadgerModel,
        weasel: buildWeaselModel
        // wolf: buildWolfModel,
        // bear: buildBearModel,
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
            minimapColor: enemyData.minimapColor
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
    // UPDATE ENEMIES (AI & MOVEMENT)
    // ========================================================================
    /**
     * Update all enemies - AI behavior, movement, and collision.
     * @param {number} delta - Time since last frame
     */
    function updateEnemies(delta) {
        let closestDistance = Infinity;

        for (let i = GameState.enemies.length - 1; i >= 0; i--) {
            const enemy = GameState.enemies[i];
            const distance = enemy.position.distanceTo(GameState.peccary.position);
            closestDistance = Math.min(closestDistance, distance);

            // Initialize wander direction if not set
            if (!enemy.userData.wanderDir) {
                const angle = Math.random() * Math.PI * 2;
                enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                enemy.userData.wanderTime = 0;
            }

            let direction;
            let speed = enemy.userData.speed * 0.5;

            // Only chase player if within detection range
            if (distance < CONFIG.ENEMY_DETECTION_RANGE) {
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

            // Bobbing animation
            enemy.position.y = Math.abs(Math.sin(GameState.clock.elapsedTime * 12 + i)) * 0.05;

            // Collision with player
            if (distance < enemy.userData.radius + GameState.peccary.userData.radius) {
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

        // Warning indicator
        const warningEl = document.getElementById('warning-text');
        if (closestDistance < CONFIG.ENEMY_DETECTION_RANGE && closestDistance < 20) {
            warningEl.style.opacity = Math.max(0, 1 - closestDistance / 20);
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
        updateEnemies: updateEnemies,

        // Expose model builders for advanced use
        modelBuilders: modelBuilders
    };
})();
