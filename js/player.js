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
     * Update player position, rotation, and physics.
     * @param {number} delta - Time elapsed since last frame
     */
    function updatePlayer(delta) {
        checkResourceUseKeys();

        // Check if player is in water
        const inWater = Environment.isInRiver(
            GameState.peccary.position.x,
            GameState.peccary.position.z
        );
        GameState.playerInWater = inWater;

        const isSprinting = GameState.keys['shift'];
        let moveSpeed = isSprinting ? 120 : 6;

        // Slow down in water (50% speed)
        if (inWater) {
            moveSpeed *= 0.5;
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
        }

        GameState.wasSprinting = isSprinting;

        // Jumping
        if ((GameState.keys[' '] || GameState.keys['space']) && !GameState.isJumping) {
            GameState.velocity.y = 8;
            GameState.isJumping = true;
            Game.playSound('jump');
        }

        if (GameState.isJumping) {
            GameState.velocity.y -= 20 * delta;
            GameState.peccary.position.y += GameState.velocity.y * delta;

            if (GameState.peccary.position.y <= GameState.groundLevel) {
                GameState.peccary.position.y = GameState.groundLevel;
                GameState.isJumping = false;
                GameState.velocity.y = 0;
            }
        }

        // World bounds
        const bound = CONFIG.WORLD_SIZE * 0.7;
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
    }

    // Public API
    return {
        createPeccary: createPeccary,
        updatePlayer: updatePlayer
    };
})();
