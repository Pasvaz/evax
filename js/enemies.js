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

    /**
     * Build a goose 3D model.
     * Geese are beige/white waterfowl that live on riverbanks.
     *
     * @param {Object} colors - Color values for the goose
     * @returns {THREE.Group} - The goose model
     */
    function buildGooseModel(colors) {
        const model = new THREE.Group();

        // Materials from data colors
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body });
        const beakMat = new THREE.MeshStandardMaterial({ color: colors.beak });
        const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes });
        const legMat = new THREE.MeshStandardMaterial({ color: colors.legs });
        const wingMat = new THREE.MeshStandardMaterial({ color: colors.wings || colors.body });

        // Body (oval shape)
        const bodyGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1, 0.8, 1.4);
        body.position.y = 0.5;
        body.castShadow = true;
        model.add(body);

        // Neck (curved cylinder)
        const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8);
        const neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.position.set(0.3, 0.8, 0);
        neck.rotation.z = -0.4;
        model.add(neck);

        // Head
        const headGeo = new THREE.SphereGeometry(0.15, 12, 12);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0.5, 1.1, 0);
        head.scale.set(1.2, 1, 1);
        model.add(head);

        // Beak (orange cone)
        const beakGeo = new THREE.ConeGeometry(0.06, 0.2, 8);
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.rotation.z = -Math.PI / 2;
        beak.position.set(0.7, 1.1, 0);
        model.add(beak);

        // Eyes
        [-0.06, 0.06].forEach(zPos => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
            eye.position.set(0.58, 1.15, zPos);
            model.add(eye);
        });

        // Wings (flattened spheres on sides)
        [-0.25, 0.25].forEach(zPos => {
            const wingGeo = new THREE.SphereGeometry(0.25, 8, 8);
            const wing = new THREE.Mesh(wingGeo, wingMat);
            wing.scale.set(0.8, 0.3, 1.2);
            wing.position.set(-0.05, 0.55, zPos);
            wing.rotation.x = zPos > 0 ? 0.2 : -0.2;
            model.add(wing);
        });

        // Tail feathers
        const tailGeo = new THREE.ConeGeometry(0.15, 0.3, 6);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.rotation.z = Math.PI / 2 + 0.3;
        tail.position.set(-0.5, 0.6, 0);
        model.add(tail);

        // Legs (orange)
        [[-0.05, 0.15, 0.12], [-0.05, 0.15, -0.12]].forEach(pos => {
            const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            model.add(leg);

            // Webbed foot
            const footGeo = new THREE.ConeGeometry(0.08, 0.15, 3);
            const foot = new THREE.Mesh(footGeo, legMat);
            foot.rotation.x = Math.PI / 2;
            foot.position.set(pos[0] + 0.05, 0.02, pos[2]);
            model.add(foot);
        });

        // Flip model to face forward
        model.rotation.y = Math.PI;

        return model;
    }

    /**
     * Build a fox 3D model with articulated legs.
     * Foxes have two-segment legs (upper and lower) for creeping animation.
     *
     * @param {Object} colors - Color values for the fox
     * @returns {THREE.Group} - The fox model
     */
    function buildFoxModel(colors) {
        const model = new THREE.Group();

        // Materials from data colors
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body });
        const chestMat = new THREE.MeshStandardMaterial({ color: colors.chest });
        const snoutMat = new THREE.MeshStandardMaterial({ color: colors.snout });
        const noseMat = new THREE.MeshStandardMaterial({ color: colors.nose });
        const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes, emissive: colors.eyeGlow });
        const earMat = new THREE.MeshStandardMaterial({ color: colors.ears });
        const earInnerMat = new THREE.MeshStandardMaterial({ color: colors.earInner });
        const legMat = new THREE.MeshStandardMaterial({ color: colors.legs });
        const tailMat = new THREE.MeshStandardMaterial({ color: colors.tail });
        const tailTipMat = new THREE.MeshStandardMaterial({ color: colors.tailTip });

        // Body (elongated oval)
        const bodyGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1, 0.8, 1.5);
        body.position.y = 0.55;
        body.castShadow = true;
        model.add(body);

        // Chest (white underbelly)
        const chestGeo = new THREE.SphereGeometry(0.25, 12, 12);
        const chest = new THREE.Mesh(chestGeo, chestMat);
        chest.scale.set(0.8, 0.6, 1.2);
        chest.position.set(0.1, 0.45, 0);
        model.add(chest);

        // Neck
        const neckGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.25, 8);
        const neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.position.set(0.4, 0.7, 0);
        neck.rotation.z = -0.3;
        model.add(neck);

        // Head
        const headGeo = new THREE.SphereGeometry(0.2, 12, 12);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0.55, 0.85, 0);
        head.scale.set(1.3, 1, 1);
        model.add(head);

        // Snout (pointed, white)
        const snoutGeo = new THREE.ConeGeometry(0.1, 0.3, 8);
        const snout = new THREE.Mesh(snoutGeo, snoutMat);
        snout.rotation.z = -Math.PI / 2;
        snout.position.set(0.8, 0.8, 0);
        model.add(snout);

        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), noseMat);
        nose.position.set(0.95, 0.8, 0);
        model.add(nose);

        // Eyes (amber, predatory)
        [-0.08, 0.08].forEach(zPos => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
            eye.position.set(0.68, 0.9, zPos);
            model.add(eye);
        });

        // Ears (large, triangular)
        [-0.1, 0.1].forEach(zPos => {
            const earGeo = new THREE.ConeGeometry(0.08, 0.2, 4);
            const ear = new THREE.Mesh(earGeo, earMat);
            ear.position.set(0.45, 1.05, zPos);
            ear.rotation.x = zPos > 0 ? 0.2 : -0.2;
            model.add(ear);

            // Inner ear (black)
            const innerEarGeo = new THREE.ConeGeometry(0.04, 0.12, 4);
            const innerEar = new THREE.Mesh(innerEarGeo, earInnerMat);
            innerEar.position.set(0.48, 1.02, zPos);
            innerEar.rotation.x = zPos > 0 ? 0.2 : -0.2;
            model.add(innerEar);
        });

        // Tail (bushy, with white tip) - create as a group for proper attachment
        const tailGroup = new THREE.Group();
        tailGroup.position.set(-0.45, 0.55, 0); // Position at base of tail
        tailGroup.rotation.z = 0.5; // Tilt upward

        const tailGeo = new THREE.CylinderGeometry(0.06, 0.15, 0.7, 8);
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.rotation.z = Math.PI / 2; // Point backward along the group's axis
        tail.position.x = -0.35; // Half the tail length
        tailGroup.add(tail);

        // Tail tip (white) - attached to end of tail
        const tailTipGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const tailTip = new THREE.Mesh(tailTipGeo, tailTipMat);
        tailTip.scale.set(0.8, 0.8, 1);
        tailTip.position.x = -0.7; // At the end of the tail cylinder
        tailGroup.add(tailTip);

        model.add(tailGroup);

        // Store leg references for animation
        model.userData.legs = [];

        // Create articulated legs (4 legs, each with upper and lower segment)
        const legPositions = [
            { x: 0.25, z: 0.15, front: true },   // Front right
            { x: 0.25, z: -0.15, front: true },  // Front left
            { x: -0.25, z: 0.15, front: false }, // Back right
            { x: -0.25, z: -0.15, front: false } // Back left
        ];

        legPositions.forEach((pos, idx) => {
            // Leg group (pivot point at hip)
            const legGroup = new THREE.Group();
            legGroup.position.set(pos.x, 0.4, pos.z);

            // Upper leg segment
            const upperLegGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.25, 6);
            const upperLeg = new THREE.Mesh(upperLegGeo, bodyMat);
            upperLeg.position.y = -0.125; // Half the height down
            legGroup.add(upperLeg);

            // Lower leg group (pivot at knee)
            const lowerLegGroup = new THREE.Group();
            lowerLegGroup.position.y = -0.25; // At the bottom of upper leg

            // Lower leg segment
            const lowerLegGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.2, 6);
            const lowerLeg = new THREE.Mesh(lowerLegGeo, legMat);
            lowerLeg.position.y = -0.1; // Half the height down
            lowerLegGroup.add(lowerLeg);

            // Paw
            const pawGeo = new THREE.SphereGeometry(0.05, 8, 8);
            const paw = new THREE.Mesh(pawGeo, legMat);
            paw.scale.set(1, 0.5, 1.2);
            paw.position.y = -0.2;
            lowerLegGroup.add(paw);

            legGroup.add(lowerLegGroup);
            model.add(legGroup);

            // Store references for animation
            // legIndex: 0=front right, 1=front left, 2=back right, 3=back left
            // Diagonal pairs: (0,3) front right + back left, (1,2) front left + back right
            model.userData.legs.push({
                group: legGroup,
                upperLeg: upperLeg,
                lowerLegGroup: lowerLegGroup,
                lowerLeg: lowerLeg,
                isFront: pos.front,
                legIndex: idx,
                // Diagonal gait: front left (1) and back right (2) move together
                // front right (0) and back left (3) move together
                diagonalPair: (idx === 1 || idx === 2) ? 'A' : 'B'
            });
        });

        // Flip model to face forward
        model.rotation.y = Math.PI;

        return model;
    }

    /**
     * Build a leopard toad 3D model.
     * Toads are small, squat amphibians with big eyes and strong back legs for hopping.
     * Males are yellow with brown spots, females are black.
     *
     * @param {Object} colors - Color values for the toad
     * @returns {THREE.Group} - The toad model
     */
    function buildLeopardToadModel(colors) {
        const model = new THREE.Group();

        // Materials from data colors
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body });
        const spotMat = new THREE.MeshStandardMaterial({ color: colors.spots });
        const bellyMat = new THREE.MeshStandardMaterial({ color: colors.belly });
        const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes });
        const eyeBulgeMat = new THREE.MeshStandardMaterial({ color: colors.eyeBulge });
        const legMat = new THREE.MeshStandardMaterial({ color: colors.legs });

        // Body (squashed sphere - toad body shape)
        const bodyGeo = new THREE.SphereGeometry(0.25, 16, 16);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1, 0.6, 0.85);  // Squashed and slightly wide
        body.position.y = 0.2;
        body.castShadow = true;
        model.add(body);

        // Belly (lighter colored underbelly)
        const bellyGeo = new THREE.SphereGeometry(0.2, 12, 12);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.scale.set(0.8, 0.3, 0.7);
        belly.position.set(0, 0.12, 0);
        model.add(belly);

        // Head (merged with body, slightly raised at front)
        const headGeo = new THREE.SphereGeometry(0.15, 12, 12);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.scale.set(1.1, 0.8, 1);
        head.position.set(0.18, 0.25, 0);
        model.add(head);

        // Mouth line (subtle)
        const mouthGeo = new THREE.BoxGeometry(0.12, 0.01, 0.08);
        const mouth = new THREE.Mesh(mouthGeo, spotMat);
        mouth.position.set(0.28, 0.2, 0);
        model.add(mouth);

        // Eye bulges (characteristic toad feature - eyes on top of head)
        [-0.06, 0.06].forEach(zPos => {
            // Eye bulge (raised bump)
            const bulgeGeo = new THREE.SphereGeometry(0.06, 8, 8);
            const bulge = new THREE.Mesh(bulgeGeo, eyeBulgeMat);
            bulge.position.set(0.22, 0.32, zPos);
            model.add(bulge);

            // Actual eye (dark pupil)
            const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(0.25, 0.34, zPos);
            model.add(eye);
        });

        // Nostrils (two small bumps)
        [-0.03, 0.03].forEach(zPos => {
            const nostrilGeo = new THREE.SphereGeometry(0.015, 6, 6);
            const nostril = new THREE.Mesh(nostrilGeo, spotMat);
            nostril.position.set(0.32, 0.24, zPos);
            model.add(nostril);
        });

        // Add 10 spots on the body (for males, visible; for females, barely visible)
        // Spots are positioned ON the surface of the body, not inside
        const spotPositions = [
            { x: 0.08, y: 0.32, z: 0.12 },
            { x: 0.04, y: 0.34, z: -0.10 },
            { x: -0.06, y: 0.32, z: 0.14 },
            { x: -0.10, y: 0.30, z: -0.12 },
            { x: 0.02, y: 0.35, z: 0.06 },
            { x: -0.08, y: 0.33, z: 0.02 },
            { x: 0.10, y: 0.30, z: -0.08 },
            { x: -0.12, y: 0.28, z: 0.10 },
            { x: 0.14, y: 0.28, z: 0.04 },
            { x: -0.02, y: 0.34, z: -0.12 }
        ];

        spotPositions.forEach((pos) => {
            // Bigger spots that sit on the surface
            const spotSize = 0.045 + Math.random() * 0.025;
            const spotGeo = new THREE.SphereGeometry(spotSize, 8, 8);
            const spot = new THREE.Mesh(spotGeo, spotMat);
            spot.position.set(pos.x, pos.y, pos.z);
            spot.scale.set(1.2, 0.4, 1.2);  // Wider, flatter spots
            model.add(spot);
        });

        // Store leg references for hopping animation
        model.userData.legs = [];

        // Front legs (short, straight)
        const frontLegPositions = [
            { x: 0.12, z: 0.12 },   // Front right
            { x: 0.12, z: -0.12 }   // Front left
        ];

        frontLegPositions.forEach((pos, idx) => {
            const legGroup = new THREE.Group();
            legGroup.position.set(pos.x, 0.1, pos.z);

            // Upper leg (short)
            const upperLegGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.08, 6);
            const upperLeg = new THREE.Mesh(upperLegGeo, legMat);
            upperLeg.position.y = -0.04;
            legGroup.add(upperLeg);

            // Lower leg / foot
            const footGeo = new THREE.SphereGeometry(0.03, 6, 6);
            const foot = new THREE.Mesh(footGeo, legMat);
            foot.scale.set(1.2, 0.5, 1.5);
            foot.position.y = -0.1;
            legGroup.add(foot);

            model.add(legGroup);

            model.userData.legs.push({
                group: legGroup,
                isFront: true,
                legIndex: idx
            });
        });

        // Back legs (longer, bent for hopping - characteristic of toads)
        const backLegPositions = [
            { x: -0.1, z: 0.15 },   // Back right
            { x: -0.1, z: -0.15 }   // Back left
        ];

        backLegPositions.forEach((pos, idx) => {
            const legGroup = new THREE.Group();
            legGroup.position.set(pos.x, 0.12, pos.z);

            // Upper leg (thigh - angled)
            const upperLegGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.12, 6);
            const upperLeg = new THREE.Mesh(upperLegGeo, legMat);
            upperLeg.rotation.z = 0.5;  // Angled outward
            upperLeg.rotation.x = pos.z > 0 ? 0.3 : -0.3;
            upperLeg.position.set(-0.03, -0.04, pos.z > 0 ? 0.02 : -0.02);
            legGroup.add(upperLeg);

            // Lower leg group (shin + foot)
            const lowerLegGroup = new THREE.Group();
            lowerLegGroup.position.set(-0.06, -0.08, pos.z > 0 ? 0.04 : -0.04);

            // Lower leg (shin)
            const lowerLegGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.1, 6);
            const lowerLeg = new THREE.Mesh(lowerLegGeo, legMat);
            lowerLeg.rotation.z = -0.5;
            lowerLeg.position.y = -0.04;
            lowerLegGroup.add(lowerLeg);

            // Foot (webbed toad foot)
            const footGeo = new THREE.SphereGeometry(0.04, 6, 6);
            const foot = new THREE.Mesh(footGeo, legMat);
            foot.scale.set(1.5, 0.4, 2);  // Wide, flat webbed foot
            foot.position.set(0, -0.1, 0);
            lowerLegGroup.add(foot);

            legGroup.add(lowerLegGroup);
            model.add(legGroup);

            model.userData.legs.push({
                group: legGroup,
                lowerLegGroup: lowerLegGroup,
                isFront: false,
                legIndex: idx + 2
            });
        });

        // Flip model to face forward
        model.rotation.y = Math.PI;

        return model;
    }

    /**
     * Build a grass viper weasel 3D model.
     * Grass vipers are small, sleek weasels that hunt toads in the savannah.
     * They can have a pregnancy belly indicator when gestating.
     *
     * @param {Object} colors - Color values for the grass viper
     * @param {boolean} isPregnant - Whether to show pregnancy belly (optional)
     * @returns {THREE.Group} - The grass viper model
     */
    function buildGrassViperModel(colors, isPregnant = false) {
        const model = new THREE.Group();

        // Materials from data colors
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body });
        const snoutMat = new THREE.MeshStandardMaterial({ color: colors.snout });
        const noseMat = new THREE.MeshStandardMaterial({ color: colors.nose });
        const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes, emissive: colors.eyeGlow });
        const earMat = new THREE.MeshStandardMaterial({ color: colors.ears });
        const legMat = new THREE.MeshStandardMaterial({ color: colors.legs });

        // Long, thin body (thinner than regular weasel - grass vipers are sleeker)
        const bodyGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.0, 16);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.28;
        body.castShadow = true;
        model.add(body);

        // Body caps (rounder for sleek look)
        const capGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const frontCap = new THREE.Mesh(capGeo, bodyMat);
        frontCap.position.set(0.5, 0.28, 0);
        model.add(frontCap);
        const backCap = new THREE.Mesh(capGeo, bodyMat);
        backCap.position.set(-0.5, 0.28, 0);
        model.add(backCap);

        // Pregnancy belly (visible when gestating)
        if (isPregnant) {
            const bellyMat = new THREE.MeshStandardMaterial({
                color: colors.body,
                emissive: 0x331111  // Slight red glow to indicate pregnancy
            });
            const bellyGeo = new THREE.SphereGeometry(0.12, 12, 12);
            const belly = new THREE.Mesh(bellyGeo, bellyMat);
            belly.scale.set(1.2, 0.8, 1);  // Flattened sphere underneath
            belly.position.set(0, 0.15, 0);  // Under the body
            belly.userData.pregnancyBelly = true;  // Tag for later removal
            model.add(belly);
        }

        // Head (slightly smaller, pointed)
        const headGeo = new THREE.SphereGeometry(0.14, 16, 16);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0.7, 0.28, 0);
        head.scale.set(1.3, 0.9, 0.8);  // More elongated
        model.add(head);

        // Snout (longer, more pointed)
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), snoutMat);
        snout.position.set(0.88, 0.24, 0);
        snout.scale.set(1.2, 0.8, 0.8);
        model.add(snout);

        // Nose (small, black)
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), noseMat);
        nose.position.set(0.96, 0.24, 0);
        model.add(nose);

        // Eyes (green, predatory - for hunting)
        [-0.06, 0.06].forEach(zPos => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
            eye.position.set(0.78, 0.34, zPos);
            model.add(eye);
        });

        // Small pointed ears
        [-0.08, 0.08].forEach(zPos => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), earMat);
            ear.position.set(0.62, 0.4, zPos);
            ear.scale.set(0.8, 1.2, 0.6);  // Pointed
            model.add(ear);
        });

        // Short, nimble legs
        [[0.3, 0.12, 0.12], [0.3, 0.12, -0.12], [-0.3, 0.12, 0.12], [-0.3, 0.12, -0.12]].forEach(pos => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.24, 8), legMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            model.add(leg);
        });

        // Long thin tail
        const tailGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.7, 8);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.rotation.z = Math.PI / 2 + 0.2;
        tail.position.set(-0.85, 0.32, 0);
        model.add(tail);

        // Flip model to face forward
        model.rotation.y = Math.PI;

        return model;
    }

    /**
     * Build a New World Rhubarb Antelope 3D model (hartebeest-style).
     * Hartebeests have distinctive long faces, sloping backs, and curved horns.
     *
     * @param {Object} colors - Color values for the antelope
     * @param {boolean} hasHorns - Whether to add horns (males only)
     * @param {number} hornScale - Scale of horns (1 = normal, 1.5 = leader)
     * @param {boolean} isPregnant - Whether to show pregnancy belly
     * @returns {THREE.Group} - The antelope model
     */
    function buildAntelopeModel(colors, hasHorns = true, hornScale = 1, isPregnant = false) {
        const model = new THREE.Group();

        // Materials
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body });
        const bellyMat = new THREE.MeshStandardMaterial({ color: colors.belly });
        const legMat = new THREE.MeshStandardMaterial({ color: colors.legs });
        const faceMat = new THREE.MeshStandardMaterial({ color: colors.face });
        const muzzleMat = new THREE.MeshStandardMaterial({ color: colors.muzzle });
        const hornMat = new THREE.MeshStandardMaterial({ color: colors.horns });
        const hoofMat = new THREE.MeshStandardMaterial({ color: colors.hooves });
        const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes });
        const earMat = new THREE.MeshStandardMaterial({ color: colors.ears });
        const tailMat = new THREE.MeshStandardMaterial({ color: colors.tail });

        // Store reference for animations
        model.userData.parts = {};

        // ============================================================
        // BODY - Hartebeest have a sloping back (higher at shoulders)
        // ============================================================

        // Main body (elongated, tilted)
        const bodyGeo = new THREE.CylinderGeometry(0.5, 0.45, 1.8, 12);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2 + 0.15;  // Tilted - higher at front
        body.position.set(0, 1.3, 0);
        body.castShadow = true;
        model.add(body);

        // Chest (front bulge - hartebeests have prominent chests)
        const chestGeo = new THREE.SphereGeometry(0.55, 12, 12);
        const chest = new THREE.Mesh(chestGeo, bodyMat);
        chest.scale.set(0.9, 1, 0.85);
        chest.position.set(0.7, 1.45, 0);
        chest.castShadow = true;
        model.add(chest);

        // Rump (back end)
        const rumpGeo = new THREE.SphereGeometry(0.48, 12, 12);
        const rump = new THREE.Mesh(rumpGeo, bodyMat);
        rump.scale.set(0.85, 0.9, 0.9);
        rump.position.set(-0.75, 1.15, 0);
        rump.castShadow = true;
        model.add(rump);

        // Belly (lighter colored underside)
        const bellyGeo = new THREE.SphereGeometry(0.35, 10, 10);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.scale.set(1.8, 0.6, 0.8);
        belly.position.set(0, 1.0, 0);
        model.add(belly);

        // Pregnancy belly if pregnant
        if (isPregnant) {
            const pregBellyMat = new THREE.MeshStandardMaterial({
                color: colors.belly,
                emissive: 0x331111
            });
            const pregBelly = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 10, 10),
                pregBellyMat
            );
            pregBelly.scale.set(1.2, 0.8, 1);
            pregBelly.position.set(-0.2, 0.85, 0);
            pregBelly.userData.pregnancyBelly = true;
            model.add(pregBelly);
        }

        // ============================================================
        // NECK - Long neck angled upward (hartebeest characteristic)
        // Pivot point at base of neck for natural grazing animation
        // ============================================================

        // Neck group - pivot at the base where neck meets body
        const neckGroup = new THREE.Group();
        neckGroup.position.set(0.9, 1.5, 0);  // Base of neck position
        model.add(neckGroup);
        model.userData.parts.neckGroup = neckGroup;

        // Neck mesh (offset so it extends UP from the pivot point)
        const neckGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.9, 10);
        const neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.rotation.z = -0.5;  // Angled forward and up
        neck.position.set(0.25, 0.35, 0);  // Offset from pivot
        neck.castShadow = true;
        neckGroup.add(neck);

        // ============================================================
        // HEAD - Long, narrow face (hartebeest distinctive feature)
        // Pivot at base of head for tilting muzzle down
        // ============================================================

        // Head group - positioned at top of neck, pivots for head tilt
        const headGroup = new THREE.Group();
        headGroup.position.set(0.55, 0.7, 0);  // At top of neck
        neckGroup.add(headGroup);
        model.userData.parts.headGroup = headGroup;

        // Skull base (where horns attach) - offset from pivot
        const skullGeo = new THREE.SphereGeometry(0.2, 10, 10);
        const skull = new THREE.Mesh(skullGeo, faceMat);
        skull.scale.set(1, 0.9, 0.85);
        skull.position.set(0.1, 0.05, 0);
        headGroup.add(skull);

        // Long face (hartebeest have very long faces)
        const faceGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 10);
        const face = new THREE.Mesh(faceGeo, faceMat);
        face.rotation.z = Math.PI / 2 + 0.3;  // Angled downward slightly
        face.position.set(0.32, -0.1, 0);
        headGroup.add(face);

        // Muzzle/nose (darker, at the end of face)
        const muzzleGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
        muzzle.scale.set(1, 0.7, 0.9);
        muzzle.position.set(0.55, -0.22, 0);
        headGroup.add(muzzle);

        // Nostrils
        [-0.04, 0.04].forEach(zPos => {
            const nostril = new THREE.Mesh(
                new THREE.SphereGeometry(0.025, 6, 6),
                new THREE.MeshStandardMaterial({ color: 0x000000 })
            );
            nostril.position.set(0.62, -0.26, zPos);
            headGroup.add(nostril);
        });

        // Eyes (on sides of head)
        [-0.12, 0.12].forEach(zPos => {
            const eyeSocket = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0xffffff })
            );
            eyeSocket.position.set(0.2, 0.03, zPos);
            headGroup.add(eyeSocket);

            const pupil = new THREE.Mesh(
                new THREE.SphereGeometry(0.03, 6, 6),
                eyeMat
            );
            pupil.position.set(0.23, 0.03, zPos * 1.1);
            headGroup.add(pupil);
        });

        // Ears (small, pointed - on sides of head)
        [-0.15, 0.15].forEach(zPos => {
            const earGeo = new THREE.ConeGeometry(0.06, 0.15, 6);
            const ear = new THREE.Mesh(earGeo, earMat);
            ear.rotation.z = zPos > 0 ? -0.5 : 0.5;
            ear.rotation.x = zPos > 0 ? 0.3 : -0.3;
            ear.position.set(0, 0.18, zPos);
            headGroup.add(ear);
        });

        // ============================================================
        // HORNS - Curved/lyrate shape (males only, larger for leader)
        // ============================================================

        if (hasHorns) {
            // Hartebeest horns curve outward then inward, with ridges
            [-0.08, 0.08].forEach((zPos, idx) => {
                const hornGroup = new THREE.Group();
                hornGroup.position.set(0, 0.2, zPos);

                // Horn base (thick, ridged)
                const hornBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04 * hornScale, 0.06 * hornScale, 0.15 * hornScale, 8),
                    hornMat
                );
                hornBase.position.y = 0.07 * hornScale;
                hornGroup.add(hornBase);

                // Horn middle section (curves outward)
                const hornMid = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03 * hornScale, 0.04 * hornScale, 0.2 * hornScale, 8),
                    hornMat
                );
                hornMid.rotation.z = idx === 0 ? 0.4 : -0.4;  // Curve outward
                hornMid.position.set(0, 0.2 * hornScale, idx === 0 ? -0.05 * hornScale : 0.05 * hornScale);
                hornGroup.add(hornMid);

                // Horn upper section (curves inward/backward)
                const hornUpper = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02 * hornScale, 0.03 * hornScale, 0.18 * hornScale, 8),
                    hornMat
                );
                hornUpper.rotation.z = idx === 0 ? 0.8 : -0.8;  // More curve
                hornUpper.rotation.x = -0.3;  // Curve backward
                hornUpper.position.set(
                    -0.05 * hornScale,
                    0.32 * hornScale,
                    idx === 0 ? -0.1 * hornScale : 0.1 * hornScale
                );
                hornGroup.add(hornUpper);

                // Horn tip (curves back in)
                const hornTip = new THREE.Mesh(
                    new THREE.ConeGeometry(0.02 * hornScale, 0.12 * hornScale, 6),
                    hornMat
                );
                hornTip.rotation.z = idx === 0 ? 0.3 : -0.3;  // Curve back inward
                hornTip.rotation.x = -0.5;
                hornTip.position.set(
                    -0.12 * hornScale,
                    0.42 * hornScale,
                    idx === 0 ? -0.08 * hornScale : 0.08 * hornScale
                );
                hornGroup.add(hornTip);

                // Add ridges to horns (hartebeest characteristic)
                for (let r = 0; r < 4; r++) {
                    const ridge = new THREE.Mesh(
                        new THREE.TorusGeometry(0.045 * hornScale, 0.008 * hornScale, 4, 8),
                        hornMat
                    );
                    ridge.rotation.x = Math.PI / 2;
                    ridge.position.y = 0.05 * hornScale + r * 0.04 * hornScale;
                    hornGroup.add(ridge);
                }

                headGroup.add(hornGroup);
            });
        }

        // ============================================================
        // LEGS - Long, slender legs with knobby knees
        // ============================================================

        const legPositions = [
            { x: 0.5, z: 0.2, front: true, side: 'right' },   // Front right
            { x: 0.5, z: -0.2, front: true, side: 'left' },   // Front left
            { x: -0.6, z: 0.2, front: false, side: 'right' }, // Back right
            { x: -0.6, z: -0.2, front: false, side: 'left' }  // Back left
        ];

        model.userData.legs = [];

        legPositions.forEach((pos, idx) => {
            // ============================================================
            // ARTICULATED LEG STRUCTURE for realistic walking animation
            // Structure: legGroup (pivot at hip) -> upperLeg + lowerLegGroup (pivot at knee)
            // ============================================================

            // Main leg group - pivot point at hip joint
            const legGroup = new THREE.Group();
            legGroup.position.set(pos.x, 1.1, pos.z);

            // Upper leg (thigh) - positioned so top is at pivot
            const upperLegGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.45, 8);
            const upperLeg = new THREE.Mesh(upperLegGeo, legMat);
            upperLeg.position.y = -0.22;  // Center of thigh below hip
            legGroup.add(upperLeg);

            // Lower leg group - pivot point at knee joint
            // This group is a child of legGroup so it moves with the thigh
            const lowerLegGroup = new THREE.Group();
            lowerLegGroup.position.y = -0.45;  // Position at knee level
            legGroup.add(lowerLegGroup);

            // Knee joint (slightly bulging) - at the pivot point
            const knee = new THREE.Mesh(
                new THREE.SphereGeometry(0.07, 8, 8),
                legMat
            );
            knee.scale.set(1, 0.8, 1);
            knee.position.y = 0;  // At the lowerLegGroup origin (knee pivot)
            lowerLegGroup.add(knee);

            // Lower leg (shin) - positioned below knee
            const lowerLegGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.5, 8);
            const lowerLeg = new THREE.Mesh(lowerLegGeo, legMat);
            lowerLeg.position.y = -0.25;  // Center of shin below knee
            lowerLegGroup.add(lowerLeg);

            // Ankle
            const ankle = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 6, 6),
                legMat
            );
            ankle.position.y = -0.5;  // At bottom of shin
            lowerLegGroup.add(ankle);

            // Hoof
            const hoofGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.08, 8);
            const hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.position.y = -0.57;  // Below ankle
            lowerLegGroup.add(hoof);

            model.add(legGroup);

            // Store leg data for animation - includes references to both joints
            model.userData.legs.push({
                group: legGroup,           // Upper leg pivot (hip)
                lowerLegGroup: lowerLegGroup,  // Lower leg pivot (knee)
                isFront: pos.front,
                side: pos.side,
                originalY: 1.1,
                // Animation state
                phase: idx % 2 === 0 ? 0 : Math.PI  // Diagonal pairs start opposite
            });
        });

        // ============================================================
        // TAIL - Short with dark tuft at end
        // ============================================================

        // Tail base
        const tailBaseGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 6);
        const tailBase = new THREE.Mesh(tailBaseGeo, bodyMat);
        tailBase.rotation.z = Math.PI / 2 + 0.8;  // Angled down
        tailBase.position.set(-1.0, 1.1, 0);
        model.add(tailBase);

        // Tail tuft (darker)
        const tuftGeo = new THREE.SphereGeometry(0.06, 6, 6);
        const tuft = new THREE.Mesh(tuftGeo, tailMat);
        tuft.scale.set(1, 2, 1);
        tuft.position.set(-1.2, 0.95, 0);
        model.add(tuft);

        // Flip model to face forward (+X direction)
        model.rotation.y = Math.PI;

        return model;
    }

    // ========================================================================
    // SALTAS GAZELLA MODEL - Fastest animal, springbok-like
    // ========================================================================
    // Slender, graceful springbok-style body built for speed.
    // Both sexes have horns. Can support baby colors and pregnancy.
    // Baby males: fully grey
    // Baby females: fully sunflower orange

    function buildSaltasGazellaModel(colors, hasHorns = true, isPregnant = false, isBaby = false, babyGender = null) {
        const model = new THREE.Group();
        model.userData.parts = {};
        model.userData.legs = [];

        // Override colors for babies
        let useColors = colors;
        if (isBaby) {
            if (babyGender === 'male') {
                // Baby male: fully grey
                useColors = {
                    body: 0x808080, belly: 0x808080, legs: 0x707070,
                    face: 0x808080, muzzle: 0x606060, horns: 0x606060,
                    hooves: 0x505050, eyes: 0x1a1a1a, ears: 0x808080, tail: 0x707070
                };
            } else {
                // Baby female: fully sunflower orange
                useColors = {
                    body: 0xffda03, belly: 0xffda03, legs: 0xe5c402,
                    face: 0xffda03, muzzle: 0xd4b102, horns: 0xc4a200,
                    hooves: 0x1a1a1a, eyes: 0x1a1a1a, ears: 0xffda03, tail: 0xe5c402
                };
            }
        }

        // Materials
        const bodyMat = new THREE.MeshStandardMaterial({ color: useColors.body, roughness: 0.7 });
        const bellyMat = new THREE.MeshStandardMaterial({ color: useColors.belly, roughness: 0.6 });
        const legMat = new THREE.MeshStandardMaterial({ color: useColors.legs, roughness: 0.8 });
        const faceMat = new THREE.MeshStandardMaterial({ color: useColors.face, roughness: 0.7 });
        const muzzleMat = new THREE.MeshStandardMaterial({ color: useColors.muzzle, roughness: 0.6 });
        const hornMat = new THREE.MeshStandardMaterial({ color: useColors.horns, roughness: 0.5 });
        const hoofMat = new THREE.MeshStandardMaterial({ color: useColors.hooves, roughness: 0.9 });
        const eyeMat = new THREE.MeshStandardMaterial({ color: useColors.eyes, roughness: 0.3 });
        const earMat = new THREE.MeshStandardMaterial({ color: useColors.ears, roughness: 0.7 });
        const tailMat = new THREE.MeshStandardMaterial({ color: useColors.tail, roughness: 0.7 });

        // BODY GROUP - slender springbok body
        const bodyGroup = new THREE.Group();
        model.userData.parts.bodyGroup = bodyGroup;

        // Main body - slender cylinder (springbok are leaner than antelope)
        const bodyGeo = new THREE.CylinderGeometry(0.35, 0.4, 1.4, 12);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.rotation.x = 0.08;  // Slight slope
        body.position.set(0, 1.0, 0);
        bodyGroup.add(body);

        // Chest - front bulge
        const chestGeo = new THREE.SphereGeometry(0.38, 12, 10);
        const chest = new THREE.Mesh(chestGeo, bodyMat);
        chest.scale.set(1.1, 1, 0.9);
        chest.position.set(0.65, 1.1, 0);
        bodyGroup.add(chest);

        // Rump
        const rumpGeo = new THREE.SphereGeometry(0.4, 12, 10);
        const rump = new THREE.Mesh(rumpGeo, bodyMat);
        rump.scale.set(1.1, 0.9, 1);
        rump.position.set(-0.6, 0.95, 0);
        bodyGroup.add(rump);

        // White underbelly stripe (distinctive)
        const bellyGeo = new THREE.SphereGeometry(0.32, 12, 8);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.scale.set(1.6, 0.5, 0.8);
        belly.position.set(0, 0.75, 0);
        bodyGroup.add(belly);

        // Pregnancy belly
        if (isPregnant) {
            const pregBellyGeo = new THREE.SphereGeometry(0.35, 12, 10);
            const pregBellyMat = new THREE.MeshStandardMaterial({
                color: useColors.belly,
                roughness: 0.6,
                emissive: 0xff6666,
                emissiveIntensity: 0.1
            });
            const pregBelly = new THREE.Mesh(pregBellyGeo, pregBellyMat);
            pregBelly.scale.set(1.3, 0.8, 1);
            pregBelly.position.set(-0.1, 0.65, 0);
            bodyGroup.add(pregBelly);
        }

        model.add(bodyGroup);

        // NECK - slender, elegant
        const neckGroup = new THREE.Group();
        neckGroup.position.set(0.75, 1.3, 0);
        model.userData.parts.neckGroup = neckGroup;

        const neckGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.6, 10);
        const neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.rotation.z = -0.6;
        neck.position.set(0.15, 0.25, 0);
        neckGroup.add(neck);

        model.add(neckGroup);

        // HEAD - delicate gazelle face
        const headGroup = new THREE.Group();
        headGroup.position.set(0.35, 0.55, 0);
        model.userData.parts.headGroup = headGroup;

        // Skull
        const skullGeo = new THREE.SphereGeometry(0.15, 10, 8);
        const skull = new THREE.Mesh(skullGeo, faceMat);
        skull.scale.set(1, 0.9, 0.85);
        headGroup.add(skull);

        // Face/snout
        const faceGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.25, 8);
        const face = new THREE.Mesh(faceGeo, faceMat);
        face.rotation.z = Math.PI / 2 + 0.3;
        face.position.set(0.18, -0.05, 0);
        headGroup.add(face);

        // Muzzle
        const muzzleGeo = new THREE.SphereGeometry(0.07, 8, 6);
        const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
        muzzle.scale.set(0.9, 0.7, 0.8);
        muzzle.position.set(0.28, -0.08, 0);
        headGroup.add(muzzle);

        // Nostrils
        const nostrilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        [-0.025, 0.025].forEach(z => {
            const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), nostrilMat);
            nostril.position.set(0.33, -0.08, z);
            headGroup.add(nostril);
        });

        // Eyes
        const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        [-0.1, 0.1].forEach(z => {
            const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), eyeWhiteMat);
            eyeSocket.position.set(0.08, 0.03, z);
            headGroup.add(eyeSocket);

            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeMat);
            pupil.position.set(0.11, 0.03, z);
            headGroup.add(pupil);
        });

        // Ears - pointed gazelle ears
        [-0.12, 0.12].forEach(z => {
            const earGeo = new THREE.ConeGeometry(0.05, 0.15, 8);
            const ear = new THREE.Mesh(earGeo, earMat);
            ear.rotation.x = z > 0 ? -0.4 : 0.4;
            ear.rotation.z = -0.3;
            ear.position.set(-0.02, 0.15, z);
            headGroup.add(ear);
        });

        // HORNS - both sexes have elegant curved horns
        if (hasHorns && !isBaby) {
            [-0.06, 0.06].forEach(z => {
                const hornGroup = new THREE.Group();
                hornGroup.position.set(0, 0.12, z);

                // Horn base
                const hornBase = new THREE.CylinderGeometry(0.025, 0.035, 0.12, 8);
                const base = new THREE.Mesh(hornBase, hornMat);
                base.rotation.z = z > 0 ? -0.2 : 0.2;
                base.position.y = 0.06;
                hornGroup.add(base);

                // Horn middle - curves back
                const hornMid = new THREE.CylinderGeometry(0.018, 0.025, 0.15, 8);
                const mid = new THREE.Mesh(hornMid, hornMat);
                mid.rotation.z = z > 0 ? -0.5 : 0.5;
                mid.rotation.x = -0.3;
                mid.position.set(-0.04, 0.18, z > 0 ? 0.02 : -0.02);
                hornGroup.add(mid);

                // Horn tip
                const hornTip = new THREE.ConeGeometry(0.012, 0.1, 6);
                const tip = new THREE.Mesh(hornTip, hornMat);
                tip.rotation.z = z > 0 ? -0.7 : 0.7;
                tip.rotation.x = -0.4;
                tip.position.set(-0.1, 0.28, z > 0 ? 0.04 : -0.04);
                hornGroup.add(tip);

                headGroup.add(hornGroup);
            });
        }

        neckGroup.add(headGroup);

        // LEGS - long, thin gazelle legs (built for speed!)
        const legPositions = [
            { x: 0.5, z: 0.18, front: true, side: 'right' },
            { x: 0.5, z: -0.18, front: true, side: 'left' },
            { x: -0.55, z: 0.18, front: false, side: 'right' },
            { x: -0.55, z: -0.18, front: false, side: 'left' }
        ];

        legPositions.forEach((pos, idx) => {
            const legGroup = new THREE.Group();
            legGroup.position.set(pos.x, 0.85, pos.z);

            // Upper leg - thin
            const upperGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.4, 8);
            const upper = new THREE.Mesh(upperGeo, bodyMat);
            upper.position.y = -0.2;
            legGroup.add(upper);

            // Lower leg group (knee pivot)
            const lowerLegGroup = new THREE.Group();
            lowerLegGroup.position.y = -0.4;

            // Knee
            const kneeGeo = new THREE.SphereGeometry(0.04, 8, 6);
            const knee = new THREE.Mesh(kneeGeo, legMat);
            lowerLegGroup.add(knee);

            // Lower leg - very thin
            const lowerGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.45, 8);
            const lower = new THREE.Mesh(lowerGeo, legMat);
            lower.position.y = -0.25;
            lowerLegGroup.add(lower);

            // Ankle
            const ankleGeo = new THREE.SphereGeometry(0.025, 6, 6);
            const ankle = new THREE.Mesh(ankleGeo, legMat);
            ankle.position.y = -0.48;
            lowerLegGroup.add(ankle);

            // Hoof - small
            const hoofGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.06, 6);
            const hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.position.y = -0.52;
            lowerLegGroup.add(hoof);

            legGroup.add(lowerLegGroup);
            model.add(legGroup);

            model.userData.legs.push({
                group: legGroup,
                lowerLegGroup: lowerLegGroup,
                isFront: pos.front,
                side: pos.side,
                phase: idx % 2 === 0 ? 0 : Math.PI
            });
        });

        // TAIL - short, flicking
        const tailGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.2, 6);
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.rotation.z = 0.8;
        tail.position.set(-0.85, 0.9, 0);
        model.add(tail);

        // Tail tuft
        const tuftGeo = new THREE.SphereGeometry(0.04, 6, 6);
        const tuft = new THREE.Mesh(tuftGeo, tailMat);
        tuft.scale.set(1, 1.5, 1);
        tuft.position.set(-0.95, 0.8, 0);
        model.add(tuft);

        // Flip model to face forward
        model.rotation.y = Math.PI;

        return model;
    }

    // ========================================================================
    // NEW WORLD HUNTER'S WILD DOG MODEL
    // ========================================================================
    // Hyperrealistic African wild dog inspired model.
    // MORE detailed than antelope - featuring:
    // - Multi-segment muscular body
    // - Patchy fur pattern (distinctive wild dog look)
    // - Large rounded ears (bigger than other animals)
    // - White-tipped tail
    // - Articulated neck, head, and legs
    // - Pregnancy belly support

    function buildWildDogModel(colors, isAlpha = false, isPregnant = false) {
        const model = new THREE.Group();
        model.userData.parts = {};
        model.userData.legs = [];

        // ============================================================
        // MATERIALS - More variety than antelope for realistic fur
        // ============================================================

        const bodyMat = new THREE.MeshStandardMaterial({
            color: colors.body,
            roughness: 0.9
        });
        const bellyMat = new THREE.MeshStandardMaterial({
            color: colors.belly,
            roughness: 0.85
        });
        const chestMat = new THREE.MeshStandardMaterial({
            color: colors.chest,
            roughness: 0.85
        });
        const patchDarkMat = new THREE.MeshStandardMaterial({
            color: colors.patches,
            roughness: 0.95
        });
        const patchLightMat = new THREE.MeshStandardMaterial({
            color: colors.patchesLight,
            roughness: 0.85
        });
        const muzzleMat = new THREE.MeshStandardMaterial({
            color: colors.muzzle,
            roughness: 0.8
        });
        const noseMat = new THREE.MeshStandardMaterial({
            color: colors.nose,
            roughness: 0.3  // Shiny nose
        });
        const eyeMat = new THREE.MeshStandardMaterial({
            color: colors.eyes,
            emissive: colors.eyeGlow,
            roughness: 0.3
        });
        const earMat = new THREE.MeshStandardMaterial({
            color: colors.ears,
            roughness: 0.9
        });
        const earInnerMat = new THREE.MeshStandardMaterial({
            color: colors.earInner,
            roughness: 0.7
        });
        const legMat = new THREE.MeshStandardMaterial({
            color: colors.legs,
            roughness: 0.9
        });
        const pawMat = new THREE.MeshStandardMaterial({
            color: colors.paws,
            roughness: 0.85
        });
        const tailMat = new THREE.MeshStandardMaterial({
            color: colors.tail,
            roughness: 0.9
        });
        const tailTipMat = new THREE.MeshStandardMaterial({
            color: colors.tailTip,
            roughness: 0.85
        });

        // ============================================================
        // BODY - Multi-segment muscular build (MORE detail than antelope)
        // ============================================================

        // Main torso - elongated barrel shape
        const torsoGeo = new THREE.CylinderGeometry(0.35, 0.32, 1.1, 12);
        const torso = new THREE.Mesh(torsoGeo, bodyMat);
        torso.rotation.z = Math.PI / 2;
        torso.position.set(0, 0.85, 0);
        model.add(torso);

        // Chest - prominent muscular chest (wild dogs have deep chests)
        const chestGeo = new THREE.SphereGeometry(0.38, 12, 10);
        const chest = new THREE.Mesh(chestGeo, chestMat);
        chest.scale.set(0.9, 1, 0.85);
        chest.position.set(0.45, 0.85, 0);
        model.add(chest);

        // Ribcage detail - subtle bulges for anatomical accuracy
        for (let i = 0; i < 4; i++) {
            const ribGeo = new THREE.TorusGeometry(0.28, 0.03, 6, 12, Math.PI);
            const rib = new THREE.Mesh(ribGeo, bodyMat);
            rib.rotation.y = Math.PI / 2;
            rib.rotation.x = Math.PI / 2;
            rib.position.set(-0.1 + i * 0.18, 0.85, 0);
            model.add(rib);
        }

        // Shoulder hump - muscular shoulder area
        const shoulderGeo = new THREE.SphereGeometry(0.22, 10, 8);
        const shoulder = new THREE.Mesh(shoulderGeo, bodyMat);
        shoulder.scale.set(1.2, 0.8, 1);
        shoulder.position.set(0.3, 1.0, 0);
        model.add(shoulder);

        // Hip musculature - powerful haunches
        const hipGeo = new THREE.SphereGeometry(0.28, 10, 8);
        const hip = new THREE.Mesh(hipGeo, bodyMat);
        hip.scale.set(0.9, 0.85, 1);
        hip.position.set(-0.4, 0.8, 0);
        model.add(hip);

        // Belly (lighter color)
        const bellyGeo = new THREE.SphereGeometry(0.25, 10, 8);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.scale.set(1.8, 0.6, 0.9);
        belly.position.set(0, 0.65, 0);
        model.add(belly);

        // Pregnancy belly (optional)
        if (isPregnant) {
            const pregBellyGeo = new THREE.SphereGeometry(0.35, 12, 10);
            const pregBellyMat = new THREE.MeshStandardMaterial({
                color: colors.belly,
                emissive: 0x221100,
                roughness: 0.8
            });
            const pregBelly = new THREE.Mesh(pregBellyGeo, pregBellyMat);
            pregBelly.scale.set(1.4, 0.9, 1.1);
            pregBelly.position.set(-0.1, 0.55, 0);
            model.add(pregBelly);
        }

        // ============================================================
        // FUR PATCHES - Distinctive African wild dog pattern
        // ============================================================

        // Random dark patches on body
        const patchPositions = [
            { x: 0.2, y: 0.95, z: 0.25, scale: 0.12 },
            { x: -0.1, y: 0.9, z: -0.2, scale: 0.15 },
            { x: 0.3, y: 0.75, z: -0.15, scale: 0.1 },
            { x: -0.3, y: 0.85, z: 0.2, scale: 0.13 },
            { x: 0, y: 1.0, z: 0.2, scale: 0.11 },
            { x: -0.2, y: 0.7, z: -0.25, scale: 0.09 }
        ];

        patchPositions.forEach((pos, idx) => {
            const patchGeo = new THREE.SphereGeometry(pos.scale, 6, 6);
            const patchMat = idx % 2 === 0 ? patchDarkMat : patchLightMat;
            const patch = new THREE.Mesh(patchGeo, patchMat);
            patch.scale.set(1.5, 0.8, 1.2);
            patch.position.set(pos.x, pos.y, pos.z);
            model.add(patch);
        });

        // Light patches (cream colored spots)
        const lightPatchPositions = [
            { x: 0.35, y: 0.8, z: 0.18, scale: 0.08 },
            { x: -0.25, y: 0.95, z: 0.15, scale: 0.1 },
            { x: 0.1, y: 0.7, z: -0.22, scale: 0.09 }
        ];

        lightPatchPositions.forEach(pos => {
            const patchGeo = new THREE.SphereGeometry(pos.scale, 6, 6);
            const patch = new THREE.Mesh(patchGeo, patchLightMat);
            patch.scale.set(1.3, 0.7, 1.1);
            patch.position.set(pos.x, pos.y, pos.z);
            model.add(patch);
        });

        // ============================================================
        // NECK - Articulated with pivot point (like antelope)
        // ============================================================

        const neckGroup = new THREE.Group();
        neckGroup.position.set(0.55, 0.95, 0);
        model.add(neckGroup);
        model.userData.parts.neckGroup = neckGroup;

        // Neck - muscular and slightly arched
        const neckGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.4, 10);
        const neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.rotation.z = -0.4;  // Angled forward
        neck.position.set(0.12, 0.15, 0);
        neckGroup.add(neck);

        // Neck fur ruff (thicker fur around neck)
        const ruffGeo = new THREE.TorusGeometry(0.16, 0.04, 6, 12);
        const ruff = new THREE.Mesh(ruffGeo, bodyMat);
        ruff.rotation.y = Math.PI / 2;
        ruff.position.set(0, 0.05, 0);
        neckGroup.add(ruff);

        // ============================================================
        // HEAD - Articulated, detailed wolf-like features
        // ============================================================

        const headGroup = new THREE.Group();
        headGroup.position.set(0.25, 0.35, 0);
        neckGroup.add(headGroup);
        model.userData.parts.headGroup = headGroup;

        // Skull base
        const skullGeo = new THREE.SphereGeometry(0.16, 10, 8);
        const skull = new THREE.Mesh(skullGeo, bodyMat);
        skull.scale.set(1.1, 0.9, 0.95);
        skull.position.set(0, 0, 0);
        headGroup.add(skull);

        // Brow ridge (gives intelligent look)
        const browGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.18, 8);
        const brow = new THREE.Mesh(browGeo, bodyMat);
        brow.rotation.z = Math.PI / 2;
        brow.position.set(0.08, 0.08, 0);
        headGroup.add(brow);

        // Snout - long and narrow (wild dog characteristic)
        const snoutGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.3, 8);
        const snout = new THREE.Mesh(snoutGeo, muzzleMat);
        snout.rotation.z = Math.PI / 2 + 0.15;  // Slight downward angle
        snout.position.set(0.25, -0.02, 0);
        headGroup.add(snout);

        // Nose (black, shiny)
        const noseGeo = new THREE.SphereGeometry(0.045, 8, 6);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.scale.set(1, 0.7, 1.2);
        nose.position.set(0.38, -0.03, 0);
        headGroup.add(nose);

        // Nostrils
        const nostrilGeo = new THREE.SphereGeometry(0.015, 6, 6);
        const nostrilLeft = new THREE.Mesh(nostrilGeo, noseMat);
        nostrilLeft.position.set(0.4, -0.02, 0.025);
        headGroup.add(nostrilLeft);
        const nostrilRight = new THREE.Mesh(nostrilGeo, noseMat);
        nostrilRight.position.set(0.4, -0.02, -0.025);
        headGroup.add(nostrilRight);

        // Mouth line
        const mouthGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 6);
        const mouth = new THREE.Mesh(mouthGeo, noseMat);
        mouth.rotation.z = Math.PI / 2;
        mouth.position.set(0.28, -0.08, 0);
        headGroup.add(mouth);

        // ============================================================
        // EYES - Detailed with white and pupils
        // ============================================================

        // Eye sockets (slight indent)
        const eyeSocketGeo = new THREE.SphereGeometry(0.045, 8, 6);
        const eyeSocketMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A });

        // Left eye
        const eyeSocketL = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
        eyeSocketL.position.set(0.1, 0.05, 0.1);
        headGroup.add(eyeSocketL);

        const eyeWhiteGeoL = new THREE.SphereGeometry(0.035, 8, 6);
        const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFAF0 });
        const eyeWhiteL = new THREE.Mesh(eyeWhiteGeoL, eyeWhiteMat);
        eyeWhiteL.position.set(0.11, 0.055, 0.11);
        headGroup.add(eyeWhiteL);

        const pupilGeoL = new THREE.SphereGeometry(0.02, 6, 6);
        const pupilL = new THREE.Mesh(pupilGeoL, eyeMat);
        pupilL.position.set(0.125, 0.055, 0.12);
        headGroup.add(pupilL);

        // Right eye
        const eyeSocketR = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
        eyeSocketR.position.set(0.1, 0.05, -0.1);
        headGroup.add(eyeSocketR);

        const eyeWhiteR = new THREE.Mesh(eyeWhiteGeoL, eyeWhiteMat);
        eyeWhiteR.position.set(0.11, 0.055, -0.11);
        headGroup.add(eyeWhiteR);

        const pupilR = new THREE.Mesh(pupilGeoL, eyeMat);
        pupilR.position.set(0.125, 0.055, -0.12);
        headGroup.add(pupilR);

        // ============================================================
        // EARS - Large rounded ears (distinctive wild dog feature!)
        // These are BIGGER than other animals
        // ============================================================

        // Left ear - large and rounded (satellite dish shape)
        const earGroupL = new THREE.Group();
        earGroupL.position.set(-0.02, 0.12, 0.1);
        earGroupL.rotation.set(0.3, 0.4, 0.2);
        headGroup.add(earGroupL);

        const earOuterGeoL = new THREE.SphereGeometry(0.12, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const earOuterL = new THREE.Mesh(earOuterGeoL, earMat);
        earOuterL.scale.set(0.7, 1, 0.15);
        earGroupL.add(earOuterL);

        const earInnerGeoL = new THREE.SphereGeometry(0.09, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        const earInnerL = new THREE.Mesh(earInnerGeoL, earInnerMat);
        earInnerL.scale.set(0.6, 0.85, 0.1);
        earInnerL.position.set(0, 0.01, 0.01);
        earGroupL.add(earInnerL);

        // Right ear
        const earGroupR = new THREE.Group();
        earGroupR.position.set(-0.02, 0.12, -0.1);
        earGroupR.rotation.set(-0.3, -0.4, 0.2);
        headGroup.add(earGroupR);

        const earOuterR = new THREE.Mesh(earOuterGeoL, earMat);
        earOuterR.scale.set(0.7, 1, 0.15);
        earGroupR.add(earOuterR);

        const earInnerR = new THREE.Mesh(earInnerGeoL, earInnerMat);
        earInnerR.scale.set(0.6, 0.85, 0.1);
        earInnerR.position.set(0, 0.01, -0.01);
        earGroupR.add(earInnerR);

        // ============================================================
        // LEGS - Articulated with dual-pivot (hip + knee) like antelope
        // Wild dogs have long, slender legs built for endurance running
        // ============================================================

        const legPositions = [
            { x: 0.35, z: 0.15, front: true, side: 'right' },
            { x: 0.35, z: -0.15, front: true, side: 'left' },
            { x: -0.35, z: 0.15, front: false, side: 'right' },
            { x: -0.35, z: -0.15, front: false, side: 'left' }
        ];

        legPositions.forEach((pos, idx) => {
            // Main leg group - pivot at hip
            const legGroup = new THREE.Group();
            legGroup.position.set(pos.x, 0.7, pos.z);
            model.add(legGroup);

            // Upper leg (thigh) - muscular
            const upperLegGeo = new THREE.CylinderGeometry(0.055, 0.07, 0.35, 8);
            const upperLeg = new THREE.Mesh(upperLegGeo, legMat);
            upperLeg.position.y = -0.17;
            legGroup.add(upperLeg);

            // Thigh muscle bulge
            const thighMuscleGeo = new THREE.SphereGeometry(0.06, 6, 6);
            const thighMuscle = new THREE.Mesh(thighMuscleGeo, legMat);
            thighMuscle.scale.set(1, 1.3, 0.8);
            thighMuscle.position.set(pos.front ? 0.02 : -0.02, -0.08, 0);
            legGroup.add(thighMuscle);

            // Lower leg group - pivot at knee
            const lowerLegGroup = new THREE.Group();
            lowerLegGroup.position.y = -0.35;
            legGroup.add(lowerLegGroup);

            // Knee joint
            const kneeGeo = new THREE.SphereGeometry(0.045, 8, 6);
            const knee = new THREE.Mesh(kneeGeo, legMat);
            knee.scale.set(1, 0.8, 0.9);
            lowerLegGroup.add(knee);

            // Lower leg (shin) - slender
            const lowerLegGeo = new THREE.CylinderGeometry(0.03, 0.045, 0.35, 8);
            const lowerLeg = new THREE.Mesh(lowerLegGeo, legMat);
            lowerLeg.position.y = -0.18;
            lowerLegGroup.add(lowerLeg);

            // Ankle
            const ankleGeo = new THREE.SphereGeometry(0.03, 6, 6);
            const ankle = new THREE.Mesh(ankleGeo, legMat);
            ankle.position.y = -0.35;
            lowerLegGroup.add(ankle);

            // Paw - wild dogs have only 4 toes (unique feature!)
            const pawGeo = new THREE.SphereGeometry(0.04, 8, 6);
            const paw = new THREE.Mesh(pawGeo, pawMat);
            paw.scale.set(1.3, 0.5, 1.1);
            paw.position.y = -0.4;
            lowerLegGroup.add(paw);

            // Individual toe pads (4 toes, not 5 like other canines)
            for (let t = 0; t < 4; t++) {
                const toeGeo = new THREE.SphereGeometry(0.015, 6, 6);
                const toe = new THREE.Mesh(toeGeo, pawMat);
                const toeAngle = ((t - 1.5) / 3) * 0.8;
                toe.position.set(
                    0.035 * Math.cos(toeAngle),
                    -0.42,
                    0.035 * Math.sin(toeAngle) + pos.z * 0.05
                );
                lowerLegGroup.add(toe);
            }

            // Store leg data for animation
            model.userData.legs.push({
                group: legGroup,
                lowerLegGroup: lowerLegGroup,
                isFront: pos.front,
                side: pos.side,
                originalY: 0.7,
                phase: idx % 2 === 0 ? 0 : Math.PI  // Diagonal gait
            });
        });

        // ============================================================
        // TAIL - Articulated with white tip (distinctive feature!)
        // ============================================================

        const tailGroup = new THREE.Group();
        tailGroup.position.set(-0.55, 0.75, 0);
        model.add(tailGroup);
        model.userData.parts.tailGroup = tailGroup;

        // Tail base
        const tailBaseGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.25, 8);
        const tailBase = new THREE.Mesh(tailBaseGeo, tailMat);
        tailBase.rotation.z = Math.PI / 2 + 0.5;  // Angled back
        tailBase.position.set(-0.1, 0, 0);
        tailGroup.add(tailBase);

        // Tail middle
        const tailMidGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.2, 8);
        const tailMid = new THREE.Mesh(tailMidGeo, tailMat);
        tailMid.rotation.z = Math.PI / 2 + 0.3;
        tailMid.position.set(-0.28, -0.08, 0);
        tailGroup.add(tailMid);

        // Tail tip - WHITE (distinctive wild dog feature!)
        const tailTipGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.12, 8);
        const tailTip = new THREE.Mesh(tailTipGeo, tailTipMat);
        tailTip.rotation.z = Math.PI / 2 + 0.2;
        tailTip.position.set(-0.4, -0.12, 0);
        tailGroup.add(tailTip);

        // White tuft at very end
        const tuftGeo = new THREE.SphereGeometry(0.03, 6, 6);
        const tuft = new THREE.Mesh(tuftGeo, tailTipMat);
        tuft.scale.set(0.8, 1.5, 0.8);
        tuft.position.set(-0.48, -0.14, 0);
        tailGroup.add(tuft);

        // ============================================================
        // ALPHA MARKER (optional golden collar effect for alpha)
        // ============================================================

        if (isAlpha) {
            // Subtle golden glow around neck
            const collarGeo = new THREE.TorusGeometry(0.18, 0.025, 8, 16);
            const collarMat = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                emissive: 0x332200,
                roughness: 0.4
            });
            const collar = new THREE.Mesh(collarGeo, collarMat);
            collar.rotation.y = Math.PI / 2;
            collar.position.set(0.55, 0.95, 0);
            model.add(collar);
        }

        // Flip model to face forward (+X direction)
        model.rotation.y = Math.PI;

        return model;
    }

    /**
     * Build a Dronglous Cat 3D model.
     * A small lynx-like cat that lives in acacia trees in the savannah.
     * Discovered by Professor Snoutworth!
     *
     * @param {Object} colors - Color values from ENEMIES data
     * @param {boolean} isBaby - Whether this is a baby cat
     * @returns {THREE.Group} - The cat model
     */
    function buildDronglousCatModel(colors, isBaby = false) {
        const model = new THREE.Group();

        // Materials - higher quality with better lighting response
        const bodyMat = new THREE.MeshStandardMaterial({
            color: colors.body,
            roughness: 0.7,
            metalness: 0.1
        });
        const bellyMat = new THREE.MeshStandardMaterial({
            color: colors.belly,
            roughness: 0.8
        });
        const faceMat = new THREE.MeshStandardMaterial({
            color: colors.face,
            roughness: 0.6
        });
        const earMat = new THREE.MeshStandardMaterial({ color: colors.ears });
        const earInnerMat = new THREE.MeshStandardMaterial({
            color: colors.earInner,
            roughness: 0.9
        });
        const noseMat = new THREE.MeshStandardMaterial({
            color: colors.nose,
            roughness: 0.3,
            metalness: 0.2
        });
        // Enhanced eye materials for more realistic look
        const eyeWhiteMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.1
        });
        const irisMat = new THREE.MeshStandardMaterial({
            color: colors.eyes,
            emissive: colors.eyes,
            emissiveIntensity: 0.4,
            roughness: 0.1,
            metalness: 0.3
        });
        const pupilMat = new THREE.MeshStandardMaterial({
            color: colors.eyePupil,
            roughness: 0.0,
            metalness: 0.5
        });
        const eyeHighlightMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        const pawPadMat = new THREE.MeshStandardMaterial({
            color: colors.pawPads,
            roughness: 0.9
        });
        const tailMat = new THREE.MeshStandardMaterial({
            color: colors.tail,
            roughness: 0.7
        });
        const clawMat = new THREE.MeshStandardMaterial({
            color: 0xccccaa,
            roughness: 0.3,
            metalness: 0.2
        });

        // Scale factor for babies
        const scale = isBaby ? 0.6 : 1;

        // ====================================================================
        // SPINE SYSTEM - For cheetah-like back bending animation
        // Each segment MUST be positioned along the spine for rotation to work!
        // ====================================================================
        const spineGroup = new THREE.Group();
        model.add(spineGroup);

        // Front spine segment (shoulders/chest) - positioned at FRONT
        const frontSpine = new THREE.Group();
        frontSpine.position.set(0.25 * scale, 0, 0); // Front of body
        spineGroup.add(frontSpine);

        // Mid spine segment (middle back - this bends during running) - positioned at CENTER
        const midSpine = new THREE.Group();
        midSpine.position.set(0, 0, 0); // Middle of body
        spineGroup.add(midSpine);

        // Rear spine segment (hips/haunches) - positioned at REAR
        const rearSpine = new THREE.Group();
        rearSpine.position.set(-0.3 * scale, 0, 0); // Rear of body
        spineGroup.add(rearSpine);

        // ====================================================================
        // BODY - Segmented for animation (attached to spine groups)
        // ====================================================================

        // Front body (chest) - attached to frontSpine (now positioned relative to spine segment)
        const chestGeo = new THREE.SphereGeometry(0.26 * scale, 16, 16);
        const chest = new THREE.Mesh(chestGeo, bodyMat);
        chest.position.set(0, 0.35 * scale, 0); // Local to frontSpine
        chest.scale.set(1.3, 0.95, 0.9);
        chest.castShadow = true;
        frontSpine.add(chest);

        // Mid body (flexible middle) - attached to midSpine
        const midBodyGeo = new THREE.CylinderGeometry(0.24 * scale, 0.26 * scale, 0.35 * scale, 16);
        const midBody = new THREE.Mesh(midBodyGeo, bodyMat);
        midBody.rotation.z = Math.PI / 2;
        midBody.position.set(0, 0.35 * scale, 0); // Local to midSpine
        midBody.castShadow = true;
        midSpine.add(midBody);

        // Rear body (haunches) - attached to rearSpine
        const haunchGeo = new THREE.SphereGeometry(0.28 * scale, 16, 16);
        const haunch = new THREE.Mesh(haunchGeo, bodyMat);
        haunch.position.set(0, 0.35 * scale, 0); // Local to rearSpine
        haunch.scale.set(1.2, 1, 0.95);
        haunch.castShadow = true;
        rearSpine.add(haunch);

        // Belly (slightly lighter underneath)
        const bellyGeo = new THREE.CapsuleGeometry(0.15 * scale, 0.5 * scale, 8, 16);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.rotation.z = Math.PI / 2;
        belly.position.set(0, 0.18 * scale, 0);
        midSpine.add(belly);

        // ====================================================================
        // HEAD - High detail cat head
        // ====================================================================
        const headGroup = new THREE.Group();
        frontSpine.add(headGroup);
        headGroup.position.set(0.25 * scale, 0.5 * scale, 0); // Local to frontSpine (already at front)

        // Main head shape
        const headGeo = new THREE.SphereGeometry(0.18 * scale, 16, 16);
        const head = new THREE.Mesh(headGeo, faceMat);
        head.scale.set(1.15, 1, 0.95);
        head.castShadow = true;
        headGroup.add(head);

        // Cheeks (give cat face shape)
        [-0.08, 0.08].forEach(z => {
            const cheekGeo = new THREE.SphereGeometry(0.08 * scale, 10, 10);
            const cheek = new THREE.Mesh(cheekGeo, faceMat);
            cheek.position.set(0.08 * scale, -0.04 * scale, z * scale);
            headGroup.add(cheek);
        });

        // Muzzle/snout
        const muzzleGeo = new THREE.SphereGeometry(0.09 * scale, 12, 12);
        const muzzle = new THREE.Mesh(muzzleGeo, faceMat);
        muzzle.position.set(0.15 * scale, -0.03 * scale, 0);
        muzzle.scale.set(0.9, 0.65, 0.8);
        headGroup.add(muzzle);

        // Nose - heart-shaped cat nose
        const noseGeo = new THREE.SphereGeometry(0.025 * scale, 8, 8);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0.22 * scale, 0, 0);
        nose.scale.set(1.2, 0.8, 1.5);
        headGroup.add(nose);

        // Mouth line
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        const mouthGeo = new THREE.BoxGeometry(0.02 * scale, 0.003 * scale, 0.04 * scale);
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0.2 * scale, -0.06 * scale, 0);
        headGroup.add(mouth);

        // ====================================================================
        // EYES - Detailed with iris, pupil, highlights (ENHANCED - BIGGER & MORE VISIBLE)
        // ====================================================================
        [-0.07, 0.07].forEach((z, eyeIdx) => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(0.13 * scale, 0.05 * scale, z * scale);
            headGroup.add(eyeGroup);

            // Eye socket (slight indent)
            const socketGeo = new THREE.SphereGeometry(0.065 * scale, 12, 12);
            const socket = new THREE.Mesh(socketGeo, faceMat);
            socket.scale.set(0.9, 1.2, 0.7);
            eyeGroup.add(socket);

            // Eyeball white - BIGGER
            const eyeballGeo = new THREE.SphereGeometry(0.055 * scale, 16, 16);
            const eyeball = new THREE.Mesh(eyeballGeo, eyeWhiteMat);
            eyeball.position.x = 0.015 * scale;
            eyeball.scale.set(0.9, 1.2, 0.7);
            eyeball.castShadow = true;
            eyeGroup.add(eyeball);

            // Iris (colored part) - BIGGER
            const irisGeo = new THREE.SphereGeometry(0.042 * scale, 16, 16);
            const iris = new THREE.Mesh(irisGeo, irisMat);
            iris.position.x = 0.03 * scale;
            iris.scale.set(0.55, 1.1, 0.95);
            iris.castShadow = true;
            eyeGroup.add(iris);

            // Pupil - vertical slit (cat-like) - BIGGER
            const pupilGeo = new THREE.BoxGeometry(0.01 * scale, 0.065 * scale, 0.022 * scale);
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.x = 0.045 * scale;
            pupil.castShadow = true;
            eyeGroup.add(pupil);

            // Eye highlights (two small white dots for that "alive" look)
            const highlight1Geo = new THREE.SphereGeometry(0.008 * scale, 6, 6);
            const highlight1 = new THREE.Mesh(highlight1Geo, eyeHighlightMat);
            highlight1.position.set(0.042 * scale, 0.015 * scale, z > 0 ? -0.008 * scale : 0.008 * scale);
            eyeGroup.add(highlight1);

            const highlight2Geo = new THREE.SphereGeometry(0.004 * scale, 6, 6);
            const highlight2 = new THREE.Mesh(highlight2Geo, eyeHighlightMat);
            highlight2.position.set(0.042 * scale, -0.01 * scale, z > 0 ? 0.005 * scale : -0.005 * scale);
            eyeGroup.add(highlight2);

            // Eyelids (subtle)
            const upperLidGeo = new THREE.SphereGeometry(0.05 * scale, 10, 10, 0, Math.PI * 2, 0, Math.PI / 3);
            const upperLid = new THREE.Mesh(upperLidGeo, faceMat);
            upperLid.position.set(0.015 * scale, 0.02 * scale, 0);
            upperLid.rotation.x = Math.PI;
            upperLid.scale.set(0.85, 0.6, 0.65);
            eyeGroup.add(upperLid);
        });

        // ====================================================================
        // EARS - Detailed pointed cat ears
        // ====================================================================
        [-0.1, 0.1].forEach(z => {
            const earGroup = new THREE.Group();
            earGroup.position.set(-0.02 * scale, 0.18 * scale, z * scale);
            earGroup.rotation.x = z > 0 ? 0.2 : -0.2;
            earGroup.rotation.z = z > 0 ? 0.15 : -0.15;
            headGroup.add(earGroup);

            // Outer ear - more triangular
            const earGeo = new THREE.ConeGeometry(0.055 * scale, 0.14 * scale, 4);
            const ear = new THREE.Mesh(earGeo, earMat);
            earGroup.add(ear);

            // Inner ear (pink/darker)
            const earInnerGeo = new THREE.ConeGeometry(0.035 * scale, 0.1 * scale, 4);
            const earInner = new THREE.Mesh(earInnerGeo, earInnerMat);
            earInner.position.y = -0.01 * scale;
            earInner.position.x = 0.01 * scale;
            earGroup.add(earInner);

            // Ear tuft (fur at base)
            const tuftGeo = new THREE.SphereGeometry(0.025 * scale, 6, 6);
            const tuft = new THREE.Mesh(tuftGeo, bodyMat);
            tuft.position.y = -0.06 * scale;
            tuft.scale.set(1.2, 0.6, 1);
            earGroup.add(tuft);
        });

        // ====================================================================
        // WHISKERS - Fine detail
        // ====================================================================
        if (colors.whiskers) {
            const whiskerMat = new THREE.MeshBasicMaterial({ color: colors.whiskers });
            // 3 whiskers per side, at different angles
            [-0.03, 0, 0.03].forEach((yOffset, i) => {
                [-1, 1].forEach(side => {
                    const whiskerGeo = new THREE.CylinderGeometry(0.002 * scale, 0.001 * scale, 0.14 * scale, 4);
                    const whisker = new THREE.Mesh(whiskerGeo, whiskerMat);
                    whisker.position.set(0.18 * scale, -0.02 * scale + yOffset * scale, side * 0.06 * scale);
                    whisker.rotation.z = Math.PI / 2 + (i - 1) * 0.15;
                    whisker.rotation.y = side * 0.4;
                    headGroup.add(whisker);
                });
            });
        }

        // ====================================================================
        // LEGS - Multi-segmented with joints (4 segments each)
        // ====================================================================
        const legs = [];
        const legPositions = [
            { x: -0.05, z: 0.13, front: true, spine: frontSpine },   // Front right (local to frontSpine)
            { x: -0.05, z: -0.13, front: true, spine: frontSpine },  // Front left (local to frontSpine)
            { x: 0.05, z: 0.14, front: false, spine: rearSpine }, // Back right (local to rearSpine)
            { x: 0.05, z: -0.14, front: false, spine: rearSpine } // Back left (local to rearSpine)
        ];

        legPositions.forEach((pos) => {
            // Full leg group (attached to body)
            const legGroup = new THREE.Group();
            legGroup.position.set(pos.x * scale, 0.3 * scale, pos.z * scale);
            pos.spine.add(legGroup);

            // ============ SEGMENT 1: Upper leg (thigh/shoulder) ============
            const upperLegGroup = new THREE.Group();
            legGroup.add(upperLegGroup);

            const upperLegGeo = new THREE.CapsuleGeometry(0.04 * scale, 0.12 * scale, 6, 10);
            const upperLeg = new THREE.Mesh(upperLegGeo, bodyMat);
            upperLeg.position.y = -0.08 * scale;
            upperLeg.castShadow = true;
            upperLegGroup.add(upperLeg);

            // Muscle bulge on thigh
            const muscleBulge = new THREE.Mesh(
                new THREE.SphereGeometry(0.035 * scale, 8, 8),
                bodyMat
            );
            muscleBulge.position.set(pos.front ? 0.02 : -0.02, -0.05, 0);
            muscleBulge.scale.set(1, 1.3, 0.9);
            upperLegGroup.add(muscleBulge);

            // ============ SEGMENT 2: Knee joint ============
            const kneeGroup = new THREE.Group();
            kneeGroup.position.y = -0.16 * scale;
            upperLegGroup.add(kneeGroup);

            const kneeGeo = new THREE.SphereGeometry(0.032 * scale, 8, 8);
            const knee = new THREE.Mesh(kneeGeo, bodyMat);
            kneeGroup.add(knee);

            // ============ SEGMENT 3: Lower leg (shin) ============
            const lowerLegGroup = new THREE.Group();
            kneeGroup.add(lowerLegGroup);

            const lowerLegGeo = new THREE.CapsuleGeometry(0.028 * scale, 0.1 * scale, 6, 10);
            const lowerLeg = new THREE.Mesh(lowerLegGeo, bodyMat);
            lowerLeg.position.y = -0.07 * scale;
            lowerLeg.castShadow = true;
            lowerLegGroup.add(lowerLeg);

            // ============ SEGMENT 4: Ankle joint ============
            const ankleGroup = new THREE.Group();
            ankleGroup.position.y = -0.13 * scale;
            lowerLegGroup.add(ankleGroup);

            const ankleGeo = new THREE.SphereGeometry(0.022 * scale, 8, 8);
            const ankle = new THREE.Mesh(ankleGeo, bodyMat);
            ankleGroup.add(ankle);

            // ============ SEGMENT 5: Paw with toes ============
            const pawGroup = new THREE.Group();
            ankleGroup.add(pawGroup);

            // Main paw
            const pawGeo = new THREE.SphereGeometry(0.035 * scale, 10, 10);
            const paw = new THREE.Mesh(pawGeo, bodyMat);
            paw.position.set(pos.front ? 0.02 * scale : -0.01 * scale, -0.025 * scale, 0);
            paw.scale.set(1.1, 0.5, 1.3);
            pawGroup.add(paw);

            // Toes (4 toes)
            [-0.02, -0.007, 0.007, 0.02].forEach((toeZ, toeIdx) => {
                const toeGeo = new THREE.SphereGeometry(0.012 * scale, 6, 6);
                const toe = new THREE.Mesh(toeGeo, bodyMat);
                toe.position.set(
                    pos.front ? 0.04 * scale : 0.02 * scale,
                    -0.035 * scale,
                    toeZ * scale
                );
                toe.scale.set(1.2, 0.6, 1);
                pawGroup.add(toe);

                // Claws (retractable, but visible as small tips)
                const clawGeo = new THREE.ConeGeometry(0.005 * scale, 0.015 * scale, 4);
                const claw = new THREE.Mesh(clawGeo, clawMat);
                claw.position.set(
                    pos.front ? 0.055 * scale : 0.035 * scale,
                    -0.04 * scale,
                    toeZ * scale
                );
                claw.rotation.z = -Math.PI / 2;
                pawGroup.add(claw);
            });

            // Paw pads (main pad + toe pads)
            const mainPadGeo = new THREE.SphereGeometry(0.02 * scale, 6, 6);
            const mainPad = new THREE.Mesh(mainPadGeo, pawPadMat);
            mainPad.position.set(pos.front ? 0.02 * scale : 0, -0.02 * scale, 0);
            mainPad.scale.set(1.5, 0.3, 1.2);
            pawGroup.add(mainPad);

            // Store all leg segments for animation
            legs.push({
                group: legGroup,
                upperLegGroup: upperLegGroup,
                kneeGroup: kneeGroup,
                lowerLegGroup: lowerLegGroup,
                ankleGroup: ankleGroup,
                pawGroup: pawGroup,
                isFront: pos.front,
                side: pos.z > 0 ? 'right' : 'left'
            });
        });

        model.userData.legs = legs;

        // ====================================================================
        // TAIL - Long articulated cat tail
        // ====================================================================
        const tailGroup = new THREE.Group();
        // Position relative to rearSpine (which is now at x=-0.3)
        tailGroup.position.set(-0.2 * scale, 0.4 * scale, 0); // Adjusted from -0.5 to -0.2
        rearSpine.add(tailGroup);

        // Tail segments for smooth curve and animation
        const tailSegments = [];
        const numTailSegs = 8;
        let prevSegGroup = tailGroup;

        for (let i = 0; i < numTailSegs; i++) {
            const t = i / numTailSegs;
            const segLen = 0.08 * scale;
            const segRadius = (0.035 - t * 0.025) * scale;

            const segGroup = new THREE.Group();

            const segGeo = new THREE.CapsuleGeometry(segRadius, segLen * 0.6, 6, 8);
            const seg = new THREE.Mesh(segGeo, tailMat);
            seg.castShadow = true;
            segGroup.add(seg);

            // Position relative to previous segment
            if (i === 0) {
                segGroup.position.set(-0.05 * scale, 0, 0);
                segGroup.rotation.z = -0.4;
            } else {
                segGroup.position.y = -segLen;
                segGroup.rotation.z = 0.15; // Slight curve
            }

            prevSegGroup.add(segGroup);
            prevSegGroup = segGroup;
            tailSegments.push(segGroup);
        }

        // Tail tip (tuft)
        const tailTipGeo = new THREE.SphereGeometry(0.015 * scale, 6, 6);
        const tailTip = new THREE.Mesh(tailTipGeo, tailMat);
        tailTip.position.y = -0.04 * scale;
        prevSegGroup.add(tailTip);

        model.userData.tailGroup = tailGroup;
        model.userData.tailSegments = tailSegments;

        // ====================================================================
        // STORE PARTS FOR ANIMATION
        // ====================================================================
        model.userData.parts = {
            spineGroup: spineGroup,
            frontSpine: frontSpine,
            midSpine: midSpine,
            rearSpine: rearSpine,
            headGroup: headGroup,
            chest: chest,
            midBody: midBody,
            haunch: haunch,
            tailGroup: tailGroup,
            tailSegments: tailSegments
        };

        // Animation state
        model.userData.animState = {
            runCycle: 0,
            isRunning: false,
            targetSpeed: 0,
            currentSpeed: 0
        };

        console.log('✓ Enhanced Dronglous Cat model built successfully!', legs.length, 'legs, isBaby:', isBaby);

        // Flip model to face forward
        model.rotation.y = Math.PI;

        return model;
    }

    /**
     * Animate the Dronglous Cat with cheetah-like running motion.
     * Call this every frame for smooth animation.
     * @param {THREE.Group} model - The cat model
     * @param {number} delta - Time delta
     * @param {boolean} isMoving - Whether the cat is moving
     * @param {number} speed - Current movement speed (higher = faster animation)
     */
    function animateDronglousCat(enemy, delta, isMoving, speed = 1) {
        // The actual model with parts/legs is nested inside the enemy group
        // Find it by looking for the child with userData.parts
        let catModel = enemy;
        if (!enemy.userData.parts && enemy.children.length > 0) {
            // Model is the first child of the enemy group
            catModel = enemy.children[0];
        }

        if (!catModel.userData.parts || !catModel.userData.legs) {
            return;
        }

        const parts = catModel.userData.parts;
        const legs = catModel.userData.legs;
        const anim = catModel.userData.animState;

        // Smooth speed transitions
        anim.targetSpeed = isMoving ? speed : 0;
        anim.currentSpeed += (anim.targetSpeed - anim.currentSpeed) * delta * 5;

        const animSpeed = anim.currentSpeed;

        if (animSpeed > 0.1) {
            // Running animation
            anim.runCycle += delta * animSpeed * 12; // Cycle speed based on movement

            const cycle = anim.runCycle;
            const intensity = Math.min(animSpeed / 8, 1); // Scale with speed

            // ============ SPINE BENDING (Cheetah-like) ============
            // The spine compresses and extends during the gallop - DRAMATIC BENDING!
            // Use rotation.X for up/down arching (cheetah gallop motion)
            const spineBend = Math.sin(cycle * 2) * 0.8 * intensity; // BIG value for visible bending

            // Front spine arches UP when extending (shoulders lift)
            parts.frontSpine.rotation.x = spineBend * 0.6; // UP/DOWN rotation
            parts.frontSpine.position.y = Math.sin(cycle * 2) * 0.08 * intensity; // Bob up/down

            // Mid spine does the MAIN bending - THIS IS THE KEY TO CHEETAH GALLOP
            // Arches DOWN when front goes up (creates the characteristic C-shape)
            parts.midSpine.rotation.x = -spineBend * 0.8; // OPPOSITE direction for C-curve
            parts.midSpine.position.y = Math.sin(cycle * 2 + Math.PI) * 0.1 * intensity; // Big vertical movement

            // Rear spine arches UP when extending (haunches compress/extend)
            parts.rearSpine.rotation.x = spineBend * 0.7; // UP/DOWN rotation
            parts.rearSpine.position.y = Math.sin(cycle * 2 + Math.PI) * 0.06 * intensity; // Bob up/down

            // ============ HEAD BOB ============
            parts.headGroup.rotation.x = Math.sin(cycle * 2) * 0.1 * intensity;
            parts.headGroup.position.y = 0.5 + Math.sin(cycle * 2) * 0.02 * intensity;

            // ============ LEG ANIMATION (Gallop pattern) ============
            legs.forEach((leg, idx) => {
                // Gallop: front legs move together, back legs move together
                // But with a phase offset between front and back
                const legPhase = leg.isFront ? 0 : Math.PI;
                const sidePhase = leg.side === 'right' ? 0.3 : -0.3;

                const legCycle = cycle + legPhase + sidePhase;

                // Upper leg swings forward/back
                const upperSwing = Math.sin(legCycle) * 0.6 * intensity;
                leg.upperLegGroup.rotation.x = upperSwing;

                // Knee bends more when leg is lifting
                const kneeBend = Math.max(0, Math.sin(legCycle + 0.5)) * 0.8 * intensity;
                leg.kneeGroup.rotation.x = kneeBend;

                // Lower leg follows through
                const lowerSwing = Math.sin(legCycle + 1) * 0.4 * intensity;
                leg.lowerLegGroup.rotation.x = lowerSwing + kneeBend * 0.5;

                // Ankle flexes for paw placement
                const ankleFlex = Math.sin(legCycle + 1.5) * 0.3 * intensity;
                leg.ankleGroup.rotation.x = -ankleFlex;

                // Paw extends on push-off
                leg.pawGroup.rotation.x = Math.sin(legCycle + 2) * 0.2 * intensity;
            });

            // ============ TAIL ANIMATION ============
            // Tail acts as counterbalance, waves opposite to body motion
            if (parts.tailSegments) {
                parts.tailSegments.forEach((seg, i) => {
                    const tailPhase = cycle + i * 0.3;
                    const waveAmount = 0.15 + i * 0.05;
                    seg.rotation.x = Math.sin(tailPhase) * waveAmount * intensity;
                    seg.rotation.z = 0.15 + Math.cos(tailPhase * 0.7) * 0.1 * intensity;
                });
            }

        } else {
            // Idle animation - gentle breathing and tail swish
            anim.runCycle += delta * 2;
            const idleCycle = anim.runCycle;

            // Reset spine to neutral (use same axes as running animation!)
            parts.frontSpine.rotation.x *= 0.9;
            parts.frontSpine.position.y *= 0.9;
            parts.midSpine.rotation.x *= 0.9;
            parts.midSpine.position.y *= 0.9;
            parts.rearSpine.rotation.x *= 0.9;
            parts.rearSpine.position.y *= 0.9;

            // Subtle breathing
            const breathe = Math.sin(idleCycle) * 0.02;
            parts.chest.scale.y = 0.95 + breathe;
            parts.midBody.scale.y = 1 + breathe * 0.5;

            // Head slight movement
            parts.headGroup.rotation.x *= 0.95;
            parts.headGroup.rotation.y = Math.sin(idleCycle * 0.5) * 0.05;

            // Reset legs smoothly
            legs.forEach(leg => {
                leg.upperLegGroup.rotation.x *= 0.9;
                leg.kneeGroup.rotation.x *= 0.9;
                leg.lowerLegGroup.rotation.x *= 0.9;
                leg.ankleGroup.rotation.x *= 0.9;
                leg.pawGroup.rotation.x *= 0.9;
            });

            // Gentle tail swish
            if (parts.tailSegments) {
                parts.tailSegments.forEach((seg, i) => {
                    const swish = Math.sin(idleCycle * 0.8 + i * 0.4) * 0.1;
                    seg.rotation.x = swish;
                    seg.rotation.z = 0.15 + Math.sin(idleCycle * 0.5 + i * 0.2) * 0.08;
                });
            }
        }
    }

    // ========================================================================
    // MODEL BUILDERS REGISTRY
    // ========================================================================
    // Maps animal type names to their builder functions.
    // To add a new animal: add the builder function above, then register here.

    const modelBuilders = {
        badger: buildBadgerModel,
        weasel: buildWeaselModel,
        goose: buildGooseModel,
        fox: buildFoxModel,
        leopard_toad: buildLeopardToadModel,
        grass_viper: buildGrassViperModel,
        antelope: buildAntelopeModel,
        wild_dog: buildWildDogModel,
        saltas_gazella: buildSaltasGazellaModel,
        dronglous_cat: buildDronglousCatModel
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
        // Pass isBaby flag for models that support it (like dronglous_cat)
        const isBaby = enemyData.isBaby || false;
        const model = builder(enemyData.colors, isBaby);

        // Apply size modifier (default to 1 if not specified)
        const size = enemyData.size || 1;
        model.scale.set(size, size, size);

        enemy.add(model);

        // Get groundY from enemy data (default 0.3 for most animals)
        const groundY = enemyData.groundY !== undefined ? enemyData.groundY : 0.3;

        // Position the enemy using terrain height + groundY offset
        const terrainY = Environment.getTerrainHeight(x, z);
        enemy.position.set(x, terrainY + groundY, z);

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
            minimapColor: enemyData.minimapColor,
            groundY: groundY,                 // Store for later use in updateEnemies
            // Behavior flags from data
            friendly: enemyData.friendly || false,
            attacksEnemies: enemyData.attacksEnemies || false,
            attackRange: enemyData.attackRange || 0,
            immuneToWater: enemyData.immuneToWater || false
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
        // Filter enemies that can actually spawn (spawnWeight > 0)
        // Enemies with spawnWeight: 0 are spawned by special functions, not randomly
        const spawnableEnemies = ENEMIES.filter(e =>
            e.spawnWeight !== undefined && e.spawnWeight > 0
        );

        if (spawnableEnemies.length === 0) {
            return ENEMIES[0]; // Fallback
        }

        // Calculate total weight
        let totalWeight = 0;
        for (let i = 0; i < spawnableEnemies.length; i++) {
            totalWeight += spawnableEnemies[i].spawnWeight;
        }

        // Pick a random point in the total weight
        let random = Math.random() * totalWeight;

        // Find which enemy that point falls into
        for (let i = 0; i < spawnableEnemies.length; i++) {
            const weight = spawnableEnemies[i].spawnWeight;
            if (random < weight) {
                return spawnableEnemies[i];
            }
            random -= weight;
        }

        // Fallback (shouldn't happen)
        return spawnableEnemies[0];
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

    /**
     * Spawn a specific enemy type at a given position (testing mode).
     * @param {string} animalType - The base animal type (e.g., 'goose', 'leopard_toad')
     * @param {string} variant - The variant ('male', 'female', 'baby', 'alpha', 'leader', 'default')
     * @param {number} x - X position
     * @param {number} z - Z position
     * @returns {THREE.Group|null} - The spawned enemy or null
     */
    function spawnSpecificEnemy(animalType, variant, x, z) {
        // Build the enemy ID based on type and variant
        let enemyId;

        if (variant === 'default' || variant === undefined) {
            enemyId = animalType;
        } else if (variant === 'baby') {
            // Babies have different naming patterns
            if (animalType === 'wild_dog') {
                enemyId = 'wild_dog_pup_male'; // Default to male pup
            } else if (animalType === 'goose') {
                enemyId = 'goose_baby';
            } else {
                // Try baby_male first, then just the type
                enemyId = animalType + '_baby_male';
                if (!ENEMIES.find(e => e.id === enemyId)) {
                    enemyId = animalType + '_baby';
                }
            }
        } else if (variant === 'leader') {
            enemyId = animalType + '_leader';
        } else if (variant === 'alpha') {
            enemyId = animalType + '_alpha';
        } else {
            // male, female variants
            enemyId = animalType + '_' + variant;
        }

        // Find the enemy data
        let enemyData = ENEMIES.find(e => e.id === enemyId);

        // Fallback: try without variant
        if (!enemyData) {
            enemyData = ENEMIES.find(e => e.id === animalType);
        }

        if (!enemyData) {
            console.warn('Enemy data not found for:', enemyId, 'or', animalType);
            return null;
        }

        // Create the enemy
        const enemy = createEnemy(enemyData, x, z);

        if (enemy) {
            // Set variant-specific data
            enemy.userData.gender = variant === 'male' ? 'male' : (variant === 'female' ? 'female' : null);
            enemy.userData.isBaby = variant === 'baby';
            enemy.userData.isLeader = variant === 'leader';
            enemy.userData.isAlpha = variant === 'alpha';

            // Add lifecycle state based on animal type
            if (animalType === 'goose') {
                enemy.userData.lifecycleState = 'idle';
            } else if (animalType === 'leopard_toad') {
                enemy.userData.lifecycleState = 'idle';
            } else if (animalType === 'grass_viper') {
                enemy.userData.lifecycleState = 'idle';
            } else if (animalType === 'antelope') {
                enemy.userData.lifecycleState = 'grazing';
            } else if (animalType === 'wild_dog') {
                enemy.userData.lifecycleState = 'resting';
            } else if (animalType === 'saltas_gazella') {
                enemy.userData.lifecycleState = 'grazing';
                enemy.userData.isRideable = true;
            }

            GameState.enemies.push(enemy);
            GameState.scene.add(enemy);
            return enemy;
        }

        return null;
    }

    // ========================================================================
    // SPAWN GEESE ON RIVERBANK
    // ========================================================================
    /**
     * Spawn geese along the riverbank at game start.
     * Geese are friendly and attack hostile enemies that come near.
     * @param {number} count - Number of geese to spawn
     */
    function spawnGeese(count) {
        // Find goose data in ENEMIES array
        const gooseData = ENEMIES.find(e => e.id === 'goose');
        if (!gooseData) {
            console.warn('No goose enemy data found');
            return;
        }

        let spawned = 0;
        let attempts = 0;
        const maxAttempts = count * 20;

        while (spawned < count && attempts < maxAttempts) {
            attempts++;

            // Pick a random position near the river
            const worldSize = CONFIG.WORLD_SIZE;
            const x = (Math.random() - 0.5) * worldSize * 0.8;
            const z = (Math.random() - 0.5) * worldSize * 0.8;

            // Check if on riverbank (near river but not in it)
            if (Environment.isOnRiverbank && Environment.isOnRiverbank(x, z)) {
                const goose = createEnemy(gooseData, x, z);
                if (goose) {
                    // Assign unique entity ID and lifecycle state
                    goose.userData.entityId = 'goose_' + Date.now() + '_' + Math.random();
                    goose.userData.lifecycleState = 'finding_nest';
                    goose.userData.stateTimer = 0;
                    goose.userData.targetNestPos = null;
                    goose.userData.nestId = null;

                    GameState.enemies.push(goose);
                    GameState.scene.add(goose);
                    spawned++;
                }
            }
        }

        console.log('Spawned', spawned, 'geese on riverbank');
    }

    // ========================================================================
    // SPAWN TOADS AT WATERING HOLE (SAVANNAH BIOME)
    // ========================================================================
    /**
     * Spawn leopard toads near the watering hole in savannah biome.
     * Spawns half males (yellow) and half females (black).
     * @param {number} count - Total number of toads to spawn
     */
    function spawnToads(count) {
        // Find male and female toad data in ENEMIES array
        const maleData = ENEMIES.find(e => e.id === 'leopard_toad_male');
        const femaleData = ENEMIES.find(e => e.id === 'leopard_toad_female');

        if (!maleData || !femaleData) {
            console.warn('Leopard toad data not found in ENEMIES array');
            return;
        }

        // Get watering hole position from biome data
        const biomeData = getBiomeData('savannah');
        const holePos = biomeData.wateringHolePosition || { x: 0, z: 0 };
        const holeRadius = biomeData.wateringHoleRadius || 7.5;

        // Spawn half male, half female
        const maleCount = Math.floor(count / 2);
        const femaleCount = count - maleCount;

        let spawned = 0;

        // Spawn males
        for (let i = 0; i < maleCount; i++) {
            // Random position near watering hole (within 10 units)
            const angle = Math.random() * Math.PI * 2;
            const dist = holeRadius + 1 + Math.random() * 3;  // Just outside the water
            const x = holePos.x + Math.cos(angle) * dist;
            const z = holePos.z + Math.sin(angle) * dist;

            const toad = createEnemy(maleData, x, z);
            if (toad) {
                // Set up toad userData
                toad.userData.entityId = 'toad_' + Date.now() + '_' + Math.random();
                toad.userData.gender = 'male';
                toad.userData.lifecycleState = 'hopping';
                toad.userData.hopTimer = Math.random() * 2;  // Stagger initial hops
                toad.userData.hopPhase = 'grounded';
                toad.userData.hopTarget = null;
                toad.userData.homePosition = { x: holePos.x, z: holePos.z };
                toad.userData.maxRangeFromHome = 10;

                GameState.enemies.push(toad);
                GameState.scene.add(toad);
                spawned++;
            }
        }

        // Spawn females
        for (let i = 0; i < femaleCount; i++) {
            // Random position near watering hole (within 10 units)
            const angle = Math.random() * Math.PI * 2;
            const dist = holeRadius + 1 + Math.random() * 3;
            const x = holePos.x + Math.cos(angle) * dist;
            const z = holePos.z + Math.sin(angle) * dist;

            const toad = createEnemy(femaleData, x, z);
            if (toad) {
                // Set up toad userData
                toad.userData.entityId = 'toad_' + Date.now() + '_' + Math.random();
                toad.userData.gender = 'female';
                toad.userData.lifecycleState = 'hopping';
                toad.userData.hopTimer = Math.random() * 2;
                toad.userData.hopPhase = 'grounded';
                toad.userData.hopTarget = null;
                toad.userData.homePosition = { x: holePos.x, z: holePos.z };
                toad.userData.maxRangeFromHome = 10;
                toad.userData.canLayEggs = true;

                GameState.enemies.push(toad);
                GameState.scene.add(toad);
                spawned++;
            }
        }

        console.log('Spawned', spawned, 'leopard toads near watering hole (' + maleCount + ' male, ' + femaleCount + ' female)');
    }

    // ========================================================================
    // SPAWN GRASS VIPER WEASELS (SAVANNAH BIOME)
    // ========================================================================
    /**
     * Spawn grass viper weasels in the savannah biome.
     * Spawns half males (black) and half females (grey).
     * @param {number} count - Total number of grass vipers to spawn
     */
    function spawnGrassVipers(count) {
        // Find male and female grass viper data in ENEMIES array
        const maleData = ENEMIES.find(e => e.id === 'grass_viper_male');
        const femaleData = ENEMIES.find(e => e.id === 'grass_viper_female');

        if (!maleData || !femaleData) {
            console.warn('Grass viper weasel data not found in ENEMIES array');
            return;
        }

        // Spawn half male, half female
        const maleCount = Math.floor(count / 2);
        const femaleCount = count - maleCount;

        let spawned = 0;
        const worldSize = CONFIG.WORLD_SIZE;

        // Spawn males - at west border of savannah
        for (let i = 0; i < maleCount; i++) {
            // West border position (negative X, random Z)
            const x = -worldSize * 0.5 + Math.random() * 5;  // West edge
            const z = (Math.random() - 0.5) * worldSize * 0.6;  // Random along border

            const viper = createEnemy(maleData, x, z);
            if (viper) {
                // Set up grass viper userData
                viper.userData.entityId = 'viper_' + Date.now() + '_' + Math.random();
                viper.userData.gender = 'male';
                viper.userData.lifecycleState = 'hunting';
                viper.userData.huntTarget = null;
                viper.userData.stalkTimer = 0;
                viper.userData.isCreeping = false;
                viper.userData.hasSpottedToad = false;
                viper.userData.heldToad = null;  // For when carrying a toad in mouth

                GameState.enemies.push(viper);
                GameState.scene.add(viper);
                spawned++;
            }
        }

        // Spawn females - also at west border of savannah
        for (let i = 0; i < femaleCount; i++) {
            // West border position (negative X, random Z)
            const x = -worldSize * 0.5 + Math.random() * 5;  // West edge
            const z = (Math.random() - 0.5) * worldSize * 0.6;  // Random along border

            const viper = createEnemy(femaleData, x, z);
            if (viper) {
                // Set up grass viper userData
                viper.userData.entityId = 'viper_' + Date.now() + '_' + Math.random();
                viper.userData.gender = 'female';
                viper.userData.lifecycleState = 'hunting';
                viper.userData.huntTarget = null;
                viper.userData.stalkTimer = 0;
                viper.userData.isCreeping = false;
                viper.userData.hasSpottedToad = false;
                viper.userData.heldToad = null;

                // Female-specific properties
                viper.userData.isPregnant = false;
                viper.userData.gestationTimer = 0;
                viper.userData.babyViper = null;

                GameState.enemies.push(viper);
                GameState.scene.add(viper);
                spawned++;
            }
        }

        console.log('Spawned', spawned, 'grass viper weasels (' + maleCount + ' male, ' + femaleCount + ' female)');
    }

    // ========================================================================
    // SPAWN ANTELOPE HERD (SAVANNAH BIOME)
    // ========================================================================
    /**
     * Spawn a herd of New World Rhubarb Antelope at the east border.
     * One random male is chosen as the herd leader (larger horns).
     * @param {number} count - Total number of antelope to spawn (half male, half female)
     */
    function spawnAntelopeHerd(count) {
        // Find male and female antelope data
        const maleData = ENEMIES.find(e => e.id === 'antelope_male');
        const femaleData = ENEMIES.find(e => e.id === 'antelope_female');

        if (!maleData || !femaleData) {
            console.warn('Antelope data not found in ENEMIES array');
            return;
        }

        const worldSize = CONFIG.WORLD_SIZE;
        const maleCount = Math.floor(count / 2);
        const femaleCount = count - maleCount;

        // Generate a unique herd ID
        const herdId = 'herd_' + Date.now();

        // East border spawn position (positive X)
        const herdCenterX = worldSize * 0.45;
        const herdCenterZ = (Math.random() - 0.5) * worldSize * 0.4;

        let spawned = 0;
        const herdMembers = [];

        // Spawn males first
        for (let i = 0; i < maleCount; i++) {
            // Spawn near herd center at east border
            const x = herdCenterX + (Math.random() - 0.5) * 10;
            const z = herdCenterZ + (Math.random() - 0.5) * 10;

            // Create the antelope - first male will be leader (larger horns)
            const isLeader = (i === 0);
            const hornScale = isLeader ? 1.5 : 1;

            // Build custom model with appropriate horn size
            const model = buildAntelopeModel(maleData.colors, true, hornScale, false);
            const antelope = new THREE.Group();
            antelope.add(model);
            antelope.scale.set(maleData.size, maleData.size, maleData.size);
            antelope.position.set(x, 0, z);

            // Set up antelope userData
            antelope.userData = {
                id: isLeader ? 'antelope_leader' : 'antelope_male',
                type: 'antelope',
                entityId: 'antelope_' + Date.now() + '_' + Math.random(),
                gender: 'male',
                speed: maleData.speed + Math.random() * (maleData.speedVariation || 0),
                damage: maleData.damage,
                radius: maleData.radius,
                health: maleData.health,
                maxHealth: maleData.health,
                friendly: true,
                defensive: true,
                minimapColor: maleData.minimapColor,

                // Herd properties
                herdId: herdId,
                isLeader: isLeader,
                isHerdAnimal: true,
                leader: null,  // Will be set after spawning

                // Behavior state
                lifecycleState: 'grazing',
                isGrazing: false,
                grazeTimer: Math.random() * 5,
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,

                // Lineage tracking
                fatherWasLeader: false,
                children: []
            };

            GameState.enemies.push(antelope);
            GameState.scene.add(antelope);
            herdMembers.push(antelope);
            spawned++;

            if (isLeader) {
                console.log('Antelope herd leader spawned with large horns!');
            }
        }

        // Spawn females
        for (let i = 0; i < femaleCount; i++) {
            const x = herdCenterX + (Math.random() - 0.5) * 10;
            const z = herdCenterZ + (Math.random() - 0.5) * 10;

            // Build female model (no horns)
            const model = buildAntelopeModel(femaleData.colors, false, 1, false);
            const antelope = new THREE.Group();
            antelope.add(model);
            antelope.scale.set(femaleData.size, femaleData.size, femaleData.size);
            antelope.position.set(x, 0, z);

            antelope.userData = {
                id: 'antelope_female',
                type: 'antelope',
                entityId: 'antelope_' + Date.now() + '_' + Math.random(),
                gender: 'female',
                speed: femaleData.speed + Math.random() * (femaleData.speedVariation || 0),
                damage: femaleData.damage,
                radius: femaleData.radius,
                health: femaleData.health,
                maxHealth: femaleData.health,
                friendly: true,
                defensive: true,
                minimapColor: femaleData.minimapColor,

                // Herd properties
                herdId: herdId,
                isLeader: false,
                isHerdAnimal: true,
                leader: null,

                // Female-specific
                canGetPregnant: true,
                isPregnant: false,
                gestationTimer: 0,

                // Behavior state
                lifecycleState: 'grazing',
                isGrazing: false,
                grazeTimer: Math.random() * 5,
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,

                // Lineage tracking
                fatherWasLeader: false,
                children: []
            };

            GameState.enemies.push(antelope);
            GameState.scene.add(antelope);
            herdMembers.push(antelope);
            spawned++;
        }

        // Set leader reference for all herd members
        const leader = herdMembers.find(a => a.userData.isLeader);
        if (leader) {
            herdMembers.forEach(member => {
                member.userData.leader = leader;
            });
        }

        // Store herd info in GameState
        if (!GameState.antelopeHerds) {
            GameState.antelopeHerds = [];
        }
        GameState.antelopeHerds.push({
            id: herdId,
            leader: leader,
            members: herdMembers,
            maxSize: 16
        });

        console.log('Spawned antelope herd:', spawned, 'members (' + maleCount + ' male, ' + femaleCount + ' female) - Herd ID:', herdId);
    }

    // ========================================================================
    // SPAWN SALTAS GAZELLA HERD (SAVANNAH BIOME)
    // ========================================================================
    /**
     * Spawn a herd of Saltas Gazella (fastest animals in the game).
     * Springbok-like, rideable with saddle, hunted by wild dogs.
     * @param {number} count - Total number of gazella (half male, half female)
     */
    function spawnSaltasGazellaHerd(count) {
        const maleData = ENEMIES.find(e => e.id === 'saltas_gazella_male');
        const femaleData = ENEMIES.find(e => e.id === 'saltas_gazella_female');

        if (!maleData || !femaleData) {
            console.warn('Saltas Gazella data not found in ENEMIES array');
            return;
        }

        const worldSize = CONFIG.WORLD_SIZE;
        const maleCount = Math.floor(count / 2);
        const femaleCount = count - maleCount;

        const herdId = 'gazella_herd_' + Date.now();

        // Spawn at south border (different from antelope at east)
        const herdCenterX = (Math.random() - 0.5) * worldSize * 0.4;
        const herdCenterZ = worldSize * 0.4;

        let spawned = 0;
        const herdMembers = [];

        // Spawn males
        for (let i = 0; i < maleCount; i++) {
            const x = herdCenterX + (Math.random() - 0.5) * 12;
            const z = herdCenterZ + (Math.random() - 0.5) * 12;

            const isLeader = (i === 0);
            const model = buildSaltasGazellaModel(maleData.colors, true, false, false, null);
            const gazella = new THREE.Group();
            gazella.add(model);
            gazella.scale.set(maleData.size, maleData.size, maleData.size);
            gazella.position.set(x, 0, z);

            gazella.userData = {
                id: isLeader ? 'saltas_gazella_leader' : 'saltas_gazella_male',
                type: 'saltas_gazella',
                entityId: 'gazella_' + Date.now() + '_' + Math.random(),
                gender: 'male',
                speed: maleData.speed + Math.random() * (maleData.speedVariation || 0),
                fleeSpeed: maleData.fleeSpeed,  // VERY fast when hunted!
                damage: maleData.damage,
                radius: maleData.radius,
                health: maleData.health,
                maxHealth: maleData.health,
                friendly: true,
                defensive: true,
                minimapColor: maleData.minimapColor,

                // Herd properties
                herdId: herdId,
                isLeader: isLeader,
                isHerdAnimal: true,
                leader: null,

                // Behavior state
                lifecycleState: 'grazing',
                isGrazing: false,
                grazeTimer: Math.random() * 5,
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,

                // Riding
                isRideable: true,
                isBeingRidden: false
            };

            GameState.enemies.push(gazella);
            GameState.scene.add(gazella);
            herdMembers.push(gazella);
            spawned++;

            if (isLeader) {
                console.log('Saltas Gazella herd leader spawned!');
            }
        }

        // Spawn females
        for (let i = 0; i < femaleCount; i++) {
            const x = herdCenterX + (Math.random() - 0.5) * 12;
            const z = herdCenterZ + (Math.random() - 0.5) * 12;

            const model = buildSaltasGazellaModel(femaleData.colors, true, false, false, null);
            const gazella = new THREE.Group();
            gazella.add(model);
            gazella.scale.set(femaleData.size, femaleData.size, femaleData.size);
            gazella.position.set(x, 0, z);

            gazella.userData = {
                id: 'saltas_gazella_female',
                type: 'saltas_gazella',
                entityId: 'gazella_' + Date.now() + '_' + Math.random(),
                gender: 'female',
                speed: femaleData.speed + Math.random() * (femaleData.speedVariation || 0),
                fleeSpeed: femaleData.fleeSpeed,
                damage: femaleData.damage,
                radius: femaleData.radius,
                health: femaleData.health,
                maxHealth: femaleData.health,
                friendly: true,
                defensive: true,
                minimapColor: femaleData.minimapColor,

                // Herd properties
                herdId: herdId,
                isLeader: false,
                isHerdAnimal: true,
                leader: null,

                // Female-specific
                canGetPregnant: true,
                isPregnant: false,
                gestationTimer: 0,

                // Behavior state
                lifecycleState: 'grazing',
                isGrazing: false,
                grazeTimer: Math.random() * 5,
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,

                // Riding
                isRideable: true,
                isBeingRidden: false
            };

            GameState.enemies.push(gazella);
            GameState.scene.add(gazella);
            herdMembers.push(gazella);
            spawned++;
        }

        // Set leader reference
        const leader = herdMembers.find(g => g.userData.isLeader);
        if (leader) {
            herdMembers.forEach(member => {
                member.userData.leader = leader;
            });
        }

        // Store herd in GameState
        if (!GameState.saltasGazellaHerds) {
            GameState.saltasGazellaHerds = [];
        }
        GameState.saltasGazellaHerds.push({
            id: herdId,
            leader: leader,
            members: herdMembers,
            maxSize: 12
        });

        console.log('Spawned Saltas Gazella herd:', spawned, 'members (' + maleCount + ' male, ' + femaleCount + ' female)');
    }

    // ========================================================================
    // SPAWN WILD DOG PACK (SAVANNAH BIOME)
    // ========================================================================
    /**
     * Spawn a pack of New World Hunter's Wild Dogs at the west border.
     * The first FEMALE becomes the alpha (golden yellow, pack leader).
     * One male becomes the alpha's mate.
     * @param {number} count - Total number of wild dogs (half male, half female)
     */
    function spawnWildDogPack(count) {
        // Find wild dog data
        const maleData = ENEMIES.find(e => e.id === 'wild_dog_male');
        const femaleData = ENEMIES.find(e => e.id === 'wild_dog_female');
        const alphaData = ENEMIES.find(e => e.id === 'wild_dog_alpha');

        if (!maleData || !femaleData || !alphaData) {
            console.warn('Wild dog data not found in ENEMIES array');
            return;
        }

        const worldSize = CONFIG.WORLD_SIZE;
        const maleCount = Math.floor(count / 2);
        const femaleCount = count - maleCount;

        // Generate unique pack ID
        const packId = 'pack_' + Date.now();

        // West border spawn position (negative X, opposite from antelope)
        const packCenterX = -worldSize * 0.35;
        const packCenterZ = (Math.random() - 0.5) * worldSize * 0.4;

        const packMembers = [];
        let alpha = null;
        let alphaMate = null;

        // Spawn females first (first female is alpha!)
        for (let i = 0; i < femaleCount; i++) {
            const x = packCenterX + (Math.random() - 0.5) * 8;
            const z = packCenterZ + (Math.random() - 0.5) * 8;

            const isAlpha = (i === 0);  // First female is alpha!
            const dogData = isAlpha ? alphaData : femaleData;

            // Build model
            const model = buildWildDogModel(dogData.colors, isAlpha, false);
            const dog = new THREE.Group();
            dog.add(model);
            dog.scale.set(dogData.size, dogData.size, dogData.size);
            dog.position.set(x, 0, z);

            dog.userData = {
                id: dogData.id,
                type: 'wild_dog',
                entityId: 'wilddog_' + Date.now() + '_' + Math.random(),
                gender: 'female',
                speed: dogData.speed + Math.random() * (dogData.speedVariation || 0),
                damage: dogData.damage,
                radius: dogData.radius,
                health: dogData.health,
                maxHealth: dogData.health,
                friendly: true,
                defensive: false,
                minimapColor: dogData.minimapColor,

                // Pack properties
                packId: packId,
                isAlpha: isAlpha,
                isAlphaMate: false,
                alpha: null,  // Set after spawning
                isPackAnimal: true,

                // Female-specific
                canGetPregnant: true,
                isPregnant: false,
                gestationTimer: 0,
                isMother: false,
                denId: null,
                pups: [],

                // Behavior state
                lifecycleState: 'following',
                isGrazing: false,
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,

                // Hunting
                isHunting: false,
                huntTarget: null,

                // Animation
                walkPhase: Math.random() * Math.PI * 2,

                // Lineage
                children: []
            };

            GameState.enemies.push(dog);
            GameState.scene.add(dog);
            packMembers.push(dog);

            if (isAlpha) {
                alpha = dog;
                console.log('Wild dog ALPHA FEMALE spawned (golden yellow)!');
            }
        }

        // Spawn males
        for (let i = 0; i < maleCount; i++) {
            const x = packCenterX + (Math.random() - 0.5) * 8;
            const z = packCenterZ + (Math.random() - 0.5) * 8;

            const isAlphaMate = (i === 0);  // First male is alpha's mate

            const model = buildWildDogModel(maleData.colors, false, false);
            const dog = new THREE.Group();
            dog.add(model);
            dog.scale.set(maleData.size, maleData.size, maleData.size);
            dog.position.set(x, 0, z);

            dog.userData = {
                id: maleData.id,
                type: 'wild_dog',
                entityId: 'wilddog_' + Date.now() + '_' + Math.random(),
                gender: 'male',
                speed: maleData.speed + Math.random() * (maleData.speedVariation || 0),
                damage: maleData.damage,
                radius: maleData.radius,
                health: maleData.health,
                maxHealth: maleData.health,
                friendly: true,
                defensive: false,
                minimapColor: maleData.minimapColor,

                // Pack properties
                packId: packId,
                isAlpha: false,
                isAlphaMate: isAlphaMate,
                alpha: null,
                isPackAnimal: true,

                // Behavior state
                lifecycleState: 'following',
                isGrazing: false,
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,

                // Hunting
                isHunting: false,
                huntTarget: null,

                // Animation
                walkPhase: Math.random() * Math.PI * 2,

                // Lineage
                children: []
            };

            GameState.enemies.push(dog);
            GameState.scene.add(dog);
            packMembers.push(dog);

            if (isAlphaMate) {
                alphaMate = dog;
                console.log('Wild dog alpha mate spawned (brown male)!');
            }
        }

        // Set alpha reference for all pack members
        if (alpha) {
            packMembers.forEach(member => {
                member.userData.alpha = alpha;
            });
        }

        // Store pack info in GameState
        if (!GameState.wildDogPacks) {
            GameState.wildDogPacks = [];
        }
        GameState.wildDogPacks.push({
            id: packId,
            alpha: alpha,
            alphaMate: alphaMate,
            members: packMembers,
            maxSize: 12,
            den: null,
            currentHunt: null,
            homePosition: { x: packCenterX, z: packCenterZ }
        });

        console.log('Spawned wild dog pack:', packMembers.length, 'members (' + maleCount + ' male, ' + femaleCount + ' female) - Pack ID:', packId);
    }

    // ========================================================================
    // NEST SYSTEM
    // ========================================================================
    /**
     * Create a nest at the specified position.
     * @param {number} x - X position
     * @param {number} z - Z position
     * @returns {Object} - Nest object with mesh and metadata
     */
    function createNest(x, z) {
        const nest = new THREE.Group();

        // Create twig circle (nest base) - much larger for visibility
        const twigMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const radius = 1.5; // Increased from 0.5
            const twig = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), // Increased from 0.02, 0.3
                twigMat
            );
            twig.position.set(
                Math.cos(angle) * radius,
                0.3, // Raised up
                Math.sin(angle) * radius
            );
            twig.rotation.y = angle;
            twig.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            twig.castShadow = true;
            nest.add(twig);
        }

        // Add moss lining inside nest - much larger
        const mossMat = new THREE.MeshStandardMaterial({ color: 0x6b8e23 });
        const moss = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 16, 16), // Increased from 0.3
            mossMat
        );
        moss.scale.set(1, 0.3, 1);
        moss.position.y = 0.2;
        moss.castShadow = true;
        nest.add(moss);

        nest.position.set(x, 0, z);

        // Create nest object
        const nestObj = {
            mesh: nest,
            position: { x: x, z: z },
            id: 'nest_' + Date.now() + '_' + Math.random(),
            ownerId: null,  // Will be set when goose claims it
            egg: {
                exists: false,
                timePlaced: 0,
                hatchTime: 0,
                mesh: null
            },
            state: 'empty'
        };

        return nestObj;
    }

    /**
     * Update all nests - check for egg hatching.
     * @param {number} delta - Time since last frame
     */
    function updateNests(delta) {
        const currentTime = GameState.clock.elapsedTime;

        for (let i = GameState.nests.length - 1; i >= 0; i--) {
            const nest = GameState.nests[i];

            // Check if egg is ready to hatch
            if (nest.egg.exists && currentTime >= nest.egg.hatchTime) {
                hatchEgg(nest, i);
            }
        }
    }

    /**
     * Hatch an egg into a baby goose.
     * @param {Object} nest - The nest containing the egg
     * @param {number} nestIndex - Index of nest in GameState.nests
     */
    function hatchEgg(nest, nestIndex) {
        // Remove egg mesh from scene
        if (nest.egg.mesh) {
            GameState.scene.remove(nest.egg.mesh);
            GameState.resources = GameState.resources.filter(r => r !== nest.egg.mesh);
        }

        // Find goose data for creating baby
        const gooseData = ENEMIES.find(e => e.id === 'goose');
        if (!gooseData) return;

        // Create baby goose at nest position
        const baby = createEnemy(gooseData, nest.position.x, nest.position.z);
        if (!baby) return;

        // Configure as baby
        baby.userData.lifecycleState = 'baby';
        baby.userData.size = 0.6;
        baby.userData.health = 12;
        baby.userData.maxHealth = 12;
        baby.scale.set(0.6, 0.6, 0.6);
        baby.userData.parentId = nest.ownerId;
        baby.userData.birthTime = GameState.clock.elapsedTime;
        baby.userData.maturityTime = GameState.clock.elapsedTime + 120; // 2 minutes
        baby.userData.entityId = 'baby_goose_' + Date.now() + '_' + Math.random();
        baby.userData.isBaby = true; // Mark as baby for predator targeting

        // Make baby goose grey by changing material colors
        baby.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.color) {
                    // Change to grey tones
                    const currentColor = child.material.color.getHex();
                    // If it's a body part (not beak or legs which are orange)
                    if (currentColor !== 0xff8c00) {
                        child.material.color.setHex(0x999999); // Medium grey
                    }
                }
            }
        });

        // Add to game
        GameState.enemies.push(baby);
        GameState.scene.add(baby);

        // Mark parent as having offspring (double detection range)
        const parent = GameState.enemies.find(e => e.userData.entityId === nest.ownerId);
        if (parent) {
            parent.userData.hasOffspring = true;
        }

        // Reset nest state
        nest.egg.exists = false;
        nest.egg.mesh = null;
        nest.state = 'empty';
        nest.ownerId = null;

        console.log('Baby goose hatched at nest', nest.id);
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
        let closestHostile = Infinity;

        for (let i = GameState.enemies.length - 1; i >= 0; i--) {
            const enemy = GameState.enemies[i];

            // Skip enemies that manage their own Y position (tree dwellers, flying animals, etc)
            // These animals have custom update functions and shouldn't be forced to ground
            if (enemy.userData.ignoreGravity) {
                continue;
            }

            const distance = enemy.position.distanceTo(GameState.peccary.position);

            // Track closest hostile enemy for warning indicator
            if (!enemy.userData.friendly) {
                closestHostile = Math.min(closestHostile, distance);
            }
            closestDistance = Math.min(closestDistance, distance);

            // Check if enemy is in water
            const inWater = Environment.isInRiver(enemy.position.x, enemy.position.z);
            enemy.userData.inWater = inWater;

            // Initialize wander direction if not set
            if (!enemy.userData.wanderDir) {
                const angle = Math.random() * Math.PI * 2;
                enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                enemy.userData.wanderTime = 0;
            }

            let direction = enemy.userData.wanderDir; // Default to wander direction
            let speed = enemy.userData.speed * 0.5;

            // Goose lifecycle state machine
            if (enemy.userData.id === 'goose' && enemy.userData.lifecycleState) {
                const state = enemy.userData.lifecycleState;
                const currentTime = GameState.clock.elapsedTime;

                if (state === 'finding_nest') {
                    // Find a random riverbank position and move toward it
                    if (!enemy.userData.targetNestPos) {
                        // Find a riverbank spot
                        for (let attempt = 0; attempt < 20; attempt++) {
                            const rx = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 0.8;
                            const rz = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 0.8;
                            if (Environment.isOnRiverbank(rx, rz) && !Environment.isInVillage(rx, rz)) {
                                enemy.userData.targetNestPos = { x: rx, z: rz };
                                break;
                            }
                        }
                    }

                    if (enemy.userData.targetNestPos) {
                        const targetVec = new THREE.Vector3(
                            enemy.userData.targetNestPos.x,
                            0,
                            enemy.userData.targetNestPos.z
                        );
                        direction = new THREE.Vector3()
                            .subVectors(targetVec, enemy.position)
                            .normalize();
                        speed = enemy.userData.speed;

                        // Check if reached target
                        const distToTarget = enemy.position.distanceTo(targetVec);
                        if (distToTarget < 1) {
                            // Transition to building nest
                            enemy.userData.lifecycleState = 'building_nest';
                            enemy.userData.stateTimer = 0;
                        }
                    } else {
                        // Wander if no target found
                        direction = enemy.userData.wanderDir;
                    }
                } else if (state === 'building_nest') {
                    // Stand still for a moment, then create nest
                    enemy.userData.stateTimer += delta;
                    direction = new THREE.Vector3(0, 0, 0);
                    speed = 0;

                    if (enemy.userData.stateTimer >= 1) {
                        // Create nest at current position
                        const nest = createNest(enemy.position.x, enemy.position.z);
                        nest.ownerId = enemy.userData.entityId;
                        GameState.nests.push(nest);
                        GameState.scene.add(nest.mesh);
                        enemy.userData.nestId = nest.id;

                        // Transition to laying egg
                        enemy.userData.lifecycleState = 'laying_egg';
                        enemy.userData.stateTimer = 0;
                    }
                } else if (state === 'laying_egg') {
                    // Stand still for 3 seconds, then create egg
                    enemy.userData.stateTimer += delta;
                    direction = new THREE.Vector3(0, 0, 0);
                    speed = 0;

                    if (enemy.userData.stateTimer >= 3) {
                        // Find the nest
                        const nest = GameState.nests.find(n => n.id === enemy.userData.nestId);
                        if (nest) {
                            // Create egg mesh
                            const egg = Items.createResource('egg');
                            egg.position.set(nest.position.x, 0, nest.position.z);
                            egg.userData.nestId = nest.id; // Store nest ID in egg
                            GameState.resources.push(egg);
                            GameState.scene.add(egg);

                            // Set nest egg properties
                            nest.egg.exists = true;
                            nest.egg.timePlaced = currentTime;
                            nest.egg.hatchTime = currentTime + 300; // 5 minutes
                            nest.egg.mesh = egg;
                            nest.state = 'occupied';

                            // Transition to guarding
                            enemy.userData.lifecycleState = 'guarding';
                        } else {
                            // No nest found, go back to finding nest
                            enemy.userData.lifecycleState = 'finding_nest';
                            enemy.userData.targetNestPos = null;
                        }
                    }
                } else if (state === 'guarding') {
                    // Patrol around nest, attack hostile enemies
                    const nest = GameState.nests.find(n => n.id === enemy.userData.nestId);
                    if (nest) {
                        const nestVec = new THREE.Vector3(nest.position.x, 0, nest.position.z);
                        const distToNest = enemy.position.distanceTo(nestVec);

                        // Find closest hostile enemy within attack range
                        // Double detection range if goose has offspring
                        const detectionRange = enemy.userData.hasOffspring ?
                            enemy.userData.attackRange * 2 :
                            enemy.userData.attackRange;

                        let closestEnemy = null;
                        let closestEnemyDist = detectionRange;

                        for (let j = 0; j < GameState.enemies.length; j++) {
                            const other = GameState.enemies[j];
                            if (other === enemy || other.userData.friendly) continue;

                            const dist = enemy.position.distanceTo(other.position);
                            if (dist < closestEnemyDist) {
                                closestEnemyDist = dist;
                                closestEnemy = other;
                            }
                        }

                        if (closestEnemy) {
                            // Chase and attack hostile enemy
                            direction = new THREE.Vector3()
                                .subVectors(closestEnemy.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;

                            // Deal damage to enemy on contact
                            if (closestEnemyDist < enemy.userData.radius + closestEnemy.userData.radius) {
                                // Check for dodge (foxes have 15% dodge chance)
                                const dodgeChance = closestEnemy.userData.dodgeChance || 0;
                                if (Math.random() >= dodgeChance) {
                                    // Attack hits
                                    closestEnemy.userData.health -= enemy.userData.damage * delta;
                                    if (closestEnemy.userData.health <= 0) {
                                        // Remove killed enemy
                                        const idx = GameState.enemies.indexOf(closestEnemy);
                                        if (idx !== -1) {
                                            GameState.scene.remove(closestEnemy);
                                            GameState.enemies.splice(idx, 1);
                                            if (idx < i) i--;
                                        }
                                    }
                                }
                                // else: dodged!
                            }
                        } else if (distToNest > 15) {
                            // Too far from nest, move back
                            direction = new THREE.Vector3()
                                .subVectors(nestVec, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;
                        } else {
                            // Wander near nest
                            enemy.userData.wanderTime += delta;
                            if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                                const angle = Math.random() * Math.PI * 2;
                                enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                                enemy.userData.wanderTime = 0;
                            }
                            direction = enemy.userData.wanderDir;
                        }

                        // Check if egg was collected (nest exists but no egg)
                        if (!nest.egg.exists && nest.state === 'empty') {
                            // Egg was collected or hatched, build new nest
                            enemy.userData.lifecycleState = 'finding_nest';
                            enemy.userData.targetNestPos = null;
                            enemy.userData.nestId = null;
                        }
                    } else {
                        // Nest doesn't exist, find a new one
                        enemy.userData.lifecycleState = 'finding_nest';
                        enemy.userData.targetNestPos = null;
                        enemy.userData.nestId = null;
                    }
                } else if (state === 'defending') {
                    // Chase player aggressively at 1.5x speed
                    direction = new THREE.Vector3()
                        .subVectors(GameState.peccary.position, enemy.position)
                        .normalize();
                    speed = enemy.userData.speed * 1.5;

                    // Deal double damage on contact
                    if (distance < enemy.userData.radius + GameState.peccary.userData.radius) {
                        Game.takeDamage(enemy.userData.damage * 2 * delta, enemy.userData.type);
                    }

                    // Check if player reached village (safe zone)
                    if (Environment.isInVillage(GameState.peccary.position.x, GameState.peccary.position.z)) {
                        // Stop chasing, reset to finding nest
                        enemy.userData.lifecycleState = 'finding_nest';
                        enemy.userData.chasingPlayer = false;
                        enemy.userData.friendly = true;
                        enemy.userData.targetNestPos = null;
                        enemy.userData.nestId = null;

                        // Remove from chasing geese list
                        GameState.chasingGeese = GameState.chasingGeese.filter(g => g !== enemy);
                    }
                } else if (state === 'baby') {
                    // Baby goose follows parent
                    const parent = GameState.enemies.find(e => e.userData.entityId === enemy.userData.parentId);

                    if (parent) {
                        const distToParent = enemy.position.distanceTo(parent.position);

                        if (distToParent > 5) {
                            // Too far, move toward parent
                            direction = new THREE.Vector3()
                                .subVectors(parent.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;
                        } else {
                            // Stay near parent, wander
                            enemy.userData.wanderTime += delta;
                            if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                                const angle = Math.random() * Math.PI * 2;
                                enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                                enemy.userData.wanderTime = 0;
                            }
                            direction = enemy.userData.wanderDir;
                            speed = enemy.userData.speed * 0.5;
                        }
                    } else {
                        // Parent doesn't exist, wander
                        enemy.userData.wanderTime += delta;
                        if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                            const angle = Math.random() * Math.PI * 2;
                            enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                            enemy.userData.wanderTime = 0;
                        }
                        direction = enemy.userData.wanderDir;
                    }

                    // Check if mature
                    if (currentTime >= enemy.userData.maturityTime) {
                        // Clear parent's hasOffspring flag
                        const parent = GameState.enemies.find(e => e.userData.entityId === enemy.userData.parentId);
                        if (parent) {
                            parent.userData.hasOffspring = false;
                        }

                        // Grow to full size
                        enemy.scale.set(1, 1, 1);
                        enemy.userData.size = 1;
                        enemy.userData.health = 25;
                        enemy.userData.maxHealth = 25;
                        enemy.userData.lifecycleState = 'finding_nest';
                        enemy.userData.targetNestPos = null;
                        enemy.userData.nestId = null;
                        enemy.userData.entityId = 'goose_' + Date.now() + '_' + Math.random();
                        enemy.userData.isBaby = false; // No longer a baby

                        // Restore adult colors
                        enemy.traverse((child) => {
                            if (child.isMesh && child.material) {
                                if (child.material.color) {
                                    const currentColor = child.material.color.getHex();
                                    // Restore body color if it's grey
                                    if (currentColor === 0x999999) {
                                        child.material.color.setHex(0xf5deb3); // Wheat/beige
                                    }
                                }
                            }
                        });

                        console.log('Baby goose matured into adult');
                    }
                }
            }
            // Friendly enemies that attack other enemies (like geese without lifecycle)
            else if (enemy.userData.attacksEnemies) {
                // Find closest hostile enemy to attack
                let closestEnemy = null;
                let closestEnemyDist = enemy.userData.attackRange;

                for (let j = 0; j < GameState.enemies.length; j++) {
                    const other = GameState.enemies[j];
                    if (other === enemy || other.userData.friendly) continue;

                    const dist = enemy.position.distanceTo(other.position);
                    if (dist < closestEnemyDist) {
                        closestEnemyDist = dist;
                        closestEnemy = other;
                    }
                }

                if (closestEnemy) {
                    // Chase and attack hostile enemy
                    direction = new THREE.Vector3()
                        .subVectors(closestEnemy.position, enemy.position)
                        .normalize();
                    speed = enemy.userData.speed;
                    enemy.userData.isChasing = true;

                    // Deal damage to enemy on contact
                    if (closestEnemyDist < enemy.userData.radius + closestEnemy.userData.radius) {
                        // Check for dodge (foxes have 15% dodge chance)
                        const dodgeChance = closestEnemy.userData.dodgeChance || 0;
                        if (Math.random() >= dodgeChance) {
                            closestEnemy.userData.health -= enemy.userData.damage * delta;
                            if (closestEnemy.userData.health <= 0) {
                                // Remove killed enemy
                                const idx = GameState.enemies.indexOf(closestEnemy);
                                if (idx !== -1) {
                                    GameState.scene.remove(closestEnemy);
                                    GameState.enemies.splice(idx, 1);
                                    // Adjust index if needed
                                    if (idx < i) i--;
                                }
                            }
                        }
                    }
                } else {
                    // Wander when no targets
                    enemy.userData.isChasing = false;
                    enemy.userData.wanderTime += delta;

                    if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                        const angle = Math.random() * Math.PI * 2;
                        enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                        enemy.userData.wanderTime = 0;
                    }

                    direction = enemy.userData.wanderDir;
                }
            }
            // Leopard Toad behavior - hopping movement near watering hole
            else if (enemy.userData.type === 'leopard_toad') {
                // Toads use hopping movement instead of walking
                const hopPhase = enemy.userData.hopPhase || 'grounded';
                const homePos = enemy.userData.homePosition || { x: 0, z: 0 };
                const maxRange = enemy.userData.maxRangeFromHome || 10;
                const lifecycleState = enemy.userData.lifecycleState || 'hopping';

                // Initialize hop timer if needed
                if (enemy.userData.hopTimer === undefined) {
                    enemy.userData.hopTimer = Math.random() * 2;
                }

                // Check distance from home (watering hole)
                const distFromHome = Math.sqrt(
                    Math.pow(enemy.position.x - homePos.x, 2) +
                    Math.pow(enemy.position.z - homePos.z, 2)
                );

                // ================================================================
                // MATING LIFECYCLE STATES
                // ================================================================

                // SEEKING MATE - Female hopping toward target male
                if (lifecycleState === 'seeking_mate') {
                    const targetMate = enemy.userData.targetMate;
                    if (targetMate && GameState.enemies.includes(targetMate)) {
                        const distToMate = enemy.position.distanceTo(targetMate.position);

                        if (distToMate < 1.5) {
                            // Close enough - start mating
                            enemy.userData.lifecycleState = 'mating';
                            enemy.userData.matingTimer = 2; // 2 seconds mating duration
                            targetMate.userData.lifecycleState = 'mating';
                            targetMate.userData.matingTimer = 2;
                            console.log('Toads mating!');
                        } else {
                            // Hop toward male - set hop target
                            if (hopPhase === 'grounded') {
                                const targetAngle = Math.atan2(
                                    targetMate.position.z - enemy.position.z,
                                    targetMate.position.x - enemy.position.x
                                );
                                const hopDistance = Math.min(2, distToMate);
                                enemy.userData.hopTarget = {
                                    x: enemy.position.x + Math.cos(targetAngle) * hopDistance,
                                    z: enemy.position.z + Math.sin(targetAngle) * hopDistance
                                };
                                // Trigger hop immediately if waiting
                                if (enemy.userData.hopTimer > 0.1) {
                                    enemy.userData.hopTimer = 0.1;
                                }
                            }
                        }
                    } else {
                        // Target male is gone, return to hopping
                        enemy.userData.lifecycleState = 'hopping';
                        enemy.userData.targetMate = null;
                    }
                }

                // MATING - Both toads pause briefly
                else if (lifecycleState === 'mating') {
                    enemy.userData.matingTimer -= delta;
                    enemy.userData.hopPhase = 'grounded';
                    enemy.userData.hopTimer = 0.5; // Keep grounded

                    if (enemy.userData.matingTimer <= 0) {
                        if (enemy.userData.gender === 'female') {
                            // Female goes to build nest
                            enemy.userData.lifecycleState = 'going_to_nest';
                            enemy.userData.targetMate = null;
                            console.log('Female toad heading to watering hole to nest');
                        } else {
                            // Male returns to hopping
                            enemy.userData.lifecycleState = 'hopping';
                            console.log('Male toad returns to hopping');
                        }
                    }
                    continue; // Skip normal hopping while mating
                }

                // GOING TO NEST - Female hopping to watering hole edge
                else if (lifecycleState === 'going_to_nest') {
                    // Get watering hole position (center of savannah)
                    const wateringHoleCenter = { x: 0, z: 0 };
                    const wateringHoleRadius = 7.5;
                    const nestDistance = wateringHoleRadius + 1; // Just outside the water

                    // Calculate nest position (nearest point on edge from current position)
                    const angleToCenter = Math.atan2(
                        enemy.position.z - wateringHoleCenter.z,
                        enemy.position.x - wateringHoleCenter.x
                    );
                    const nestPos = {
                        x: wateringHoleCenter.x + Math.cos(angleToCenter) * nestDistance,
                        z: wateringHoleCenter.z + Math.sin(angleToCenter) * nestDistance
                    };

                    const distToNest = Math.sqrt(
                        Math.pow(enemy.position.x - nestPos.x, 2) +
                        Math.pow(enemy.position.z - nestPos.z, 2)
                    );

                    if (distToNest < 1) {
                        // Arrived at nest spot - start building
                        enemy.userData.lifecycleState = 'building_nest';
                        enemy.userData.buildTimer = 2; // 2 seconds to build
                        enemy.userData.nestPosition = nestPos;
                        console.log('Female toad building nest at', nestPos.x.toFixed(1), nestPos.z.toFixed(1));
                    } else {
                        // Hop toward nest position
                        if (hopPhase === 'grounded') {
                            const targetAngle = Math.atan2(
                                nestPos.z - enemy.position.z,
                                nestPos.x - enemy.position.x
                            );
                            const hopDistance = Math.min(2, distToNest);
                            enemy.userData.hopTarget = {
                                x: enemy.position.x + Math.cos(targetAngle) * hopDistance,
                                z: enemy.position.z + Math.sin(targetAngle) * hopDistance
                            };
                            // Trigger hop immediately if waiting
                            if (enemy.userData.hopTimer > 0.1) {
                                enemy.userData.hopTimer = 0.1;
                            }
                        }
                    }
                }

                // BUILDING NEST - Female pauses to build
                else if (lifecycleState === 'building_nest') {
                    enemy.userData.buildTimer -= delta;
                    enemy.userData.hopPhase = 'grounded';
                    enemy.userData.hopTimer = 0.5;

                    if (enemy.userData.buildTimer <= 0) {
                        // Create the nest
                        const nestPos = enemy.userData.nestPosition;
                        const nest = createToadNest(nestPos.x, nestPos.z, enemy.userData.entityId);
                        enemy.userData.nestId = nest.id;
                        enemy.userData.lifecycleState = 'guarding';
                        console.log('Female toad now guarding nest');
                    }
                    continue;
                }

                // GUARDING - Female stays near nest
                else if (lifecycleState === 'guarding') {
                    // Find the nest
                    const nest = GameState.toadNests.find(n => n.id === enemy.userData.nestId);
                    if (nest) {
                        const distToNest = Math.sqrt(
                            Math.pow(enemy.position.x - nest.position.x, 2) +
                            Math.pow(enemy.position.z - nest.position.z, 2)
                        );

                        // Stay within 3 units of nest
                        if (distToNest > 3) {
                            // Hop back toward nest
                            if (hopPhase === 'grounded') {
                                const targetAngle = Math.atan2(
                                    nest.position.z - enemy.position.z,
                                    nest.position.x - enemy.position.x
                                );
                                enemy.userData.hopTarget = {
                                    x: enemy.position.x + Math.cos(targetAngle) * 1.5,
                                    z: enemy.position.z + Math.sin(targetAngle) * 1.5
                                };
                                if (enemy.userData.hopTimer > 0.1) {
                                    enemy.userData.hopTimer = 0.1;
                                }
                            }
                        }
                        // Otherwise just hop around near nest (normal hopping handles this)
                    } else {
                        // Nest is gone, return to hopping
                        enemy.userData.lifecycleState = 'hopping';
                        enemy.userData.nestId = null;
                    }
                }

                // ATTACKING - Mother chasing player after egg theft
                else if (lifecycleState === 'attacking') {
                    enemy.userData.attackTimer -= delta;

                    // Hop toward player aggressively
                    const distToPlayer = enemy.position.distanceTo(GameState.peccary.position);

                    if (hopPhase === 'grounded' && enemy.userData.hopTimer <= 0) {
                        const targetAngle = Math.atan2(
                            GameState.peccary.position.z - enemy.position.z,
                            GameState.peccary.position.x - enemy.position.x
                        );
                        const hopDistance = Math.min(3, distToPlayer); // Bigger hops when attacking
                        enemy.userData.hopTarget = {
                            x: enemy.position.x + Math.cos(targetAngle) * hopDistance,
                            z: enemy.position.z + Math.sin(targetAngle) * hopDistance
                        };
                        enemy.userData.hopTimer = 0.2; // Faster hops when attacking
                    }

                    // Deal damage if close
                    if (distToPlayer < enemy.userData.radius + GameState.peccary.userData.radius) {
                        Game.takeDamage(enemy.userData.damage * delta * 3, 'toad'); // Triple damage when attacking
                    }

                    // Return to guarding after attack timer expires
                    if (enemy.userData.attackTimer <= 0) {
                        enemy.userData.lifecycleState = 'guarding';
                        console.log('Mother toad returns to guarding nest');
                    }
                }

                // BABY - Small toad following adults, will grow up
                else if (lifecycleState === 'baby') {
                    // Check if it's time to grow up (2 minutes)
                    if (GameState.timeElapsed >= enemy.userData.maturityTime) {
                        // Grow up! 50% male, 50% female
                        const isMale = Math.random() < 0.5;
                        const genderData = isMale
                            ? ENEMIES.find(e => e.id === 'leopard_toad_male')
                            : ENEMIES.find(e => e.id === 'leopard_toad_female');

                        if (genderData) {
                            // Remove old model and create new adult model
                            while (enemy.children.length > 0) {
                                enemy.remove(enemy.children[0]);
                            }

                            const adultModel = buildLeopardToadModel(genderData.colors);
                            enemy.add(adultModel);

                            // Update to adult size
                            enemy.scale.set(genderData.size, genderData.size, genderData.size);

                            // Update properties
                            enemy.userData.id = genderData.id;
                            enemy.userData.gender = isMale ? 'male' : 'female';
                            enemy.userData.isBaby = false;
                            enemy.userData.speed = genderData.speed;
                            enemy.userData.damage = genderData.damage;
                            enemy.userData.radius = genderData.radius;
                            enemy.userData.health = genderData.health;
                            enemy.userData.lifecycleState = 'hopping';

                            console.log('Baby toad grew up into', isMale ? 'male' : 'female', 'adult!');
                        }
                    } else {
                        // Baby behavior: follow nearest adult
                        let nearestAdult = null;
                        let nearestAdultDist = Infinity;

                        GameState.enemies.forEach(other => {
                            if (other !== enemy &&
                                other.userData.type === 'leopard_toad' &&
                                !other.userData.isBaby) {
                                const dist = enemy.position.distanceTo(other.position);
                                if (dist < nearestAdultDist) {
                                    nearestAdultDist = dist;
                                    nearestAdult = other;
                                }
                            }
                        });

                        // If far from adult, hop toward them
                        if (nearestAdult && nearestAdultDist > 5) {
                            if (hopPhase === 'grounded' && enemy.userData.hopTimer <= 0) {
                                const targetAngle = Math.atan2(
                                    nearestAdult.position.z - enemy.position.z,
                                    nearestAdult.position.x - enemy.position.x
                                );
                                const hopDistance = Math.min(1, nearestAdultDist * 0.3); // Smaller hops
                                enemy.userData.hopTarget = {
                                    x: enemy.position.x + Math.cos(targetAngle) * hopDistance,
                                    z: enemy.position.z + Math.sin(targetAngle) * hopDistance
                                };
                            }
                        }
                        // Otherwise, random hopping (handled by normal hop logic below)
                    }
                }

                // FLEEING - Toad running from predator
                else if (lifecycleState === 'fleeing') {
                    enemy.userData.fleeTimer -= delta;
                    const predator = enemy.userData.fleeFrom;

                    if (enemy.userData.fleeTimer <= 0 || !predator || !GameState.enemies.includes(predator)) {
                        // Done fleeing, return to hopping
                        enemy.userData.lifecycleState = 'hopping';
                        enemy.userData.fleeFrom = null;
                    } else {
                        // Hop away from predator - fast!
                        if (hopPhase === 'grounded') {
                            const fleeAngle = Math.atan2(
                                enemy.position.z - predator.position.z,
                                enemy.position.x - predator.position.x
                            );
                            // Big fast hops when fleeing (using fleeSpeed = 15)
                            const hopDistance = 3;
                            enemy.userData.hopTarget = {
                                x: enemy.position.x + Math.cos(fleeAngle) * hopDistance,
                                z: enemy.position.z + Math.sin(fleeAngle) * hopDistance
                            };
                            // Very quick hops when fleeing
                            enemy.userData.hopTimer = 0.1;
                        }
                    }
                }

                // HEALING - Male toad seeking food after surviving attack
                else if (lifecycleState === 'healing') {
                    // Find nearest resource to eat
                    let nearestResource = null;
                    let nearestResourceDist = Infinity;

                    if (GameState.resources) {
                        for (const resource of GameState.resources) {
                            const dist = enemy.position.distanceTo(resource.position);
                            if (dist < nearestResourceDist) {
                                nearestResourceDist = dist;
                                nearestResource = resource;
                            }
                        }
                    }

                    if (nearestResource && nearestResourceDist < 30) {
                        // Hop toward resource
                        if (hopPhase === 'grounded') {
                            const targetAngle = Math.atan2(
                                nearestResource.position.z - enemy.position.z,
                                nearestResource.position.x - enemy.position.x
                            );
                            const hopDistance = Math.min(2, nearestResourceDist);
                            enemy.userData.hopTarget = {
                                x: enemy.position.x + Math.cos(targetAngle) * hopDistance,
                                z: enemy.position.z + Math.sin(targetAngle) * hopDistance
                            };
                            if (enemy.userData.hopTimer > 0.3) {
                                enemy.userData.hopTimer = 0.3;
                            }
                        }

                        // Eat resource if close enough
                        if (nearestResourceDist < 1) {
                            // Heal from eating
                            enemy.userData.health = Math.min(
                                (enemy.userData.health || 3) + 5,
                                15  // Max male toad health
                            );
                            // Remove the resource
                            GameState.scene.remove(nearestResource);
                            const idx = GameState.resources.indexOf(nearestResource);
                            if (idx > -1) GameState.resources.splice(idx, 1);
                            console.log('Toad ate resource! Health now:', enemy.userData.health);

                            // Check if fully healed
                            if (enemy.userData.health >= 15) {
                                enemy.userData.lifecycleState = 'hopping';
                                console.log('Toad fully healed, returning to normal');
                            }
                        }
                    } else {
                        // No resources nearby, just hop around
                        // Will heal slowly over time or find food later
                        enemy.userData.wanderTime = (enemy.userData.wanderTime || 0) + delta;
                        if (enemy.userData.wanderTime > 3) {
                            enemy.userData.wanderTime = 0;
                            // Maybe healed enough to return to normal
                            if (enemy.userData.health >= 10) {
                                enemy.userData.lifecycleState = 'hopping';
                            }
                        }
                    }
                }

                // ================================================================
                // NORMAL HOPPING (for 'hopping' state or fallback)
                // ================================================================

                // Hop state machine
                if (hopPhase === 'grounded') {
                    // Waiting on ground between hops
                    enemy.userData.hopTimer -= delta;
                    speed = 0;
                    direction = new THREE.Vector3(0, 0, 0);

                    // Legs in resting position (bent)
                    const model = enemy.children[0];
                    if (model && model.userData.legs) {
                        model.userData.legs.forEach(leg => {
                            if (!leg.isFront && leg.lowerLegGroup) {
                                // Back legs bent
                                leg.group.rotation.x = 0.3;
                                leg.lowerLegGroup.rotation.x = -0.5;
                            }
                        });
                    }
                    enemy.position.y = 0;

                    if (enemy.userData.hopTimer <= 0) {
                        // Check if a lifecycle state already set a hop target
                        // (seeking_mate, going_to_nest, guarding, attacking, baby)
                        if (!enemy.userData.hopTarget) {
                            // No target set by lifecycle - pick a random/home direction
                            let targetAngle;

                            if (distFromHome > maxRange) {
                                // Too far from home, hop back toward watering hole
                                targetAngle = Math.atan2(
                                    homePos.z - enemy.position.z,
                                    homePos.x - enemy.position.x
                                );
                            } else {
                                // Random direction within range
                                targetAngle = Math.random() * Math.PI * 2;
                            }

                            // Set hop target
                            const hopDistance = 1 + Math.random() * 1.5;
                            enemy.userData.hopTarget = {
                                x: enemy.position.x + Math.cos(targetAngle) * hopDistance,
                                z: enemy.position.z + Math.sin(targetAngle) * hopDistance
                            };
                        }

                        // Start the hop with the target (either from lifecycle or random)
                        enemy.userData.hopStartPos = {
                            x: enemy.position.x,
                            z: enemy.position.z
                        };
                        enemy.userData.hopProgress = 0;
                        enemy.userData.hopPhase = 'launching';
                        enemy.userData.hopTimer = 0.1; // Launch duration
                    }
                } else if (hopPhase === 'launching') {
                    // Legs extending, body rising
                    enemy.userData.hopTimer -= delta;
                    speed = 0;
                    direction = new THREE.Vector3(0, 0, 0);

                    const launchProgress = 1 - (enemy.userData.hopTimer / 0.1);
                    enemy.position.y = launchProgress * 0.3;

                    // Extend back legs
                    const model = enemy.children[0];
                    if (model && model.userData.legs) {
                        model.userData.legs.forEach(leg => {
                            if (!leg.isFront && leg.lowerLegGroup) {
                                leg.group.rotation.x = 0.3 - launchProgress * 0.5;
                                leg.lowerLegGroup.rotation.x = -0.5 + launchProgress * 0.5;
                            }
                        });
                    }

                    // Face hop direction
                    if (enemy.userData.hopTarget) {
                        const targetAngle = Math.atan2(
                            enemy.userData.hopTarget.x - enemy.position.x,
                            enemy.userData.hopTarget.z - enemy.position.z
                        ) + Math.PI / 2;
                        enemy.rotation.y = targetAngle;
                    }

                    if (enemy.userData.hopTimer <= 0) {
                        enemy.userData.hopPhase = 'airborne';
                        enemy.userData.hopTimer = 0.3; // Airborne duration
                    }
                } else if (hopPhase === 'airborne') {
                    // In the air, moving toward target
                    enemy.userData.hopTimer -= delta;
                    enemy.userData.hopProgress = 1 - (enemy.userData.hopTimer / 0.3);

                    // Parabolic arc for height
                    const heightProgress = Math.sin(enemy.userData.hopProgress * Math.PI);
                    enemy.position.y = heightProgress * 0.5;

                    // Move toward target
                    if (enemy.userData.hopTarget && enemy.userData.hopStartPos) {
                        const t = enemy.userData.hopProgress;
                        enemy.position.x = enemy.userData.hopStartPos.x +
                            (enemy.userData.hopTarget.x - enemy.userData.hopStartPos.x) * t;
                        enemy.position.z = enemy.userData.hopStartPos.z +
                            (enemy.userData.hopTarget.z - enemy.userData.hopStartPos.z) * t;
                    }

                    // Tuck legs during flight
                    const model = enemy.children[0];
                    if (model && model.userData.legs) {
                        model.userData.legs.forEach(leg => {
                            if (!leg.isFront && leg.lowerLegGroup) {
                                leg.group.rotation.x = -0.2;
                                leg.lowerLegGroup.rotation.x = 0.4;
                            }
                        });
                    }

                    speed = 0;
                    direction = new THREE.Vector3(0, 0, 0);

                    if (enemy.userData.hopTimer <= 0) {
                        enemy.userData.hopPhase = 'landing';
                        enemy.userData.hopTimer = 0.1; // Landing duration
                    }
                } else if (hopPhase === 'landing') {
                    // Coming down, legs extending to absorb
                    enemy.userData.hopTimer -= delta;
                    speed = 0;
                    direction = new THREE.Vector3(0, 0, 0);

                    const landProgress = 1 - (enemy.userData.hopTimer / 0.1);
                    enemy.position.y = (1 - landProgress) * 0.1;

                    // Extend legs for landing
                    const model = enemy.children[0];
                    if (model && model.userData.legs) {
                        model.userData.legs.forEach(leg => {
                            if (!leg.isFront && leg.lowerLegGroup) {
                                leg.group.rotation.x = -0.2 + landProgress * 0.5;
                                leg.lowerLegGroup.rotation.x = 0.4 - landProgress * 0.9;
                            }
                        });
                    }

                    if (enemy.userData.hopTimer <= 0) {
                        // Back to grounded
                        enemy.userData.hopPhase = 'grounded';
                        enemy.userData.hopTimer = 0.5 + Math.random() * 1.5; // Wait before next hop
                        enemy.position.y = 0;
                        enemy.userData.hopTarget = null;
                    }
                }

                // Skip normal movement for toads - they only hop
                continue;
            }
            // Grass Viper Weasel behavior - toad hunters in savannah
            else if (enemy.userData.type === 'grass_viper') {
                // Initialize state if needed
                if (!enemy.userData.lifecycleState) {
                    enemy.userData.lifecycleState = 'hunting';
                    enemy.userData.huntTarget = null;
                    enemy.userData.stalkTimer = 0;
                    enemy.userData.isCreeping = false;
                }

                // Check for nearby wild dogs - flee if one is close!
                const nearbyDog = GameState.enemies.find(e =>
                    e.userData.type === 'wild_dog' &&
                    e.userData.lifecycleState === 'chasing_weasel' &&
                    e.userData.weaselTarget === enemy
                );

                if (nearbyDog) {
                    // A wild dog is chasing us! RUN!
                    const fleeDir = new THREE.Vector3()
                        .subVectors(enemy.position, nearbyDog.position)
                        .normalize();
                    direction = fleeDir;
                    speed = enemy.userData.speed * 1.5;  // Flee fast!
                    enemy.userData.isCreeping = false;
                    enemy.userData.huntTarget = null;  // Forget about hunting

                    // Move the viper
                    enemy.position.x += direction.x * speed * delta;
                    enemy.position.z += direction.z * speed * delta;

                    // Face flee direction
                    const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI / 2;
                    let diff = targetRotation - enemy.rotation.y;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    enemy.rotation.y += diff * 0.15;

                    continue;  // Skip normal behavior while fleeing
                }

                const viperState = enemy.userData.lifecycleState;

                // ================================================================
                // HUNTING STATE - Looking for toads
                // ================================================================
                if (viperState === 'hunting') {
                    // Find nearest toad within hunt range (17 units)
                    // Prefer baby toads if available
                    let nearestToad = null;
                    let nearestToadDist = enemy.userData.huntRange || 17;
                    let foundBaby = false;

                    for (const other of GameState.enemies) {
                        if (other.userData.type === 'leopard_toad') {
                            const dist = enemy.position.distanceTo(other.position);
                            if (dist <= nearestToadDist) {
                                // Prefer babies if we haven't found one yet
                                const isBaby = other.userData.isBaby === true;
                                if (isBaby && !foundBaby) {
                                    nearestToad = other;
                                    nearestToadDist = dist;
                                    foundBaby = true;
                                } else if (!foundBaby || isBaby) {
                                    nearestToad = other;
                                    nearestToadDist = dist;
                                    if (isBaby) foundBaby = true;
                                }
                            }
                        }
                    }

                    if (nearestToad) {
                        // Start stalking this toad
                        enemy.userData.huntTarget = nearestToad;
                        enemy.userData.lifecycleState = 'stalking';
                        enemy.userData.stalkTimer = 0;
                        enemy.userData.isCreeping = true;
                        console.log('Grass viper spotted a toad, starting to stalk...');
                    } else {
                        // Wander around looking for prey
                        enemy.userData.isCreeping = false;
                        enemy.userData.wanderTime = (enemy.userData.wanderTime || 0) + delta;
                        if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                            const angle = Math.random() * Math.PI * 2;
                            enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                            enemy.userData.wanderTime = 0;
                        }
                        direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                        speed = enemy.userData.speed;
                    }
                }

                // ================================================================
                // STALKING STATE - Creeping toward toad
                // ================================================================
                else if (viperState === 'stalking') {
                    const target = enemy.userData.huntTarget;

                    // Check if target still exists
                    if (!target || !GameState.enemies.includes(target)) {
                        enemy.userData.lifecycleState = 'hunting';
                        enemy.userData.huntTarget = null;
                        enemy.userData.isCreeping = false;
                        continue;
                    }

                    const distToTarget = enemy.position.distanceTo(target.position);

                    // Check if spotted (30% chance per second while stalking)
                    enemy.userData.stalkTimer += delta;
                    if (enemy.userData.stalkTimer >= 1) {
                        enemy.userData.stalkTimer = 0;
                        if (Math.random() < 0.30) {
                            // Spotted! Alert the toad
                            console.log('Grass viper was spotted by toad!');
                            alertToad(target, enemy);
                            enemy.userData.lifecycleState = 'hunting';
                            enemy.userData.huntTarget = null;
                            enemy.userData.isCreeping = false;
                            continue;
                        }
                    }

                    // Close enough to attack?
                    if (distToTarget < 1.5) {
                        enemy.userData.lifecycleState = 'attacking';
                        enemy.userData.isCreeping = false;
                        console.log('Grass viper pouncing on toad!');
                    } else {
                        // Creep toward target
                        direction = new THREE.Vector3()
                            .subVectors(target.position, enemy.position)
                            .normalize();
                        speed = enemy.userData.creepSpeed || 2;
                        enemy.userData.isCreeping = true;
                    }
                }

                // ================================================================
                // ATTACKING STATE - Pouncing on toad
                // ================================================================
                else if (viperState === 'attacking') {
                    const target = enemy.userData.huntTarget;

                    if (!target || !GameState.enemies.includes(target)) {
                        enemy.userData.lifecycleState = 'hunting';
                        enemy.userData.huntTarget = null;
                        continue;
                    }

                    const distToTarget = enemy.position.distanceTo(target.position);

                    if (distToTarget < enemy.userData.radius + (target.userData.radius || 0.4)) {
                        // Contact! 70% chance to grab, 30% to attack
                        if (Math.random() < 0.70) {
                            // Grab the toad - hold it for 2 seconds then swallow
                            enemy.userData.lifecycleState = 'holding';
                            enemy.userData.holdTimer = 2;
                            enemy.userData.heldToad = target;
                            // Remove toad from game temporarily (it's in mouth)
                            target.visible = false;
                            console.log('Grass viper grabbed toad!');
                        } else {
                            // Attack - do 12 damage
                            target.userData.health = (target.userData.health || 15) - 12;
                            console.log('Grass viper attacked toad! Toad health:', target.userData.health);

                            if (target.userData.health <= 0) {
                                // Toad died from attack
                                GameState.scene.remove(target);
                                const idx = GameState.enemies.indexOf(target);
                                if (idx > -1) GameState.enemies.splice(idx, 1);
                                console.log('Toad killed by grass viper attack');
                            } else {
                                // Toad survived - alert it and it escapes
                                // Male toads survive (15 HP - 12 = 3 HP left)
                                alertToad(target, enemy);
                                target.userData.lifecycleState = 'healing';
                                target.userData.healingTarget = null;  // Will find resource
                            }
                            enemy.userData.lifecycleState = 'hunting';
                            enemy.userData.huntTarget = null;
                        }
                    } else {
                        // Rush toward target
                        direction = new THREE.Vector3()
                            .subVectors(target.position, enemy.position)
                            .normalize();
                        speed = enemy.userData.speed * 1.5;  // Fast pounce
                    }
                }

                // ================================================================
                // HOLDING STATE - Toad in mouth, about to swallow
                // ================================================================
                else if (viperState === 'holding') {
                    enemy.userData.holdTimer -= delta;
                    speed = 0;  // Stand still while holding

                    if (enemy.userData.holdTimer <= 0) {
                        // Swallow the toad
                        const heldToad = enemy.userData.heldToad;
                        if (heldToad) {
                            GameState.scene.remove(heldToad);
                            const idx = GameState.enemies.indexOf(heldToad);
                            if (idx > -1) GameState.enemies.splice(idx, 1);

                            // Heal the viper (eating gives health)
                            enemy.userData.health = Math.min(
                                (enemy.userData.health || 8) + 5,
                                enemy.userData.maxHealth || 10
                            );
                            console.log('Grass viper swallowed toad! Health:', enemy.userData.health);
                        }
                        enemy.userData.heldToad = null;
                        enemy.userData.huntTarget = null;
                        enemy.userData.lifecycleState = 'hunting';
                    }
                }

                // ================================================================
                // MATING STATE - Male seeking female
                // ================================================================
                else if (viperState === 'mating_run') {
                    const targetMate = enemy.userData.targetMate;

                    if (!targetMate || !GameState.enemies.includes(targetMate)) {
                        enemy.userData.lifecycleState = 'hunting';
                        enemy.userData.targetMate = null;
                        continue;
                    }

                    const distToMate = enemy.position.distanceTo(targetMate.position);

                    if (distToMate < 1.5) {
                        // Mate with female
                        targetMate.userData.isPregnant = true;
                        targetMate.userData.gestationTimer = 420;  // 7 minutes
                        targetMate.userData.lifecycleState = 'gestating';

                        // Rebuild female model with pregnancy belly
                        rebuildViperWithBelly(targetMate, true);

                        console.log('Grass vipers mated! Female now gestating');
                        enemy.userData.lifecycleState = 'hunting';
                        enemy.userData.targetMate = null;
                    } else {
                        // Run toward female
                        direction = new THREE.Vector3()
                            .subVectors(targetMate.position, enemy.position)
                            .normalize();
                        speed = enemy.userData.speed * 1.2;
                    }
                }

                // ================================================================
                // GESTATING STATE - Pregnant female
                // ================================================================
                else if (viperState === 'gestating') {
                    enemy.userData.gestationTimer -= delta;

                    if (enemy.userData.gestationTimer <= 0) {
                        // Give birth!
                        spawnBabyViper(enemy);
                        enemy.userData.isPregnant = false;
                        enemy.userData.lifecycleState = 'mothering';
                        enemy.userData.motheringTimer = 240;  // 4 minutes

                        // Rebuild model without belly
                        rebuildViperWithBelly(enemy, false);
                        console.log('Grass viper gave birth!');
                    } else {
                        // Normal hunting while pregnant (but slower)
                        // Find nearest toad
                        let nearestToad = null;
                        let nearestToadDist = enemy.userData.huntRange || 17;

                        for (const other of GameState.enemies) {
                            if (other.userData.type === 'leopard_toad') {
                                const dist = enemy.position.distanceTo(other.position);
                                if (dist < nearestToadDist) {
                                    nearestToad = other;
                                    nearestToadDist = dist;
                                }
                            }
                        }

                        if (nearestToad && nearestToadDist < 10) {
                            // Hunt but slower
                            direction = new THREE.Vector3()
                                .subVectors(nearestToad.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed * 0.7;
                        } else {
                            // Wander
                            enemy.userData.wanderTime = (enemy.userData.wanderTime || 0) + delta;
                            if (enemy.userData.wanderTime > 3) {
                                const angle = Math.random() * Math.PI * 2;
                                enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                                enemy.userData.wanderTime = 0;
                            }
                            direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                            speed = enemy.userData.speed * 0.5;
                        }
                    }
                }

                // ================================================================
                // MOTHERING STATE - Caring for baby
                // ================================================================
                else if (viperState === 'mothering') {
                    enemy.userData.motheringTimer -= delta;

                    if (enemy.userData.motheringTimer <= 0) {
                        // Baby grows up and leaves
                        const baby = enemy.userData.babyViper;
                        if (baby && GameState.enemies.includes(baby)) {
                            growBabyViper(baby);
                        }
                        enemy.userData.babyViper = null;
                        enemy.userData.lifecycleState = 'hunting';
                        console.log('Baby grass viper grew up and left mother');
                    } else {
                        // Stay near baby, hunt if opportunity
                        const baby = enemy.userData.babyViper;
                        if (baby && GameState.enemies.includes(baby)) {
                            const distToBaby = enemy.position.distanceTo(baby.position);
                            if (distToBaby > 5) {
                                // Stay close to baby
                                direction = new THREE.Vector3()
                                    .subVectors(baby.position, enemy.position)
                                    .normalize();
                                speed = enemy.userData.speed * 0.8;
                            } else {
                                // Wander near baby
                                enemy.userData.wanderTime = (enemy.userData.wanderTime || 0) + delta;
                                if (enemy.userData.wanderTime > 2) {
                                    const angle = Math.random() * Math.PI * 2;
                                    enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                                    enemy.userData.wanderTime = 0;
                                }
                                direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                                speed = enemy.userData.speed * 0.5;
                            }
                        } else {
                            enemy.userData.lifecycleState = 'hunting';
                        }
                    }
                }

                // ================================================================
                // BABY STATE - Following mother
                // ================================================================
                else if (viperState === 'baby') {
                    const mother = enemy.userData.mother;
                    if (mother && GameState.enemies.includes(mother)) {
                        const distToMother = enemy.position.distanceTo(mother.position);
                        if (distToMother > 2) {
                            // Follow mother
                            direction = new THREE.Vector3()
                                .subVectors(mother.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;
                        } else {
                            // Stay near mother
                            speed = 0;
                        }
                    } else {
                        // Mother gone, grow up early
                        growBabyViper(enemy);
                    }
                }

                // Apply creeping animation if stalking
                if (enemy.userData.isCreeping) {
                    const model = enemy.children[0];
                    if (model) {
                        // Lower body position when creeping
                        enemy.position.y = -0.1;
                    }
                    speed = enemy.userData.creepSpeed || 2;
                } else {
                    enemy.position.y = 0;
                }

                // Player collision - viper attacks player (like arboreal weasels)
                const distToPlayer = enemy.position.distanceTo(GameState.peccary.position);
                if (distToPlayer < enemy.userData.radius + GameState.peccary.userData.radius) {
                    // Viper damages player on contact
                    Game.takeDamage(enemy.userData.damage * delta, 'grass_viper');
                }

                // Skip normal AI at bottom - viper has custom behavior
                if (direction && speed > 0) {
                    enemy.position.x += direction.x * speed * delta;
                    enemy.position.z += direction.z * speed * delta;

                    // Face movement direction
                    const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI / 2;
                    let currentRotation = enemy.rotation.y;
                    let diff = targetRotation - currentRotation;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    enemy.rotation.y = currentRotation + diff * 0.1;
                }
                continue;
            }
            // New World Rhubarb Antelope behavior - herd animals
            else if (enemy.userData.type === 'antelope') {
                const lifecycleState = enemy.userData.lifecycleState || 'grazing';
                const leader = enemy.userData.leader;
                const isLeader = enemy.userData.isLeader;

                // ================================================================
                // GRAZING STATE - Normal herd behavior
                // ================================================================
                if (lifecycleState === 'grazing') {
                    // Initialize grazing animation state if needed
                    if (enemy.userData.currentGrazeAngle === undefined) {
                        enemy.userData.currentGrazeAngle = 0;
                        enemy.userData.targetGrazeAngle = 0;
                        enemy.userData.isEatingFromTree = false;
                    }

                    // Check if under a tree (within 4 units of a tree trunk)
                    let isUnderTree = false;
                    if (GameState.trees) {
                        for (const tree of GameState.trees) {
                            const distToTree = Math.sqrt(
                                Math.pow(enemy.position.x - tree.position.x, 2) +
                                Math.pow(enemy.position.z - tree.position.z, 2)
                            );
                            if (distToTree < 4) {
                                isUnderTree = true;
                                break;
                            }
                        }
                    }

                    // Grazing timer - decide when to start/stop grazing
                    enemy.userData.grazeTimer -= delta;
                    if (enemy.userData.grazeTimer <= 0) {
                        enemy.userData.isGrazing = !enemy.userData.isGrazing;
                        enemy.userData.grazeTimer = enemy.userData.isGrazing
                            ? 5 + Math.random() * 8  // Graze for 5-13 seconds
                            : 6 + Math.random() * 10; // Stand for 6-16 seconds

                        // Update whether eating from tree (only changes when starting to graze)
                        if (enemy.userData.isGrazing) {
                            enemy.userData.isEatingFromTree = isUnderTree;
                        }

                        // Set target angle based on eating from tree or grass
                        // Positive = head down (grass), Negative = head up (tree)
                        if (enemy.userData.isGrazing) {
                            enemy.userData.targetGrazeAngle = enemy.userData.isEatingFromTree ? -1 : 1;
                        } else {
                            enemy.userData.targetGrazeAngle = 0;
                        }
                    }

                    // Smoothly interpolate grazing angle (no twitching!)
                    const angleDiff = enemy.userData.targetGrazeAngle - enemy.userData.currentGrazeAngle;
                    enemy.userData.currentGrazeAngle += angleDiff * delta * 2; // Smooth transition

                    // Apply grazing animation to neck and head
                    const model = enemy.children[0];
                    if (model && model.userData.parts) {
                        const neckGroup = model.userData.parts.neckGroup;
                        const headGroup = model.userData.parts.headGroup;
                        const grazeAmount = enemy.userData.currentGrazeAngle;

                        if (neckGroup) {
                            // Neck swings down (negative Z) or up (positive Z)
                            // Positive grazeAmount = eating grass (head DOWN, so negative rotation)
                            // Negative grazeAmount = eating from tree (head UP, so positive rotation)
                            neckGroup.rotation.z = -grazeAmount * 0.9;
                        }
                        if (headGroup) {
                            // Head tilts to point muzzle at food source
                            headGroup.rotation.z = -grazeAmount * 0.6;
                        }
                    }

                    // Herd following behavior (stay within 35 units of leader)
                    if (!isLeader && leader && GameState.enemies.includes(leader)) {
                        const distToLeader = enemy.position.distanceTo(leader.position);

                        if (distToLeader > 35) {
                            // Too far from leader, move toward them
                            direction = new THREE.Vector3()
                                .subVectors(leader.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;
                            // Stop grazing to catch up
                            enemy.userData.isGrazing = false;
                            enemy.userData.targetGrazeAngle = 0;
                            enemy.userData.grazeTimer = 3;
                        } else if (distToLeader > 20) {
                            // Getting far, walk slowly toward leader
                            direction = new THREE.Vector3()
                                .subVectors(leader.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed * 0.4;
                        } else {
                            // Close enough, stand or wander very slowly
                            enemy.userData.wanderTime += delta;
                            // Change direction much less frequently (every 10-18 seconds)
                            if (enemy.userData.wanderTime > 10 + Math.random() * 8) {
                                const angle = Math.random() * Math.PI * 2;
                                enemy.userData.wanderDir = new THREE.Vector3(
                                    Math.cos(angle), 0, Math.sin(angle)
                                );
                                enemy.userData.wanderTime = 0;
                            }
                            direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                            // Stop completely when grazing
                            speed = enemy.userData.isGrazing ? 0 : enemy.userData.speed * 0.15;
                        }
                    } else {
                        // Leader or no leader - wander freely but calmly
                        enemy.userData.wanderTime += delta;
                        // Change direction very infrequently
                        if (enemy.userData.wanderTime > 12 + Math.random() * 10) {
                            const angle = Math.random() * Math.PI * 2;
                            enemy.userData.wanderDir = new THREE.Vector3(
                                Math.cos(angle), 0, Math.sin(angle)
                            );
                            enemy.userData.wanderTime = 0;
                        }
                        direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                        speed = enemy.userData.isGrazing ? 0 : enemy.userData.speed * 0.15;
                    }
                }

                // ================================================================
                // BABY STATE - Follow mother
                // ================================================================
                else if (lifecycleState === 'baby') {
                    const mother = enemy.userData.mother;

                    // Check if time to grow up (7 minutes)
                    if (GameState.timeElapsed >= enemy.userData.maturityTime) {
                        growBabyAntelope(enemy);
                        continue;
                    }

                    // Follow mother
                    if (mother && GameState.enemies.includes(mother)) {
                        const distToMother = enemy.position.distanceTo(mother.position);
                        if (distToMother > 4) {
                            direction = new THREE.Vector3()
                                .subVectors(mother.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;
                        } else {
                            // Stay near mother, mirror grazing
                            enemy.userData.isGrazing = mother.userData.isGrazing;
                            speed = mother.userData.isGrazing ? 0 : enemy.userData.speed * 0.3;
                            direction = mother.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                        }
                    } else {
                        // Mother gone, just graze
                        enemy.userData.lifecycleState = 'grazing';
                    }
                }

                // ================================================================
                // SEEKING MATE STATE - Female going to male
                // ================================================================
                else if (lifecycleState === 'seeking_mate') {
                    const targetMate = enemy.userData.targetMate;

                    if (!targetMate || !GameState.enemies.includes(targetMate)) {
                        enemy.userData.lifecycleState = 'grazing';
                        enemy.userData.targetMate = null;
                        continue;
                    }

                    const distToMate = enemy.position.distanceTo(targetMate.position);

                    if (distToMate < 2) {
                        // Mate!
                        enemy.userData.isPregnant = true;
                        enemy.userData.gestationTimer = 540; // 9 minutes
                        enemy.userData.lifecycleState = 'gestating';
                        enemy.userData.lastMate = targetMate;
                        enemy.userData.targetMate = null;

                        // Show pregnancy belly
                        rebuildAntelopeWithBelly(enemy, true);
                        console.log('Antelope mated! Female now gestating');
                    } else {
                        // Walk toward male
                        direction = new THREE.Vector3()
                            .subVectors(targetMate.position, enemy.position)
                            .normalize();
                        speed = enemy.userData.speed * 0.7;
                    }
                }

                // ================================================================
                // GESTATING STATE - Pregnant female
                // ================================================================
                else if (lifecycleState === 'gestating') {
                    enemy.userData.gestationTimer -= delta;

                    if (enemy.userData.gestationTimer <= 0) {
                        // Give birth!
                        spawnBabyAntelope(enemy);
                        enemy.userData.isPregnant = false;
                        enemy.userData.lifecycleState = 'grazing';

                        // Remove pregnancy belly
                        rebuildAntelopeWithBelly(enemy, false);
                        console.log('Antelope gave birth!');
                    } else {
                        // Normal grazing while pregnant (but slower)
                        if (!isLeader && leader && GameState.enemies.includes(leader)) {
                            const distToLeader = enemy.position.distanceTo(leader.position);
                            if (distToLeader > 30) {
                                direction = new THREE.Vector3()
                                    .subVectors(leader.position, enemy.position)
                                    .normalize();
                                speed = enemy.userData.speed * 0.4;
                            } else {
                                speed = 0;
                            }
                        } else {
                            speed = 0;
                        }
                    }
                }

                // ================================================================
                // DEFENSIVE STATE - Attacking player who provoked them
                // ================================================================
                else if (lifecycleState === 'defensive') {
                    enemy.userData.defensiveTimer -= delta;

                    if (enemy.userData.defensiveTimer <= 0) {
                        // Calm down, return to grazing
                        enemy.userData.lifecycleState = 'grazing';
                        enemy.userData.friendly = true;
                    } else {
                        // Chase and attack player
                        const distToPlayer = enemy.position.distanceTo(GameState.peccary.position);

                        if (distToPlayer < 30) {
                            direction = new THREE.Vector3()
                                .subVectors(GameState.peccary.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed * 1.2;

                            // Damage player on contact
                            if (distToPlayer < enemy.userData.radius + GameState.peccary.userData.radius) {
                                Game.takeDamage(enemy.userData.damage * delta, 'antelope');
                            }
                        } else {
                            // Player far away, calm down
                            enemy.userData.lifecycleState = 'grazing';
                            enemy.userData.friendly = true;
                        }
                    }
                }

                // ================================================================
                // FLEEING STATE - Running from wild dog pack
                // ================================================================
                else if (lifecycleState === 'fleeing') {
                    const fleeDir = enemy.userData.fleeDirection;

                    if (fleeDir) {
                        direction = fleeDir.clone();
                        speed = enemy.userData.speed * 1.5; // Run faster than normal!

                        // Occasionally change direction slightly (zig-zag)
                        if (Math.random() < 0.03) {
                            const angleChange = (Math.random() - 0.5) * 0.6;
                            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleChange);
                            enemy.userData.fleeDirection = direction.clone();
                        }

                        // Check if wild dogs are still chasing
                        let stillBeingChased = false;
                        if (GameState.wildDogPacks) {
                            for (const pack of GameState.wildDogPacks) {
                                if (pack.currentHunt && pack.currentHunt.target === enemy) {
                                    stillBeingChased = true;
                                    break;
                                }
                            }
                        }

                        if (!stillBeingChased) {
                            // No longer being chased - return to normal
                            enemy.userData.isFleeing = false;
                            enemy.userData.lifecycleState = enemy.userData.originalLifecycleState || 'grazing';
                        }
                    } else {
                        // No flee direction, just run forward
                        direction = new THREE.Vector3(
                            Math.sin(enemy.rotation.y),
                            0,
                            Math.cos(enemy.rotation.y)
                        );
                        speed = enemy.userData.speed * 1.5;
                    }
                }

                // ================================================================
                // RUTTING APPROACH STATE - Males walking toward each other
                // ================================================================
                else if (lifecycleState === 'rutting_approach') {
                    const rival = enemy.userData.ruttingRival;

                    if (!rival || !GameState.enemies.includes(rival)) {
                        // Rival gone, return to grazing
                        enemy.userData.lifecycleState = 'grazing';
                        enemy.userData.ruttingRival = null;
                        continue;
                    }

                    const distToRival = enemy.position.distanceTo(rival.position);

                    if (distToRival < 2.5) {
                        // Close enough! Start the horn lock!
                        enemy.userData.lifecycleState = 'rutting_lock';
                        enemy.userData.ruttingTimer = 10 + Math.random() * 5;  // 10-15 seconds
                        enemy.userData.ruttingPushDir = 0;  // Will alternate

                        // Face each other
                        const toRival = new THREE.Vector3()
                            .subVectors(rival.position, enemy.position)
                            .normalize();
                        enemy.rotation.y = Math.atan2(toRival.x, toRival.z) + Math.PI / 2;

                        console.log('HORNS LOCKED! Battle begins!');
                    } else {
                        // Walk toward rival with head lowered (aggressive posture)
                        direction = new THREE.Vector3()
                            .subVectors(rival.position, enemy.position)
                            .normalize();
                        speed = enemy.userData.speed * 0.6;  // Slow, deliberate approach

                        // Lower head aggressively
                        const model = enemy.children[0];
                        if (model && model.userData.parts && model.userData.parts.neckGroup) {
                            model.userData.parts.neckGroup.rotation.z = 0.6;  // Head down, horns forward
                        }
                    }
                }

                // ================================================================
                // RUTTING LOCK STATE - Horn-locking battle!
                // ================================================================
                else if (lifecycleState === 'rutting_lock') {
                    const rival = enemy.userData.ruttingRival;

                    if (!rival || !GameState.enemies.includes(rival)) {
                        // Rival gone, we win by default
                        enemy.userData.lifecycleState = 'grazing';
                        enemy.userData.ruttingRival = null;
                        continue;
                    }

                    // Only the challenger processes the battle logic
                    if (enemy.userData.isChallenger) {
                        enemy.userData.ruttingTimer -= delta;

                        // Push animation - alternate pushing
                        enemy.userData.ruttingPushPhase = (enemy.userData.ruttingPushPhase || 0) + delta * 3;
                        const pushAmount = Math.sin(enemy.userData.ruttingPushPhase) * 0.3;

                        // Move both antelope slightly based on push
                        const pushDir = new THREE.Vector3()
                            .subVectors(rival.position, enemy.position)
                            .normalize();

                        // Challenger pushes forward, defender gets pushed back, then vice versa
                        enemy.position.x += pushDir.x * pushAmount * delta * 2;
                        enemy.position.z += pushDir.z * pushAmount * delta * 2;
                        rival.position.x -= pushDir.x * pushAmount * delta * 2;
                        rival.position.z -= pushDir.z * pushAmount * delta * 2;

                        // Keep them facing each other
                        enemy.rotation.y = Math.atan2(pushDir.x, pushDir.z) + Math.PI / 2;
                        rival.rotation.y = Math.atan2(-pushDir.x, -pushDir.z) + Math.PI / 2;

                        // Battle animation - legs bracing, body straining
                        const strainAmount = Math.abs(Math.sin(enemy.userData.ruttingPushPhase * 2)) * 0.1;
                        enemy.position.y = strainAmount;
                        rival.position.y = strainAmount;

                        // Head/neck locked position
                        const enemyModel = enemy.children[0];
                        const rivalModel = rival.children[0];
                        if (enemyModel && enemyModel.userData.parts && enemyModel.userData.parts.neckGroup) {
                            enemyModel.userData.parts.neckGroup.rotation.z = 0.5 + pushAmount * 0.3;
                        }
                        if (rivalModel && rivalModel.userData.parts && rivalModel.userData.parts.neckGroup) {
                            rivalModel.userData.parts.neckGroup.rotation.z = 0.5 - pushAmount * 0.3;
                        }

                        // Time's up! Determine winner!
                        if (enemy.userData.ruttingTimer <= 0) {
                            // Calculate win chance
                            // 50% against regular males, 40% against the leader
                            const winChance = rival.userData.isLeader ? 0.4 : 0.5;
                            const challengerWins = Math.random() < winChance;

                            const winner = challengerWins ? enemy : rival;
                            const loser = challengerWins ? rival : enemy;

                            // Find the herd
                            const herd = GameState.antelopeHerds.find(h => h.id === enemy.userData.herdId);
                            if (herd) {
                                handleRuttingOutcome(winner, loser, herd);
                            }

                            // Reset head positions
                            if (enemyModel && enemyModel.userData.parts && enemyModel.userData.parts.neckGroup) {
                                enemyModel.userData.parts.neckGroup.rotation.z = 0;
                            }
                            if (rivalModel && rivalModel.userData.parts && rivalModel.userData.parts.neckGroup) {
                                rivalModel.userData.parts.neckGroup.rotation.z = 0;
                            }
                        }
                    }

                    // No movement during lock - they're stationary pushing
                    speed = 0;
                }

                // Check if player attacks (damages) this antelope
                // This is handled by detecting health loss elsewhere, but check for collision
                const distToPlayer = enemy.position.distanceTo(GameState.peccary.position);
                if (distToPlayer < enemy.userData.radius + GameState.peccary.userData.radius) {
                    // Player touching antelope - if player is sprinting, consider it an attack
                    if (GameState.keys && GameState.keys['ShiftLeft'] && enemy.userData.friendly) {
                        // Player "attacked" - antelope becomes defensive
                        enemy.userData.health -= 5;
                        if (enemy.userData.health > 0) {
                            enemy.userData.lifecycleState = 'defensive';
                            enemy.userData.defensiveTimer = 10; // Angry for 10 seconds
                            enemy.userData.friendly = false;

                            // Alert nearby herd members
                            const herd = GameState.antelopeHerds.find(h => h.id === enemy.userData.herdId);
                            if (herd) {
                                herd.members.forEach(member => {
                                    if (member !== enemy && !member.userData.isBaby) {
                                        member.userData.lifecycleState = 'defensive';
                                        member.userData.defensiveTimer = 8;
                                        member.userData.friendly = false;
                                    }
                                });
                            }
                            console.log('Antelope herd provoked! They are angry!');
                        } else {
                            // Antelope died
                            GameState.scene.remove(enemy);
                            const herd = GameState.antelopeHerds.find(h => h.id === enemy.userData.herdId);
                            if (herd) {
                                herd.members = herd.members.filter(m => m !== enemy);
                            }
                            GameState.enemies.splice(i, 1);
                            i--;
                            GameState.score += 20;
                            console.log('Antelope killed');
                            continue;
                        }
                    }
                }

                // Apply movement (only if actually moving)
                if (direction && speed > 0.1) {
                    enemy.position.x += direction.x * speed * delta;
                    enemy.position.z += direction.z * speed * delta;

                    // Face movement direction (very smooth turning)
                    const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI / 2;
                    let currentRotation = enemy.rotation.y;
                    let diff = targetRotation - currentRotation;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    // Very slow, smooth turning to avoid twitching
                    enemy.rotation.y = currentRotation + diff * 0.03;
                }

                // ============================================================
                // HYPERREALISTIC WALKING ANIMATION
                // Uses diagonal gait like real ungulates (deer, antelope, horses)
                // Diagonal pairs: Front-Left + Back-Right, then Front-Right + Back-Left
                // ============================================================
                const model = enemy.children[0];
                if (model && model.userData.legs) {
                    if (speed > 0.5) {
                        // Walking - animate legs with diagonal gait
                        // Speed-based walk cycle (faster movement = faster legs)
                        const walkSpeed = 4 + speed * 0.8;  // Base speed + movement speed multiplier

                        // Initialize walk phase if needed
                        if (enemy.userData.walkPhase === undefined) {
                            enemy.userData.walkPhase = 0;
                        }
                        enemy.userData.walkPhase += delta * walkSpeed;

                        model.userData.legs.forEach((leg, idx) => {
                            // Diagonal gait pattern:
                            // Pair A: Front-Right (idx 0) + Back-Left (idx 3)
                            // Pair B: Front-Left (idx 1) + Back-Right (idx 2)
                            const isPairA = (idx === 0 || idx === 3);
                            const phase = isPairA ? enemy.userData.walkPhase : enemy.userData.walkPhase + Math.PI;

                            // Calculate leg position in walk cycle
                            const cyclePos = Math.sin(phase);
                            const cycleAbs = Math.abs(cyclePos);

                            // Different swing for front vs back legs
                            const swingMultiplier = leg.isFront ? 0.4 : 0.5;  // Back legs swing more
                            const kneeMultiplier = leg.isFront ? 0.5 : 0.7;   // Back knees bend more

                            // Upper leg (hip) rotation - swings forward and back
                            // Model is rotated 180°, so we use Z-axis for forward/back swing
                            // Positive Z = leg swings backward, Negative Z = leg swings forward
                            const hipSwing = cyclePos * swingMultiplier;
                            leg.group.rotation.z = hipSwing;

                            // Knee bend - bends when leg is in the air (moving forward)
                            // Real antelope lift their knees high when stepping forward
                            // Negative Z on lower leg = knee bends (foot goes backward/up)
                            const isLifting = cyclePos > 0;  // Leg swinging forward = lifting off ground
                            let kneeBend;
                            if (isLifting) {
                                // Leg in air - bend knee significantly
                                kneeBend = -cycleAbs * kneeMultiplier;
                            } else {
                                // Leg on ground - straighten out for support
                                kneeBend = cycleAbs * 0.1;  // Slight extension when pushing off
                            }
                            leg.lowerLegGroup.rotation.z = kneeBend;
                        });

                        // Body bob - subtle up/down movement synced with walk
                        // Highest point when diagonal pairs switch
                        const bodyBob = Math.abs(Math.sin(enemy.userData.walkPhase * 2)) * 0.02;
                        enemy.position.y = bodyBob;

                        // Subtle body sway - slight tilt with each step
                        const bodySway = Math.sin(enemy.userData.walkPhase) * 0.02;
                        model.rotation.z = bodySway;

                        // Head bob - moves opposite to body for counter-balance
                        if (model.userData.parts && model.userData.parts.neckGroup) {
                            // Only apply head bob if not already grazing
                            if (!enemy.userData.isGrazing) {
                                const headBob = Math.sin(enemy.userData.walkPhase + Math.PI) * 0.05;
                                model.userData.parts.neckGroup.rotation.x = headBob;
                            }
                        }
                    } else {
                        // Standing still - reset legs to neutral position smoothly
                        model.userData.legs.forEach(leg => {
                            // Smoothly return to standing pose
                            leg.group.rotation.z *= 0.9;  // Decay toward 0
                            leg.lowerLegGroup.rotation.z *= 0.9;
                        });

                        // Reset body position and rotation
                        enemy.position.y *= 0.9;
                        model.rotation.z *= 0.9;

                        // Reset head bob if not grazing
                        if (model.userData.parts && model.userData.parts.neckGroup && !enemy.userData.isGrazing) {
                            model.userData.parts.neckGroup.rotation.x *= 0.9;
                        }
                    }
                }

                continue;
            }
            // ================================================================
            // NEW WORLD HUNTER'S WILD DOG - Pack behavior
            // ================================================================
            else if (enemy.userData.type === 'wild_dog') {
                const lifecycleState = enemy.userData.lifecycleState || 'following';
                const alpha = enemy.userData.alpha;
                const isAlpha = enemy.userData.isAlpha;
                const pack = GameState.wildDogPacks ?
                    GameState.wildDogPacks.find(p => p.id === enemy.userData.packId) : null;

                // ================================================================
                // FOLLOWING STATE - Wander nearby, follow when getting far
                // ================================================================
                if (lifecycleState === 'following') {
                    // Check for nearby grass vipers (weasels) to chase
                    const nearbyViper = GameState.enemies.find(e =>
                        e.userData.type === 'grass_viper' &&
                        e.userData.health > 0 &&
                        enemy.position.distanceTo(e.position) < 10
                    );

                    if (nearbyViper) {
                        // Spotted a weasel! Chase it!
                        enemy.userData.lifecycleState = 'chasing_weasel';
                        enemy.userData.weaselTarget = nearbyViper;
                        console.log('Wild dog spotted a grass viper!');
                        continue;
                    }

                    if (!isAlpha && alpha && GameState.enemies.includes(alpha)) {
                        const distToAlpha = enemy.position.distanceTo(alpha.position);

                        if (distToAlpha > 18) {
                            // Too far - run to catch up!
                            direction = new THREE.Vector3()
                                .subVectors(alpha.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed * 0.8;
                        } else if (distToAlpha > 12) {
                            // Getting far - walk toward alpha
                            direction = new THREE.Vector3()
                                .subVectors(alpha.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed * 0.5;
                        } else {
                            // Close enough - wander but bias toward alpha
                            enemy.userData.wanderTime = (enemy.userData.wanderTime || 0) + delta;

                            // Change direction every 6-12 seconds
                            if (!enemy.userData.wanderDir || enemy.userData.wanderTime > 6 + Math.random() * 6) {
                                // Mix random direction with direction toward alpha
                                const toAlpha = new THREE.Vector3()
                                    .subVectors(alpha.position, enemy.position)
                                    .normalize();
                                const randomDir = new THREE.Vector3(
                                    Math.random() - 0.5, 0, Math.random() - 0.5
                                ).normalize();

                                // 30% bias toward alpha, 70% random
                                enemy.userData.wanderDir = new THREE.Vector3(
                                    randomDir.x * 0.7 + toAlpha.x * 0.3,
                                    0,
                                    randomDir.z * 0.7 + toAlpha.z * 0.3
                                ).normalize();
                                enemy.userData.wanderTime = 0;
                            }

                            direction = enemy.userData.wanderDir;
                            speed = enemy.userData.speed * 0.18;  // Slow wandering
                        }
                    } else if (isAlpha) {
                        // Alpha leads the pack - wanders slowly
                        enemy.userData.wanderTime = (enemy.userData.wanderTime || 0) + delta;
                        if (enemy.userData.wanderTime > 15 + Math.random() * 10) {
                            enemy.userData.wanderDir = new THREE.Vector3(
                                Math.random() - 0.5, 0, Math.random() - 0.5
                            ).normalize();
                            enemy.userData.wanderTime = 0;
                        }
                        direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                        speed = enemy.userData.speed * 0.15;  // Slower wandering
                    }
                }

                // ================================================================
                // CHASING WEASEL STATE - Chase and kill grass vipers
                // ================================================================
                else if (lifecycleState === 'chasing_weasel') {
                    const target = enemy.userData.weaselTarget;

                    // Check if target is still valid
                    if (!target || !GameState.enemies.includes(target) || target.userData.health <= 0) {
                        // Target gone, go back to following
                        enemy.userData.lifecycleState = 'following';
                        enemy.userData.weaselTarget = null;
                        continue;
                    }

                    const distToTarget = enemy.position.distanceTo(target.position);

                    if (distToTarget < 1.5) {
                        // Close enough - attack!
                        target.userData.health -= 50;  // Big damage from wild dog

                        if (target.userData.health <= 0) {
                            // Killed the weasel!
                            console.log('Wild dog killed a grass viper!');
                            GameState.scene.remove(target);
                            const idx = GameState.enemies.indexOf(target);
                            if (idx > -1) GameState.enemies.splice(idx, 1);
                        } else {
                            console.log('Wild dog attacked grass viper! Health:', target.userData.health);
                        }

                        // Go back to following
                        enemy.userData.lifecycleState = 'following';
                        enemy.userData.weaselTarget = null;
                    } else if (distToTarget > 25) {
                        // Too far, give up chase
                        enemy.userData.lifecycleState = 'following';
                        enemy.userData.weaselTarget = null;
                        console.log('Wild dog gave up chase');
                    } else {
                        // Chase the weasel at sprint speed!
                        direction = new THREE.Vector3()
                            .subVectors(target.position, enemy.position)
                            .normalize();
                        speed = enemy.userData.speed * 1.5;  // Sprint chase!
                    }
                }

                // ================================================================
                // PREGNANT STATE - Gestating female
                // ================================================================
                else if (lifecycleState === 'pregnant') {
                    enemy.userData.gestationTimer -= delta;

                    if (enemy.userData.gestationTimer <= 0) {
                        // Time to find a den spot!
                        enemy.userData.lifecycleState = 'finding_den';
                        console.log('Pregnant wild dog ready to find den!');
                    } else {
                        // Follow alpha but slower
                        if (alpha && GameState.enemies.includes(alpha)) {
                            direction = new THREE.Vector3()
                                .subVectors(alpha.position, enemy.position)
                                .normalize();
                            const distToAlpha = enemy.position.distanceTo(alpha.position);
                            speed = distToAlpha > 15 ? enemy.userData.speed * 0.5 : 0;
                        }
                    }
                }

                // ================================================================
                // FINDING DEN STATE - Looking for tree to den under
                // ================================================================
                else if (lifecycleState === 'finding_den') {
                    // Find nearest tree
                    let nearestTree = null;
                    let nearestDist = Infinity;

                    if (GameState.trees) {
                        for (const tree of GameState.trees) {
                            const dist = enemy.position.distanceTo(tree.position);
                            if (dist < nearestDist) {
                                nearestDist = dist;
                                nearestTree = tree;
                            }
                        }
                    }

                    if (nearestTree && nearestDist < 3) {
                        // At tree - create den and give birth!
                        const den = createWildDogDen(enemy, nearestTree.position);
                        const pupCount = 4 + Math.floor(Math.random() * 4); // 4-7 pups
                        spawnWildDogPups(enemy, pupCount);
                        enemy.userData.lifecycleState = 'denning';
                        enemy.userData.isMother = true;
                        enemy.userData.denId = den.id;
                        console.log('Wild dog gave birth to', pupCount, 'pups at den!');
                    } else if (nearestTree) {
                        // Walk toward tree
                        direction = new THREE.Vector3()
                            .subVectors(nearestTree.position, enemy.position)
                            .normalize();
                        speed = enemy.userData.speed * 0.4;
                    }
                }

                // ================================================================
                // DENNING STATE - Mother at den with pups
                // ================================================================
                else if (lifecycleState === 'denning') {
                    const den = GameState.wildDogDens ?
                        GameState.wildDogDens.find(d => d.id === enemy.userData.denId) : null;

                    if (den) {
                        // Stay at den
                        const denPos = new THREE.Vector3(den.position.x, 0, den.position.z);
                        const distToDen = enemy.position.distanceTo(denPos);

                        if (distToDen > 2) {
                            direction = new THREE.Vector3()
                                .subVectors(denPos, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed * 0.3;
                        } else {
                            // Lying down at den
                            speed = 0;
                            enemy.position.y = -0.1; // Lower body (lying down)
                        }

                        // Check if all pups have grown up
                        const remainingPups = enemy.userData.pups.filter(p =>
                            GameState.enemies.includes(p) && p.userData.isBaby
                        );
                        if (remainingPups.length === 0 && enemy.userData.pups.length > 0) {
                            // All pups grown! Return to pack
                            enemy.userData.lifecycleState = 'following';
                            enemy.userData.isMother = false;
                            enemy.position.y = 0;
                            // Remove pregnancy belly
                            rebuildWildDogModel(enemy, false);

                            // Remove den
                            if (den.mesh) GameState.scene.remove(den.mesh);
                            const denIdx = GameState.wildDogDens.indexOf(den);
                            if (denIdx > -1) GameState.wildDogDens.splice(denIdx, 1);
                            if (pack) pack.den = null;

                            console.log('Wild dog mother rejoins pack, pups grown!');
                        }
                    } else {
                        // No den found, return to following
                        enemy.userData.lifecycleState = 'following';
                    }
                }

                // ================================================================
                // PUP STATE - Baby staying near mother in den
                // ================================================================
                else if (lifecycleState === 'pup') {
                    const mother = enemy.userData.mother;

                    // Check if time to grow up (7 minutes)
                    if (GameState.timeElapsed >= enemy.userData.maturityTime) {
                        growWildDogPup(enemy);
                        continue;
                    }

                    // Stay near mother at den
                    if (mother && GameState.enemies.includes(mother)) {
                        const den = GameState.wildDogDens ?
                            GameState.wildDogDens.find(d => d.id === mother.userData.denId) : null;

                        if (den) {
                            const denPos = new THREE.Vector3(den.position.x, 0, den.position.z);
                            const distToDen = enemy.position.distanceTo(denPos);

                            if (distToDen > 2) {
                                direction = new THREE.Vector3()
                                    .subVectors(denPos, enemy.position)
                                    .normalize();
                                speed = 2;
                            } else {
                                // Stay in den, tiny movements
                                speed = 0;
                            }
                        }
                    }
                }

                // ================================================================
                // HUNTING CHASE STATE - Pack chasing antelope
                // ================================================================
                else if (lifecycleState === 'hunting_chase') {
                    const target = enemy.userData.huntTarget;
                    const hunt = pack ? pack.currentHunt : null;

                    if (!target || !hunt || !GameState.enemies.includes(target)) {
                        enemy.userData.lifecycleState = 'following';
                        enemy.userData.isHunting = false;
                        continue;
                    }

                    // Chase target at SPRINT speed! (1.5x normal speed)
                    direction = new THREE.Vector3()
                        .subVectors(target.position, enemy.position)
                        .normalize();
                    speed = enemy.userData.speed * 1.5;  // Sprint hunting speed!

                    // Make antelope flee if not already
                    if (!target.userData.isFleeing) {
                        target.userData.isFleeing = true;
                        target.userData.fleeDirection = new THREE.Vector3()
                            .subVectors(target.position, enemy.position)
                            .normalize();
                        target.userData.originalLifecycleState = target.userData.lifecycleState;
                        target.userData.lifecycleState = 'fleeing';
                    }

                    // Only leader processes hunt outcome
                    if (enemy === hunt.leader) {
                        const distToTarget = enemy.position.distanceTo(target.position);

                        if (distToTarget < 4) {
                            hunt.timer = (hunt.timer || 0) + delta;

                            if (hunt.timer > 5) {
                                // 5 seconds of close chase - trigger outcome!
                                if (hunt.outcome === 'escape') {
                                    // Antelope escapes
                                    endWildDogHunt(pack, 'escape');
                                } else if (hunt.outcome === 'fight_back') {
                                    // Transition to fight
                                    hunt.state = 'fighting';
                                    hunt.timer = 0;
                                    hunt.participants.forEach(p => {
                                        p.userData.lifecycleState = 'hunting_fight';
                                    });
                                } else if (hunt.outcome === 'success') {
                                    // Transition to takedown
                                    hunt.state = 'takedown';
                                    hunt.timer = 0;
                                    hunt.participants.forEach(p => {
                                        p.userData.lifecycleState = 'hunting_takedown';
                                    });
                                }
                            }
                        }
                    }
                }

                // ================================================================
                // HUNTING FIGHT STATE - Antelope fighting back
                // ================================================================
                else if (lifecycleState === 'hunting_fight') {
                    const hunt = pack ? pack.currentHunt : null;
                    if (!hunt) {
                        enemy.userData.lifecycleState = 'following';
                        continue;
                    }

                    speed = 0; // Stationary during fight

                    // Only leader processes fight logic
                    if (enemy === hunt.leader) {
                        hunt.timer += delta;

                        // Fight lasts 3 seconds
                        if (hunt.timer > 3) {
                            // Kill the casualty
                            if (hunt.casualty && GameState.enemies.includes(hunt.casualty)) {
                                console.log('Wild dog killed by antelope!', hunt.casualty.userData.gender);

                                // Remove from pack
                                if (pack) {
                                    const idx = pack.members.indexOf(hunt.casualty);
                                    if (idx > -1) pack.members.splice(idx, 1);
                                }

                                // Remove from game
                                GameState.scene.remove(hunt.casualty);
                                const enemyIdx = GameState.enemies.indexOf(hunt.casualty);
                                if (enemyIdx > -1) GameState.enemies.splice(enemyIdx, 1);
                            }

                            // Antelope survives but is now INJURED - will be targeted in next hunt!
                            if (hunt.target && GameState.enemies.includes(hunt.target)) {
                                hunt.target.userData.health -= 15;
                                hunt.target.userData.isInjured = true;
                                console.log('Antelope is now INJURED and will be targeted next hunt!');
                            }

                            // End hunt
                            endWildDogHunt(pack, 'fight_back');
                        }
                    }
                }

                // ================================================================
                // HUNTING TAKEDOWN STATE - Successful kill animation
                // ================================================================
                else if (lifecycleState === 'hunting_takedown') {
                    const hunt = pack ? pack.currentHunt : null;
                    const target = hunt ? hunt.target : null;

                    if (!hunt || !target) {
                        enemy.userData.lifecycleState = 'following';
                        continue;
                    }

                    // Circle around target (cool takedown animation!)
                    const angleOffset = (hunt.participants.indexOf(enemy) / hunt.participants.length) * Math.PI * 2;
                    const circleRadius = 2;
                    const targetX = target.position.x + Math.cos(angleOffset + GameState.clock.elapsedTime) * circleRadius;
                    const targetZ = target.position.z + Math.sin(angleOffset + GameState.clock.elapsedTime) * circleRadius;

                    direction = new THREE.Vector3(targetX - enemy.position.x, 0, targetZ - enemy.position.z).normalize();
                    speed = enemy.userData.speed * 0.5;

                    // Face target
                    const toTarget = new THREE.Vector3()
                        .subVectors(target.position, enemy.position);
                    enemy.rotation.y = Math.atan2(toTarget.x, toTarget.z);

                    // Only leader processes takedown
                    if (enemy === hunt.leader) {
                        hunt.timer += delta;

                        // Takedown complete after 3 seconds
                        if (hunt.timer > 3) {
                            // Kill the antelope!
                            console.log('Wild dogs successfully killed antelope!');

                            // Remove from herd
                            GameState.antelopeHerds.forEach(herd => {
                                const idx = herd.members.indexOf(target);
                                if (idx > -1) herd.members.splice(idx, 1);
                            });

                            // Remove from game
                            GameState.scene.remove(target);
                            const idx = GameState.enemies.indexOf(target);
                            if (idx > -1) GameState.enemies.splice(idx, 1);

                            // Transition to eating
                            hunt.state = 'eating';
                            hunt.timer = 0;
                            hunt.killPosition = target.position.clone();
                            hunt.participants.forEach(p => {
                                p.userData.lifecycleState = 'eating';
                            });
                        }
                    }
                }

                // ================================================================
                // EATING STATE - Pack eating at kill site (3 minutes)
                // ================================================================
                else if (lifecycleState === 'eating') {
                    const hunt = pack ? pack.currentHunt : null;

                    if (!hunt) {
                        enemy.userData.lifecycleState = 'following';
                        continue;
                    }

                    // Stay at kill site
                    if (hunt.killPosition) {
                        const distToKill = enemy.position.distanceTo(hunt.killPosition);
                        if (distToKill > 3) {
                            direction = new THREE.Vector3()
                                .subVectors(hunt.killPosition, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed * 0.3;
                        } else {
                            speed = 0;
                        }
                    }

                    // Eating animation - head down
                    const model = enemy.children[0];
                    if (model && model.userData.parts && model.userData.parts.neckGroup) {
                        const eatPhase = (GameState.clock.elapsedTime * 2) % (Math.PI * 2);
                        model.userData.parts.neckGroup.rotation.z = 0.7 + Math.sin(eatPhase) * 0.15;
                    }

                    // Only leader processes eating timer
                    if (enemy === hunt.leader) {
                        hunt.timer += delta;

                        // Eat for 3 minutes (180 seconds)
                        if (hunt.timer > 180) {
                            // Check if need to bring food to den
                            if (pack.den && pack.den.state === 'active') {
                                hunt.state = 'returning';
                                hunt.timer = 0;
                                hunt.participants.forEach(p => {
                                    p.userData.lifecycleState = 'returning';
                                    // Reset head position
                                    const m = p.children[0];
                                    if (m && m.userData.parts && m.userData.parts.neckGroup) {
                                        m.userData.parts.neckGroup.rotation.z = 0;
                                    }
                                });
                            } else {
                                // No den, return to normal
                                endWildDogHunt(pack, 'success_no_den');
                            }
                        }
                    }
                }

                // ================================================================
                // RETURNING STATE - Bringing food to den
                // ================================================================
                else if (lifecycleState === 'returning') {
                    const hunt = pack ? pack.currentHunt : null;
                    const den = pack ? pack.den : null;

                    if (!hunt || !den) {
                        enemy.userData.lifecycleState = 'following';
                        continue;
                    }

                    // Walk toward den
                    const denPos = new THREE.Vector3(den.position.x, 0, den.position.z);
                    const distToDen = enemy.position.distanceTo(denPos);

                    if (distToDen < 4) {
                        // At den - transition to resting
                        if (enemy === hunt.leader) {
                            hunt.state = 'resting';
                            hunt.timer = 0;
                            hunt.participants.forEach(p => {
                                p.userData.lifecycleState = 'resting';
                            });
                            console.log('Wild dogs brought food to den, now resting');
                        }
                    } else {
                        direction = new THREE.Vector3()
                            .subVectors(denPos, enemy.position)
                            .normalize();
                        speed = enemy.userData.speed * 0.7;
                    }
                }

                // ================================================================
                // RESTING STATE - Lying down at den with mother
                // ================================================================
                else if (lifecycleState === 'resting') {
                    const hunt = pack ? pack.currentHunt : null;

                    speed = 0;
                    enemy.position.y = -0.1; // Lying down

                    // Resting pose - legs tucked
                    const model = enemy.children[0];
                    if (model && model.userData.legs) {
                        model.userData.legs.forEach(leg => {
                            if (leg.isFront) {
                                leg.group.rotation.z = 0.6;
                                leg.lowerLegGroup.rotation.z = -0.8;
                            } else {
                                leg.group.rotation.z = -0.4;
                                leg.lowerLegGroup.rotation.z = 0.6;
                            }
                        });
                    }

                    if (hunt && enemy === hunt.leader) {
                        hunt.timer += delta;

                        // Rest for 2 minutes (120 seconds)
                        if (hunt.timer > 120) {
                            endWildDogHunt(pack, 'success_complete');
                        }
                    }
                }

                // ================================================================
                // FLEEING STATE (for antelope being chased)
                // This is handled in antelope section, but wild dogs need to
                // recognize when antelope are fleeing
                // ================================================================

                // Apply movement and rotation
                if (direction && speed > 0.1) {
                    // Move the dog
                    enemy.position.x += direction.x * speed * delta;
                    enemy.position.z += direction.z * speed * delta;
                }

                // Always face movement direction when moving (even at slow speeds)
                // This fixes the pack not rotating to their movement direction
                // Add Math.PI / 2 offset because the model is built facing +X but we want it to face +Z
                if (direction && (direction.x !== 0 || direction.z !== 0)) {
                    const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI / 2;
                    let diff = targetRotation - enemy.rotation.y;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    enemy.rotation.y += diff * 0.08;  // Smooth but responsive turning
                }

                // Walking/Running animation
                const model = enemy.children[0];
                if (model && model.userData.legs && speed > 0.5 && lifecycleState !== 'resting') {
                    const isHuntChasing = lifecycleState === 'hunting_chase' || lifecycleState === 'chasing_weasel';
                    const isRunning = enemy.userData.isHunting || isHuntChasing || speed > enemy.userData.speed * 0.6;

                    // SPECIAL SPRINT ANIMATION when hunting!
                    if (isHuntChasing) {
                        // Super fast galloping animation
                        const gallop = 14 + speed * 0.8;  // Very fast leg cycle
                        enemy.userData.walkPhase = (enemy.userData.walkPhase || 0) + delta * gallop;

                        model.userData.legs.forEach((leg, idx) => {
                            // Front legs and back legs move together (gallop pattern)
                            const isFront = leg.isFront;
                            const phase = isFront ? enemy.userData.walkPhase : enemy.userData.walkPhase + Math.PI * 0.6;
                            const cyclePos = Math.sin(phase);

                            // Extended stride when sprinting
                            const swingMult = 1.1;  // Big leg swings
                            const kneeMult = 1.3;   // Deep knee bends

                            leg.group.rotation.z = cyclePos * swingMult;
                            const kneeBend = cyclePos > 0 ? -cyclePos * kneeMult : cyclePos * 0.3;
                            leg.lowerLegGroup.rotation.z = kneeBend;
                        });

                        // Dramatic body bob and forward lean during sprint
                        const sprintBob = 0.12;
                        if (enemy.position.y >= -0.1) {
                            enemy.position.y = Math.abs(Math.sin(enemy.userData.walkPhase * 2)) * sprintBob;
                        }

                        // Lean body forward during chase
                        if (model.userData.parts && model.userData.parts.bodyGroup) {
                            model.userData.parts.bodyGroup.rotation.z = 0.15;  // Lean forward
                        }
                    } else {
                        // Normal walking/running animation
                        const walkSpeed = isRunning ? 8 + speed * 0.5 : 5 + speed * 0.6;
                        enemy.userData.walkPhase = (enemy.userData.walkPhase || 0) + delta * walkSpeed;

                        model.userData.legs.forEach((leg, idx) => {
                            const isPairA = (idx === 0 || idx === 3);
                            const phase = isPairA ? enemy.userData.walkPhase : enemy.userData.walkPhase + Math.PI;
                            const cyclePos = Math.sin(phase);

                            // More pronounced movement when running
                            const swingMult = isRunning ? 0.8 : 0.5;
                            const kneeMult = isRunning ? 1.0 : 0.6;

                            leg.group.rotation.z = cyclePos * swingMult;
                            const kneeBend = cyclePos > 0 ? -cyclePos * kneeMult : cyclePos * 0.15;
                            leg.lowerLegGroup.rotation.z = kneeBend;
                        });

                        // Normal body bob
                        const bobAmount = isRunning ? 0.05 : 0.02;
                        if (enemy.position.y >= 0) {
                            enemy.position.y = Math.abs(Math.sin(enemy.userData.walkPhase * 2)) * bobAmount;
                        }

                        // Reset body lean
                        if (model.userData.parts && model.userData.parts.bodyGroup) {
                            model.userData.parts.bodyGroup.rotation.z *= 0.9;
                        }
                    }
                } else if (model && model.userData.legs && speed <= 0.5 && lifecycleState !== 'resting') {
                    // Standing - reset legs
                    model.userData.legs.forEach(leg => {
                        leg.group.rotation.z *= 0.9;
                        leg.lowerLegGroup.rotation.z *= 0.9;
                    });
                }

                continue;
            }
            // Saltas Gazella behavior - fastest animal, herd grazing
            else if (enemy.userData.type === 'saltas_gazella') {
                const lifecycleState = enemy.userData.lifecycleState || 'grazing';
                let direction = null;
                let speed = 0;

                // ================================================================
                // GRAZING STATE - Calm herd behavior
                // ================================================================
                if (lifecycleState === 'grazing') {
                    // Initialize wander target time if not set
                    if (enemy.userData.wanderTargetTime === undefined) {
                        enemy.userData.wanderTargetTime = 4 + Math.random() * 3;
                    }

                    // Find herd center to stay near
                    const herd = GameState.saltasGazellaHerds.find(h => h.members && h.members.includes(enemy));
                    if (herd && herd.members) {
                        // Calculate herd center
                        let centerX = 0, centerZ = 0;
                        let validMembers = 0;
                        for (const member of herd.members) {
                            if (member && GameState.enemies.includes(member)) {
                                centerX += member.position.x;
                                centerZ += member.position.z;
                                validMembers++;
                            }
                        }
                        if (validMembers > 0) {
                            centerX /= validMembers;
                            centerZ /= validMembers;
                        }

                        const distToCenter = Math.sqrt(
                            Math.pow(enemy.position.x - centerX, 2) +
                            Math.pow(enemy.position.z - centerZ, 2)
                        );

                        // If too far from herd, move back
                        if (distToCenter > 12) {
                            direction = new THREE.Vector3(centerX - enemy.position.x, 0, centerZ - enemy.position.z).normalize();
                            speed = enemy.userData.speed * 0.6;
                        } else {
                            // Gentle wandering within herd
                            enemy.userData.wanderTime = (enemy.userData.wanderTime || 0) + delta;
                            if (enemy.userData.wanderTime > enemy.userData.wanderTargetTime) {
                                const angle = Math.random() * Math.PI * 2;
                                enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                                enemy.userData.wanderTime = 0;
                                enemy.userData.wanderTargetTime = 4 + Math.random() * 3;  // New random target
                            }
                            direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                            speed = enemy.userData.speed * 0.3;
                        }
                    } else {
                        // No herd, just wander
                        enemy.userData.wanderTime = (enemy.userData.wanderTime || 0) + delta;
                        if (enemy.userData.wanderTime > enemy.userData.wanderTargetTime) {
                            const angle = Math.random() * Math.PI * 2;
                            enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                            enemy.userData.wanderTime = 0;
                            enemy.userData.wanderTargetTime = 3 + Math.random() * 2;
                        }
                        direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                        speed = enemy.userData.speed * 0.3;
                    }

                    // Check for wild dogs nearby - if spotted, flee!
                    for (const other of GameState.enemies) {
                        if (other.userData.type === 'wild_dog') {
                            const distToDog = enemy.position.distanceTo(other.position);
                            if (distToDog < 20) {
                                // Spotted! Start fleeing
                                enemy.userData.lifecycleState = 'fleeing';
                                enemy.userData.fleeFrom = other;
                                enemy.userData.fleeTimer = 10 + Math.random() * 5;
                                break;
                            }
                        }
                    }
                }

                // ================================================================
                // FLEEING STATE - EXTREMELY fast escape!
                // ================================================================
                else if (lifecycleState === 'fleeing') {
                    const fleeFrom = enemy.userData.fleeFrom;
                    enemy.userData.fleeTimer = (enemy.userData.fleeTimer || 0) - delta;

                    if (fleeFrom && GameState.enemies.includes(fleeFrom)) {
                        // Use the EXTREMELY fast fleeSpeed (25!)
                        direction = new THREE.Vector3()
                            .subVectors(enemy.position, fleeFrom.position)
                            .normalize();
                        speed = enemy.userData.fleeSpeed || 25;  // FASTEST in the game!
                    } else {
                        // Flee in current direction
                        direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                        speed = enemy.userData.fleeSpeed || 25;
                    }

                    // Stop fleeing if timer expires or far enough away
                    const distFromThreat = fleeFrom ? enemy.position.distanceTo(fleeFrom.position) : 100;
                    if (enemy.userData.fleeTimer <= 0 || distFromThreat > 50) {
                        enemy.userData.lifecycleState = 'grazing';
                        enemy.userData.fleeFrom = null;
                        enemy.userData.fleeTimer = 0;
                    }
                }

                // ================================================================
                // SEEKING MATE STATE - Female approaches chosen male
                // ================================================================
                else if (lifecycleState === 'seeking_mate') {
                    const targetMate = enemy.userData.targetMate;

                    if (!targetMate || !GameState.enemies.includes(targetMate)) {
                        enemy.userData.lifecycleState = 'grazing';
                        enemy.userData.targetMate = null;
                        continue;
                    }

                    const distToMate = enemy.position.distanceTo(targetMate.position);

                    if (distToMate < 1.5) {
                        // Mate! Female becomes pregnant
                        enemy.userData.isPregnant = true;
                        enemy.userData.gestationTimer = 240;  // 4 minutes
                        enemy.userData.lifecycleState = 'pregnant';
                        enemy.userData.targetMate = null;
                        enemy.userData.mateGender = targetMate.userData.gender;

                        // Rebuild model with pregnancy belly
                        rebuildSaltasGazellaWithBelly(enemy, true);

                        console.log('Saltas Gazella mated! Female now pregnant');
                    } else {
                        // Walk toward mate
                        direction = new THREE.Vector3()
                            .subVectors(targetMate.position, enemy.position)
                            .normalize();
                        speed = enemy.userData.speed * 0.8;
                    }
                }

                // ================================================================
                // PREGNANT STATE - Gestating, slower movement
                // ================================================================
                else if (lifecycleState === 'pregnant') {
                    enemy.userData.gestationTimer -= delta;

                    if (enemy.userData.gestationTimer <= 0) {
                        // Give birth!
                        spawnSaltasGazellaBaby(enemy);
                        enemy.userData.isPregnant = false;
                        enemy.userData.lifecycleState = 'mothering';
                        enemy.userData.motheringTimer = 300;  // 5 minutes

                        // Rebuild model without belly
                        rebuildSaltasGazellaWithBelly(enemy, false);
                        console.log('Saltas Gazella gave birth!');
                    } else {
                        // Slow grazing while pregnant
                        const herd = GameState.saltasGazellaHerds.find(h => h.members && h.members.includes(enemy));
                        if (herd && herd.members) {
                            let centerX = 0, centerZ = 0, count = 0;
                            for (const m of herd.members) {
                                if (m && GameState.enemies.includes(m)) {
                                    centerX += m.position.x;
                                    centerZ += m.position.z;
                                    count++;
                                }
                            }
                            if (count > 0) {
                                centerX /= count;
                                centerZ /= count;
                            }
                            const distToCenter = Math.sqrt(Math.pow(enemy.position.x - centerX, 2) + Math.pow(enemy.position.z - centerZ, 2));
                            if (distToCenter > 8) {
                                direction = new THREE.Vector3(centerX - enemy.position.x, 0, centerZ - enemy.position.z).normalize();
                                speed = enemy.userData.speed * 0.4;
                            } else {
                                enemy.userData.wanderTime = (enemy.userData.wanderTime || 0) + delta;
                                if (enemy.userData.wanderTime > 5) {
                                    const angle = Math.random() * Math.PI * 2;
                                    enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                                    enemy.userData.wanderTime = 0;
                                }
                                direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                                speed = enemy.userData.speed * 0.2;
                            }
                        }

                        // Still flee from dogs even when pregnant (but a bit slower)
                        for (const other of GameState.enemies) {
                            if (other.userData.type === 'wild_dog') {
                                const distToDog = enemy.position.distanceTo(other.position);
                                if (distToDog < 15) {
                                    enemy.userData.lifecycleState = 'fleeing';
                                    enemy.userData.fleeFrom = other;
                                    enemy.userData.fleeTimer = 8;
                                    break;
                                }
                            }
                        }
                    }
                }

                // ================================================================
                // MOTHERING STATE - Caring for baby
                // ================================================================
                else if (lifecycleState === 'mothering') {
                    enemy.userData.motheringTimer -= delta;

                    if (enemy.userData.motheringTimer <= 0) {
                        // Baby grows up
                        const baby = enemy.userData.babyGazella;
                        if (baby && GameState.enemies.includes(baby)) {
                            growSaltasGazellaBaby(baby);
                        }
                        enemy.userData.babyGazella = null;
                        enemy.userData.lifecycleState = 'grazing';
                        console.log('Saltas Gazella baby grew up!');
                    } else {
                        // Stay near baby
                        const baby = enemy.userData.babyGazella;
                        if (baby && GameState.enemies.includes(baby)) {
                            const distToBaby = enemy.position.distanceTo(baby.position);
                            if (distToBaby > 4) {
                                direction = new THREE.Vector3()
                                    .subVectors(baby.position, enemy.position)
                                    .normalize();
                                speed = enemy.userData.speed * 0.5;
                            } else {
                                // Wander near baby
                                enemy.userData.wanderTime = (enemy.userData.wanderTime || 0) + delta;
                                if (enemy.userData.wanderTime > 3) {
                                    const angle = Math.random() * Math.PI * 2;
                                    enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                                    enemy.userData.wanderTime = 0;
                                }
                                direction = enemy.userData.wanderDir || new THREE.Vector3(1, 0, 0);
                                speed = enemy.userData.speed * 0.25;
                            }
                        } else {
                            enemy.userData.lifecycleState = 'grazing';
                        }

                        // Flee from dogs
                        for (const other of GameState.enemies) {
                            if (other.userData.type === 'wild_dog') {
                                const distToDog = enemy.position.distanceTo(other.position);
                                if (distToDog < 18) {
                                    enemy.userData.lifecycleState = 'fleeing';
                                    enemy.userData.fleeFrom = other;
                                    enemy.userData.fleeTimer = 12;
                                    // Baby also flees
                                    if (baby && GameState.enemies.includes(baby)) {
                                        baby.userData.lifecycleState = 'fleeing';
                                        baby.userData.fleeFrom = other;
                                        baby.userData.fleeTimer = 12;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }

                // ================================================================
                // BABY STATE - Following mother
                // ================================================================
                else if (lifecycleState === 'baby') {
                    const mother = enemy.userData.mother;
                    if (mother && GameState.enemies.includes(mother)) {
                        const distToMother = enemy.position.distanceTo(mother.position);
                        if (distToMother > 2) {
                            direction = new THREE.Vector3()
                                .subVectors(mother.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;
                        } else {
                            speed = 0;
                        }
                    } else {
                        // Mother gone, grow up early
                        growSaltasGazellaBaby(enemy);
                    }
                }

                // Apply movement and rotation
                if (direction && speed > 0) {
                    enemy.position.x += direction.x * speed * delta;
                    enemy.position.z += direction.z * speed * delta;

                    // Keep within world bounds
                    const border = CONFIG.WORLD_SIZE * 0.65;
                    enemy.position.x = Math.max(-border, Math.min(border, enemy.position.x));
                    enemy.position.z = Math.max(-border, Math.min(border, enemy.position.z));

                    // Face movement direction
                    // Add Math.PI / 2 offset because the model is built facing +X
                    const targetRotation = Math.atan2(direction.x, direction.z) + Math.PI / 2;
                    let diff = targetRotation - enemy.rotation.y;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    enemy.rotation.y += diff * 0.1;
                }

                // Walking animation
                const model = enemy.children[0];
                if (model && model.userData.legs && speed > 0.5) {
                    const isFleeing = lifecycleState === 'fleeing';
                    const walkSpeed = isFleeing ? 15 + speed * 0.5 : 6 + speed * 0.8;
                    enemy.userData.walkPhase = (enemy.userData.walkPhase || 0) + delta * walkSpeed;

                    model.userData.legs.forEach((leg, idx) => {
                        const isPairA = (idx === 0 || idx === 3);
                        const phase = isPairA ? enemy.userData.walkPhase : enemy.userData.walkPhase + Math.PI;
                        const cyclePos = Math.sin(phase);

                        const swingMult = isFleeing ? 1.0 : 0.6;
                        const kneeMult = isFleeing ? 1.2 : 0.7;

                        leg.group.rotation.z = cyclePos * swingMult;
                        const kneeBend = cyclePos > 0 ? -cyclePos * kneeMult : cyclePos * 0.2;
                        leg.lowerLegGroup.rotation.z = kneeBend;
                    });

                    // Body bob when running
                    const bobAmount = isFleeing ? 0.1 : 0.03;
                    enemy.position.y = Math.abs(Math.sin(enemy.userData.walkPhase * 2)) * bobAmount;
                } else if (model && model.userData.legs) {
                    // Standing - reset legs
                    model.userData.legs.forEach(leg => {
                        leg.group.rotation.z *= 0.9;
                        leg.lowerLegGroup.rotation.z *= 0.9;
                    });
                    enemy.position.y = 0;
                }

                continue;
            }
            // Fox-specific behavior - egg stealing with creeping
            else if (enemy.userData.id === 'fox') {
                // Initialize fox state if needed
                if (!enemy.userData.foxState) {
                    enemy.userData.foxState = 'hunting'; // hunting, creeping, fleeing
                    enemy.userData.targetNest = null;
                    enemy.userData.isCreeping = false;
                    enemy.userData.stolenEgg = false;
                }

                const foxState = enemy.userData.foxState;

                // Find nearest nest with an egg
                let nearestNestWithEgg = null;
                let nearestNestDist = Infinity;
                if (GameState.nests) {
                    for (const nest of GameState.nests) {
                        if (nest.egg && nest.egg.exists) {
                            const dist = enemy.position.distanceTo(
                                new THREE.Vector3(nest.position.x, 0, nest.position.z)
                            );
                            if (dist < nearestNestDist) {
                                nearestNestDist = dist;
                                nearestNestWithEgg = nest;
                            }
                        }
                    }
                }

                // Check if any goose is nearby and hostile
                let nearbyGoose = null;
                let nearbyGooseDist = 15;
                for (const other of GameState.enemies) {
                    if (other.userData.id === 'goose' && other !== enemy) {
                        const dist = enemy.position.distanceTo(other.position);
                        if (dist < nearbyGooseDist) {
                            nearbyGooseDist = dist;
                            nearbyGoose = other;
                        }
                    }
                }

                // Apply creeping or walking animation
                if (enemy.userData.isCreeping) {
                    // Creeping pose - legs bent, body low
                    const model = enemy.children[0];
                    if (model && model.userData.legs) {
                        model.userData.legs.forEach(leg => {
                            // Model is flipped, use Z axis for front/back rotation
                            // Upper leg tilts backward
                            leg.group.rotation.z = Math.PI / 4;
                            // Lower leg bends forward
                            leg.lowerLegGroup.rotation.z = -Math.PI / 4;
                        });
                    }
                    // Lower body position when creeping
                    const terrainY = Environment.getTerrainHeight(enemy.position.x, enemy.position.z);
                    enemy.position.y = terrainY + (enemy.userData.groundY || 0.3) - 0.15;
                    speed = enemy.userData.speed * 0.4; // Much slower when creeping
                } else {
                    // Walking animation with diagonal gait
                    const model = enemy.children[0];
                    if (model && model.userData.legs) {
                        // Calculate leg swing based on time and speed
                        const walkCycle = GameState.clock.elapsedTime * 8; // Walking speed
                        const swingAngle = Math.PI / 4; // 45 degrees

                        model.userData.legs.forEach(leg => {
                            // Diagonal gait: pair A (front left + back right) and pair B (front right + back left)
                            // move in opposite phases
                            const phase = leg.diagonalPair === 'A' ? 0 : Math.PI;
                            const swing = Math.sin(walkCycle + phase) * swingAngle;

                            // Walking: legs swing forward/backward
                            // Model is flipped (rotation.y = PI), so use rotation.z for front/back swing
                            leg.group.rotation.z = swing;

                            // Lower leg bends slightly when lifting
                            const kneeBend = Math.max(0, Math.sin(walkCycle + phase + 0.5)) * 0.3;
                            leg.lowerLegGroup.rotation.z = -kneeBend;
                        });
                    }
                    // Use groundY for proper positioning
                    const terrainY = Environment.getTerrainHeight(enemy.position.x, enemy.position.z);
                    enemy.position.y = terrainY + (enemy.userData.groundY || 0.3);
                }

                if (foxState === 'hunting') {
                    // Look for nests with eggs to steal
                    if (nearestNestWithEgg && nearestNestDist < CONFIG.ENEMY_DETECTION_RANGE) {
                        enemy.userData.targetNest = nearestNestWithEgg;

                        // Start creeping when getting close to nest
                        if (nearestNestDist < 20) {
                            enemy.userData.isCreeping = true;
                            enemy.userData.foxState = 'creeping';
                        }

                        // Move toward nest
                        direction = new THREE.Vector3()
                            .subVectors(new THREE.Vector3(nearestNestWithEgg.position.x, 0, nearestNestWithEgg.position.z), enemy.position)
                            .normalize();
                        speed = enemy.userData.speed;
                    } else {
                        // No nest nearby, hunt babies or player like other predators
                        let targetBaby = null;
                        let closestBabyDist = CONFIG.ENEMY_DETECTION_RANGE;

                        for (const other of GameState.enemies) {
                            if (other === enemy || !other.userData.isBaby) continue;
                            const dist = enemy.position.distanceTo(other.position);
                            if (dist < closestBabyDist) {
                                closestBabyDist = dist;
                                targetBaby = other;
                            }
                        }

                        if (targetBaby) {
                            direction = new THREE.Vector3()
                                .subVectors(targetBaby.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed * 1.2;

                            // Attack baby on contact
                            if (closestBabyDist < enemy.userData.radius + targetBaby.userData.radius) {
                                targetBaby.userData.health -= enemy.userData.damage * delta;
                                if (targetBaby.userData.health <= 0) {
                                    const parent = GameState.enemies.find(e => e.userData.entityId === targetBaby.userData.parentId);
                                    if (parent) parent.userData.hasOffspring = false;
                                    const idx = GameState.enemies.indexOf(targetBaby);
                                    if (idx !== -1) {
                                        GameState.scene.remove(targetBaby);
                                        GameState.enemies.splice(idx, 1);
                                        if (idx < i) i--;
                                    }
                                }
                            }
                        } else if (distance < CONFIG.ENEMY_DETECTION_RANGE) {
                            // Chase player
                            direction = new THREE.Vector3()
                                .subVectors(GameState.peccary.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed;
                        } else {
                            // Wander
                            enemy.userData.wanderTime += delta;
                            if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                                const angle = Math.random() * Math.PI * 2;
                                enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                                enemy.userData.wanderTime = 0;
                            }
                            direction = enemy.userData.wanderDir;
                        }
                    }
                } else if (foxState === 'creeping') {
                    // Creeping toward nest to steal egg
                    enemy.userData.isCreeping = true;
                    const targetNest = enemy.userData.targetNest;

                    if (targetNest && targetNest.egg && targetNest.egg.exists) {
                        const nestVec = new THREE.Vector3(targetNest.position.x, 0, targetNest.position.z);
                        const distToNest = enemy.position.distanceTo(nestVec);

                        // If goose spots the fox while creeping, flee!
                        if (nearbyGoose && nearbyGooseDist < 10) {
                            enemy.userData.foxState = 'fleeing';
                            enemy.userData.isCreeping = false;
                            enemy.userData.fleeFrom = nearbyGoose;
                        } else if (distToNest < 1.5) {
                            // Steal the egg!
                            if (targetNest.egg.mesh) {
                                GameState.scene.remove(targetNest.egg.mesh);
                                GameState.resources = GameState.resources.filter(r => r !== targetNest.egg.mesh);
                            }
                            targetNest.egg.exists = false;
                            targetNest.egg.mesh = null;
                            targetNest.state = 'empty';

                            enemy.userData.stolenEgg = true;
                            enemy.userData.foxState = 'fleeing';
                            enemy.userData.isCreeping = false;

                            // Parent goose becomes hostile to this fox
                            const parentGoose = GameState.enemies.find(e => e.userData.entityId === targetNest.ownerId);
                            if (parentGoose) {
                                parentGoose.userData.targetFox = enemy;
                            }

                            console.log('Fox stole an egg from nest!');
                        } else {
                            // Keep creeping toward nest
                            direction = new THREE.Vector3()
                                .subVectors(nestVec, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed * 0.4;
                        }
                    } else {
                        // Nest no longer has egg, go back to hunting
                        enemy.userData.foxState = 'hunting';
                        enemy.userData.isCreeping = false;
                        enemy.userData.targetNest = null;
                    }
                } else if (foxState === 'fleeing') {
                    // Run away from goose or after stealing egg
                    enemy.userData.isCreeping = false;
                    const fleeFrom = enemy.userData.fleeFrom;

                    if (fleeFrom) {
                        // Flee from specific goose
                        direction = new THREE.Vector3()
                            .subVectors(enemy.position, fleeFrom.position)
                            .normalize();
                        speed = enemy.userData.speed * 1.3;

                        const distFromGoose = enemy.position.distanceTo(fleeFrom.position);
                        if (distFromGoose > 30) {
                            // Safe distance, go back to hunting
                            enemy.userData.foxState = 'hunting';
                            enemy.userData.fleeFrom = null;
                            enemy.userData.stolenEgg = false;
                        }
                    } else {
                        // Just flee in current direction
                        if (!enemy.userData.fleeDir) {
                            const angle = Math.random() * Math.PI * 2;
                            enemy.userData.fleeDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                            enemy.userData.fleeTime = 0;
                        }
                        direction = enemy.userData.fleeDir;
                        speed = enemy.userData.speed * 1.3;

                        enemy.userData.fleeTime += delta;
                        if (enemy.userData.fleeTime > 5) {
                            // Done fleeing
                            enemy.userData.foxState = 'hunting';
                            enemy.userData.fleeDir = null;
                            enemy.userData.stolenEgg = false;
                        }
                    }
                }

                // Fox fights back when attacked by geese
                if (nearbyGoose && nearbyGooseDist < enemy.userData.radius + nearbyGoose.userData.radius) {
                    // Goose is attacking fox - fox fights back
                    if (enemy.userData.fightsBack) {
                        nearbyGoose.userData.health -= enemy.userData.damage * delta * 0.5;
                        if (nearbyGoose.userData.health <= 0) {
                            const idx = GameState.enemies.indexOf(nearbyGoose);
                            if (idx !== -1) {
                                GameState.scene.remove(nearbyGoose);
                                GameState.enemies.splice(idx, 1);
                                if (idx < i) i--;
                            }
                        }
                    }
                }
            }
            // Hostile enemies (badgers/weasels) hunt baby geese or chase player
            else if (!enemy.userData.friendly) {
                // First check for baby geese within range
                let targetBaby = null;
                let closestBabyDist = CONFIG.ENEMY_DETECTION_RANGE;

                for (let j = 0; j < GameState.enemies.length; j++) {
                    const other = GameState.enemies[j];
                    if (other === enemy || !other.userData.isBaby) continue;

                    const dist = enemy.position.distanceTo(other.position);
                    if (dist < closestBabyDist) {
                        closestBabyDist = dist;
                        targetBaby = other;
                    }
                }

                if (targetBaby) {
                    // Chase baby goose
                    direction = new THREE.Vector3()
                        .subVectors(targetBaby.position, enemy.position)
                        .normalize();
                    speed = enemy.userData.speed * 1.2; // Faster when hunting babies
                    enemy.userData.isChasing = true;

                    // Attack baby on contact
                    if (closestBabyDist < enemy.userData.radius + targetBaby.userData.radius) {
                        targetBaby.userData.health -= enemy.userData.damage * delta;
                        if (targetBaby.userData.health <= 0) {
                            // Clear parent's hasOffspring flag
                            const parent = GameState.enemies.find(e => e.userData.entityId === targetBaby.userData.parentId);
                            if (parent) {
                                parent.userData.hasOffspring = false;
                            }

                            // Kill baby goose
                            const idx = GameState.enemies.indexOf(targetBaby);
                            if (idx !== -1) {
                                GameState.scene.remove(targetBaby);
                                GameState.enemies.splice(idx, 1);
                                if (idx < i) i--;
                            }
                        }
                    }
                } else if (distance < CONFIG.ENEMY_DETECTION_RANGE) {
                    // No baby geese nearby, chase player
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
            } else {
                // Wander randomly (shouldn't reach here for hostile enemies)
                enemy.userData.isChasing = false;
                enemy.userData.wanderTime += delta;

                if (enemy.userData.wanderTime > 2 + Math.random() * 2) {
                    const angle = Math.random() * Math.PI * 2;
                    enemy.userData.wanderDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                    enemy.userData.wanderTime = 0;
                }

                direction = enemy.userData.wanderDir;
            }

            // Apply water slowdown (50% speed) - unless immune
            if (inWater && !enemy.userData.immuneToWater) {
                speed *= 0.5;
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

            // Animation - swimming or walking
            // Use terrain height + groundY for proper positioning
            const terrainY = Environment.getTerrainHeight(enemy.position.x, enemy.position.z);
            const baseY = terrainY + (enemy.userData.groundY || 0.3);

            if (inWater) {
                // Swimming animation - lower body, slower bob
                enemy.position.y = baseY - 0.2 + Math.sin(GameState.clock.elapsedTime * 4 + i) * 0.1;
            } else {
                // Normal bobbing animation
                enemy.position.y = baseY + Math.abs(Math.sin(GameState.clock.elapsedTime * 12 + i)) * 0.05;
            }

            // Collision with player - only for hostile enemies
            if (!enemy.userData.friendly && distance < enemy.userData.radius + GameState.peccary.userData.radius) {
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

        // Warning indicator - only for hostile enemies
        const warningEl = document.getElementById('warning-text');
        if (closestHostile < CONFIG.ENEMY_DETECTION_RANGE && closestHostile < 20) {
            warningEl.style.opacity = Math.max(0, 1 - closestHostile / 20);
        } else {
            warningEl.style.opacity = 0;
        }
    }

    // ========================================================================
    // TOAD MATING SYSTEM
    // ========================================================================

    /**
     * Trigger mating season for all toads.
     * Called every 3 minutes when in savannah biome.
     * Female toads will seek out males and mate.
     */
    function triggerToadMating() {
        // Check population limit (max 20 toads)
        const currentToadCount = GameState.enemies.filter(
            e => e.userData.type === 'leopard_toad'
        ).length;

        if (currentToadCount >= 20) {
            console.log('Toad population at maximum (20), skipping mating season');
            return;
        }

        // Find all female toads that are in 'hopping' state (not already mating/nesting)
        const females = GameState.enemies.filter(
            e => e.userData.type === 'leopard_toad' &&
                 e.userData.gender === 'female' &&
                 e.userData.lifecycleState === 'hopping'
        );

        // Find all male toads
        const males = GameState.enemies.filter(
            e => e.userData.type === 'leopard_toad' &&
                 e.userData.gender === 'male' &&
                 e.userData.lifecycleState === 'hopping'
        );

        if (females.length === 0 || males.length === 0) {
            console.log('No available toads for mating (females:', females.length, 'males:', males.length + ')');
            return;
        }

        console.log('MATING SEASON! ' + females.length + ' females seeking ' + males.length + ' males');

        // Each female finds the nearest male
        females.forEach(female => {
            let nearestMale = null;
            let nearestDist = Infinity;

            males.forEach(male => {
                const dist = female.position.distanceTo(male.position);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestMale = male;
                }
            });

            if (nearestMale) {
                // Set female to seeking mate state
                female.userData.lifecycleState = 'seeking_mate';
                female.userData.targetMate = nearestMale;
                female.userData.matingTimer = 0;
                console.log('Female toad seeking male at distance:', nearestDist.toFixed(1));
            }
        });
    }

    /**
     * Create a toad nest at the specified position.
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {string} ownerId - Entity ID of the mother toad
     * @returns {Object} - The nest object
     */
    function createToadNest(x, z, ownerId) {
        const nest = new THREE.Group();

        // Brown nest base (smaller than goose nest)
        const nestBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.5, 0.15, 16),
            new THREE.MeshStandardMaterial({ color: 0x8B4513 }) // Saddle brown
        );
        nestBase.position.y = 0.075;
        nestBase.castShadow = true;
        nest.add(nestBase);

        // Nest rim
        const nestRim = new THREE.Mesh(
            new THREE.TorusGeometry(0.45, 0.08, 8, 16),
            new THREE.MeshStandardMaterial({ color: 0x654321 }) // Darker brown
        );
        nestRim.rotation.x = Math.PI / 2;
        nestRim.position.y = 0.15;
        nest.add(nestRim);

        nest.position.set(x, 0, z);
        GameState.scene.add(nest);

        // Create 5 eggs in the nest
        const eggs = [];
        const eggPositions = [
            { x: 0, z: 0 },           // Center
            { x: 0.12, z: 0.08 },     // Around center
            { x: -0.1, z: 0.1 },
            { x: 0.08, z: -0.1 },
            { x: -0.08, z: -0.08 }
        ];

        eggPositions.forEach((pos, index) => {
            const eggMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0xD2B48C }) // Tan color
            );
            eggMesh.scale.set(1, 1.3, 1); // Slightly oval
            eggMesh.position.set(x + pos.x, 0.18, z + pos.z);
            eggMesh.castShadow = true;
            GameState.scene.add(eggMesh);

            eggs.push({
                exists: true,
                mesh: eggMesh,
                index: index
            });
        });

        const nestObject = {
            mesh: nest,
            position: { x: x, z: z },
            id: 'toadnest_' + Date.now() + '_' + Math.random(),
            ownerId: ownerId,
            eggs: eggs,
            hatchTime: GameState.timeElapsed + 300, // 5 minutes from now
            state: 'incubating'
        };

        GameState.toadNests.push(nestObject);
        console.log('Toad nest created at', x.toFixed(1), z.toFixed(1), 'with 5 eggs');

        return nestObject;
    }

    /**
     * Update toad nests - handle egg collection, hatching, etc.
     * @param {number} delta - Time since last frame
     */
    function updateToadNests(delta) {
        const playerPos = GameState.peccary.position;
        const collectRange = 1.5;

        for (let i = GameState.toadNests.length - 1; i >= 0; i--) {
            const nest = GameState.toadNests[i];

            // Check for egg hatching (5 minutes after laying)
            if (nest.state === 'incubating' && GameState.timeElapsed >= nest.hatchTime) {
                console.log('Toad eggs hatching!');
                nest.state = 'hatched';

                // Count remaining eggs and spawn babies
                const remainingEggs = nest.eggs.filter(e => e.exists);
                remainingEggs.forEach(egg => {
                    // Remove egg mesh
                    GameState.scene.remove(egg.mesh);
                    egg.exists = false;

                    // Spawn a baby toad at the nest position
                    spawnBabyToad(nest.position.x, nest.position.z);
                });

                // Remove the nest
                GameState.scene.remove(nest.mesh);
                GameState.toadNests.splice(i, 1);

                // Mother returns to hopping
                const mother = GameState.enemies.find(e => e.userData.entityId === nest.ownerId);
                if (mother) {
                    mother.userData.lifecycleState = 'hopping';
                    mother.userData.nestId = null;
                    console.log('Mother toad returns to hopping after hatching');
                }

                continue; // Skip to next nest since this one is removed
            }

            // Check each egg for collection by player
            for (let j = nest.eggs.length - 1; j >= 0; j--) {
                const egg = nest.eggs[j];
                if (!egg.exists) continue;

                const dist = Math.sqrt(
                    Math.pow(egg.mesh.position.x - playerPos.x, 2) +
                    Math.pow(egg.mesh.position.z - playerPos.z, 2)
                );

                if (dist < collectRange) {
                    // Collect the egg
                    GameState.scene.remove(egg.mesh);
                    egg.exists = false;

                    // Add to player inventory (reuse egg resource)
                    GameState.resourceCounts.eggs++;
                    GameState.health = Math.min(100, GameState.health + 40);
                    GameState.score += 50;
                    Game.playSound('collect');

                    console.log('Collected toad egg! Eggs remaining:', nest.eggs.filter(e => e.exists).length);

                    // Make mother attack
                    const mother = GameState.enemies.find(e => e.userData.entityId === nest.ownerId);
                    if (mother && mother.userData.lifecycleState === 'guarding') {
                        mother.userData.lifecycleState = 'attacking';
                        mother.userData.attackTarget = GameState.peccary;
                        mother.userData.attackTimer = 2; // Attack for 2 seconds then return
                    }

                    break; // Only collect one egg per frame
                }
            }

            // Check if all eggs are gone (collected before hatching)
            const remainingEggs = nest.eggs.filter(e => e.exists).length;
            if (remainingEggs === 0 && nest.state !== 'hatched') {
                // Remove empty nest
                GameState.scene.remove(nest.mesh);
                GameState.toadNests.splice(i, 1);

                // Mother returns to hopping
                const mother = GameState.enemies.find(e => e.userData.entityId === nest.ownerId);
                if (mother) {
                    mother.userData.lifecycleState = 'hopping';
                    mother.userData.nestId = null;
                }
                console.log('Empty toad nest removed (all eggs collected)');
            }
        }
    }

    /**
     * Spawn a baby toad at the given position.
     * @param {number} x - X position
     * @param {number} z - Z position
     */
    function spawnBabyToad(x, z) {
        // Check population limit
        const currentToadCount = GameState.enemies.filter(
            e => e.userData.type === 'leopard_toad'
        ).length;

        if (currentToadCount >= 20) {
            console.log('Toad population at maximum, baby not spawned');
            return;
        }

        // Baby toads use female data but with magenta color override
        const femaleData = ENEMIES.find(e => e.id === 'leopard_toad_female');
        if (!femaleData) return;

        // Create baby toad with magenta colors
        const babyColors = {
            body: 0xFF00FF,      // Magenta
            spots: 0xCC00CC,     // Darker magenta spots
            belly: 0xFFAAFF,     // Light magenta belly
            eyes: 0x2F2F2F,      // Dark eyes
            eyeBulge: 0xFF55FF,  // Light magenta eye bulge
            legs: 0xDD00DD       // Magenta legs
        };

        const model = buildLeopardToadModel(babyColors);
        const baby = new THREE.Group();
        baby.add(model);

        // Baby is much smaller (35% of normal size)
        baby.scale.set(0.35, 0.35, 0.35);

        // Position near the nest with slight offset
        baby.position.set(
            x + (Math.random() - 0.5) * 1,
            0,
            z + (Math.random() - 0.5) * 1
        );

        // Set baby toad properties
        baby.userData = {
            id: 'leopard_toad_baby',
            type: 'leopard_toad',
            entityId: 'toad_baby_' + Date.now() + '_' + Math.random(),
            speed: femaleData.speed * 0.7,  // Slower than adults
            damage: 1,
            radius: 0.2,
            health: 5,
            friendly: true,
            immuneToWater: true,

            // Baby-specific properties
            isBaby: true,
            maturityTime: GameState.timeElapsed + 120, // 2 minutes to grow up

            // Hopping properties
            homePosition: { x: 0, z: 0 },
            maxRangeFromHome: 10,
            lifecycleState: 'baby',
            hopTimer: Math.random() * 1,
            hopPhase: 'grounded',
            hopTarget: null,
            wanderDir: new THREE.Vector3(1, 0, 0),
            wanderTime: 0
        };

        GameState.enemies.push(baby);
        GameState.scene.add(baby);

        console.log('Baby toad spawned! Magenta colored, will mature in 2 minutes');
    }

    // ========================================================================
    // GRASS VIPER HELPER FUNCTIONS
    // ========================================================================

    /**
     * Alert a toad that it has been spotted by a predator.
     * Also alerts all toads within 16 units.
     * @param {THREE.Group} toad - The toad that spotted the predator
     * @param {THREE.Group} predator - The predator (grass viper)
     */
    function alertToad(toad, predator) {
        // Set toad to fleeing state
        toad.userData.lifecycleState = 'fleeing';
        toad.userData.fleeFrom = predator;
        toad.userData.fleeTimer = 5;  // Flee for 5 seconds

        // Alert all toads within 16 units
        for (const other of GameState.enemies) {
            if (other !== toad && other.userData.type === 'leopard_toad') {
                const dist = toad.position.distanceTo(other.position);
                if (dist <= 16) {
                    other.userData.lifecycleState = 'fleeing';
                    other.userData.fleeFrom = predator;
                    other.userData.fleeTimer = 5;
                }
            }
        }
        console.log('Toads alerted! Fleeing from predator');
    }

    /**
     * Rebuild a grass viper model with or without pregnancy belly.
     * @param {THREE.Group} viper - The viper to rebuild
     * @param {boolean} isPregnant - Whether to show pregnancy belly
     */
    function rebuildViperWithBelly(viper, isPregnant) {
        // Get current viper data
        const viperData = viper.userData.gender === 'male'
            ? ENEMIES.find(e => e.id === 'grass_viper_male')
            : ENEMIES.find(e => e.id === 'grass_viper_female');

        if (!viperData) return;

        // Remove old model
        while (viper.children.length > 0) {
            viper.remove(viper.children[0]);
        }

        // Build new model with/without belly
        const newModel = buildGrassViperModel(viperData.colors, isPregnant);
        viper.add(newModel);
    }

    /**
     * Spawn a baby grass viper under a mother.
     * @param {THREE.Group} mother - The mother viper giving birth
     */
    function spawnBabyViper(mother) {
        // Check population limit (max 10 vipers)
        const currentViperCount = GameState.enemies.filter(
            e => e.userData.type === 'grass_viper'
        ).length;

        if (currentViperCount >= 10) {
            console.log('Grass viper population at maximum, baby not spawned');
            return;
        }

        // Determine gender at birth (50/50)
        const isMale = Math.random() < 0.5;
        const viperData = isMale
            ? ENEMIES.find(e => e.id === 'grass_viper_male')
            : ENEMIES.find(e => e.id === 'grass_viper_female');

        if (!viperData) return;

        // Create baby model (smaller, same colors)
        const model = buildGrassViperModel(viperData.colors, false);
        const baby = new THREE.Group();
        baby.add(model);

        // Baby is 40% of adult size
        baby.scale.set(0.4, 0.4, 0.4);

        // Position under mother
        baby.position.set(
            mother.position.x + (Math.random() - 0.5) * 0.5,
            0,
            mother.position.z + (Math.random() - 0.5) * 0.5
        );

        // Set baby properties
        baby.userData = {
            id: isMale ? 'grass_viper_baby_male' : 'grass_viper_baby_female',
            type: 'grass_viper',
            entityId: 'viper_baby_' + Date.now() + '_' + Math.random(),
            gender: isMale ? 'male' : 'female',
            speed: viperData.speed * 0.6,
            damage: 3,
            radius: 0.2,
            health: 3,
            friendly: false,
            isBaby: true,

            // Baby follows mother
            lifecycleState: 'baby',
            mother: mother
        };

        GameState.enemies.push(baby);
        GameState.scene.add(baby);

        // Mother keeps reference to baby
        mother.userData.babyViper = baby;

        console.log('Baby grass viper born! Gender:', baby.userData.gender);
    }

    /**
     * Grow a baby viper into an adult.
     * @param {THREE.Group} baby - The baby viper to grow
     */
    function growBabyViper(baby) {
        const isMale = baby.userData.gender === 'male';
        const viperData = isMale
            ? ENEMIES.find(e => e.id === 'grass_viper_male')
            : ENEMIES.find(e => e.id === 'grass_viper_female');

        if (!viperData) return;

        // Remove old model
        while (baby.children.length > 0) {
            baby.remove(baby.children[0]);
        }

        // Build adult model
        const adultModel = buildGrassViperModel(viperData.colors, false);
        baby.add(adultModel);

        // Scale to adult size
        baby.scale.set(viperData.size, viperData.size, viperData.size);

        // Update properties to adult values
        baby.userData.id = viperData.id;
        baby.userData.isBaby = false;
        baby.userData.speed = viperData.speed;
        baby.userData.damage = viperData.damage;
        baby.userData.radius = viperData.radius;
        baby.userData.health = viperData.health;
        baby.userData.lifecycleState = 'hunting';
        baby.userData.mother = null;

        // Female-specific properties
        if (!isMale) {
            baby.userData.isPregnant = false;
            baby.userData.gestationTimer = 0;
            baby.userData.canGiveBirth = true;
        }

        console.log('Baby grass viper grew into adult', baby.userData.gender);
    }

    /**
     * Trigger mating run for grass vipers.
     * Called every 4 minutes, 55% chance to actually trigger.
     */
    function triggerViperMating() {
        // 55% chance to trigger
        if (Math.random() > 0.55) {
            console.log('Grass viper mating run: No mating this cycle (45% skip)');
            return;
        }

        // Find all males in hunting state
        const males = GameState.enemies.filter(
            e => e.userData.type === 'grass_viper' &&
                 e.userData.gender === 'male' &&
                 e.userData.lifecycleState === 'hunting' &&
                 !e.userData.isBaby
        );

        // Find all available females (not pregnant, not mothering)
        const females = GameState.enemies.filter(
            e => e.userData.type === 'grass_viper' &&
                 e.userData.gender === 'female' &&
                 !e.userData.isPregnant &&
                 e.userData.lifecycleState !== 'gestating' &&
                 e.userData.lifecycleState !== 'mothering' &&
                 !e.userData.isBaby
        );

        if (males.length === 0 || females.length === 0) {
            console.log('No available vipers for mating (males:', males.length, ', females:', females.length + ')');
            return;
        }

        console.log('GRASS VIPER MATING RUN! ' + males.length + ' males seeking ' + females.length + ' females');

        // Each male finds nearest available female
        males.forEach(male => {
            let nearestFemale = null;
            let nearestDist = Infinity;

            females.forEach(female => {
                const dist = male.position.distanceTo(female.position);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestFemale = female;
                }
            });

            if (nearestFemale) {
                male.userData.lifecycleState = 'mating_run';
                male.userData.targetMate = nearestFemale;
                console.log('Male viper seeking female at distance:', nearestDist.toFixed(1));
            }
        });
    }

    // ========================================================================
    // ANTELOPE HELPER FUNCTIONS
    // ========================================================================

    /**
     * Trigger mating/rutting season for antelope.
     * Called every 8 minutes. Males fight for the right to mate!
     *
     * RUTTING SYSTEM:
     * - Males own females (tracked by female.userData.owner)
     * - To mate, a male must challenge the female's current owner
     * - 50% chance to beat regular males, 40% chance to beat the leader
     * - Winner takes ALL the loser's females
     * - Beating the leader = become the new leader
     */
    function triggerAntelopeMating() {
        if (!GameState.antelopeHerds || GameState.antelopeHerds.length === 0) {
            return;
        }

        console.log('ANTELOPE RUTTING SEASON! Males will fight for females!');

        GameState.antelopeHerds.forEach(herd => {
            // Check herd population limit (max 16)
            if (herd.members.length >= herd.maxSize) {
                console.log('Herd', herd.id, 'at max size, skipping mating');
                return;
            }

            // Initialize female ownership if not set
            initializeFemaleOwnership(herd);

            // Find available males (not babies, not already fighting)
            const availableMales = herd.members.filter(
                m => m.userData.gender === 'male' &&
                     m.userData.lifecycleState === 'grazing' &&
                     !m.userData.isBaby
            );

            if (availableMales.length < 2) {
                console.log('Not enough males to rut in herd', herd.id);
                // If only one male, he mates directly with an available female
                if (availableMales.length === 1) {
                    const male = availableMales[0];
                    const female = herd.members.find(
                        m => m.userData.gender === 'female' &&
                             !m.userData.isPregnant &&
                             !m.userData.isBaby &&
                             m.userData.lifecycleState === 'grazing'
                    );
                    if (female) {
                        female.userData.lifecycleState = 'seeking_mate';
                        female.userData.targetMate = male;
                    }
                }
                return;
            }

            // Find available females (not pregnant)
            const availableFemales = herd.members.filter(
                m => m.userData.gender === 'female' &&
                     !m.userData.isPregnant &&
                     m.userData.lifecycleState === 'grazing' &&
                     !m.userData.isBaby
            );

            if (availableFemales.length === 0) {
                console.log('No available females in herd', herd.id);
                return;
            }

            // Each male (except one with most females) picks a female and challenges her owner
            // Sort males by number of females they own
            availableMales.sort((a, b) => {
                const aFemales = herd.members.filter(m => m.userData.owner === a).length;
                const bFemales = herd.members.filter(m => m.userData.owner === b).length;
                return aFemales - bFemales;  // Fewer females = more eager to fight
            });

            // The male with fewest females challenges another male
            const challenger = availableMales[0];

            // Pick a female to fight for (preferably one owned by another male)
            let targetFemale = availableFemales.find(f => f.userData.owner && f.userData.owner !== challenger);
            if (!targetFemale) {
                // No owned females available, pick any
                targetFemale = availableFemales[0];
            }

            const defender = targetFemale.userData.owner;

            if (!defender || defender === challenger) {
                // No one to fight, just mate
                targetFemale.userData.lifecycleState = 'seeking_mate';
                targetFemale.userData.targetMate = challenger;
                targetFemale.userData.owner = challenger;
                console.log('No rival to fight, male claims female');
                return;
            }

            // START THE RUTTING BATTLE!
            console.log('RUTTING BATTLE!',
                        challenger.userData.isLeader ? 'Leader' : 'Male',
                        'challenges',
                        defender.userData.isLeader ? 'Leader' : 'Male',
                        'for female!');

            // Both males enter rutting state
            challenger.userData.lifecycleState = 'rutting_approach';
            challenger.userData.ruttingRival = defender;
            challenger.userData.ruttingFemale = targetFemale;
            challenger.userData.isChallenger = true;

            defender.userData.lifecycleState = 'rutting_approach';
            defender.userData.ruttingRival = challenger;
            defender.userData.ruttingFemale = targetFemale;
            defender.userData.isChallenger = false;
        });
    }

    /**
     * Initialize female ownership in a herd.
     * Leader gets first pick, then other males share remaining females.
     */
    function initializeFemaleOwnership(herd) {
        const males = herd.members.filter(m => m.userData.gender === 'male' && !m.userData.isBaby);
        const females = herd.members.filter(m => m.userData.gender === 'female' && !m.userData.isBaby);

        // Skip if already initialized
        if (females.some(f => f.userData.owner !== undefined)) {
            return;
        }

        if (males.length === 0) return;

        // Leader gets half the females (or at least 1)
        const leader = herd.leader;
        const leaderFemaleCount = Math.max(1, Math.floor(females.length / 2));

        females.forEach((female, idx) => {
            if (leader && idx < leaderFemaleCount) {
                female.userData.owner = leader;
            } else if (males.length > 1) {
                // Distribute remaining females among other males
                const otherMales = males.filter(m => m !== leader);
                if (otherMales.length > 0) {
                    female.userData.owner = otherMales[idx % otherMales.length];
                }
            } else {
                female.userData.owner = leader;
            }
        });

        console.log('Initialized female ownership in herd', herd.id);
    }

    /**
     * Handle the outcome of a rutting battle.
     * @param {THREE.Group} winner - The winning male
     * @param {THREE.Group} loser - The losing male
     * @param {Object} herd - The herd object
     */
    function handleRuttingOutcome(winner, loser, herd) {
        console.log('RUTTING BATTLE OVER!',
                    winner.userData.isLeader ? 'Leader' : 'Challenger', 'WINS!');

        // Transfer all loser's females to winner
        const losersFemales = herd.members.filter(m => m.userData.owner === loser);
        losersFemales.forEach(female => {
            female.userData.owner = winner;
            console.log('Female transferred to winner');
        });

        // Check if winner beat the leader
        if (loser.userData.isLeader && !winner.userData.isLeader) {
            // LEADERSHIP CHANGE!
            console.log('LEADERSHIP CHANGE! New leader crowned!');

            // Old leader loses leadership
            loser.userData.isLeader = false;
            loser.userData.wasLeader = true;  // Track that they were once leader

            // Rebuild old leader with normal horns
            rebuildAntelopeHorns(loser, 1);

            // New leader gains leadership
            winner.userData.isLeader = true;
            winner.userData.becameLeaderTime = GameState.timeElapsed;

            // Rebuild new leader with bigger horns
            rebuildAntelopeHorns(winner, 1.5);

            // Update herd leader reference
            herd.leader = winner;

            // Update all herd members to know new leader
            herd.members.forEach(m => {
                m.userData.leader = winner;
            });

            // Old leader's EXISTING children keep their fatherWasLeader status
            // But any FUTURE children won't have it (handled in spawnBabyAntelope)
        }

        // Get the female they fought over
        const contestedFemale = winner.userData.ruttingFemale;

        // Reset both males to grazing
        winner.userData.lifecycleState = 'grazing';
        winner.userData.ruttingRival = null;
        winner.userData.ruttingFemale = null;
        winner.userData.ruttingTimer = 0;

        loser.userData.lifecycleState = 'grazing';
        loser.userData.ruttingRival = null;
        loser.userData.ruttingFemale = null;
        loser.userData.ruttingTimer = 0;

        // Winner gets to mate with the contested female!
        if (contestedFemale && !contestedFemale.userData.isPregnant) {
            contestedFemale.userData.owner = winner;
            contestedFemale.userData.lifecycleState = 'seeking_mate';
            contestedFemale.userData.targetMate = winner;
            console.log('Winner gets to mate!');
        }
    }

    /**
     * Rebuild antelope horns (for leader change).
     * @param {THREE.Group} antelope - The antelope
     * @param {number} hornScale - Scale for horns (1 = normal, 1.5 = leader)
     */
    function rebuildAntelopeHorns(antelope, hornScale) {
        const antelopeData = ENEMIES.find(e => e.id === 'antelope_male');
        if (!antelopeData) return;

        while (antelope.children.length > 0) {
            antelope.remove(antelope.children[0]);
        }

        const newModel = buildAntelopeModel(antelopeData.colors, true, hornScale, false);
        antelope.add(newModel);
    }

    /**
     * Spawn a baby antelope under a mother.
     * @param {THREE.Group} mother - The mother antelope
     */
    function spawnBabyAntelope(mother) {
        const herd = GameState.antelopeHerds.find(h => h.id === mother.userData.herdId);
        if (!herd) return;

        // Check herd size limit
        if (herd.members.length >= herd.maxSize) {
            console.log('Herd at max size, baby not spawned');
            return;
        }

        // Determine gender (50/50)
        const isMale = Math.random() < 0.5;

        // Baby colors: white for female, potato brown for male
        const babyColors = isMale ? {
            body: 0x8B7355,        // Potato brown
            belly: 0xA08060,
            legs: 0x6B5344,
            face: 0x9B8365,
            muzzle: 0x4A3828,
            horns: 0x3D2817,
            hooves: 0x1A1A1A,
            eyes: 0x1A1A1A,
            ears: 0x8B7355,
            tail: 0x6B5344
        } : {
            body: 0xF5F5F5,        // White
            belly: 0xFFFFFF,
            legs: 0xE0E0E0,
            face: 0xF8F8F8,
            muzzle: 0xCCCCCC,
            horns: 0x3D2817,
            hooves: 0x1A1A1A,
            eyes: 0x1A1A1A,
            ears: 0xF5F5F5,
            tail: 0xE0E0E0
        };

        // Build baby model (no horns yet even for males)
        const model = buildAntelopeModel(babyColors, false, 1, false);
        const baby = new THREE.Group();
        baby.add(model);

        // Baby is 40% adult size
        baby.scale.set(0.4, 0.4, 0.4);

        // Position near mother
        baby.position.set(
            mother.position.x + (Math.random() - 0.5) * 2,
            0,
            mother.position.z + (Math.random() - 0.5) * 2
        );

        // Check if father IS CURRENTLY the leader (not just was once leader)
        // This means if a leader loses his title, his FUTURE sons won't be special
        // But existing sons keep their fatherWasLeader status
        const father = mother.userData.lastMate;
        const fatherIsCurrentLeader = father ? father.userData.isLeader : false;

        baby.userData = {
            id: isMale ? 'antelope_baby_male' : 'antelope_baby_female',
            type: 'antelope',
            entityId: 'antelope_baby_' + Date.now() + '_' + Math.random(),
            gender: isMale ? 'male' : 'female',
            speed: 4,  // Slower than adults
            damage: 5,
            radius: 0.4,
            health: 15,
            maxHealth: 15,
            friendly: true,
            defensive: true,
            minimapColor: isMale ? '#8B7355' : '#F5F5F5',

            // Herd properties
            herdId: herd.id,
            isLeader: false,
            isHerdAnimal: true,
            leader: herd.leader,

            // Baby-specific
            isBaby: true,
            mother: mother,
            maturityTime: GameState.timeElapsed + 420,  // 7 minutes to grow up
            fatherWasLeader: fatherIsCurrentLeader,  // Only true if dad is CURRENT leader

            // Behavior
            lifecycleState: 'baby',
            isGrazing: false,
            grazeTimer: Math.random() * 3,
            wanderDir: new THREE.Vector3(1, 0, 0),
            wanderTime: 0,

            children: []
        };

        GameState.enemies.push(baby);
        GameState.scene.add(baby);
        herd.members.push(baby);

        // Track child for mother
        mother.userData.children.push(baby);

        console.log('Baby antelope born!', isMale ? 'Male (brown)' : 'Female (white)',
                    fatherIsCurrentLeader ? '- Father IS the leader!' : '');
    }

    /**
     * Grow a baby antelope into an adult.
     * @param {THREE.Group} baby - The baby antelope
     */
    function growBabyAntelope(baby) {
        const isMale = baby.userData.gender === 'male';
        const antelopeData = isMale
            ? ENEMIES.find(e => e.id === 'antelope_male')
            : ENEMIES.find(e => e.id === 'antelope_female');

        if (!antelopeData) return;

        // Remove old model
        while (baby.children.length > 0) {
            baby.remove(baby.children[0]);
        }

        // Build adult model with appropriate colors and horns
        const adultModel = buildAntelopeModel(antelopeData.colors, isMale, 1, false);
        baby.add(adultModel);

        // Scale to adult size
        baby.scale.set(antelopeData.size, antelopeData.size, antelopeData.size);

        // Update properties
        baby.userData.id = antelopeData.id;
        baby.userData.isBaby = false;
        baby.userData.speed = antelopeData.speed;
        baby.userData.damage = antelopeData.damage;
        baby.userData.radius = antelopeData.radius;
        baby.userData.health = antelopeData.health;
        baby.userData.maxHealth = antelopeData.health;
        baby.userData.lifecycleState = 'grazing';
        baby.userData.minimapColor = antelopeData.minimapColor;

        if (!isMale) {
            baby.userData.canGetPregnant = true;
            baby.userData.isPregnant = false;
        }

        console.log('Baby antelope grew into adult', baby.userData.gender);

        // If male and father was leader, create new herd!
        if (isMale && baby.userData.fatherWasLeader) {
            createNewHerdFromLeadersSon(baby);
        }
    }

    /**
     * Create a new herd when a leader's son reaches adulthood.
     * The son takes 1 other male and 2 females from the herd.
     * @param {THREE.Group} son - The leader's son who becomes new herd leader
     */
    function createNewHerdFromLeadersSon(son) {
        const oldHerd = GameState.antelopeHerds.find(h => h.id === son.userData.herdId);
        if (!oldHerd) return;

        // Find available males (not leader, not babies)
        const availableMales = oldHerd.members.filter(
            m => m !== son &&
                 m.userData.gender === 'male' &&
                 !m.userData.isLeader &&
                 !m.userData.isBaby
        );

        // Find available females (not pregnant, not babies)
        const availableFemales = oldHerd.members.filter(
            m => m.userData.gender === 'female' &&
                 !m.userData.isPregnant &&
                 !m.userData.isBaby
        );

        // Need at least 1 male and 2 females to create new herd
        if (availableMales.length < 1 || availableFemales.length < 2) {
            console.log('Not enough antelope to form new herd, son stays');
            return;
        }

        // Create new herd
        const newHerdId = 'herd_' + Date.now();
        const newHerdMembers = [son];

        // Son becomes leader of new herd
        son.userData.isLeader = true;
        son.userData.herdId = newHerdId;
        son.userData.id = 'antelope_leader';

        // Rebuild model with larger horns
        while (son.children.length > 0) {
            son.remove(son.children[0]);
        }
        const leaderData = ENEMIES.find(e => e.id === 'antelope_male');
        const leaderModel = buildAntelopeModel(leaderData.colors, true, 1.5, false);
        son.add(leaderModel);

        // Take 1 random male
        const takenMale = availableMales[Math.floor(Math.random() * availableMales.length)];
        takenMale.userData.herdId = newHerdId;
        takenMale.userData.leader = son;
        newHerdMembers.push(takenMale);
        oldHerd.members = oldHerd.members.filter(m => m !== takenMale);

        // Take 2 random females
        for (let i = 0; i < 2 && availableFemales.length > 0; i++) {
            const idx = Math.floor(Math.random() * availableFemales.length);
            const takenFemale = availableFemales.splice(idx, 1)[0];
            takenFemale.userData.herdId = newHerdId;
            takenFemale.userData.leader = son;
            newHerdMembers.push(takenFemale);
            oldHerd.members = oldHerd.members.filter(m => m !== takenFemale);
        }

        // Remove son from old herd
        oldHerd.members = oldHerd.members.filter(m => m !== son);

        // Set leader reference for all new herd members
        newHerdMembers.forEach(m => {
            m.userData.leader = son;
        });

        // Move new herd to a different location (west side of map)
        const worldSize = CONFIG.WORLD_SIZE;
        const newHerdX = -worldSize * 0.3 + Math.random() * 10;
        const newHerdZ = (Math.random() - 0.5) * worldSize * 0.4;

        newHerdMembers.forEach((member, idx) => {
            member.position.x = newHerdX + (Math.random() - 0.5) * 8;
            member.position.z = newHerdZ + (Math.random() - 0.5) * 8;
        });

        // Register new herd
        GameState.antelopeHerds.push({
            id: newHerdId,
            leader: son,
            members: newHerdMembers,
            maxSize: 16
        });

        console.log('NEW HERD CREATED! Leader\'s son', son.userData.entityId,
                    'took', newHerdMembers.length - 1, 'antelope to form herd', newHerdId);
    }

    /**
     * Rebuild an antelope model with pregnancy belly.
     * @param {THREE.Group} antelope - The antelope to rebuild
     * @param {boolean} isPregnant - Whether pregnant
     */
    function rebuildAntelopeWithBelly(antelope, isPregnant) {
        const antelopeData = ENEMIES.find(e => e.id === antelope.userData.id);
        if (!antelopeData) return;

        while (antelope.children.length > 0) {
            antelope.remove(antelope.children[0]);
        }

        const hasHorns = antelope.userData.gender === 'male';
        const hornScale = antelope.userData.isLeader ? 1.5 : 1;
        const newModel = buildAntelopeModel(antelopeData.colors, hasHorns, hornScale, isPregnant);
        antelope.add(newModel);
    }

    // ========================================================================
    // SALTAS GAZELLA MATING SYSTEM
    // ========================================================================

    /**
     * Rebuild a Saltas Gazella model with pregnancy belly.
     * @param {THREE.Group} gazella - The gazella to rebuild
     * @param {boolean} isPregnant - Whether pregnant
     */
    function rebuildSaltasGazellaWithBelly(gazella, isPregnant) {
        const gazellaData = ENEMIES.find(e => e.id === gazella.userData.id);
        if (!gazellaData) return;

        while (gazella.children.length > 0) {
            gazella.remove(gazella.children[0]);
        }

        const hasHorns = gazellaData.hasHorns !== false;  // Both sexes have horns
        const newModel = buildSaltasGazellaModel(gazellaData.colors, hasHorns, isPregnant, false, null);
        gazella.add(newModel);
    }

    /**
     * Trigger mating season for Saltas Gazella.
     * Female picks a male from the herd.
     */
    function triggerSaltasGazellaMating() {
        if (!GameState.saltasGazellaHerds || GameState.saltasGazellaHerds.length === 0) {
            return;
        }

        console.log('SALTAS GAZELLA MATING SEASON!');

        GameState.saltasGazellaHerds.forEach(herd => {
            if (!herd.members) return;

            // Find all eligible females (not pregnant, not mothering, not baby)
            const eligibleFemales = herd.members.filter(m =>
                m.userData.gender === 'female' &&
                !m.userData.isPregnant &&
                m.userData.lifecycleState !== 'mothering' &&
                m.userData.lifecycleState !== 'pregnant' &&
                !m.userData.isBaby &&
                GameState.enemies.includes(m)
            );

            // Find all males
            const males = herd.members.filter(m =>
                m.userData.gender === 'male' &&
                !m.userData.isBaby &&
                GameState.enemies.includes(m)
            );

            if (eligibleFemales.length === 0 || males.length === 0) {
                console.log('No eligible gazella for mating');
                return;
            }

            // Each eligible female picks a random male
            for (const female of eligibleFemales) {
                const chosenMate = males[Math.floor(Math.random() * males.length)];

                female.userData.lifecycleState = 'seeking_mate';
                female.userData.targetMate = chosenMate;

                console.log('Saltas Gazella female is seeking a mate!');
            }
        });
    }

    /**
     * Spawn a baby Saltas Gazella near its mother.
     * @param {THREE.Group} mother - The mother gazella
     */
    function spawnSaltasGazellaBaby(mother) {
        // Random gender for baby
        const babyGender = Math.random() < 0.5 ? 'male' : 'female';

        // Get base data
        const baseData = babyGender === 'male'
            ? ENEMIES.find(e => e.id === 'saltas_gazella_male')
            : ENEMIES.find(e => e.id === 'saltas_gazella_female');

        if (!baseData) return;

        // Create baby
        const baby = new THREE.Group();

        // Build model with baby colors - grey for males, sunflower orange for females
        const babyModel = buildSaltasGazellaModel(baseData.colors, true, false, true, babyGender);
        baby.add(babyModel);

        // Position near mother
        const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            0,
            (Math.random() - 0.5) * 2
        );
        baby.position.copy(mother.position).add(offset);
        baby.scale.set(0.4, 0.4, 0.4);  // 40% of adult size

        baby.userData = {
            type: 'saltas_gazella',
            id: babyGender === 'male' ? 'saltas_gazella_male' : 'saltas_gazella_female',
            gender: babyGender,
            speed: baseData.speed * 0.6,  // Slower than adult
            fleeSpeed: baseData.fleeSpeed * 0.7,  // Still fast when fleeing
            damage: 0,
            health: 15,
            maxHealth: 15,
            radius: baseData.radius * 0.4,
            isBaby: true,
            mother: mother,
            lifecycleState: 'baby',
            wanderTime: 0
        };

        // Find mother's herd and add baby
        const herd = GameState.saltasGazellaHerds.find(h =>
            h.members && h.members.includes(mother)
        );
        if (herd) {
            herd.members.push(baby);
        }

        // Link mother to baby
        mother.userData.babyGazella = baby;

        GameState.scene.add(baby);
        GameState.enemies.push(baby);

        console.log(`Saltas Gazella baby born! Gender: ${babyGender}`);
    }

    /**
     * Grow a baby Saltas Gazella into an adult.
     * @param {THREE.Group} baby - The baby gazella
     */
    function growSaltasGazellaBaby(baby) {
        const gender = baby.userData.gender;
        const adultData = gender === 'male'
            ? ENEMIES.find(e => e.id === 'saltas_gazella_male')
            : ENEMIES.find(e => e.id === 'saltas_gazella_female');

        if (!adultData) return;

        // Remove baby model
        while (baby.children.length > 0) {
            baby.remove(baby.children[0]);
        }

        // Build adult model with proper colors
        const adultModel = buildSaltasGazellaModel(adultData.colors, true, false, false, null);
        baby.add(adultModel);

        // Scale to adult size
        baby.scale.set(1, 1, 1);

        // Update userData to adult stats
        baby.userData.isBaby = false;
        baby.userData.speed = adultData.speed;
        baby.userData.fleeSpeed = adultData.fleeSpeed;
        baby.userData.damage = adultData.damage;
        baby.userData.health = adultData.health;
        baby.userData.maxHealth = adultData.health;
        baby.userData.radius = adultData.radius;
        baby.userData.lifecycleState = 'grazing';
        baby.userData.mother = null;
        baby.userData.canGetPregnant = gender === 'female';
        baby.userData.isRideable = true;

        console.log(`Saltas Gazella baby grew up! Now an adult ${gender}`);
    }

    // ========================================================================
    // WILD DOG MATING SYSTEM
    // ========================================================================

    /**
     * Trigger mating season for wild dogs.
     * Any female can get pregnant (equal chance).
     */
    function triggerWildDogMating() {
        if (!GameState.wildDogPacks || GameState.wildDogPacks.length === 0) {
            return;
        }

        console.log('WILD DOG MATING SEASON!');

        GameState.wildDogPacks.forEach(pack => {
            // Skip if pack already has active den
            if (pack.den && pack.den.state === 'active') {
                console.log('Pack already has active den, skipping mating');
                return;
            }

            // Find all eligible females (not pregnant, not mother, alive)
            const eligibleFemales = pack.members.filter(m =>
                m.userData.gender === 'female' &&
                !m.userData.isPregnant &&
                !m.userData.isMother &&
                !m.userData.isBaby &&
                GameState.enemies.includes(m)
            );

            // Find all males for mating
            const males = pack.members.filter(m =>
                m.userData.gender === 'male' &&
                !m.userData.isBaby &&
                GameState.enemies.includes(m)
            );

            if (eligibleFemales.length === 0 || males.length === 0) {
                console.log('No eligible females or males for mating');
                return;
            }

            // Pick a random female to become pregnant (equal chance for any female)
            const chosenFemale = eligibleFemales[Math.floor(Math.random() * eligibleFemales.length)];
            const chosenMate = males[Math.floor(Math.random() * males.length)];

            // Female becomes pregnant!
            chosenFemale.userData.isPregnant = true;
            chosenFemale.userData.gestationTimer = 180; // 3 minutes gestation
            chosenFemale.userData.lifecycleState = 'pregnant';
            chosenFemale.userData.mate = chosenMate;

            // Rebuild model with pregnancy belly
            rebuildWildDogModel(chosenFemale, true);

            console.log('Wild dog female is now pregnant!',
                        chosenFemale.userData.isAlpha ? '(Alpha)' : '(Pack member)');
        });
    }

    /**
     * Create a wild dog den under a tree.
     */
    function createWildDogDen(mother, treePos) {
        const den = new THREE.Group();

        // Ground depression (dug earth)
        const depressionGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.3, 16);
        const depressionMat = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
        const depression = new THREE.Mesh(depressionGeo, depressionMat);
        depression.position.y = -0.1;
        den.add(depression);

        // Rim of dug earth
        const rimGeo = new THREE.TorusGeometry(1.3, 0.15, 8, 16);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x8B6914 });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.05;
        den.add(rim);

        // Position near tree
        const denX = treePos.x + (Math.random() - 0.5) * 3;
        const denZ = treePos.z + (Math.random() - 0.5) * 3;
        den.position.set(denX, 0, denZ);

        GameState.scene.add(den);

        const denObject = {
            mesh: den,
            position: { x: denX, z: denZ },
            id: 'wilddog_den_' + Date.now(),
            packId: mother.userData.packId,
            motherId: mother.userData.entityId,
            treePosition: treePos,
            pups: [],
            state: 'active',
            createdTime: GameState.timeElapsed
        };

        if (!GameState.wildDogDens) GameState.wildDogDens = [];
        GameState.wildDogDens.push(denObject);

        // Update pack reference
        const pack = GameState.wildDogPacks.find(p => p.id === mother.userData.packId);
        if (pack) pack.den = denObject;

        return denObject;
    }

    /**
     * Spawn wild dog pups at a den.
     */
    function spawnWildDogPups(mother, count) {
        const den = GameState.wildDogDens ?
            GameState.wildDogDens.find(d => d.motherId === mother.userData.entityId) : null;
        if (!den) return;

        const pack = GameState.wildDogPacks.find(p => p.id === mother.userData.packId);

        for (let i = 0; i < count; i++) {
            const isMale = Math.random() < 0.5;

            // Pup colors: black if male, yellow if female
            const pupColors = isMale ? {
                body: 0x1A1A1A,
                belly: 0x2A2A2A,
                chest: 0x1A1A1A,
                patches: 0x0A0A0A,
                patchesLight: 0x3A3A3A,
                muzzle: 0x0A0A0A,
                nose: 0x000000,
                eyes: 0x3A3A3A,
                eyeGlow: 0x0A0A0A,
                ears: 0x1A1A1A,
                earInner: 0x2A2A2A,
                legs: 0x0A0A0A,
                paws: 0x1A1A1A,
                tail: 0x1A1A1A,
                tailTip: 0xCCCCCC
            } : {
                body: 0xFFD700,
                belly: 0xFFE4B5,
                chest: 0xFFD700,
                patches: 0xDAA520,
                patchesLight: 0xFFF8DC,
                muzzle: 0x8B6914,
                nose: 0x000000,
                eyes: 0xB8860B,
                eyeGlow: 0x332200,
                ears: 0xDAA520,
                earInner: 0xF0E68C,
                legs: 0x8B6914,
                paws: 0xA0522D,
                tail: 0xFFD700,
                tailTip: 0xFFFFFF
            };

            const model = buildWildDogModel(pupColors, false, false);
            const pup = new THREE.Group();
            pup.add(model);
            pup.scale.set(0.35, 0.35, 0.35); // 35% adult size

            // Position in den
            pup.position.set(
                den.position.x + (Math.random() - 0.5) * 1.5,
                0,
                den.position.z + (Math.random() - 0.5) * 1.5
            );

            pup.userData = {
                entityId: 'wilddog_pup_' + Date.now() + '_' + i,
                id: isMale ? 'wild_dog_pup_male' : 'wild_dog_pup_female',
                type: 'wild_dog',
                gender: isMale ? 'male' : 'female',
                speed: 4,
                damage: 5,
                radius: 0.25,
                health: 10,
                maxHealth: 10,
                friendly: true,
                minimapColor: isMale ? '#1A1A1A' : '#FFD700',

                packId: mother.userData.packId,
                isAlpha: false,
                alpha: pack ? pack.alpha : null,
                isPackAnimal: true,

                isBaby: true,
                mother: mother,
                denId: den.id,
                maturityTime: GameState.timeElapsed + 420, // 7 minutes

                lifecycleState: 'pup',
                walkPhase: Math.random() * Math.PI * 2,
                children: []
            };

            GameState.enemies.push(pup);
            GameState.scene.add(pup);
            den.pups.push(pup);
            mother.userData.pups.push(pup);
            if (pack) pack.members.push(pup);
        }
    }

    /**
     * Grow a wild dog pup into an adult.
     */
    function growWildDogPup(pup) {
        const isMale = pup.userData.gender === 'male';
        const dogData = isMale ?
            ENEMIES.find(e => e.id === 'wild_dog_male') :
            ENEMIES.find(e => e.id === 'wild_dog_female');

        if (!dogData) return;

        // Remove old model
        while (pup.children.length > 0) {
            pup.remove(pup.children[0]);
        }

        // Build adult model
        const adultModel = buildWildDogModel(dogData.colors, false, false);
        pup.add(adultModel);

        // Scale to adult size
        pup.scale.set(dogData.size, dogData.size, dogData.size);

        // Update properties
        pup.userData.id = dogData.id;
        pup.userData.isBaby = false;
        pup.userData.speed = dogData.speed;
        pup.userData.damage = dogData.damage;
        pup.userData.radius = dogData.radius;
        pup.userData.health = dogData.health;
        pup.userData.maxHealth = dogData.health;
        pup.userData.lifecycleState = 'following';
        pup.userData.minimapColor = dogData.minimapColor;

        if (!isMale) {
            pup.userData.canGetPregnant = true;
            pup.userData.isPregnant = false;
        }

        console.log('Wild dog pup grew into adult', pup.userData.gender);
    }

    /**
     * Rebuild wild dog model (for pregnancy).
     */
    function rebuildWildDogModel(dog, isPregnant) {
        const isAlpha = dog.userData.isAlpha;
        const dogData = isAlpha ?
            ENEMIES.find(e => e.id === 'wild_dog_alpha') :
            (dog.userData.gender === 'male' ?
                ENEMIES.find(e => e.id === 'wild_dog_male') :
                ENEMIES.find(e => e.id === 'wild_dog_female'));

        if (!dogData) return;

        while (dog.children.length > 0) {
            dog.remove(dog.children[0]);
        }

        const newModel = buildWildDogModel(dogData.colors, isAlpha, isPregnant);
        dog.add(newModel);
    }

    // ========================================================================
    // WILD DOG HUNTING SYSTEM
    // ========================================================================

    /**
     * Trigger a pack hunt for wild dogs.
     */
    function triggerWildDogHunt() {
        if (!GameState.wildDogPacks || GameState.wildDogPacks.length === 0) {
            return;
        }

        GameState.wildDogPacks.forEach(pack => {
            // Skip if already hunting
            if (pack.currentHunt) return;

            // Find hunt leader (alpha, or her mate if she's denning)
            let huntLeader = pack.alpha;
            if (pack.alpha && (pack.alpha.userData.isMother || pack.alpha.userData.lifecycleState === 'denning')) {
                huntLeader = pack.alphaMate;
            }

            if (!huntLeader || !GameState.enemies.includes(huntLeader)) return;

            // Find target prey - prioritize weak targets
            // Target both antelope AND Saltas Gazella (gazella are faster but can be caught)
            // Priority: 1) Previously injured, 2) Babies, 3) Females, 4) Males, 5) Leader (rare)
            let allPrey = [];
            let injuredPrey = [];
            let babyPrey = [];
            let femalePrey = [];
            let malePrey = [];
            let leaderPrey = null;

            // Gather antelope
            if (GameState.antelopeHerds) {
                GameState.antelopeHerds.forEach(herd => {
                    herd.members.forEach(animal => {
                        if (animal.userData.lifecycleState === 'fleeing') return;
                        if (!GameState.enemies.includes(animal)) return;

                        allPrey.push(animal);

                        if (animal.userData.isInjured) {
                            injuredPrey.push(animal);
                        } else if (animal.userData.isBaby) {
                            babyPrey.push(animal);
                        } else if (animal.userData.gender === 'female') {
                            femalePrey.push(animal);
                        } else if (animal.userData.isLeader) {
                            leaderPrey = animal;
                        } else {
                            malePrey.push(animal);
                        }
                    });
                });
            }

            // Gather Saltas Gazella (faster, harder to catch!)
            if (GameState.saltasGazellaHerds) {
                GameState.saltasGazellaHerds.forEach(herd => {
                    if (!herd.members) return;
                    herd.members.forEach(animal => {
                        if (animal.userData.lifecycleState === 'fleeing') return;
                        if (!GameState.enemies.includes(animal)) return;

                        allPrey.push(animal);

                        if (animal.userData.isInjured) {
                            injuredPrey.push(animal);
                        } else if (animal.userData.isBaby) {
                            babyPrey.push(animal);
                        } else if (animal.userData.gender === 'female') {
                            femalePrey.push(animal);
                        } else {
                            malePrey.push(animal);
                        }
                    });
                });
            }

            if (allPrey.length === 0) {
                console.log('No prey available for wild dog hunt');
                return;
            }

            // Target selection - prioritize weak targets within reasonable range
            let targetPrey = null;
            const maxPreferredDist = 150;  // Prefer targets within this range

            // Helper to find closest in category
            const findClosest = (candidates) => {
                let closest = null;
                let closestDist = Infinity;
                candidates.forEach(a => {
                    const dist = huntLeader.position.distanceTo(a.position);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closest = a;
                    }
                });
                return { target: closest, dist: closestDist };
            };

            // 1) First priority: Previously injured prey (from last hunt fight back)
            if (injuredPrey.length > 0) {
                const result = findClosest(injuredPrey);
                if (result.dist < maxPreferredDist * 2) {  // Will travel further for injured prey
                    targetPrey = result.target;
                    console.log('Wild dogs targeting injured prey!');
                }
            }

            // 2) Second priority: Babies (if nearby)
            if (!targetPrey && babyPrey.length > 0) {
                const result = findClosest(babyPrey);
                if (result.dist < maxPreferredDist) {
                    targetPrey = result.target;
                    console.log('Wild dogs targeting baby!');
                }
            }

            // 3) Third priority: Females (if nearby)
            if (!targetPrey && femalePrey.length > 0) {
                const result = findClosest(femalePrey);
                if (result.dist < maxPreferredDist) {
                    targetPrey = result.target;
                }
            }

            // 4) Fourth priority: Regular males
            if (!targetPrey && malePrey.length > 0) {
                const result = findClosest(malePrey);
                if (result.dist < maxPreferredDist) {
                    targetPrey = result.target;
                }
            }

            // 5) Small chance (15%) to target herd leader even if other options exist
            if (leaderPrey && Math.random() < 0.15) {
                targetPrey = leaderPrey;
                console.log('Wild dogs daringly targeting the herd LEADER!');
            }

            // 6) Fallback: pick any prey if nothing nearby
            if (!targetPrey) {
                targetPrey = allPrey[Math.floor(Math.random() * allPrey.length)];
            }

            const targetIsMale = targetPrey.userData.gender === 'male';
            const targetIsLeader = targetPrey.userData.isLeader;
            const targetIsInjured = targetPrey.userData.isInjured;
            const targetIsBaby = targetPrey.userData.isBaby;
            const targetIsGazella = targetPrey.userData.type === 'saltas_gazella';

            // Determine outcome at hunt start!
            // Base chances for antelope: 50% escape, 40% fight back, 10% success
            // Saltas Gazella: 75% escape, 10% fight back, 15% success (FAST!)
            // Injured targets: reduced escape, easier to kill
            // Baby targets: easier to catch
            let escapeChance, fightBackChance;

            if (targetIsGazella) {
                // Saltas Gazella are EXTREMELY fast - very hard to catch!
                if (targetIsInjured) {
                    escapeChance = 0.50;    // Even injured, still fast
                    fightBackChance = 0.10;
                    // 40% success
                } else if (targetIsBaby) {
                    escapeChance = 0.55;
                    fightBackChance = 0.10;
                    // 35% success
                } else {
                    escapeChance = 0.75;    // 75% escape!
                    fightBackChance = 0.10; // 10% fight back
                    // 15% success
                }
            } else if (targetIsInjured) {
                escapeChance = 0.30;
                fightBackChance = 0.30;  // 40% success
            } else if (targetIsBaby) {
                escapeChance = 0.40;
                fightBackChance = 0.20;  // 40% success
            } else {
                escapeChance = 0.50;
                fightBackChance = 0.40;  // 10% success
            }

            const outcomeRoll = Math.random();
            let outcome;
            if (outcomeRoll < escapeChance) {
                outcome = 'escape';
            } else if (outcomeRoll < escapeChance + fightBackChance) {
                outcome = 'fight_back';
            } else {
                outcome = 'success';
            }

            // Determine if a pack member dies during fight_back
            // Antelope death chances:
            // - Leader antelope: 85% chance to kill a dog (very dangerous!)
            // - Male antelope: 70% chance to kill a dog
            // - Female antelope: 30% chance to kill a dog
            // - Baby antelope: 5% chance (mother might intervene)
            // Gazella death chances (they fight less, flee more):
            // - Male gazella: 40% chance to kick a dog
            // - Female gazella: 20% chance
            // - Baby gazella: 5% chance
            // - Injured: half normal chance
            let casualty = null;
            if (outcome === 'fight_back') {
                let deathChance;
                if (targetIsGazella) {
                    // Gazella are less dangerous - they prefer to run!
                    if (targetIsBaby) {
                        deathChance = 0.05;
                    } else if (targetIsMale) {
                        deathChance = 0.40;  // Can kick hard
                    } else {
                        deathChance = 0.20;
                    }
                } else if (targetIsLeader) {
                    deathChance = 0.85;  // Leader is VERY dangerous!
                } else if (targetIsBaby) {
                    deathChance = 0.05;
                } else if (targetIsMale) {
                    deathChance = 0.70;
                } else {
                    deathChance = 0.30;
                }

                // Injured targets are half as dangerous
                if (targetIsInjured) {
                    deathChance *= 0.5;
                }

                if (Math.random() < deathChance) {
                    // A pack member will die - pick a random hunting member
                    const huntingMembers = pack.members.filter(m =>
                        m.userData.lifecycleState !== 'denning' &&
                        m.userData.lifecycleState !== 'pup' &&
                        !m.userData.isBaby &&
                        !m.userData.isAlpha &&  // Alpha doesn't die in hunts
                        GameState.enemies.includes(m)
                    );
                    if (huntingMembers.length > 0) {
                        casualty = huntingMembers[Math.floor(Math.random() * huntingMembers.length)];
                    }
                }
            }

            // Get hunting participants (not denning, not pups)
            const participants = pack.members.filter(m =>
                m.userData.lifecycleState !== 'denning' &&
                m.userData.lifecycleState !== 'pup' &&
                !m.userData.isBaby &&
                GameState.enemies.includes(m)
            );

            if (participants.length === 0) {
                console.log('No wild dogs available to hunt');
                return;
            }

            // Create hunt object
            const hunt = {
                id: 'hunt_' + Date.now(),
                packId: pack.id,
                leader: huntLeader,
                target: targetPrey,
                outcome: outcome,
                participants: participants,
                state: 'chasing',
                timer: 0,
                casualty: casualty,
                killPosition: null
            };

            pack.currentHunt = hunt;

            // Set all participants to hunting
            participants.forEach(member => {
                member.userData.lifecycleState = 'hunting_chase';
                member.userData.huntTarget = targetPrey;
                member.userData.isHunting = true;
            });

            // Build target description
            const preyType = targetIsGazella ? 'gazella' : 'antelope';
            let targetDesc = targetIsLeader ? 'LEADER' :
                             targetIsInjured ? 'INJURED' :
                             targetIsBaby ? 'BABY' :
                             targetIsMale ? 'male' : 'female';

            console.log('WILD DOG PACK HUNT STARTED!',
                        'Target:', targetDesc, preyType + '.',
                        'Outcome:', outcome,
                        casualty ? '- A dog will die!' : '- No dog casualties');
        });
    }

    /**
     * End a wild dog hunt.
     */
    function endWildDogHunt(pack, reason) {
        if (!pack || !pack.currentHunt) return;

        const hunt = pack.currentHunt;

        // Reset all participants
        hunt.participants.forEach(p => {
            if (GameState.enemies.includes(p)) {
                p.userData.lifecycleState = 'following';
                p.userData.isHunting = false;
                p.userData.huntTarget = null;
                p.position.y = 0;

                // Reset leg positions
                const model = p.children[0];
                if (model && model.userData.legs) {
                    model.userData.legs.forEach(leg => {
                        leg.group.rotation.z = 0;
                        leg.lowerLegGroup.rotation.z = 0;
                    });
                }
                // Reset neck position
                if (model && model.userData.parts && model.userData.parts.neckGroup) {
                    model.userData.parts.neckGroup.rotation.z = 0;
                }
            }
        });

        // Reset antelope if it escaped
        if (hunt.target && GameState.enemies.includes(hunt.target)) {
            hunt.target.userData.isFleeing = false;
            hunt.target.userData.lifecycleState = hunt.target.userData.originalLifecycleState || 'grazing';
        }

        pack.currentHunt = null;

        console.log('Wild dog hunt ended:', reason);
    }

    // ========================================================================
    // DRONGLOUS CAT SYSTEM
    // ========================================================================
    // Tree-dwelling predators discovered by Professor Snoutworth!
    // Males are black, females are grey, baby males dark grey, baby females white.
    // They live in acacia trees and hunt baby gazella, baby antelope, toads,
    // wild dog pups, and vipers. Mothers defend babies fiercely.

    /**
     * Spawn Dronglous Cats in acacia trees.
     * Each cat gets assigned to a tree.
     * @param {number} count - Total number of cats to spawn
     */
    function spawnDronglousCats(count) {
        const maleData = ENEMIES.find(e => e.id === 'dronglous_cat_male');
        const femaleData = ENEMIES.find(e => e.id === 'dronglous_cat_female');

        if (!maleData || !femaleData) {
            console.warn('Dronglous Cat data not found');
            return;
        }

        // Find acacia trees in the savannah
        const acaciaTrees = GameState.trees.filter(t =>
            t.userData && t.userData.treeType === 'acacia'
        );

        if (acaciaTrees.length < count) {
            console.warn('Not enough acacia trees for Dronglous Cats');
        }

        // Shuffle trees and assign cats
        const shuffledTrees = [...acaciaTrees].sort(() => Math.random() - 0.5);

        const maleCount = Math.floor(count / 2);
        let spawned = 0;

        for (let i = 0; i < count && i < shuffledTrees.length; i++) {
            const tree = shuffledTrees[i];
            const isMale = spawned < maleCount;
            const catData = isMale ? maleData : femaleData;

            // Spawn at tree position (slightly elevated - in tree)
            const cat = createEnemy(catData, tree.position.x, tree.position.z);

            if (cat) {
                // Position in tree
                cat.position.y = 3 + Math.random() * 2; // High up in tree

                // IMPORTANT: Cats manage their own Y position (tree climbing)
                // This prevents updateEnemies from forcing them to ground
                cat.userData.ignoreGravity = true;

                // Store tree reference
                cat.userData.homeTree = tree;
                cat.userData.treePosition = tree.position.clone();
                cat.userData.gender = isMale ? 'male' : 'female';

                // Lifecycle state
                cat.userData.lifecycleState = 'in_tree'; // in_tree, descending, hunting, eating, ascending, mating
                cat.userData.stateTimer = 0;
                cat.userData.huntTarget = null;
                cat.userData.huntPhase = null; // approaching, pouncing, takedown, eating
                cat.userData.babies = [];
                cat.userData.isMother = false;

                // Mark tree as occupied
                tree.userData.dronglousCat = cat;

                GameState.enemies.push(cat);
                GameState.scene.add(cat);
                spawned++;
            }
        }

        console.log('Spawned', spawned, 'Dronglous Cats in trees');
    }

    /**
     * Update all Dronglous Cats - AI behavior.
     * @param {number} delta - Time elapsed
     */
    function updateDronglousCats(delta) {
        const cats = GameState.enemies.filter(e => e.userData.type === 'dronglous_cat');

        // DEBUG: Log once per second
        if (!window._catDebugTimer) window._catDebugTimer = 0;
        window._catDebugTimer += delta;
        if (window._catDebugTimer > 1) {
            window._catDebugTimer = 0;
            console.log(`🐱 CAT DEBUG: Found ${cats.length} cats`);
            cats.forEach((cat, i) => {
                console.log(`  Cat ${i}: homeTree=${!!cat.userData.homeTree}, state=${cat.userData.lifecycleState}, timer=${cat.userData.stateTimer?.toFixed(1)}`);
            });
        }

        cats.forEach(cat => {
            if (!cat.userData.homeTree) {
                console.log('⚠️ Cat has no homeTree, skipping!');
                return;
            }

            cat.userData.stateTimer += delta;
            const state = cat.userData.lifecycleState;

            switch (state) {
                case 'in_tree':
                    updateCatInTree(cat, delta);
                    break;
                case 'descending':
                    updateCatDescending(cat, delta);
                    break;
                case 'hunting':
                    updateCatHunting(cat, delta);
                    break;
                case 'takedown':
                    updateCatTakedown(cat, delta);
                    break;
                case 'eating':
                    updateCatEating(cat, delta);
                    break;
                case 'ascending':
                    updateCatAscending(cat, delta);
                    break;
                case 'defending':
                    updateCatDefending(cat, delta);
                    break;
                case 'mating':
                    updateCatMating(cat, delta);
                    break;
                case 'baby_playing':
                    updateBabyPlaying(cat, delta);
                    break;
            }

            // Mother defense check - if cat is mother and enemy near babies
            if (cat.userData.isMother && cat.userData.babies.length > 0) {
                checkMotherDefense(cat);
            }

            // Animate the cat model - SKIP animation during hunting/ascending to prevent twitching
            // TODO: Fix animation to work properly with movement
            if (state !== 'hunting' && state !== 'ascending' && state !== 'descending') {
                const isMoving = ['defending', 'baby_playing'].includes(state);
                const speed = cat.userData.speed || 8;
                animateDronglousCat(cat, delta, isMoving, speed);
            }
        });
    }

    /**
     * Cat behavior when in tree - look for prey, decide when to hunt.
     */
    function updateCatInTree(cat, delta) {
        // Stay in tree, occasionally look around
        const tree = cat.userData.homeTree;

        // Stay at a fixed offset from tree (no more circular floating)
        if (!cat.userData.treeOffset) {
            // Set random offset once when first entering tree
            const angle = Math.random() * Math.PI * 2;
            cat.userData.treeOffset = { x: Math.cos(angle) * 1.2, z: Math.sin(angle) * 1.2 };
        }

        cat.position.x = tree.position.x + cat.userData.treeOffset.x;
        cat.position.z = tree.position.z + cat.userData.treeOffset.z;

        // Keep cats at tree height (ignoreGravity flag prevents them from falling)
        cat.position.y = 4;

        // Babies don't hunt
        if (cat.userData.isBaby) return;

        // Set hunt threshold once (not every frame!)
        if (!cat.userData.huntThreshold) {
            cat.userData.huntThreshold = 2 + Math.random() * 3;
            console.log(`🎯 Cat hunt threshold set to ${cat.userData.huntThreshold.toFixed(1)} seconds`);
        }

        // Check if it's time to look for prey
        if (cat.userData.stateTimer > cat.userData.huntThreshold) {
            console.log('👀 Cat checking for prey...');

            // Look for prey within range
            const prey = findCatPrey(cat);
            if (prey) {
                cat.userData.huntTarget = prey;
                cat.userData.lifecycleState = 'descending';
                cat.userData.stateTimer = 0;
                delete cat.userData.huntThreshold; // Reset for next time
                console.log('🐱 Dronglous Cat spotted prey:', prey.userData.type, '- Starting descent!');
            } else {
                // No prey found, try again in a few seconds
                console.log('😿 No prey found, will check again soon');
                cat.userData.stateTimer = 0;
                cat.userData.huntThreshold = 2 + Math.random() * 3;
            }
        }
    }

    /**
     * Find suitable prey for the cat.
     * Priorities: baby gazella, baby antelope, toads, wild dog pups, vipers, PLAYER!
     */
    function findCatPrey(cat) {
        const huntRange = 30;
        let bestPrey = null;
        let bestPriority = 0;

        // Check if player (peccary) is in range - peccary is prey too!
        if (GameState.peccary) {
            const playerDist = cat.position.distanceTo(GameState.peccary.position);
            console.log('🔍 Player check: dist=' + playerDist.toFixed(1) + ', range=' + huntRange);
            if (playerDist <= huntRange) {
                console.log('🎯 Player (peccary) in range! Will hunt!');
                // Player is medium priority prey (priority 3)
                bestPrey = GameState.peccary;
                bestPriority = 3;
            }
        } else {
            console.log('⚠️ GameState.peccary is null!');
        }

        GameState.enemies.forEach(enemy => {
            if (enemy === cat) return;
            const dist = cat.position.distanceTo(enemy.position);
            if (dist > huntRange) return;

            // Check if valid prey
            let priority = 0;
            const type = enemy.userData.type;

            if (type === 'saltas_gazella' && enemy.userData.isBaby) {
                priority = 5; // Loves baby gazella
            } else if (type === 'antelope' && enemy.userData.isBaby) {
                priority = 4; // Baby antelope
            } else if (type === 'leopard_toad') {
                priority = 3; // Toads
            } else if (type === 'wild_dog' && enemy.userData.isBaby) {
                // Only hunt pups if wild dog den is under cat's tree
                const tree = cat.userData.homeTree;
                const denNearby = GameState.wildDogDens && GameState.wildDogDens.some(den =>
                    den.position.distanceTo(tree.position) < 10
                );
                if (denNearby) {
                    priority = 4; // Pups from nearby den
                }
            } else if (type === 'grass_viper') {
                priority = 2; // Vipers
            }

            if (priority > bestPriority) {
                bestPriority = priority;
                bestPrey = enemy;
            }
        });

        return bestPrey;
    }

    /**
     * Cat descending from tree to hunt.
     * Visible jump animation from tree to ground.
     */
    function updateCatDescending(cat, delta) {
        const tree = cat.userData.homeTree;
        const groundY = cat.userData.groundY || 0.3;

        // Initialize jump if not started
        if (!cat.userData.jumpStarted) {
            cat.userData.jumpStarted = true;
            cat.userData.jumpTimer = 0;
            cat.userData.jumpDuration = 0.6; // 0.6 second jump

            // Store start position
            cat.userData.jumpStartPos = cat.position.clone();

            // Calculate landing spot (toward prey if we have one)
            let landAngle;
            if (cat.userData.huntTarget) {
                const target = cat.userData.huntTarget;
                landAngle = Math.atan2(
                    target.position.z - tree.position.z,
                    target.position.x - tree.position.x
                );
            } else {
                landAngle = Math.random() * Math.PI * 2;
            }

            const landingDist = 3.0;
            cat.userData.jumpEndPos = new THREE.Vector3(
                tree.position.x + Math.cos(landAngle) * landingDist,
                groundY,
                tree.position.z + Math.sin(landAngle) * landingDist
            );

            // Play pounce sound
            Game.playSound('cat_pounce');

            // Face landing direction
            const catModel = cat.children[0];
            if (catModel) {
                catModel.rotation.y = landAngle;
            }
        }

        // Animate the jump
        cat.userData.jumpTimer += delta;
        const t = Math.min(cat.userData.jumpTimer / cat.userData.jumpDuration, 1);

        const start = cat.userData.jumpStartPos;
        const end = cat.userData.jumpEndPos;

        // Interpolate X and Z
        cat.position.x = start.x + (end.x - start.x) * t;
        cat.position.z = start.z + (end.z - start.z) * t;

        // Arc for Y (parabola)
        const arcHeight = 2.0;
        const baseY = start.y + (end.y - start.y) * t;
        cat.position.y = baseY + Math.sin(t * Math.PI) * arcHeight;

        // Jump finished?
        if (t >= 1) {
            cat.position.y = groundY;
            cat.userData.lifecycleState = 'hunting';
            cat.userData.stateTimer = 0;
            cat.userData.huntPhase = 'approaching';

            // Clean up
            delete cat.userData.jumpStarted;
            delete cat.userData.jumpTimer;
            delete cat.userData.jumpStartPos;
            delete cat.userData.jumpEndPos;
        }
    }

    /**
     * Cat actively hunting prey.
     */
    function updateCatHunting(cat, delta) {
        const target = cat.userData.huntTarget;

        // Check if target still exists
        // Special case: target could be the player (peccary)!
        const isPlayer = target === GameState.peccary;
        const targetValid = isPlayer || (target && GameState.enemies.includes(target));

        if (!targetValid) {
            console.log('🚫 Cat lost target, ascending');
            cat.userData.huntTarget = null;
            cat.userData.lifecycleState = 'ascending';
            cat.userData.stateTimer = 0;
            return;
        }

        const dist = cat.position.distanceTo(target.position);

        if (cat.userData.huntPhase === 'approaching') {
            // Creep toward prey
            const dir = new THREE.Vector3()
                .subVectors(target.position, cat.position)
                .normalize();

            // Move at hunting speed
            const speed = cat.userData.speed * 1.2;
            cat.position.x += dir.x * speed * delta;
            cat.position.z += dir.z * speed * delta;

            // Face movement direction
            const catModel = cat.children[0];
            if (catModel) {
                catModel.rotation.y = Math.atan2(
                    -(target.position.z - cat.position.z),
                    target.position.x - cat.position.x
                );
                catModel.rotation.x = 0;
                catModel.rotation.z = 0;
            }

            // Close enough to pounce?
            if (dist < 3) {
                cat.userData.huntPhase = 'pouncing';
                cat.userData.pounceStartPos = cat.position.clone();
                cat.userData.pounceTimer = 0;
            }
        } else if (cat.userData.huntPhase === 'pouncing') {
            // Pounce animation - leap onto prey's back
            cat.userData.pounceTimer += delta;
            const t = Math.min(cat.userData.pounceTimer / 0.5, 1); // 0.5 second pounce

            // Arc toward target
            const start = cat.userData.pounceStartPos;
            cat.position.x = start.x + (target.position.x - start.x) * t;
            cat.position.z = start.z + (target.position.z - start.z) * t;
            cat.position.y = Math.sin(t * Math.PI) * 1.5; // Arc up then down

            if (t >= 1) {
                // Landed on prey - start takedown
                cat.userData.lifecycleState = 'takedown';
                cat.userData.stateTimer = 0;
                cat.userData.takedownPhase = 'on_back';

                // Mark prey as being taken down
                target.userData.isBeingAttacked = true;
                target.userData.attackedBy = cat;
            }
        }
    }

    /**
     * Takedown animation - the dramatic kill sequence.
     */
    function updateCatTakedown(cat, delta) {
        const target = cat.userData.huntTarget;

        if (!target || !GameState.enemies.includes(target)) {
            cat.userData.lifecycleState = 'ascending';
            return;
        }

        cat.userData.stateTimer += delta;
        const phase = cat.userData.takedownPhase;

        if (phase === 'on_back') {
            // Cat is on prey's back, prey falls over
            cat.position.copy(target.position);
            cat.position.y = target.position.y + 0.5;

            // Prey falls over (rotate)
            target.rotation.z = Math.min(target.rotation.z + delta * 3, Math.PI / 2);

            if (cat.userData.stateTimer > 0.8) {
                cat.userData.takedownPhase = 'grabbing';
                cat.userData.stateTimer = 0;
            }
        } else if (phase === 'grabbing') {
            // Cat gets off, grabs head and shoulder
            cat.position.x = target.position.x + 0.3;
            cat.position.z = target.position.z;
            cat.position.y = 0.3;

            // Face prey
            cat.rotation.y = Math.atan2(
                target.position.x - cat.position.x,
                target.position.z - cat.position.z
            ) + Math.PI / 2;

            if (cat.userData.stateTimer > 0.5) {
                cat.userData.takedownPhase = 'biting';
                cat.userData.stateTimer = 0;
            }
        } else if (phase === 'biting') {
            // Fatal bite - prey thrashes then stops
            const thrashIntensity = Math.max(0, 1 - cat.userData.stateTimer / 2);

            // Prey thrashes legs
            if (target.children[0] && target.children[0].userData.legs) {
                target.children[0].userData.legs.forEach(leg => {
                    leg.group.rotation.z = Math.sin(cat.userData.stateTimer * 15) * thrashIntensity * 0.5;
                });
            }

            if (cat.userData.stateTimer > 2.5) {
                // Prey is dead
                cat.userData.lifecycleState = 'eating';
                cat.userData.stateTimer = 0;
                cat.userData.mealSize = target.userData.size || 1;

                // Remove prey from game
                GameState.scene.remove(target);
                const idx = GameState.enemies.indexOf(target);
                if (idx !== -1) GameState.enemies.splice(idx, 1);

                cat.userData.huntTarget = null;
                console.log('Dronglous Cat killed prey!');
            }
        }
    }

    /**
     * Cat eating - stays on ground for a while.
     */
    function updateCatEating(cat, delta) {
        // Eating animation - stay in place, occasional head movement
        const model = cat.children[0];
        if (model && model.userData.parts && model.userData.parts.head) {
            model.userData.parts.head.rotation.x = Math.sin(GameState.timeElapsed * 2) * 0.1;
        }

        // Eating time based on meal size
        const eatTime = 5 + (cat.userData.mealSize || 1) * 3;

        if (cat.userData.stateTimer > eatTime) {
            cat.userData.lifecycleState = 'ascending';
            cat.userData.stateTimer = 0;
        }
    }

    /**
     * Cat climbing back up to tree.
     * SIMPLE JUMP - just teleport back to tree!
     */
    function updateCatAscending(cat, delta) {
        const tree = cat.userData.homeTree;
        if (!tree) return;

        // Move toward tree base first
        const dir = new THREE.Vector3()
            .subVectors(tree.position, cat.position);
        dir.y = 0;

        if (dir.length() > 1.5) {
            // Running to tree
            dir.normalize();
            cat.position.x += dir.x * cat.userData.speed * delta;
            cat.position.z += dir.z * cat.userData.speed * delta;

            // Face direction of movement
            const catModel = cat.children[0];
            if (catModel) {
                catModel.rotation.y = Math.atan2(
                    -(tree.position.z - cat.position.z),
                    tree.position.x - cat.position.x
                );
                catModel.rotation.x = 0;
                catModel.rotation.z = 0;
            }
        } else {
            // At tree - JUMP straight to top!
            console.log('🐱 Cat jumping back into tree!');

            const targetY = 3 + Math.random() * 2;
            const angle = Math.random() * Math.PI * 2;
            const branchDist = 1.5;

            // Teleport to tree top
            cat.position.x = tree.position.x + Math.cos(angle) * branchDist;
            cat.position.z = tree.position.z + Math.sin(angle) * branchDist;
            cat.position.y = targetY;

            // Back in tree
            cat.userData.lifecycleState = 'in_tree';
            cat.userData.stateTimer = 0;

            console.log('✅ Cat jumped back into tree at Y:', targetY.toFixed(1));

            // Reset model rotation
            const catModel = cat.children[0];
            if (catModel) {
                catModel.rotation.x = 0;
                catModel.rotation.y = Math.PI;
                catModel.rotation.z = 0;
            }
        }
    }

    /**
     * Mother cat defending babies.
     */
    function updateCatDefending(cat, delta) {
        const threat = cat.userData.defenseThreat;

        if (!threat || !GameState.enemies.includes(threat)) {
            cat.userData.lifecycleState = 'in_tree';
            cat.userData.defenseThreat = null;
            return;
        }

        const dist = cat.position.distanceTo(threat.position);

        // Chase and attack threat
        if (dist > 1.5) {
            const dir = new THREE.Vector3()
                .subVectors(threat.position, cat.position)
                .normalize();

            cat.position.x += dir.x * cat.userData.speed * 1.2 * delta;
            cat.position.z += dir.z * cat.userData.speed * 1.2 * delta;
            cat.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI / 2;
        } else {
            // Attack! Deal damage
            threat.userData.health = (threat.userData.health || 10) - cat.userData.damage * delta;

            if (threat.userData.health <= 0) {
                // Threat killed or fled
                console.log('Mother cat drove off threat!');
                cat.userData.lifecycleState = 'ascending';
                cat.userData.defenseThreat = null;
            }
        }

        // Stop defending after a while
        if (cat.userData.stateTimer > 10) {
            cat.userData.lifecycleState = 'ascending';
            cat.userData.defenseThreat = null;
        }
    }

    /**
     * Check if mother needs to defend babies.
     */
    function checkMotherDefense(cat) {
        if (cat.userData.lifecycleState === 'defending') return;

        const tree = cat.userData.homeTree;
        const defenseRange = 8;

        // Check for threats near tree/babies
        GameState.enemies.forEach(enemy => {
            if (enemy === cat) return;
            if (enemy.userData.type === 'dronglous_cat') return; // Don't attack own kind

            const dist = tree.position.distanceTo(enemy.position);
            if (dist < defenseRange) {
                // Only defend against potential threats
                const threatTypes = ['wild_dog', 'grass_viper', 'peccary'];
                if (threatTypes.includes(enemy.userData.type) ||
                    (enemy === GameState.peccary && dist < 5)) {
                    cat.userData.defenseThreat = enemy;
                    cat.userData.lifecycleState = 'defending';
                    cat.userData.stateTimer = 0;
                    console.log('Mother cat defending babies from:', enemy.userData.type || 'peccary');
                    return;
                }
            }
        });

        // Also check player proximity
        if (GameState.peccary) {
            const playerDist = tree.position.distanceTo(GameState.peccary.position);
            if (playerDist < 5) {
                // Attack player if too close to babies!
                cat.userData.defenseThreat = GameState.peccary;
                cat.userData.lifecycleState = 'defending';
                cat.userData.stateTimer = 0;
            }
        }
    }

    /**
     * Cat mating behavior.
     */
    function updateCatMating(cat, delta) {
        // Mating lasts a few seconds
        if (cat.userData.stateTimer > 3) {
            cat.userData.lifecycleState = 'in_tree';

            // Female becomes pregnant
            if (cat.userData.gender === 'female') {
                cat.userData.isPregnant = true;
                cat.userData.pregnancyTimer = 0;
                console.log('Female Dronglous Cat is pregnant!');
            }
        }
    }

    /**
     * Baby cat playing behavior.
     */
    function updateBabyPlaying(cat, delta) {
        const tree = cat.userData.homeTree;
        if (!tree) return;

        // Stay near tree
        const distToTree = cat.position.distanceTo(tree.position);
        if (distToTree > 5) {
            // Return to tree
            const dir = new THREE.Vector3()
                .subVectors(tree.position, cat.position)
                .normalize();
            cat.position.x += dir.x * 2 * delta;
            cat.position.z += dir.z * 2 * delta;
        } else {
            // Play! Chase siblings or run around
            cat.userData.playTimer = (cat.userData.playTimer || 0) + delta;

            // Change direction periodically
            if (cat.userData.playTimer > 1 + Math.random() * 2) {
                cat.userData.playTimer = 0;
                cat.userData.playDir = new THREE.Vector3(
                    Math.random() - 0.5,
                    0,
                    Math.random() - 0.5
                ).normalize();
            }

            if (cat.userData.playDir) {
                cat.position.x += cat.userData.playDir.x * 3 * delta;
                cat.position.z += cat.userData.playDir.z * 3 * delta;
                cat.rotation.y = Math.atan2(cat.userData.playDir.x, cat.userData.playDir.z) + Math.PI / 2;
            }

            // Playful hop animation
            cat.position.y = Math.abs(Math.sin(GameState.timeElapsed * 5)) * 0.2;
        }

        // Baby grows up after 4 minutes (240 seconds)
        cat.userData.ageTimer = (cat.userData.ageTimer || 0) + delta;
        if (cat.userData.ageTimer > 240) {
            growUpBabyCat(cat);
        }
    }

    /**
     * Baby cat grows into adult.
     */
    function growUpBabyCat(baby) {
        const gender = baby.userData.gender;
        const adultData = gender === 'male' ?
            ENEMIES.find(e => e.id === 'dronglous_cat_male') :
            ENEMIES.find(e => e.id === 'dronglous_cat_female');

        if (!adultData) return;

        // Find new tree for this cat
        const occupiedTrees = GameState.enemies
            .filter(e => e.userData.type === 'dronglous_cat' && e.userData.homeTree)
            .map(e => e.userData.homeTree);

        const availableTrees = GameState.trees.filter(t =>
            t.userData && t.userData.treeType === 'acacia' &&
            !occupiedTrees.includes(t)
        );

        if (availableTrees.length === 0) {
            console.log('No available trees for grown cat');
            return;
        }

        const newTree = availableTrees[Math.floor(Math.random() * availableTrees.length)];

        // Remove baby from mother's babies list
        GameState.enemies.forEach(e => {
            if (e.userData.babies && e.userData.babies.includes(baby)) {
                const idx = e.userData.babies.indexOf(baby);
                e.userData.babies.splice(idx, 1);
            }
        });

        // Transform baby into adult
        // Remove old baby model
        GameState.scene.remove(baby);
        const idx = GameState.enemies.indexOf(baby);
        if (idx !== -1) GameState.enemies.splice(idx, 1);

        // Create adult
        const adult = createEnemy(adultData, newTree.position.x, newTree.position.z);
        if (adult) {
            adult.position.y = 3 + Math.random() * 2;
            adult.userData.homeTree = newTree;
            adult.userData.treePosition = newTree.position.clone();
            adult.userData.gender = gender;
            adult.userData.lifecycleState = 'in_tree';
            adult.userData.stateTimer = 0;
            adult.userData.babies = [];

            newTree.userData.dronglousCat = adult;

            GameState.enemies.push(adult);
            GameState.scene.add(adult);

            console.log('Baby Dronglous Cat grew up and found tree!');
        }
    }

    /**
     * Trigger Dronglous Cat mating season.
     * Males find closest females.
     */
    function triggerDronglousCatMating() {
        const cats = GameState.enemies.filter(e => e.userData.type === 'dronglous_cat');
        const males = cats.filter(c => c.userData.gender === 'male' && !c.userData.isBaby);
        const females = cats.filter(c => c.userData.gender === 'female' && !c.userData.isBaby && !c.userData.isPregnant);

        if (males.length === 0 || females.length === 0) {
            console.log('No cats available for mating');
            return;
        }

        males.forEach(male => {
            // Find closest female
            let closestFemale = null;
            let closestDist = Infinity;

            females.forEach(female => {
                if (female.userData.lifecycleState === 'mating') return; // Already mating
                const dist = male.position.distanceTo(female.position);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestFemale = female;
                }
            });

            if (closestFemale) {
                // Male goes to female
                male.userData.mateTarget = closestFemale;
                male.userData.lifecycleState = 'descending';
                male.userData.stateTimer = 0;

                console.log('Male Dronglous Cat going to mate');
            }
        });
    }

    /**
     * Trigger a Dronglous Cat hunt.
     * Forces all idle cats to look for prey and descend.
     */
    function triggerDronglousCatHunt() {
        const cats = GameState.enemies.filter(e =>
            e.userData.type === 'dronglous_cat' &&
            !e.userData.isBaby &&
            e.userData.lifecycleState === 'in_tree'
        );

        if (cats.length === 0) {
            console.log('⚠️ No Dronglous Cats available for hunting (must be in_tree state)');
            return;
        }

        console.log('🎯 Found', cats.length, 'cat(s) in trees - forcing them to descend!');

        cats.forEach(cat => {
            // Find prey for this cat
            const prey = findCatPrey(cat);

            if (prey) {
                // Has prey - normal hunt
                cat.userData.huntTarget = prey;
                console.log('✅ Cat found prey:', prey.userData.type);
            } else {
                // No prey - just make them jump down anyway for testing
                cat.userData.huntTarget = null;
                console.log('⚠️ Cat has no prey but will descend anyway (testing mode)');
            }

            // FORCE descending regardless of prey
            cat.userData.lifecycleState = 'descending';
            cat.userData.stateTimer = 0;
        });

        console.log('💫 All cats transitioning to descending state!');
    }

    /**
     * Give birth to baby cats.
     */
    function birthBabyCats(mother) {
        const babyMaleData = ENEMIES.find(e => e.id === 'dronglous_cat_baby_male');
        const babyFemaleData = ENEMIES.find(e => e.id === 'dronglous_cat_baby_female');

        if (!babyMaleData || !babyFemaleData) return;

        const tree = mother.userData.homeTree;
        if (!tree) return;

        // 3 babies!
        const babies = [];
        for (let i = 0; i < 3; i++) {
            const isMale = Math.random() < 0.5;
            const babyData = isMale ? babyMaleData : babyFemaleData;

            const baby = createEnemy(babyData,
                tree.position.x + (Math.random() - 0.5) * 2,
                tree.position.z + (Math.random() - 0.5) * 2
            );

            if (baby) {
                baby.position.y = 0.2;
                baby.userData.homeTree = tree;
                baby.userData.gender = isMale ? 'male' : 'female';
                baby.userData.isBaby = true;
                baby.userData.lifecycleState = 'baby_playing';
                baby.userData.ageTimer = 0;
                baby.userData.playTimer = 0;
                baby.userData.mother = mother;

                GameState.enemies.push(baby);
                GameState.scene.add(baby);
                babies.push(baby);
            }
        }

        mother.userData.babies = babies;
        mother.userData.isMother = true;
        mother.userData.isPregnant = false;

        console.log('Dronglous Cat gave birth to 3 adorable babies!');
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================
    return {
        createEnemy: createEnemy,
        spawnEnemy: spawnEnemy,
        spawnSpecificEnemy: spawnSpecificEnemy,
        spawnGeese: spawnGeese,
        spawnToads: spawnToads,
        spawnGrassVipers: spawnGrassVipers,
        spawnAntelopeHerd: spawnAntelopeHerd,
        spawnWildDogPack: spawnWildDogPack,
        spawnSaltasGazellaHerd: spawnSaltasGazellaHerd,
        updateEnemies: updateEnemies,
        updateNests: updateNests,
        createNest: createNest,
        triggerToadMating: triggerToadMating,
        createToadNest: createToadNest,
        updateToadNests: updateToadNests,
        triggerViperMating: triggerViperMating,
        triggerAntelopeMating: triggerAntelopeMating,
        triggerWildDogMating: triggerWildDogMating,
        triggerWildDogHunt: triggerWildDogHunt,
        triggerSaltasGazellaMating: triggerSaltasGazellaMating,
        spawnDronglousCats: spawnDronglousCats,
        updateDronglousCats: updateDronglousCats,
        triggerDronglousCatMating: triggerDronglousCatMating,
        triggerDronglousCatHunt: triggerDronglousCatHunt,
        animateDronglousCat: animateDronglousCat,

        // Expose model builders for advanced use
        modelBuilders: modelBuilders
    };
})();
