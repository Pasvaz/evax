/**
 * PLAYER MODULE
 * Contains peccary creation and movement logic.
 */

window.Player = (function() {
    'use strict';

    /**
     * Create the player character (peccary).
     */
    /**
     * Build peccary model parts into a group using the given skin palette.
     * Used by both createPeccary() and the skins preview screen.
     */
    function buildPeccaryModel(skin) {
        var model = new THREE.Group();

        // BODY: capsule-shaped
        var bodyMat = new THREE.MeshStandardMaterial({ color: skin.body });

        var bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16);
        var body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.8;
        body.castShadow = true;
        model.add(body);

        // Body end caps
        var endCapGeo = new THREE.SphereGeometry(0.6, 16, 16);
        var frontCap = new THREE.Mesh(endCapGeo, bodyMat);
        frontCap.position.set(0.6, 0.8, 0);
        frontCap.castShadow = true;
        model.add(frontCap);

        var backCap = new THREE.Mesh(endCapGeo, bodyMat);
        backCap.position.set(-0.6, 0.8, 0);
        backCap.castShadow = true;
        model.add(backCap);

        // Head
        var headGeo = new THREE.SphereGeometry(0.4, 16, 16);
        var head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(1.2, 0.9, 0);
        head.scale.set(1.2, 1, 0.9);
        head.castShadow = true;
        model.add(head);

        // Snout
        var snoutGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8);
        var snoutMat = new THREE.MeshStandardMaterial({ color: skin.detail });
        var snout = new THREE.Mesh(snoutGeo, snoutMat);
        snout.rotation.z = Math.PI / 2;
        snout.position.set(1.6, 0.8, 0);
        model.add(snout);

        // Nose
        var noseMat = new THREE.MeshStandardMaterial({ color: skin.nose });
        var nose = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), noseMat);
        nose.position.set(1.8, 0.8, 0);
        model.add(nose);

        // Eyes
        var eyeMat = new THREE.MeshStandardMaterial({ color: skin.pupil });
        var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: skin.eyeWhite });
        [-0.15, 0.15].forEach(function(z) {
            var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeWhiteMat);
            eyeWhite.position.set(1.35, 1.05, z);
            model.add(eyeWhite);
            var eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
            eye.position.set(1.4, 1.05, z);
            model.add(eye);
        });

        // Ears — floppy for lamb skins, pointy for normal
        var earMat = new THREE.MeshStandardMaterial({ color: skin.detail });
        if (skin.tailOverride === 'lamb') {
            // Floppy lamb ears: flat ovals that droop down
            [-0.25, 0.25].forEach(function(z) {
                var ear = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), earMat);
                ear.scale.set(0.6, 1.2, 1.0);
                ear.position.set(1.05, 0.95, z * 1.3);
                ear.rotation.x = z > 0 ? 0.8 : -0.8;
                model.add(ear);
            });
        } else {
            [-0.25, 0.25].forEach(function(z) {
                var ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), earMat);
                ear.position.set(1.0, 1.3, z);
                ear.rotation.x = z > 0 ? 0.3 : -0.3;
                model.add(ear);
            });
        }

        // Legs
        var legMat = new THREE.MeshStandardMaterial({ color: skin.detail });
        var legPositions = [
            [0.5, 0.3, 0.3], [0.5, 0.3, -0.3],
            [-0.5, 0.3, 0.3], [-0.5, 0.3, -0.3]
        ];
        legPositions.forEach(function(pos) {
            var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8), legMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            model.add(leg);

            var hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.1, 8),
                new THREE.MeshStandardMaterial({ color: skin.hooves }));
            hoof.position.set(pos[0], 0.05, pos[2]);
            model.add(hoof);
        });

        // Tail — fuse (Shimmering Bomb), lamb (cotton ball), or default (small sphere)
        if (skin.tailOverride === 'fuse') {
            // Fuse: longer cylinder going backward + glowing tip
            var fuseMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
            var fuseGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
            var fuse = new THREE.Mesh(fuseGeo, fuseMat);
            fuse.rotation.z = Math.PI / 2;
            fuse.position.set(-1.3, 0.9, 0);
            model.add(fuse);
            // Glowing orange tip
            var tipMat = new THREE.MeshStandardMaterial({
                color: 0xff4400,
                emissive: 0xff2200,
                emissiveIntensity: 1.5
            });
            var tip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), tipMat);
            tip.position.set(-1.7, 0.9, 0);
            tip.userData.isFuseTip = true;
            model.add(tip);
        } else if (skin.tailOverride === 'lamb') {
            // Fluffy cotton-ball tail — big and poofy!
            var woolMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            var cottonTail = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), woolMat);
            cottonTail.position.set(-1.15, 0.95, 0);
            model.add(cottonTail);
            // Extra fluff bumps around the cotton tail
            var fluffPositions = [
                [-1.0, 1.05, 0.08], [-1.0, 1.05, -0.08],
                [-1.25, 0.85, 0.06], [-1.25, 0.85, -0.06],
                [-1.1, 1.1, 0]
            ];
            fluffPositions.forEach(function(fp) {
                var fluff = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), woolMat);
                fluff.position.set(fp[0], fp[1], fp[2]);
                model.add(fluff);
            });
        } else {
            // Default small tail
            var tail = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), bodyMat);
            tail.position.set(-1.1, 0.9, 0);
            model.add(tail);
        }

        // Lamb wool — fluffy white bumps covering the body
        if (skin.tailOverride === 'lamb') {
            var woolBodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            // Wool tufts scattered over the back and sides
            var woolTufts = [
                // Back row (top)
                [0.3, 1.25, 0], [-0.1, 1.25, 0], [0.6, 1.2, 0], [-0.4, 1.2, 0],
                // Left side
                [0.3, 1.0, 0.5], [-0.1, 1.0, 0.5], [0.5, 1.05, 0.4], [-0.3, 1.05, 0.4],
                // Right side
                [0.3, 1.0, -0.5], [-0.1, 1.0, -0.5], [0.5, 1.05, -0.4], [-0.3, 1.05, -0.4],
                // Belly area (slightly smaller)
                [0.2, 0.6, 0.35], [-0.2, 0.6, 0.35], [0.2, 0.6, -0.35], [-0.2, 0.6, -0.35],
                // Extra top fluff
                [0.1, 1.3, 0.15], [0.1, 1.3, -0.15], [-0.3, 1.28, 0.12], [-0.3, 1.28, -0.12]
            ];
            woolTufts.forEach(function(wp) {
                var tuftSize = 0.12 + Math.random() * 0.06;
                var tuft = new THREE.Mesh(new THREE.SphereGeometry(tuftSize, 6, 6), woolBodyMat);
                tuft.position.set(wp[0], wp[1], wp[2]);
                model.add(tuft);
            });
            // Fluffy face wool (around collar area, like a lamb's woolly face)
            var faceWool = [
                [0.85, 1.15, 0.2], [0.85, 1.15, -0.2],
                [0.9, 1.2, 0], [0.75, 1.2, 0.15], [0.75, 1.2, -0.15]
            ];
            faceWool.forEach(function(fp) {
                var fw = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), woolBodyMat);
                fw.position.set(fp[0], fp[1], fp[2]);
                model.add(fw);
            });
        }

        // Collar marking
        var collarGeo = new THREE.TorusGeometry(0.55, 0.1, 12, 32);
        var collarMat = new THREE.MeshStandardMaterial({ color: skin.collar });
        var collar = new THREE.Mesh(collarGeo, collarMat);
        collar.rotation.z = Math.PI / 2;
        collar.position.set(0.5, 0.8, 0);
        model.add(collar);

        return model;
    }

    function createPeccary() {
        // Get active skin palette
        var skin = SKINS[GameState.currentSkin || 'default'] || SKINS['default'];

        // Outer group for world position/rotation
        GameState.peccary = new THREE.Group();

        // Build model from skin palette
        var model = buildPeccaryModel(skin);

        // Model built facing +X — no initial rotation needed
        GameState.peccary.add(model);

        // Cache fuse tip reference for efficient per-frame flicker
        GameState.fuseTipRef = null;
        model.traverse(function(obj) {
            if (obj.userData && obj.userData.isFuseTip) GameState.fuseTipRef = obj;
        });

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
     * Rebuild Pedro's model with the current skin. Preserves position/rotation.
     */
    function rebuildPeccary() {
        if (!GameState.peccary) return;
        var skin = SKINS[GameState.currentSkin || 'default'] || SKINS['default'];

        // Remove old model (first child of peccary group)
        while (GameState.peccary.children.length > 0) {
            var child = GameState.peccary.children[0];
            GameState.peccary.remove(child);
            child.traverse(function(obj) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
        }

        // Build fresh model
        var model = buildPeccaryModel(skin);
        GameState.peccary.add(model);

        // Re-cache fuse tip reference
        GameState.fuseTipRef = null;
        model.traverse(function(obj) {
            if (obj.userData && obj.userData.isFuseTip) GameState.fuseTipRef = obj;
        });
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
     * Dig up the ancient skull from the rock pile!
     * This is a major discovery that unlocks the snowy mountains biome.
     */
    function digUpSkull() {
        if (!GameState.skullDigSpot || !GameState.skullDigSpot.userData.hasSkull) return;

        // Mark skull as found
        GameState.skullDigSpot.userData.hasSkull = false;

        // Add skull to artifacts inventory
        if (!GameState.artifacts) GameState.artifacts = [];
        GameState.artifacts.push('felis_dronglaticus_skull');

        // Remove the glow from the dig spot
        const light = GameState.skullDigSpot.children.find(c => c.type === 'PointLight');
        if (light) {
            GameState.skullDigSpot.remove(light);
        }

        // Make rocks look dug up (darken them)
        GameState.skullDigSpot.children.forEach(child => {
            if (child.material) {
                child.material.emissive.setHex(0x000000);
                child.material.emissiveIntensity = 0;
                child.material.color.setHex(0x5a5a5a);  // Darker grey
            }
        });

        // Show discovery message
        console.log('💀🏔️ INCREDIBLE DISCOVERY! You found the Felis Dronglaticus Skull!');
        console.log('📜 The ancient skull of the cat ancestor! This could unlock new lands...');
        console.log('🔬 Take it to Ningle at the Research Hut to learn more!');

        // Play a sound effect if available
        if (window.playSound) {
            playSound('artifact');
        }

        // Show visual effect (particles, flash, etc.)
        if (window.createDiscoveryEffect) {
            createDiscoveryEffect(GameState.skullDigSpot.position);
        }

        // Update UI
        if (window.UI && window.UI.updateArtifactsDisplay) {
            window.UI.updateArtifactsDisplay();
        }
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

            // Move the gazella
            gazella.position.x += direction.x * moveSpeed * delta;
            gazella.position.z += direction.z * moveSpeed * delta;

            // Rotate to face movement direction
            // Model faces +X, so use -atan2(dz, dx) for correct rotation
            const targetRotation = -Math.atan2(direction.z, direction.x);
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
        // If mounted on flamingo, flight controls are handled in game.js
        if (GameState.mountedFlamingo) {
            return;
        }

        // If mounted on gazella, handle riding
        if (GameState.mountedAnimal) {
            updateRiding(delta);
            return;
        }

        // If sailing a raft, handle boat controls
        if (GameState.isInBoat) {
            updateBoatRiding(delta);
            return;
        }

        // Check for raft interactions (E key, not in dialog)
        if (GameState.keys['e'] && !GameState.lastKeyE && !GameState.isDialogOpen && !GameState.nearbyVillager && !GameState.isPlacingRaft) {
            // Check for nearby placed rafts
            var nearbyRaft = findNearbyRaft();
            if (nearbyRaft) {
                if (nearbyRaft.position.z > GameState.oceanDeepZ) {
                    // Raft is in deep water — board it
                    boardRaft(nearbyRaft);
                    GameState.lastKeyE = true;
                    return;
                } else if (nearbyRaft.position.z <= GameState.oceanDeepZ + 5) {
                    // Raft is near shore — pick it up
                    pickupRaft(nearbyRaft);
                    GameState.lastKeyE = true;
                    return;
                }
            }
        }

        // Check for digging up the skull (E key, not in dialog)
        if (GameState.keys['e'] && !GameState.lastKeyE && !GameState.isDialogOpen && !GameState.nearbyVillager) {
            if (GameState.skullDigSpot && GameState.skullDigSpot.userData.hasSkull) {
                const dist = GameState.peccary.position.distanceTo(GameState.skullDigSpot.position);
                if (dist < GameState.skullDigSpot.userData.interactRadius) {
                    // Dig up the skull!
                    digUpSkull();
                    GameState.lastKeyE = true;
                    return;
                }
            }
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

        // Check if player is in water (river OR watering hole OR shallow ocean)
        const inRiver = Environment.isInRiver(
            GameState.peccary.position.x,
            GameState.peccary.position.z
        );
        const inWateringHole = Environment.isInWateringHole(
            GameState.peccary.position.x,
            GameState.peccary.position.z
        );
        const inShallowOcean = Environment.isInShallowOcean(
            GameState.peccary.position.x,
            GameState.peccary.position.z
        );
        const inWater = inRiver || inWateringHole || inShallowOcean;
        GameState.playerInWater = inWater;

        const isSprinting = GameState.keys['shift'] && GameState.stamina > 0;
        let moveSpeed = isSprinting ? window.CONFIG.PLAYER_SPRINT_SPEED : window.CONFIG.PLAYER_WALK_SPEED;

        // Roller skates override (Easter item)
        if (GameState.rollerSkatesOn) {
            moveSpeed = 20;
        }

        // Testing mode - 2x speed boost!
        if (GameState.isTestingMode) {
            moveSpeed *= 2;
        }

        // Slow down in water (50% speed) or underwater (70% speed)
        if (GameState.isUnderwater) {
            moveSpeed *= 0.7;
        } else if (inWater) {
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

        // Piglet speed boost (Spark ability)
        if (GameState.pigletBuffs && GameState.pigletBuffs.speedMultiplier !== 1.0) {
            moveSpeed *= GameState.pigletBuffs.speedMultiplier;
        }

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

            GameState.peccary.position.x += direction.x * moveSpeed * delta;
            GameState.peccary.position.z += direction.z * moveSpeed * delta;

            const targetRotation = -Math.atan2(direction.z, direction.x);

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
                    // Normal walking bob — relative to ground level (so it works on islands too!)
                    GameState.peccary.position.y = GameState.groundLevel + Math.abs(Math.sin(GameState.clock.elapsedTime * 10)) * 0.1;
                }
            }

            if (isSprinting && !GameState.wasSprinting) {
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
        // Skip bounds when in the Easter biome (far west, outside normal world)
        if (!GameState.inEasterBiome) {
            const bound = CONFIG.WORLD_SIZE * 0.75;
            GameState.peccary.position.x = Math.max(-bound, Math.min(bound, GameState.peccary.position.x));
            GameState.peccary.position.z = Math.max(-bound, Math.min(bound, GameState.peccary.position.z));
        }

        // Block deep ocean — can't swim past the deep water boundary (unless in a boat or diving!)
        // Note: isInDeepOcean returns false near islands, so players can walk in island shallow zones
        if (!GameState.isInBoat && !GameState.isUnderwater && Environment.isInDeepOcean(GameState.peccary.position.x, GameState.peccary.position.z)) {
            // Player is in deep water and NOT near any island — push back
            GameState.peccary.position.z = GameState.oceanDeepZ;
        }

        // Underwater swimming — player dived off a raft with diving mask
        if (GameState.isUnderwater) {
            // Press E to climb back onto the raft
            if (GameState.keys['e'] && !GameState.lastKeyE) {
                var raft = GameState.divingRaft;
                if (raft && raft.parent) {
                    // Check if close enough to the raft
                    var dx = raft.position.x - GameState.peccary.position.x;
                    var dz = raft.position.z - GameState.peccary.position.z;
                    var distToRaft = Math.sqrt(dx * dx + dz * dz);

                    if (distToRaft < 15) {
                        // Climb back on
                        exitUnderwater();
                        boardRaft(raft);
                        GameState.divingRaft = null;
                        GameState.lastKeyE = true;
                        return; // Stop processing — we're on the raft now
                    } else {
                        Game.showBlockedMessage("Swim closer to your raft! (E to board)");
                    }
                } else {
                    // Raft is gone — just surface
                    exitUnderwater();
                    Game.showBlockedMessage("Your raft is gone! Surfacing...");
                    GameState.lastKeyE = true;
                    return;
                }
            }
            GameState.lastKeyE = GameState.keys['e'];

            // Swim at shallow depth (same level as fish!)
            GameState.peccary.position.y = -0.5 + Math.sin(GameState.clock.elapsedTime * 2) * 0.15;

            // Oxygen drain
            GameState.oxygenLevel -= (100 / GameState.maxOxygenTime) * delta;
            if (GameState.oxygenLevel <= 0) {
                GameState.oxygenLevel = 0;
                // Drowning damage — 5 HP every 2 seconds
                GameState.drowningTimer += delta;
                if (GameState.drowningTimer >= 2) {
                    GameState.drowningTimer = 0;
                    GameState.lastDamageSource = 'drowning';
                    GameState.health -= 5;
                    Game.playSound('hurt');
                    if (GameState.health <= 0) {
                        GameState.health = 0;
                        Game.gameOver();
                    }
                }
            }
            UI.updateUI(); // Update oxygen bar every frame
            return; // Skip all normal movement while underwater
        }

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

        // Temple collision (snowy mountains only)
        if (GameState.currentBiome === 'snowy_mountains' && GameState.templePosition) {
            var tx = GameState.templePosition.x;
            var tz = GameState.templePosition.z;
            var px = GameState.peccary.position.x;
            var pz = GameState.peccary.position.z;
            var dx = px - tx;
            var dz = pz - tz;
            var dist2D = Math.sqrt(dx * dx + dz * dz);

            var platformRadius = 12;
            var outerStairRadius = 15;  // How far stairs extend outward
            var stairHalfWidth = 2.5;   // Stairs are 4 wide, give a little extra
            var platformTop = 1.5;

            // Check if player is on a staircase corridor (N/S/E/W axis, within stairHalfWidth)
            var onNorthSouthStair = Math.abs(dx) < stairHalfWidth && (dz < -2 || dz > 2);
            var onEastWestStair = Math.abs(dz) < stairHalfWidth && (dx < -2 || dx > 2);
            var onStairCorridor = onNorthSouthStair || onEastWestStair;

            if (dist2D < outerStairRadius) {
                if (dist2D < platformRadius) {
                    if (onStairCorridor || dist2D < platformRadius - 1) {
                        // On the platform — set ground level to platform top
                        GameState.groundLevel = platformTop;
                        if (!GameState.isJumping && GameState.peccary.position.y < platformTop) {
                            GameState.peccary.position.y = platformTop;
                        }
                    } else {
                        // Hitting the platform edge (not on a stair) — push out
                        var pushX = dx / dist2D;
                        var pushZ = dz / dist2D;
                        GameState.peccary.position.x = tx + pushX * platformRadius;
                        GameState.peccary.position.z = tz + pushZ * platformRadius;
                    }
                } else if (onStairCorridor) {
                    // On the stairs between platform edge and outer edge
                    // Ramp from ground (0) at outerStairRadius to platformTop at platformRadius
                    var stairProgress = 1 - (dist2D - platformRadius) / (outerStairRadius - platformRadius);
                    stairProgress = Math.max(0, Math.min(1, stairProgress));
                    var stairY = stairProgress * platformTop;
                    GameState.groundLevel = stairY;
                    if (!GameState.isJumping && GameState.peccary.position.y < stairY) {
                        GameState.peccary.position.y = stairY;
                    }
                } else {
                    // Between platform and outer stair radius, but NOT on a stair
                    // Reset ground level so player doesn't float
                    GameState.groundLevel = 0;
                }
            } else {
                // Outside temple area — reset ground level
                if (GameState.groundLevel > 0) {
                    GameState.groundLevel = 0;
                }
            }
        }

        // Island terrain (coastal biome) — walk up the island surface
        if (GameState.currentBiome === 'coastal' && GameState.oceanIslands && GameState.oceanIslands.length > 0) {
            var ipx = GameState.peccary.position.x;
            var ipz = GameState.peccary.position.z;
            var currentIsland = Environment.isOnIsland(ipx, ipz);

            if (currentIsland) {
                var islandY = Environment.getIslandGroundHeight(ipx, ipz, currentIsland);
                GameState.groundLevel = islandY;
                if (!GameState.isJumping && GameState.peccary.position.y < islandY) {
                    GameState.peccary.position.y = islandY;
                }
            } else if (GameState.groundLevel > 0 && ipz > GameState.oceanDeepZ) {
                // Walked off an island — reset ground level
                GameState.groundLevel = 0;
            }
        }

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

    // ========================================================================
    // RAFT / BOAT SYSTEM
    // ========================================================================

    /**
     * Find a nearby placed raft within boarding distance.
     * @returns {THREE.Group|null} The nearest raft, or null
     */
    function findNearbyRaft() {
        if (!GameState.placedRafts || GameState.placedRafts.length === 0) return null;

        var boardDistance = 5;
        var nearest = null;
        var nearestDist = boardDistance;

        for (var i = 0; i < GameState.placedRafts.length; i++) {
            var raft = GameState.placedRafts[i];
            var dist = GameState.peccary.position.distanceTo(raft.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = raft;
            }
        }
        return nearest;
    }

    /**
     * Board a placed raft — peccary stands on the raft, start sailing mode.
     */
    function boardRaft(raft) {
        if (!raft || GameState.isInBoat) return;

        // If somehow still underwater, force exit first
        if (GameState.isUnderwater) {
            exitUnderwater();
        }

        GameState.isInBoat = true;
        GameState.activeBoat = raft;

        // Keep peccary visible — Pedro rides the raft!
        GameState.peccary.visible = true;
        GameState.peccary.position.copy(raft.position);
        GameState.peccary.position.y = raft.position.y + 0.6; // Stand on top of the raft

        Game.playSound('collect');
        console.log('Boarded raft! Use WASD to sail, press E near shore to get off.');
    }

    /**
     * Update boat riding controls — WASD movement on the ocean.
     * Very similar to gazella riding but on water!
     * @param {number} delta - Time elapsed since last frame
     */
    function updateBoatRiding(delta) {
        var raft = GameState.activeBoat;
        if (!raft) return;

        // Check for dismount (E key)
        if (GameState.keys['e'] && !GameState.lastKeyE) {
            // Can dismount near shore OR near an island
            var nearIsland = Environment.isNearIsland(raft.position.x, raft.position.z);
            if (raft.position.z <= GameState.oceanDeepZ + 5 || nearIsland) {
                dismountRaft(nearIsland);
                GameState.lastKeyE = true;
                return;
            } else {
                // In deep water — check if player has diving mask equipped
                var hotbarItem = GameState.hotbarSlots[GameState.selectedHotbarSlot];
                var hasDivingMask = hotbarItem && hotbarItem.id === 'diving_mask';
                if (hasDivingMask) {
                    // Dive off the raft!
                    GameState.divingRaft = raft; // Remember which raft to climb back on
                    GameState.isInBoat = false;
                    GameState.activeBoat = null;
                    enterUnderwater();
                    GameState.lastKeyE = true;
                    return;
                } else {
                    Game.showBlockedMessage("Too far from shore! Equip a diving mask to dive in.");
                }
            }
        }
        GameState.lastKeyE = GameState.keys['e'];

        // Movement controls — faster than walking!
        var isSprinting = GameState.keys['shift'];
        var moveSpeed = isSprinting
            ? window.CONFIG.PLAYER_SPRINT_SPEED * 1.5
            : window.CONFIG.PLAYER_WALK_SPEED * 1.8;

        var rawDir = new THREE.Vector3();
        if (GameState.keys['w'] || GameState.keys['arrowup']) rawDir.z -= 1;
        if (GameState.keys['s'] || GameState.keys['arrowdown']) rawDir.z += 1;
        if (GameState.keys['a'] || GameState.keys['arrowleft']) rawDir.x -= 1;
        if (GameState.keys['d'] || GameState.keys['arrowright']) rawDir.x += 1;

        if (rawDir.length() > 0) {
            rawDir.normalize();

            // Rotate input direction by camera angle (camera-relative movement)
            var angle = GameState.cameraAngle;
            var direction = new THREE.Vector3(
                rawDir.x * Math.cos(angle) + rawDir.z * Math.sin(angle),
                0,
                -rawDir.x * Math.sin(angle) + rawDir.z * Math.cos(angle)
            );

            // Move the raft
            raft.position.x += direction.x * moveSpeed * delta;
            raft.position.z += direction.z * moveSpeed * delta;

            // Rotate raft to face movement direction
            var targetRotation = -Math.atan2(direction.z, direction.x);
            var currentRotation = raft.rotation.y;
            var diff = targetRotation - currentRotation;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            raft.rotation.y = currentRotation + diff * 0.08; // Slower turning than gazella
        }

        // Keep raft in deep water (can't go back onto land)
        if (raft.position.z < GameState.oceanDeepZ - 2) {
            raft.position.z = GameState.oceanDeepZ - 2;
        }

        // World bounds
        var bound = CONFIG.WORLD_SIZE * 0.75;
        raft.position.x = Math.max(-bound, Math.min(bound, raft.position.x));
        raft.position.z = Math.min(bound, raft.position.z);

        // Island collision — push raft around islands
        if (GameState.oceanIslands) {
            for (var i = 0; i < GameState.oceanIslands.length; i++) {
                var island = GameState.oceanIslands[i];
                var dx = raft.position.x - island.x;
                var dz = raft.position.z - island.z;
                var dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < island.radius + 2) {
                    // Push raft out to the edge of the island
                    var pushDist = island.radius + 2;
                    if (dist > 0) {
                        raft.position.x = island.x + (dx / dist) * pushDist;
                        raft.position.z = island.z + (dz / dist) * pushDist;
                    } else {
                        raft.position.z = island.z + pushDist;
                    }
                }
            }
        }

        // Bobbing animation — gentle wave motion
        raft.userData.bobTime = (raft.userData.bobTime || 0) + delta;
        raft.position.y = 0.3 + Math.sin(raft.userData.bobTime * 2) * 0.15;

        // Keep peccary standing on top of the raft (visible + camera following)
        GameState.peccary.position.copy(raft.position);
        GameState.peccary.position.y = raft.position.y + 0.6;
        GameState.peccary.rotation.y = raft.rotation.y;
    }

    /**
     * Dismount the raft — player appears on shore or on a nearby island.
     */
    function dismountRaft(nearIsland) {
        if (!GameState.isInBoat || !GameState.activeBoat) return;

        if (nearIsland) {
            // Dismount onto island — place player at the island center (highest point)
            GameState.peccary.position.set(
                nearIsland.x,
                nearIsland.height,
                nearIsland.z
            );
            GameState.groundLevel = nearIsland.height;
        } else {
            // Dismount onto mainland shore
            GameState.peccary.position.set(
                GameState.activeBoat.position.x,
                0,
                GameState.oceanDeepZ - 1
            );
        }
        GameState.peccary.visible = true;

        GameState.isInBoat = false;
        GameState.activeBoat = null;

        Game.playSound('collect');
        console.log('Dismounted from raft.');
    }

    /**
     * Enter underwater mode — dive off raft.
     */
    function enterUnderwater() {
        GameState.isUnderwater = true;
        GameState.oxygenLevel = 100;
        GameState.drowningTimer = 0;
        // Store normal fog settings
        if (GameState.scene.fog) {
            GameState.normalFogColor = GameState.scene.fog.color.clone();
            GameState.normalFogNear = GameState.scene.fog.near;
            GameState.normalFogFar = GameState.scene.fog.far;
        }
        // Set underwater fog — blue-green, moderate visibility
        GameState.scene.fog = new THREE.Fog(0x1a5a7a, 20, 120);
        GameState.scene.background = new THREE.Color(0x1a5a7a);

        // Hide the ocean surface plane so it doesn't block the view
        if (GameState.oceanWater) {
            GameState.oceanWater.visible = false;
        }

        // Hide the raft so it doesn't float at your eye level
        if (GameState.divingRaft) {
            GameState.divingRaft.visible = false;
        }

        // Hide all placed rafts
        if (GameState.placedRafts) {
            GameState.placedRafts.forEach(function(r) { r.visible = false; });
        }

        // Hide ocean islands (above water objects)
        if (GameState.oceanIslands) {
            GameState.oceanIslands.forEach(function(island) {
                if (island.group) island.group.visible = false;
            });
        }

        // Create a sandy seafloor
        var seafloor = new THREE.Mesh(
            new THREE.PlaneGeometry(800, 800),
            new THREE.MeshStandardMaterial({
                color: 0x8B7355,
                roughness: 0.9,
                metalness: 0.0
            })
        );
        seafloor.rotation.x = -Math.PI / 2;
        seafloor.position.set(GameState.peccary.position.x, -3, GameState.peccary.position.z);
        seafloor.receiveShadow = true;
        GameState.scene.add(seafloor);
        GameState.seafloor = seafloor;

        Game.playSound('collect');
        Game.showBlockedMessage("Diving! Press E near your raft to climb back on.");
    }

    /**
     * Exit underwater mode — restore surface.
     */
    function exitUnderwater() {
        GameState.isUnderwater = false;
        GameState.oxygenLevel = 100;
        // Restore normal fog (or Easter sky if event is active)
        if (GameState.easterSkyActive) {
            GameState.scene.background = new THREE.Color(0xf5b8c4);
            GameState.scene.fog = new THREE.Fog(0xf0c0cc, 200, 1200);
        } else if (GameState.normalFogColor) {
            GameState.scene.fog = new THREE.Fog(GameState.normalFogColor, GameState.normalFogNear, GameState.normalFogFar);
            GameState.scene.background = GameState.normalFogColor.clone();
        } else {
            GameState.scene.fog = new THREE.Fog(0x87ceeb, 200, 1200);
            GameState.scene.background = new THREE.Color(0x87ceeb);
        }

        // Show the ocean surface again
        if (GameState.oceanWater) {
            GameState.oceanWater.visible = true;
        }

        // Show the raft again
        if (GameState.divingRaft) {
            GameState.divingRaft.visible = true;
        }

        // Show all placed rafts
        if (GameState.placedRafts) {
            GameState.placedRafts.forEach(function(r) { r.visible = true; });
        }

        // Show ocean islands again
        if (GameState.oceanIslands) {
            GameState.oceanIslands.forEach(function(island) {
                if (island.group) island.group.visible = true;
            });
        }

        // Remove the seafloor
        if (GameState.seafloor) {
            GameState.scene.remove(GameState.seafloor);
            GameState.seafloor = null;
        }

        GameState.peccary.position.y = 0;
    }

    /**
     * Pick up a placed raft near shore — goes back to inventory.
     */
    function pickupRaft(raft) {
        if (!raft) return;

        // Remove from scene and placedRafts array
        GameState.scene.remove(raft);
        var idx = GameState.placedRafts.indexOf(raft);
        if (idx > -1) GameState.placedRafts.splice(idx, 1);

        // Add raft back to inventory
        Inventory.addItemToInventory('basic_rook_boat', 'Basic Rook Boat', 'A seaspray birch raft! Select from hotbar, press E to place in water.', { type: 'item', item: 'basic_rook_boat' }, 1);

        Game.playSound('collect');
        Game.showBlockedMessage("Raft picked up!");
    }

    /**
     * Create the back-mounted sword mesh (initially hidden).
     * Call after createPeccary / rebuildPeccary.
     */
    function createBackSword() {
        // Remove old one if it exists
        if (GameState.backSword) {
            GameState.peccary.remove(GameState.backSword);
            GameState.backSword = null;
        }

        var swordGroup = new THREE.Group();

        // Blade — long silver rectangle lying along Pedro's back
        var bladeMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.6, roughness: 0.3 });
        var blade = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 0.08, 0.18),
            bladeMat
        );
        blade.position.set(0.2, 0, 0);
        blade.castShadow = true;
        swordGroup.add(blade);

        // Handle — brown wood grip
        var handleMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        var handle = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.12, 0.12),
            handleMat
        );
        handle.position.set(-0.6, 0, 0);
        swordGroup.add(handle);

        // Guard — gold crossbar
        var guardMat = new THREE.MeshStandardMaterial({ color: 0xDAA520, metalness: 0.5 });
        var guard = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.1, 0.4),
            guardMat
        );
        guard.position.set(-0.3, 0, 0);
        swordGroup.add(guard);

        // Position on Pedro's back — on top of the body, lying along the spine
        // Body center is at y=0.8, radius 0.6, so top is ~1.4
        swordGroup.position.set(0, 1.5, 0);
        swordGroup.visible = false;

        GameState.peccary.add(swordGroup);
        GameState.backSword = swordGroup;
    }

    /**
     * Show/hide the back sword based on currently selected hotbar item.
     */
    function updateBackSword() {
        if (!GameState.backSword) return;
        var hotbarItem = GameState.hotbarSlots[GameState.selectedHotbarSlot];
        var isSword = !!(hotbarItem && TOOL_STATS.swords && TOOL_STATS.swords[hotbarItem.id]);
        GameState.backSword.visible = isSword;
    }

    // ========================================================================
    // WICKER BASKET — back accessory for Memory Collector skin
    // ========================================================================

    function createBackBasket() {
        // Remove old basket if it exists
        destroyBackBasket();

        var skin = SKINS[GameState.currentSkin || 'default'];
        if (!skin || !skin.fogReduction) return; // Only for Memory Collector

        var basket = new THREE.Group();

        // Basket body — open-top wicker container
        var wickerColor = 0xc4913b;
        var wickerMat = new THREE.MeshStandardMaterial({ color: wickerColor, roughness: 0.9 });

        // Main basket cylinder (open top)
        var bodyGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.4, 8, 1, true);
        var body = new THREE.Mesh(bodyGeo, wickerMat);
        body.position.y = 0.2;
        body.castShadow = true;
        basket.add(body);

        // Basket bottom (flat disc)
        var bottomGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 8);
        var bottom = new THREE.Mesh(bottomGeo, wickerMat);
        bottom.position.y = 0.02;
        basket.add(bottom);

        // Wicker rim at top
        var rimGeo = new THREE.TorusGeometry(0.28, 0.03, 8, 16);
        var rimMat = new THREE.MeshStandardMaterial({ color: 0xa07030, roughness: 0.9 });
        var rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.4;
        basket.add(rim);

        // Blue glowing orb inside the basket
        var glowMat = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            emissive: 0x2244cc,
            emissiveIntensity: 1.2,
            transparent: true,
            opacity: 0.85
        });
        var glow = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), glowMat);
        glow.position.y = 0.25;
        glow.userData.isBasketGlow = true;
        basket.add(glow);

        // A few smaller orbs peeking out
        for (var i = 0; i < 3; i++) {
            var angle = (i / 3) * Math.PI * 2;
            var miniGlow = new THREE.Mesh(
                new THREE.SphereGeometry(0.07, 6, 6),
                glowMat
            );
            miniGlow.position.set(
                Math.cos(angle) * 0.12,
                0.35,
                Math.sin(angle) * 0.12
            );
            miniGlow.userData.isBasketGlow = true;
            basket.add(miniGlow);
        }

        // Position on Pedro's back — behind the body, slightly raised
        // Body backCap is at x=-0.6, body top ~1.4
        basket.position.set(-0.6, 1.1, 0);

        GameState.peccary.add(basket);
        GameState.backBasket = basket;
    }

    function destroyBackBasket() {
        if (GameState.backBasket && GameState.peccary) {
            GameState.peccary.remove(GameState.backBasket);
            GameState.backBasket.traverse(function(obj) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
            GameState.backBasket = null;
        }
    }

    function updateBackBasket() {
        if (!GameState.backBasket) return;
        // Pulse the glow orbs
        var time = Date.now() * 0.001;
        GameState.backBasket.traverse(function(obj) {
            if (obj.userData && obj.userData.isBasketGlow && obj.material) {
                obj.material.emissiveIntensity = 0.8 + Math.sin(time * 2.5 + obj.position.x * 10) * 0.5;
            }
        });
    }

    // ========================================================================
    // SKIN SPARKLES — blue light particles for Memory Collector skin
    // ========================================================================
    var SPARKLE_COUNT = 20;

    function createSkinSparkles() {
        // Remove old sparkles if they exist
        destroySkinSparkles();

        var skin = SKINS[GameState.currentSkin || 'default'];
        if (!skin || !skin.fogReduction) return; // Only sparkle skins with fog power

        var geo = new THREE.BufferGeometry();
        var positions = [];
        var angles = [];  // Each sparkle orbits at its own angle + height

        for (var i = 0; i < SPARKLE_COUNT; i++) {
            positions.push(0, 0, 0);  // Will be set in update
            angles.push({
                angle: Math.random() * Math.PI * 2,
                radius: 1.0 + Math.random() * 1.2,
                height: 0.3 + Math.random() * 1.8,
                speed: 0.5 + Math.random() * 1.0,
                bob: Math.random() * Math.PI * 2
            });
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        var mat = new THREE.PointsMaterial({
            color: 0x4488ff,
            size: 0.2,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        var sparkles = new THREE.Points(geo, mat);
        sparkles.userData = { type: 'skin_sparkles', orbitData: angles };

        GameState.scene.add(sparkles);
        GameState.skinSparkles = sparkles;
    }

    function destroySkinSparkles() {
        if (GameState.skinSparkles) {
            GameState.scene.remove(GameState.skinSparkles);
            GameState.skinSparkles.geometry.dispose();
            GameState.skinSparkles.material.dispose();
            GameState.skinSparkles = null;
        }
    }

    function updateSkinSparkles(delta) {
        if (!GameState.skinSparkles || !GameState.peccary) return;

        var sparkles = GameState.skinSparkles;
        var positions = sparkles.geometry.attributes.position.array;
        var orbitData = sparkles.userData.orbitData;
        var px = GameState.peccary.position.x;
        var py = GameState.peccary.position.y;
        var pz = GameState.peccary.position.z;
        var time = Date.now() * 0.001;

        for (var i = 0; i < SPARKLE_COUNT; i++) {
            var d = orbitData[i];
            d.angle += d.speed * delta;
            var idx = i * 3;
            positions[idx]     = px + Math.cos(d.angle) * d.radius;
            positions[idx + 1] = py + d.height + Math.sin(time * 2 + d.bob) * 0.3;
            positions[idx + 2] = pz + Math.sin(d.angle) * d.radius;
        }

        sparkles.geometry.attributes.position.needsUpdate = true;

        // Pulse opacity for a gentle glow
        sparkles.material.opacity = 0.5 + Math.sin(time * 3) * 0.3;
    }

    // Public API
    return {
        createPeccary: createPeccary,
        rebuildPeccary: rebuildPeccary,
        buildPeccaryModel: buildPeccaryModel,
        updatePlayer: updatePlayer,
        createBackSword: createBackSword,
        updateBackSword: updateBackSword,
        createSkinSparkles: createSkinSparkles,
        destroySkinSparkles: destroySkinSparkles,
        updateSkinSparkles: updateSkinSparkles,
        createBackBasket: createBackBasket,
        destroyBackBasket: destroyBackBasket,
        updateBackBasket: updateBackBasket
    };
})();
