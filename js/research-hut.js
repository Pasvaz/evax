/**
 * ============================================================================
 * RESEARCH HUT MODULE
 * ============================================================================
 *
 * Handles Ningle's Research Hut - the artifact analysis center.
 * Features:
 * - Enter/exit the hut (E key when near door)
 * - Separate interior scene (TARDIS-style bigger inside)
 * - Three scientists: Ningle, Drongat, and Pokeir
 * - Give artifacts to scientists to learn their lore
 * - Outside world pauses while inside
 *
 * ============================================================================
 */

window.ResearchHut = (function() {
    'use strict';

    // Interior scene state
    let interiorScene = null;
    let interiorCamera = null;
    let interiorRenderer = null;
    let interiorAnimationId = null;
    let scientists = [];
    let interiorObjects = [];

    // Interior dimensions (bigger than the outside!)
    const INTERIOR_WIDTH = 30;
    const INTERIOR_DEPTH = 25;
    const INTERIOR_HEIGHT = 8;

    // Player position inside hut
    let playerPosition = { x: 0, z: 10 };
    let playerRotation = 0;

    // Scientist being talked to
    let nearbyScientist = null;

    /**
     * Initialize the research hut system.
     */
    function init() {
        // Create interior scene (reused each time you enter)
        createInteriorScene();
    }

    /**
     * Create the interior scene - a spacious laboratory.
     */
    function createInteriorScene() {
        interiorScene = new THREE.Scene();
        interiorScene.background = new THREE.Color(0x2a2520);

        // Ambient lighting (warm interior)
        const ambient = new THREE.AmbientLight(0xfff5e6, 0.4);
        interiorScene.add(ambient);

        // Main overhead lights
        const mainLight = new THREE.PointLight(0xfff0cc, 1, 40);
        mainLight.position.set(0, 7, 0);
        interiorScene.add(mainLight);

        // Additional lights for corners
        const light1 = new THREE.PointLight(0xffcc88, 0.5, 20);
        light1.position.set(-10, 6, -8);
        interiorScene.add(light1);

        const light2 = new THREE.PointLight(0xffcc88, 0.5, 20);
        light2.position.set(10, 6, -8);
        interiorScene.add(light2);

        // Floor
        const floorGeo = new THREE.PlaneGeometry(INTERIOR_WIDTH, INTERIOR_DEPTH);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x5c4a3a,
            roughness: 0.8
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        interiorScene.add(floor);
        interiorObjects.push(floor);

        // Walls
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xc4a882,
            roughness: 0.9
        });

        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_WIDTH, INTERIOR_HEIGHT),
            wallMat
        );
        backWall.position.set(0, INTERIOR_HEIGHT / 2, -INTERIOR_DEPTH / 2);
        interiorScene.add(backWall);
        interiorObjects.push(backWall);

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_DEPTH, INTERIOR_HEIGHT),
            wallMat
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-INTERIOR_WIDTH / 2, INTERIOR_HEIGHT / 2, 0);
        interiorScene.add(leftWall);
        interiorObjects.push(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_DEPTH, INTERIOR_HEIGHT),
            wallMat
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(INTERIOR_WIDTH / 2, INTERIOR_HEIGHT / 2, 0);
        interiorScene.add(rightWall);
        interiorObjects.push(rightWall);

        // Front wall with doorway
        const frontWallLeft = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_WIDTH / 2 - 2, INTERIOR_HEIGHT),
            wallMat
        );
        frontWallLeft.rotation.y = Math.PI;
        frontWallLeft.position.set(-INTERIOR_WIDTH / 4 - 1, INTERIOR_HEIGHT / 2, INTERIOR_DEPTH / 2);
        interiorScene.add(frontWallLeft);

        const frontWallRight = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_WIDTH / 2 - 2, INTERIOR_HEIGHT),
            wallMat
        );
        frontWallRight.rotation.y = Math.PI;
        frontWallRight.position.set(INTERIOR_WIDTH / 4 + 1, INTERIOR_HEIGHT / 2, INTERIOR_DEPTH / 2);
        interiorScene.add(frontWallRight);

        // Door frame
        const doorTop = new THREE.Mesh(
            new THREE.PlaneGeometry(4, INTERIOR_HEIGHT - 4),
            wallMat
        );
        doorTop.rotation.y = Math.PI;
        doorTop.position.set(0, INTERIOR_HEIGHT - 2, INTERIOR_DEPTH / 2);
        interiorScene.add(doorTop);

        // Ceiling
        const ceilingGeo = new THREE.PlaneGeometry(INTERIOR_WIDTH, INTERIOR_DEPTH);
        const ceilingMat = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.9
        });
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = INTERIOR_HEIGHT;
        interiorScene.add(ceiling);

        // Add laboratory furniture
        createLabFurniture();

        // Add the three scientists
        createScientists();
    }

    /**
     * Create laboratory furniture and decorations.
     */
    function createLabFurniture() {
        const woodColor = 0x6b4423;
        const metalColor = 0x666666;

        // Large central table
        const tableGeo = new THREE.BoxGeometry(8, 0.2, 4);
        const tableMat = new THREE.MeshStandardMaterial({ color: woodColor });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.set(0, 1.1, -2);
        interiorScene.add(table);

        // Table legs
        const legGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: woodColor });
        [[-3.5, -1.5], [3.5, -1.5], [-3.5, 1.5], [3.5, 1.5]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(x, 0.5, z - 2);
            interiorScene.add(leg);
        });

        // Shelves on back wall (full of books and artifacts)
        for (let i = 0; i < 3; i++) {
            const shelfGeo = new THREE.BoxGeometry(8, 0.15, 1);
            const shelf = new THREE.Mesh(shelfGeo, tableMat);
            shelf.position.set(-8, 2 + i * 1.8, -INTERIOR_DEPTH / 2 + 0.6);
            interiorScene.add(shelf);

            // Add some "books" on shelves
            for (let j = 0; j < 10; j++) {
                const bookGeo = new THREE.BoxGeometry(0.3, 0.8 + Math.random() * 0.3, 0.6);
                const bookMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(Math.random(), 0.5, 0.4)
                });
                const book = new THREE.Mesh(bookGeo, bookMat);
                book.position.set(-11.5 + j * 0.7, 2.5 + i * 1.8, -INTERIOR_DEPTH / 2 + 0.6);
                interiorScene.add(book);
            }
        }

        // Right side - more shelves
        for (let i = 0; i < 2; i++) {
            const shelfGeo = new THREE.BoxGeometry(8, 0.15, 1);
            const shelf = new THREE.Mesh(shelfGeo, tableMat);
            shelf.position.set(8, 2.5 + i * 2, -INTERIOR_DEPTH / 2 + 0.6);
            interiorScene.add(shelf);
        }

        // Desk on left side
        const deskGeo = new THREE.BoxGeometry(4, 0.15, 2.5);
        const desk = new THREE.Mesh(deskGeo, tableMat);
        desk.position.set(-INTERIOR_WIDTH / 2 + 2.5, 1.1, -5);
        interiorScene.add(desk);

        // Desk chair
        const chairGeo = new THREE.BoxGeometry(1, 0.5, 1);
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const chair = new THREE.Mesh(chairGeo, chairMat);
        chair.position.set(-INTERIOR_WIDTH / 2 + 2.5, 0.8, -3);
        interiorScene.add(chair);

        // Mysterious glowing artifacts on display
        createDisplayArtifacts();

        // Equipment - microscope-like device on main table
        const scopeBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.6, 0.3, 12),
            new THREE.MeshStandardMaterial({ color: metalColor })
        );
        scopeBase.position.set(2, 1.35, -2);
        interiorScene.add(scopeBase);

        const scopeTube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: metalColor })
        );
        scopeTube.position.set(2, 2, -2);
        interiorScene.add(scopeTube);

        const scopeEye = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.15, 0.4, 8),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        scopeEye.position.set(2, 2.8, -2);
        interiorScene.add(scopeEye);

        // Beakers and flasks on table
        for (let i = 0; i < 5; i++) {
            const beakerGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8);
            const beakerMat = new THREE.MeshStandardMaterial({
                color: 0xaaddff,
                transparent: true,
                opacity: 0.6
            });
            const beaker = new THREE.Mesh(beakerGeo, beakerMat);
            beaker.position.set(-2 + i * 0.5, 1.5, -1);
            interiorScene.add(beaker);

            // Liquid inside
            const liquidGeo = new THREE.CylinderGeometry(0.12, 0.17, 0.3, 8);
            const liquidMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
                transparent: true,
                opacity: 0.8
            });
            const liquid = new THREE.Mesh(liquidGeo, liquidMat);
            liquid.position.set(-2 + i * 0.5, 1.35, -1);
            interiorScene.add(liquid);
        }
    }

    /**
     * Create glowing artifact displays.
     */
    function createDisplayArtifacts() {
        // Display cases with glowing "already collected" artifacts
        const displayPositions = [
            { x: 8, z: 0 },
            { x: 8, z: 4 },
            { x: -8, z: 4 }
        ];

        displayPositions.forEach((pos, i) => {
            // Glass case
            const caseGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
            const caseMat = new THREE.MeshStandardMaterial({
                color: 0xaaddff,
                transparent: true,
                opacity: 0.2
            });
            const displayCase = new THREE.Mesh(caseGeo, caseMat);
            displayCase.position.set(pos.x, 1.5, pos.z);
            interiorScene.add(displayCase);

            // Pedestal
            const pedestalGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.5, 12);
            const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
            const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
            pedestal.position.set(pos.x, 0.25, pos.z);
            interiorScene.add(pedestal);

            // Glowing orb (representing an artifact)
            const orbGeo = new THREE.SphereGeometry(0.3, 16, 16);
            const orbColors = [0xff6600, 0x00ff66, 0x6600ff];
            const orbMat = new THREE.MeshStandardMaterial({
                color: orbColors[i],
                emissive: orbColors[i],
                emissiveIntensity: 0.5
            });
            const orb = new THREE.Mesh(orbGeo, orbMat);
            orb.position.set(pos.x, 1, pos.z);
            orb.userData.bobOffset = i * Math.PI * 0.666;
            interiorScene.add(orb);
            interiorObjects.push(orb);
        });
    }

    /**
     * Create the three pig scientists.
     */
    function createScientists() {
        const scientistData = [
            {
                id: 'ningle',
                name: 'Ningle',
                color: 0x8b6b4a,
                coatColor: 0xffffff,
                position: { x: 0, z: -4 },
                greeting: "Welcome to my laboratory! I'm Ningle, lead researcher here. Do you have any artifacts for me to examine?"
            },
            {
                id: 'drongat',
                name: 'Drongat',
                color: 0x6b5040,
                coatColor: 0xeeeedd,
                position: { x: -6, z: 2 },
                greeting: "Ah, a visitor! I'm Drongat. I specialize in crystal analysis. Got any artifacts?"
            },
            {
                id: 'pokeir',
                name: 'Pokeir',
                color: 0x7a5a4a,
                coatColor: 0xddddcc,
                position: { x: 6, z: 0 },
                greeting: "Hello there! Pokeir here, artifact historian. Show me what you've found!"
            }
        ];

        scientistData.forEach(data => {
            const scientist = createScientistModel(data);
            scientist.position.set(data.position.x, 0, data.position.z);
            scientist.userData = {
                id: data.id,
                name: data.name,
                greeting: data.greeting,
                type: 'scientist',
                radius: 1.5,
                walkTarget: null,
                walkTimer: Math.random() * 5
            };
            scientists.push(scientist);
            interiorScene.add(scientist);
        });
    }

    /**
     * Create a pig scientist model.
     * @param {Object} data - Scientist data (name, colors, etc.)
     * @returns {THREE.Group}
     */
    function createScientistModel(data) {
        const scientist = new THREE.Group();

        // Body - standing upright like villagers
        const bodyGeo = new THREE.CapsuleGeometry(0.4, 0.8, 8, 12);
        const bodyMat = new THREE.MeshStandardMaterial({ color: data.color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.2;
        scientist.add(body);

        // Lab coat (white robe over body)
        const coatGeo = new THREE.CapsuleGeometry(0.45, 0.9, 8, 12);
        const coatMat = new THREE.MeshStandardMaterial({ color: data.coatColor });
        const coat = new THREE.Mesh(coatGeo, coatMat);
        coat.position.y = 1.15;
        coat.scale.set(1, 0.95, 0.6);
        scientist.add(coat);

        // Head
        const headGeo = new THREE.SphereGeometry(0.35, 12, 10);
        const headMat = new THREE.MeshStandardMaterial({ color: data.color });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2;
        scientist.add(head);

        // Snout
        const snoutGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.25, 8);
        const snoutMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });
        const snout = new THREE.Mesh(snoutGeo, snoutMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, 1.95, 0.35);
        scientist.add(snout);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.15, 2.1, 0.25);
        scientist.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.15, 2.1, 0.25);
        scientist.add(rightEye);

        // Glasses (optional for variety)
        if (data.id === 'ningle' || data.id === 'drongat') {
            const glassesColor = 0x333333;
            const glassMat = new THREE.MeshStandardMaterial({ color: glassesColor });

            // Left lens frame
            const lensFrameGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 16);
            const leftFrame = new THREE.Mesh(lensFrameGeo, glassMat);
            leftFrame.position.set(-0.15, 2.1, 0.3);
            scientist.add(leftFrame);

            // Right lens frame
            const rightFrame = new THREE.Mesh(lensFrameGeo, glassMat);
            rightFrame.position.set(0.15, 2.1, 0.3);
            scientist.add(rightFrame);

            // Bridge
            const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 6);
            const bridge = new THREE.Mesh(bridgeGeo, glassMat);
            bridge.rotation.z = Math.PI / 2;
            bridge.position.set(0, 2.1, 0.32);
            scientist.add(bridge);
        }

        // Ears
        const earGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const earMat = new THREE.MeshStandardMaterial({ color: data.color });
        const leftEar = new THREE.Mesh(earGeo, earMat);
        leftEar.position.set(-0.3, 2.25, 0);
        leftEar.scale.set(1, 1.2, 0.5);
        scientist.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, earMat);
        rightEar.position.set(0.3, 2.25, 0);
        rightEar.scale.set(1, 1.2, 0.5);
        scientist.add(rightEar);

        // Legs
        const legGeo = new THREE.CapsuleGeometry(0.12, 0.4, 6, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: data.color });
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.2, 0.3, 0);
        scientist.add(leftLeg);
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.2, 0.3, 0);
        scientist.add(rightLeg);

        return scientist;
    }

    /**
     * Enter the research hut.
     */
    function enterHut() {
        if (GameState.isInsideHut) return;

        // Save outside state
        GameState.savedOutsidePosition = {
            x: GameState.peccary.position.x,
            z: GameState.peccary.position.z
        };
        GameState.isInsideHut = true;

        // Reset player position inside
        playerPosition = { x: 0, z: 10 };
        playerRotation = Math.PI; // Face into the room

        // Setup interior camera
        if (!interiorCamera) {
            interiorCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        }
        updateInteriorCamera();

        // Use main renderer but with interior scene
        GameState.hutScene = interiorScene;
        GameState.hutCamera = interiorCamera;

        // Show "inside hut" UI
        showHutUI();

        console.log("Entered Ningle's Research Hut. Press E near a scientist to talk, or E near the door to leave.");
    }

    /**
     * Exit the research hut.
     */
    function exitHut() {
        if (!GameState.isInsideHut) return;

        GameState.isInsideHut = false;

        // Restore outside position
        if (GameState.savedOutsidePosition) {
            GameState.peccary.position.x = GameState.savedOutsidePosition.x;
            GameState.peccary.position.z = GameState.savedOutsidePosition.z;
        }

        GameState.hutScene = null;
        GameState.hutCamera = null;

        // Hide hut UI
        hideHutUI();

        console.log("Left the Research Hut.");
    }

    /**
     * Update interior camera based on player position.
     */
    function updateInteriorCamera() {
        if (!interiorCamera) return;

        // Third-person camera behind player
        const cameraDistance = 5;
        const cameraHeight = 3;

        interiorCamera.position.set(
            playerPosition.x - Math.sin(playerRotation) * cameraDistance,
            cameraHeight,
            playerPosition.z - Math.cos(playerRotation) * cameraDistance
        );

        interiorCamera.lookAt(
            playerPosition.x,
            1.5,
            playerPosition.z
        );
    }

    /**
     * Update the interior scene (scientist movement, animations).
     * @param {number} delta - Time since last frame
     */
    function updateInterior(delta) {
        if (!GameState.isInsideHut) return;

        // Animate floating artifacts in display cases
        const time = Date.now() * 0.001;
        interiorObjects.forEach(obj => {
            if (obj.userData && obj.userData.bobOffset !== undefined) {
                obj.position.y = 1 + Math.sin(time + obj.userData.bobOffset) * 0.1;
                obj.rotation.y += delta * 0.5;
            }
        });

        // Update scientists (simple wandering)
        scientists.forEach(scientist => {
            scientist.userData.walkTimer -= delta;

            if (scientist.userData.walkTimer <= 0) {
                // Pick new random target
                scientist.userData.walkTarget = {
                    x: (Math.random() - 0.5) * (INTERIOR_WIDTH - 4),
                    z: (Math.random() - 0.5) * (INTERIOR_DEPTH - 4)
                };
                scientist.userData.walkTimer = 3 + Math.random() * 5;
            }

            // Move toward target
            if (scientist.userData.walkTarget) {
                const dx = scientist.userData.walkTarget.x - scientist.position.x;
                const dz = scientist.userData.walkTarget.z - scientist.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist > 0.5) {
                    const speed = 1;
                    scientist.position.x += (dx / dist) * speed * delta;
                    scientist.position.z += (dz / dist) * speed * delta;

                    // Face movement direction
                    scientist.rotation.y = Math.atan2(dx, dz);

                    // Simple walk animation (bob up and down)
                    scientist.position.y = Math.abs(Math.sin(time * 8)) * 0.05;
                } else {
                    scientist.position.y = 0;
                }
            }
        });

        // Check for nearby scientist
        nearbyScientist = null;
        scientists.forEach(scientist => {
            const dx = playerPosition.x - scientist.position.x;
            const dz = playerPosition.z - scientist.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < 2.5) {
                nearbyScientist = scientist;
            }
        });

        // Handle player movement inside hut
        handleInteriorMovement(delta);

        // Update camera
        updateInteriorCamera();
    }

    /**
     * Handle player movement inside the hut.
     * @param {number} delta - Time since last frame
     */
    function handleInteriorMovement(delta) {
        const moveSpeed = 5;
        const turnSpeed = 3;
        let moved = false;

        // Rotation
        if (GameState.keys['a'] || GameState.keys['arrowleft']) {
            playerRotation += turnSpeed * delta;
            moved = true;
        }
        if (GameState.keys['d'] || GameState.keys['arrowright']) {
            playerRotation -= turnSpeed * delta;
            moved = true;
        }

        // Forward/backward
        if (GameState.keys['w'] || GameState.keys['arrowup']) {
            playerPosition.x += Math.sin(playerRotation) * moveSpeed * delta;
            playerPosition.z += Math.cos(playerRotation) * moveSpeed * delta;
            moved = true;
        }
        if (GameState.keys['s'] || GameState.keys['arrowdown']) {
            playerPosition.x -= Math.sin(playerRotation) * moveSpeed * delta;
            playerPosition.z -= Math.cos(playerRotation) * moveSpeed * delta;
            moved = true;
        }

        // Keep player in bounds
        const margin = 2;
        playerPosition.x = Math.max(-INTERIOR_WIDTH / 2 + margin, Math.min(INTERIOR_WIDTH / 2 - margin, playerPosition.x));
        playerPosition.z = Math.max(-INTERIOR_DEPTH / 2 + margin, Math.min(INTERIOR_DEPTH / 2 - margin, playerPosition.z));

        // Check if near exit (door area)
        if (playerPosition.z > INTERIOR_DEPTH / 2 - 3 && Math.abs(playerPosition.x) < 2) {
            // Near door - show exit prompt
            GameState.nearHutExit = true;
        } else {
            GameState.nearHutExit = false;
        }
    }

    /**
     * Handle E key press inside hut.
     */
    function handleInteraction() {
        if (!GameState.isInsideHut) return false;

        // Check if near exit
        if (GameState.nearHutExit) {
            exitHut();
            return true;
        }

        // Check if near scientist
        if (nearbyScientist) {
            openScientistDialog(nearbyScientist);
            return true;
        }

        return false;
    }

    /**
     * Open dialog with a scientist.
     * @param {THREE.Object3D} scientist - The scientist object
     */
    function openScientistDialog(scientist) {
        const artifacts = GameState.artifacts || [];

        // Build dialog options
        let options = [];

        if (artifacts.length > 0) {
            // Add option for each artifact
            artifacts.forEach(artifactId => {
                const artifactData = getArtifactData(artifactId);
                if (artifactData) {
                    options.push({
                        text: `Give ${artifactData.name} ${artifactData.icon}`,
                        action: () => giveArtifact(scientist, artifactId)
                    });
                }
            });
        }

        // All scientists can sell glass
        options.push({
            text: "Buy 1 glass (3 coins)",
            action: () => {
                if (GameState.pigCoins >= 3) {
                    GameState.pigCoins -= 3;
                    GameState.resourceCounts.glass += 1;
                    Game.playSound('collect');
                    UI.updateUI();
                    showScientistDialog(scientist.userData.name,
                        "Here's a piece of lab-grade glass! Very useful for crafting.",
                        [{
                            text: "Buy more glass",
                            action: () => openScientistDialog(scientist)
                        },
                        {
                            text: "Thanks!",
                            action: () => closeScientistDialog()
                        }]
                    );
                } else {
                    showScientistDialog(scientist.userData.name,
                        "You don't have enough coins! Glass costs 3 pig coins per piece.",
                        [{
                            text: "I'll come back.",
                            action: () => closeScientistDialog()
                        }]
                    );
                }
            }
        });

        options.push({
            text: "Nevermind",
            action: () => closeScientistDialog()
        });

        // Show dialog
        showScientistDialog(scientist.userData.name, scientist.userData.greeting, options);
    }

    /**
     * Give an artifact to a scientist.
     * @param {THREE.Object3D} scientist - The scientist
     * @param {string} artifactId - The artifact ID
     */
    function giveArtifact(scientist, artifactId) {
        const artifactData = getArtifactData(artifactId);
        if (!artifactData) return;

        // Remove from player inventory
        Inventory.removeArtifact(artifactId);

        // Show lore dialog
        showScientistDialog(
            scientist.userData.name,
            artifactData.lore,
            [{
                text: "Thank you!",
                action: () => {
                    closeScientistDialog();

                    // Give reward if any
                    if (artifactData.reward) {
                        if (artifactData.reward.coins) {
                            GameState.pigCoins += artifactData.reward.coins;
                        }
                        if (artifactData.reward.score) {
                            GameState.score += artifactData.reward.score;
                        }
                        Game.playSound('collect');
                        UI.updateUI();
                    }

                    // Check for artifact-triggered memory fragments
                    if (artifactData.memoryFragment) {
                        setTimeout(function() {
                            UI.showMemoryFlashback(artifactData.memoryFragment);
                        }, 500);
                    }
                }
            }]
        );
    }

    /**
     * Show the scientist dialog UI.
     */
    function showScientistDialog(name, text, options) {
        // Use the existing dialog system
        const dialogBox = document.getElementById('dialog-box');
        const dialogName = document.getElementById('dialog-name');
        const dialogText = document.getElementById('dialog-text');
        const dialogOptions = document.getElementById('dialog-options');

        dialogName.textContent = name;
        dialogText.textContent = text;
        dialogOptions.innerHTML = '';

        options.forEach((opt, i) => {
            const optDiv = document.createElement('div');
            optDiv.className = 'dialog-option';
            optDiv.setAttribute('data-option-number', i + 1);
            optDiv.textContent = `${i + 1}. ${opt.text}`;
            optDiv.addEventListener('click', opt.action);
            dialogOptions.appendChild(optDiv);
        });

        dialogBox.classList.remove('hidden');
        GameState.isDialogOpen = true;
    }

    /**
     * Close the scientist dialog.
     */
    function closeScientistDialog() {
        const dialogBox = document.getElementById('dialog-box');
        dialogBox.classList.add('hidden');
        GameState.isDialogOpen = false;
    }

    /**
     * Show interior hut UI elements.
     */
    function showHutUI() {
        // Could add a special HUD for inside the hut
        // For now, just update the location indicator
        const biomeLabel = document.getElementById('biome-label');
        if (biomeLabel) {
            biomeLabel.textContent = "Ningle's Research Hut";
        }
    }

    /**
     * Hide interior hut UI elements.
     */
    function hideHutUI() {
        // Restore biome label
        const biomeLabel = document.getElementById('biome-label');
        if (biomeLabel) {
            const biomeData = getBiomeData(GameState.currentBiome);
            if (biomeData) {
                biomeLabel.textContent = biomeData.displayName;
            }
        }
    }

    /**
     * Render the interior scene.
     */
    function renderInterior() {
        if (!GameState.isInsideHut || !interiorScene || !interiorCamera) return;

        GameState.renderer.render(interiorScene, interiorCamera);
    }

    /**
     * Check if player should enter the hut (called from player.js).
     * @returns {boolean}
     */
    function checkEnterHut() {
        if (GameState.isInsideHut) return false;
        if (GameState.currentBiome !== 'savannah') return false;

        const nearHut = Environment.isNearResearchHut(
            GameState.peccary.position.x,
            GameState.peccary.position.z
        );

        return nearHut;
    }

    // Public API
    return {
        init: init,
        enterHut: enterHut,
        exitHut: exitHut,
        updateInterior: updateInterior,
        renderInterior: renderInterior,
        handleInteraction: handleInteraction,
        checkEnterHut: checkEnterHut,
        isInsideHut: () => GameState.isInsideHut
    };
})();
