/**
 * ENVIRONMENT
 * Contains terrain, structures, lighting, and village creation.
 */

window.Environment = (function() {
    'use strict';

    /**
     * Set up scene lighting.
     */
    function setupLighting() {
        const ambient = new THREE.AmbientLight(0x404040, 0.6);
        GameState.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(50, 100, 50);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 500;
        sun.shadow.camera.left = -100;
        sun.shadow.camera.right = 100;
        sun.shadow.camera.top = 100;
        sun.shadow.camera.bottom = -100;
        GameState.scene.add(sun);

        const hemi = new THREE.HemisphereLight(0x87ceeb, 0x3d5c3d, 0.4);
        GameState.scene.add(hemi);
    }

    /**
     * Create the ground plane with height variation and grass.
     */
    function createGround() {
        // Initialize river path first so we can flatten terrain there
        initRiverPath();

        const groundGeo = new THREE.PlaneGeometry(CONFIG.WORLD_SIZE * 2, CONFIG.WORLD_SIZE * 2, 50, 50);

        const vertices = groundGeo.attributes.position.array;
        const gridSize = 51; // 50 segments = 51 vertices per side
        const worldSize = CONFIG.WORLD_SIZE * 2;

        for (let i = 0; i < vertices.length; i += 3) {
            // PlaneGeometry vertices already span from -WORLD_SIZE to +WORLD_SIZE
            const x = vertices[i];
            const z = vertices[i + 1];

            // Check if this vertex is in or near the river
            const inRiver = isInRiver(x, z);
            const nearRiver = !inRiver && RIVER_POINTS.length > 0 && (() => {
                let minDist = Infinity;
                for (let j = 0; j < RIVER_POINTS.length - 1; j++) {
                    const p1 = RIVER_POINTS[j];
                    const p2 = RIVER_POINTS[j + 1];
                    const dx = p2.x - p1.x;
                    const dz = p2.z - p1.z;
                    const len = Math.sqrt(dx * dx + dz * dz);
                    const t = Math.max(0, Math.min(1,
                        ((x - p1.x) * dx + (z - p1.z) * dz) / (len * len)
                    ));
                    const closestX = p1.x + t * dx;
                    const closestZ = p1.z + t * dz;
                    const dist = Math.sqrt((x - closestX) ** 2 + (z - closestZ) ** 2);
                    minDist = Math.min(minDist, dist);
                }
                return minDist < RIVER_WIDTH / 2 + 8;
            })();

            // Create a depression for the river
            if (inRiver) {
                vertices[i + 2] = -0.5; // River bed significantly below ground
            } else if (nearRiver) {
                // Calculate distance for slope
                let minDist = Infinity;
                for (let j = 0; j < RIVER_POINTS.length - 1; j++) {
                    const p1 = RIVER_POINTS[j];
                    const p2 = RIVER_POINTS[j + 1];
                    const dx = p2.x - p1.x;
                    const dz = p2.z - p1.z;
                    const len = Math.sqrt(dx * dx + dz * dz);
                    const t = Math.max(0, Math.min(1,
                        ((x - p1.x) * dx + (z - p1.z) * dz) / (len * len)
                    ));
                    const closestX = p1.x + t * dx;
                    const closestZ = p1.z + t * dz;
                    const dist = Math.sqrt((x - closestX) ** 2 + (z - closestZ) ** 2);
                    minDist = Math.min(minDist, dist);
                }
                // Smooth slope from river edge to normal terrain
                const edgeDist = minDist - RIVER_WIDTH / 2;
                const slopeFactor = edgeDist / 8; // 8 units of slope
                vertices[i + 2] = -0.5 + slopeFactor * 0.5 + Math.random() * 0.1;
            } else {
                vertices[i + 2] += Math.random() * 0.5; // Normal terrain variation
            }
        }
        groundGeo.computeVertexNormals();

        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x3d6b3d,
            roughness: 1,
            metalness: 0
        });

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        GameState.scene.add(ground);
        trackObject(ground);

        for (let i = 0; i < 500; i++) {
            const grass = createGrassPatch();
            grass.position.set(
                (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5,
                0.1,
                (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5
            );
            GameState.scene.add(grass);
            trackObject(grass);
        }
    }

    /**
     * Create a small cluster of grass blades.
     */
    function createGrassPatch() {
        const group = new THREE.Group();
        const grassMat = new THREE.MeshStandardMaterial({
            color: 0x228b22,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 5; i++) {
            const blade = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1, 0.5 + Math.random() * 0.5),
                grassMat
            );
            blade.position.set(
                (Math.random() - 0.5) * 0.5,
                0.25,
                (Math.random() - 0.5) * 0.5
            );
            blade.rotation.y = Math.random() * Math.PI;
            group.add(blade);
        }
        return group;
    }

    /**
     * Create a tree at the specified position.
     */
    function createTree(x, z) {
        const tree = new THREE.Group();

        const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 8 + Math.random() * 4, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 4;
        trunk.castShadow = true;
        tree.add(trunk);

        const foliageColors = [0x228b22, 0x2e8b2e, 0x1e7b1e];
        for (let i = 0; i < 3; i++) {
            const foliageGeo = new THREE.ConeGeometry(4 - i * 0.8, 5, 8);
            const foliageMat = new THREE.MeshStandardMaterial({
                color: foliageColors[i % foliageColors.length]
            });
            const foliage = new THREE.Mesh(foliageGeo, foliageMat);
            foliage.position.y = 8 + i * 2.5;
            foliage.castShadow = true;
            tree.add(foliage);
        }

        tree.position.set(x, 0, z);
        tree.userData.radius = 1.5;
        tree.userData.type = 'tree';
        tree.userData.health = 10;
        tree.userData.maxHealth = 10;
        tree.userData.biome = 'arboreal';
        return tree;
    }

    /**
     * Check if a position is inside the village area.
     */
    function isInVillage(x, z) {
        const dx = x - CONFIG.VILLAGE_CENTER.x;
        const dz = z - CONFIG.VILLAGE_CENTER.z;
        return Math.sqrt(dx * dx + dz * dz) < CONFIG.VILLAGE_RADIUS + 10;
    }

    // ========================================================================
    // RIVER SYSTEM
    // ========================================================================
    // River runs from bottom-left corner to middle-top of the map

    const RIVER_WIDTH = 15;
    const RIVER_POINTS = [];

    /**
     * Initialize river path points.
     * River flows from bottom-left (-x, +z) to middle-top (0, -z)
     */
    function initRiverPath() {
        // Clear any existing points
        RIVER_POINTS.length = 0;

        const worldSize = CONFIG.WORLD_SIZE;
        // Start at bottom-left corner
        const startX = -worldSize * 0.5;
        const startZ = worldSize * 0.5;
        // End at middle-top
        const endX = 0;
        const endZ = -worldSize * 0.5;

        // Create river path with some curves
        const numPoints = 20;
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            // Interpolate with some sine wave for natural curves
            const x = startX + (endX - startX) * t + Math.sin(t * Math.PI * 2) * 30;
            const z = startZ + (endZ - startZ) * t + Math.cos(t * Math.PI * 1.5) * 20;
            RIVER_POINTS.push({ x, z });
        }

        console.log('River initialized with', RIVER_POINTS.length, 'points');
        console.log('First point:', RIVER_POINTS[0]);
        console.log('Last point:', RIVER_POINTS[RIVER_POINTS.length - 1]);
    }

    /**
     * Check if a position is in the river.
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {boolean} - True if position is in river
     */
    function isInRiver(x, z) {
        if (RIVER_POINTS.length === 0) return false;

        // Find closest point on river path
        let minDist = Infinity;
        for (let i = 0; i < RIVER_POINTS.length - 1; i++) {
            const p1 = RIVER_POINTS[i];
            const p2 = RIVER_POINTS[i + 1];

            // Project point onto line segment
            const dx = p2.x - p1.x;
            const dz = p2.z - p1.z;
            const len = Math.sqrt(dx * dx + dz * dz);
            const t = Math.max(0, Math.min(1,
                ((x - p1.x) * dx + (z - p1.z) * dz) / (len * len)
            ));

            const closestX = p1.x + t * dx;
            const closestZ = p1.z + t * dz;
            const dist = Math.sqrt((x - closestX) ** 2 + (z - closestZ) ** 2);
            minDist = Math.min(minDist, dist);
        }

        return minDist < RIVER_WIDTH / 2;
    }

    /**
     * Check if a position is on the riverbank (near river but not in it).
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {boolean} - True if position is on riverbank
     */
    function isOnRiverbank(x, z) {
        if (RIVER_POINTS.length === 0) return false;

        let minDist = Infinity;
        for (let i = 0; i < RIVER_POINTS.length - 1; i++) {
            const p1 = RIVER_POINTS[i];
            const p2 = RIVER_POINTS[i + 1];

            const dx = p2.x - p1.x;
            const dz = p2.z - p1.z;
            const len = Math.sqrt(dx * dx + dz * dz);
            const t = Math.max(0, Math.min(1,
                ((x - p1.x) * dx + (z - p1.z) * dz) / (len * len)
            ));

            const closestX = p1.x + t * dx;
            const closestZ = p1.z + t * dz;
            const dist = Math.sqrt((x - closestX) ** 2 + (z - closestZ) ** 2);
            minDist = Math.min(minDist, dist);
        }

        // Riverbank is within 10 units of river edge but not in river
        return minDist >= RIVER_WIDTH / 2 && minDist < RIVER_WIDTH / 2 + 10;
    }

    /**
     * Create the river mesh and decorations.
     */
    function createRiver() {
        // River path already initialized in createGround()

        // Create river bed (slightly below ground)
        const riverBedMat = new THREE.MeshStandardMaterial({
            color: 0x2a4a3a,
            roughness: 0.9
        });

        // Create water surface
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x4a9fd8,
            transparent: true,
            opacity: 0.9,
            roughness: 0.2,
            metalness: 0.3,
            emissive: 0x1a4a6a,
            emissiveIntensity: 0.3,
            side: THREE.DoubleSide
        });

        // Create a continuous river mesh using extruded shape along path
        // We'll create a ribbon that follows the river points
        const riverWidth = RIVER_WIDTH;
        const bedWidth = RIVER_WIDTH + 6;

        // Generate vertices for river bed (wider ribbon)
        const bedVertices = [];
        const bedIndices = [];

        for (let i = 0; i < RIVER_POINTS.length; i++) {
            const point = RIVER_POINTS[i];

            // Calculate perpendicular direction for width
            let perpX, perpZ;
            if (i < RIVER_POINTS.length - 1) {
                const next = RIVER_POINTS[i + 1];
                const dx = next.x - point.x;
                const dz = next.z - point.z;
                const len = Math.sqrt(dx * dx + dz * dz);
                perpX = -dz / len;
                perpZ = dx / len;
            } else {
                const prev = RIVER_POINTS[i - 1];
                const dx = point.x - prev.x;
                const dz = point.z - prev.z;
                const len = Math.sqrt(dx * dx + dz * dz);
                perpX = -dz / len;
                perpZ = dx / len;
            }

            // Add left and right vertices
            bedVertices.push(
                point.x - perpX * bedWidth / 2, 0.4, point.z - perpZ * bedWidth / 2,  // left
                point.x + perpX * bedWidth / 2, 0.4, point.z + perpZ * bedWidth / 2   // right
            );

            // Create triangles between segments
            if (i > 0) {
                const base = (i - 1) * 2;
                bedIndices.push(
                    base, base + 1, base + 2,
                    base + 1, base + 3, base + 2
                );
            }
        }

        const bedGeo = new THREE.BufferGeometry();
        bedGeo.setAttribute('position', new THREE.Float32BufferAttribute(bedVertices, 3));
        bedGeo.setIndex(bedIndices);
        bedGeo.computeVertexNormals();

        const riverBed = new THREE.Mesh(bedGeo, riverBedMat);
        riverBed.receiveShadow = true;
        GameState.scene.add(riverBed);
        trackObject(riverBed);

        // Generate vertices for water surface (narrower ribbon)
        const waterVertices = [];
        const waterIndices = [];

        for (let i = 0; i < RIVER_POINTS.length; i++) {
            const point = RIVER_POINTS[i];

            let perpX, perpZ;
            if (i < RIVER_POINTS.length - 1) {
                const next = RIVER_POINTS[i + 1];
                const dx = next.x - point.x;
                const dz = next.z - point.z;
                const len = Math.sqrt(dx * dx + dz * dz);
                perpX = -dz / len;
                perpZ = dx / len;
            } else {
                const prev = RIVER_POINTS[i - 1];
                const dx = point.x - prev.x;
                const dz = point.z - prev.z;
                const len = Math.sqrt(dx * dx + dz * dz);
                perpX = -dz / len;
                perpZ = dx / len;
            }

            waterVertices.push(
                point.x - perpX * riverWidth / 2, 0.5, point.z - perpZ * riverWidth / 2,  // left
                point.x + perpX * riverWidth / 2, 0.5, point.z + perpZ * riverWidth / 2   // right
            );

            if (i > 0) {
                const base = (i - 1) * 2;
                waterIndices.push(
                    base, base + 1, base + 2,
                    base + 1, base + 3, base + 2
                );
            }
        }

        const waterGeo = new THREE.BufferGeometry();
        waterGeo.setAttribute('position', new THREE.Float32BufferAttribute(waterVertices, 3));
        waterGeo.setIndex(waterIndices);
        waterGeo.computeVertexNormals();

        const riverWater = new THREE.Mesh(waterGeo, waterMat);
        GameState.scene.add(riverWater);
        trackObject(riverWater);

        console.log('River created - bed vertices:', bedVertices.length / 3, 'water vertices:', waterVertices.length / 3);


        // Add river rocks
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
        for (let i = 0; i < 60; i++) {
            const pointIdx = Math.floor(Math.random() * (RIVER_POINTS.length - 1));
            const t = Math.random();
            const p1 = RIVER_POINTS[pointIdx];
            const p2 = RIVER_POINTS[pointIdx + 1] || p1;

            const x = p1.x + (p2.x - p1.x) * t + (Math.random() - 0.5) * RIVER_WIDTH * 0.8;
            const z = p1.z + (p2.z - p1.z) * t + (Math.random() - 0.5) * RIVER_WIDTH * 0.8;

            const rockGeo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5, 0);
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(x, 0.1, z);
            rock.scale.y = 0.5;
            rock.rotation.y = Math.random() * Math.PI * 2;
            GameState.scene.add(rock);
            trackObject(rock);
        }

        // Add riverbank decorations (reeds/cattails)
        const reedMat = new THREE.MeshStandardMaterial({ color: 0x4a6741 });
        for (let i = 0; i < 100; i++) {
            const pointIdx = Math.floor(Math.random() * (RIVER_POINTS.length - 1));
            const t = Math.random();
            const p1 = RIVER_POINTS[pointIdx];
            const p2 = RIVER_POINTS[pointIdx + 1] || p1;

            // Position on riverbank
            const centerX = p1.x + (p2.x - p1.x) * t;
            const centerZ = p1.z + (p2.z - p1.z) * t;
            const offsetAngle = Math.random() * Math.PI * 2;
            const offsetDist = RIVER_WIDTH / 2 + Math.random() * 5;
            const x = centerX + Math.cos(offsetAngle) * offsetDist;
            const z = centerZ + Math.sin(offsetAngle) * offsetDist;

            // Don't place in village
            if (isInVillage(x, z)) continue;

            // Create reed/cattail
            const reed = new THREE.Group();
            for (let j = 0; j < 3; j++) {
                const stalkGeo = new THREE.CylinderGeometry(0.02, 0.03, 1 + Math.random() * 0.5, 4);
                const stalk = new THREE.Mesh(stalkGeo, reedMat);
                stalk.position.set((Math.random() - 0.5) * 0.2, 0.5, (Math.random() - 0.5) * 0.2);
                stalk.rotation.x = (Math.random() - 0.5) * 0.2;
                reed.add(stalk);
            }
            reed.position.set(x, 0, z);
            GameState.scene.add(reed);
            trackObject(reed);
        }
    }

    /**
     * Create a rock decoration.
     */
    function createRock() {
        const rockGeo = new THREE.DodecahedronGeometry(1 + Math.random() * 1.5, 1);
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9
        });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.scale.y = 0.5;
        rock.castShadow = true;
        rock.receiveShadow = true;
        return rock;
    }

    /**
     * Create a fallen log decoration.
     */
    function createLog() {
        const log = new THREE.Group();
        const logGeo = new THREE.CylinderGeometry(0.4, 0.4, 5, 8);
        const logMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        const logMesh = new THREE.Mesh(logGeo, logMat);
        logMesh.rotation.z = Math.PI / 2;
        logMesh.castShadow = true;
        log.add(logMesh);
        return log;
    }

    /**
     * Create the forest with trees, rocks, and logs.
     */
    function createForest() {
        // Create river first so we can avoid placing trees in it
        createRiver();

        for (let i = 0; i < 400; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
            } while (Math.sqrt(x * x + z * z) < 15 || isInVillage(x, z) || isInRiver(x, z));

            const tree = createTree(x, z);
            GameState.trees.push(tree);
            GameState.scene.add(tree);
            trackObject(tree);
        }

        for (let i = 0; i < 120; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
            } while (isInVillage(x, z) || isInRiver(x, z));

            const rock = createRock();
            rock.position.set(x, 0, z);
            GameState.scene.add(rock);
            trackObject(rock);
        }

        for (let i = 0; i < 50; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
            } while (isInVillage(x, z) || isInRiver(x, z));

            const log = createLog();
            log.position.set(x, 0.3, z);
            log.rotation.y = Math.random() * Math.PI;
            GameState.scene.add(log);
            trackObject(log);
        }

        createVillage();
    }

    /**
     * Create a simple hut/cottage building.
     */
    function createHut(x, z, size, rotation) {
        size = size || 1;
        rotation = rotation || 0;
        const s = size;

        const hut = new THREE.Group();

        // Materials
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a0, roughness: 0.9 });
        const wallDarkMat = new THREE.MeshStandardMaterial({ color: 0xb8a882, roughness: 0.9 });
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x7a6b4e });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x6b3a2a, roughness: 0.85, side: THREE.DoubleSide });
        const roofEdgeMat = new THREE.MeshStandardMaterial({ color: 0x5a2d1e });
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2f1a, roughness: 0.7 });
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x8cb8d0, emissive: 0x1a3040, emissiveIntensity: 0.3 });
        const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x808075, roughness: 1.0 });

        // ============================================================
        // FOUNDATION — stone base lifts the house off the ground
        // ============================================================
        const foundGeo = new THREE.BoxGeometry(6.4 * s, 0.5, 5.4 * s);
        const foundation = new THREE.Mesh(foundGeo, stoneMat);
        foundation.position.y = 0.25;
        foundation.receiveShadow = true;
        foundation.castShadow = true;
        hut.add(foundation);

        // ============================================================
        // WALLS — main structure with slight inset for depth
        // ============================================================
        const wallH = 3.2 * s;
        const wallBase = 0.5;

        // Front wall
        const wallFrontGeo = new THREE.BoxGeometry(6 * s, wallH, 0.25);
        const wallFront = new THREE.Mesh(wallFrontGeo, wallMat);
        wallFront.position.set(0, wallBase + wallH / 2, 2.5 * s);
        wallFront.castShadow = true;
        wallFront.receiveShadow = true;
        hut.add(wallFront);

        // Back wall (slightly darker)
        const wallBack = new THREE.Mesh(wallFrontGeo, wallDarkMat);
        wallBack.position.set(0, wallBase + wallH / 2, -2.5 * s);
        wallBack.castShadow = true;
        wallBack.receiveShadow = true;
        hut.add(wallBack);

        // Side walls
        const wallSideGeo = new THREE.BoxGeometry(0.25, wallH, 5 * s);
        const wallLeft = new THREE.Mesh(wallSideGeo, wallDarkMat);
        wallLeft.position.set(-3 * s, wallBase + wallH / 2, 0);
        wallLeft.castShadow = true;
        wallLeft.receiveShadow = true;
        hut.add(wallLeft);

        const wallRight = new THREE.Mesh(wallSideGeo, wallMat);
        wallRight.position.set(3 * s, wallBase + wallH / 2, 0);
        wallRight.castShadow = true;
        wallRight.receiveShadow = true;
        hut.add(wallRight);

        // ============================================================
        // TIMBER FRAME — exposed wooden beams for character
        // ============================================================
        const beamThick = 0.18;

        // Corner posts (vertical beams)
        const cornerGeo = new THREE.BoxGeometry(beamThick, wallH + 0.1, beamThick);
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
            const corner = new THREE.Mesh(cornerGeo, beamMat);
            corner.position.set(sx * 3 * s, wallBase + wallH / 2, sz * 2.5 * s);
            hut.add(corner);
        });

        // Horizontal beam along front top
        const hBeamFrontGeo = new THREE.BoxGeometry(6 * s + beamThick, beamThick, beamThick);
        const hBeamFront = new THREE.Mesh(hBeamFrontGeo, beamMat);
        hBeamFront.position.set(0, wallBase + wallH, 2.5 * s);
        hut.add(hBeamFront);

        // Horizontal beam along back top
        const hBeamBack = hBeamFront.clone();
        hBeamBack.position.z = -2.5 * s;
        hut.add(hBeamBack);

        // Cross beam on front wall (decorative X)
        const crossLen = Math.sqrt((3 * s) * (3 * s) + (wallH * 0.5) * (wallH * 0.5));
        const crossGeo = new THREE.BoxGeometry(crossLen, 0.1, 0.1);

        // Only add cross on the side wall (right side, visible)
        const crossAngle = Math.atan2(wallH * 0.4, 2.5 * s);
        const cross1 = new THREE.Mesh(crossGeo, beamMat);
        cross1.position.set(3 * s + 0.05, wallBase + wallH * 0.5, 0);
        cross1.rotation.y = Math.PI / 2;
        cross1.rotation.x = crossAngle;
        hut.add(cross1);

        const cross2 = new THREE.Mesh(crossGeo, beamMat);
        cross2.position.set(3 * s + 0.05, wallBase + wallH * 0.5, 0);
        cross2.rotation.y = Math.PI / 2;
        cross2.rotation.x = -crossAngle;
        hut.add(cross2);

        // ============================================================
        // ROOF — pyramid roof using ConeGeometry (reliable at any rotation)
        // ============================================================
        const roofH = 2.5 * s;
        const roofY = wallBase + wallH;

        // ConeGeometry with 4 sides = pyramid shape
        // Radius needs to reach from center to the corners of the roof
        const roofRadius = 4.5 * s;  // Overhang past walls
        const roofGeo = new THREE.ConeGeometry(roofRadius, roofH, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(0, roofY + roofH / 2, 0);
        roof.rotation.y = Math.PI / 4;  // Rotate 45° so edges align with walls
        roof.castShadow = true;
        roof.receiveShadow = true;
        hut.add(roof);

        // ============================================================
        // DOOR — with frame and small step
        // ============================================================
        const doorW = 1.2 * s;
        const doorH = 2.2 * s;

        // Door recess (dark behind the door)
        const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.3);
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, wallBase + doorH / 2, 2.5 * s);
        hut.add(door);

        // Door frame
        const frameThick = 0.12;
        const frameVGeo = new THREE.BoxGeometry(frameThick, doorH + frameThick, frameThick);
        const frameHGeo = new THREE.BoxGeometry(doorW + frameThick * 2, frameThick, frameThick);

        [-1, 1].forEach(side => {
            const frameV = new THREE.Mesh(frameVGeo, beamMat);
            frameV.position.set(side * (doorW / 2 + frameThick / 2), wallBase + doorH / 2, 2.5 * s + 0.1);
            hut.add(frameV);
        });
        const frameTop = new THREE.Mesh(frameHGeo, beamMat);
        frameTop.position.set(0, wallBase + doorH + frameThick / 2, 2.5 * s + 0.1);
        hut.add(frameTop);

        // Doorstep
        const stepGeo = new THREE.BoxGeometry(1.8 * s, 0.15, 0.6);
        const step = new THREE.Mesh(stepGeo, stoneMat);
        step.position.set(0, 0.58, 2.8 * s);
        hut.add(step);

        // ============================================================
        // WINDOWS — with shutters and cross frame
        // ============================================================
        const winW = 0.9 * s;
        const winH = 0.8 * s;

        // Side windows (both sides)
        [[-1, wallMat], [1, wallMat]].forEach(([side]) => {
            // Window glass
            const winGeo = new THREE.BoxGeometry(0.3, winH, winW);
            const win = new THREE.Mesh(winGeo, windowMat);
            win.position.set(side * (3 * s + 0.05), wallBase + wallH * 0.55, 0.8 * s);
            hut.add(win);

            // Window frame (cross pattern)
            const frameCrossV = new THREE.BoxGeometry(0.32, winH, 0.06);
            const fv = new THREE.Mesh(frameCrossV, windowFrameMat);
            fv.position.set(side * (3 * s + 0.08), wallBase + wallH * 0.55, 0.8 * s);
            hut.add(fv);

            const frameCrossH = new THREE.BoxGeometry(0.32, 0.06, winW);
            const fh = new THREE.Mesh(frameCrossH, windowFrameMat);
            fh.position.set(side * (3 * s + 0.08), wallBase + wallH * 0.55, 0.8 * s);
            hut.add(fh);
        });

        // Front window (next to door)
        const frontWinGeo = new THREE.BoxGeometry(winW, winH, 0.3);
        const frontWin = new THREE.Mesh(frontWinGeo, windowMat);
        frontWin.position.set(1.8 * s, wallBase + wallH * 0.55, 2.5 * s + 0.05);
        hut.add(frontWin);

        // Front window cross
        const fwcV = new THREE.Mesh(new THREE.BoxGeometry(0.06, winH, 0.32), windowFrameMat);
        fwcV.position.set(1.8 * s, wallBase + wallH * 0.55, 2.5 * s + 0.08);
        hut.add(fwcV);
        const fwcH = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.06, 0.32), windowFrameMat);
        fwcH.position.set(1.8 * s, wallBase + wallH * 0.55, 2.5 * s + 0.08);
        hut.add(fwcH);

        // ============================================================
        // CHIMNEY — small stone chimney on the back
        // ============================================================
        const chimGeo = new THREE.BoxGeometry(0.7 * s, 2.5 * s, 0.7 * s);
        const chimney = new THREE.Mesh(chimGeo, stoneMat);
        chimney.position.set(-1.5 * s, roofY + 1 * s, -2 * s);
        chimney.castShadow = true;
        hut.add(chimney);

        // Chimney top (wider cap)
        const chimCapGeo = new THREE.BoxGeometry(0.9 * s, 0.15, 0.9 * s);
        const chimCap = new THREE.Mesh(chimCapGeo, stoneMat);
        chimCap.position.set(-1.5 * s, roofY + 2.25 * s, -2 * s);
        hut.add(chimCap);

        hut.position.set(x, 0, z);
        hut.rotation.y = rotation;

        return hut;
    }

    /**
     * Create a wooden fence segment.
     */
    function createFence(x, z, length, rotation) {
        length = length || 8;
        rotation = rotation || 0;

        const fence = new THREE.Group();
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });

        const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8);
        const numPosts = Math.floor(length / 2) + 1;

        for (let i = 0; i < numPosts; i++) {
            const post = new THREE.Mesh(postGeo, woodMat);
            post.position.set(i * 2 - length / 2, 0.75, 0);
            post.castShadow = true;
            fence.add(post);
        }

        const railGeo = new THREE.BoxGeometry(length, 0.15, 0.1);
        const rail1 = new THREE.Mesh(railGeo, woodMat);
        rail1.position.y = 0.5;
        fence.add(rail1);

        const rail2 = new THREE.Mesh(railGeo, woodMat);
        rail2.position.y = 1.1;
        fence.add(rail2);

        fence.position.set(x, 0, z);
        fence.rotation.y = rotation;

        return fence;
    }

    /**
     * Create a well structure.
     */
    function createWell(x, z) {
        const well = new THREE.Group();

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x696969 });
        const baseGeo = new THREE.CylinderGeometry(1.5, 1.8, 1, 12);
        const base = new THREE.Mesh(baseGeo, stoneMat);
        base.position.y = 0.5;
        base.castShadow = true;
        well.add(base);

        const waterMat = new THREE.MeshStandardMaterial({ color: 0x1a3d5c });
        const waterGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 12);
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.y = 0.8;
        well.add(water);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const supportGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8);

        [-1, 1].forEach(side => {
            const support = new THREE.Mesh(supportGeo, woodMat);
            support.position.set(side * 1.2, 2.25, 0);
            support.castShadow = true;
            well.add(support);
        });

        const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.8, 8);
        const beam = new THREE.Mesh(beamGeo, woodMat);
        beam.position.y = 3.5;
        beam.rotation.z = Math.PI / 2;
        well.add(beam);

        const roofGeo = new THREE.ConeGeometry(1.8, 1, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 4.2;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        well.add(roof);

        const bucketMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const bucketGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.4, 8);
        const bucket = new THREE.Mesh(bucketGeo, bucketMat);
        bucket.position.set(0, 2.5, 0.5);
        well.add(bucket);

        well.position.set(x, 0, z);
        return well;
    }

    /**
     * Create the entire village.
     */
    function createVillage() {
        const vx = CONFIG.VILLAGE_CENTER.x;
        const vz = CONFIG.VILLAGE_CENTER.z;

        const mainHut = createHut(vx, vz, 1.2, 0);
        GameState.scene.add(mainHut);
        trackObject(mainHut);

        const hut2 = createHut(vx + 20, vz + 15, 0.9, Math.PI / 6);
        GameState.scene.add(hut2);
        trackObject(hut2);

        const hut3 = createHut(vx - 18, vz + 20, 1.0, -Math.PI / 4);
        GameState.scene.add(hut3);
        trackObject(hut3);

        const hut4 = createHut(vx + 25, vz - 12, 0.85, Math.PI / 3);
        GameState.scene.add(hut4);
        trackObject(hut4);

        const hut5 = createHut(vx - 22, vz - 18, 0.95, Math.PI);
        GameState.scene.add(hut5);
        trackObject(hut5);

        // The Tavern — bigger building at the edge of the village
        createTavern(vx - 30, vz + 30);

        const well = createWell(vx + 5, vz + 8);
        GameState.scene.add(well);
        trackObject(well);

        const fence1 = createFence(vx + 35, vz, 12, 0);
        GameState.scene.add(fence1);
        trackObject(fence1);
        const fence2 = createFence(vx + 35, vz + 15, 12, 0);
        GameState.scene.add(fence2);
        trackObject(fence2);
        const fence3 = createFence(vx + 41, vz + 7.5, 15, Math.PI / 2);
        GameState.scene.add(fence3);
        trackObject(fence3);

        const fence4 = createFence(vx - 35, vz, 12, 0);
        GameState.scene.add(fence4);
        trackObject(fence4);
        const fence5 = createFence(vx - 35, vz - 15, 12, 0);
        GameState.scene.add(fence5);
        trackObject(fence5);
        const fence6 = createFence(vx - 41, vz - 7.5, 15, Math.PI / 2);
        GameState.scene.add(fence6);
        trackObject(fence6);

        const groundMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const villageGround = new THREE.Mesh(
            new THREE.CircleGeometry(CONFIG.VILLAGE_RADIUS * 0.8, 32),
            groundMat
        );
        villageGround.rotation.x = -Math.PI / 2;
        villageGround.position.set(vx, 0.05, vz);
        villageGround.receiveShadow = true;
        GameState.scene.add(villageGround);
        trackObject(villageGround);

        const pathMat = new THREE.MeshStandardMaterial({ color: 0x9b8b75 });
        const pathLength = CONFIG.WORLD_SIZE * 0.4;
        const pathGeo = new THREE.PlaneGeometry(4, pathLength);
        const path = new THREE.Mesh(pathGeo, pathMat);
        path.rotation.x = -Math.PI / 2;
        path.rotation.z = Math.PI / 4;
        path.position.set(vx + pathLength * 0.35, 0.06, vz + pathLength * 0.35);
        path.receiveShadow = true;
        GameState.scene.add(path);
        trackObject(path);

        const hayMat = new THREE.MeshStandardMaterial({ color: 0xdaa520 });
        for (let i = 0; i < 5; i++) {
            const hayGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 12);
            const hay = new THREE.Mesh(hayGeo, hayMat);
            hay.rotation.x = Math.PI / 2;
            hay.position.set(
                vx + 30 + Math.random() * 8,
                0.6,
                vz - 25 + Math.random() * 8
            );
            hay.castShadow = true;
            GameState.scene.add(hay);
            trackObject(hay);
        }

        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
        for (let i = 0; i < 4; i++) {
            const barrelGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.2, 12);
            const barrel = new THREE.Mesh(barrelGeo, barrelMat);
            barrel.position.set(
                vx - 25 + i * 1.5,
                0.6,
                vz + 28
            );
            barrel.castShadow = true;
            GameState.scene.add(barrel);
            trackObject(barrel);
        }

        const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const torchPositions = [
            [vx + 15, vz + 5],
            [vx - 15, vz + 5],
            [vx + 15, vz - 15],
            [vx - 15, vz - 15],
        ];
        torchPositions.forEach(([tx, tz]) => {
            const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 3, 8);
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.set(tx, 1.5, tz);
            pole.castShadow = true;
            GameState.scene.add(pole);
            trackObject(pole);

            const lanternMat = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xff6600,
                emissiveIntensity: 0.5
            });
            const lanternGeo = new THREE.BoxGeometry(0.4, 0.5, 0.4);
            const lantern = new THREE.Mesh(lanternGeo, lanternMat);
            lantern.position.set(tx, 3.2, tz);
            GameState.scene.add(lantern);
            trackObject(lantern);
        });

        // ============================================================
        // CROSSROAD SIGNPOST — points to biomes and unknown lands
        // ============================================================
        const signpost = new THREE.Group();
        const signX = vx + 10;
        const signZ = vz - 5;

        // Tall wooden pole
        const signPoleMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        const signPoleGeo = new THREE.CylinderGeometry(0.15, 0.2, 5, 8);
        const signPole = new THREE.Mesh(signPoleGeo, signPoleMat);
        signPole.position.y = 2.5;
        signPole.castShadow = true;
        signpost.add(signPole);

        // Helper: create a sign plank with text using canvas texture
        function makeSignPlank(text, color, yPos, rotY, pointRight) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            // Wooden plank background
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 256, 64);

            // Darker wood grain lines
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 5 + i * 8);
                ctx.lineTo(256, 5 + i * 8 + (Math.random() - 0.5) * 4);
                ctx.stroke();
            }

            // Text
            ctx.fillStyle = '#1a1008';
            ctx.font = 'bold 28px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 128, 32);

            const texture = new THREE.CanvasTexture(canvas);
            const plankMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 });

            // Arrow-shaped plank: wider on pointing side, narrow on pole side
            const plankW = 2.4;
            const plankH = 0.4;
            const plankD = 0.12;
            const plankGeo = new THREE.BoxGeometry(plankW, plankH, plankD);

            const plank = new THREE.Mesh(plankGeo, plankMat);
            // Offset so one end is at the pole
            plank.position.set(pointRight ? plankW / 2 + 0.15 : -plankW / 2 - 0.15, yPos, 0);
            plank.rotation.y = rotY;
            plank.castShadow = true;

            // Arrow tip (triangle pointing outward)
            const tipGeo = new THREE.BufferGeometry();
            const tipDir = pointRight ? 1 : -1;
            const tipX = tipDir * (plankW / 2);
            tipGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
                tipX, -plankH * 0.7, 0,
                tipX, plankH * 0.7, 0,
                tipX + tipDir * 0.4, 0, 0,
            ]), 3));
            tipGeo.computeVertexNormals();
            const tipMat = new THREE.MeshStandardMaterial({
                color: parseInt(color.replace('#', '0x')),
                roughness: 0.9,
                side: THREE.DoubleSide
            });
            const tip = new THREE.Mesh(tipGeo, tipMat);
            tip.position.copy(plank.position);
            tip.rotation.y = rotY;

            const group = new THREE.Group();
            group.add(plank);
            group.add(tip);
            return group;
        }

        // 4 signs at different heights pointing in correct world directions
        // In Three.js: north = -Z, south = +Z, west = -X, east = +X
        // rotation.y = 0 points along +X (east)
        // rotation.y = PI/2 points along -Z (north)
        // rotation.y = PI points along -X (west)

        // North (-Z): Savannah (warm golden color) — pointRight extends to +X, rotate PI/2 to face -Z
        const sign1 = makeSignPlank('Savannah', '#b8860b', 4.2, 0, true);
        sign1.rotation.y = Math.PI / 2;
        signpost.add(sign1);

        // Northwest: Snowy Mountains (cool blue-gray) — via savannah then west
        const sign2 = makeSignPlank('Snowy Mountains', '#8b9dad', 3.6, 0, false);
        sign2.rotation.y = -Math.PI / 4;  // pointLeft=-X, rotated to point northwest
        signpost.add(sign2);

        // South-East: Unknown (weathered look)
        const sign3 = makeSignPlank('Unknown', '#7a6b55', 3.0, 0, true);
        sign3.rotation.y = -Math.PI / 4;  // pointRight=+X, rotated to point southeast
        signpost.add(sign3);

        // South-West: Unknown (weathered look)
        const sign4 = makeSignPlank('Unknown', '#7a6b55', 2.4, 0, false);
        sign4.rotation.y = Math.PI / 4;  // pointLeft=-X, rotated to point southwest
        signpost.add(sign4);
        signpost.add(sign4);

        // Top cap (decorative sphere on top of pole)
        const capGeo = new THREE.SphereGeometry(0.22, 8, 8);
        const cap = new THREE.Mesh(capGeo, signPoleMat);
        cap.position.y = 5.05;
        signpost.add(cap);

        signpost.position.set(signX, 0, signZ);
        GameState.scene.add(signpost);
        trackObject(signpost);

        Dialogs.createVillagers();
    }

    // ========================================================================
    // BIOME SYSTEM
    // ========================================================================

    // Track environment objects for cleanup
    let environmentObjects = [];
    let currentBiomeId = 'arboreal';

    /**
     * Store an object for later cleanup when changing biomes.
     */
    function trackObject(obj) {
        environmentObjects.push(obj);
    }

    /**
     * Clear all tracked environment objects.
     */
    function clearEnvironment() {
        environmentObjects.forEach(obj => {
            GameState.scene.remove(obj);
        });
        environmentObjects = [];
        GameState.trees = [];
        RIVER_POINTS.length = 0;

        // Clear snow particles if they exist
        if (GameState.snowParticles) {
            GameState.scene.remove(GameState.snowParticles);
            GameState.snowParticles = null;
        }

        // Clear ocean water
        if (GameState.oceanWater) {
            GameState.scene.remove(GameState.oceanWater);
            GameState.oceanWater = null;
            GameState.oceanShoreZ = null;
            GameState.oceanDeepZ = null;
        }

        // Clear ocean islands
        GameState.oceanIslands = [];

        // Reset scene background and fog to defaults
        GameState.scene.background = new THREE.Color(0x87ceeb);  // Default sky blue
        GameState.scene.fog = null;
    }

    /**
     * Rebuild the environment for a specific biome.
     * @param {string} biomeId - The biome to build
     */
    function rebuildForBiome(biomeId) {
        clearEnvironment();
        currentBiomeId = biomeId;

        const biomeData = getBiomeData(biomeId);

        // Create ground with biome-specific color
        createGroundForBiome(biomeData);

        // Create biome-specific features
        if (biomeData.waterFeature === 'river') {
            initRiverPath();
            createRiver();
        } else if (biomeData.waterFeature === 'wateringHole') {
            createWateringHole(biomeData);
        }

        // Create forest if biome has it
        if (biomeData.hasForest) {
            createForestElements();
        } else if (biomeData.id === 'snowy_mountains') {
            // Snowy mountains - empty for now except rocks
            createSnowyMountainElements(biomeData);
        } else if (biomeData.id === 'coastal') {
            // Coastal biome - birch forest, ocean, beach
            createCoastalElements(biomeData);
        } else {
            // Savannah has scattered trees and rocks
            createSavannahElements(biomeData);
        }

        // Create village if biome has it
        if (biomeData.hasVillage) {
            createVillage();
        }

        // Create grass tufts for deer (snowy mountains only)
        if (biomeData.id === 'snowy_mountains') {
            createGrassTufts(30); // 30 grass tufts scattered around
        }

        // Update sky color if biome specifies it
        if (biomeData.skyColor !== undefined) {
            GameState.scene.background = new THREE.Color(biomeData.skyColor);
        }

        // Update fog if biome specifies it
        if (biomeData.fogColor !== undefined && biomeData.fogDensity !== undefined) {
            var density = biomeData.fogDensity;
            // Memory Collector skin reduces fog
            var activeSkin = SKINS[GameState.currentSkin || 'default'];
            if (activeSkin && activeSkin.fogReduction) {
                density *= activeSkin.fogReduction;
            }
            GameState.scene.fog = new THREE.FogExp2(biomeData.fogColor, density);
        } else {
            // Clear fog if not specified
            GameState.scene.fog = null;
        }
    }

    /**
     * Create ground for a specific biome.
     * @param {Object} biomeData - The biome configuration
     */
    function createGroundForBiome(biomeData) {
        // Initialize river path first if this biome has a river
        if (biomeData.waterFeature === 'river') {
            initRiverPath();
        }

        const groundGeo = new THREE.PlaneGeometry(CONFIG.WORLD_SIZE * 2, CONFIG.WORLD_SIZE * 2, 50, 50);
        const vertices = groundGeo.attributes.position.array;

        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 1];

            // Check if in river (only for arboreal biome)
            if (biomeData.waterFeature === 'river') {
                const inRiver = isInRiver(x, z);
                const nearRiver = !inRiver && RIVER_POINTS.length > 0 && (() => {
                    let minDist = Infinity;
                    for (let j = 0; j < RIVER_POINTS.length - 1; j++) {
                        const p1 = RIVER_POINTS[j];
                        const p2 = RIVER_POINTS[j + 1];
                        const dx = p2.x - p1.x;
                        const dz = p2.z - p1.z;
                        const len = Math.sqrt(dx * dx + dz * dz);
                        const t = Math.max(0, Math.min(1,
                            ((x - p1.x) * dx + (z - p1.z) * dz) / (len * len)
                        ));
                        const closestX = p1.x + t * dx;
                        const closestZ = p1.z + t * dz;
                        const dist = Math.sqrt((x - closestX) ** 2 + (z - closestZ) ** 2);
                        minDist = Math.min(minDist, dist);
                    }
                    return minDist < RIVER_WIDTH / 2 + 8;
                })();

                if (inRiver) {
                    vertices[i + 2] = -0.5;
                } else if (nearRiver) {
                    let minDist = Infinity;
                    for (let j = 0; j < RIVER_POINTS.length - 1; j++) {
                        const p1 = RIVER_POINTS[j];
                        const p2 = RIVER_POINTS[j + 1];
                        const dx = p2.x - p1.x;
                        const dz = p2.z - p1.z;
                        const len = Math.sqrt(dx * dx + dz * dz);
                        const t = Math.max(0, Math.min(1,
                            ((x - p1.x) * dx + (z - p1.z) * dz) / (len * len)
                        ));
                        const closestX = p1.x + t * dx;
                        const closestZ = p1.z + t * dz;
                        const dist = Math.sqrt((x - closestX) ** 2 + (z - closestZ) ** 2);
                        minDist = Math.min(minDist, dist);
                    }
                    const edgeDist = minDist - RIVER_WIDTH / 2;
                    const slopeFactor = edgeDist / 8;
                    vertices[i + 2] = -0.5 + slopeFactor * 0.5 + Math.random() * 0.1;
                } else {
                    vertices[i + 2] += Math.random() * 0.5;
                }
            }
            // Check if near watering hole (for savannah)
            else if (biomeData.waterFeature === 'wateringHole') {
                const holePos = biomeData.wateringHolePosition;
                const holeRadius = biomeData.wateringHoleRadius;
                const dist = Math.sqrt((x - holePos.x) ** 2 + (z - holePos.z) ** 2);

                if (dist < holeRadius) {
                    // Inside watering hole - depression
                    vertices[i + 2] = -0.3;
                } else if (dist < holeRadius + 5) {
                    // Slope around watering hole
                    const slopeFactor = (dist - holeRadius) / 5;
                    vertices[i + 2] = -0.3 + slopeFactor * 0.3 + Math.random() * 0.1;
                } else {
                    vertices[i + 2] += Math.random() * 0.3; // Flatter terrain for savannah
                }
            }
            // Coastal biome - split ground: forest north, sand middle, ocean south
            else if (biomeData.waterFeature === 'ocean') {
                var forestEndZ = biomeData.forestEndZ || 0;
                var sandEndZ = biomeData.sandEndZ || 200;
                // geometry Y maps to world -Z after rotation
                // geoY > 0 = north (forest), geoY < 0 = south
                var worldZ = -z; // z here is geometry Y

                if (worldZ < forestEndZ) {
                    // Forest area - normal terrain variation
                    vertices[i + 2] += Math.random() * 0.4;
                } else if (worldZ < sandEndZ) {
                    // Sand area - flat
                    vertices[i + 2] = Math.random() * 0.05;
                } else {
                    // Ocean floor - depression
                    vertices[i + 2] = -0.5;
                }
            } else {
                vertices[i + 2] += Math.random() * 0.5;
            }
        }

        // For coastal biome, add vertex colors for split ground
        var isCoastal = biomeData.waterFeature === 'ocean';
        if (isCoastal) {
            var colors = [];
            var forestColor = new THREE.Color(biomeData.groundColor);   // 0x4a5a3a
            var sandColor = new THREE.Color(biomeData.sandColor || 0xd2b48c);
            var oceanFloorColor = new THREE.Color(0x3a5a4a);
            var cForestEndZ = biomeData.forestEndZ || 0;
            var cSandEndZ = biomeData.sandEndZ || 200;

            for (var ci = 0; ci < vertices.length; ci += 3) {
                var geoY = vertices[ci + 1];
                var wZ = -geoY; // world Z
                var col;
                if (wZ < cForestEndZ - 20) {
                    col = forestColor;
                } else if (wZ < cForestEndZ + 20) {
                    // Blend zone between forest and sand
                    var blend = (wZ - (cForestEndZ - 20)) / 40;
                    col = forestColor.clone().lerp(sandColor, Math.max(0, Math.min(1, blend)));
                } else if (wZ < cSandEndZ - 10) {
                    col = sandColor;
                } else if (wZ < cSandEndZ + 10) {
                    // Blend zone between sand and ocean
                    var blend2 = (wZ - (cSandEndZ - 10)) / 20;
                    col = sandColor.clone().lerp(oceanFloorColor, Math.max(0, Math.min(1, blend2)));
                } else {
                    col = oceanFloorColor;
                }
                colors.push(col.r, col.g, col.b);
            }
            groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        }

        groundGeo.computeVertexNormals();

        const groundMat = new THREE.MeshStandardMaterial({
            color: isCoastal ? 0xffffff : biomeData.groundColor,
            roughness: 1,
            metalness: 0,
            vertexColors: isCoastal
        });

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        GameState.scene.add(ground);
        trackObject(ground);

        // Create grass patches with biome-specific color
        const grassMat = new THREE.MeshStandardMaterial({
            color: biomeData.grassColor,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 500; i++) {
            const grass = createGrassPatchWithMaterial(grassMat);
            var gx = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
            var gz = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;

            // For coastal biome, only spawn grass in the forest area (north)
            if (isCoastal) {
                gz = -Math.abs(gz);
            }

            grass.position.set(gx, 0.1, gz);
            GameState.scene.add(grass);
            trackObject(grass);
        }
    }

    /**
     * Create a grass patch with a specific material.
     */
    function createGrassPatchWithMaterial(grassMat) {
        const group = new THREE.Group();

        for (let i = 0; i < 5; i++) {
            const blade = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1, 0.5 + Math.random() * 0.5),
                grassMat
            );
            blade.position.set(
                (Math.random() - 0.5) * 0.5,
                0.25,
                (Math.random() - 0.5) * 0.5
            );
            blade.rotation.y = Math.random() * Math.PI;
            group.add(blade);
        }
        return group;
    }

    /**
     * Create a watering hole for the savannah biome.
     * @param {Object} biomeData - The biome configuration
     */
    function createWateringHole(biomeData) {
        const holePos = biomeData.wateringHolePosition;
        const radius = biomeData.wateringHoleRadius;

        // Create water bed (darker ground underneath)
        const bedMat = new THREE.MeshStandardMaterial({
            color: 0x2a4a3a,
            roughness: 0.9
        });
        const bedGeo = new THREE.CircleGeometry(radius + 2, 32);
        const bed = new THREE.Mesh(bedGeo, bedMat);
        bed.rotation.x = -Math.PI / 2;
        bed.position.set(holePos.x, 0.01, holePos.z);
        GameState.scene.add(bed);
        trackObject(bed);

        // Create water surface
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x4a9fd8,
            transparent: true,
            opacity: 0.85,
            roughness: 0.2,
            metalness: 0.3,
            emissive: 0x1a4a6a,
            emissiveIntensity: 0.3
        });
        const waterGeo = new THREE.CircleGeometry(radius, 32);
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.set(holePos.x, 0.2, holePos.z);
        GameState.scene.add(water);
        trackObject(water);

        // Add some rocks around the watering hole
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2 + Math.random() * 0.3;
            const dist = radius + 1 + Math.random() * 3;
            const x = holePos.x + Math.cos(angle) * dist;
            const z = holePos.z + Math.sin(angle) * dist;

            const rockGeo = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5, 0);
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(x, 0.15, z);
            rock.scale.y = 0.5;
            rock.rotation.y = Math.random() * Math.PI * 2;
            GameState.scene.add(rock);
            trackObject(rock);
        }
    }

    /**
     * Check if a position is in the watering hole.
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {boolean}
     */
    function isInWateringHole(x, z) {
        if (currentBiomeId !== 'savannah') return false;
        const biomeData = getBiomeData('savannah');
        if (biomeData.waterFeature !== 'wateringHole') return false;

        const holePos = biomeData.wateringHolePosition;
        const radius = biomeData.wateringHoleRadius;
        const dist = Math.sqrt((x - holePos.x) ** 2 + (z - holePos.z) ** 2);
        return dist < radius;
    }

    /**
     * Create forest elements (trees, rocks, logs) - used by arboreal biome.
     */
    function createForestElements() {
        for (let i = 0; i < 400; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
            } while (Math.sqrt(x * x + z * z) < 15 || isInVillage(x, z) || isInRiver(x, z));

            const tree = createTree(x, z);
            GameState.trees.push(tree);
            GameState.scene.add(tree);
            trackObject(tree);
        }

        for (let i = 0; i < 120; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
            } while (isInVillage(x, z) || isInRiver(x, z));

            const rock = createRock();
            rock.position.set(x, 0, z);
            GameState.scene.add(rock);
            trackObject(rock);
        }

        for (let i = 0; i < 50; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
            } while (isInVillage(x, z) || isInRiver(x, z));

            const log = createLog();
            log.position.set(x, 0.3, z);
            log.rotation.y = Math.random() * Math.PI;
            GameState.scene.add(log);
            trackObject(log);
        }
    }

    /**
     * Create savannah elements (sparse trees, rocks, dry grass).
     * @param {Object} biomeData - The biome configuration
     */
    function createSavannahElements(biomeData) {
        const holePos = biomeData.wateringHolePosition || { x: 0, z: 0 };
        const holeRadius = biomeData.wateringHoleRadius || 7.5;

        // Sparse acacia-like trees
        for (let i = 0; i < 50; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
            } while (Math.sqrt(x * x + z * z) < 15 || isInWateringHole(x, z));

            const tree = createSavannahTree(x, z);
            GameState.trees.push(tree);
            GameState.scene.add(tree);
            trackObject(tree);
        }

        // Scattered rocks
        for (let i = 0; i < 60; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
            } while (isInWateringHole(x, z));

            const rock = createRock();
            rock.position.set(x, 0, z);
            GameState.scene.add(rock);
            trackObject(rock);
        }

        // Create Ningle's Research Hut in the southeast corner
        createResearchHut(35, 35);

        // Create the ancient skull dig spot — half-buried in the back wall of Ningle's hut
        // Hut is at (35, 35) and faces southwest, so the back wall is northeast
        // hut rotation = atan2(-35, -35) ≈ -2.36 rad, back is opposite = +0.79 rad
        const hutBackAngle = Math.atan2(-35, -35) + Math.PI;
        const skullX = 35 + Math.cos(hutBackAngle) * 4.2;  // Right at the wall edge
        const skullZ = 35 + Math.sin(hutBackAngle) * 4.2;
        createSkullDigSpot(skullX, skullZ);
    }

    // ========================================================================
    // COASTAL BIOME ELEMENTS
    // ========================================================================

    /**
     * Create coastal biome elements: birch trees, ocean, beach decorations.
     */
    function createCoastalElements(biomeData) {
        var numTrees = biomeData.birchTrees || 70;
        var worldSize = CONFIG.WORLD_SIZE;

        // Seaspray birch trees - only in the north half (negative Z = north)
        for (var i = 0; i < numTrees; i++) {
            var tx, tz;
            do {
                tx = (Math.random() - 0.5) * worldSize * 1.3;
                tz = -Math.random() * worldSize * 0.6; // Only north half
            } while (Math.sqrt(tx * tx + tz * tz) < 10); // Avoid spawn center

            var tree = createSeasprayBirchTree(tx, tz);
            GameState.trees.push(tree);
            GameState.scene.add(tree);
            trackObject(tree);
        }

        // Create ocean water
        if (biomeData.hasOcean) {
            createOceanWater(biomeData);
        }

        // Create beach decorations
        if (biomeData.hasBeach) {
            createBeachDecorations(biomeData);
        }

        // Create ocean islands
        if (biomeData.islands) {
            createOceanIslands(biomeData);
        }

        console.log('Created coastal biome with ' + numTrees + ' birch trees');
    }

    /**
     * Create the village tavern building.
     * NPCs are inside the tavern interior (see tavern.js).
     */
    function createTavern(posX, posZ) {
        var tavern = new THREE.Group();
        var s = 1.5; // Bigger than regular huts

        // Materials
        var wallMat = new THREE.MeshStandardMaterial({ color: 0x8B6B4A, roughness: 0.9 });
        var wallDarkMat = new THREE.MeshStandardMaterial({ color: 0x7A5C3D, roughness: 0.9 });
        var roofMat = new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.85, side: THREE.DoubleSide });
        var beamMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
        var doorMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.7 });
        var windowMat = new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xffaa22, emissiveIntensity: 0.4 });
        var stoneMat = new THREE.MeshStandardMaterial({ color: 0x707065, roughness: 1.0 });
        var signMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        var signTextMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });

        // Stone foundation
        var foundGeo = new THREE.BoxGeometry(10 * s, 0.6, 8 * s);
        var foundation = new THREE.Mesh(foundGeo, stoneMat);
        foundation.position.y = 0.3;
        foundation.receiveShadow = true;
        tavern.add(foundation);

        // Walls
        var wallH = 4 * s;
        var wallBase = 0.6;

        // Front wall
        var wallFrontGeo = new THREE.BoxGeometry(10 * s, wallH, 0.3);
        var wallFront = new THREE.Mesh(wallFrontGeo, wallMat);
        wallFront.position.set(0, wallBase + wallH / 2, 4 * s);
        wallFront.castShadow = true;
        tavern.add(wallFront);

        // Back wall
        var wallBack = new THREE.Mesh(wallFrontGeo, wallDarkMat);
        wallBack.position.set(0, wallBase + wallH / 2, -4 * s);
        wallBack.castShadow = true;
        tavern.add(wallBack);

        // Side walls
        var wallSideGeo = new THREE.BoxGeometry(0.3, wallH, 8 * s);
        var wallLeft = new THREE.Mesh(wallSideGeo, wallDarkMat);
        wallLeft.position.set(-5 * s, wallBase + wallH / 2, 0);
        wallLeft.castShadow = true;
        tavern.add(wallLeft);

        var wallRight = new THREE.Mesh(wallSideGeo, wallMat);
        wallRight.position.set(5 * s, wallBase + wallH / 2, 0);
        wallRight.castShadow = true;
        tavern.add(wallRight);

        // Timber frame - corner beams
        var beamThick = 0.25;
        var cornerGeo = new THREE.BoxGeometry(beamThick, wallH + 0.2, beamThick);
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function(pair) {
            var corner = new THREE.Mesh(cornerGeo, beamMat);
            corner.position.set(pair[0] * 5 * s, wallBase + wallH / 2, pair[1] * 4 * s);
            tavern.add(corner);
        });

        // Horizontal top beams
        var hBeamFrontGeo = new THREE.BoxGeometry(10 * s + beamThick, beamThick, beamThick);
        var hBeamFront = new THREE.Mesh(hBeamFrontGeo, beamMat);
        hBeamFront.position.set(0, wallBase + wallH, 4 * s);
        tavern.add(hBeamFront);
        var hBeamBack = hBeamFront.clone();
        hBeamBack.position.z = -4 * s;
        tavern.add(hBeamBack);

        // Mid-height beam across front (decorative)
        var midBeam = new THREE.Mesh(hBeamFrontGeo, beamMat);
        midBeam.position.set(0, wallBase + wallH * 0.45, 4 * s + 0.05);
        tavern.add(midBeam);

        // Door (front center)
        var doorGeo = new THREE.BoxGeometry(2 * s, 3 * s, 0.15);
        var door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, wallBase + 1.5 * s, 4 * s + 0.1);
        tavern.add(door);

        // Door handle
        var handleMat = new THREE.MeshStandardMaterial({ color: 0xccaa44, metalness: 0.6 });
        var handle = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), handleMat);
        handle.position.set(0.6 * s, wallBase + 1.5 * s, 4 * s + 0.2);
        tavern.add(handle);

        // Windows (warm glow) - two on each side of door
        var windowGeo = new THREE.BoxGeometry(1.2 * s, 1.2 * s, 0.1);
        [-3, 3].forEach(function(xOff) {
            var win = new THREE.Mesh(windowGeo, windowMat);
            win.position.set(xOff * s, wallBase + wallH * 0.55, 4 * s + 0.15);
            tavern.add(win);
            // Window frame
            var frameMat = beamMat;
            var frameH = new THREE.Mesh(new THREE.BoxGeometry(1.4 * s, 0.1, 0.12), frameMat);
            frameH.position.set(xOff * s, wallBase + wallH * 0.55 + 0.6 * s, 4 * s + 0.16);
            tavern.add(frameH);
            var frameH2 = frameH.clone();
            frameH2.position.y = wallBase + wallH * 0.55 - 0.6 * s;
            tavern.add(frameH2);
        });

        // Side windows
        [-2, 2].forEach(function(zOff) {
            var win = new THREE.Mesh(windowGeo, windowMat);
            win.position.set(5 * s + 0.15, wallBase + wallH * 0.55, zOff * s);
            win.rotation.y = Math.PI / 2;
            tavern.add(win);

            var win2 = new THREE.Mesh(windowGeo, windowMat);
            win2.position.set(-5 * s - 0.15, wallBase + wallH * 0.55, zOff * s);
            win2.rotation.y = Math.PI / 2;
            tavern.add(win2);
        });

        // Roof - larger sloped roof
        var roofH = 3.5 * s;
        var roofY = wallBase + wallH;
        var roofRadius = 7 * s;
        var roofGeo = new THREE.ConeGeometry(roofRadius, roofH, 4);
        var roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = roofY + roofH / 2;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        tavern.add(roof);

        // Chimney
        var chimneyMat = new THREE.MeshStandardMaterial({ color: 0x666055 });
        var chimney = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), chimneyMat);
        chimney.position.set(3 * s, roofY + roofH * 0.7, -2 * s);
        chimney.castShadow = true;
        tavern.add(chimney);

        // Hanging sign - "TAVERN" sign on a post
        var signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 8), beamMat);
        signPost.position.set(2.5 * s, wallBase + 2, 4 * s + 1.5);
        tavern.add(signPost);

        var signArm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.1), beamMat);
        signArm.position.set(2.5 * s + 0.5, wallBase + 3.8, 4 * s + 1.5);
        tavern.add(signArm);

        var signBoard = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 0.1), signMat);
        signBoard.position.set(2.5 * s + 0.5, wallBase + 3, 4 * s + 1.5);
        tavern.add(signBoard);

        // Sign text (gold rectangle to represent "TAVERN" text)
        var signLabel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.12), signTextMat);
        signLabel.position.set(2.5 * s + 0.5, wallBase + 3, 4 * s + 1.55);
        tavern.add(signLabel);

        // Barrel decorations outside
        var barrelMat = new THREE.MeshStandardMaterial({ color: 0x6B4226 });
        var barrelBandMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.3 });
        [-3.5, -2.5].forEach(function(xOff) {
            var barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.45, 1.2, 12), barrelMat);
            barrel.position.set(xOff * s, wallBase + 0.6, 4 * s + 1.2);
            tavern.add(barrel);
            // Metal band
            var band = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.04, 8, 16), barrelBandMat);
            band.position.set(xOff * s, wallBase + 0.8, 4 * s + 1.2);
            band.rotation.x = Math.PI / 2;
            tavern.add(band);
        });

        // Lantern by the door (warm light)
        var lanternMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff8800, emissiveIntensity: 0.8 });
        var lantern = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), lanternMat);
        lantern.position.set(-1.5 * s, wallBase + 3.5, 4 * s + 0.3);
        tavern.add(lantern);

        // Place tavern at the given position
        var tavernX = posX || 40;
        var tavernZ = posZ || -80;
        tavern.position.set(tavernX, 0, tavernZ);
        tavern.rotation.y = 0; // Front faces positive Z
        GameState.scene.add(tavern);
        GameState.tavernBuilding = tavern;

        // Pigston and other NPCs are inside the tavern (see tavern.js)
    }

    /**
     * Create a seaspray birch tree — white bark, dark bands, green sphere foliage.
     */
    function createSeasprayBirchTree(x, z) {
        var tree = new THREE.Group();

        // Thin white/silver birch trunk
        var trunkHeight = 7 + Math.random() * 4;
        var trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, trunkHeight, 8);
        var trunkMat = new THREE.MeshStandardMaterial({
            color: 0xe8ddd0,  // White/silver birch bark
            roughness: 0.7,
            metalness: 0.05
        });
        var trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        tree.add(trunk);

        // Dark horizontal bands (birch bark markings)
        var bandMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.9
        });
        for (var b = 0; b < 4; b++) {
            var bandGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.1, 8);
            var band = new THREE.Mesh(bandGeo, bandMat);
            band.position.y = 1.5 + b * (trunkHeight / 5);
            tree.add(band);
        }

        // Green leaf clusters (2-3 spheres at the top)
        var leafColors = [0x3a7a3a, 0x4a8a4a, 0x2a6a2a];
        var numClusters = 2 + Math.floor(Math.random() * 2);
        for (var li = 0; li < numClusters; li++) {
            var leafGeo = new THREE.SphereGeometry(1.8 + Math.random() * 0.8, 8, 6);
            var leafMat = new THREE.MeshStandardMaterial({
                color: leafColors[li % leafColors.length],
                roughness: 0.8
            });
            var leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(
                (Math.random() - 0.5) * 1.5,
                trunkHeight - 1 + li * 1.2,
                (Math.random() - 0.5) * 1.5
            );
            leaf.castShadow = true;
            tree.add(leaf);
        }

        tree.position.set(x, 0, z);
        tree.userData.radius = 1.0;
        tree.userData.type = 'tree';
        tree.userData.health = 9;
        tree.userData.maxHealth = 9;
        tree.userData.biome = 'coastal';
        tree.userData.treeType = 'birch';
        return tree;
    }

    /**
     * Create the ocean water plane for the coastal biome.
     */
    function createOceanWater(biomeData) {
        var worldSize = CONFIG.WORLD_SIZE;
        var sandEndZ = biomeData.sandEndZ || 200;
        var southBorder = worldSize * 0.75;

        // Ocean plane covers from sand end to south border
        var oceanWidth = worldSize * 1.6;
        var oceanDepth = southBorder - sandEndZ + 50; // extend a bit past border
        var segW = 80;
        var segD = 60;

        var geometry = new THREE.PlaneGeometry(oceanWidth, oceanDepth, segW, segD);
        geometry.rotateX(-Math.PI / 2);

        // Position: centered on X, starts at sandEndZ going south
        var oceanCenterZ = sandEndZ + oceanDepth / 2;

        var material = new THREE.MeshStandardMaterial({
            color: 0x5a7a6a,
            transparent: true,
            opacity: 0.75,
            metalness: 0.4,
            roughness: 0.3,
            emissive: 0x1a2a2a,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide
        });

        var ocean = new THREE.Mesh(geometry, material);
        ocean.position.set(0, -0.1, oceanCenterZ);
        ocean.receiveShadow = true;

        // Store original vertex positions for wave animation
        var posAttr = geometry.attributes.position;
        var originalY = new Float32Array(posAttr.count);
        for (var i = 0; i < posAttr.count; i++) {
            originalY[i] = posAttr.getY(i);
        }
        ocean.userData.originalY = originalY;
        ocean.userData.waveTime = 0;

        GameState.scene.add(ocean);
        trackObject(ocean);
        GameState.oceanWater = ocean;

        // Store boundary values for player detection
        GameState.oceanShoreZ = sandEndZ - 5;     // Where shallow water starts (a few units into sand)
        GameState.oceanDeepZ = sandEndZ + 30;      // Past this = too deep, blocked

        console.log('Created ocean water: shore at Z=' + GameState.oceanShoreZ + ', deep at Z=' + GameState.oceanDeepZ);
    }

    /**
     * Check if a position is in the shallow ocean (wadeable).
     */
    function isInShallowOcean(x, z) {
        if (!GameState.oceanWater) return false;
        return z > GameState.oceanShoreZ && z <= GameState.oceanDeepZ;
    }

    /**
     * Check if a position is in deep ocean (blocked).
     * Returns false near islands — their shallow zone counts as safe water.
     */
    function isInDeepOcean(x, z) {
        if (!GameState.oceanWater) return false;
        if (z <= GameState.oceanDeepZ) return false;
        // Not deep ocean if near an island
        if (isNearIsland(x, z)) return false;
        return true;
    }

    /**
     * Check if a position is near any ocean island (within its shallow zone).
     * Returns the island object if nearby, or null.
     */
    function isNearIsland(x, z) {
        if (!GameState.oceanIslands) return null;
        for (var i = 0; i < GameState.oceanIslands.length; i++) {
            var island = GameState.oceanIslands[i];
            var dx = x - island.x;
            var dz = z - island.z;
            var dist = Math.sqrt(dx * dx + dz * dz);
            if (dist <= island.shallowRadius) {
                return island;
            }
        }
        return null;
    }

    /**
     * Check if a position is on an island's solid ground.
     * Returns the island object if on solid ground, or null.
     */
    function isOnIsland(x, z) {
        if (!GameState.oceanIslands) return null;
        for (var i = 0; i < GameState.oceanIslands.length; i++) {
            var island = GameState.oceanIslands[i];
            var dx = x - island.x;
            var dz = z - island.z;
            var dist = Math.sqrt(dx * dx + dz * dz);
            if (dist <= island.radius) {
                return island;
            }
        }
        return null;
    }

    /**
     * Get the ground height on an island at position (x, z).
     * Smooth cosine falloff — highest at center, 0 at edge.
     */
    function getIslandGroundHeight(x, z, island) {
        var dx = x - island.x;
        var dz = z - island.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        if (dist >= island.radius) return 0;

        // Smooth cosine curve: 1 at center, 0 at edge
        var t = dist / island.radius;
        var heightFactor = 0.5 * (1 + Math.cos(t * Math.PI));
        return island.height * heightFactor;
    }

    /**
     * Update ocean wave animation. Called from game.js animate loop.
     */
    function updateOceanWaves(delta) {
        if (!GameState.oceanWater) return;

        var ocean = GameState.oceanWater;
        ocean.userData.waveTime += delta;
        var t = ocean.userData.waveTime;

        var geometry = ocean.geometry;
        var posAttr = geometry.attributes.position;
        var originalY = ocean.userData.originalY;

        for (var i = 0; i < posAttr.count; i++) {
            var x = posAttr.getX(i);
            var z = posAttr.getZ(i);

            // Combine 3 sine waves for choppy look
            var wave1 = Math.sin(x * 0.15 + t * 2.0) * 0.3;
            var wave2 = Math.sin(z * 0.2 + t * 1.5) * 0.25;
            var wave3 = Math.sin((x + z) * 0.1 + t * 3.0) * 0.15;

            posAttr.setY(i, originalY[i] + wave1 + wave2 + wave3);
        }

        posAttr.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    /**
     * Create beach decorations: rocks, driftwood, shells, seaweed.
     */
    function createBeachDecorations(biomeData) {
        var worldSize = CONFIG.WORLD_SIZE;
        var sandStartZ = biomeData.forestEndZ || 0;
        var sandEndZ = biomeData.sandEndZ || 200;

        // --- 35 ROCKS scattered on sand ---
        for (var i = 0; i < 35; i++) {
            var radius = 0.4 + Math.random() * 0.8;
            var rockGeo = new THREE.DodecahedronGeometry(radius, 1);
            // Slightly squash rocks to look natural
            rockGeo.scale(1, 0.5 + Math.random() * 0.4, 1);
            var greyShade = 0.45 + Math.random() * 0.2;
            var rockMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(greyShade, greyShade, greyShade * 0.95),
                roughness: 0.9,
                metalness: 0.05
            });
            var rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(
                (Math.random() - 0.5) * worldSize * 1.3,
                radius * 0.2,
                sandStartZ + Math.random() * (sandEndZ - sandStartZ)
            );
            rock.rotation.y = Math.random() * Math.PI * 2;
            rock.castShadow = true;
            GameState.scene.add(rock);
            trackObject(rock);
        }

        // --- 18 DRIFTWOOD LOGS ---
        for (var i = 0; i < 18; i++) {
            var logLength = 1.5 + Math.random() * 2.5;
            var logRadius = 0.08 + Math.random() * 0.1;
            var logGeo = new THREE.CylinderGeometry(logRadius, logRadius * 1.2, logLength, 6);
            var logMat = new THREE.MeshStandardMaterial({
                color: 0x8b7355,
                roughness: 0.95,
                metalness: 0
            });
            var log = new THREE.Mesh(logGeo, logMat);
            log.position.set(
                (Math.random() - 0.5) * worldSize * 1.3,
                logRadius,
                sandStartZ + Math.random() * (sandEndZ - sandStartZ)
            );
            // Lay on side with random rotation
            log.rotation.z = Math.PI / 2;
            log.rotation.y = Math.random() * Math.PI;
            log.castShadow = true;
            GameState.scene.add(log);
            trackObject(log);
        }

        // --- 28 SHELLS ---
        for (var i = 0; i < 28; i++) {
            var shellSize = 0.15 + Math.random() * 0.2;
            var shellGeo = new THREE.SphereGeometry(shellSize, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
            var shellColors = [0xfff0e0, 0xffe4c4, 0xffdab9, 0xf5deb3, 0xeee8dc];
            var shellMat = new THREE.MeshStandardMaterial({
                color: shellColors[Math.floor(Math.random() * shellColors.length)],
                roughness: 0.4,
                metalness: 0.1
            });
            var shell = new THREE.Mesh(shellGeo, shellMat);
            shell.position.set(
                (Math.random() - 0.5) * worldSize * 1.3,
                0.02,
                sandStartZ + Math.random() * (sandEndZ - sandStartZ)
            );
            shell.rotation.y = Math.random() * Math.PI * 2;
            GameState.scene.add(shell);
            trackObject(shell);
        }

        // --- 12 SEAWEED PATCHES near the waterline ---
        for (var i = 0; i < 12; i++) {
            var patchGroup = new THREE.Group();
            var bladeCount = 4 + Math.floor(Math.random() * 4);
            for (var b = 0; b < bladeCount; b++) {
                var bladeHeight = 0.5 + Math.random() * 0.8;
                var bladeGeo = new THREE.PlaneGeometry(0.15, bladeHeight);
                var bladeShade = 0x2a5a2a + Math.floor(Math.random() * 0x101010);
                var bladeMat = new THREE.MeshStandardMaterial({
                    color: bladeShade,
                    roughness: 0.8,
                    side: THREE.DoubleSide
                });
                var blade = new THREE.Mesh(bladeGeo, bladeMat);
                blade.position.set(
                    (Math.random() - 0.5) * 0.8,
                    bladeHeight / 2,
                    (Math.random() - 0.5) * 0.8
                );
                blade.rotation.y = Math.random() * Math.PI;
                // Slight lean for natural look
                blade.rotation.x = (Math.random() - 0.5) * 0.3;
                patchGroup.add(blade);
            }
            // Place near the waterline (south end of sand)
            patchGroup.position.set(
                (Math.random() - 0.5) * worldSize * 1.0,
                0,
                sandEndZ - 10 + Math.random() * 15
            );
            GameState.scene.add(patchGroup);
            trackObject(patchGroup);
        }

        console.log('Created beach decorations: 35 rocks, 18 driftwood, 28 shells, 12 seaweed patches');
    }

    /**
     * Create snowy mountain elements (snow-covered rocks).
     * @param {Object} biomeData - The biome configuration
     */
    function createSnowyMountainElements(biomeData) {
        const numRocks = biomeData.rocks || 15;

        // Create snow-covered rock mounds scattered around
        for (let i = 0; i < numRocks; i++) {
            const x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
            const z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;

            // Create a larger rock mound (bigger than regular rocks)
            const rockGeo = new THREE.DodecahedronGeometry(2 + Math.random() * 2, 1);
            const rockMat = new THREE.MeshStandardMaterial({
                color: 0xe8e8e8,  // Light grey/white (snow-covered)
                roughness: 0.8,
                metalness: 0.1
            });
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(x, 0, z);
            rock.scale.y = 0.7;  // Flatten slightly
            rock.castShadow = true;
            rock.receiveShadow = true;

            GameState.scene.add(rock);
            trackObject(rock);
        }

        // Create falling snow particles if biome has snow
        if (biomeData.hasSnow && biomeData.snowParticles > 0) {
            createSnowParticles(biomeData.snowParticles);
        }

        // Create the Snow Temple of the Great Mages of Andurat
        createSnowTemple(350, 350);

        console.log(`🏔️ Created ${numRocks} snow-covered rock mounds + Snow Temple`);
    }

    /**
     * Create the Snow Temple of the Great Mages of Andurat.
     * An ancient stone monument with raised platform, steps, totem poles,
     * and a central plinth holding the drongulinat cat tooth artifact.
     */
    function createSnowTemple(x, z) {
        var templeGroup = new THREE.Group();
        templeGroup.position.set(x, 0, z);

        // --- RAISED PLATFORM ---
        // Large circular stone platform
        var platformGeo = new THREE.CylinderGeometry(12, 13, 1.5, 24);
        var stoneMat = new THREE.MeshStandardMaterial({
            color: 0x8a8a8a,  // Grey stone
            roughness: 0.9,
            metalness: 0.05
        });
        var platform = new THREE.Mesh(platformGeo, stoneMat);
        platform.position.y = 0.75;
        platform.castShadow = true;
        platform.receiveShadow = true;
        templeGroup.add(platform);

        // --- STEPS (4 directions: N/S/E/W) ---
        var darkStoneMat = new THREE.MeshStandardMaterial({
            color: 0x6a6a6a,
            roughness: 0.9,
            metalness: 0.05
        });

        var stepDirections = [
            { dx: 0, dz: -13 },   // North
            { dx: 0, dz: 13 },    // South
            { dx: 13, dz: 0 },    // East
            { dx: -13, dz: 0 }    // West
        ];

        stepDirections.forEach(function(dir) {
            // 3 steps, each getting lower
            for (var s = 0; s < 3; s++) {
                var stepGeo = new THREE.BoxGeometry(4, 0.4, 1.5);
                var step = new THREE.Mesh(stepGeo, darkStoneMat);
                var fraction = (s + 1) / 3;
                step.position.set(
                    dir.dx * fraction,
                    1.5 - s * 0.5,
                    dir.dz * fraction
                );
                // Rotate steps to face outward
                if (dir.dx !== 0) {
                    step.rotation.y = Math.PI / 2;
                }
                step.castShadow = true;
                step.receiveShadow = true;
                templeGroup.add(step);
            }
        });

        // --- 4 TOTEM POLES (at corners of platform) ---
        var totemPositions = [
            { x: 8, z: 8 },
            { x: -8, z: 8 },
            { x: 8, z: -8 },
            { x: -8, z: -8 }
        ];

        var totemStoneMat = new THREE.MeshStandardMaterial({
            color: 0x7a7a70,
            roughness: 0.85,
            metalness: 0.1
        });

        totemPositions.forEach(function(pos) {
            var totemGroup = new THREE.Group();
            totemGroup.position.set(pos.x, 1.5, pos.z);

            // 3 stacked cylindrical segments
            for (var seg = 0; seg < 3; seg++) {
                var segRadius = 0.8 - seg * 0.15;
                var segGeo = new THREE.CylinderGeometry(segRadius, segRadius + 0.05, 2, 8);
                var segment = new THREE.Mesh(segGeo, totemStoneMat);
                segment.position.y = seg * 2 + 1;
                segment.castShadow = true;
                templeGroup.add(segment);
                // Position relative to totem
                segment.position.x = pos.x;
                segment.position.z = pos.z;
                segment.position.y = 1.5 + seg * 2 + 1;
            }

            // Cat face on top segment — golden eyes
            var eyeMat = new THREE.MeshStandardMaterial({
                color: 0xccaa00,
                emissive: 0xccaa00,
                emissiveIntensity: 0.4
            });

            // Left eye
            var eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
            var leftEye = new THREE.Mesh(eyeGeo, eyeMat);
            leftEye.position.set(pos.x - 0.25, 1.5 + 5.2, pos.z + 0.6);
            templeGroup.add(leftEye);

            // Right eye
            var rightEye = new THREE.Mesh(eyeGeo, eyeMat);
            rightEye.position.set(pos.x + 0.25, 1.5 + 5.2, pos.z + 0.6);
            templeGroup.add(rightEye);

            // Nose (small cone)
            var noseGeo = new THREE.ConeGeometry(0.1, 0.2, 4);
            var noseMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
            var nose = new THREE.Mesh(noseGeo, noseMat);
            nose.position.set(pos.x, 1.5 + 4.9, pos.z + 0.7);
            nose.rotation.x = Math.PI / 2;
            templeGroup.add(nose);
        });

        // --- CENTRAL PLINTH ---
        // Stone pillar in the middle of the platform
        var plinthGeo = new THREE.CylinderGeometry(1.2, 1.4, 2, 12);
        var plinthMat = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,  // Dark stone
            roughness: 0.85,
            metalness: 0.15
        });
        var plinth = new THREE.Mesh(plinthGeo, plinthMat);
        plinth.position.y = 2.5;  // On top of platform
        plinth.castShadow = true;
        templeGroup.add(plinth);

        // Flat stone slab on top of plinth
        var slabGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 12);
        var slabMat = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.7,
            metalness: 0.2
        });
        var slab = new THREE.Mesh(slabGeo, slabMat);
        slab.position.y = 3.6;
        templeGroup.add(slab);

        // --- TOOTH ARTIFACT on top of plinth ---
        // Only place if player hasn't already collected it
        var alreadyHas = GameState.artifacts && GameState.artifacts.includes('drongulinat_cat_tooth');
        var alreadyGave = GameState.artifactsGiven && GameState.artifactsGiven.includes('drongulinat_cat_tooth');
        if (!alreadyHas && !alreadyGave) {
            var tooth = Items.createArtifact('drongulinat_cat_tooth');
            if (tooth) {
                tooth.position.set(x, 4.2, z);  // World coordinates (above plinth)
                GameState.scene.add(tooth);
                Items.trackArtifact(tooth);
            }
        }

        // --- URONAL SEAL TOOTH embedded in west wall ---
        var alreadyHasSeal = GameState.artifacts && GameState.artifacts.includes('uronal_seal_tooth');
        var alreadyGaveSeal = GameState.artifactsGiven && GameState.artifactsGiven.includes('uronal_seal_tooth');
        if (!alreadyHasSeal && !alreadyGaveSeal) {
            var sealTooth = Items.createArtifact('uronal_seal_tooth');
            if (sealTooth) {
                sealTooth.position.set(x - 11, 2.5, z);  // West wall, platform height
                GameState.scene.add(sealTooth);
                Items.trackArtifact(sealTooth);
            }
        }

        GameState.scene.add(templeGroup);
        trackObject(templeGroup);

        // Store temple position so player.js can check collision
        GameState.templePosition = { x: x, z: z };

        console.log('Snow Temple created at (' + x + ', ' + z + ')');
    }

    /**
     * Create falling snow particle system.
     * @param {number} count - Number of snowflakes
     */
    function createSnowParticles(count) {
        const particles = [];
        const particleGeo = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        // Create snowflake particles scattered in a large volume
        for (let i = 0; i < count; i++) {
            // Random position in a large box
            positions.push(
                (Math.random() - 0.5) * 150,  // X spread
                Math.random() * 30 + 10,       // Y height (10-40)
                (Math.random() - 0.5) * 150    // Z spread
            );

            // Random fall speed (slow drift down)
            velocities.push({
                x: (Math.random() - 0.5) * 0.1,  // Slight horizontal drift
                y: -(Math.random() * 0.3 + 0.2),  // Fall down (0.2-0.5 units/sec)
                z: (Math.random() - 0.5) * 0.1
            });
        }

        particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        // Create snowflake material (small white dots)
        const particleMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const particleSystem = new THREE.Points(particleGeo, particleMat);
        particleSystem.userData = {
            type: 'snow_particles',
            velocities: velocities,
            resetHeight: 40  // Reset snowflakes that fall below ground
        };

        GameState.scene.add(particleSystem);
        GameState.snowParticles = particleSystem;  // Store reference for updates

        console.log(`❄️ Created ${count} falling snowflakes`);
    }

    /**
     * Create Ningle's Research Hut - an adobe hut housing scientists.
     * Press E near the entrance to go inside.
     * @param {number} x - X position
     * @param {number} z - Z position
     */
    function createResearchHut(x, z) {
        const hut = new THREE.Group();

        // Adobe/mud brick colors
        const adobeColor = 0xc4a882;
        const darkAdobe = 0x8b7355;
        const roofColor = 0x6b5344;

        // Main cylindrical hut body
        const bodyGeo = new THREE.CylinderGeometry(4, 4.5, 5, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color: adobeColor });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 2.5;
        body.castShadow = true;
        body.receiveShadow = true;
        hut.add(body);

        // Conical thatched roof
        const roofGeo = new THREE.ConeGeometry(5.5, 3, 16);
        const roofMat = new THREE.MeshStandardMaterial({ color: roofColor });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 6.5;
        roof.castShadow = true;
        hut.add(roof);

        // Door frame (dark rectangular opening)
        const doorGeo = new THREE.BoxGeometry(1.5, 3, 0.5);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 1.5, 4.3);
        hut.add(door);

        // Door frame outline
        const frameGeo = new THREE.BoxGeometry(1.8, 3.3, 0.3);
        const frameMat = new THREE.MeshStandardMaterial({ color: darkAdobe });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(0, 1.55, 4.4);
        hut.add(frame);

        // Small windows (two on sides)
        const windowGeo = new THREE.CircleGeometry(0.4, 8);
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, emissive: 0x447799, emissiveIntensity: 0.3 });

        const window1 = new THREE.Mesh(windowGeo, windowMat);
        window1.position.set(4, 3, 0);
        window1.rotation.y = Math.PI / 2;
        hut.add(window1);

        const window2 = new THREE.Mesh(windowGeo, windowMat);
        window2.position.set(-4, 3, 0);
        window2.rotation.y = -Math.PI / 2;
        hut.add(window2);

        // Small sign outside
        const signPostGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 6);
        const signPostMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        const signPost = new THREE.Mesh(signPostGeo, signPostMat);
        signPost.position.set(3, 1, 5);
        hut.add(signPost);

        const signGeo = new THREE.BoxGeometry(2.5, 0.8, 0.1);
        const signMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(3, 2.2, 5);
        hut.add(sign);

        // Position the hut
        hut.position.set(x, 0, z);

        // Rotate so door faces toward center of map
        hut.rotation.y = Math.atan2(-x, -z);

        hut.userData = {
            type: 'research_hut',
            radius: 5,
            interactRadius: 6,  // Distance at which E prompt appears
            doorPosition: new THREE.Vector3(x, 0, z + 4.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), hut.rotation.y)
        };

        // Store reference for interaction
        GameState.researchHut = hut;
        GameState.scene.add(hut);
        trackObject(hut);

        return hut;
    }

    /**
     * Create the ancient skull dig spot - a special rock pile.
     * Player can press E to dig up the Felis Dronglaticus skull!
     * @param {number} x - X position
     * @param {number} z - Z position
     */
    function createSkullDigSpot(x, z) {
        const digSpot = new THREE.Group();

        // Small rubble half-buried in the hut wall — looks like debris
        // Only 4 small rocks so it blends in and is easy to miss
        for (let i = 0; i < 4; i++) {
            const rockGeo = new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.3, 1);
            const rockMat = new THREE.MeshStandardMaterial({
                color: 0xc4a882,  // Same adobe color as the hut wall
                roughness: 0.8,
                emissive: 0xffd700,  // Faint golden shimmer
                emissiveIntensity: 0.05  // Very subtle — you have to look closely
            });
            const rock = new THREE.Mesh(rockGeo, rockMat);

            // Tight cluster against the wall
            const angle = (i / 4) * Math.PI * 2;
            const radius = 0.4 + Math.random() * 0.3;
            rock.position.set(
                Math.cos(angle) * radius,
                Math.random() * 0.3,
                Math.sin(angle) * radius
            );
            rock.scale.y = 0.5;
            rock.castShadow = true;
            rock.receiveShadow = true;
            digSpot.add(rock);
        }

        // One bone-colored piece poking out — the skull hint!
        const boneGeo = new THREE.SphereGeometry(0.25, 6, 4);
        const boneMat = new THREE.MeshStandardMaterial({
            color: 0xf5e6c8,  // Bone/ivory color
            roughness: 0.6,
            emissive: 0xffd700,
            emissiveIntensity: 0.08
        });
        const bone = new THREE.Mesh(boneGeo, boneMat);
        bone.position.set(0, 0.2, 0);
        bone.scale.set(1, 0.6, 0.8);  // Flattened like a skull fragment
        digSpot.add(bone);

        // Very faint glow — only visible up close or at night
        const light = new THREE.PointLight(0xffd700, 0.2, 4);
        light.position.y = 0.5;
        digSpot.add(light);

        digSpot.position.set(x, 0, z);
        digSpot.userData = {
            type: 'skull_dig_spot',
            radius: 2,
            interactRadius: 3,  // Distance at which E prompt appears
            hasSkull: true      // Set to false after player digs it up
        };

        // Store reference for interaction
        GameState.skullDigSpot = digSpot;
        GameState.scene.add(digSpot);
        trackObject(digSpot);

        console.log('🏔️ Ancient dig spot created at', x, z);
        return digSpot;
    }

    /**
     * Create grass tufts for deer grazing in snowy mountains
     * @param {number} count - Number of grass tufts to spawn
     */
    function createGrassTufts(count) {
        if (!GameState.grassTufts) {
            GameState.grassTufts = [];
        }

        for (let i = 0; i < count; i++) {
            // Random position avoiding center and edges
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 30; // Between 15-45m from center
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Create tuft mesh (small cone of grass)
            const geometry = new THREE.ConeGeometry(0.3, 0.5, 8);
            const material = new THREE.MeshPhongMaterial({
                color: 0x90c090, // Pale green grass
                flatShading: true
            });
            const tuft = new THREE.Mesh(geometry, material);
            tuft.position.set(x, 0.25, z);
            tuft.rotation.y = Math.random() * Math.PI * 2;

            // Track tuft state
            tuft.userData = {
                type: 'grass_tuft',
                size: 1.0,         // Full size initially (1.0 = full, 0 = depleted)
                regrowthTimer: 0,  // Time until regrowth starts
                position: { x, z }
            };

            GameState.scene.add(tuft);
            GameState.grassTufts.push(tuft);
        }
    }

    /**
     * Deer eats from a grass tuft
     * @param {THREE.Mesh} tuft - The grass tuft mesh
     * @param {THREE.Mesh} deer - The deer eating
     */
    function eatGrassTuft(tuft, deer) {
        if (tuft.userData.size <= 0) return; // Already depleted

        // Shrink the grass
        tuft.userData.size = Math.max(0, tuft.userData.size - 0.15);
        tuft.scale.set(tuft.userData.size, tuft.userData.size, tuft.userData.size);

        // Start regrowth timer (60 seconds)
        if (tuft.userData.size <= 0) {
            tuft.userData.regrowthTimer = 60;
        }

        // Deer gets satisfaction
        if (deer.userData.hunger) {
            deer.userData.hunger = Math.max(0, deer.userData.hunger - 20);
        }
    }

    /**
     * Update grass tufts (regrowth)
     * Called from game loop
     */
    function updateGrassTufts(delta) {
        if (!GameState.grassTufts) return;

        GameState.grassTufts.forEach(tuft => {
            if (tuft.userData.size < 1.0 && tuft.userData.regrowthTimer > 0) {
                tuft.userData.regrowthTimer -= delta;

                // Start regrowing after timer expires
                if (tuft.userData.regrowthTimer <= 0) {
                    tuft.userData.size = Math.min(1.0, tuft.userData.size + delta * 0.02);
                    tuft.scale.set(tuft.userData.size, tuft.userData.size, tuft.userData.size);
                }
            }
        });
    }

    /**
     * Create a burrow entrance for a deer herd
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {string} herdId - ID of herd that owns this burrow
     * @returns {THREE.Group} - The burrow entrance group
     */
    function createBurrowEntrance(x, z, herdId) {
        const burrow = new THREE.Group();
        burrow.position.set(x, 0, z);

        // Snow mound around entrance (slightly raised ground)
        const moundGeometry = new THREE.CylinderGeometry(2.5, 3, 0.8, 16);
        const snowMaterial = new THREE.MeshPhongMaterial({
            color: 0xf5f5f5, // Bright snow white
            flatShading: true
        });
        const mound = new THREE.Mesh(moundGeometry, snowMaterial);
        mound.position.y = 0.4;
        burrow.add(mound);

        // Dark entrance hole (cylinder sunken into mound)
        const holeGeometry = new THREE.CylinderGeometry(0.6, 0.5, 0.6, 12);
        const holeMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a, // Very dark inside
            flatShading: true
        });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.position.set(0, 0.3, 1.2); // Front of mound
        hole.rotation.x = Math.PI / 6; // Angled down
        burrow.add(hole);

        // Track burrow state
        burrow.userData = {
            type: 'burrow_entrance',
            herdId: herdId,
            position: { x, z },
            occupants: [], // Array of deer mesh IDs currently inside
            entrancePosition: {
                x: x + Math.sin(0) * 1.2,
                z: z + Math.cos(0) * 1.2
            } // Position where deer enter/exit
        };

        GameState.scene.add(burrow);
        return burrow;
    }

    /**
     * Deer enters burrow (hide mesh)
     * @param {THREE.Mesh} deer - The deer entering
     * @param {THREE.Group} burrow - The burrow entrance
     */
    function deerEnterBurrow(deer, burrow) {
        deer.visible = false;
        if (!burrow.userData.occupants.includes(deer.uuid)) {
            burrow.userData.occupants.push(deer.uuid);
        }
        deer.userData.state = 'in_burrow';
        deer.userData.currentBurrow = burrow;
    }

    /**
     * Deer exits burrow (show mesh at entrance)
     * @param {THREE.Mesh} deer - The deer exiting
     */
    function deerExitBurrow(deer) {
        const burrow = deer.userData.currentBurrow;
        if (!burrow) return;

        // Remove from occupants
        const idx = burrow.userData.occupants.indexOf(deer.uuid);
        if (idx > -1) burrow.userData.occupants.splice(idx, 1);

        // Position at entrance
        deer.position.x = burrow.userData.entrancePosition.x;
        deer.position.z = burrow.userData.entrancePosition.z;
        deer.visible = true;
        deer.userData.state = 'idle';
    }

    /**
     * Deer peeks out of burrow (visible at entrance but not fully out)
     * @param {THREE.Mesh} deer - The deer peeking
     */
    function deerPeekFromBurrow(deer) {
        const burrow = deer.userData.currentBurrow;
        if (!burrow) return;

        // Show at entrance but stay in burrow
        deer.position.x = burrow.userData.entrancePosition.x;
        deer.position.z = burrow.userData.entrancePosition.z;
        deer.visible = true;
        deer.userData.state = 'peeking';
    }

    /**
     * Create a savannah-style tree (acacia-like with flat top).
     */
    function createSavannahTree(x, z) {
        const tree = new THREE.Group();

        // Trunk - taller and thinner
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 10 + Math.random() * 3, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 5;
        trunk.castShadow = true;
        tree.add(trunk);

        // Flat, wide canopy (acacia style)
        const foliageMat = new THREE.MeshStandardMaterial({ color: 0x4a6b3a });
        const canopyGeo = new THREE.CylinderGeometry(5, 6, 2, 12);
        const canopy = new THREE.Mesh(canopyGeo, foliageMat);
        canopy.position.y = 11;
        canopy.castShadow = true;
        tree.add(canopy);

        tree.position.set(x, 0, z);
        tree.userData.radius = 1.5;
        tree.userData.type = 'tree';
        tree.userData.health = 7;
        tree.userData.maxHealth = 7;
        tree.userData.biome = 'savannah';
        tree.userData.treeType = 'acacia';  // Mark as acacia for Dronglous Cats
        return tree;
    }

    /**
     * Check if player is near the research hut entrance.
     * @param {number} x - X position
     * @param {number} z - Z position
     * @returns {boolean}
     */
    function isNearResearchHut(x, z) {
        if (!GameState.researchHut) return false;
        const hut = GameState.researchHut;
        const dist = Math.sqrt(
            Math.pow(x - hut.position.x, 2) +
            Math.pow(z - hut.position.z, 2)
        );
        return dist < (hut.userData.interactRadius || 6);
    }

    /**
     * Get terrain height at a given world position.
     * Returns the Y value of the ground at (x, z).
     *
     * TODO: When adding hills/terrain, implement actual height sampling here.
     * For now, returns 0 (flat world).
     *
     * @param {number} x - World X position
     * @param {number} z - World Z position
     * @returns {number} Terrain height (Y value)
     */
    function getTerrainHeight(x, z) {
        // Future: sample heightmap or noise function
        // For now, world is flat at Y=0
        return 0;
    }

    // ========================================================================
    // TREE CHOPPING SYSTEM
    // ========================================================================
    /**
     * Damage a tree with an axe.
     * Reads stats from TOOL_STATS — damage, wood per chop, wood type.
     * When the tree dies: bonus drops (cinnamon from acacia), falls over,
     * stays 5 minutes, then fades and a new tree spawns in the biome.
     *
     * @param {THREE.Group} tree - The tree to damage
     * @param {string} axeId - The axe ID (e.g. 'wood_axe', 'barbanit_axe')
     */
    function damageTree(tree, axeId) {
        if (!tree || !tree.userData || tree.userData.type !== 'tree') return;
        if (tree.userData.falling) return; // Already falling, don't chop again

        // Look up axe stats from the data table
        var axeStats = TOOL_STATS.axes[axeId];
        if (!axeStats) return; // Safety check

        // What wood type does this tree give?
        var treeBiome = tree.userData.biome;
        var woodType = TOOL_STATS.treeWoodType[treeBiome] || 'thous_pine_wood';

        // Deal damage based on axe power
        tree.userData.health -= axeStats.damage;

        // Give wood based on axe yield
        GameState.resourceCounts[woodType] += axeStats.woodPerChop;
        Game.playSound('collect');
        UI.updateUI();

        // Hit flash — briefly change trunk color to white
        tree.traverse(function(child) {
            if (child.isMesh && child.material) {
                var origColor = child.material.color.getHex();
                child.material = child.material.clone();
                child.material.color.setHex(0xffffff);
                setTimeout(function() {
                    if (child.material) {
                        child.material.color.setHex(origColor);
                    }
                }, 100);
            }
        });

        // Check if tree is dead
        if (tree.userData.health <= 0) {
            tree.userData.falling = true;

            // Bonus drops when tree falls (e.g. cinnamon from acacia)
            var bonusDrop = TOOL_STATS.bonusDrops[treeBiome];
            if (bonusDrop) {
                GameState.resourceCounts[bonusDrop.resource] += bonusDrop.amount;
                UI.updateUI();
            }

            // Fall animation — rotate 90 degrees over 1 second
            var fallStart = Date.now();
            var fallDuration = 1000; // 1 second
            var fallDirection = Math.random() * Math.PI * 2; // Random fall direction

            function animateFall() {
                var elapsed = Date.now() - fallStart;
                var progress = Math.min(elapsed / fallDuration, 1);

                // Ease-in fall (accelerates like gravity)
                var easedProgress = progress * progress;

                // Rotate tree to fall over
                tree.rotation.x = Math.sin(fallDirection) * easedProgress * (Math.PI / 2);
                tree.rotation.z = Math.cos(fallDirection) * easedProgress * (Math.PI / 2);

                if (progress < 1) {
                    requestAnimationFrame(animateFall);
                } else {
                    // Tree has fallen — remove after 5 minutes and spawn a new one
                    setTimeout(function() {
                        // Remove fallen tree
                        GameState.scene.remove(tree);
                        var idx = GameState.trees.indexOf(tree);
                        if (idx > -1) GameState.trees.splice(idx, 1);

                        // Spawn a new tree at a random position in the same biome
                        var newX, newZ, newTree;
                        if (tree.userData.biome === 'arboreal') {
                            do {
                                newX = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                                newZ = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                            } while (Math.sqrt(newX * newX + newZ * newZ) < 15 || isInVillage(newX, newZ) || isInRiver(newX, newZ));
                            newTree = createTree(newX, newZ);
                        } else if (tree.userData.biome === 'coastal') {
                            // Birch trees only spawn in the north half (forest area)
                            do {
                                newX = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.3;
                                newZ = -Math.random() * CONFIG.WORLD_SIZE * 0.6;
                            } while (Math.sqrt(newX * newX + newZ * newZ) < 10);
                            newTree = createSeasprayBirchTree(newX, newZ);
                        } else {
                            do {
                                newX = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                                newZ = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                            } while (Math.sqrt(newX * newX + newZ * newZ) < 15 || isInWateringHole(newX, newZ));
                            newTree = createSavannahTree(newX, newZ);
                        }
                        GameState.trees.push(newTree);
                        GameState.scene.add(newTree);
                        trackObject(newTree);
                    }, 300000); // 5 minutes
                }
            }

            animateFall();
        }
    }

    // ========================================================================
    // OCEAN ISLANDS
    // ========================================================================

    /**
     * Create all ocean islands for the coastal biome.
     */
    function createOceanIslands(biomeData) {
        if (!biomeData.islands) return;
        var shallowExtra = biomeData.shallowZoneRadius || 10;
        GameState.oceanIslands = [];

        biomeData.islands.forEach(function(def) {
            var island = buildIsland(def);
            island.position.set(def.x, 0, def.z);
            GameState.scene.add(island);
            trackObject(island);

            GameState.oceanIslands.push({
                mesh: island,
                x: def.x,
                z: def.z,
                radius: def.radius,
                shallowRadius: def.radius + shallowExtra,
                height: def.height,
                style: def.style
            });
        });

        console.log('Created ' + biomeData.islands.length + ' ocean islands');
    }

    /**
     * Build an island mesh based on its style.
     */
    function buildIsland(def) {
        switch (def.style) {
            case 'rocky_green':  return buildRockyGreenIsland(def);
            case 'sandy_grassy': return buildSandyGrassyIsland(def);
            default:             return buildSandyIsland(def);
        }
    }

    /**
     * Sandy beach island — flat disc that sits mostly below the walking surface.
     * Pedro walks at the cosine-curve height, so the mesh must stay BELOW that.
     */
    function buildSandyIsland(def) {
        var group = new THREE.Group();
        var r = def.radius;
        var h = def.height;

        // Underwater foundation — big cylinder hidden below water
        var foundGeo = new THREE.CylinderGeometry(r * 1.1, r * 1.3, 3, 16);
        var sandMat = new THREE.MeshStandardMaterial({
            color: 0xd2b48c, roughness: 0.9, metalness: 0.05
        });
        var foundation = new THREE.Mesh(foundGeo, sandMat);
        foundation.position.y = -1.5; // Mostly underwater
        group.add(foundation);

        // Visible surface — a very flat cone that peaks at h * 0.6 (below walking height)
        var surfGeo = new THREE.ConeGeometry(r, h * 0.6, 16);
        var surface = new THREE.Mesh(surfGeo, sandMat);
        surface.position.y = h * 0.3; // Peak at h * 0.6
        surface.castShadow = true;
        surface.receiveShadow = true;
        group.add(surface);

        // A few small rocks sitting on the surface
        for (var i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
            var rockR = 0.3 + Math.random() * 0.5;
            var rockGeo = new THREE.DodecahedronGeometry(rockR, 1);
            rockGeo.scale(1, 0.6, 1);
            var rockMat = new THREE.MeshStandardMaterial({
                color: 0x888888, roughness: 0.9
            });
            var rock = new THREE.Mesh(rockGeo, rockMat);
            var angle = Math.random() * Math.PI * 2;
            var dist = Math.random() * r * 0.4;
            var rockY = getIslandGroundHeight(
                Math.cos(angle) * dist, Math.sin(angle) * dist,
                { x: 0, z: 0, radius: r, height: h }
            );
            rock.position.set(Math.cos(angle) * dist, rockY, Math.sin(angle) * dist);
            group.add(rock);
        }

        group.userData.type = 'island';
        group.userData.radius = r;
        return group;
    }

    /**
     * Rocky green island — grey rock base with green vegetation on top.
     * Mesh stays below the walking surface so Pedro walks on top.
     */
    function buildRockyGreenIsland(def) {
        var group = new THREE.Group();
        var r = def.radius;
        var h = def.height;

        // Underwater foundation
        var foundGeo = new THREE.CylinderGeometry(r * 0.9, r * 1.2, 3, 12);
        var rockMat = new THREE.MeshStandardMaterial({
            color: 0x6a6a6a, roughness: 0.95, metalness: 0.1
        });
        var foundation = new THREE.Mesh(foundGeo, rockMat);
        foundation.position.y = -1.5;
        group.add(foundation);

        // Rocky surface — flat cone peaking below walking height
        var surfGeo = new THREE.ConeGeometry(r * 0.9, h * 0.6, 12);
        var surface = new THREE.Mesh(surfGeo, rockMat);
        surface.position.y = h * 0.3;
        surface.castShadow = true;
        surface.receiveShadow = true;
        group.add(surface);

        // Green vegetation cap — very flat, sits just below the peak
        var topGeo = new THREE.ConeGeometry(r * 0.6, h * 0.3, 16);
        var greenMat = new THREE.MeshStandardMaterial({
            color: 0x3d6b3d, roughness: 0.8
        });
        var top = new THREE.Mesh(topGeo, greenMat);
        top.position.y = h * 0.5;
        group.add(top);

        // Boulders sitting on the surface
        for (var i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
            var boulderR = 0.5 + Math.random() * 0.6;
            var boulderGeo = new THREE.DodecahedronGeometry(boulderR, 1);
            boulderGeo.scale(1, 0.5, 1);
            var boulder = new THREE.Mesh(boulderGeo, rockMat);
            var angle = Math.random() * Math.PI * 2;
            var dist = r * 0.4;
            var boulderY = getIslandGroundHeight(
                Math.cos(angle) * dist, Math.sin(angle) * dist,
                { x: 0, z: 0, radius: r, height: h }
            );
            boulder.position.set(Math.cos(angle) * dist, boulderY, Math.sin(angle) * dist);
            group.add(boulder);
        }

        group.userData.type = 'island';
        group.userData.radius = r;
        return group;
    }

    /**
     * Sandy island with a grassy hill in the center.
     * Mesh stays below the walking surface so Pedro walks on top.
     */
    function buildSandyGrassyIsland(def) {
        var group = new THREE.Group();
        var r = def.radius;
        var h = def.height;

        // Underwater foundation
        var foundGeo = new THREE.CylinderGeometry(r * 1.05, r * 1.3, 3, 16);
        var sandMat = new THREE.MeshStandardMaterial({
            color: 0xd2b48c, roughness: 0.9, metalness: 0.05
        });
        var foundation = new THREE.Mesh(foundGeo, sandMat);
        foundation.position.y = -1.5;
        group.add(foundation);

        // Sandy surface — flat cone for the outer ring
        var surfGeo = new THREE.ConeGeometry(r, h * 0.5, 16);
        var surface = new THREE.Mesh(surfGeo, sandMat);
        surface.position.y = h * 0.25;
        surface.castShadow = true;
        surface.receiveShadow = true;
        group.add(surface);

        // Green grassy hill in the center — smaller cone on top
        var hillGeo = new THREE.ConeGeometry(r * 0.45, h * 0.4, 16);
        var greenMat = new THREE.MeshStandardMaterial({
            color: 0x4a8a4a, roughness: 0.8
        });
        var hill = new THREE.Mesh(hillGeo, greenMat);
        hill.position.y = h * 0.5;
        group.add(hill);

        group.userData.type = 'island';
        group.userData.radius = r;
        return group;
    }

    // ========================================================================
    // RAFT / BOAT SYSTEM
    // ========================================================================
    /**
     * Create a 3D raft model.
     * Made of seaspray birch logs tied together — a flat platform with a small mast.
     *
     * @param {boolean} isBlueprint - If true, renders as transparent blue ghost
     * @returns {THREE.Group} - The raft mesh group
     */
    function createRaftModel(isBlueprint) {
        var raft = new THREE.Group();

        // Colors
        var logColor = isBlueprint ? 0x4488ff : 0x8b6f47;  // Blue ghost or wood brown
        var mastColor = isBlueprint ? 0x4488ff : 0x6b5234;
        var opacity = isBlueprint ? 0.4 : 1.0;

        var logMat = new THREE.MeshStandardMaterial({
            color: logColor,
            transparent: isBlueprint,
            opacity: opacity,
            roughness: 0.8
        });

        var mastMat = new THREE.MeshStandardMaterial({
            color: mastColor,
            transparent: isBlueprint,
            opacity: opacity,
            roughness: 0.7
        });

        // 5 horizontal log planks — each is a cylinder laid sideways
        for (var i = 0; i < 5; i++) {
            var logGeo = new THREE.CylinderGeometry(0.25, 0.25, 4, 8);
            var log = new THREE.Mesh(logGeo, logMat);
            log.rotation.z = Math.PI / 2; // Lay sideways
            log.position.set(0, 0, -1.2 + i * 0.6); // Spread front to back
            raft.add(log);
        }

        // 2 cross-beams to hold logs together
        for (var j = 0; j < 2; j++) {
            var beamGeo = new THREE.CylinderGeometry(0.15, 0.15, 3, 6);
            var beam = new THREE.Mesh(beamGeo, logMat);
            beam.rotation.x = Math.PI / 2; // Lay perpendicular
            beam.position.set(-1.0 + j * 2.0, 0.2, 0);
            raft.add(beam);
        }

        // Small mast post in center
        var mastGeo = new THREE.CylinderGeometry(0.1, 0.12, 3, 6);
        var mast = new THREE.Mesh(mastGeo, mastMat);
        mast.position.set(0, 1.5, 0); // Sticks up from center
        raft.add(mast);

        // Simple flag/sail at the top of the mast
        var sailGeo = new THREE.PlaneGeometry(1.0, 0.8);
        var sailMat = new THREE.MeshStandardMaterial({
            color: isBlueprint ? 0x4488ff : 0xddc9a3,
            transparent: isBlueprint,
            opacity: isBlueprint ? 0.3 : 0.9,
            side: THREE.DoubleSide
        });
        var sail = new THREE.Mesh(sailGeo, sailMat);
        sail.position.set(0.5, 2.5, 0);
        raft.add(sail);

        raft.userData.type = 'raft';
        return raft;
    }

    // Public API
    return {
        setupLighting: setupLighting,
        createGround: createGround,
        createForest: createForest,
        isInVillage: isInVillage,
        isInRiver: isInRiver,
        isOnRiverbank: isOnRiverbank,
        isInWateringHole: isInWateringHole,
        isNearResearchHut: isNearResearchHut,
        getTerrainHeight: getTerrainHeight,
        getRiverPoints: () => RIVER_POINTS,
        getRiverWidth: () => RIVER_WIDTH,
        rebuildForBiome: rebuildForBiome,
        getCurrentBiome: () => currentBiomeId,
        // Deer system
        createBurrowEntrance: createBurrowEntrance,
        deerEnterBurrow: deerEnterBurrow,
        deerExitBurrow: deerExitBurrow,
        deerPeekFromBurrow: deerPeekFromBurrow,
        eatGrassTuft: eatGrassTuft,
        updateGrassTufts: updateGrassTufts,
        // Tree chopping
        damageTree: damageTree,
        // Coastal ocean
        isInShallowOcean: isInShallowOcean,
        isInDeepOcean: isInDeepOcean,
        updateOceanWaves: updateOceanWaves,
        // Ocean islands
        isNearIsland: isNearIsland,
        isOnIsland: isOnIsland,
        getIslandGroundHeight: getIslandGroundHeight,
        // Raft system
        createRaftModel: createRaftModel
    };
})();
