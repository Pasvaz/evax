/**
 * PLAYER MODULE
 * Contains peccary creation and movement logic.
 */

window.Player = (function() {
    'use strict';

    /**
     * Create the player character (peccary).
     */
    function createPeccary() {
        // Outer group for world position/rotation
        GameState.peccary = new THREE.Group();
        // Inner group for model parts (rotated to face correct direction)
        const model = new THREE.Group();

        // BODY: Dark gray, capsule-shaped
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });

        // Main body cylinder
        const bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.8;
        body.castShadow = true;
        model.add(body);

        // Body end caps (spheres)
        const endCapGeo = new THREE.SphereGeometry(0.6, 16, 16);
        const frontCap = new THREE.Mesh(endCapGeo, bodyMat);
        frontCap.position.set(0.6, 0.8, 0);
        frontCap.castShadow = true;
        model.add(frontCap);

        const backCap = new THREE.Mesh(endCapGeo, bodyMat);
        backCap.position.set(-0.6, 0.8, 0);
        backCap.castShadow = true;
        model.add(backCap);

        // Head
        const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(1.2, 0.9, 0);
        head.scale.set(1.2, 1, 0.9);
        head.castShadow = true;
        model.add(head);

        // Snout
        const snoutGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8);
        const snoutMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
        const snout = new THREE.Mesh(snoutGeo, snoutMat);
        snout.rotation.z = Math.PI / 2;
        snout.position.set(1.6, 0.8, 0);
        model.add(snout);

        // Nose
        const noseMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), noseMat);
        nose.position.set(1.8, 0.8, 0);
        model.add(nose);

        // Eyes
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        [-0.15, 0.15].forEach(z => {
            const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeWhiteMat);
            eyeWhite.position.set(1.35, 1.05, z);
            model.add(eyeWhite);
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
            eye.position.set(1.4, 1.05, z);
            model.add(eye);
        });

        // Ears
        const earMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
        [-0.25, 0.25].forEach(z => {
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), earMat);
            ear.position.set(1.0, 1.3, z);
            ear.rotation.x = z > 0 ? 0.3 : -0.3;
            model.add(ear);
        });

        // Legs
        const legMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
        const legPositions = [
            [0.5, 0.3, 0.3], [0.5, 0.3, -0.3],
            [-0.5, 0.3, 0.3], [-0.5, 0.3, -0.3]
        ];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8), legMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            model.add(leg);

            // Hoof
            const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.1, 8),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
            hoof.position.set(pos[0], 0.05, pos[2]);
            model.add(hoof);
        });

        // Tail (small)
        const tail = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), bodyMat);
        tail.position.set(-1.1, 0.9, 0);
        model.add(tail);

        // White collar marking
        const collarGeo = new THREE.TorusGeometry(0.55, 0.1, 12, 32);
        const collarMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
        const collar = new THREE.Mesh(collarGeo, collarMat);
        collar.rotation.z = Math.PI / 2;
        collar.position.set(0.5, 0.8, 0);
        model.add(collar);

        // Flip the model to face -X (forward in game)
        model.rotation.y = Math.PI;
        GameState.peccary.add(model);

        // Spawn player in the village (safe zone)
        GameState.peccary.position.set(
            CONFIG.VILLAGE_CENTER.x,
            0,
            CONFIG.VILLAGE_CENTER.z
        );
        GameState.peccary.userData.radius = 1;
        GameState.scene.add(GameState.peccary);
    }

    /**
     * Check for resource use key presses (1, 2, 3, 4, 5).
     */
    function checkResourceUseKeys() {
        if (GameState.keys['1'] && !GameState.resourceKeyStates['1']) {
            Items.useStoredResource('berry');
        }
        if (GameState.keys['2'] && !GameState.resourceKeyStates['2']) {
            Items.useStoredResource('nut');
        }
        if (GameState.keys['3'] && !GameState.resourceKeyStates['3']) {
            Items.useStoredResource('mushroom');
        }
        if (GameState.keys['4'] && !GameState.resourceKeyStates['4']) {
            Items.useStoredResource('seaweed');
        }
        if (GameState.keys['5'] && !GameState.resourceKeyStates['5']) {
            Items.useStoredResource('egg');
        }

        GameState.resourceKeyStates['1'] = GameState.keys['1'] || false;
        GameState.resourceKeyStates['2'] = GameState.keys['2'] || false;
        GameState.resourceKeyStates['3'] = GameState.keys['3'] || false;
        GameState.resourceKeyStates['4'] = GameState.keys['4'] || false;
        GameState.resourceKeyStates['5'] = GameState.keys['5'] || false;
    }

    /**
     * Find the nearest rideable Saltas Gazella within mount distance.
     * @returns {THREE.Group|null} The nearest gazella or null
     */
    function findNearbyRideableGazella() {
        if (!GameState.hasSaddle) return null;

        const mountDistance = 2.5;
        let nearestGazella = null;
        let nearestDist = mountDistance;

        for (const enemy of GameState.enemies) {
            if (enemy.userData.type === 'saltas_gazella' &&
                enemy.userData.isRideable &&
                !enemy.userData.isBeingRidden &&
                !enemy.userData.isBaby) {

                const dist = GameState.peccary.position.distanceTo(enemy.position);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestGazella = enemy;
                }
            }
        }

        return nearestGazella;
    }

    /**
     * Mount a Saltas Gazella.
     * @param {THREE.Group} gazella - The gazella to mount
     */
    function mountGazella(gazella) {
        if (!gazella || GameState.mountedAnimal) return;

        GameState.mountedAnimal = gazella;
        gazella.userData.isBeingRidden = true;

        // Hide the peccary (it's "on" the gazella now)
        GameState.peccary.visible = false;

        console.log('Mounted Saltas Gazella! Use WASD to move, E or Space to dismount.');
    }

    /**
     * Dismount from current mount.
     */
    function dismountGazella() {
        if (!GameState.mountedAnimal) return;

        const gazella = GameState.mountedAnimal;
        gazella.userData.isBeingRidden = false;

        // Position peccary next to gazella
        GameState.peccary.position.copy(gazella.position);
        GameState.peccary.position.x += 2;  // Offset to the side
        GameState.peccary.visible = true;

        GameState.mountedAnimal = null;

        console.log('Dismounted from Saltas Gazella.');
    }

    /**
     * Update mounted riding controls.
     * @param {number} delta - Time elapsed since last frame
     */
    function updateRiding(delta) {
        const gazella = GameState.mountedAnimal;
        if (!gazella) return;

        // Check for dismount (E or Space)
        if (GameState.keys['e'] && !GameState.lastKeyE) {
            dismountGazella();
            GameState.lastKeyE = true;
            return;
        }
        if (GameState.keys[' '] || GameState.keys['space']) {
            dismountGazella();
            return;
        }
        GameState.lastKeyE = GameState.keys['e'];

        // Movement controls - use gazella's fast speed!
        const isSprinting = GameState.keys['shift'];
        let moveSpeed = isSprinting ? gazella.userData.fleeSpeed : gazella.userData.speed;

        const direction = new THREE.Vector3();
        if (GameState.keys['w'] || GameState.keys['arrowup']) direction.z -= 1;
        if (GameState.keys['s'] || GameState.keys['arrowdown']) direction.z += 1;
        if (GameState.keys['a'] || GameState.keys['arrowleft']) direction.x -= 1;
        if (GameState.keys['d'] || GameState.keys['arrowright']) direction.x += 1;

        if (direction.length() > 0) {
            direction.normalize();

            // Move the gazella
            gazella.position.x += direction.x * moveSpeed * delta;
            gazella.position.z += direction.z * moveSpeed * delta;

            // Rotate to face movement direction
            // Add Math.PI / 2 offset because the model is built facing +X
            const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI / 2;
            let currentRotation = gazella.rotation.y;
            let diff = targetRotation - currentRotation;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            gazella.rotation.y = currentRotation + diff * 0.15;

            // Running animation
            const model = gazella.children[0];
            if (model && model.userData.legs) {
                const walkSpeed = isSprinting ? 15 : 8;
                gazella.userData.walkPhase = (gazella.userData.walkPhase || 0) + delta * walkSpeed;

                model.userData.legs.forEach((leg, idx) => {
                    const isPairA = (idx === 0 || idx === 3);
                    const phase = isPairA ? gazella.userData.walkPhase : gazella.userData.walkPhase + Math.PI;
                    const cyclePos = Math.sin(phase);

                    const swingMult = isSprinting ? 1.0 : 0.6;
                    const kneeMult = isSprinting ? 1.2 : 0.7;

                    leg.group.rotation.z = cyclePos * swingMult;
                    const kneeBend = cyclePos > 0 ? -cyclePos * kneeMult : cyclePos * 0.2;
                    leg.lowerLegGroup.rotation.z = kneeBend;
                });

                // Body bob
                const bobAmount = isSprinting ? 0.1 : 0.03;
                gazella.position.y = Math.abs(Math.sin(gazella.userData.walkPhase * 2)) * bobAmount;
            }
        } else {
            gazella.position.y = 0;
        }

        // Keep within world bounds
        const bound = CONFIG.WORLD_SIZE * 0.65;
        gazella.position.x = Math.max(-bound, Math.min(bound, gazella.position.x));
        gazella.position.z = Math.max(-bound, Math.min(bound, gazella.position.z));

        // Update camera to follow gazella (keep peccary position synced for camera)
        GameState.peccary.position.copy(gazella.position);
    }

    /**
     * Update player position, rotation, and physics.
     * @param {number} delta - Time elapsed since last frame
     */
    function updatePlayer(delta) {
        // If mounted, handle riding instead of normal movement
        if (GameState.mountedAnimal) {
            updateRiding(delta);
            return;
        }

        // Check for mounting a gazella (E key, not in dialog)
        if (GameState.keys['e'] && !GameState.lastKeyE && !GameState.isDialogOpen && !GameState.nearbyVillager) {
            const nearbyGazella = findNearbyRideableGazella();
            if (nearbyGazella) {
                mountGazella(nearbyGazella);
                GameState.lastKeyE = true;
                return;
            }
        }
        GameState.lastKeyE = GameState.keys['e'];

        checkResourceUseKeys();

        // Check if player is in water (river OR watering hole)
        const inRiver = Environment.isInRiver(
            GameState.peccary.position.x,
            GameState.peccary.position.z
        );
        const inWateringHole = Environment.isInWateringHole(
            GameState.peccary.position.x,
            GameState.peccary.position.z
        );
        const inWater = inRiver || inWateringHole;
        GameState.playerInWater = inWater;

        const isSprinting = GameState.keys['shift'];
        let moveSpeed = isSprinting ? window.CONFIG.PLAYER_SPRINT_SPEED : window.CONFIG.PLAYER_WALK_SPEED;

        // Testing mode - 2x speed boost!
        if (GameState.isTestingMode) {
            moveSpeed *= 2;
        }

        // Slow down in water (50% speed)
        if (inWater) {
            moveSpeed *= window.CONFIG.PLAYER_SWIM_SPEED;
        }

        // Starving! Move much slower when hunger is zero (not in testing mode)
        if (!GameState.isTestingMode) {
            if (GameState.hunger <= 0) {
                moveSpeed *= 0.4;  // 40% speed when starving
            } else if (GameState.hunger < 20) {
                // Getting hungry - slightly slower
                moveSpeed *= 0.7;  // 70% speed when very hungry
            }
        }

        const direction = new THREE.Vector3();

        if (GameState.keys['w'] || GameState.keys['arrowup']) direction.z -= 1;
        if (GameState.keys['s'] || GameState.keys['arrowdown']) direction.z += 1;
        if (GameState.keys['a'] || GameState.keys['arrowleft']) direction.x -= 1;
        if (GameState.keys['d'] || GameState.keys['arrowright']) direction.x += 1;

        if (direction.length() > 0) {
            direction.normalize();

            GameState.peccary.position.x += direction.x * moveSpeed * delta;
            GameState.peccary.position.z += direction.z * moveSpeed * delta;

            const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI / 2;

            let currentRotation = GameState.peccary.rotation.y;
            let diff = targetRotation - currentRotation;

            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            GameState.peccary.rotation.y = currentRotation + diff * 0.15;

            if (!GameState.isJumping) {
                if (inWater) {
                    // Swimming animation - bob up and down more slowly, lower body
                    GameState.peccary.position.y = -0.3 + Math.sin(GameState.clock.elapsedTime * 4) * 0.15;
                } else {
                    // Normal walking bob
                    GameState.peccary.position.y = Math.abs(Math.sin(GameState.clock.elapsedTime * 10)) * 0.1;
                }
            }

            if (isSprinting && !GameState.wasSprinting && Math.random() < 0.7) {
                Game.playSound('peccary');
            }
        } else if (inWater && !GameState.isJumping) {
            // Idle swimming animation
            GameState.peccary.position.y = -0.3 + Math.sin(GameState.clock.elapsedTime * 2) * 0.1;

            // Restore thirst when standing still in water
            GameState.thirst = Math.min(100, GameState.thirst + delta * 8);

            // Track drinking time for pee scheduling
            GameState.drinkingTime = (GameState.drinkingTime || 0) + delta;
        } else {
            // Stopped drinking - schedule pee if we drank anything
            if (GameState.drinkingTime && GameState.drinkingTime > 0.5) {
                GameState.peeQueue.push({
                    time: GameState.timeElapsed + 120,  // 2 minutes from now
                    duration: GameState.drinkingTime    // How long we drank = puddle size
                });
            }
            GameState.drinkingTime = 0;
        }

        GameState.wasSprinting = isSprinting;

        // Jumping
        if ((GameState.keys[' '] || GameState.keys['space']) && !GameState.isJumping) {
            GameState.velocity.y = window.CONFIG.PLAYER_JUMP_POWER;
            GameState.isJumping = true;
            Game.playSound('jump');
        }

        if (GameState.isJumping) {
            GameState.velocity.y -= window.CONFIG.GRAVITY * delta;
            GameState.peccary.position.y += GameState.velocity.y * delta;

            if (GameState.peccary.position.y <= GameState.groundLevel) {
                GameState.peccary.position.y = GameState.groundLevel;
                GameState.isJumping = false;
                GameState.velocity.y = 0;
            }
        }

        // World bounds - allow going slightly past 0.7 to trigger biome transitions
        // The transition border is at 0.7, so we allow up to 0.75 for the actual edge
        const bound = CONFIG.WORLD_SIZE * 0.75;
        GameState.peccary.position.x = Math.max(-bound, Math.min(bound, GameState.peccary.position.x));
        GameState.peccary.position.z = Math.max(-bound, Math.min(bound, GameState.peccary.position.z));

        // Tree collision
        GameState.trees.forEach(tree => {
            const dist = GameState.peccary.position.distanceTo(tree.position);
            if (dist < tree.userData.radius + GameState.peccary.userData.radius) {
                const pushDir = new THREE.Vector3()
                    .subVectors(GameState.peccary.position, tree.position)
                    .normalize();
                GameState.peccary.position.add(pushDir.multiplyScalar(0.1));
            }
        });

        // Update bathroom mechanic
        updateBathroom(delta);
    }

    /**
     * Create a cartoon poo swirl model.
     */
    function createPooModel() {
        const poo = new THREE.Group();

        // Brown color
        const pooMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.8 });

        // Base - wider bottom
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.3, 0.15, 12),
            pooMat
        );
        base.position.y = 0.075;
        poo.add(base);

        // Middle layer
        const mid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.25, 0.12, 12),
            pooMat
        );
        mid.position.y = 0.21;
        poo.add(mid);

        // Top swirl - cone with slight tilt
        const top = new THREE.Mesh(
            new THREE.ConeGeometry(0.15, 0.2, 12),
            pooMat
        );
        top.position.y = 0.37;
        top.rotation.z = 0.2;  // Slight tilt for cartoon effect
        poo.add(top);

        // Add a small fly buzzing around (optional fun detail)
        const flyMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const fly = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 6, 6),
            flyMat
        );
        fly.position.set(0.3, 0.4, 0);
        fly.userData.angle = Math.random() * Math.PI * 2;
        poo.add(fly);
        poo.userData.fly = fly;

        return poo;
    }

    /**
     * Create a cartoon pee puddle model.
     * @param {number} size - Size based on drinking duration
     */
    function createPeeModel(size) {
        const pee = new THREE.Group();

        // Yellow transparent material
        const peeMat = new THREE.MeshStandardMaterial({
            color: 0xffee55,
            transparent: true,
            opacity: 0.7,
            roughness: 0.3
        });

        // Main puddle - flattened sphere
        const puddleSize = Math.min(0.3 + size * 0.1, 1.0);  // Scale with drinking time
        const puddle = new THREE.Mesh(
            new THREE.SphereGeometry(puddleSize, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            peeMat
        );
        puddle.scale.y = 0.15;  // Flatten it
        puddle.position.y = 0.02;
        pee.add(puddle);

        // Add some splash droplets around
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const dist = puddleSize + 0.1 + Math.random() * 0.15;
            const droplet = new THREE.Mesh(
                new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
                peeMat
            );
            droplet.scale.y = 0.2;
            droplet.position.set(
                Math.cos(angle) * dist,
                0.01,
                Math.sin(angle) * dist
            );
            pee.add(droplet);
        }

        return pee;
    }

    /**
     * Update bathroom mechanic - check queues, spawn poo/pee, handle animations.
     */
    function updateBathroom(delta) {
        const currentTime = GameState.timeElapsed;

        // Check if it's time to poop
        if (!GameState.isSquatting && GameState.poopQueue.length > 0) {
            const nextPoop = GameState.poopQueue[0];
            if (currentTime >= nextPoop.time) {
                // Time to poop! Start squatting
                GameState.isSquatting = 'poop';
                GameState.squatTimer = 0;
                GameState.poopQueue.shift();  // Remove from queue
            }
        }

        // Check if it's time to pee
        if (!GameState.isSquatting && GameState.peeQueue.length > 0) {
            const nextPee = GameState.peeQueue[0];
            if (currentTime >= nextPee.time) {
                // Time to pee! Start squatting
                GameState.isSquatting = 'pee';
                GameState.squatTimer = 0;
                GameState.peeDuration = nextPee.duration;
                GameState.peeQueue.shift();
            }
        }

        // Handle squatting animation
        if (GameState.isSquatting) {
            GameState.squatTimer += delta;

            // Squat animation - lower the peccary
            const squatProgress = Math.min(GameState.squatTimer / 0.5, 1);  // 0.5 sec to squat down
            if (GameState.squatTimer < 0.5) {
                // Squatting down
                GameState.peccary.position.y = -squatProgress * 0.3;
            } else if (GameState.squatTimer < 1.5) {
                // Holding squat - do the business
                GameState.peccary.position.y = -0.3;
            } else if (GameState.squatTimer < 2.0) {
                // Standing back up
                const standProgress = (GameState.squatTimer - 1.5) / 0.5;
                GameState.peccary.position.y = -0.3 + standProgress * 0.3;
            } else {
                // Done! Spawn the result
                GameState.peccary.position.y = 0;

                const spawnPos = GameState.peccary.position.clone();
                spawnPos.y = 0;

                if (GameState.isSquatting === 'poop') {
                    const poo = createPooModel();
                    poo.position.copy(spawnPos);
                    GameState.scene.add(poo);
                    GameState.poopsInWorld.push({
                        mesh: poo,
                        removeTime: currentTime + 120  // Remove after 2 minutes
                    });
                    console.log('Peccary pooped!');
                } else if (GameState.isSquatting === 'pee') {
                    const pee = createPeeModel(GameState.peeDuration || 1);
                    pee.position.copy(spawnPos);
                    GameState.scene.add(pee);
                    GameState.peesInWorld.push({
                        mesh: pee,
                        removeTime: currentTime + 120
                    });
                    console.log('Peccary peed!');
                }

                GameState.isSquatting = false;
            }
        }

        // Update flies on poop (make them buzz around)
        GameState.poopsInWorld.forEach(p => {
            if (p.mesh.userData.fly) {
                const fly = p.mesh.userData.fly;
                fly.userData.angle += delta * 5;
                fly.position.x = Math.cos(fly.userData.angle) * 0.35;
                fly.position.z = Math.sin(fly.userData.angle) * 0.35;
                fly.position.y = 0.35 + Math.sin(fly.userData.angle * 2) * 0.1;
            }
        });

        // Remove old poop
        for (let i = GameState.poopsInWorld.length - 1; i >= 0; i--) {
            if (currentTime >= GameState.poopsInWorld[i].removeTime) {
                GameState.scene.remove(GameState.poopsInWorld[i].mesh);
                GameState.poopsInWorld.splice(i, 1);
            }
        }

        // Remove old pee
        for (let i = GameState.peesInWorld.length - 1; i >= 0; i--) {
            if (currentTime >= GameState.peesInWorld[i].removeTime) {
                GameState.scene.remove(GameState.peesInWorld[i].mesh);
                GameState.peesInWorld.splice(i, 1);
            }
        }
    }

    // Public API
    return {
        createPeccary: createPeccary,
        updatePlayer: updatePlayer
    };
})();
