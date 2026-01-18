/**
 * ENEMIES MODULE
 * Contains badger and weasel creation and AI behavior.
 */

window.Enemies = (function() {
    'use strict';

    /**
     * Create a badger enemy.
     */
    function createBadger(x, z) {
        const badger = new THREE.Group();
        const model = new THREE.Group();

        // Body
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2f2f2f });
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1, 16);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.5;
        body.castShadow = true;
        model.add(body);

        // Body caps
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
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
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
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
        snout.position.set(1.2, 0.45, 0);
        snout.scale.set(1.2, 0.8, 0.9);
        model.add(snout);

        // Eyes (red for menacing look)
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0x330000 });
        [-0.12, 0.12].forEach(zPos => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
            eye.position.set(1.1, 0.6, zPos);
            model.add(eye);
        });

        // Legs (short and stubby)
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        [[0.4, 0.2, 0.25], [0.4, 0.2, -0.25], [-0.4, 0.2, 0.25], [-0.4, 0.2, -0.25]].forEach(pos => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8), legMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            model.add(leg);
        });

        // Flip the model to face forward
        model.rotation.y = Math.PI;
        badger.add(model);

        badger.position.set(x, 0, z);
        badger.userData = {
            type: 'badger',
            speed: 3 + Math.random() * 1,
            radius: 0.8,
            damage: 15
        };

        return badger;
    }

    /**
     * Create a weasel enemy.
     */
    function createWeasel(x, z) {
        const weasel = new THREE.Group();
        const model = new THREE.Group();

        // Long body
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
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
        const snoutMat = new THREE.MeshStandardMaterial({ color: 0xd2691e });
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), snoutMat);
        snout.position.set(1.1, 0.3, 0);
        model.add(snout);

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
        nose.position.set(1.18, 0.3, 0);
        model.add(nose);

        // Eyes (yellow, predatory)
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0x333300 });
        [-0.08, 0.08].forEach(zPos => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
            eye.position.set(1.0, 0.42, zPos);
            model.add(eye);
        });

        // Ears
        const earMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        [-0.1, 0.1].forEach(zPos => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), earMat);
            ear.position.set(0.8, 0.5, zPos);
            model.add(ear);
        });

        // Short legs
        const legMat = new THREE.MeshStandardMaterial({ color: 0x6b3310 });
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

        // Flip the model to face forward
        model.rotation.y = Math.PI;
        weasel.add(model);

        weasel.position.set(x, 0, z);
        weasel.userData = {
            type: 'weasel',
            speed: 4.5 + Math.random() * 1.5,
            radius: 0.6,
            damage: 10
        };

        return weasel;
    }

    /**
     * Spawn a new enemy at the edge of the world.
     */
    function spawnEnemy() {
        if (GameState.enemies.length >= CONFIG.MAX_ENEMIES) return;

        const angle = Math.random() * Math.PI * 2;
        const distance = CONFIG.WORLD_SIZE * 0.4 + Math.random() * 20;
        const ex = Math.cos(angle) * distance;
        const ez = Math.sin(angle) * distance;

        const enemy = Math.random() > 0.5 ? createBadger(ex, ez) : createWeasel(ex, ez);
        GameState.enemies.push(enemy);
        GameState.scene.add(enemy);
    }

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

    // Public API
    return {
        createBadger: createBadger,
        createWeasel: createWeasel,
        spawnEnemy: spawnEnemy,
        updateEnemies: updateEnemies
    };
})();
