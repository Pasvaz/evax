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
        leopard_toad: buildLeopardToadModel
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
        const model = builder(enemyData.colors);

        // Apply size modifier (default to 1 if not specified)
        const size = enemyData.size || 1;
        model.scale.set(size, size, size);

        enemy.add(model);

        // Position the enemy
        enemy.position.set(x, 0, z);

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
        // Calculate total weight
        let totalWeight = 0;
        for (let i = 0; i < ENEMIES.length; i++) {
            totalWeight += (ENEMIES[i].spawnWeight || 1);
        }

        // Pick a random point in the total weight
        let random = Math.random() * totalWeight;

        // Find which enemy that point falls into
        for (let i = 0; i < ENEMIES.length; i++) {
            const weight = ENEMIES[i].spawnWeight || 1;
            if (random < weight) {
                return ENEMIES[i];
            }
            random -= weight;
        }

        // Fallback (shouldn't happen)
        return ENEMIES[0];
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

            let direction;
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
                            // Hop toward male - override hop target
                            if (hopPhase === 'grounded' && enemy.userData.hopTimer <= 0) {
                                const targetAngle = Math.atan2(
                                    targetMate.position.z - enemy.position.z,
                                    targetMate.position.x - enemy.position.x
                                );
                                const hopDistance = Math.min(2, distToMate);
                                enemy.userData.hopTarget = {
                                    x: enemy.position.x + Math.cos(targetAngle) * hopDistance,
                                    z: enemy.position.z + Math.sin(targetAngle) * hopDistance
                                };
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
                        if (hopPhase === 'grounded' && enemy.userData.hopTimer <= 0) {
                            const targetAngle = Math.atan2(
                                nestPos.z - enemy.position.z,
                                nestPos.x - enemy.position.x
                            );
                            const hopDistance = Math.min(2, distToNest);
                            enemy.userData.hopTarget = {
                                x: enemy.position.x + Math.cos(targetAngle) * hopDistance,
                                z: enemy.position.z + Math.sin(targetAngle) * hopDistance
                            };
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
                            if (hopPhase === 'grounded' && enemy.userData.hopTimer <= 0) {
                                const targetAngle = Math.atan2(
                                    nest.position.z - enemy.position.z,
                                    nest.position.x - enemy.position.x
                                );
                                enemy.userData.hopTarget = {
                                    x: enemy.position.x + Math.cos(targetAngle) * 1.5,
                                    z: enemy.position.z + Math.sin(targetAngle) * 1.5
                                };
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
                        // Time to hop! Pick a target direction
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
                            // Upper leg tilts 45 degrees backward
                            leg.group.rotation.x = Math.PI / 4;
                            // Lower leg tilts 45 degrees forward
                            leg.lowerLegGroup.rotation.x = -Math.PI / 4;
                        });
                    }
                    // Lower body position when creeping
                    enemy.position.y = -0.15;
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

                            // Walking: legs swing forward/backward relative to fox's travel direction
                            // The fox model has rotation.y = PI, then enemy group rotates to face movement
                            // We need rotation around an axis perpendicular to both:
                            // - The leg direction (down, -Y in model space)
                            // - The fox's forward direction
                            //
                            // Use the enemy's rotation to determine the correct swing axis
                            // The swing axis should be perpendicular to the fox's facing direction
                            // and horizontal (in the XZ plane of the world)
                            const foxRotation = enemy.rotation.y + Math.PI; // Account for model flip
                            // Swing axis is perpendicular to fox's forward direction
                            const swingAxisX = Math.cos(foxRotation);
                            const swingAxisZ = -Math.sin(foxRotation);
                            const swingAxis = new THREE.Vector3(swingAxisX, 0, swingAxisZ).normalize();

                            leg.group.rotation.set(0, 0, 0);
                            leg.group.rotateOnWorldAxis(swingAxis, swing);
                            leg.lowerLegGroup.rotation.set(0, 0, 0);
                        });
                    }
                    enemy.position.y = 0;
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
            if (inWater) {
                // Swimming animation - lower body, slower bob
                enemy.position.y = -0.2 + Math.sin(GameState.clock.elapsedTime * 4 + i) * 0.1;
            } else {
                // Normal bobbing animation
                enemy.position.y = Math.abs(Math.sin(GameState.clock.elapsedTime * 12 + i)) * 0.05;
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
    // PUBLIC API
    // ========================================================================
    return {
        createEnemy: createEnemy,
        spawnEnemy: spawnEnemy,
        spawnGeese: spawnGeese,
        spawnToads: spawnToads,
        updateEnemies: updateEnemies,
        updateNests: updateNests,
        createNest: createNest,
        triggerToadMating: triggerToadMating,
        createToadNest: createToadNest,
        updateToadNests: updateToadNests,

        // Expose model builders for advanced use
        modelBuilders: modelBuilders
    };
})();
