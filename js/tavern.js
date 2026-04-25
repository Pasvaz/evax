/**
 * ============================================================================
 * TAVERN MODULE
 * ============================================================================
 *
 * The Village Tavern - a cozy gathering spot in the village.
 * Features:
 * - Enter/exit the tavern (E key when near door)
 * - Separate interior scene (bigger on the inside!)
 * - 6 tables with pig NPCs (+ 1 merchant stall at the back)
 * - Pigston: board game enthusiast at table 1
 * - Tables 2-6 and merchant: coming soon
 * - WASD movement inside, E to interact with NPCs
 *
 * ============================================================================
 */

window.Tavern = (function() {
    'use strict';

    // Interior scene state
    var interiorScene = null;
    var interiorCamera = null;
    var tavernNPCs = [];      // NPCs inside the tavern
    var interiorObjects = []; // For animations

    // Interior dimensions (much bigger than outside!)
    var INTERIOR_WIDTH = 36;
    var INTERIOR_DEPTH = 28;
    var INTERIOR_HEIGHT = 7;

    // Player position inside tavern
    var playerPosition = { x: 0, z: 12 };
    var playerRotation = Math.PI; // Face into the room

    // Nearby NPC
    var nearbyNPC = null;

    // Door detection
    var nearExit = false;

    /**
     * Initialize the tavern system.
     */
    function init() {
        createInteriorScene();
    }

    /**
     * Create the full 3D interior of the tavern.
     */
    function createInteriorScene() {
        interiorScene = new THREE.Scene();
        interiorScene.background = new THREE.Color(0x1e1812);

        // Warm ambient lighting
        var ambient = new THREE.AmbientLight(0xfff0d0, 0.3);
        interiorScene.add(ambient);

        // Main chandelier light (center)
        var mainLight = new THREE.PointLight(0xffcc66, 1.2, 50);
        mainLight.position.set(0, 6, 0);
        interiorScene.add(mainLight);

        // Fireplace glow (back wall)
        var fireLight = new THREE.PointLight(0xff6622, 0.8, 20);
        fireLight.position.set(0, 2, -INTERIOR_DEPTH / 2 + 2);
        interiorScene.add(fireLight);

        // Wall sconce lights
        [[-12, 3, 0], [12, 3, 0], [-8, 3, -10], [8, 3, -10]].forEach(function(pos) {
            var sconce = new THREE.PointLight(0xffaa44, 0.4, 12);
            sconce.position.set(pos[0], pos[1], pos[2]);
            interiorScene.add(sconce);
        });

        // Materials
        var floorMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
        var wallMat = new THREE.MeshStandardMaterial({ color: 0x8B6B4A, roughness: 0.9 });
        var wallDarkMat = new THREE.MeshStandardMaterial({ color: 0x7A5C3D, roughness: 0.9 });
        var ceilingMat = new THREE.MeshStandardMaterial({ color: 0x6b5040, roughness: 0.9 });
        var beamMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.8 });

        // Floor (dark wood planks)
        var floor = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_WIDTH, INTERIOR_DEPTH),
            floorMat
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        interiorScene.add(floor);

        // Ceiling
        var ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_WIDTH, INTERIOR_DEPTH),
            ceilingMat
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = INTERIOR_HEIGHT;
        interiorScene.add(ceiling);

        // Ceiling beams (cross beams for atmosphere)
        for (var bz = -10; bz <= 10; bz += 5) {
            var beam = new THREE.Mesh(
                new THREE.BoxGeometry(INTERIOR_WIDTH, 0.4, 0.4),
                beamMat
            );
            beam.position.set(0, INTERIOR_HEIGHT - 0.2, bz);
            interiorScene.add(beam);
        }

        // Walls
        // Back wall
        var backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_WIDTH, INTERIOR_HEIGHT),
            wallDarkMat
        );
        backWall.position.set(0, INTERIOR_HEIGHT / 2, -INTERIOR_DEPTH / 2);
        interiorScene.add(backWall);

        // Left wall
        var leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_DEPTH, INTERIOR_HEIGHT),
            wallMat
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-INTERIOR_WIDTH / 2, INTERIOR_HEIGHT / 2, 0);
        interiorScene.add(leftWall);

        // Right wall
        var rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_DEPTH, INTERIOR_HEIGHT),
            wallMat
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(INTERIOR_WIDTH / 2, INTERIOR_HEIGHT / 2, 0);
        interiorScene.add(rightWall);

        // Front wall with doorway
        var frontWallLeft = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_WIDTH / 2 - 2, INTERIOR_HEIGHT),
            wallMat
        );
        frontWallLeft.rotation.y = Math.PI;
        frontWallLeft.position.set(-INTERIOR_WIDTH / 4 - 1, INTERIOR_HEIGHT / 2, INTERIOR_DEPTH / 2);
        interiorScene.add(frontWallLeft);

        var frontWallRight = new THREE.Mesh(
            new THREE.PlaneGeometry(INTERIOR_WIDTH / 2 - 2, INTERIOR_HEIGHT),
            wallMat
        );
        frontWallRight.rotation.y = Math.PI;
        frontWallRight.position.set(INTERIOR_WIDTH / 4 + 1, INTERIOR_HEIGHT / 2, INTERIOR_DEPTH / 2);
        interiorScene.add(frontWallRight);

        // Door frame top
        var doorTop = new THREE.Mesh(
            new THREE.PlaneGeometry(4, INTERIOR_HEIGHT - 4),
            wallMat
        );
        doorTop.rotation.y = Math.PI;
        doorTop.position.set(0, INTERIOR_HEIGHT - (INTERIOR_HEIGHT - 4) / 2, INTERIOR_DEPTH / 2);
        interiorScene.add(doorTop);

        // ============================================================
        // FIREPLACE on back wall
        // ============================================================
        var stoneMat = new THREE.MeshStandardMaterial({ color: 0x666055, roughness: 1.0 });
        // Stone surround
        var fpSurround = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 1), stoneMat);
        fpSurround.position.set(0, 2, -INTERIOR_DEPTH / 2 + 0.5);
        interiorScene.add(fpSurround);
        // Fire opening
        var fpOpenMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        var fpOpen = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 0.5), fpOpenMat);
        fpOpen.position.set(0, 1.5, -INTERIOR_DEPTH / 2 + 0.8);
        interiorScene.add(fpOpen);
        // Fire glow
        var fireMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff6600, emissiveIntensity: 1.0 });
        var fire = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), fireMat);
        fire.position.set(0, 0.8, -INTERIOR_DEPTH / 2 + 1);
        fire.userData.isFireGlow = true;
        interiorScene.add(fire);
        interiorObjects.push(fire);

        // Mantel
        var mantel = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 1.2), beamMat);
        mantel.position.set(0, 4.2, -INTERIOR_DEPTH / 2 + 0.6);
        interiorScene.add(mantel);

        // ============================================================
        // TABLES — 6 round tables, 3 on each side
        // ============================================================
        var tableMat = new THREE.MeshStandardMaterial({ color: 0x6b4423 });
        var tablePositions = [
            { x: -10, z: -6, label: 'Pigston' },
            { x: -10, z: 2, label: '???' },
            { x: -10, z: 10, label: '???' },
            { x: 10, z: -6, label: '???' },
            { x: 10, z: 2, label: '???' },
            { x: 10, z: 10, label: '???' }
        ];

        tablePositions.forEach(function(tp) {
            // Table top (round)
            var tableTop = new THREE.Mesh(
                new THREE.CylinderGeometry(2, 2, 0.15, 16),
                tableMat
            );
            tableTop.position.set(tp.x, 1.1, tp.z);
            interiorScene.add(tableTop);

            // Table leg (center pedestal)
            var leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.3, 1.1, 8),
                tableMat
            );
            leg.position.set(tp.x, 0.55, tp.z);
            interiorScene.add(leg);

            // Two stools per table
            var stoolMat = new THREE.MeshStandardMaterial({ color: 0x8B6B4A });
            [-1.5, 1.5].forEach(function(offset) {
                var stoolSeat = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.4, 0.4, 0.1, 12),
                    stoolMat
                );
                stoolSeat.position.set(tp.x + offset, 0.7, tp.z);
                interiorScene.add(stoolSeat);
                // Stool legs
                [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(function(sl) {
                    var sLeg = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.05, 0.05, 0.65, 6),
                        stoolMat
                    );
                    sLeg.position.set(tp.x + offset + sl[0], 0.33, tp.z + sl[1]);
                    interiorScene.add(sLeg);
                });
            });
        });

        // ============================================================
        // MERCHANT STALL at the back (right side of fireplace)
        // ============================================================
        var stallMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        // Counter
        var counter = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 1.5), stallMat);
        counter.position.set(10, 0.6, -INTERIOR_DEPTH / 2 + 2);
        interiorScene.add(counter);
        // Counter top (lighter wood)
        var counterTopMat = new THREE.MeshStandardMaterial({ color: 0x8B7355 });
        var counterTop = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.1, 1.7), counterTopMat);
        counterTop.position.set(10, 1.25, -INTERIOR_DEPTH / 2 + 2);
        interiorScene.add(counterTop);

        // Shelves behind counter
        for (var si = 0; si < 3; si++) {
            var shelf = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 0.8), stallMat);
            shelf.position.set(10, 2 + si * 1.3, -INTERIOR_DEPTH / 2 + 0.5);
            interiorScene.add(shelf);
            // Bottles on shelves
            for (var bi = 0; bi < 5; bi++) {
                var bottleColor = [0x447744, 0x774422, 0x443366, 0x886633, 0x336644][bi];
                var bottle = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8),
                    new THREE.MeshStandardMaterial({ color: bottleColor })
                );
                bottle.position.set(10 - 2 + bi * 1, 2.35 + si * 1.3, -INTERIOR_DEPTH / 2 + 0.5);
                interiorScene.add(bottle);
            }
        }

        // ============================================================
        // WALL DECORATIONS
        // ============================================================
        // Mounted animal head (trophy) on left wall
        var trophyMat = new THREE.MeshStandardMaterial({ color: 0x8B7355 });
        var trophyPlaque = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 8), trophyMat);
        trophyPlaque.rotation.z = Math.PI / 2;
        trophyPlaque.position.set(-INTERIOR_WIDTH / 2 + 0.1, 4, -4);
        interiorScene.add(trophyPlaque);

        // Barrels in corners
        var barrelMat = new THREE.MeshStandardMaterial({ color: 0x6B4226 });
        [[-INTERIOR_WIDTH / 2 + 1.5, -INTERIOR_DEPTH / 2 + 1.5],
         [INTERIOR_WIDTH / 2 - 1.5, INTERIOR_DEPTH / 2 - 3]].forEach(function(pos) {
            var barrel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.7, 0.65, 1.4, 12),
                barrelMat
            );
            barrel.position.set(pos[0], 0.7, pos[1]);
            interiorScene.add(barrel);
        });

        // ============================================================
        // CHANDELIER (hanging from center beam)
        // ============================================================
        var chandelierMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.4 });
        // Ring
        var ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.08, 8, 16), chandelierMat);
        ring.position.set(0, INTERIOR_HEIGHT - 1.5, 0);
        ring.rotation.x = Math.PI / 2;
        interiorScene.add(ring);
        // Chain
        var chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6), chandelierMat);
        chain.position.set(0, INTERIOR_HEIGHT - 0.7, 0);
        interiorScene.add(chain);
        // Candle lights on ring
        var candleMat = new THREE.MeshStandardMaterial({ color: 0xffee88, emissive: 0xffcc44, emissiveIntensity: 0.8 });
        for (var ci = 0; ci < 6; ci++) {
            var angle = (ci / 6) * Math.PI * 2;
            var candle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 6), candleMat);
            candle.position.set(
                Math.cos(angle) * 1.5,
                INTERIOR_HEIGHT - 1.35,
                Math.sin(angle) * 1.5
            );
            interiorScene.add(candle);
        }

        // ============================================================
        // PIGSTON NPC — seated at table 1 (left side, z=-6)
        // ============================================================
        createPigstonNPC(tablePositions[0].x + 1.5, tablePositions[0].z);

        // PIGON NPC — seated at table 2 (left side, z=2)
        createPigonNPC(tablePositions[1].x + 1.5, tablePositions[1].z);

        // PIGIAS — card game host at table 3 (left side, z=10)
        createPigiasNPC(tablePositions[2].x + 1.5, tablePositions[2].z);

        // PIGIERRE — merchant behind the stall (back right)
        createPigierreNPC(10, -INTERIOR_DEPTH / 2 + 3.5);

        // GOSSIP NPCs — 3 wandering characters
        createGruntonNPC(4, 5);
        createTruffleNPC(-4, -2);
        createSnickersNPC(0, 8);
    }

    /**
     * Create Pigston as a seated pig NPC inside the tavern.
     */
    function createPigstonNPC(x, z) {
        var npc = new THREE.Group();
        var model = new THREE.Group();

        var skinColor = 0xD2A07A; // Warm tan
        var outfitColor = 0x4A6741; // Forest green vest
        var skinMat = new THREE.MeshStandardMaterial({ color: skinColor });
        var outfitMat = new THREE.MeshStandardMaterial({ color: outfitColor });

        // Body (seated — lower position)
        var belly = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), outfitMat);
        belly.scale.set(1, 1.1, 0.9);
        belly.position.y = 1.0;
        model.add(belly);

        // Chest
        var chest = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), outfitMat);
        chest.position.y = 1.55;
        model.add(chest);

        // Head
        var head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), skinMat);
        head.position.y = 2.1;
        model.add(head);

        // Snout
        var snout = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.25, 8), skinMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, 2.0, 0.4);
        model.add(snout);

        // Pink nose
        var noseMat = new THREE.MeshStandardMaterial({ color: 0xcc8899 });
        var nose = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8), noseMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 2.0, 0.54);
        model.add(nose);

        // Eyes
        var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        var eyeMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a });
        [-0.14, 0.14].forEach(function(offset) {
            var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeWhiteMat);
            eyeWhite.position.set(offset, 2.2, 0.28);
            model.add(eyeWhite);
            var eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
            eye.position.set(offset, 2.2, 0.34);
            model.add(eye);
        });

        // Ears
        [-0.28, 0.28].forEach(function(offset) {
            var ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), skinMat);
            ear.position.set(offset, 2.4, 0);
            ear.rotation.z = offset > 0 ? -0.5 : 0.5;
            ear.rotation.x = 0.3;
            model.add(ear);
        });

        // Flat cap
        var capMat = new THREE.MeshStandardMaterial({ color: 0x4a4a3a });
        var capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.18, 16), capMat);
        capTop.position.y = 2.45;
        model.add(capTop);
        var capBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.04, 16), capMat);
        capBrim.position.set(0, 2.38, 0.18);
        capBrim.rotation.x = -0.2;
        model.add(capBrim);

        // Arms (resting on table — angled forward)
        [-0.5, 0.5].forEach(function(offset) {
            var upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.4, 8), outfitMat);
            upperArm.position.set(offset, 1.4, 0.2);
            upperArm.rotation.x = -0.6; // Angled forward (arms on table)
            model.add(upperArm);

            var lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 8), skinMat);
            lowerArm.position.set(offset * 0.9, 1.2, 0.5);
            lowerArm.rotation.x = -1.2; // Resting on table
            model.add(lowerArm);

            var hoof = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0x3a3a3a })
            );
            hoof.position.set(offset * 0.8, 1.1, 0.75);
            model.add(hoof);
        });

        // Legs (seated — bent at 90 degrees, hidden mostly behind table)
        [-0.22, 0.22].forEach(function(offset) {
            // Upper leg (horizontal on stool)
            var upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.4, 8), outfitMat);
            upperLeg.position.set(offset, 0.7, 0.1);
            upperLeg.rotation.x = Math.PI / 2; // Horizontal
            model.add(upperLeg);

            // Lower leg (hanging down)
            var lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8), skinMat);
            lowerLeg.position.set(offset, 0.35, 0.3);
            model.add(lowerLeg);

            var foot = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.08, 0.25),
                new THREE.MeshStandardMaterial({ color: 0x3a3a3a })
            );
            foot.position.set(offset, 0.12, 0.35);
            model.add(foot);
        });

        // Board game on the table in front of Pigston
        // Small square grid to hint at the game
        var boardMat = new THREE.MeshStandardMaterial({ color: 0x3a5a3a });
        var board = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 1.2), boardMat);
        board.position.set(-1.5, 1.18, z > 0 ? -0.5 : 0.5); // On the table
        // Actually position relative to NPC — the board sits on the table next to Pigston
        model.add(board); // Will be positioned relative to NPC group

        // Small game pieces on the board
        var pieceMat1 = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        var pieceMat2 = new THREE.MeshStandardMaterial({ color: 0xF5F5DC });
        for (var pi = 0; pi < 4; pi++) {
            var piece = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8),
                pi < 2 ? pieceMat1 : pieceMat2
            );
            piece.position.set(
                -1.5 + (pi % 2) * 0.4 - 0.2,
                1.25,
                (z > 0 ? -0.5 : 0.5) + Math.floor(pi / 2) * 0.4 - 0.2
            );
            model.add(piece);
        }

        npc.add(model);
        npc.position.set(x, 0, z);
        // Face toward the center of the room
        npc.rotation.y = x < 0 ? -Math.PI / 2 : Math.PI / 2;

        npc.userData = {
            type: 'tavern_npc',
            name: 'Pigston',
            role: 'Board Game Enthusiast',
            interactRange: 3,
            action: 'board_game',
            conversationTree: { startNode: TAVERN_DIALOGS.pigston.startNode, nodes: TAVERN_DIALOGS.pigston.nodes }
        };

        interiorScene.add(npc);
        tavernNPCs.push(npc);
    }

    /**
     * Create Pigon — nature board game enthusiast, seated at a table.
     */
    function createPigonNPC(x, z) {
        var npc = new THREE.Group();
        var model = new THREE.Group();

        var skinColor = 0xC49A6C; // Earthy tan
        var outfitColor = 0x556B2F; // Dark olive green (nature lover)
        var skinMat = new THREE.MeshStandardMaterial({ color: skinColor });
        var outfitMat = new THREE.MeshStandardMaterial({ color: outfitColor });

        // Body (seated)
        var belly = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), outfitMat);
        belly.scale.set(1, 1.1, 0.9);
        belly.position.y = 1.0;
        model.add(belly);

        var chestMesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), outfitMat);
        chestMesh.position.y = 1.55;
        model.add(chestMesh);

        // Head (slightly bigger — brainy!)
        var head = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 16), skinMat);
        head.position.y = 2.1;
        model.add(head);

        // Snout
        var snout = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.25, 8), skinMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, 2.0, 0.4);
        model.add(snout);

        var noseMat = new THREE.MeshStandardMaterial({ color: 0xcc8899 });
        var nose = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8), noseMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 2.0, 0.54);
        model.add(nose);

        // Eyes (round glasses!)
        var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        var eyeMat = new THREE.MeshStandardMaterial({ color: 0x2a3a1a });
        var glassMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.3 });
        [-0.15, 0.15].forEach(function(offset) {
            // Glass frame (ring)
            var frame = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.015, 8, 16), glassMat);
            frame.position.set(offset, 2.2, 0.34);
            model.add(frame);
            var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeWhiteMat);
            eyeWhite.position.set(offset, 2.2, 0.3);
            model.add(eyeWhite);
            var eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
            eye.position.set(offset, 2.2, 0.36);
            model.add(eye);
        });
        // Glasses bridge
        var bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.015), glassMat);
        bridge.position.set(0, 2.22, 0.35);
        model.add(bridge);

        // Ears
        [-0.28, 0.28].forEach(function(offset) {
            var ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), skinMat);
            ear.position.set(offset, 2.4, 0);
            ear.rotation.z = offset > 0 ? -0.5 : 0.5;
            ear.rotation.x = 0.3;
            model.add(ear);
        });

        // Beanie hat (casual, nature-y)
        var beanieMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        var beanie = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), beanieMat);
        beanie.position.y = 2.35;
        model.add(beanie);
        // Beanie fold line
        var foldMat = new THREE.MeshStandardMaterial({ color: 0x6B3410 });
        var fold = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.04, 8, 16), foldMat);
        fold.position.y = 2.2;
        fold.rotation.x = Math.PI / 2;
        model.add(fold);

        // Arms (one hand resting on table, other holding a tiny meeple)
        [-0.5, 0.5].forEach(function(offset) {
            var upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.4, 8), outfitMat);
            upperArm.position.set(offset, 1.4, 0.2);
            upperArm.rotation.x = -0.6;
            model.add(upperArm);
            var lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 8), skinMat);
            lowerArm.position.set(offset * 0.9, 1.2, 0.5);
            lowerArm.rotation.x = -1.2;
            model.add(lowerArm);
            var hoof = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: 0x3a3a3a }));
            hoof.position.set(offset * 0.8, 1.1, 0.75);
            model.add(hoof);
        });

        // Legs (seated)
        [-0.22, 0.22].forEach(function(offset) {
            var upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.4, 8), outfitMat);
            upperLeg.position.set(offset, 0.7, 0.1);
            upperLeg.rotation.x = Math.PI / 2;
            model.add(upperLeg);
            var lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8), skinMat);
            lowerLeg.position.set(offset, 0.35, 0.3);
            model.add(lowerLeg);
            var foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.25), new THREE.MeshStandardMaterial({ color: 0x3a3a3a }));
            foot.position.set(offset, 0.12, 0.35);
            model.add(foot);
        });

        // Tiny meeples on the table (preview of his game)
        var meepleMat1 = new THREE.MeshStandardMaterial({ color: 0x708090 }); // Seal grey
        var meepleMat2 = new THREE.MeshStandardMaterial({ color: 0x8B8B7A }); // Badger
        var meepleMat3 = new THREE.MeshStandardMaterial({ color: 0x556B2F }); // Toad green
        [[-1.2, -0.3, meepleMat1], [-1.5, 0, meepleMat2], [-1.3, 0.3, meepleMat3]].forEach(function(mp) {
            // Simple meeple shape: cylinder body + sphere head
            var mBody = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.15, 8), mp[2]);
            mBody.position.set(mp[0], 1.22, mp[1]);
            model.add(mBody);
            var mHead = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mp[2]);
            mHead.position.set(mp[0], 1.35, mp[1]);
            model.add(mHead);
        });

        // A small green board (mini forest terrain)
        var boardMat = new THREE.MeshStandardMaterial({ color: 0x3a6b3a });
        var boardMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 1.2), boardMat);
        boardMesh.position.set(-1.3, 1.16, 0);
        model.add(boardMesh);
        // Tiny blue pond on the board
        var pondMat = new THREE.MeshStandardMaterial({ color: 0x4488cc });
        var pond = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 12), pondMat);
        pond.position.set(-1.0, 1.2, 0.15);
        model.add(pond);

        npc.add(model);
        npc.position.set(x, 0, z);
        npc.rotation.y = x < 0 ? -Math.PI / 2 : Math.PI / 2;

        npc.userData = {
            type: 'tavern_npc',
            name: 'Pigon',
            role: 'Survival Game Master',
            interactRange: 3,
            action: 'pigon_game',
            conversationTree: { startNode: TAVERN_DIALOGS.pigon.startNode, nodes: TAVERN_DIALOGS.pigon.nodes }
        };

        interiorScene.add(npc);
        tavernNPCs.push(npc);
    }

    /**
     * Create Pigias — card game host. A scholarly pig with glasses and a card deck.
     * Purple vest, round spectacles, holds fanned cards.
     */
    function createPigiasNPC(x, z) {
        var npc = new THREE.Group();
        var pig = new THREE.Group();

        var skinColor = 0xf0c8a0; // light peach
        var vestColor = 0x4a2d6b; // purple vest
        var skinMat = new THREE.MeshStandardMaterial({ color: skinColor });
        var vestMat = new THREE.MeshStandardMaterial({ color: vestColor });

        // Body
        var belly = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), vestMat);
        belly.scale.set(1, 1.1, 0.9);
        belly.position.y = 1.2;
        pig.add(belly);

        var chest = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), vestMat);
        chest.position.y = 1.75;
        pig.add(chest);

        // Head
        var head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), skinMat);
        head.position.y = 2.3;
        pig.add(head);

        // Snout
        var snout = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.22, 8), skinMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, 2.2, 0.35);
        pig.add(snout);

        // Glasses (two circles + bridge)
        var glassMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        var lens1 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 16), glassMat);
        lens1.position.set(-0.14, 2.35, 0.32);
        pig.add(lens1);
        var lens2 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 16), glassMat);
        lens2.position.set(0.14, 2.35, 0.32);
        pig.add(lens2);
        var bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), glassMat);
        bridge.position.set(0, 2.35, 0.34);
        pig.add(bridge);

        // Ears
        var earMat = new THREE.MeshStandardMaterial({ color: 0xe0b090 });
        [-0.2, 0.2].forEach(function(xOff) {
            var ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 6), earMat);
            ear.position.set(xOff, 2.7, 0);
            ear.rotation.z = xOff < 0 ? 0.3 : -0.3;
            pig.add(ear);
        });

        // Card fan in hand (3 flat rectangles fanned out)
        var cardColors = [0xffffff, 0xffd700, 0xff6666];
        for (var i = 0; i < 3; i++) {
            var cardMat = new THREE.MeshStandardMaterial({ color: cardColors[i] });
            var card = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.01), cardMat);
            card.position.set(0.5, 1.5, 0.2);
            card.rotation.z = (i - 1) * 0.2;
            card.rotation.y = -0.3;
            pig.add(card);
        }

        npc.add(pig);
        npc.position.set(x, 0, z);
        npc.rotation.y = Math.PI * 0.75;

        npc.userData = {
            type: 'tavern_npc',
            name: 'Pigias',
            role: 'Card Game Host',
            interactRange: 4,
            action: 'card_game',
            conversationTree: { startNode: TAVERN_DIALOGS.pigias.startNode, nodes: TAVERN_DIALOGS.pigias.nodes }
        };

        interiorScene.add(npc);
        tavernNPCs.push(npc);
    }

    /**
     * Create Pigierre — the French merchant pig behind the stall.
     * Standing pose with a magnificent mustache.
     */
    function createPigierreNPC(x, z) {
        var npc = new THREE.Group();
        var model = new THREE.Group();

        var skinColor = 0xE0C0A0; // Light, elegant complexion
        var outfitColor = 0x2a2a4a; // Dark navy vest (formal)
        var skinMat = new THREE.MeshStandardMaterial({ color: skinColor });
        var outfitMat = new THREE.MeshStandardMaterial({ color: outfitColor });

        // Body (standing, behind counter)
        var belly = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), outfitMat);
        belly.scale.set(1, 1.1, 0.9);
        belly.position.y = 1.2;
        model.add(belly);

        // Chest
        var chest = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), outfitMat);
        chest.position.y = 1.9;
        model.add(chest);

        // White shirt collar (visible above vest)
        var collarMat = new THREE.MeshStandardMaterial({ color: 0xF5F5F0 });
        var collar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.15, 12), collarMat);
        collar.position.y = 2.3;
        model.add(collar);

        // Head
        var head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), skinMat);
        head.position.y = 2.65;
        model.add(head);

        // Snout (slightly upturned — snooty!)
        var snout = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.28, 8), skinMat);
        snout.rotation.x = Math.PI / 2 - 0.15; // Slightly upturned
        snout.position.set(0, 2.6, 0.42);
        model.add(snout);

        // Pink nose
        var noseMat = new THREE.MeshStandardMaterial({ color: 0xcc8899 });
        var nose = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 8), noseMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 2.62, 0.58);
        model.add(nose);

        // Eyes (slightly narrowed, sophisticated)
        var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        var eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a2a1a });
        [-0.15, 0.15].forEach(function(offset) {
            var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeWhiteMat);
            eyeWhite.position.set(offset, 2.78, 0.3);
            model.add(eyeWhite);
            var eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
            eye.position.set(offset, 2.78, 0.36);
            model.add(eye);
        });

        // MAGNIFICENT MUSTACHE
        var mustacheMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a });
        // Left curl
        var mustacheL = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 12, Math.PI), mustacheMat);
        mustacheL.position.set(-0.15, 2.52, 0.48);
        mustacheL.rotation.z = 0.3;
        mustacheL.rotation.x = 0.2;
        model.add(mustacheL);
        // Right curl
        var mustacheR = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 12, Math.PI), mustacheMat);
        mustacheR.position.set(0.15, 2.52, 0.48);
        mustacheR.rotation.z = -0.3;
        mustacheR.rotation.x = 0.2;
        model.add(mustacheR);
        // Center bar
        var mustacheCenter = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), mustacheMat);
        mustacheCenter.position.set(0, 2.52, 0.5);
        model.add(mustacheCenter);

        // Ears
        [-0.3, 0.3].forEach(function(offset) {
            var ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), skinMat);
            ear.position.set(offset, 2.98, 0);
            ear.rotation.z = offset > 0 ? -0.5 : 0.5;
            ear.rotation.x = 0.3;
            model.add(ear);
        });

        // Beret (French style!)
        var beretMat = new THREE.MeshStandardMaterial({ color: 0x2a1a2a });
        var beret = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), beretMat);
        beret.position.y = 3.0;
        beret.rotation.x = 0.15; // Slightly tilted
        model.add(beret);
        // Beret nub on top
        var nub = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), beretMat);
        nub.position.set(0.1, 3.15, 0);
        model.add(nub);

        // Arms (resting on counter)
        [-0.55, 0.55].forEach(function(offset) {
            var upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.45, 8), outfitMat);
            upperArm.position.set(offset, 1.65, 0.15);
            upperArm.rotation.x = -0.5;
            model.add(upperArm);

            var lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8), collarMat);
            lowerArm.position.set(offset * 0.9, 1.4, 0.45);
            lowerArm.rotation.x = -1.0;
            model.add(lowerArm);

            var hoof = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0x3a3a3a })
            );
            hoof.position.set(offset * 0.8, 1.3, 0.7);
            model.add(hoof);
        });

        // Legs (standing)
        [-0.25, 0.25].forEach(function(offset) {
            var upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.5, 8), outfitMat);
            upperLeg.position.set(offset, 0.65, 0);
            model.add(upperLeg);

            var lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8), outfitMat);
            lowerLeg.position.set(offset, 0.3, 0);
            model.add(lowerLeg);

            var shoe = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.1, 0.3),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
            );
            shoe.position.set(offset, 0.05, 0.05);
            model.add(shoe);
        });

        // Curly tail
        var tail = new THREE.Mesh(
            new THREE.TorusGeometry(0.12, 0.04, 8, 12, Math.PI * 1.5),
            skinMat
        );
        tail.position.set(0, 1.2, -0.6);
        tail.rotation.y = Math.PI / 2;
        model.add(tail);

        // Small towel over shoulder (bartender style)
        var towelMat = new THREE.MeshStandardMaterial({ color: 0xF5F5F0 });
        var towel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.25), towelMat);
        towel.position.set(-0.4, 2.05, -0.1);
        towel.rotation.z = 0.3;
        model.add(towel);

        npc.add(model);
        npc.position.set(x, 0, z);
        npc.rotation.y = Math.PI; // Facing the counter / customers

        npc.userData = {
            type: 'tavern_npc',
            name: 'Pigierre',
            role: 'Tavern Merchant',
            interactRange: 4,
            action: 'pigierre_shop',
            conversationTree: { startNode: TAVERN_DIALOGS.pigierre.startNode, nodes: TAVERN_DIALOGS.pigierre.nodes }
        };

        interiorScene.add(npc);
        tavernNPCs.push(npc);
    }

    // ============================================================
    // GOSSIP NPCs — 3 wandering tavern regulars
    // ============================================================

    /**
     * GRUNTON — Grizzled old boar, retired explorer.
     * Dark brown with grey patches, scar on snout. Blunt personality.
     */
    function createGruntonNPC(x, z) {
        var npc = new THREE.Group();
        var pig = new THREE.Group();

        var skinColor = 0x5c3a1e; // dark brown
        var greyPatch = 0x7a7a7a;
        var outfitColor = 0x3d3025; // worn leather brown
        var skinMat = new THREE.MeshStandardMaterial({ color: skinColor });
        var greyMat = new THREE.MeshStandardMaterial({ color: greyPatch });
        var outfitMat = new THREE.MeshStandardMaterial({ color: outfitColor });

        // Body (standing, stocky)
        var belly = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16), outfitMat);
        belly.scale.set(1, 1.1, 0.9);
        belly.position.y = 1.2;
        pig.add(belly);

        var chest = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), outfitMat);
        chest.position.y = 1.85;
        pig.add(chest);

        // Head — dark brown with grey patch on side
        var head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), skinMat);
        head.position.y = 2.5;
        pig.add(head);

        // Grey patch on head (age mark)
        var patch = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), greyMat);
        patch.position.set(-0.25, 2.6, 0.1);
        pig.add(patch);

        // Snout
        var snout = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.28, 8), skinMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, 2.4, 0.4);
        pig.add(snout);

        // Scar across snout (thin red-brown line)
        var scarMat = new THREE.MeshStandardMaterial({ color: 0x8b3a3a });
        var scar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.03), scarMat);
        scar.position.set(0, 2.42, 0.55);
        scar.rotation.z = 0.3;
        pig.add(scar);

        // Pink nose
        var noseMat = new THREE.MeshStandardMaterial({ color: 0xcc8888 });
        var nose = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8), noseMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 2.4, 0.56);
        pig.add(nose);

        // Eyes (squinting — smaller, tough look)
        var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
        var pupilMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a });
        [-0.14, 0.14].forEach(function(xOff) {
            var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeWhiteMat);
            eyeWhite.position.set(xOff, 2.58, 0.35);
            pig.add(eyeWhite);
            var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), pupilMat);
            pupil.position.set(xOff, 2.58, 0.4);
            pig.add(pupil);
        });

        // Ears (one bent — battle-worn)
        var earMat = new THREE.MeshStandardMaterial({ color: skinColor });
        var earL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 6), earMat);
        earL.position.set(-0.2, 2.85, 0);
        earL.rotation.z = 0.5;
        earL.rotation.x = 0.3;
        pig.add(earL);
        var earR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 6), earMat);
        earR.position.set(0.2, 2.82, 0);
        earR.rotation.z = -0.5;
        earR.rotation.x = 0.5; // bent forward — old injury
        pig.add(earR);

        // Arms (standing, at sides)
        [-1, 1].forEach(function(side) {
            var upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.45, 8), outfitMat);
            upperArm.position.set(side * 0.55, 1.65, 0);
            upperArm.rotation.z = side * 0.15;
            pig.add(upperArm);
            var lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8), skinMat);
            lowerArm.position.set(side * 0.6, 1.25, 0);
            pig.add(lowerArm);
            var hoof = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
            hoof.position.set(side * 0.6, 1.02, 0);
            pig.add(hoof);
        });

        // Legs (standing)
        [-1, 1].forEach(function(side) {
            var upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.5, 8), outfitMat);
            upperLeg.position.set(side * 0.25, 0.65, 0);
            pig.add(upperLeg);
            var lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8), outfitMat);
            lowerLeg.position.set(side * 0.25, 0.3, 0);
            pig.add(lowerLeg);
            var foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.28), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
            foot.position.set(side * 0.25, 0.05, 0.04);
            pig.add(foot);
        });

        npc.add(pig);
        npc.position.set(x, 0, z);
        npc.userData = {
            type: 'tavern_gossip',
            name: 'Grunton',
            role: 'Retired Explorer',
            interactRange: 3,
            action: 'gossip_grunton',
            conversationTree: { startNode: TAVERN_DIALOGS.grunton.startNode, nodes: TAVERN_DIALOGS.grunton.nodes },
            wanderTarget: { x: x, z: z },
            wanderTimer: 0,
            wanderSpeed: 1.2
        };
        interiorScene.add(npc);
        tavernNPCs.push(npc);
    }

    /**
     * TRUFFLE — Cheerful, round village gossip queen.
     * Rosy pink with flower behind ear. Speaks fast and excitedly.
     */
    function createTruffleNPC(x, z) {
        var npc = new THREE.Group();
        var pig = new THREE.Group();

        var skinColor = 0xe8a0a0; // rosy pink
        var outfitColor = 0xaa4466; // berry-colored dress
        var skinMat = new THREE.MeshStandardMaterial({ color: skinColor });
        var outfitMat = new THREE.MeshStandardMaterial({ color: outfitColor });

        // Body (standing, plump and round)
        var belly = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), outfitMat);
        belly.scale.set(1.1, 1, 1.1); // extra round
        belly.position.y = 1.15;
        pig.add(belly);

        var chest = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), outfitMat);
        chest.position.y = 1.8;
        pig.add(chest);

        // Apron (lighter fabric over dress)
        var apronMat = new THREE.MeshStandardMaterial({ color: 0xf5e6d0 });
        var apron = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.05), apronMat);
        apron.position.set(0, 1.1, 0.55);
        pig.add(apron);

        // Head
        var head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), skinMat);
        head.position.y = 2.35;
        pig.add(head);

        // Snout
        var snout = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.25, 8), skinMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, 2.25, 0.38);
        pig.add(snout);

        // Pink nose
        var noseMat = new THREE.MeshStandardMaterial({ color: 0xff9999 });
        var nose = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 8), noseMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 2.25, 0.52);
        pig.add(nose);

        // Eyes (big, bright — friendly)
        var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        var pupilMat = new THREE.MeshStandardMaterial({ color: 0x336633 }); // green eyes
        [-0.14, 0.14].forEach(function(xOff) {
            var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeWhiteMat);
            eyeWhite.position.set(xOff, 2.45, 0.32);
            pig.add(eyeWhite);
            var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), pupilMat);
            pupil.position.set(xOff, 2.45, 0.38);
            pig.add(pupil);
        });

        // Rosy cheeks
        var cheekMat = new THREE.MeshStandardMaterial({ color: 0xff7777, transparent: true, opacity: 0.5 });
        [-0.25, 0.25].forEach(function(xOff) {
            var cheek = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), cheekMat);
            cheek.position.set(xOff, 2.3, 0.3);
            pig.add(cheek);
        });

        // Ears
        var earMat = new THREE.MeshStandardMaterial({ color: skinColor });
        [-0.2, 0.2].forEach(function(xOff) {
            var ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 6), earMat);
            ear.position.set(xOff, 2.7, 0);
            ear.rotation.z = xOff > 0 ? -0.5 : 0.5;
            ear.rotation.x = 0.3;
            pig.add(ear);
        });

        // Flower behind right ear (yellow daisy)
        var flowerMat = new THREE.MeshStandardMaterial({ color: 0xffdd44 });
        var flower = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), flowerMat);
        flower.position.set(0.3, 2.65, -0.1);
        pig.add(flower);
        var flowerCenter = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), new THREE.MeshStandardMaterial({ color: 0xcc6600 }));
        flowerCenter.position.set(0.3, 2.65, -0.05);
        pig.add(flowerCenter);

        // Arms
        [-1, 1].forEach(function(side) {
            var upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.4, 8), outfitMat);
            upperArm.position.set(side * 0.55, 1.6, 0);
            upperArm.rotation.z = side * 0.15;
            pig.add(upperArm);
            var lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.35, 8), skinMat);
            lowerArm.position.set(side * 0.58, 1.22, 0);
            pig.add(lowerArm);
            var hoof = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
            hoof.position.set(side * 0.58, 1.02, 0);
            pig.add(hoof);
        });

        // Legs
        [-1, 1].forEach(function(side) {
            var upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.45, 8), outfitMat);
            upperLeg.position.set(side * 0.22, 0.6, 0);
            pig.add(upperLeg);
            var lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.38, 8), outfitMat);
            lowerLeg.position.set(side * 0.22, 0.28, 0);
            pig.add(lowerLeg);
            var foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.25), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
            foot.position.set(side * 0.22, 0.05, 0.03);
            pig.add(foot);
        });

        npc.add(pig);
        npc.position.set(x, 0, z);
        npc.userData = {
            type: 'tavern_gossip',
            name: 'Truffle',
            role: 'Village Gossip',
            interactRange: 3,
            action: 'gossip_truffle',
            conversationTree: { startNode: TAVERN_DIALOGS.truffle.startNode, nodes: TAVERN_DIALOGS.truffle.nodes },
            wanderTarget: { x: x, z: z },
            wanderTimer: 0,
            wanderSpeed: 1.0
        };
        interiorScene.add(npc);
        tavernNPCs.push(npc);
    }

    /**
     * SNICKERS — Young, nervous piglet. Visibly smaller (child).
     * Pale with dark spots. Wannabe adventurer, asks YOU questions.
     */
    function createSnickersNPC(x, z) {
        var npc = new THREE.Group();
        var pig = new THREE.Group();

        var skinColor = 0xf0d5b5; // pale piglet
        var spotColor = 0x6b4423; // dark spots
        var outfitColor = 0x5577aa; // blue tunic (kid clothes)
        var skinMat = new THREE.MeshStandardMaterial({ color: skinColor });
        var outfitMat = new THREE.MeshStandardMaterial({ color: outfitColor });

        // Body (smaller — child size, ~70% of adult)
        var belly = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), outfitMat);
        belly.scale.set(1, 1.05, 0.9);
        belly.position.y = 0.8;
        pig.add(belly);

        var chest = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), outfitMat);
        chest.position.y = 1.25;
        pig.add(chest);

        // Head (proportionally bigger for kid — cute)
        var head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), skinMat);
        head.position.y = 1.75;
        pig.add(head);

        // Dark spots on body
        var spotMat = new THREE.MeshStandardMaterial({ color: spotColor });
        var spot1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), spotMat);
        spot1.position.set(0.2, 1.85, 0.2);
        pig.add(spot1);
        var spot2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), spotMat);
        spot2.position.set(-0.15, 1.7, 0.25);
        pig.add(spot2);
        var spot3 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), spotMat);
        spot3.position.set(-0.3, 0.9, 0.3);
        pig.add(spot3);

        // Snout (smaller, cuter)
        var snout = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.2, 8), skinMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, 1.68, 0.33);
        pig.add(snout);

        // Pink nose
        var noseMat = new THREE.MeshStandardMaterial({ color: 0xffaaaa });
        var nose = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), noseMat);
        nose.rotation.x = Math.PI / 2;
        nose.position.set(0, 1.68, 0.44);
        pig.add(nose);

        // Eyes (big, wide — nervous/excited kid)
        var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        var pupilMat = new THREE.MeshStandardMaterial({ color: 0x4488cc }); // bright blue eyes
        [-0.12, 0.12].forEach(function(xOff) {
            var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeWhiteMat);
            eyeWhite.position.set(xOff, 1.85, 0.28);
            pig.add(eyeWhite);
            var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), pupilMat);
            pupil.position.set(xOff, 1.85, 0.34);
            pig.add(pupil);
        });

        // Ears (big floppy — kid ears)
        var earMat = new THREE.MeshStandardMaterial({ color: skinColor });
        var earL = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.28, 6), earMat);
        earL.position.set(-0.18, 2.05, 0);
        earL.rotation.z = 0.6;
        earL.rotation.x = 0.4;
        pig.add(earL);
        var earR = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.28, 6), earMat);
        earR.position.set(0.18, 2.05, 0);
        earR.rotation.z = -0.6;
        earR.rotation.x = 0.4;
        pig.add(earR);

        // Scarf (adventurer-wannabe accessory)
        var scarfMat = new THREE.MeshStandardMaterial({ color: 0xcc4444 });
        var scarf = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.12, 12), scarfMat);
        scarf.position.y = 1.5;
        pig.add(scarf);
        // Scarf tail hanging down
        var scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.04), scarfMat);
        scarfTail.position.set(0.15, 1.35, 0.2);
        scarfTail.rotation.z = -0.2;
        pig.add(scarfTail);

        // Arms (short kid arms)
        [-1, 1].forEach(function(side) {
            var upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.3, 8), outfitMat);
            upperArm.position.set(side * 0.38, 1.1, 0);
            upperArm.rotation.z = side * 0.2;
            pig.add(upperArm);
            var lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.25, 8), skinMat);
            lowerArm.position.set(side * 0.42, 0.85, 0);
            pig.add(lowerArm);
            var hoof = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
            hoof.position.set(side * 0.42, 0.7, 0);
            pig.add(hoof);
        });

        // Legs (short kid legs)
        [-1, 1].forEach(function(side) {
            var upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.32, 8), outfitMat);
            upperLeg.position.set(side * 0.17, 0.45, 0);
            pig.add(upperLeg);
            var lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 8), outfitMat);
            lowerLeg.position.set(side * 0.17, 0.2, 0);
            pig.add(lowerLeg);
            var foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.2), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
            foot.position.set(side * 0.17, 0.04, 0.03);
            pig.add(foot);
        });

        // Curly tail (cute piglet tail)
        var tailMat = new THREE.MeshStandardMaterial({ color: skinColor });
        var tail = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.03, 8, 12, Math.PI * 1.5), tailMat);
        tail.position.set(0, 0.85, -0.35);
        tail.rotation.y = Math.PI / 2;
        pig.add(tail);

        npc.add(pig);
        npc.position.set(x, 0, z);
        npc.userData = {
            type: 'tavern_gossip',
            name: 'Snickers',
            role: 'Curious Piglet',
            interactRange: 3,
            action: 'gossip_snickers',
            conversationTree: { startNode: TAVERN_DIALOGS.snickers.startNode, nodes: TAVERN_DIALOGS.snickers.nodes },
            wanderTarget: { x: x, z: z },
            wanderTimer: 0,
            wanderSpeed: 1.5 // kids move faster
        };
        interiorScene.add(npc);
        tavernNPCs.push(npc);
    }

    // ============================================================
    // PIGIERRE'S SHOP — Dialog + Colour Shop
    // ============================================================
    var PIGIERRE_COLOURS = [
        { id: 'beige', name: 'Beige', cost: 3, desc: 'A warm, neutral tone. Très élégant.' },
        { id: 'mint', name: 'Menthe', cost: 3, desc: 'Cool and fresh, like a breeze through ze Alps!' },
        { id: 'lemon', name: 'Citron', cost: 4, desc: 'Bright and zesty! Like sunshine on ze Riviera!' },
        { id: 'mauve', name: 'Mauve', cost: 5, desc: 'The colour of lavender fields in Provence!' },
        { id: 'pink', name: 'Rose Clair', cost: 5, desc: 'A bright, soft pink. Magnifique!' },
        { id: 'watermelon', name: 'Pastèque', cost: 5, desc: 'Green on ze outside, pink on ze inside! Délicieux!' },
        { id: 'zebra', name: 'Zebra Stripes', cost: 9, desc: 'Bold stripes! Not for ze faint of heart.' },
        { id: 'pig_face', name: 'Le Cochon', cost: 15, desc: 'A pig face pattern! Ze ultimate flex, oui?' }
    ];

    function openPigierreShop() {
        // Build and show dialog overlay with shop options
        var dialogBox = document.getElementById('dialog-box');
        dialogBox.classList.remove('hidden');
        GameState.isDialogOpen = true;

        document.getElementById('dialog-name').textContent = 'Pigierre — Tavern Merchant';
        document.getElementById('dialog-text').innerHTML =
            'Bonjour, mon ami! Welcome to my humble establishment. ' +
            'What can I do for you today, hmm?';

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';

        // Option 1: Buy colours
        var buyOpt = document.createElement('div');
        buyOpt.className = 'dialog-option';
        buyOpt.setAttribute('data-option-number', 1);
        buyOpt.textContent = '1. I\'d like to buy some colours for the board game.';
        buyOpt.onclick = function() { showColourShop(); };
        optionsDiv.appendChild(buyOpt);

        // Option 2: Vermin Catchzer quest
        var questOpt = document.createElement('div');
        questOpt.className = 'dialog-option';
        questOpt.setAttribute('data-option-number', 2);
        var questDone = (GameState.unlockedBoardColours || []).indexOf('blotchy_pig') !== -1;
        if (questDone) {
            questOpt.textContent = '2. "Vermin Catchzer" — COMPLETED ✓';
            questOpt.style.opacity = '0.5';
        } else {
            questOpt.textContent = '2. Got any work for me?';
            questOpt.onclick = function() { showVerminQuest(); };
        }
        optionsDiv.appendChild(questOpt);

        // Option 3: Buy meeples
        var meepleOpt = document.createElement('div');
        meepleOpt.className = 'dialog-option';
        meepleOpt.setAttribute('data-option-number', 3);
        meepleOpt.textContent = "3. Do you sell any meeples for Pigon's game?";
        meepleOpt.onclick = function() { showMeepleShop(); };
        optionsDiv.appendChild(meepleOpt);

        // Option 4: Ask about Emilia
        var emiliaOpt = document.createElement('div');
        emiliaOpt.className = 'dialog-option';
        emiliaOpt.setAttribute('data-option-number', 4);
        emiliaOpt.textContent = '4. Have you seen anyone in a labcoat pass through here?';
        emiliaOpt.onclick = function() { showEmiliaDialog(); };
        optionsDiv.appendChild(emiliaOpt);

        // Option 5: Buy card packs
        var cardOpt = document.createElement('div');
        cardOpt.className = 'dialog-option';
        cardOpt.setAttribute('data-option-number', 5);
        cardOpt.textContent = "5. Got any card packs?";
        cardOpt.onclick = function() { showCardPackShop(); };
        optionsDiv.appendChild(cardOpt);

        // Option 6: Buy biomes
        var biomeOpt = document.createElement('div');
        biomeOpt.className = 'dialog-option';
        biomeOpt.setAttribute('data-option-number', 6);
        biomeOpt.textContent = "6. Do you sell biomes for Pigon's game?";
        biomeOpt.onclick = function() { showBiomeShop(); };
        optionsDiv.appendChild(biomeOpt);

        // Option 7: Gossip
        var gossipOpt = document.createElement('div');
        gossipOpt.className = 'dialog-option';
        gossipOpt.setAttribute('data-option-number', 7);
        gossipOpt.textContent = '7. Heard any gossip lately?';
        gossipOpt.onclick = function() { showPigierreGossip(); };
        optionsDiv.appendChild(gossipOpt);

        // Option 8: Goodbye
        var byeOpt = document.createElement('div');
        byeOpt.className = 'dialog-option';
        byeOpt.setAttribute('data-option-number', 8);
        byeOpt.textContent = '8. Au revoir!';
        byeOpt.onclick = function() { closePigierreDialog(); };
        optionsDiv.appendChild(byeOpt);

        document.getElementById('dialog-hint').textContent =
            'Tavern Tokens: ' + (GameState.tavernTokens || 0);
    }

    function showColourShop() {
        document.getElementById('dialog-text').innerHTML =
            'Ah, you have ze eye for aesthetics! Here are my finest colours. ' +
            'Each one is, how you say, <i>permanente</i> — buy once, keep forever!';

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';

        var unlocked = GameState.unlockedBoardColours || [];

        PIGIERRE_COLOURS.forEach(function(colour, index) {
            var opt = document.createElement('div');
            opt.className = 'dialog-option';
            opt.setAttribute('data-option-number', index + 1);

            if (unlocked.indexOf(colour.id) !== -1) {
                opt.textContent = (index + 1) + '. ' + colour.name + ' — OWNED ✓';
                opt.style.opacity = '0.5';
                opt.style.cursor = 'default';
            } else {
                var canAfford = (GameState.tavernTokens || 0) >= colour.cost;
                opt.textContent = (index + 1) + '. ' + colour.name + ' — ' + colour.cost + ' tokens';
                if (!canAfford) {
                    opt.style.opacity = '0.5';
                    opt.title = 'Not enough tokens!';
                } else {
                    opt.onclick = (function(c) {
                        return function() { buyColour(c); };
                    })(colour);
                }
            }
            optionsDiv.appendChild(opt);
        });

        // Back option
        var backOpt = document.createElement('div');
        backOpt.className = 'dialog-option';
        backOpt.setAttribute('data-option-number', PIGIERRE_COLOURS.length + 1);
        backOpt.textContent = (PIGIERRE_COLOURS.length + 1) + '. Back';
        backOpt.onclick = function() { openPigierreShop(); };
        optionsDiv.appendChild(backOpt);

        document.getElementById('dialog-hint').textContent =
            'Tavern Tokens: ' + (GameState.tavernTokens || 0);
    }

    function buyColour(colour) {
        if ((GameState.tavernTokens || 0) < colour.cost) return;

        GameState.tavernTokens -= colour.cost;
        if (!GameState.unlockedBoardColours) GameState.unlockedBoardColours = [];
        GameState.unlockedBoardColours.push(colour.id);

        document.getElementById('dialog-text').innerHTML =
            'Excellent choice! ' + colour.desc + '<br><br>' +
            'Ze <b>' + colour.name + '</b> is now yours forever. ' +
            'You will find it in ze colour picker next time you play!';

        UI.showToast('New Colour Unlocked!', colour.name + ' added to your board game colours.');

        // Refresh the shop list
        setTimeout(function() { showColourShop(); }, 1500);
    }

    function showVerminQuest() {
        var kills = GameState.animalKills || {};
        var seagullKills = kills['pilfera_coastalis'] || 0;
        var sealKills = kills['bakka_seal'] || 0;
        var seagullDone = seagullKills >= 3;
        var sealDone = sealKills >= 1;

        if (seagullDone && sealDone) {
            // Quest auto-complete!
            if (!GameState.unlockedBoardColours) GameState.unlockedBoardColours = [];
            if (GameState.unlockedBoardColours.indexOf('blotchy_pig') === -1) {
                GameState.unlockedBoardColours.push('blotchy_pig');
            }
            if (GameState.unlockedBoardColours.indexOf('pilfera_net') === -1) {
                GameState.unlockedBoardColours.push('pilfera_net');
            }

            document.getElementById('dialog-text').innerHTML =
                '<b>Quest: Vermin Catchzer — COMPLETE!</b><br><br>' +
                '<i>Mon Dieu!</i> You have done it! Ze seagulls, ze seal — all dealt with! ' +
                'I am <i>très impressionné</i>. You are a true exterminator, non?<br><br>' +
                'As promised, here are your rewards — two <i>très spécial</i> colours for ze board game:<br><br>' +
                '🐷 <b>Le Cochon Tacheté</b> — A black pig with blotches. ' +
                'With zis colour, only up/down/left/right can touch — diagonals are <i>libre</i>!<br>' +
                '🪹 <b>Pilfera en Filet</b> — A seagull in a net. ' +
                'With zis colour, only diagonals can touch — ze sides are <i>libre</i>!';

            UI.showToast('Quest Complete!', 'Vermin Catchzer — 2 special colours unlocked!');
        } else {
            // Show quest with progress
            document.getElementById('dialog-text').innerHTML =
                '<b>Quest: Vermin Catchzer</b><br><br>' +
                '<i>Sacré bleu!</i> Ze vermin on ze coast are ruining my supply shipments! ' +
                'Zose horrible seagulls steal from my crates, and ze bakka seals — ' +
                'zey scratch my delivery barrels with zeir tusks!<br><br>' +
                'If you could travel to ze coast and... <i>deal with zem</i>, I would reward you with two <i>très rare</i> ' +
                'colours for Pigston\'s board game. Colours with <b>special powers</b>, oui?<br><br>' +
                'Seagulls: <b>' + Math.min(seagullKills, 3) + '/3</b> ' + (seagullDone ? '✓' : '') + '<br>' +
                'Bakka Seals: <b>' + Math.min(sealKills, 1) + '/1</b> ' + (sealDone ? '✓' : '');
        }

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';

        var backOpt = document.createElement('div');
        backOpt.className = 'dialog-option';
        backOpt.setAttribute('data-option-number', 1);
        backOpt.textContent = '1. Back';
        backOpt.onclick = function() { openPigierreShop(); };
        optionsDiv.appendChild(backOpt);
    }

    var PIGIERRE_MEEPLES = [
        { id: 'rabbit', name: 'Rabbit Meeple', cost: 5, desc: 'A quick little lapin! Fast on land, free hop, but fragile.' },
        { id: 'squirrel', name: 'Squirrel Meeple', cost: 5, desc: 'A clever écureuil! Climbs trees for safety and food.' },
        { id: 'small_camelopin', name: 'Camelopin Meeple', cost: 8, desc: 'A desert tank! 14 HP, eats cacti safely. Needs Sandstone Valley biome.' },
        { id: 'desert_felinidon', name: 'Felinidon Meeple', cost: 10, desc: 'Lightning predator! Huge damage, cannot enter water. Needs Sandstone Valley biome.' },
        { id: 'desert_fox', name: 'Desert Fox Meeple', cost: 5, desc: 'Hit and run! Free dash, attacks cause bleeding. Needs Sandstone Valley biome.' },
        { id: 'field_chinchinol', name: 'Chinchinol Meeple', cost: 5, desc: 'Tiny dodger! 35% chance to dodge attacks. Needs Ancient Prairie biome.' },
        { id: 'field_coyoteya', name: 'Coyoteya Meeple', cost: 13, desc: 'Apex predator! Fast, powerful, bleeds prey dry. Needs Ancient Prairie biome.' }
    ];

    var PIGIERRE_BIOMES = [
        { id: 'sandstone_valley', name: 'Sandstone Valley', cost: 10, desc: 'A scorching desert biome for Pigon\'s game! New terrain, new animals!' },
        { id: 'ancient_prairie', name: 'Ancient Prairie', cost: 15, desc: 'A vast ancient grassland! Flowers, tall grass, and fierce predators!' }
    ];

    function showMeepleShop() {
        document.getElementById('dialog-text').innerHTML =
            'Ah, you want some new meeples for Pigon\'s little game? <i>Mais oui!</i> ' +
            'I have carved zese myself from ze finest wood!';

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';
        var unlocked = GameState.unlockedMeeples || [];

        PIGIERRE_MEEPLES.forEach(function(meeple, index) {
            var opt = document.createElement('div');
            opt.className = 'dialog-option';
            opt.setAttribute('data-option-number', index + 1);

            if (unlocked.indexOf(meeple.id) !== -1) {
                opt.textContent = (index + 1) + '. ' + meeple.name + ' — OWNED ✓';
                opt.style.opacity = '0.5';
            } else {
                var canAfford = (GameState.tavernTokens || 0) >= meeple.cost;
                opt.textContent = (index + 1) + '. ' + meeple.name + ' — ' + meeple.cost + ' tokens';
                if (!canAfford) {
                    opt.style.opacity = '0.5';
                    opt.title = 'Not enough tokens!';
                } else {
                    opt.onclick = (function(m) {
                        return function() { buyMeeple(m); };
                    })(meeple);
                }
            }
            optionsDiv.appendChild(opt);
        });

        var backOpt = document.createElement('div');
        backOpt.className = 'dialog-option';
        backOpt.setAttribute('data-option-number', PIGIERRE_MEEPLES.length + 1);
        backOpt.textContent = (PIGIERRE_MEEPLES.length + 1) + '. Back';
        backOpt.onclick = function() { openPigierreShop(); };
        optionsDiv.appendChild(backOpt);

        document.getElementById('dialog-hint').textContent =
            'Tavern Tokens: ' + (GameState.tavernTokens || 0);
    }

    function buyMeeple(meeple) {
        if ((GameState.tavernTokens || 0) < meeple.cost) return;

        GameState.tavernTokens -= meeple.cost;
        if (!GameState.unlockedMeeples) GameState.unlockedMeeples = [];
        GameState.unlockedMeeples.push(meeple.id);

        document.getElementById('dialog-text').innerHTML =
            '<i>Voilà!</i> ' + meeple.desc + '<br><br>' +
            'Ze <b>' + meeple.name + '</b> is now yours. ' +
            'You will find it in Pigon\'s meeple selection next time you play!';

        UI.showToast('New Meeple Unlocked!', meeple.name + ' added to your collection.');

        setTimeout(function() { showMeepleShop(); }, 1500);
    }

    function showEmiliaDialog() {
        document.getElementById('dialog-text').innerHTML =
            'A labcoat, you say? Hmm... <i>Oui</i>, I recall someone like zat. ' +
            'A lady — très determined, always scribbling in a notebook. ' +
            'She passed through here some weeks ago, bought nothing, asked many questions. ' +
            'Kept muttering about "ze samples" and "contamination zones"... ' +
            'Very peculiar. I do not know where she went after. ' +
            '<i>Désolé</i>, mon ami.';

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';

        var backOpt = document.createElement('div');
        backOpt.className = 'dialog-option';
        backOpt.setAttribute('data-option-number', 1);
        backOpt.textContent = '1. Interesting... thanks.';
        backOpt.onclick = function() { openPigierreShop(); };
        optionsDiv.appendChild(backOpt);
    }

    // ============================================================
    // PIGIAS DIALOG — Card game host
    // ============================================================

    function openPigiasDialog() {
        var dialogBox = document.getElementById('dialog-box');
        dialogBox.classList.remove('hidden');
        GameState.isDialogOpen = true;

        document.getElementById('dialog-name').textContent = 'Pigias — Card Game Host';

        var collection = GameState.cardCollection || [];
        var creatures = collection.filter(function(c) { return !c.isEnergy; });

        if (creatures.length === 0) {
            document.getElementById('dialog-text').innerHTML =
                'Oh, a new face! Welcome to my card table. ' +
                'You\'ll need some cards before we can play — go buy packs from Pigierre!';
        } else {
            document.getElementById('dialog-text').innerHTML =
                'Ah, back for another round? I see you have <b>' + creatures.length +
                '</b> creature cards. Think you can beat me?';
        }

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';

        // Option 1: Challenge (need 3+ creatures)
        var challengeOpt = document.createElement('div');
        challengeOpt.className = 'dialog-option';
        challengeOpt.setAttribute('data-option-number', 1);
        if (creatures.length >= 3) {
            challengeOpt.textContent = '1. I challenge you to a card battle!';
            challengeOpt.onclick = function() {
                closePigiasDialog();
                CardGame.open();
            };
        } else {
            challengeOpt.textContent = '1. I challenge you! (Need 3+ creature cards)';
            challengeOpt.style.opacity = '0.5';
        }
        optionsDiv.appendChild(challengeOpt);

        // Option 2: How to play
        var rulesOpt = document.createElement('div');
        rulesOpt.className = 'dialog-option';
        rulesOpt.setAttribute('data-option-number', 2);
        rulesOpt.textContent = '2. How does this card game work?';
        rulesOpt.onclick = function() { showPigiasRules(); };
        optionsDiv.appendChild(rulesOpt);

        // Option 3: Goodbye
        var byeOpt = document.createElement('div');
        byeOpt.className = 'dialog-option';
        byeOpt.setAttribute('data-option-number', 3);
        byeOpt.textContent = '3. See you later!';
        byeOpt.onclick = function() { closePigiasDialog(); };
        optionsDiv.appendChild(byeOpt);

        document.getElementById('dialog-hint').textContent =
            'Cards: ' + creatures.length + ' creatures | Tavern Tokens: ' + (GameState.tavernTokens || 0);
    }

    function showPigiasRules() {
        document.getElementById('dialog-text').innerHTML =
            'It\'s simple! Pick <b>3 or 4</b> creature cards for your deck. ' +
            'Each card has a <b>type</b> — forest, fire, water, earth, or shadow. ' +
            'On your turn, you can <b>attach energy</b> of that type to power up attacks, ' +
            'then <b>attack</b> my active card! Energy stays on the card once attached. ' +
            'Knock out all my cards and you win <b>3 tavern tokens</b>!';

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';

        var backOpt = document.createElement('div');
        backOpt.className = 'dialog-option';
        backOpt.setAttribute('data-option-number', 1);
        backOpt.textContent = '1. Got it, thanks!';
        backOpt.onclick = function() { openPigiasDialog(); };
        optionsDiv.appendChild(backOpt);
    }

    function closePigiasDialog() {
        document.getElementById('dialog-box').classList.add('hidden');
        GameState.isDialogOpen = false;
    }

    function closePigierreDialog() {
        document.getElementById('dialog-box').classList.add('hidden');
        GameState.isDialogOpen = false;
    }

    function showCardPackShop() {
        document.getElementById('dialog-text').innerHTML =
            'Card packs, you say? <i>Bien sûr!</i> Pigias loves new challengers. ' +
            'Buy some packs, build your deck, zen go challenge her!';

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';
        var packs = CardGame.PACK_TYPES;
        var keys = Object.keys(packs);

        keys.forEach(function(key, index) {
            var pack = packs[key];
            var opt = document.createElement('div');
            opt.className = 'dialog-option';
            opt.setAttribute('data-option-number', index + 1);
            var canAfford = (GameState.tavernTokens || 0) >= pack.cost;
            opt.textContent = (index + 1) + '. ' + pack.name + ' — ' + pack.cost + ' tokens (' + pack.description + ')';
            if (!canAfford) {
                opt.style.opacity = '0.5';
                opt.title = 'Not enough tokens!';
            } else {
                opt.onclick = (function(k, p) {
                    return function() {
                        GameState.tavernTokens -= p.cost;
                        // Add pack to inventory
                        Inventory.addItemToInventory(k, p.name, p.description, 'open_card_pack', 1);
                        closePigierreDialog();
                        Game.showBlockedMessage('Bought ' + p.name + '! Open it from your inventory.');
                    };
                })(key, pack);
            }
            optionsDiv.appendChild(opt);
        });

        var backOpt = document.createElement('div');
        backOpt.className = 'dialog-option';
        backOpt.setAttribute('data-option-number', keys.length + 1);
        backOpt.textContent = (keys.length + 1) + '. Back';
        backOpt.onclick = function() { openPigierreShop(); };
        optionsDiv.appendChild(backOpt);

        document.getElementById('dialog-hint').textContent =
            'Tavern Tokens: ' + (GameState.tavernTokens || 0);
    }

    function showBiomeShop() {
        document.getElementById('dialog-text').innerHTML =
            'Ah, you want new worlds for Pigon\'s game? ' +
            '<i>Mais oui!</i> I have ze maps to new lands!';

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';

        var unlocked = GameState.unlockedBiomes || [];

        PIGIERRE_BIOMES.forEach(function(biome, index) {
            var opt = document.createElement('div');
            opt.className = 'dialog-option';
            opt.setAttribute('data-option-number', index + 1);

            if (unlocked.indexOf(biome.id) !== -1) {
                opt.textContent = (index + 1) + '. ' + biome.name + ' — OWNED ✓';
                opt.style.opacity = '0.5';
                opt.style.cursor = 'default';
            } else {
                var canAfford = (GameState.tavernTokens || 0) >= biome.cost;
                opt.textContent = (index + 1) + '. ' + biome.name + ' — ' + biome.cost + ' tokens';
                if (!canAfford) {
                    opt.style.opacity = '0.5';
                    opt.title = 'Not enough tokens!';
                } else {
                    opt.onclick = (function(b) {
                        return function() { buyBiome(b); };
                    })(biome);
                }
            }
            optionsDiv.appendChild(opt);
        });

        var backOpt = document.createElement('div');
        backOpt.className = 'dialog-option';
        backOpt.setAttribute('data-option-number', PIGIERRE_BIOMES.length + 1);
        backOpt.textContent = (PIGIERRE_BIOMES.length + 1) + '. Back';
        backOpt.onclick = function() { openPigierreShop(); };
        optionsDiv.appendChild(backOpt);

        document.getElementById('dialog-hint').textContent =
            'Tavern Tokens: ' + (GameState.tavernTokens || 0);
    }

    function buyBiome(biome) {
        if ((GameState.tavernTokens || 0) < biome.cost) return;
        GameState.tavernTokens -= biome.cost;
        if (!GameState.unlockedBiomes) GameState.unlockedBiomes = [];
        GameState.unlockedBiomes.push(biome.id);
        if (typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast('Biome Unlocked!', biome.name + ' is now available in Pigon\'s game!');
        }
        showBiomeShop();
    }

    function showPigierreGossip() {
        var gossip = getPigierreGossip();
        if (gossip) {
            document.getElementById('dialog-text').innerHTML =
                '*Pigierre leans across the counter conspiratorially*<br><br>' +
                '"' + gossip + '"';
        } else {
            document.getElementById('dialog-text').innerHTML =
                '*Pigierre shrugs*<br><br>"No gossip today, mon ami. Ze tavern, she is quiet."';
        }

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';

        var backOpt = document.createElement('div');
        backOpt.className = 'dialog-option';
        backOpt.setAttribute('data-option-number', 1);
        backOpt.textContent = '1. Back';
        backOpt.onclick = function() { openPigierreShop(); };
        optionsDiv.appendChild(backOpt);

        document.getElementById('dialog-hint').textContent = '';
    }

    // ============================================================
    // TAVERN LORE SYSTEM — Progressive reveals after wins
    // ============================================================
    var TAVERN_LORE = {
        pigston: [
            {
                title: 'A Familiar Face',
                text: "You know, I've lived in this tavern for years now. But it wasn't always a tavern. This whole building used to be a research station — believe it or not! Some scientist set it up ages ago. She had all sorts of equipment in here... beakers, maps, cages. One day she just... packed up and left. Never came back."
            },
            {
                title: 'The Maps',
                text: "I found some of her old maps behind the fireplace once. They had markings all over them — circles around areas in every biome. The savannah, the mountains, even deep in the arboreal forest. And next to each circle she'd written species names. But not species I'd ever heard of. Ancient-sounding ones. Latin names. Very peculiar."
            },
            {
                title: 'The Creatures',
                text: "After she left, strange animals started appearing. Animals nobody had ever seen before. The badgers, the wild dogs, even those huge cattle in the savannah — none of them were here before. It's like they just... appeared one day. The villagers were terrified at first. Some still are."
            },
            {
                title: 'The Cave',
                text: "There's talk of a cave system somewhere along the coast. Fishermen say they've seen lights flickering inside at night — and heard strange sounds. Machinery, maybe? I've never been brave enough to look myself, but... if someone were hiding, that'd be the place. Surrounded by water on three sides. Hard to find. Perfect for someone who doesn't want to be found."
            },
            {
                title: 'Emilia\'s Journal',
                text: "I found one more thing behind the fireplace — a journal page. Just one. It read: 'The de-extinction process is complete. Felis Dronlaticus, Canis Savannicus, Bovidae Titanicus — all thriving. But I've made a terrible mistake. The Dronlaticus is too aggressive. It killed three of my assistants. I must contain it, or destroy it. If I can't... I'll have to disappear.' It was signed E. Snoutworth."
            }
        ],
        pigon: [
            {
                title: 'The Forest Before',
                text: "The forest around this village wasn't always like this, you know. My grandpiggy told me it used to be thick jungle — ancient trees, vines as thick as your leg. Then one summer it all died. Every tree, overnight. And these pine trees grew in their place within a year. A year! Trees don't grow that fast naturally. Something changed the soil. Something... unnatural."
            },
            {
                title: 'The Seals\' Origins',
                text: "The seals down on the coast — both the Uronin and the Bakka — they're strange. I've studied animals my whole life for my game designs, and those seals don't match anything in the natural record. Their bone structure is all wrong. Too primitive. Like they're from thousands of years ago. Someone didn't just bring back extinct land animals... they brought back the ocean ones too."
            },
            {
                title: 'The Supply Drops',
                text: "Every few weeks, a crate washes up on one of the islands. Always sealed tight, always with the same marking — a pig snout inside a hexagon. Inside? Food supplies. Medical equipment. Notebooks. Someone is still being supplied. Someone on the coast. She's still here, Pedro. She never left."
            },
            {
                title: 'The Fifth Biome',
                text: "There's a biome nobody talks about. Beyond the snowy mountains, past the highest peak, there's supposed to be a wasteland — toxic, barren, nothing grows there. The villagers call it the Dead Zone. But Pigierre once told me he saw tracks leading INTO it. Hoofprints. And next to them... boot prints. Someone went in there on purpose. And the tracks... they didn't come back out."
            },
            {
                title: 'The Real Experiment',
                text: "I've been thinking about it for a long time, and I keep coming back to one question. What if it wasn't just about bringing back a few animals? What if Snoutworth's work went further than anyone realises? Sometimes I look at this world — the biomes, the strange plants, the way everything fits together just so — and I wonder... could some of it have been shaped by her research? I don't know. Maybe I'm overthinking it. But Pedro, I think you stumbled onto something she didn't want anyone to find. Why else would she send the Dronlaticus after you? There's something bigger going on here. I just can't quite see the full picture yet."
            }
        ]
    };

    /**
     * Show a lore reveal after winning a tavern game.
     * Called by BoardGame and PigonGame when the player wins.
     * @param {string} npcId - 'pigston' or 'pigon'
     */
    function showWinLore(npcId) {
        if (!GameState.tavernWins) GameState.tavernWins = { pigston: 0, pigon: 0 };

        var winCount = GameState.tavernWins[npcId] || 0;
        var loreList = TAVERN_LORE[npcId];

        if (!loreList || winCount >= loreList.length) return; // All lore revealed

        var lore = loreList[winCount];
        GameState.tavernWins[npcId] = winCount + 1;

        // Show lore dialog after a short delay
        setTimeout(function() {
            var dialogBox = document.getElementById('dialog-box');
            dialogBox.classList.remove('hidden');
            GameState.isDialogOpen = true;

            var npcName = npcId === 'pigston' ? 'Pigston' : 'Pigon';
            document.getElementById('dialog-name').textContent = npcName + ' — Story (' + (winCount + 1) + '/' + loreList.length + ')';
            document.getElementById('dialog-text').innerHTML =
                '<b>"' + lore.title + '"</b><br><br>' + lore.text;

            var optionsDiv = document.getElementById('dialog-options');
            optionsDiv.innerHTML = '';

            var continueOpt = document.createElement('div');
            continueOpt.className = 'dialog-option';
            continueOpt.setAttribute('data-option-number', 1);
            continueOpt.textContent = '1. (Continue)';
            continueOpt.onclick = function() {
                dialogBox.classList.add('hidden');
                GameState.isDialogOpen = false;
            };
            optionsDiv.appendChild(continueOpt);

            document.getElementById('dialog-hint').textContent =
                'Lore ' + (winCount + 1) + ' of ' + loreList.length + ' from ' + npcName;
        }, 1500);
    }

    // ============================================================
    // ENTER / EXIT
    // ============================================================

    function enterTavern() {
        if (GameState.isInsideTavern) return;

        // Save outside position
        GameState.savedTavernPosition = {
            x: GameState.peccary.position.x,
            z: GameState.peccary.position.z
        };
        GameState.isInsideTavern = true;

        // Reset player position inside (near door)
        playerPosition = { x: 0, z: 12 };
        playerRotation = Math.PI; // Face into the room

        // Setup interior camera
        if (!interiorCamera) {
            interiorCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        }
        updateCamera();

        // Store references for rendering
        GameState.tavernScene = interiorScene;
        GameState.tavernCamera = interiorCamera;

        // Show UI hints
        UI.showToast('The Village Tavern', 'Walk around with WASD. Press E near an NPC to interact.');

        // Show tavern tokens
        var tokensHud = document.getElementById('tavern-tokens-hud');
        if (tokensHud) {
            tokensHud.classList.remove('hidden');
            document.getElementById('tavern-tokens-count').textContent = GameState.tavernTokens || 0;
        }

        console.log('Entered the Village Tavern.');
    }

    function exitTavern() {
        if (!GameState.isInsideTavern) return;

        GameState.isInsideTavern = false;

        // Restore outside position
        if (GameState.savedTavernPosition) {
            GameState.peccary.position.x = GameState.savedTavernPosition.x;
            GameState.peccary.position.z = GameState.savedTavernPosition.z;
        }

        GameState.tavernScene = null;
        GameState.tavernCamera = null;

        // Hide tavern tokens
        var tokensHud = document.getElementById('tavern-tokens-hud');
        if (tokensHud) tokensHud.classList.add('hidden');

        console.log('Left the Village Tavern.');
    }

    // ============================================================
    // UPDATE (called each frame when inside)
    // ============================================================

    // ============================================================
    // GOSSIP SYSTEM — Tiered, daily-rotating rumors
    // ============================================================

    // Gossip rotation tracking (uses GameState.gossipDay for persistence)
    var gossipDayTimer = 0;
    var GOSSIP_DAY_LENGTH = 300; // 5 minutes of real game time = 1 gossip day

    // GRUNTON'S GOSSIP — biome tips, animal knowledge, world events
    var GRUNTON_GOSSIP = [
        // Early game (score < 100)
        { id: 'g1', tier: 'early', text: "The forest ain't as safe as it looks. Stay close to the village until you know what you're doin'." },
        { id: 'g2', tier: 'early', text: "Berries and nuts keep you alive. Mushrooms too, but watch out for the dark ones — arsenic mushrooms'll kill ya." },
        { id: 'g3', tier: 'early', text: "I've seen peccaries bigger than Pedro out in the savannah. And meaner, too." },
        { id: 'g4', tier: 'early', text: "You want my advice? Get a weapon before you go wandering. Bruno's the pig for that." },
        // Mid game (score 100-500)
        { id: 'g5', tier: 'mid', text: "The savannah... wild dogs hunt in packs there. Don't let 'em surround you." },
        { id: 'g6', tier: 'mid', text: "Gazelles in the savannah are fast, but if you can tame one... well, you'll be fast too." },
        { id: 'g7', tier: 'mid', text: "There's something strange about those seagulls on the coast. Pilfera, they call 'em. Thieving little blighters." },
        { id: 'g8', tier: 'mid', text: "I once found an artifact near some old ruins. Ancient stuff. Ningle at the research hut, he'd know more about it." },
        { id: 'g9', tier: 'mid', text: "The coast has seals — Uroñin and Bakka. Don't mess with the Bakka ones unless you're ready for a fight." },
        // Late game (score > 500)
        { id: 'g10', tier: 'late', text: "The snowy mountains... I went there once. Once. Couldn't stand the cold. You'd need proper gear." },
        { id: 'g11', tier: 'late', text: "I've heard rumors of ancient bones buried in the ground. Skulls from creatures that shouldn't exist anymore." },
        { id: 'g12', tier: 'late', text: "Somethin' ain't right about this world. Animals that shouldn't be here... like they were put here on purpose." },
        { id: 'g13', tier: 'late', text: "Years ago, before I retired, I heard about a scientist. Brilliant, they said. Dangerous, others said. Disappeared one day." }
    ];

    // TRUFFLE'S GOSSIP — social drama, villager secrets, Emilia rumors
    var TRUFFLE_GOSSIP = [
        // Early game
        { id: 't1', tier: 'early', text: "Oh, have you met Granny Trotter? She makes the BEST healing cookies! But she only shares with pigs she trusts!" },
        { id: 't2', tier: 'early', text: "Rosie — the farmer? She acts all tough but I've seen her talking to her crops. Adorable, really!" },
        { id: 't3', tier: 'early', text: "Patches has the most peculiar merchandise... where does he even GET those things?" },
        { id: 't4', tier: 'early', text: "Elder Hamsworth knows more than he lets on. Have you noticed how he watches you? Like he's waiting for something..." },
        // Mid game
        { id: 't5', tier: 'mid', text: "I heard Pigierre used to live somewhere far away. He never talks about WHY he left. Suspicious, non?" },
        { id: 't6', tier: 'mid', text: "Bruno the blacksmith? His forge burns hotter than normal fire. Some say he found a special kind of coal. Or something else entirely..." },
        { id: 't7', tier: 'mid', text: "Ningle at the research hut — have you been there? He's obsessed with ancient creatures. Says they shouldn't be here!" },
        { id: 't8', tier: 'mid', text: "There's a name nobody likes to mention around here. Emilia Snoutworth. Last time I brought her up, Elder Hamsworth went quiet." },
        // Late game
        { id: 't9', tier: 'late', text: "OK so I wasn't supposed to tell anyone, but... Emilia Snoutworth? She was a REAL scientist. A genius. Something went wrong with her experiments." },
        { id: 't10', tier: 'late', text: "Emilia's family used to be the most respected in the region. Then she vanished. Some say she's hiding. Others say she went... somewhere else. Somewhere impossible." },
        { id: 't11', tier: 'late', text: "I overheard Ningle muttering about 'temporal displacement'. Whatever THAT means. But he was holding one of those artifact skulls when he said it..." },
        { id: 't12', tier: 'late', text: "You know what I think? I think Emilia didn't just discover ancient beasts. I think she BROUGHT them here. And then she ran away from what she'd done." }
    ];

    // SNICKERS' QUESTIONS — he asks YOU, then trades a rumor as payment
    var SNICKERS_QUESTIONS = [
        // Questions tied to player achievements (checked via GameState)
        {
            id: 's1',
            check: function() { return GameState.score >= 50; },
            question: "You've been collecting stuff all over the place! What's the tastiest thing you've found? Berries or nuts?",
            response: "Wow, I've never even LEFT the village! Here's something I heard though — old Grunton was mumbling about a hidden island off the coast. Probably just a story...",
            reward: "Snickers tells you about a hidden island off the coast."
        },
        {
            id: 's2',
            check: function() { return (GameState.discoveredBiomes || []).indexOf('savannah') !== -1; },
            question: "Is it TRUE there are animals with huge horns in the savannah?! What are they like?!",
            response: "HORNS?! That's so cool! OK OK, in return — I once saw Truffle whispering to a traveler about a scientist who could bring back DEAD animals. Spooky, right?",
            reward: "Snickers overheard a rumor about a scientist who revives dead animals."
        },
        {
            id: 's3',
            check: function() { return (GameState.discoveredBiomes || []).indexOf('coastal') !== -1; },
            question: "Did you really go to the OCEAN?! Did you swim?! Were there sharks?!",
            response: "No sharks? Aww... BUT! I heard this from a seagull — well, the seagull didn't talk, but a fisherpig told me seals guard something on the rocks. Something old.",
            reward: "Snickers heard that seals may be guarding something ancient."
        },
        {
            id: 's4',
            check: function() { return (GameState.animalKills || {}).wild_dog > 0; },
            question: "You FOUGHT a wild dog?! And WON?! Were you scared?! I would've fainted!",
            response: "You're SO brave! Here — Pigierre let something slip yesterday. He said the name 'Emilia Snoutworth' and then looked really nervous. Like he KNOWS her.",
            reward: "Snickers noticed Pigierre reacts nervously to the name 'Emilia Snoutworth'."
        },
        {
            id: 's5',
            check: function() { return (GameState.discoveredBiomes || []).indexOf('snowy_mountains') !== -1; },
            question: "You went to the SNOWY MOUNTAINS?! Is it freezing?! Did you make a snowball?!",
            response: "I NEED to go there someday! OK here's my best secret — I was hiding under a table and Grunton told Truffle he once found paw prints in the snow. GIANT paw prints. Bigger than any animal alive.",
            reward: "Snickers tells you about giant paw prints found in the snow — bigger than any living animal."
        },
        {
            id: 's6',
            check: function() { return (GameState.memoriesFound || []).length >= 3; },
            question: "Elder Hamsworth said you've been having... flashbacks? Like memories that aren't yours? That's TERRIFYING! What do you see?",
            response: "That gives me chills! But listen — my mum told me a bedtime story once. About a scientist who went so far looking for answers that she ended up in a different TIME. I thought it was just a story, but now...",
            reward: "Snickers' mother told him stories about a scientist who traveled to a different time."
        },
        {
            id: 's7',
            check: function() { return (GameState.artifacts || []).length >= 2; },
            question: "You found REAL artifacts?! Like ancient stuff?! Can I touch them?! Please?!",
            response: "OK I'll tell you the BIGGEST secret I know. I snuck into the research hut once and saw Ningle's notes. He wrote: 'The skull belongs to Felis Dronlaticus. It should NOT exist in this era.' I ran away after that.",
            reward: "Snickers read Ningle's notes — the skull belongs to Felis Dronlaticus, a creature from another era."
        },
        {
            id: 's8',
            check: function() { return (GameState.memoriesFound || []).length >= 6; },
            question: "People say you're remembering things... important things. About someone called Emilia. Who IS she? Should I be scared?",
            response: "OK this is the last thing I know. Grunton doesn't know I heard this. He was talking to himself by the fire: 'She didn't just go back in time. She took them with her. And left US with the consequences.' Whatever that means... it sounds BAD.",
            reward: "Grunton said: 'She didn't just go back in time. She took them with her. And left us with the consequences.'"
        }
    ];

    // PIGIERRE GOSSIP — French bartender overhears things
    var PIGIERRE_GOSSIP = [
        { id: 'p1', tier: 'early', text: "Ah, you want ze gossip? Pigierre hears everything, mon ami. Ze walls, zey have ears... and so does ze bartender!" },
        { id: 'p2', tier: 'mid', text: "A traveler came through last week. Said 'e saw strange lights in ze snowy mountains at night. Probably nothing, but... who knows, non?" },
        { id: 'p3', tier: 'mid', text: "Between you and moi — Grunton? 'E knows more about zis world than 'e lets on. 'E wasn't always a grumpy old boar. 'E was an explorer. A REAL one." },
        { id: 'p4', tier: 'late', text: "I will tell you something, but you did not 'ear it from me, oui? Ze name Snoutworth... it is known in my 'omeland too. A family of brilliant scientists. And one of zem... she crossed a line." },
        { id: 'p5', tier: 'late', text: "Emilia Snoutworth... oui, I know ze name. She came through 'ere once, many years ago. Bought supplies. She looked... 'aunted. Like she was running from something she created." }
    ];

    /**
     * Get the current gossip tier based on player progress
     */
    function getGossipTier() {
        var score = GameState.score || 0;
        if (score >= 500) return 'late';
        if (score >= 100) return 'mid';
        return 'early';
    }

    /**
     * Pick today's gossip for an NPC from their gossip pool
     */
    function getTodayGossip(gossipArray, npcId) {
        var tier = getGossipTier();
        // Filter to current tier and below
        var available = gossipArray.filter(function(g) {
            if (tier === 'late') return true;
            if (tier === 'mid') return g.tier !== 'late';
            return g.tier === 'early';
        });
        if (available.length === 0) return null;
        // Use gossip day as seed for consistent daily pick
        var index = ((GameState.gossipDay || 0) + npcId.charCodeAt(0)) % available.length;
        return available[index];
    }

    /**
     * Get Snickers' current question (first unheard one the player qualifies for)
     */
    function getSnickersQuestion() {
        var heard = GameState.gossipHeard || [];
        for (var i = 0; i < SNICKERS_QUESTIONS.length; i++) {
            var q = SNICKERS_QUESTIONS[i];
            if (heard.indexOf(q.id) === -1 && q.check()) {
                return q;
            }
        }
        return null; // All questions asked or none qualify
    }

    /**
     * Open gossip dialog for a specific NPC
     */
    function openGossipDialog(npcId) {
        var dialogBox = document.getElementById('dialog-box');
        dialogBox.classList.remove('hidden');
        GameState.isDialogOpen = true;

        var optionsDiv = document.getElementById('dialog-options');
        optionsDiv.innerHTML = '';

        if (npcId === 'snickers') {
            openSnickersDialog(optionsDiv);
        } else if (npcId === 'grunton') {
            openGruntonDialog(optionsDiv);
        } else if (npcId === 'truffle') {
            openTruffleDialog(optionsDiv);
        }
    }

    function openGruntonDialog(optionsDiv) {
        document.getElementById('dialog-name').textContent = 'Grunton — Retired Explorer';

        var gossip = getTodayGossip(GRUNTON_GOSSIP, 'grunton');

        // World event check — personalized line based on player actions
        var worldEvent = getGruntonWorldEvent();

        if (worldEvent) {
            document.getElementById('dialog-text').innerHTML =
                '*Grunton looks at you with his squinting eyes*<br><br>' +
                worldEvent + '<br><br>' +
                (gossip ? '"Also... ' + gossip.text + '"' : '');
        } else if (gossip) {
            document.getElementById('dialog-text').innerHTML =
                '*Grunton takes a long sip of his drink*<br><br>' +
                '"' + gossip.text + '"';
        } else {
            document.getElementById('dialog-text').innerHTML =
                '*Grunton grunts*<br><br>"Nothin\' to say today. Leave me be."';
        }

        // Goodbye
        var byeOpt = document.createElement('div');
        byeOpt.className = 'dialog-option';
        byeOpt.setAttribute('data-option-number', 1);
        byeOpt.textContent = '1. Thanks, Grunton.';
        byeOpt.onclick = function() { closePigierreDialog(); };
        optionsDiv.appendChild(byeOpt);

        document.getElementById('dialog-hint').textContent = '';
    }

    function getGruntonWorldEvent() {
        var kills = GameState.animalKills || {};
        var totalKills = 0;
        for (var k in kills) totalKills += kills[k];

        if (totalKills >= 20) {
            return '"Word travels fast, kid. They say you\'ve taken down over twenty beasts. *leans forward* Be careful — the more you hunt, the more the wild watches back."';
        }
        if ((GameState.discoveredBiomes || []).length >= 3) {
            return '"You\'ve been to all three biomes? *raises eyebrow* Not bad. Took me years to do that. Course, I did it without fancy swords..."';
        }
        if (kills.bakka_seal > 0) {
            return '"You fought a Bakka seal and lived? *genuine respect* Those things nearly took my ear off. That\'s how I got this." *points to his bent ear*';
        }
        return null;
    }

    function openTruffleDialog(optionsDiv) {
        document.getElementById('dialog-name').textContent = 'Truffle — Village Gossip';

        var gossip = getTodayGossip(TRUFFLE_GOSSIP, 'truffle');

        if (gossip) {
            document.getElementById('dialog-text').innerHTML =
                '*Truffle leans in close, eyes sparkling*<br><br>' +
                '"Oh! Oh! I have to tell you something! ' + gossip.text + '"';
        } else {
            document.getElementById('dialog-text').innerHTML =
                '*Truffle adjusts her flower*<br><br>"Nothing juicy today, sweetie. Check back tomorrow!"';
        }

        // Goodbye
        var byeOpt = document.createElement('div');
        byeOpt.className = 'dialog-option';
        byeOpt.setAttribute('data-option-number', 1);
        byeOpt.textContent = '1. Thanks for the gossip, Truffle!';
        byeOpt.onclick = function() { closePigierreDialog(); };
        optionsDiv.appendChild(byeOpt);

        document.getElementById('dialog-hint').textContent = '';
    }

    function openSnickersDialog(optionsDiv) {
        document.getElementById('dialog-name').textContent = 'Snickers — Curious Piglet';

        var question = getSnickersQuestion();

        if (question) {
            document.getElementById('dialog-text').innerHTML =
                '*Snickers bounces up to you, eyes wide*<br><br>' +
                '"HEY! HEY! You\'re the adventurer, right?! I have a question!" <br><br>' +
                '"' + question.question + '"';

            // Option 1: Answer (trade info)
            var answerOpt = document.createElement('div');
            answerOpt.className = 'dialog-option';
            answerOpt.setAttribute('data-option-number', 1);
            answerOpt.textContent = '1. Tell Snickers about your adventure';
            answerOpt.onclick = function() {
                // Mark as heard
                if (!GameState.gossipHeard) GameState.gossipHeard = [];
                GameState.gossipHeard.push(question.id);

                // Show Snickers' response (the gossip payment)
                document.getElementById('dialog-text').innerHTML =
                    '*Snickers listens with his mouth wide open*<br><br>' +
                    '"' + question.response + '"';

                optionsDiv.innerHTML = '';
                var byeOpt = document.createElement('div');
                byeOpt.className = 'dialog-option';
                byeOpt.setAttribute('data-option-number', 1);
                byeOpt.textContent = '1. Thanks, Snickers!';
                byeOpt.onclick = function() { closePigierreDialog(); };
                optionsDiv.appendChild(byeOpt);

                document.getElementById('dialog-hint').textContent = question.reward;
            };
            optionsDiv.appendChild(answerOpt);

            // Option 2: Not now
            var noOpt = document.createElement('div');
            noOpt.className = 'dialog-option';
            noOpt.setAttribute('data-option-number', 2);
            noOpt.textContent = '2. Maybe later, kid.';
            noOpt.onclick = function() { closePigierreDialog(); };
            optionsDiv.appendChild(noOpt);
        } else {
            // No questions available
            document.getElementById('dialog-text').innerHTML =
                '*Snickers waves at you*<br><br>' +
                '"Hi! I don\'t have any questions right now... but keep adventuring! I bet you\'ll do something AMAZING soon!"';

            var byeOpt = document.createElement('div');
            byeOpt.className = 'dialog-option';
            byeOpt.setAttribute('data-option-number', 1);
            byeOpt.textContent = '1. See you around, Snickers.';
            byeOpt.onclick = function() { closePigierreDialog(); };
            optionsDiv.appendChild(byeOpt);
        }

        document.getElementById('dialog-hint').textContent = '';
    }

    /**
     * Add gossip option to Pigierre's main menu
     */
    function getPigierreGossip() {
        var gossip = getTodayGossip(PIGIERRE_GOSSIP, 'pigierre');
        return gossip ? gossip.text : null;
    }

    // ============================================================
    // WANDERING AI for gossip NPCs
    // ============================================================

    function updateWanderingNPC(npc, delta) {
        var ud = npc.userData;

        // Don't wander if player is nearby (stop and face player)
        var dx = playerPosition.x - npc.position.x;
        var dz = playerPosition.z - npc.position.z;
        var distToPlayer = Math.sqrt(dx * dx + dz * dz);
        if (distToPlayer < ud.interactRange + 1) {
            ud.isMoving = false;
            // Face the player
            npc.rotation.y = Math.atan2(dx, dz);
            return;
        }

        // Update wander timer
        ud.wanderTimer -= delta;
        if (ud.wanderTimer <= 0) {
            // Pick a new random target within tavern bounds
            var margin = 4;
            ud.wanderTarget = {
                x: (Math.random() - 0.5) * (INTERIOR_WIDTH - margin * 2),
                z: (Math.random() - 0.5) * (INTERIOR_DEPTH - margin * 2)
            };
            ud.wanderTimer = 4 + Math.random() * 6; // 4-10 seconds between wanders
        }

        // Move toward target
        var tx = ud.wanderTarget.x - npc.position.x;
        var tz = ud.wanderTarget.z - npc.position.z;
        var dist = Math.sqrt(tx * tx + tz * tz);

        if (dist > 0.5) {
            ud.isMoving = true;
            var speed = ud.wanderSpeed * delta;
            npc.position.x += (tx / dist) * speed;
            npc.position.z += (tz / dist) * speed;
            // Face movement direction
            npc.rotation.y = Math.atan2(tx, tz);
        } else {
            ud.isMoving = false;
        }
    }

    function updateInterior(delta) {
        if (!GameState.isInsideTavern) return;

        var time = Date.now() * 0.001;

        // Update tavern tokens display
        var tokensCount = document.getElementById('tavern-tokens-count');
        if (tokensCount) tokensCount.textContent = GameState.tavernTokens || 0;

        // Animate fire glow
        interiorObjects.forEach(function(obj) {
            if (obj.userData && obj.userData.isFireGlow) {
                obj.scale.setScalar(0.8 + Math.sin(time * 5) * 0.15 + Math.sin(time * 7.3) * 0.1);
                obj.position.y = 0.8 + Math.sin(time * 3) * 0.05;
            }
        });

        // Animate NPCs (gentle idle sway for seated, wandering for gossip NPCs)
        tavernNPCs.forEach(function(npc) {
            var m = npc.children[0];
            if (!m) return;

            if (npc.userData.type === 'tavern_gossip') {
                // Wandering AI
                updateWanderingNPC(npc, delta);
                // Walking bob
                var isMoving = npc.userData.isMoving;
                if (isMoving) {
                    m.position.y = Math.abs(Math.sin(time * 8)) * 0.06;
                } else {
                    m.position.y = Math.sin(time * 1.2) * 0.02;
                    m.rotation.y = Math.sin(time * 0.8) * 0.05;
                }
            } else {
                // Seated NPCs — subtle sway
                m.rotation.y = Math.sin(time * 0.8) * 0.05;
                m.position.y = Math.sin(time * 1.2) * 0.02;
            }
        });

        // Check nearby NPC
        nearbyNPC = null;
        tavernNPCs.forEach(function(npc) {
            var dx = playerPosition.x - npc.position.x;
            var dz = playerPosition.z - npc.position.z;
            var dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < npc.userData.interactRange) {
                nearbyNPC = npc;
            }
        });

        // Handle movement
        handleMovement(delta);

        // Update camera
        updateCamera();

        // Update interact prompt
        var prompt = document.getElementById('interact-prompt');
        if (nearExit) {
            prompt.classList.remove('hidden');
            prompt.classList.remove('locked-villager');
            prompt.textContent = 'Press E to leave the tavern';
        } else if (nearbyNPC) {
            prompt.classList.remove('hidden');
            prompt.classList.remove('locked-villager');
            prompt.textContent = 'Press E to talk to ' + nearbyNPC.userData.name;
        } else {
            prompt.classList.add('hidden');
        }
    }

    function handleMovement(delta) {
        var moveSpeed = 5;
        var turnSpeed = 3;

        // Rotation
        if (GameState.keys['a'] || GameState.keys['arrowleft']) {
            playerRotation += turnSpeed * delta;
        }
        if (GameState.keys['d'] || GameState.keys['arrowright']) {
            playerRotation -= turnSpeed * delta;
        }

        // Forward/backward
        if (GameState.keys['w'] || GameState.keys['arrowup']) {
            playerPosition.x += Math.sin(playerRotation) * moveSpeed * delta;
            playerPosition.z += Math.cos(playerRotation) * moveSpeed * delta;
        }
        if (GameState.keys['s'] || GameState.keys['arrowdown']) {
            playerPosition.x -= Math.sin(playerRotation) * moveSpeed * delta;
            playerPosition.z -= Math.cos(playerRotation) * moveSpeed * delta;
        }

        // Keep in bounds
        var margin = 2;
        playerPosition.x = Math.max(-INTERIOR_WIDTH / 2 + margin, Math.min(INTERIOR_WIDTH / 2 - margin, playerPosition.x));
        playerPosition.z = Math.max(-INTERIOR_DEPTH / 2 + margin, Math.min(INTERIOR_DEPTH / 2 - margin, playerPosition.z));

        // Check near exit door
        nearExit = (playerPosition.z > INTERIOR_DEPTH / 2 - 3 && Math.abs(playerPosition.x) < 2.5);
    }

    function updateCamera() {
        if (!interiorCamera) return;
        // Third-person overhead follow (similar to research hut)
        var camDist = 8;
        var camHeight = 6;
        interiorCamera.position.set(
            playerPosition.x - Math.sin(playerRotation) * camDist,
            camHeight,
            playerPosition.z - Math.cos(playerRotation) * camDist
        );
        interiorCamera.lookAt(playerPosition.x, 1.5, playerPosition.z);
    }

    // ============================================================
    // INTERACTION
    // ============================================================

    function handleInteraction() {
        if (!GameState.isInsideTavern) return;

        // If dialog is open, close it (E acts as dismiss)
        if (GameState.isDialogOpen) {
            Dialogs.closeDialog();
            return;
        }

        if (nearExit) {
            exitTavern();
            return;
        }

        if (nearbyNPC) {
            // Use the standard dialog system for all tavern NPCs
            Dialogs.openDialog(nearbyNPC);
        }
    }

    // ============================================================
    // RENDER
    // ============================================================

    function renderInterior() {
        if (!GameState.isInsideTavern || !interiorScene || !interiorCamera) return;
        GameState.renderer.render(interiorScene, interiorCamera);
    }

    /**
     * Check if player is near the tavern door (outside).
     */
    function checkEnterTavern() {
        if (GameState.isInsideTavern) return false;
        if (!GameState.tavernBuilding) return false;

        var tavern = GameState.tavernBuilding;
        var dx = GameState.peccary.position.x - tavern.position.x;
        var dz = GameState.peccary.position.z - (tavern.position.z + 9); // Door is at front (+Z)
        var dist = Math.sqrt(dx * dx + dz * dz);

        return dist < 5;
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================================
    // DATA-DRIVEN DIALOG RESOLVERS
    // ============================================================
    // These are called by dialogs.js to resolve DYNAMIC_ nodes

    function resolvePigierreDialog(dynamicText) {
        if (dynamicText === 'DYNAMIC_PIGIERRE_QUEST') {
            var questDone = (GameState.unlockedBoardColours || []).indexOf('blotchy_pig') !== -1;
            if (questDone) {
                return {
                    text: "Ze Vermin Catchzer quest? Already completed, mon ami! Magnifique work.",
                    choices: [{ text: "Back.", nextNode: 'greeting' }]
                };
            }
            return {
                text: "Zere are rats in my cellar! Filthy vermin! Kill 5 of zem and I'll reward you with a special board colour — ze Blotchy Pig! Zey come out at night...",
                choices: [
                    { text: "I'll handle it.", nextNode: null },
                    { text: "Back.", nextNode: 'greeting' }
                ]
            };
        }
        if (dynamicText === 'DYNAMIC_PIGIERRE_EMILIA') {
            return {
                text: "A labcoat, you say? Hmm... <i>Oui</i>, I recall someone like zat. A lady — très determined, always scribbling in a notebook. She passed through here some weeks ago, bought nothing, asked many questions. Kept muttering about \"ze samples\" and \"contamination zones\"... Very peculiar. I do not know where she went after. <i>Désolé</i>, mon ami.",
                choices: [{ text: "Interesting... thanks.", nextNode: 'greeting' }]
            };
        }
        if (dynamicText === 'DYNAMIC_PIGIERRE_GOSSIP') {
            var gossip = getPigierreGossip();
            if (gossip) {
                return {
                    text: "*Pigierre leans across the counter conspiratorially*<br><br>\"" + gossip + "\"",
                    choices: [{ text: "Back.", nextNode: 'greeting' }]
                };
            }
            return {
                text: "*Pigierre shrugs*<br><br>\"No gossip today, mon ami. Ze tavern, she is quiet.\"",
                choices: [{ text: "OK.", nextNode: 'greeting' }]
            };
        }
        return { text: "...", choices: [{ text: "Back.", nextNode: 'greeting' }] };
    }

    function resolveGossipDialog(dynamicText, npcName) {
        if (dynamicText === 'DYNAMIC_GRUNTON_GREETING') {
            var gossip = getTodayGossip(GRUNTON_GOSSIP, 'grunton');
            var worldEvent = getGruntonWorldEvent();
            var text;
            if (worldEvent) {
                text = "*Grunton looks at you with his squinting eyes*<br><br>" +
                    worldEvent + (gossip ? '<br><br>"Also... ' + gossip.text + '"' : '');
            } else if (gossip) {
                text = "*Grunton takes a long sip of his drink*<br><br>\"" + gossip.text + "\"";
            } else {
                text = "*Grunton grunts*<br><br>\"Nothin' to say today. Leave me be.\"";
            }
            return { text: text, choices: [{ text: "Thanks, Grunton.", nextNode: null }] };
        }

        if (dynamicText === 'DYNAMIC_TRUFFLE_GREETING') {
            var gossip = getTodayGossip(TRUFFLE_GOSSIP, 'truffle');
            var text;
            if (gossip) {
                text = "*Truffle leans in close, eyes sparkling*<br><br>\"Oh! Oh! I have to tell you something! " + gossip.text + "\"";
            } else {
                text = "*Truffle adjusts her flower*<br><br>\"Nothing juicy today, sweetie. Check back tomorrow!\"";
            }
            return { text: text, choices: [{ text: "Thanks for the gossip, Truffle!", nextNode: null }] };
        }

        if (dynamicText === 'DYNAMIC_SNICKERS_GREETING') {
            var question = getSnickersQuestion();
            if (question) {
                // Store pending question so answer node can look it up
                GameState._pendingSnickersQuestion = question;
                return {
                    text: "*Snickers bounces up to you, eyes wide*<br><br>\"HEY! HEY! You're the adventurer, right?! I have a question!\"<br><br>\"" + question.question + "\"",
                    choices: [
                        { text: "Tell Snickers about your adventure", nextNode: 'snickers_answer' },
                        { text: "Maybe later, kid.", nextNode: null }
                    ]
                };
            }
            return {
                text: "*Snickers waves at you*<br><br>\"Hi! I don't have any questions right now... but keep adventuring! I bet you'll do something AMAZING soon!\"",
                choices: [{ text: "See you around, Snickers.", nextNode: null }]
            };
        }

        return { text: "...", choices: [{ text: "Goodbye.", nextNode: null }] };
    }

    return {
        init: init,
        enterTavern: enterTavern,
        exitTavern: exitTavern,
        updateInterior: updateInterior,
        renderInterior: renderInterior,
        handleInteraction: handleInteraction,
        checkEnterTavern: checkEnterTavern,
        isInsideTavern: function() { return GameState.isInsideTavern; },
        showWinLore: showWinLore,
        resolvePigierreDialog: resolvePigierreDialog,
        resolveGossipDialog: resolveGossipDialog
    };
})();
