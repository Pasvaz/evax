/**
 * DIALOGS
 * Contains NPC villagers, dialog system, and conversations.
 */

window.Dialogs = (function() {
    'use strict';

    /**
     * Create a bipedal pot-bellied pig villager.
     */
    function createPigVillager(data) {
        const villager = new THREE.Group();
        const model = new THREE.Group();

        const skinMat = new THREE.MeshStandardMaterial({ color: data.skinColor });
        const outfitMat = new THREE.MeshStandardMaterial({ color: data.outfitColor });

        const bellyGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const belly = new THREE.Mesh(bellyGeo, outfitMat);
        belly.scale.set(1, 1.1, 0.9);
        belly.position.y = 1.2;
        belly.castShadow = true;
        model.add(belly);

        const chestGeo = new THREE.SphereGeometry(0.6, 16, 16);
        const chest = new THREE.Mesh(chestGeo, outfitMat);
        chest.position.y = 2.0;
        chest.castShadow = true;
        model.add(chest);

        const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 2.8;
        head.castShadow = true;
        model.add(head);

        const snoutGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 8);
        const snout = new THREE.Mesh(snoutGeo, skinMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, 2.7, 0.5);
        model.add(snout);

        const noseMat = new THREE.MeshStandardMaterial({ color: 0xcc8899 });
        const noseGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 2.7, 0.67);
        model.add(nose);

        const nostrilMat = new THREE.MeshStandardMaterial({ color: 0x4a3030 });
        [-0.06, 0.06].forEach(offset => {
            const nostril = new THREE.Mesh(new THREE.CircleGeometry(0.04, 8), nostrilMat);
            nostril.position.set(offset, 2.7, 0.7);
            model.add(nostril);
        });

        const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a });
        [-0.18, 0.18].forEach(offset => {
            const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeWhiteMat);
            eyeWhite.position.set(offset, 2.95, 0.35);
            model.add(eyeWhite);

            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
            eye.position.set(offset, 2.95, 0.42);
            model.add(eye);
        });

        [-0.35, 0.35].forEach(offset => {
            const earGeo = new THREE.ConeGeometry(0.15, 0.3, 8);
            const ear = new THREE.Mesh(earGeo, skinMat);
            ear.position.set(offset, 3.15, 0);
            ear.rotation.z = offset > 0 ? -0.5 : 0.5;
            ear.rotation.x = 0.3;
            model.add(ear);
        });

        if (data.hatColor) {
            const hatMat = new THREE.MeshStandardMaterial({ color: data.hatColor });
            const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 16), hatMat);
            hatBrim.position.y = 3.2;
            model.add(hatBrim);

            const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.35, 16), hatMat);
            hatTop.position.y = 3.4;
            model.add(hatTop);
        }

        [-0.7, 0.7].forEach(offset => {
            const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8), outfitMat);
            upperArm.position.set(offset, 1.9, 0);
            upperArm.rotation.z = offset > 0 ? -0.3 : 0.3;
            model.add(upperArm);

            const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.4, 8), skinMat);
            lowerArm.position.set(offset * 1.15, 1.5, 0);
            model.add(lowerArm);

            const hoofMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
            const hoof = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), hoofMat);
            hoof.position.set(offset * 1.15, 1.25, 0);
            model.add(hoof);
        });

        [-0.3, 0.3].forEach(offset => {
            const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.5, 8), outfitMat);
            upperLeg.position.set(offset, 0.65, 0);
            model.add(upperLeg);

            const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8), skinMat);
            lowerLeg.position.set(offset, 0.3, 0);
            model.add(lowerLeg);

            const footMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.3), footMat);
            foot.position.set(offset, 0.05, 0.05);
            model.add(foot);
        });

        const tailGeo = new THREE.TorusGeometry(0.15, 0.05, 8, 12, Math.PI * 1.5);
        const tail = new THREE.Mesh(tailGeo, skinMat);
        tail.position.set(0, 1.2, -0.7);
        tail.rotation.y = Math.PI / 2;
        model.add(tail);

        villager.add(model);

        villager.userData = {
            type: 'villager',
            name: data.name,
            role: data.role,
            conversationTree: data.conversationTree,
            radius: 1.5,
            interactRange: 5
        };

        return villager;
    }

    /**
     * Create all villagers in the village.
     */
    function createVillagers() {
        // Guard against duplicate creation (called on biome rebuild too)
        if (GameState.villagers && GameState.villagers.length > 0) return;

        const vx = CONFIG.VILLAGE_CENTER.x;
        const vz = CONFIG.VILLAGE_CENTER.z;

        CONFIG.VILLAGER_DATA.forEach(data => {
            const villager = createPigVillager(data);

            if (data.wanderer) {
                // Wanderers spawn in the wild — southeast region of the forest
                var homeX = 200 + Math.random() * 100;
                var homeZ = 200 + Math.random() * 100;
                villager.position.set(homeX, 0, homeZ);
                villager.userData.wanderer = true;
                villager.userData.wanderTarget = { x: homeX + Math.random() * 20 - 10, z: homeZ + Math.random() * 20 - 10 };
                villager.userData.wanderTimer = 0;
                villager.userData.wanderHome = { x: homeX, z: homeZ };
                villager.userData.fleeRadius = data.fleeRadius || 15;

                // Build a small hut at home position
                buildWandererHut(homeX, homeZ);
                // Store hut position for enter detection
                GameState.timHutPosition = { x: homeX, z: homeZ };
            } else {
                villager.position.set(vx + data.position.x, 0, vz + data.position.z);
            }
            villager.rotation.y = Math.random() * Math.PI * 2;
            GameState.villagers.push(villager);
            GameState.scene.add(villager);
        });
    }

    /**
     * Update villagers - animations and proximity check.
     */
    function buildWandererHut(x, z) {
        if (!GameState.scene) return;
        var hut = new THREE.Group();

        var wallMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.8 });
        var wallLightMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
        var roofMat = new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.7 });
        var frameMat = new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 0.7 });
        var stoneMat = new THREE.MeshStandardMaterial({ color: 0x666660, roughness: 0.9 });

        var W = 6, D = 5, H = 3; // width, depth, wall height

        // === FOUNDATION — stone base ===
        var foundation = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.3, D + 0.6), stoneMat);
        foundation.position.y = 0.15;
        hut.add(foundation);

        // Floor (wood planks)
        var floorMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
        var floor = new THREE.Mesh(new THREE.BoxGeometry(W, 0.15, D), floorMat);
        floor.position.y = 0.38;
        hut.add(floor);

        // === WALLS ===
        // Back wall (solid)
        var backWall = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.3), wallMat);
        backWall.position.set(0, H / 2 + 0.3, -D / 2 + 0.15);
        hut.add(backWall);

        // Left wall (solid)
        var leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, H, D), wallMat);
        leftWall.position.set(-W / 2 + 0.15, H / 2 + 0.3, 0);
        hut.add(leftWall);

        // Right wall (solid)
        var rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, H, D), wallMat);
        rightWall.position.set(W / 2 - 0.15, H / 2 + 0.3, 0);
        hut.add(rightWall);

        // Front wall — left section (beside door)
        var doorW = 1.8, doorH = 2.4;
        var sideW = (W - doorW) / 2;
        var fwLeft = new THREE.Mesh(new THREE.BoxGeometry(sideW, H, 0.3), wallMat);
        fwLeft.position.set(-W / 2 + sideW / 2, H / 2 + 0.3, D / 2 - 0.15);
        hut.add(fwLeft);

        // Front wall — right section
        var fwRight = new THREE.Mesh(new THREE.BoxGeometry(sideW, H, 0.3), wallMat);
        fwRight.position.set(W / 2 - sideW / 2, H / 2 + 0.3, D / 2 - 0.15);
        hut.add(fwRight);

        // Front wall — above door
        var aboveDoorH = H - doorH;
        var fwTop = new THREE.Mesh(new THREE.BoxGeometry(doorW, aboveDoorH, 0.3), wallMat);
        fwTop.position.set(0, doorH + aboveDoorH / 2 + 0.3, D / 2 - 0.15);
        hut.add(fwTop);

        // Door frame (darker trim)
        var dfLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, doorH, 0.35), frameMat);
        dfLeft.position.set(-doorW / 2, doorH / 2 + 0.3, D / 2 - 0.15);
        hut.add(dfLeft);
        var dfRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, doorH, 0.35), frameMat);
        dfRight.position.set(doorW / 2, doorH / 2 + 0.3, D / 2 - 0.15);
        hut.add(dfRight);
        var dfTop = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.3, 0.15, 0.35), frameMat);
        dfTop.position.set(0, doorH + 0.3, D / 2 - 0.15);
        hut.add(dfTop);

        // === ROOF (A-frame) ===
        var roofOverhang = 0.8;
        var roofRise = 1.8; // How high the ridge is above the walls
        var roofSlope = Math.atan2(roofRise, D / 2); // angle
        var roofPanelLen = Math.sqrt((D / 2) * (D / 2) + roofRise * roofRise);

        var roofBack = new THREE.Mesh(new THREE.BoxGeometry(W + roofOverhang * 2, 0.15, roofPanelLen + roofOverhang), roofMat);
        roofBack.position.set(0, H + 0.3 + roofRise / 2, -roofPanelLen / 4);
        roofBack.rotation.x = -roofSlope;
        hut.add(roofBack);

        var roofFront = new THREE.Mesh(new THREE.BoxGeometry(W + roofOverhang * 2, 0.15, roofPanelLen + roofOverhang), roofMat);
        roofFront.position.set(0, H + 0.3 + roofRise / 2, roofPanelLen / 4);
        roofFront.rotation.x = roofSlope;
        hut.add(roofFront);

        // Ridge beam along the top
        var ridge = new THREE.Mesh(new THREE.BoxGeometry(W + roofOverhang * 2, 0.2, 0.2), frameMat);
        ridge.position.set(0, H + 0.3 + roofRise, 0);
        hut.add(ridge);

        // === GABLE TRIANGLES (fill the gaps at the sides) ===
        // Use a triangle shape via BufferGeometry
        function makeGable(side) {
            var shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.lineTo(D / 2, 0);
            shape.lineTo(0, roofRise);
            shape.closePath();
            var geom = new THREE.ShapeGeometry(shape);
            var gable = new THREE.Mesh(geom, wallLightMat);
            gable.position.set(side * (W / 2 - 0.1), H + 0.3, -D / 2);
            gable.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
            if (side < 0) {
                gable.position.z = D / 2;
            }
            return gable;
        }
        hut.add(makeGable(1));
        hut.add(makeGable(-1));

        // === WINDOW on right wall ===
        var windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.12), frameMat);
        windowFrame.position.set(W / 2 - 0.12, H / 2 + 0.6, 0);
        hut.add(windowFrame);
        // Window pane (blue-ish glass)
        var glassMat = new THREE.MeshStandardMaterial({ color: 0x88bbdd, transparent: true, opacity: 0.5, roughness: 0.1 });
        var pane = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.7, 0.05), glassMat);
        pane.position.set(W / 2 - 0.01, H / 2 + 0.6, 0);
        hut.add(pane);

        // === SIGN outside ===
        var signMat = new THREE.MeshStandardMaterial({ color: 0x8B6B4A });
        var signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 6), signMat);
        signPost.position.set(4, 1.0, 1.5);
        hut.add(signPost);
        var signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 0.12), signMat);
        signBoard.position.set(4, 2.1, 1.5);
        hut.add(signBoard);
        // Sign text backing (darker)
        var signBackMat = new THREE.MeshStandardMaterial({ color: 0x3a2818 });
        var signBack = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 0.13), signBackMat);
        signBack.position.set(4, 2.1, 1.56);
        hut.add(signBack);

        // Lightning bolt on sign (blue, two segments for zig-zag)
        var boltMat = new THREE.MeshBasicMaterial({ color: 0x44ccff });
        var bolt1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.14), boltMat);
        bolt1.position.set(3.85, 2.25, 1.6);
        bolt1.rotation.z = 0.4;
        hut.add(bolt1);
        var bolt2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.14), boltMat);
        bolt2.position.set(4.05, 1.95, 1.6);
        bolt2.rotation.z = -0.4;
        hut.add(bolt2);

        // "THUNDER" text — small blocks spelling it out (simplified: a blue bar)
        var textBar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.14), boltMat);
        textBar.position.set(4.3, 2.1, 1.6);
        hut.add(textBar);

        // === PORCH / AWNING over the door ===
        var awning = new THREE.Mesh(new THREE.BoxGeometry(doorW + 1.5, 0.1, 1.5), roofMat);
        awning.position.set(0, doorH + 0.5, D / 2 + 0.6);
        awning.rotation.x = 0.15; // slight slope forward
        hut.add(awning);

        // Awning support posts
        var postMat = new THREE.MeshStandardMaterial({ color: 0x3a2818 });
        [-doorW / 2 - 0.5, doorW / 2 + 0.5].forEach(function(px) {
            var post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, doorH + 0.3, 6), postMat);
            post.position.set(px, (doorH + 0.3) / 2 + 0.3, D / 2 + 1.2);
            hut.add(post);
        });

        // === CRATES & BARRELS outside (lived-in feel) ===
        var crateMat = new THREE.MeshStandardMaterial({ color: 0x6b5030, roughness: 0.9 });
        // Crate beside door
        var crate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), crateMat);
        crate.position.set(-W / 2 - 0.8, 0.4, D / 2 - 0.5);
        crate.rotation.y = 0.2;
        hut.add(crate);

        // Barrel on right side
        var barrelMat = new THREE.MeshStandardMaterial({ color: 0x5a4025, roughness: 0.8 });
        var barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.0, 8), barrelMat);
        barrel.position.set(W / 2 + 0.8, 0.5, -0.5);
        hut.add(barrel);
        // Barrel bands
        var bandMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.4 });
        [-0.3, 0.0, 0.3].forEach(function(by) {
            var band = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.03, 6, 12), bandMat);
            band.position.set(W / 2 + 0.8, 0.5 + by, -0.5);
            hut.add(band);
        });

        // Small anvil beside the door (thunder forge vibe)
        var anvilMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.4 });
        var anvilBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), anvilMat);
        anvilBase.position.set(W / 2 + 0.6, 0.15, D / 2 - 0.3);
        hut.add(anvilBase);
        var anvilTop = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.5), anvilMat);
        anvilTop.position.set(W / 2 + 0.6, 0.38, D / 2 - 0.3);
        hut.add(anvilTop);

        // === BLUE GLOW from inside (light through door) ===
        var interiorGlow = new THREE.PointLight(0x4488ff, 0.6, 8);
        interiorGlow.position.set(0, 1.5, D / 2 - 1);
        hut.add(interiorGlow);

        hut.position.set(x, 0, z);
        GameState.scene.add(hut);
    }

    function updateVillagers(delta) {
        GameState.nearbyVillager = null;
        GameState.nearbyTavernNPC = null;
        const interactPrompt = document.getElementById('interact-prompt');

        GameState.villagers.forEach((villager, index) => {
            villager.children[0].rotation.y = Math.sin(GameState.clock.elapsedTime * 0.5 + index) * 0.1;

            const dist = villager.position.distanceTo(GameState.peccary.position);

            // Wandering NPC movement
            if (villager.userData.wanderer) {
                villager.userData.wanderTimer = (villager.userData.wanderTimer || 0) + delta;

                // Pick a new target every 6-10 seconds
                // Every ~30 seconds, head back home
                villager.userData.wanderCycle = (villager.userData.wanderCycle || 0) + delta;
                if (villager.userData.wanderTimer > 6 + Math.random() * 4) {
                    villager.userData.wanderTimer = 0;
                    var home = villager.userData.wanderHome;
                    if (villager.userData.wanderCycle > 30) {
                        // Return home
                        villager.userData.wanderCycle = 0;
                        villager.userData.wanderTarget = { x: home.x, z: home.z };
                    } else {
                        // Wander nearby
                        villager.userData.wanderTarget = {
                            x: home.x + Math.random() * 30 - 15,
                            z: home.z + Math.random() * 30 - 15
                        };
                    }
                }

                // Move toward target
                var tgt = villager.userData.wanderTarget;
                if (tgt) {
                    var tdx = tgt.x - villager.position.x;
                    var tdz = tgt.z - villager.position.z;
                    var tDist = Math.sqrt(tdx * tdx + tdz * tdz);
                    if (tDist > 1) {
                        var speed = 2.5 * delta;
                        villager.position.x += (tdx / tDist) * speed;
                        villager.position.z += (tdz / tDist) * speed;
                        villager.rotation.y = Math.atan2(tdx, tdz);
                        // Walking bob
                        villager.position.y = Math.sin(GameState.clock.elapsedTime * 4) * 0.08;
                    } else {
                        villager.position.y = Math.sin(GameState.clock.elapsedTime * 1.5 + index) * 0.05;
                    }
                }

                // Animals flee from wanderers
                if (GameState.enemies && villager.userData.fleeRadius) {
                    GameState.enemies.forEach(function(enemy) {
                        if (!enemy.parent || !enemy.userData || enemy.userData.health <= 0) return;
                        var eDist = villager.position.distanceTo(enemy.position);
                        if (eDist < villager.userData.fleeRadius && eDist > 0.5) {
                            // Push enemy away
                            var fx = enemy.position.x - villager.position.x;
                            var fz = enemy.position.z - villager.position.z;
                            var fLen = Math.sqrt(fx * fx + fz * fz);
                            if (fLen > 0) {
                                var fleeSpeed = 8 * delta;
                                enemy.position.x += (fx / fLen) * fleeSpeed;
                                enemy.position.z += (fz / fLen) * fleeSpeed;
                            }
                        }
                    });
                }

                // Stop near player to talk
                if (dist < villager.userData.interactRange) {
                    GameState.nearbyVillager = villager;
                    var dx = GameState.peccary.position.x - villager.position.x;
                    var dz = GameState.peccary.position.z - villager.position.z;
                    villager.rotation.y = Math.atan2(dx, dz);
                    villager.userData.wanderTarget = null; // Stop walking
                }
            } else {
                // Static village NPC
                villager.position.y = Math.sin(GameState.clock.elapsedTime * 1.5 + index) * 0.05;
                if (dist < villager.userData.interactRange) {
                    GameState.nearbyVillager = villager;
                    const dx = GameState.peccary.position.x - villager.position.x;
                    const dz = GameState.peccary.position.z - villager.position.z;
                    villager.rotation.y = Math.atan2(dx, dz);
                }
            }
        });

        // Check if near tavern door (outside)
        if (typeof Tavern !== 'undefined' && Tavern.checkEnterTavern()) {
            GameState.nearTavernDoor = true;
        } else {
            GameState.nearTavernDoor = false;
        }

        // Check if near Tim's hut door (outside)
        GameState.nearTimHutDoor = checkEnterTimShop();

        if (GameState.nearTimHutDoor && !GameState.isDialogOpen) {
            interactPrompt.classList.remove('hidden');
            interactPrompt.classList.remove('locked-villager');
            interactPrompt.textContent = "Press E to enter Tim's Thunder Shop";
        } else if (GameState.nearTavernDoor && !GameState.isDialogOpen) {
            interactPrompt.classList.remove('hidden');
            interactPrompt.classList.remove('locked-villager');
            interactPrompt.textContent = 'Press E to enter the tavern';
        } else if (GameState.nearbyVillager && !GameState.isDialogOpen) {
            const villagerName = GameState.nearbyVillager.userData.name;
            const requiredScore = CONFIG.VILLAGER_REQUIRED_SCORE[villagerName] || 0;
            const isUnlocked = GameState.score >= requiredScore;

            interactPrompt.classList.remove('hidden');
            if (isUnlocked) {
                interactPrompt.textContent = 'Press E to talk';
                interactPrompt.classList.remove('locked-villager');
            } else {
                interactPrompt.textContent = 'Press E to talk (Locked \u2014 Need ' + requiredScore + ' score)';
                interactPrompt.classList.add('locked-villager');
            }
        } else if (typeof Items !== 'undefined' && Items.checkNearbyBerryBush && Items.checkNearbyBerryBush() && !GameState.isDialogOpen) {
            var nearBush = Items.checkNearbyBerryBush();
            interactPrompt.classList.remove('hidden');
            interactPrompt.classList.remove('locked-villager');
            interactPrompt.textContent = 'Press E to pick a berry (' + nearBush.userData.berriesLeft + ' left)';
        } else if (typeof Enemies !== 'undefined' && Enemies.checkBurrowInteraction && Enemies.checkBurrowInteraction() && !GameState.isDialogOpen) {
            interactPrompt.classList.remove('hidden');
            interactPrompt.classList.remove('locked-villager');
            interactPrompt.textContent = 'Press E to peek inside the burrow';
        } else if (GameState.skullDigSpot && GameState.skullDigSpot.userData.hasSkull && !GameState.isDialogOpen) {
            // Check if player is near the skull dig spot
            const dist = GameState.peccary.position.distanceTo(GameState.skullDigSpot.position);
            if (dist < GameState.skullDigSpot.userData.interactRadius) {
                interactPrompt.classList.remove('hidden');
                interactPrompt.classList.remove('locked-villager');
                interactPrompt.textContent = 'Press E to dig';
            } else {
                interactPrompt.classList.add('hidden');
            }
        } else {
            interactPrompt.classList.add('hidden');
        }
    }

    /**
     * Open dialog with a villager.
     */
    function openDialog(villager) {
        if (!villager) return;

        // Check if villager is locked by score requirement
        const villagerName = villager.userData.name;
        const requiredScore = CONFIG.VILLAGER_REQUIRED_SCORE[villagerName] || 0;

        if (GameState.score < requiredScore) {
            // Villager is LOCKED — show locked dialog
            GameState.isDialogOpen = true;
            GameState.currentDialogVillager = villager;

            const dialogBox = document.getElementById('dialog-box');
            dialogBox.classList.remove('hidden');
            document.getElementById('interact-prompt').classList.add('hidden');

            document.getElementById('dialog-name').textContent =
                villagerName + ' - ' + villager.userData.role + ' (LOCKED)';
            document.getElementById('dialog-text').textContent =
                CONFIG.LOCKED_MESSAGES[villagerName] ||
                "I'm not ready to talk to you yet. Come back when you're stronger!";

            const dialogOptions = document.getElementById('dialog-options');
            dialogOptions.innerHTML = '';
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dialog-option';
            optionDiv.setAttribute('data-option-number', 1);
            optionDiv.textContent = '1. Goodbye.';
            optionDiv.onclick = function() { closeDialog(); };
            dialogOptions.appendChild(optionDiv);

            document.getElementById('dialog-hint').textContent =
                'Need ' + requiredScore + ' score to unlock. You have ' + GameState.score + '.';
            Game.playSound('hurt');
            return;
        }

        GameState.isDialogOpen = true;
        GameState.currentDialogVillager = villager;

        if (villager.userData.conversationTree) {
            GameState.currentDialogNode = villager.userData.conversationTree.startNode;
            const node = villager.userData.conversationTree.nodes[GameState.currentDialogNode];
            renderDialogNode(node, villager);
        }

        const dialogBox = document.getElementById('dialog-box');
        dialogBox.classList.remove('hidden');
        document.getElementById('interact-prompt').classList.add('hidden');
        Game.playSound('collect');
    }

    /**
     * Render a dialog node with choices.
     */
    function renderDialogNode(node, villager) {
        const dialogName = document.getElementById('dialog-name');
        const dialogText = document.getElementById('dialog-text');
        const dialogOptions = document.getElementById('dialog-options');
        const dialogHint = document.getElementById('dialog-hint');

        // Resolve dynamic dialog content
        var resolved = resolveEasterDialog(node, villager);
        resolved = resolveTavernDialog(resolved, villager);
        var displayText = resolved.text;
        var displayChoices = resolved.choices;

        dialogName.textContent = `${villager.userData.name} - ${villager.userData.role}`;
        dialogText.innerHTML = displayText;

        dialogOptions.innerHTML = '';

        displayChoices.forEach((choice, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dialog-option';
            optionDiv.setAttribute('data-option-number', index + 1);
            optionDiv.textContent = `${index + 1}. ${choice.text}`;
            optionDiv.onclick = () => selectDialogChoice(choice, villager);
            dialogOptions.appendChild(optionDiv);
        });

        dialogHint.textContent = 'Click option or press number key (1, 2, 3...)';
    }

    /**
     * Resolve dynamic Easter dialog text and choices.
     * Returns { text, choices } — unmodified for non-Easter villagers.
     */
    function resolveEasterDialog(node, villager) {
        var text = node.text;
        var choices = node.choices;
        var name = villager.userData.name;

        // Not an Easter NPC or not dynamic — return as-is
        if ((name !== 'Marshmallow' && name !== 'Clover' && name !== 'Larry') || !text.startsWith('DYNAMIC_')) {
            return { text: text, choices: choices };
        }

        // === LARRY THE LAMB dynamic text ===
        if (name === 'Larry') {
            if (text === 'DYNAMIC_LARRY_BALANCE') {
                var eggCount = GameState.easterEggs || 0;
                return {
                    text: "You have " + eggCount + " Easter Egg" + (eggCount !== 1 ? 's' : '') + "!" +
                        (eggCount >= 150 ? " That's enough for a LEGENDARY egg!" :
                         eggCount >= 75 ? " You could afford a Gold egg!" :
                         eggCount >= 35 ? " Enough for a Silver egg!" :
                         eggCount >= 15 ? " You can buy a Bronze egg!" :
                         " Do some quests to earn more!"),
                    choices: choices
                };
            }
            if (text === 'DYNAMIC_LARRY_SHOP') {
                // Open the egg shop UI
                if (typeof openEggShop === 'function') openEggShop();
                return { text: "*Larry opens his egg crate* Take a look!", choices: choices };
            }
            if (text === 'DYNAMIC_LARRY_QUEST') {
                var qIdx = GameState.larryQuestIndex || 0;
                var allQuests = typeof larryQuests !== 'undefined' ? larryQuests : [];
                if (qIdx >= allQuests.length) {
                    return {
                        text: "*Larry wipes a tear* You've done ALL my quests! You're the best helper a chef could ask for!",
                        choices: choices
                    };
                }
                var quest = allQuests[qIdx];
                var playerHas = (GameState.resourceCounts && GameState.resourceCounts[quest.requirement.item]) || 0;
                var needed = quest.requirement.count;
                if (playerHas >= needed) {
                    // Player CAN complete — show the quest and offer to hand in
                    return {
                        text: "*Larry checks his recipe* " + quest.name + ": " + quest.description +
                            "\n\nYou have " + playerHas + "/" + needed + " — that's enough!" +
                            "\nReward: " + quest.rewardText,
                        choices: [
                            { text: "Hand them over!", nextNode: 'quest_complete' },
                            { text: "Not yet, I'll keep them.", nextNode: 'greeting' }
                        ]
                    };
                } else {
                    return {
                        text: "*Larry checks his recipe* " + quest.name + ": " + quest.description +
                            "\n\nProgress: " + playerHas + "/" + needed +
                            "\nReward: " + quest.rewardText,
                        choices: [
                            { text: "I'll go get them!", nextNode: null },
                            { text: "Back.", nextNode: 'greeting' }
                        ]
                    };
                }
            }
            if (text === 'DYNAMIC_LARRY_HEAL') {
                // Show list of knocked-out piglets with heal costs
                var koPiglets = [];
                if (GameState.ownedPiglets) {
                    for (var ki = 0; ki < GameState.ownedPiglets.length; ki++) {
                        if (GameState.ownedPiglets[ki].knockedOut) {
                            koPiglets.push(GameState.ownedPiglets[ki]);
                        }
                    }
                }
                if (koPiglets.length === 0) {
                    return {
                        text: "*Larry looks relieved* All your piglets are healthy! No healing needed. Take good care of them!",
                        choices: choices
                    };
                }
                var healCosts = {
                    'Common': 5, 'Uncommon': 10, 'Rare': 20,
                    'Ultra Rare': 35, 'Epic': 50, 'Godly': 75, 'Easter Symbol': 100
                };
                var healChoices = [];
                for (var hi = 0; hi < koPiglets.length; hi++) {
                    var kp = koPiglets[hi];
                    var cost = healCosts[kp.rarity] || 5;
                    var canAfford = (GameState.easterEggs || 0) >= cost;
                    healChoices.push({
                        text: (canAfford ? 'Heal ' : '[Need ' + cost + ' eggs] ') + kp.name + ' (' + cost + ' Easter Eggs)',
                        nextNode: canAfford ? 'heal_confirm' : 'heal_check',
                        healPigletId: kp.id,
                        healCost: cost,
                        canAfford: canAfford
                    });
                }
                healChoices.push({ text: "Maybe later.", nextNode: 'greeting' });
                return {
                    text: "*Larry examines your piglets* Oh no, some of your little ones are hurt! I can patch them up with my special Easter medicine. You have " +
                        (GameState.easterEggs || 0) + " Easter Eggs.",
                    choices: healChoices
                };
            }
            if (text === 'DYNAMIC_LARRY_HEAL_CONFIRM') {
                // The dialog system passes the selected choice data — check for pending heal
                var healId = GameState._pendingHealPigletId;
                var healCostVal = GameState._pendingHealCost;
                if (healId && healCostVal) {
                    if ((GameState.easterEggs || 0) >= healCostVal) {
                        GameState.easterEggs -= healCostVal;
                        // Find and heal the piglet
                        for (var pi = 0; pi < GameState.ownedPiglets.length; pi++) {
                            if (GameState.ownedPiglets[pi].id === healId && GameState.ownedPiglets[pi].knockedOut) {
                                GameState.ownedPiglets[pi].knockedOut = false;
                                var healedName = GameState.ownedPiglets[pi].name;
                                UI.showToast(healedName + ' Healed!', healedName + ' is back to full health!', 'Press <b>P</b> to summon it.');
                                break;
                            }
                        }
                        GameState._pendingHealPigletId = null;
                        GameState._pendingHealCost = null;
                        return {
                            text: "*Larry applies his Easter medicine* There we go, good as new! Your piglet is all patched up and ready for adventure!",
                            choices: [
                                { text: "Heal another piglet", nextNode: 'heal_check' },
                                { text: "Thanks Larry!", nextNode: 'greeting' }
                            ]
                        };
                    }
                }
                GameState._pendingHealPigletId = null;
                GameState._pendingHealCost = null;
                return {
                    text: "Hmm, something went wrong. Let's try again!",
                    choices: [{ text: "Back.", nextNode: 'heal_check' }]
                };
            }
            if (text === 'DYNAMIC_LARRY_COMPLETE') {
                var qIdx2 = GameState.larryQuestIndex || 0;
                var allQuests2 = typeof larryQuests !== 'undefined' ? larryQuests : [];
                if (qIdx2 >= allQuests2.length) {
                    return { text: "No more quests!", choices: choices };
                }
                var quest2 = allQuests2[qIdx2];
                var playerHas2 = (GameState.resourceCounts && GameState.resourceCounts[quest2.requirement.item]) || 0;
                var needed2 = quest2.requirement.count;
                if (playerHas2 >= needed2) {
                    // Actually complete the quest NOW
                    GameState.resourceCounts[quest2.requirement.item] -= needed2;
                    GameState.easterEggs = (GameState.easterEggs || 0) + quest2.reward.easterEggs;
                    GameState.completedLarryQuests = GameState.completedLarryQuests || [];
                    GameState.completedLarryQuests.push(quest2.id);
                    GameState.larryQuestIndex++;
                    if (typeof UI !== 'undefined') UI.showToast('Quest Complete! 🎉', quest2.rewardText);
                    return {
                        text: "*Larry does a happy dance* You did it! Here's " + quest2.reward.easterEggs + " Easter Eggs! " +
                            (GameState.larryQuestIndex < allQuests2.length ? "I've got another quest when you're ready!" : "That was my last quest — you're amazing!"),
                        choices: [
                            { text: "Next quest!", nextNode: 'quest_check' },
                            { text: "Thanks! Goodbye.", nextNode: null }
                        ]
                    };
                } else {
                    return {
                        text: "Hmm, looks like you don't have enough anymore. Go collect more!",
                        choices: [{ text: "OK!", nextNode: null }]
                    };
                }
            }
            return { text: text, choices: choices };
        }

        var eggs = GameState.chocolateEggs || 0;
        var quest = GameState.easterQuest;

        if (text === 'DYNAMIC_EGGS') {
            return {
                text: "You have " + eggs + " chocolate egg" + (eggs !== 1 ? 's' : '') + "!" + (eggs >= 30 ? " That's enough for Roller Skates from Clover!" : eggs >= 10 ? " Clover has some gear you can afford!" : " Keep doing quests to earn more!"),
                choices: choices
            };
        }

        if (text === 'DYNAMIC_QUEST_MENU') {
            // If player already has a quest, redirect
            if (quest) {
                var progress = getEasterQuestProgress();
                return {
                    text: "You already have a quest: \"" + quest.name + "\" (" + quest.difficulty + ")\nProgress: " + progress + "/" + quest.goal.count + "\nFinish it first, or abandon it!",
                    choices: [
                        { text: "I'll keep going!", nextNode: null },
                        { text: "Abandon quest", nextNode: 'abandon_confirm' }
                    ]
                };
            }

            // Build quest selection — show one quest from each difficulty
            var questChoices = [];
            var difficulties = ['Easy', 'Medium', 'Challenging', 'Hard', 'Almost Impossible'];
            difficulties.forEach(function(diff) {
                var available = EASTER_QUESTS.filter(function(q) { return q.difficulty === diff; });
                if (available.length > 0) {
                    var q = available[Math.floor(Math.random() * available.length)];
                    questChoices.push({
                        text: q.name + " (" + diff + " — " + q.reward + " eggs)",
                        nextNode: 'quest_accepted',
                        effectData: { type: 'easter_accept_quest', questId: q.id }
                    });
                }
            });

            // 5% chance of the rare LAMB QUEST appearing!
            var petals = GameState.resourceCounts ? (GameState.resourceCounts.cherry_petals || 0) : 0;
            if (Math.random() < 0.05 && !GameState.easterLamb) {
                var lambText = "Catch the Naughty Lamb! (RARE — 30 eggs + skin!)";
                if (petals < 30) {
                    lambText += " [Need 30 cherry petals — you have " + petals + "]";
                }
                questChoices.unshift({
                    text: lambText,
                    nextNode: 'lamb_quest_info',
                    effectData: null
                });
            }

            questChoices.push({ text: "Back.", nextNode: 'greeting' });

            return {
                text: "Here are today's quests! Pick one based on how brave you're feeling:\n\n" +
                    "Easy = 1 egg | Medium = 5 | Challenging = 10 | Hard = 15 | Almost Impossible = 20",
                choices: questChoices
            };
        }

        if (text === 'DYNAMIC_TURN_IN') {
            if (!quest) {
                return {
                    text: "You don't have an active quest to turn in! Want to pick one up?",
                    choices: [
                        { text: "Sure!", nextNode: 'quest_menu' },
                        { text: "Goodbye.", nextNode: null }
                    ]
                };
            }
            var progress = getEasterQuestProgress();
            if (progress >= quest.goal.count) {
                // Quest complete!
                return {
                    text: "COMPLETE! You finished \"" + quest.name + "\"! Here are your " + quest.reward + " chocolate egg" + (quest.reward !== 1 ? 's' : '') + "!",
                    choices: [
                        { text: "Claim reward!", nextNode: 'quest_turned_in', effectData: { type: 'easter_complete_quest' } }
                    ]
                };
            } else {
                return {
                    text: "Not done yet! \"" + quest.name + "\" — " + progress + "/" + quest.goal.count + ". Keep going!",
                    choices: [
                        { text: "I'll keep at it!", nextNode: null }
                    ]
                };
            }
        }

        if (text === 'DYNAMIC_QUEST_ACCEPTED') {
            return {
                text: "Quest accepted: \"" + (quest ? quest.name : '???') + "\"! Good luck out there, Pedro!",
                choices: choices
            };
        }

        if (text === 'DYNAMIC_QUEST_TURNED_IN') {
            return {
                text: "Wonderful! You now have " + eggs + " chocolate egg" + (eggs !== 1 ? 's' : '') + ". Spend them at Clover's shop!",
                choices: choices
            };
        }

        if (text === 'DYNAMIC_ALREADY_HAS_QUEST') {
            var progress = getEasterQuestProgress();
            return {
                text: "You're working on: \"" + (quest ? quest.name : '???') + "\" — " + progress + "/" + (quest ? quest.goal.count : '?') + ". Keep at it!",
                choices: choices
            };
        }

        if (text === 'DYNAMIC_NOT_COMPLETE') {
            var progress = getEasterQuestProgress();
            return {
                text: "Not done yet! " + progress + "/" + (quest ? quest.goal.count : '?') + ". You can do it!",
                choices: choices
            };
        }

        return { text: text, choices: choices };
    }

    /**
     * Get progress for the current Easter quest.
     */
    function getEasterQuestProgress() {
        var quest = GameState.easterQuest;
        if (!quest) return 0;
        if (quest.goal.type === 'catch_bunnies') return GameState.easterQuestBunnyCaught || 0;
        if (quest.goal.type === 'collect_easter_eggs') return GameState.easterQuestEggsCollected || 0;
        return 0;
    }

    /**
     * Resolve dynamic tavern dialog content.
     * Handles DYNAMIC_ prefixed text for tavern NPCs.
     */
    function resolveTavernDialog(node, villager) {
        var text = node.text;
        var choices = node.choices;
        var name = villager.userData.name;

        if (!text || !text.startsWith('DYNAMIC_')) {
            return { text: text, choices: choices };
        }

        // Pigias challenge check
        if (text === 'DYNAMIC_PIGIAS_CHALLENGE') {
            var collection = GameState.cardCollection || [];
            var creatures = collection.filter(function(c) { return !c.isEnergy; });
            if (creatures.length >= 3) {
                return {
                    text: "You have " + creatures.length + " creature cards — more than enough! Ready to battle?",
                    choices: [
                        { text: "Let's go!", nextNode: null, effectData: { type: 'open_game', game: 'card_game' } },
                        { text: "Not yet.", nextNode: 'greeting' }
                    ]
                };
            } else {
                return {
                    text: "You only have " + creatures.length + " creature cards... You need at least 3 to play. Buy packs from Pigierre!",
                    choices: [
                        { text: "I'll go get some.", nextNode: null }
                    ]
                };
            }
        }

        // Pigierre dynamic nodes — delegate to Tavern module
        if (text === 'DYNAMIC_PIGIERRE_QUEST' || text === 'DYNAMIC_PIGIERRE_EMILIA' ||
            text === 'DYNAMIC_PIGIERRE_GOSSIP') {
            if (typeof Tavern.resolvePigierreDialog === 'function') {
                return Tavern.resolvePigierreDialog(text);
            }
            return { text: "Hmm, I have nothing for you right now.", choices: [{ text: "OK.", nextNode: 'greeting' }] };
        }

        // Gossip NPCs — delegate to Tavern module
        if (text === 'DYNAMIC_GRUNTON_GREETING' || text === 'DYNAMIC_TRUFFLE_GREETING' ||
            text === 'DYNAMIC_SNICKERS_GREETING') {
            if (typeof Tavern.resolveGossipDialog === 'function') {
                return Tavern.resolveGossipDialog(text, name);
            }
            return { text: "...", choices: [{ text: "Goodbye.", nextNode: null }] };
        }

        // Snickers answer — resolve the pending question
        if (text === 'DYNAMIC_SNICKERS_ANSWER') {
            var question = GameState._pendingSnickersQuestion;
            if (question) {
                // Mark as heard
                if (!GameState.gossipHeard) GameState.gossipHeard = [];
                if (GameState.gossipHeard.indexOf(question.id) === -1) {
                    GameState.gossipHeard.push(question.id);
                }
                GameState._pendingSnickersQuestion = null;
                return {
                    text: "*Snickers listens with his mouth wide open*<br><br>\"" + question.response + "\"",
                    choices: [{ text: "Thanks, Snickers!", nextNode: null }]
                };
            }
            return { text: "Thanks!", choices: [{ text: "Goodbye.", nextNode: null }] };
        }

        return { text: text, choices: choices };
    }

    /**
     * Handle selecting a dialog choice.
     *
     * Choices can have effectData objects (from data files) - handled by Effects.execute().
     *
     * If an effect fails (player can't afford it), we go to failNode instead.
     */
    function selectDialogChoice(choice, villager) {
        let success = true;

        // ====================================================================
        // NEW EFFECT SYSTEM
        // ====================================================================
        // If the choice has effectData, use the Effects system
        if (choice.effectData) {
            success = Effects.execute(choice.effectData);

            // If effect failed, go to fail node
            if (!success) {
                // Use specific failNode if provided, otherwise try common fail nodes
                const failNodeId = choice.failNode ||
                    (villager.userData.conversationTree.nodes['trade_fail'] ? 'trade_fail' : 'heal_fail');
                const failNode = villager.userData.conversationTree.nodes[failNodeId];

                if (failNode) {
                    renderDialogNode(failNode, villager);
                    Game.playSound('hurt');
                    return;
                }
            }
        }

        // ====================================================================
        // LARRY HEAL — store pending heal data before navigating
        // ====================================================================
        if (choice.healPigletId && choice.canAfford) {
            GameState._pendingHealPigletId = choice.healPigletId;
            GameState._pendingHealCost = choice.healCost;
        }

        // ====================================================================
        // NAVIGATE TO NEXT NODE
        // ====================================================================
        // If there's a next node, go to it; otherwise close dialog
        if (choice.nextNode) {
            GameState.currentDialogNode = choice.nextNode;
            const nextNode = villager.userData.conversationTree.nodes[choice.nextNode];
            if (nextNode) {
                renderDialogNode(nextNode, villager);
                Game.playSound('collect');
            } else {
                closeDialog();
            }
        } else {
            // nextNode is null - end the conversation
            closeDialog();
        }
    }

    /**
     * Advance dialog or close if finished.
     */
    function advanceDialog() {
        closeDialog();
    }

    /**
     * Close the dialog box.
     */
    function closeDialog() {
        GameState.isDialogOpen = false;
        GameState.currentDialogNode = null;
        GameState.currentDialogVillager = null;
        GameState._pendingHealPigletId = null;
        GameState._pendingHealCost = null;
        document.getElementById('dialog-box').classList.add('hidden');
        document.getElementById('dialog-options').innerHTML = '';
    }

    // ================================================================
    // TIM'S THUNDER SHOP — Enterable interior with weapon podiums
    // ================================================================

    var timShopScene = null;
    var timShopCamera = null;
    var timShopPlayerPos = { x: 0, z: 5 };
    var timShopPlayerRot = Math.PI;
    var timShopNearExit = false;
    var timShopNearbyPodium = null;
    var timShopNearTim = false;
    var timShopTimNPC = null;
    var timShopPodiums = [];
    var timShopObjects = [];

    var TIM_SHOP_WIDTH = 16;
    var TIM_SHOP_DEPTH = 14;
    var TIM_SHOP_HEIGHT = 5;

    function createTimShopInterior() {
        timShopScene = new THREE.Scene();
        timShopScene.background = new THREE.Color(0x0e0e1a);

        // Moody blue-tinted lighting
        var ambient = new THREE.AmbientLight(0x3344aa, 0.3);
        timShopScene.add(ambient);

        // Central blue-white light
        var mainLight = new THREE.PointLight(0x6688ff, 1.0, 30);
        mainLight.position.set(0, 4, 0);
        timShopScene.add(mainLight);

        // Electric blue accent lights
        [[-5, 3, -4], [5, 3, -4], [-5, 3, 4], [5, 3, 4]].forEach(function(pos) {
            var light = new THREE.PointLight(0x44ccff, 0.5, 10);
            light.position.set(pos[0], pos[1], pos[2]);
            timShopScene.add(light);
        });

        // Materials
        var floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.7 });
        var wallMat = new THREE.MeshStandardMaterial({ color: 0x3a3040, roughness: 0.8 });
        var ceilMat = new THREE.MeshStandardMaterial({ color: 0x222235, roughness: 0.9 });
        var beamMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.6, metalness: 0.3 });

        // Floor
        var floor = new THREE.Mesh(new THREE.PlaneGeometry(TIM_SHOP_WIDTH, TIM_SHOP_DEPTH), floorMat);
        floor.rotation.x = -Math.PI / 2;
        timShopScene.add(floor);

        // Ceiling
        var ceiling = new THREE.Mesh(new THREE.PlaneGeometry(TIM_SHOP_WIDTH, TIM_SHOP_DEPTH), ceilMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = TIM_SHOP_HEIGHT;
        timShopScene.add(ceiling);

        // Ceiling beams
        for (var bz = -5; bz <= 5; bz += 5) {
            var beam = new THREE.Mesh(new THREE.BoxGeometry(TIM_SHOP_WIDTH, 0.3, 0.3), beamMat);
            beam.position.set(0, TIM_SHOP_HEIGHT - 0.15, bz);
            timShopScene.add(beam);
        }

        // Walls
        var backWall = new THREE.Mesh(new THREE.PlaneGeometry(TIM_SHOP_WIDTH, TIM_SHOP_HEIGHT), wallMat);
        backWall.position.set(0, TIM_SHOP_HEIGHT / 2, -TIM_SHOP_DEPTH / 2);
        timShopScene.add(backWall);

        var leftWall = new THREE.Mesh(new THREE.PlaneGeometry(TIM_SHOP_DEPTH, TIM_SHOP_HEIGHT), wallMat);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-TIM_SHOP_WIDTH / 2, TIM_SHOP_HEIGHT / 2, 0);
        timShopScene.add(leftWall);

        var rightWall = new THREE.Mesh(new THREE.PlaneGeometry(TIM_SHOP_DEPTH, TIM_SHOP_HEIGHT), wallMat);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(TIM_SHOP_WIDTH / 2, TIM_SHOP_HEIGHT / 2, 0);
        timShopScene.add(rightWall);

        // Front wall with doorway
        var fwLeft = new THREE.Mesh(new THREE.PlaneGeometry(TIM_SHOP_WIDTH / 2 - 1.5, TIM_SHOP_HEIGHT), wallMat);
        fwLeft.rotation.y = Math.PI;
        fwLeft.position.set(-TIM_SHOP_WIDTH / 4 - 0.75, TIM_SHOP_HEIGHT / 2, TIM_SHOP_DEPTH / 2);
        timShopScene.add(fwLeft);

        var fwRight = new THREE.Mesh(new THREE.PlaneGeometry(TIM_SHOP_WIDTH / 2 - 1.5, TIM_SHOP_HEIGHT), wallMat);
        fwRight.rotation.y = Math.PI;
        fwRight.position.set(TIM_SHOP_WIDTH / 4 + 0.75, TIM_SHOP_HEIGHT / 2, TIM_SHOP_DEPTH / 2);
        timShopScene.add(fwRight);

        var doorTop = new THREE.Mesh(new THREE.PlaneGeometry(3, TIM_SHOP_HEIGHT - 3.5), wallMat);
        doorTop.rotation.y = Math.PI;
        doorTop.position.set(0, TIM_SHOP_HEIGHT - (TIM_SHOP_HEIGHT - 3.5) / 2, TIM_SHOP_DEPTH / 2);
        timShopScene.add(doorTop);

        // Electric sparks on walls (decorative)
        var sparkMat = new THREE.MeshBasicMaterial({ color: 0x44ccff });
        for (var i = 0; i < 8; i++) {
            var spark = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), sparkMat);
            spark.position.set(
                (Math.random() - 0.5) * TIM_SHOP_WIDTH * 0.8,
                1 + Math.random() * 3,
                -TIM_SHOP_DEPTH / 2 + 0.2
            );
            spark.userData.wallSpark = true;
            timShopScene.add(spark);
            timShopObjects.push(spark);
        }

        // === Create Tim NPC inside ===
        timShopTimNPC = createTimShopNPC();
        timShopTimNPC.position.set(0, 0, -TIM_SHOP_DEPTH / 2 + 2.5);
        timShopScene.add(timShopTimNPC);

        // === Create podiums from Tim's shop items ===
        createTimShopPodiums();
    }

    function createTimShopNPC() {
        // Simple Tim model — same as his wandering version
        var group = new THREE.Group();
        var model = new THREE.Group();

        // Body — brown pig
        var bodyMat = new THREE.MeshStandardMaterial({ color: 0x8B6B4A });
        var body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.9, 8), bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.6;
        model.add(body);

        // Head
        var head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), bodyMat);
        head.position.set(0.6, 0.7, 0);
        model.add(head);

        // Snout
        var snoutMat = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
        var snout = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), snoutMat);
        snout.position.set(0.85, 0.65, 0);
        model.add(snout);

        // Eyes
        var eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        var eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), eyeMat);
        eyeL.position.set(0.75, 0.8, 0.2);
        model.add(eyeL);
        var eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), eyeMat);
        eyeR.position.set(0.75, 0.8, -0.2);
        model.add(eyeR);

        // Blue bandana
        var bandanaMat = new THREE.MeshStandardMaterial({ color: 0x2266cc, emissive: 0x112244, emissiveIntensity: 0.2 });
        var bandana = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.8), bandanaMat);
        bandana.position.set(0.6, 0.9, 0);
        model.add(bandana);

        // Legs
        var legMat = new THREE.MeshStandardMaterial({ color: 0x6B4423 });
        [[-0.2, 0.2], [-0.2, -0.2], [0.2, 0.2], [0.2, -0.2]].forEach(function(off) {
            var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 6), legMat);
            leg.position.set(off[0], 0.15, off[1]);
            model.add(leg);
        });

        group.add(model);
        group.userData = {
            name: 'Tim',
            type: 'tim_shop_npc',
            interactRange: 3.5
        };

        // Find Tim's conversation tree
        var timVillager = GameState.villagers ? GameState.villagers.find(function(v) { return v.userData.name === 'Tim'; }) : null;
        if (timVillager && timVillager.userData.conversationTree) {
            group.userData.conversationTree = timVillager.userData.conversationTree;
        }

        return group;
    }

    function createTimShopPodiums() {
        timShopPodiums = [];

        // Get Tim's shop items
        var timItems = [];
        if (typeof CONFIG !== 'undefined' && CONFIG.SHOP_ITEMS) {
            timItems = CONFIG.SHOP_ITEMS.filter(function(item) { return item.vendor === 'tim'; });
        } else if (typeof SHOP_ITEMS !== 'undefined') {
            timItems = SHOP_ITEMS.filter(function(item) { return item.vendor === 'tim'; });
        }

        if (timItems.length === 0) return;

        // Space podiums evenly along the walls
        var spacing = (TIM_SHOP_WIDTH - 4) / Math.max(timItems.length, 1);
        var startX = -TIM_SHOP_WIDTH / 2 + 2 + spacing / 2;

        timItems.forEach(function(item, i) {
            var podiumGroup = new THREE.Group();
            var xPos = startX + i * spacing;

            // Stone pedestal
            var pedestalMat = new THREE.MeshStandardMaterial({ color: 0x444466, roughness: 0.6, metalness: 0.3 });
            var pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 1.2, 8), pedestalMat);
            pedestal.position.y = 0.6;
            podiumGroup.add(pedestal);

            // Glass-like display top
            var topMat = new THREE.MeshStandardMaterial({ color: 0x6688aa, roughness: 0.2, metalness: 0.5 });
            var top = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.08, 12), topMat);
            top.position.y = 1.25;
            podiumGroup.add(top);

            // Blue glow under the item
            var glowLight = new THREE.PointLight(0x44ccff, 0.6, 5);
            glowLight.position.set(0, 2.5, 0);
            podiumGroup.add(glowLight);

            // Create the display model
            var displayModel = createDisplayModel(item);
            displayModel.position.y = 1.8;
            displayModel.userData.displayItem = item;
            podiumGroup.add(displayModel);

            podiumGroup.position.set(xPos, 0, -3);
            podiumGroup.userData = {
                isPodium: true,
                shopItem: item,
                displayModel: displayModel
            };

            timShopScene.add(podiumGroup);
            timShopPodiums.push(podiumGroup);
        });
    }

    function createDisplayModel(item) {
        var group = new THREE.Group();

        if (item.id === 'shop_thunder_scythe') {
            // Thunder Scythe — same model as back sword
            var hammerMat = new THREE.MeshStandardMaterial({ color: 0x2266cc, metalness: 0.8, roughness: 0.2, emissive: 0x1144aa, emissiveIntensity: 0.4 });
            var hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.5), hammerMat);
            hammerHead.position.set(0.6, 0, 0);
            group.add(hammerHead);

            var bladeMat = new THREE.MeshStandardMaterial({ color: 0x3388ff, metalness: 0.7, roughness: 0.2, emissive: 0x2266cc, emissiveIntensity: 0.3 });
            var scytheBlade = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.3), bladeMat);
            scytheBlade.position.set(0.6, 0.35, 0);
            scytheBlade.rotation.z = -0.3;
            group.add(scytheBlade);

            var handleMat = new THREE.MeshStandardMaterial({ color: 0x333344 });
            var handle = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.12), handleMat);
            handle.position.set(-0.2, 0, 0);
            group.add(handle);

            // Fizzing sparks
            var fizzMat = new THREE.MeshBasicMaterial({ color: 0x88ddff });
            for (var i = 0; i < 5; i++) {
                var spark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), fizzMat);
                spark.position.set(0.4 + Math.random() * 0.5, Math.random() * 0.4 - 0.15, Math.random() * 0.3 - 0.15);
                spark.userData.fizzSpark = true;
                group.add(spark);
            }
        } else if (item.id === 'shop_thunder_armour') {
            // Thunder Armour — body-shaped display
            var plateMat = new THREE.MeshStandardMaterial({ color: 0x2266cc, metalness: 0.7, roughness: 0.3, emissive: 0x112244, emissiveIntensity: 0.3 });

            // Torso cylinder
            var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.9, 12, 1, true), plateMat);
            group.add(torso);

            // Front cap
            var capMat = new THREE.MeshStandardMaterial({ color: 0x2266cc, metalness: 0.7, roughness: 0.3, emissive: 0x112244, emissiveIntensity: 0.3 });
            var fCap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
            fCap.rotation.x = Math.PI;
            fCap.position.y = 0.45;
            group.add(fCap);

            // Back cap
            var bCap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
            bCap.position.y = -0.45;
            group.add(bCap);

            // Shoulder guards
            var shoulderMat = new THREE.MeshStandardMaterial({ color: 0x3388ff, metalness: 0.8, roughness: 0.2 });
            var ls = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), shoulderMat);
            ls.position.set(0.4, 0.3, 0);
            group.add(ls);
            var rs = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), shoulderMat);
            rs.position.set(-0.4, 0.3, 0);
            group.add(rs);

            // Sparks
            var sparkM = new THREE.MeshBasicMaterial({ color: 0x88ddff });
            for (var j = 0; j < 4; j++) {
                var sp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), sparkM);
                var a = (j / 4) * Math.PI * 2;
                sp.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.3, 0);
                sp.userData.fizzSpark = true;
                group.add(sp);
            }
        } else if (item.id === 'shop_electric_crossbow') {
            // Electric Crossbow display
            var bowMat = new THREE.MeshStandardMaterial({ color: 0x2255bb, metalness: 0.6, roughness: 0.3, emissive: 0x112266, emissiveIntensity: 0.4 });

            // Stock
            var stock = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.15), bowMat);
            group.add(stock);

            // Bow arms
            var armMat = new THREE.MeshStandardMaterial({ color: 0x3377dd, metalness: 0.5, roughness: 0.3, emissive: 0x1144aa, emissiveIntensity: 0.3 });
            var la = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.7), armMat);
            la.position.set(0.5, 0, 0);
            la.rotation.x = 0.2;
            group.add(la);
            var ra = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.7), armMat);
            ra.position.set(0.5, 0, 0);
            ra.rotation.x = -0.2;
            group.add(ra);

            // Bowstring
            var strMat = new THREE.MeshBasicMaterial({ color: 0x88ddff });
            var str = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.65), strMat);
            str.position.set(0.5, 0.06, 0);
            group.add(str);

            // Grip
            var gripMat = new THREE.MeshStandardMaterial({ color: 0x222244 });
            var grip = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.15), gripMat);
            grip.position.set(-0.2, -0.12, 0);
            group.add(grip);

            // Front glow
            var glowM = new THREE.MeshBasicMaterial({ color: 0x44ccff });
            var gl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), glowM);
            gl.position.set(0.6, 0, 0);
            gl.userData.fizzSpark = true;
            group.add(gl);

            // Sparks
            var fzM = new THREE.MeshBasicMaterial({ color: 0x88ddff });
            for (var k = 0; k < 4; k++) {
                var fz = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), fzM);
                fz.position.set(0.3 + Math.random() * 0.3, Math.random() * 0.15 - 0.07, Math.random() * 0.5 - 0.25);
                fz.userData.fizzSpark = true;
                group.add(fz);
            }
        } else {
            // Generic display — floating glowing cube
            var mat = new THREE.MeshStandardMaterial({ color: 0x44ccff, emissive: 0x2266cc, emissiveIntensity: 0.5 });
            var cube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat);
            group.add(cube);
        }

        return group;
    }

    function checkEnterTimShop() {
        if (GameState.isInsideTimShop || GameState.isInsideTavern || GameState.isInsideHut) return false;
        if (!GameState.timHutPosition || !GameState.peccary) return false;
        if (GameState.currentBiome !== 'arboreal') return false;

        var hut = GameState.timHutPosition;
        // Door is at front (+Z side) of the hut
        var dx = GameState.peccary.position.x - hut.x;
        var dz = GameState.peccary.position.z - (hut.z + 2.5);
        var dist = Math.sqrt(dx * dx + dz * dz);
        return dist < 4;
    }

    function enterTimShop() {
        if (GameState.isInsideTimShop) return;

        // Create scene if needed
        if (!timShopScene) {
            createTimShopInterior();
        }

        // Save outside position
        GameState.savedTimShopPosition = {
            x: GameState.peccary.position.x,
            z: GameState.peccary.position.z
        };
        GameState.isInsideTimShop = true;

        // Reset player position inside (near door)
        timShopPlayerPos = { x: 0, z: 5 };
        timShopPlayerRot = Math.PI;

        // Setup camera
        if (!timShopCamera) {
            timShopCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        }
        updateTimShopCamera();

        // Store references for rendering
        GameState.timShopScene = timShopScene;
        GameState.timShopCamera = timShopCamera;

        UI.showToast("Tim's Thunder Shop", 'Walk around with WASD. Press E near a podium to inspect.');
        console.log("Entered Tim's Thunder Shop.");
    }

    function exitTimShop() {
        if (!GameState.isInsideTimShop) return;
        GameState.isInsideTimShop = false;

        if (GameState.savedTimShopPosition) {
            GameState.peccary.position.x = GameState.savedTimShopPosition.x;
            GameState.peccary.position.z = GameState.savedTimShopPosition.z;
        }

        GameState.timShopScene = null;
        GameState.timShopCamera = null;

        // Hide stats overlay if open
        var overlay = document.getElementById('tim-stats-overlay');
        if (overlay) overlay.classList.add('hidden');

        console.log("Left Tim's Thunder Shop.");
    }

    function updateTimShop(delta) {
        if (!GameState.isInsideTimShop) return;
        var time = Date.now() * 0.001;

        // Animate wall sparks
        timShopObjects.forEach(function(obj) {
            if (obj.userData.wallSpark) {
                obj.material.opacity = 0.5 + Math.sin(time * 3 + obj.position.x * 5) * 0.5;
                obj.position.y += Math.sin(time * 2 + obj.position.x) * 0.001;
            }
        });

        // Animate podium display models — spin and bob
        timShopPodiums.forEach(function(podium) {
            var dm = podium.userData.displayModel;
            if (dm) {
                dm.rotation.y = time * 0.8;
                dm.position.y = 1.8 + Math.sin(time * 1.5) * 0.1;
            }
            // Animate fizz sparks on display models
            dm.traverse(function(child) {
                if (child.userData && child.userData.fizzSpark) {
                    child.position.x += Math.sin(time * 5 + child.id) * 0.002;
                    child.position.y += Math.cos(time * 4 + child.id * 2) * 0.002;
                }
            });
        });

        // Animate Tim NPC idle sway
        if (timShopTimNPC && timShopTimNPC.children[0]) {
            timShopTimNPC.children[0].rotation.y = Math.sin(time * 0.8) * 0.05;
            timShopTimNPC.children[0].position.y = Math.sin(time * 1.2) * 0.02;
        }

        // Handle movement
        handleTimShopMovement(delta);

        // Check proximity to podiums
        timShopNearbyPodium = null;
        timShopPodiums.forEach(function(podium) {
            var dx = timShopPlayerPos.x - podium.position.x;
            var dz = timShopPlayerPos.z - podium.position.z;
            var dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 2.5) {
                timShopNearbyPodium = podium;
            }
        });

        // Check proximity to Tim
        timShopNearTim = false;
        if (timShopTimNPC) {
            var dx = timShopPlayerPos.x - timShopTimNPC.position.x;
            var dz = timShopPlayerPos.z - timShopTimNPC.position.z;
            if (Math.sqrt(dx * dx + dz * dz) < 3) {
                timShopNearTim = true;
            }
        }

        // Check near exit
        timShopNearExit = (timShopPlayerPos.z > TIM_SHOP_DEPTH / 2 - 2.5 && Math.abs(timShopPlayerPos.x) < 2);

        // Update camera
        updateTimShopCamera();

        // Update interact prompt
        var prompt = document.getElementById('interact-prompt');
        if (timShopNearExit) {
            prompt.classList.remove('hidden');
            prompt.classList.remove('locked-villager');
            prompt.textContent = "Press E to leave Tim's shop";
        } else if (timShopNearbyPodium) {
            prompt.classList.remove('hidden');
            prompt.classList.remove('locked-villager');
            prompt.textContent = 'Press E to inspect ' + timShopNearbyPodium.userData.shopItem.name;
        } else if (timShopNearTim) {
            prompt.classList.remove('hidden');
            prompt.classList.remove('locked-villager');
            prompt.textContent = 'Press E to talk to Tim';
        } else {
            prompt.classList.add('hidden');
        }
    }

    function handleTimShopMovement(delta) {
        var moveSpeed = 5;
        var turnSpeed = 3;

        if (GameState.keys['a'] || GameState.keys['arrowleft']) timShopPlayerRot += turnSpeed * delta;
        if (GameState.keys['d'] || GameState.keys['arrowright']) timShopPlayerRot -= turnSpeed * delta;
        if (GameState.keys['w'] || GameState.keys['arrowup']) {
            timShopPlayerPos.x += Math.sin(timShopPlayerRot) * moveSpeed * delta;
            timShopPlayerPos.z += Math.cos(timShopPlayerRot) * moveSpeed * delta;
        }
        if (GameState.keys['s'] || GameState.keys['arrowdown']) {
            timShopPlayerPos.x -= Math.sin(timShopPlayerRot) * moveSpeed * delta;
            timShopPlayerPos.z -= Math.cos(timShopPlayerRot) * moveSpeed * delta;
        }

        var margin = 1.5;
        timShopPlayerPos.x = Math.max(-TIM_SHOP_WIDTH / 2 + margin, Math.min(TIM_SHOP_WIDTH / 2 - margin, timShopPlayerPos.x));
        timShopPlayerPos.z = Math.max(-TIM_SHOP_DEPTH / 2 + margin, Math.min(TIM_SHOP_DEPTH / 2 - margin, timShopPlayerPos.z));
    }

    function updateTimShopCamera() {
        if (!timShopCamera) return;
        var camDist = 7;
        var camHeight = 5;
        timShopCamera.position.set(
            timShopPlayerPos.x - Math.sin(timShopPlayerRot) * camDist,
            camHeight,
            timShopPlayerPos.z - Math.cos(timShopPlayerRot) * camDist
        );
        timShopCamera.lookAt(timShopPlayerPos.x, 1.5, timShopPlayerPos.z);
    }

    function handleTimShopInteraction() {
        if (!GameState.isInsideTimShop) return;

        if (GameState.isDialogOpen) {
            closeDialog();
            return;
        }

        // Hide stats overlay if open
        var overlay = document.getElementById('tim-stats-overlay');
        if (overlay && !overlay.classList.contains('hidden')) {
            overlay.classList.add('hidden');
            return;
        }

        if (timShopNearExit) {
            exitTimShop();
            return;
        }

        if (timShopNearbyPodium) {
            showPodiumStats(timShopNearbyPodium.userData.shopItem);
            return;
        }

        if (timShopNearTim && timShopTimNPC) {
            openDialog(timShopTimNPC);
        }
    }

    function showPodiumStats(item) {
        // Create or get the stats overlay
        var overlay = document.getElementById('tim-stats-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'tim-stats-overlay';
            overlay.className = 'hidden';
            overlay.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
                'background:rgba(10,10,30,0.95);border:2px solid #44ccff;border-radius:12px;padding:24px;' +
                'color:#fff;font-family:monospace;z-index:1000;min-width:280px;box-shadow:0 0 30px rgba(68,204,255,0.3);';
            document.body.appendChild(overlay);
        }

        var html = '<div style="text-align:center;margin-bottom:12px;">';
        html += '<span style="font-size:28px;">' + item.icon + '</span><br>';
        html += '<b style="color:#44ccff;font-size:18px;">' + item.name + '</b></div>';
        html += '<div style="color:#aabbcc;margin-bottom:12px;">' + item.description + '</div>';
        html += '<div style="border-top:1px solid #334;padding-top:8px;">';

        // Show stats based on item type
        if (item.effect && item.effect.item) {
            var itemId = item.effect.item;
            // Check for weapon stats
            if (typeof TOOL_STATS !== 'undefined' && TOOL_STATS.swords && TOOL_STATS.swords[itemId]) {
                var stats = TOOL_STATS.swords[itemId];
                html += '<div style="color:#ff8844;">⚔️ Damage: ' + stats.damage + '</div>';
                if (stats.spinRange) html += '<div style="color:#88aaff;">🌀 Spin Range: ' + stats.spinRange + '</div>';
                if (stats.spinDuration) html += '<div style="color:#88aaff;">⏱️ Spin Duration: ' + stats.spinDuration + 's</div>';
                if (stats.attackCooldown) html += '<div style="color:#88aaff;">⏳ Cooldown: ' + stats.attackCooldown + 's</div>';
                if (stats.staminaCost) html += '<div style="color:#ffcc44;">💪 Stamina Cost: ' + (stats.staminaCost * 100) + '%</div>';
                if (stats.thunderMinDmg) html += '<div style="color:#44ccff;">⚡ Thunder: ' + stats.thunderMinDmg + '-' + stats.thunderMaxDmg + ' damage</div>';
                if (stats.thunderMaxRange) html += '<div style="color:#44ccff;">📏 Thunder Range: ' + stats.thunderMaxRange + '</div>';
                if (stats.thunderCooldown) html += '<div style="color:#44ccff;">⏳ Thunder CD: ' + stats.thunderCooldown + 's</div>';
                if (stats.boltMinDmg) html += '<div style="color:#66ddff;">🏹 Bolt: ' + stats.boltMinDmg + '-' + stats.boltMaxDmg + ' damage</div>';
                if (stats.boltMaxRange) html += '<div style="color:#66ddff;">📏 Bolt Range: ' + stats.boltMaxRange + '</div>';
                if (stats.boltCooldown) html += '<div style="color:#66ddff;">⏳ Bolt CD: ' + stats.boltCooldown + 's</div>';
                if (stats.runStaminaMultiplier) html += '<div style="color:#ff6644;">⚠️ Sprint Drain: ' + stats.runStaminaMultiplier + 'x while equipped</div>';
            }
            // Check for armour
            if (itemId === 'thunder_armour') {
                html += '<div style="color:#44ccff;">🛡️ Damage Reduction: -1 flat, -15%</div>';
                html += '<div style="color:#ffcc44;">⚡ Shock: 2 damage to attackers</div>';
            }
        }

        html += '<div style="color:#ffdd44;margin-top:8px;">💰 Price: ' + item.price + ' pig coins</div>';
        html += '</div>';
        html += '<div style="text-align:center;margin-top:12px;color:#667;font-size:12px;">Press E to close</div>';

        overlay.innerHTML = html;
        overlay.classList.remove('hidden');
    }

    function renderTimShop() {
        if (!GameState.isInsideTimShop || !timShopScene || !timShopCamera) return;
        GameState.renderer.render(timShopScene, timShopCamera);
    }

    // Public API
    return {
        createPigVillager: createPigVillager,
        createVillagers: createVillagers,
        updateVillagers: updateVillagers,
        openDialog: openDialog,
        closeDialog: closeDialog,
        advanceDialog: advanceDialog,
        selectDialogChoice: selectDialogChoice,
        checkEnterTimShop: checkEnterTimShop,
        enterTimShop: enterTimShop,
        exitTimShop: exitTimShop,
        updateTimShop: updateTimShop,
        renderTimShop: renderTimShop,
        handleTimShopInteraction: handleTimShopInteraction
    };
})();
