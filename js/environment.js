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
        const groundGeo = new THREE.PlaneGeometry(CONFIG.WORLD_SIZE * 2, CONFIG.WORLD_SIZE * 2, 50, 50);

        const vertices = groundGeo.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] += Math.random() * 0.5;
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

        for (let i = 0; i < 500; i++) {
            const grass = createGrassPatch();
            grass.position.set(
                (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5,
                0.1,
                (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5
            );
            GameState.scene.add(grass);
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
        for (let i = 0; i < 400; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
            } while (Math.sqrt(x * x + z * z) < 15 || isInVillage(x, z));

            const tree = createTree(x, z);
            GameState.trees.push(tree);
            GameState.scene.add(tree);
        }

        for (let i = 0; i < 120; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 1.5;
            } while (isInVillage(x, z));

            const rock = createRock();
            rock.position.set(x, 0, z);
            GameState.scene.add(rock);
        }

        for (let i = 0; i < 50; i++) {
            let x, z;
            do {
                x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
                z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
            } while (isInVillage(x, z));

            const log = createLog();
            log.position.set(x, 0.3, z);
            log.rotation.y = Math.random() * Math.PI;
            GameState.scene.add(log);
        }

        createVillage();
    }

    /**
     * Create a simple hut/cottage building.
     */
    function createHut(x, z, size, rotation) {
        size = size || 1;
        rotation = rotation || 0;

        const hut = new THREE.Group();

        const floorGeo = new THREE.BoxGeometry(6 * size, 0.3, 5 * size);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.y = 0.15;
        floor.receiveShadow = true;
        hut.add(floor);

        const wallMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });

        const wallFrontGeo = new THREE.BoxGeometry(6 * size, 3 * size, 0.3);
        const wallFront = new THREE.Mesh(wallFrontGeo, wallMat);
        wallFront.position.set(0, 1.5 * size + 0.3, 2.5 * size);
        wallFront.castShadow = true;
        hut.add(wallFront);

        const wallBack = wallFront.clone();
        wallBack.position.z = -2.5 * size;
        hut.add(wallBack);

        const wallSideGeo = new THREE.BoxGeometry(0.3, 3 * size, 5 * size);
        const wallLeft = new THREE.Mesh(wallSideGeo, wallMat);
        wallLeft.position.set(-3 * size, 1.5 * size + 0.3, 0);
        wallLeft.castShadow = true;
        hut.add(wallLeft);

        const wallRight = wallLeft.clone();
        wallRight.position.x = 3 * size;
        hut.add(wallRight);

        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const roofGeo = new THREE.ConeGeometry(4.5 * size, 2.5 * size, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 4 * size + 0.3;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        hut.add(roof);

        const doorMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
        const doorGeo = new THREE.BoxGeometry(1.2 * size, 2 * size, 0.4);
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 1 * size + 0.3, 2.5 * size);
        hut.add(door);

        const windowMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, emissive: 0x222233 });
        const windowGeo = new THREE.BoxGeometry(0.4, 0.8 * size, 0.8 * size);
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(3 * size, 2 * size, 0);
        hut.add(windowMesh);

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

        const hut2 = createHut(vx + 20, vz + 15, 0.9, Math.PI / 6);
        GameState.scene.add(hut2);

        const hut3 = createHut(vx - 18, vz + 20, 1.0, -Math.PI / 4);
        GameState.scene.add(hut3);

        const hut4 = createHut(vx + 25, vz - 12, 0.85, Math.PI / 3);
        GameState.scene.add(hut4);

        const hut5 = createHut(vx - 22, vz - 18, 0.95, Math.PI);
        GameState.scene.add(hut5);

        const well = createWell(vx + 5, vz + 8);
        GameState.scene.add(well);

        GameState.scene.add(createFence(vx + 35, vz, 12, 0));
        GameState.scene.add(createFence(vx + 35, vz + 15, 12, 0));
        GameState.scene.add(createFence(vx + 41, vz + 7.5, 15, Math.PI / 2));

        GameState.scene.add(createFence(vx - 35, vz, 12, 0));
        GameState.scene.add(createFence(vx - 35, vz - 15, 12, 0));
        GameState.scene.add(createFence(vx - 41, vz - 7.5, 15, Math.PI / 2));

        const groundMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const villageGround = new THREE.Mesh(
            new THREE.CircleGeometry(CONFIG.VILLAGE_RADIUS * 0.8, 32),
            groundMat
        );
        villageGround.rotation.x = -Math.PI / 2;
        villageGround.position.set(vx, 0.05, vz);
        villageGround.receiveShadow = true;
        GameState.scene.add(villageGround);

        const pathMat = new THREE.MeshStandardMaterial({ color: 0x9b8b75 });
        const pathLength = CONFIG.WORLD_SIZE * 0.4;
        const pathGeo = new THREE.PlaneGeometry(4, pathLength);
        const path = new THREE.Mesh(pathGeo, pathMat);
        path.rotation.x = -Math.PI / 2;
        path.rotation.z = Math.PI / 4;
        path.position.set(vx + pathLength * 0.35, 0.06, vz + pathLength * 0.35);
        path.receiveShadow = true;
        GameState.scene.add(path);

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

            const lanternMat = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xff6600,
                emissiveIntensity: 0.5
            });
            const lanternGeo = new THREE.BoxGeometry(0.4, 0.5, 0.4);
            const lantern = new THREE.Mesh(lanternGeo, lanternMat);
            lantern.position.set(tx, 3.2, tz);
            GameState.scene.add(lantern);
        });

        Dialogs.createVillagers();
    }

    // Public API
    return {
        setupLighting: setupLighting,
        createGround: createGround,
        createForest: createForest,
        isInVillage: isInVillage
    };
})();
