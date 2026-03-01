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
 * HOW TO CREATE A NEW ANIMAL 3D MODEL (READ THIS!)
 * ============================================================================
 *
 * RULE 1 — BUILD THE MODEL FACING +X
 *   The animal's HEAD/SNOUT must point toward +X (positive X axis).
 *   - Head position:  (+something, y, 0)   e.g. head.position.set(0.5, 0.5, 0)
 *   - Body stretched along X:              e.g. body.scale.set(1.4, 0.8, 1)
 *   - Front legs at +X, back legs at -X
 *   - Tail at -X
 *   - Left side at +Z, right side at -Z
 *
 * RULE 2 — DO NOT SET ANY INITIAL ROTATION
 *   Do NOT add model.rotation.y = Math.PI or any other rotation.
 *   The model faces +X naturally, which matches our rotation formula.
 *
 * RULE 3 — USE -Math.atan2(dz, dx) FOR MOVEMENT ROTATION
 *   When making the animal face its walking direction, ALWAYS write:
 *
 *     animal.rotation.y = -Math.atan2(dz, dx);
 *
 *   For smooth turning, use:
 *
 *     const targetRotation = -Math.atan2(direction.z, direction.x);
 *     let diff = targetRotation - enemy.rotation.y;
 *     while (diff > Math.PI) diff -= Math.PI * 2;
 *     while (diff < -Math.PI) diff += Math.PI * 2;
 *     enemy.rotation.y += diff * 0.1;
 *
 *   NEVER use Math.atan2(dx, dz) — that's for +Z facing models!
 *   NEVER add + Math.PI / 2 — that was the old buggy convention!
 *
 *   WHY THIS WORKS: When moving toward +X, atan2(0, 1) = 0, negated = 0.
 *   rotation.y = 0 means no rotation, so the model faces +X. Perfect match!
 *
 * RULE 4 — TO GET FORWARD DIRECTION FROM ROTATION
 *   If you need to know which way an animal is facing from its rotation:
 *
 *     const forward = new THREE.Vector3(
 *         Math.cos(enemy.rotation.y),
 *         0,
 *         -Math.sin(enemy.rotation.y)
 *     );
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
    //
    // !! IMPORTANT — MODEL ORIENTATION !!
    //   - Head/snout must point toward +X (e.g. head.position.set(0.9, 0.5, 0))
    //   - Body elongated along X (e.g. body.scale.set(1.4, 0.8, 1))
    //   - DO NOT add model.rotation.y = Math.PI
    //   - For movement rotation use: -Math.atan2(dz, dx)
    //   - See full docs at the top of this file

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

        // Model built facing +X — no initial rotation needed (see docs at top of file)

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

        // Model built facing +X — no initial rotation needed (see docs at top of file)

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
        body.scale.set(1.4, 0.8, 1);
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

        // Model built facing +X — no initial rotation needed (see docs at top of file)

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
        body.scale.set(1.5, 0.8, 1);
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

        // Model built facing +X — no initial rotation needed (see docs at top of file)

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

        // Model built facing +X — no initial rotation needed (see docs at top of file)

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

        // Model built facing +X — no initial rotation needed (see docs at top of file)

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

        // Model built facing +X — no initial rotation needed (see docs at top of file)

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

        // Model built facing +X — no initial rotation needed (see docs at top of file)

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

        // Model built facing +X — no initial rotation needed (see docs at top of file)

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
            pawGroup.userData.isPaw = true; // Tag for drongulinat cat big paw scaling
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


        // Model built facing +X — no initial rotation needed (see docs at top of file)

        return model;
    }

    /**
     * Build a Drongulinat Cat model — living relative of Felis Dronglaticus.
     * LARGER than the Dronglous Cat with BIG PAWS for walking on snow.
     * Reuses the Dronglous Cat model with scaled-up paws.
     *
     * @param {Object} colors - Color scheme from ENEMIES data
     * @param {boolean} isBaby - Whether this is a baby cat
     * @returns {THREE.Group} - The cat model with oversized paws
     */
    function buildDrongulinatCatModel(colors, isBaby = false) {
        // Build the same model as the dronglous cat (same bone structure)
        const model = buildDronglousCatModel(colors, isBaby);

        // Scale up ALL paw groups 1.5x for snow adaptation (like snowshoes!)
        model.traverse(function(child) {
            if (child.userData && child.userData.isPaw) {
                child.scale.x *= 1.5;
                child.scale.y *= 1.3;
                child.scale.z *= 1.5;
            }
        });

        return model;
    }

    /**
     * Build a Snow Caninon Lartus 3D model.
     * XL bully dog with large paws for snow. Chunky, muscular build.
     * Based on wild dog model but wider/stockier with bigger paws.
     *
     * @param {Object} colors - Color values from ENEMIES data
     * @param {boolean} isBaby - Whether this is a pup
     * @param {boolean} isLeader - Whether this is the pack leader (10% larger)
     * @param {boolean} isPregnant - Whether to add pregnancy belly
     * @returns {THREE.Group} - The dog model
     */
    function buildSnowCaninonModel(colors, isBaby = false, isLeader = false, isPregnant = false) {
        const model = new THREE.Group();
        model.userData.parts = {};
        model.userData.legs = [];

        // Scale: babies are 50% size, leader is 10% larger
        var s = isBaby ? 0.5 : 1.0;

        // Materials
        var bodyMat = new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.9 });
        var bellyMat = new THREE.MeshStandardMaterial({ color: colors.belly, roughness: 0.85 });
        var chestMat = new THREE.MeshStandardMaterial({ color: colors.chest, roughness: 0.85 });
        var muzzleMat = new THREE.MeshStandardMaterial({ color: colors.muzzle, roughness: 0.8 });
        var noseMat = new THREE.MeshStandardMaterial({ color: colors.nose, roughness: 0.3 });
        var eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes, emissive: colors.eyeGlow, roughness: 0.3 });
        var earMat = new THREE.MeshStandardMaterial({ color: colors.ears, roughness: 0.9 });
        var earInnerMat = new THREE.MeshStandardMaterial({ color: colors.earInner, roughness: 0.7 });
        var legMat = new THREE.MeshStandardMaterial({ color: colors.legs, roughness: 0.9 });
        var pawMat = new THREE.MeshStandardMaterial({ color: colors.paws, roughness: 0.85 });
        var tailMat = new THREE.MeshStandardMaterial({ color: colors.tail, roughness: 0.9 });
        var tailTipMat = new THREE.MeshStandardMaterial({ color: colors.tailTip, roughness: 0.85 });

        // ============================================================
        // BODY — XL Bully: wide, barrel-chested, muscular
        // ============================================================

        // Main torso — wider than wild dog (0.42 vs 0.35 radius)
        var torsoGeo = new THREE.CylinderGeometry(0.42 * s, 0.38 * s, 1.0 * s, 12);
        var torso = new THREE.Mesh(torsoGeo, bodyMat);
        torso.rotation.z = Math.PI / 2;
        torso.position.set(0, 0.8 * s, 0);
        torso.castShadow = true;
        model.add(torso);

        // Chest — massive XL bully chest
        var chestGeo = new THREE.SphereGeometry(0.45 * s, 12, 10);
        var chest = new THREE.Mesh(chestGeo, chestMat);
        chest.scale.set(0.95, 1, 0.9);
        chest.position.set(0.4 * s, 0.82 * s, 0);
        chest.castShadow = true;
        model.add(chest);

        // Shoulder hump — thick muscles
        var shoulderGeo = new THREE.SphereGeometry(0.28 * s, 10, 8);
        var shoulder = new THREE.Mesh(shoulderGeo, bodyMat);
        shoulder.scale.set(1.2, 0.85, 1.1);
        shoulder.position.set(0.25 * s, 0.98 * s, 0);
        model.add(shoulder);

        // Hip — powerful rear
        var hipGeo = new THREE.SphereGeometry(0.34 * s, 10, 8);
        var hip = new THREE.Mesh(hipGeo, bodyMat);
        hip.scale.set(0.9, 0.85, 1);
        hip.position.set(-0.38 * s, 0.75 * s, 0);
        hip.castShadow = true;
        model.add(hip);

        // Belly
        var bellyGeo = new THREE.SphereGeometry(0.28 * s, 10, 8);
        var belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.scale.set(1.6, 0.6, 0.9);
        belly.position.set(0, 0.6 * s, 0);
        model.add(belly);

        // Pregnancy belly (optional) — big and noticeable!
        if (isPregnant) {
            var pregGeo = new THREE.SphereGeometry(0.42 * s, 12, 10);
            var pregMat = new THREE.MeshStandardMaterial({ color: 0x5a3a3a, emissive: 0x331111, roughness: 0.8 });
            var pregBelly = new THREE.Mesh(pregGeo, pregMat);
            pregBelly.scale.set(1.6, 1.1, 1.3);
            pregBelly.position.set(-0.05 * s, 0.45 * s, 0);
            model.add(pregBelly);
        }

        // ============================================================
        // NECK — Thick, muscular XL bully neck
        // ============================================================

        var neckGroup = new THREE.Group();
        neckGroup.position.set(0.5 * s, 0.9 * s, 0);
        model.add(neckGroup);
        model.userData.parts.neckGroup = neckGroup;

        var neckGeo = new THREE.CylinderGeometry(0.18 * s, 0.22 * s, 0.35 * s, 10);
        var neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.rotation.z = -0.3;
        neck.position.set(0.1 * s, 0.12 * s, 0);
        neck.castShadow = true;
        neckGroup.add(neck);

        // Neck muscle bulge
        var neckMuscleGeo = new THREE.SphereGeometry(0.15 * s, 8, 6);
        var neckMuscle = new THREE.Mesh(neckMuscleGeo, bodyMat);
        neckMuscle.scale.set(1.2, 0.8, 1);
        neckMuscle.position.set(0.05 * s, 0.05 * s, 0);
        neckGroup.add(neckMuscle);

        // ============================================================
        // HEAD — Wide, blocky bully head
        // ============================================================

        var headGroup = new THREE.Group();
        headGroup.position.set(0.22 * s, 0.3 * s, 0);
        neckGroup.add(headGroup);
        model.userData.parts.headGroup = headGroup;

        // Skull — wider than wild dog
        var skullGeo = new THREE.SphereGeometry(0.18 * s, 10, 8);
        var skull = new THREE.Mesh(skullGeo, bodyMat);
        skull.scale.set(1.15, 0.9, 1.1);
        headGroup.add(skull);

        // Brow ridge — more prominent for bully look
        var browGeo = new THREE.CylinderGeometry(0.1 * s, 0.12 * s, 0.2 * s, 8);
        var brow = new THREE.Mesh(browGeo, bodyMat);
        brow.rotation.z = Math.PI / 2;
        brow.position.set(0.08 * s, 0.1 * s, 0);
        headGroup.add(brow);

        // Snout — shorter and wider than wild dog (bully characteristic)
        var snoutGeo = new THREE.CylinderGeometry(0.08 * s, 0.12 * s, 0.2 * s, 8);
        var snout = new THREE.Mesh(snoutGeo, muzzleMat);
        snout.rotation.z = Math.PI / 2 + 0.1;
        snout.position.set(0.22 * s, -0.02 * s, 0);
        headGroup.add(snout);

        // Nose
        var noseGeo = new THREE.SphereGeometry(0.05 * s, 8, 6);
        var nose = new THREE.Mesh(noseGeo, noseMat);
        nose.scale.set(1, 0.7, 1.3);
        nose.position.set(0.32 * s, -0.02 * s, 0);
        headGroup.add(nose);

        // Mouth line
        var mouthGeo = new THREE.CylinderGeometry(0.01 * s, 0.01 * s, 0.12 * s, 6);
        var mouth = new THREE.Mesh(mouthGeo, noseMat);
        mouth.rotation.z = Math.PI / 2;
        mouth.position.set(0.24 * s, -0.07 * s, 0);
        headGroup.add(mouth);

        // Eyes — babies get bigger eyes
        var eyeSize = isBaby ? 0.04 * s : 0.035 * s;
        var eyeSocketMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A });
        var eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFAF0 });

        [-1, 1].forEach(function(side) {
            var eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(eyeSize * 1.2, 8, 6), eyeSocketMat);
            eyeSocket.position.set(0.1 * s, 0.06 * s, side * 0.12 * s);
            headGroup.add(eyeSocket);

            var eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(eyeSize, 8, 6), eyeWhiteMat);
            eyeWhite.position.set(0.11 * s, 0.065 * s, side * 0.125 * s);
            headGroup.add(eyeWhite);

            var pupil = new THREE.Mesh(new THREE.SphereGeometry(eyeSize * 0.6, 6, 6), eyeMat);
            pupil.position.set(0.125 * s, 0.065 * s, side * 0.135 * s);
            headGroup.add(pupil);
        });

        // Ears — small, folded (bully style, not tall like wild dog)
        [-1, 1].forEach(function(side) {
            var earGroup = new THREE.Group();
            earGroup.position.set(-0.02 * s, 0.15 * s, side * 0.1 * s);
            earGroup.rotation.set(side * 0.3, side * 0.3, 0.4);
            headGroup.add(earGroup);

            var earGeo = new THREE.SphereGeometry(0.07 * s, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
            var ear = new THREE.Mesh(earGeo, earMat);
            ear.scale.set(0.6, 0.7, 0.15);
            earGroup.add(ear);

            var earInner = new THREE.Mesh(new THREE.SphereGeometry(0.05 * s, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), earInnerMat);
            earInner.scale.set(0.5, 0.6, 0.1);
            earInner.position.set(0, 0.01 * s, side * 0.005 * s);
            earGroup.add(earInner);
        });

        // ============================================================
        // LEGS — Short, thick, powerful (bully build) with BIG PAWS
        // ============================================================

        var legPositions = [
            { x: 0.3, z: 0.18, front: true, side: 'right' },
            { x: 0.3, z: -0.18, front: true, side: 'left' },
            { x: -0.32, z: 0.18, front: false, side: 'right' },
            { x: -0.32, z: -0.18, front: false, side: 'left' }
        ];

        legPositions.forEach(function(pos, idx) {
            // Hip/shoulder joint group
            var legGroup = new THREE.Group();
            legGroup.position.set(pos.x * s, 0.65 * s, pos.z * s);
            model.add(legGroup);

            // Upper leg — thick (bully!)
            var upperLegGeo = new THREE.CylinderGeometry(0.07 * s, 0.08 * s, 0.3 * s, 8);
            var upperLeg = new THREE.Mesh(upperLegGeo, legMat);
            upperLeg.position.y = -0.15 * s;
            legGroup.add(upperLeg);

            // Thigh muscle bulge
            var thighGeo = new THREE.SphereGeometry(0.065 * s, 6, 6);
            var thigh = new THREE.Mesh(thighGeo, legMat);
            thigh.scale.set(1, 1.3, 0.8);
            thigh.position.set(pos.front ? 0.02 * s : -0.02 * s, -0.08 * s, 0);
            legGroup.add(thigh);

            // Lower leg group (knee joint)
            var lowerLegGroup = new THREE.Group();
            lowerLegGroup.position.y = -0.3 * s;
            legGroup.add(lowerLegGroup);

            // Knee
            var knee = new THREE.Mesh(new THREE.SphereGeometry(0.05 * s, 8, 6), legMat);
            knee.scale.set(1, 0.8, 0.9);
            lowerLegGroup.add(knee);

            // Lower leg
            var lowerLegGeo = new THREE.CylinderGeometry(0.04 * s, 0.05 * s, 0.28 * s, 8);
            var lowerLeg = new THREE.Mesh(lowerLegGeo, legMat);
            lowerLeg.position.y = -0.14 * s;
            lowerLegGroup.add(lowerLeg);

            // BIG PAW — 1.5x larger than wild dog (snow adaptation!)
            var pawGeo = new THREE.SphereGeometry(0.06 * s, 8, 6);
            var paw = new THREE.Mesh(pawGeo, pawMat);
            paw.userData.isPaw = true;
            paw.scale.set(1.5, 0.6, 1.4);
            paw.position.y = -0.3 * s;
            lowerLegGroup.add(paw);

            // Toe pads (5 toes, big and spread)
            for (var t = 0; t < 5; t++) {
                var toeGeo = new THREE.SphereGeometry(0.018 * s, 6, 6);
                var toe = new THREE.Mesh(toeGeo, pawMat);
                var toeAngle = ((t - 2) / 4) * 1.0;
                toe.position.set(
                    0.05 * s * Math.cos(toeAngle),
                    -0.32 * s,
                    0.05 * s * Math.sin(toeAngle) + pos.z * 0.03 * s
                );
                lowerLegGroup.add(toe);
            }

            // Store leg data for animation
            model.userData.legs.push({
                group: legGroup,
                lowerLegGroup: lowerLegGroup,
                isFront: pos.front,
                side: pos.side,
                originalY: 0.65 * s,
                phase: idx % 2 === 0 ? 0 : Math.PI
            });
        });

        // ============================================================
        // TAIL — Short, thick tail (bully dogs have short tails)
        // ============================================================

        var tailGroup = new THREE.Group();
        tailGroup.position.set(-0.5 * s, 0.7 * s, 0);
        model.add(tailGroup);
        model.userData.parts.tailGroup = tailGroup;

        var tailBaseGeo = new THREE.CylinderGeometry(0.04 * s, 0.06 * s, 0.18 * s, 8);
        var tailBase = new THREE.Mesh(tailBaseGeo, tailMat);
        tailBase.rotation.z = Math.PI / 2 + 0.6;
        tailBase.position.set(-0.08 * s, 0, 0);
        tailGroup.add(tailBase);

        var tailTipGeo = new THREE.CylinderGeometry(0.02 * s, 0.035 * s, 0.12 * s, 8);
        var tailTip = new THREE.Mesh(tailTipGeo, tailTipMat);
        tailTip.rotation.z = Math.PI / 2 + 0.4;
        tailTip.position.set(-0.2 * s, -0.06 * s, 0);
        tailGroup.add(tailTip);

        // Leader gets 10% scale boost
        if (isLeader) {
            model.scale.set(1.1, 1.1, 1.1);
        }

        // Model built facing +X
        return model;
    }

    // ========================================================================
    // SNOW BALUBAN OXEN MODEL BUILDER
    // ========================================================================
    /**
     * Build a Snow Baluban Oxen (musk ox) 3D model.
     * Largest beast in the game. Massive barrel body, shoulder hump, shaggy fur skirt.
     * Both genders have horns — musk ox style curving down then outward.
     * Babies are slimmer with proportionally longer legs, no fur skirt.
     * @param {Object} colors - Color scheme
     * @param {boolean} hasHorns - Whether to show horns
     * @param {number} hornScale - Horn size multiplier (1.0 normal, 1.5 leader, 0.6 female)
     * @param {boolean} isBaby - Whether this is a calf
     * @param {boolean} isPregnant - Whether to show pregnancy belly
     * @returns {THREE.Group} - The oxen model
     */
    function buildBalubanOxenModel(colors, hasHorns = true, hornScale = 1, isBaby = false, isPregnant = false) {
        const model = new THREE.Group();
        model.userData.parts = {};
        model.userData.legs = [];

        // Scale: babies are 50% size
        var s = isBaby ? 0.5 : 1.0;
        // Baby body proportion: slimmer body, longer legs
        var bodyWidth = isBaby ? 0.7 : 1.0; // babies are slimmer

        // Materials
        var bodyMat = new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.95 });
        var bellyMat = new THREE.MeshStandardMaterial({ color: colors.belly, roughness: 0.9 });
        var chestMat = new THREE.MeshStandardMaterial({ color: colors.chest, roughness: 0.9 });
        var shoulderMat = new THREE.MeshStandardMaterial({ color: colors.shoulder, roughness: 0.95 });
        var muzzleMat = new THREE.MeshStandardMaterial({ color: colors.muzzle, roughness: 0.85 });
        var noseMat = new THREE.MeshStandardMaterial({ color: colors.nose, roughness: 0.3 });
        var eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes, roughness: 0.3 });
        var earMat = new THREE.MeshStandardMaterial({ color: colors.ears, roughness: 0.9 });
        var earInnerMat = new THREE.MeshStandardMaterial({ color: colors.earInner, roughness: 0.7 });
        var legMat = new THREE.MeshStandardMaterial({ color: colors.legs, roughness: 0.9 });
        var hoofMat = new THREE.MeshStandardMaterial({ color: colors.hooves, roughness: 0.4 });
        var hornMat = new THREE.MeshStandardMaterial({ color: colors.horns, roughness: 0.6 });
        var tailMat = new THREE.MeshStandardMaterial({ color: colors.tail, roughness: 0.9 });
        var skirtMat = new THREE.MeshStandardMaterial({ color: colors.skirt, roughness: 1.0 });

        // ============================================================
        // BODY — Massive barrel torso (larger than antelope!)
        // ============================================================

        // Main torso — thick barrel shape
        var torsoGeo = new THREE.CylinderGeometry(0.6 * s * bodyWidth, 0.55 * s * bodyWidth, 2.0 * s, 14);
        var torso = new THREE.Mesh(torsoGeo, bodyMat);
        torso.rotation.z = Math.PI / 2;
        torso.position.set(0, 1.4 * s, 0);
        torso.castShadow = true;
        model.add(torso);

        // Massive chest — wider than antelope
        var chestGeo = new THREE.SphereGeometry(0.65 * s * bodyWidth, 14, 12);
        var chest = new THREE.Mesh(chestGeo, chestMat);
        chest.scale.set(0.9, 1, 0.85);
        chest.position.set(0.8 * s, 1.5 * s, 0);
        chest.castShadow = true;
        model.add(chest);

        // Shoulder hump — distinctive musk ox feature
        var shoulderGeo = new THREE.SphereGeometry(0.45 * s * bodyWidth, 12, 10);
        var shoulderHump = new THREE.Mesh(shoulderGeo, shoulderMat);
        shoulderHump.scale.set(1.2, 0.9, 1.1);
        shoulderHump.position.set(0.5 * s, 1.85 * s, 0);
        shoulderHump.castShadow = true;
        model.add(shoulderHump);

        // Heavy rump
        var rumpGeo = new THREE.SphereGeometry(0.55 * s * bodyWidth, 12, 10);
        var rump = new THREE.Mesh(rumpGeo, bodyMat);
        rump.scale.set(0.85, 0.9, 0.95);
        rump.position.set(-0.85 * s, 1.25 * s, 0);
        rump.castShadow = true;
        model.add(rump);

        // Belly
        var bellyGeo = new THREE.SphereGeometry(0.4 * s * bodyWidth, 12, 10);
        var belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.scale.set(1.8, 0.65, 0.85);
        belly.position.set(0, 1.1 * s, 0);
        model.add(belly);

        // Pregnancy belly
        if (isPregnant) {
            var pregGeo = new THREE.SphereGeometry(0.45 * s, 12, 10);
            var pregMat2 = new THREE.MeshStandardMaterial({ color: colors.belly, emissive: 0x221111, roughness: 0.8 });
            var pregBelly = new THREE.Mesh(pregGeo, pregMat2);
            pregBelly.scale.set(1.5, 1.0, 1.2);
            pregBelly.position.set(-0.2 * s, 0.9 * s, 0);
            model.add(pregBelly);
        }

        // ============================================================
        // SHAGGY FUR SKIRT — hangs below body (not on babies!)
        // ============================================================
        if (!isBaby) {
            // Long shaggy fur panels hanging from body sides
            var skirtPositions = [
                { x: 0.3, z: 0.45, rx: 0.2 },   // Right front
                { x: -0.2, z: 0.45, rx: 0.15 },  // Right mid
                { x: -0.6, z: 0.4, rx: 0.1 },    // Right back
                { x: 0.3, z: -0.45, rx: -0.2 },  // Left front
                { x: -0.2, z: -0.45, rx: -0.15 }, // Left mid
                { x: -0.6, z: -0.4, rx: -0.1 }   // Left back
            ];
            skirtPositions.forEach(function(sp) {
                var panelGeo = new THREE.BoxGeometry(0.35 * s, 0.55 * s, 0.08 * s);
                var panel = new THREE.Mesh(panelGeo, skirtMat);
                panel.position.set(sp.x * s, 0.75 * s, sp.z * s);
                panel.rotation.x = sp.rx;
                panel.rotation.z = (Math.random() - 0.5) * 0.1;
                panel.castShadow = true;
                model.add(panel);
            });

            // Front chest fur — hanging bib
            var bibGeo = new THREE.BoxGeometry(0.15 * s, 0.5 * s, 0.4 * s);
            var bib = new THREE.Mesh(bibGeo, skirtMat);
            bib.position.set(0.7 * s, 0.9 * s, 0);
            bib.rotation.z = 0.2;
            model.add(bib);
        }

        // ============================================================
        // NECK — Thick, powerful
        // ============================================================

        var neckGroup = new THREE.Group();
        neckGroup.position.set(0.95 * s, 1.6 * s, 0);
        model.add(neckGroup);
        model.userData.parts.neckGroup = neckGroup;

        var neckGeo = new THREE.CylinderGeometry(0.22 * s, 0.3 * s, 0.7 * s, 12);
        var neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.rotation.z = -0.4;
        neck.position.set(0.2 * s, 0.25 * s, 0);
        neck.castShadow = true;
        neckGroup.add(neck);

        // Neck fur (thick mane)
        var maneFurGeo = new THREE.SphereGeometry(0.2 * s, 8, 6);
        var maneFur = new THREE.Mesh(maneFurGeo, skirtMat);
        maneFur.scale.set(1.3, 1.5, 1.0);
        maneFur.position.set(0.1 * s, 0.1 * s, 0);
        neckGroup.add(maneFur);

        // ============================================================
        // HEAD — Broad, blocky with wide muzzle
        // ============================================================

        var headGroup = new THREE.Group();
        headGroup.position.set(0.45 * s, 0.55 * s, 0);
        neckGroup.add(headGroup);
        model.userData.parts.headGroup = headGroup;

        // Skull — wide and blocky
        var skullGeo = new THREE.SphereGeometry(0.22 * s, 12, 10);
        var skull = new THREE.Mesh(skullGeo, bodyMat);
        skull.scale.set(1.1, 0.85, 1.0);
        headGroup.add(skull);

        // Long face
        var faceGeo = new THREE.CylinderGeometry(0.14 * s, 0.18 * s, 0.45 * s, 10);
        var face = new THREE.Mesh(faceGeo, bodyMat);
        face.rotation.z = Math.PI / 2 + 0.2;
        face.position.set(0.28 * s, -0.08 * s, 0);
        headGroup.add(face);

        // Wide muzzle
        var muzzleGeo = new THREE.SphereGeometry(0.12 * s, 10, 8);
        var muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
        muzzle.scale.set(1.0, 0.7, 1.1);
        muzzle.position.set(0.5 * s, -0.18 * s, 0);
        headGroup.add(muzzle);

        // Nostrils
        [-1, 1].forEach(function(side) {
            var nostrilGeo = new THREE.SphereGeometry(0.03 * s, 6, 6);
            var nostril = new THREE.Mesh(nostrilGeo, noseMat);
            nostril.position.set(0.58 * s, -0.22 * s, side * 0.05 * s);
            headGroup.add(nostril);
        });

        // Eyes
        var eyeSize = isBaby ? 0.04 * s : 0.035 * s;
        [-1, 1].forEach(function(side) {
            var eyeSocket = new THREE.Mesh(
                new THREE.SphereGeometry(eyeSize * 1.3, 8, 6),
                new THREE.MeshStandardMaterial({ color: 0x1A1A1A })
            );
            eyeSocket.position.set(0.15 * s, 0.05 * s, side * 0.15 * s);
            headGroup.add(eyeSocket);

            var eyeWhite = new THREE.Mesh(
                new THREE.SphereGeometry(eyeSize, 8, 6),
                new THREE.MeshStandardMaterial({ color: 0xFFFAF0 })
            );
            eyeWhite.position.set(0.16 * s, 0.055 * s, side * 0.155 * s);
            headGroup.add(eyeWhite);

            var pupil = new THREE.Mesh(
                new THREE.SphereGeometry(eyeSize * 0.6, 6, 6),
                eyeMat
            );
            pupil.position.set(0.175 * s, 0.055 * s, side * 0.165 * s);
            headGroup.add(pupil);
        });

        // Ears — small, sticking out sideways
        [-1, 1].forEach(function(side) {
            var earGeo = new THREE.ConeGeometry(0.06 * s, 0.12 * s, 6);
            var ear = new THREE.Mesh(earGeo, earMat);
            ear.position.set(0, 0.12 * s, side * 0.2 * s);
            ear.rotation.set(side * 0.4, 0, side * 0.8);
            headGroup.add(ear);

            var earIn = new THREE.Mesh(
                new THREE.ConeGeometry(0.04 * s, 0.08 * s, 6),
                earInnerMat
            );
            earIn.position.set(0, 0.12 * s, side * 0.21 * s);
            earIn.rotation.set(side * 0.4, 0, side * 0.8);
            headGroup.add(earIn);
        });

        // ============================================================
        // HORNS — Musk ox style: curve down from skull then outward
        // ============================================================
        if (hasHorns) {
            [-1, 1].forEach(function(side) {
                // Horn boss (thick base plate on top of skull)
                var bossGeo = new THREE.CylinderGeometry(0.1 * s * hornScale, 0.12 * s * hornScale, 0.08 * s, 10);
                var boss = new THREE.Mesh(bossGeo, hornMat);
                boss.position.set(0.02 * s, 0.15 * s, side * 0.08 * s);
                boss.rotation.z = Math.PI / 2;
                headGroup.add(boss);

                // Horn curves down along side of head
                var hornDownGeo = new THREE.CylinderGeometry(0.06 * s * hornScale, 0.09 * s * hornScale, 0.3 * s * hornScale, 8);
                var hornDown = new THREE.Mesh(hornDownGeo, hornMat);
                hornDown.position.set(0.02 * s, -0.02 * s, side * 0.18 * s);
                hornDown.rotation.z = 0;
                hornDown.rotation.x = side * 0.3;
                headGroup.add(hornDown);

                // Horn curves outward and slightly up (the hook)
                var hornOutGeo = new THREE.CylinderGeometry(0.03 * s * hornScale, 0.06 * s * hornScale, 0.25 * s * hornScale, 8);
                var hornOut = new THREE.Mesh(hornOutGeo, hornMat);
                hornOut.position.set(0.05 * s, -0.18 * s, side * 0.28 * s);
                hornOut.rotation.z = 0.3;
                hornOut.rotation.x = side * 0.8;
                headGroup.add(hornOut);

                // Horn tip — sharp point curving forward
                var tipGeo = new THREE.ConeGeometry(0.025 * s * hornScale, 0.15 * s * hornScale, 6);
                var tip = new THREE.Mesh(tipGeo, hornMat);
                tip.position.set(0.12 * s, -0.12 * s, side * 0.38 * s);
                tip.rotation.z = Math.PI / 2 - 0.3;
                tip.rotation.x = side * 0.5;
                headGroup.add(tip);
            });
        }

        // ============================================================
        // LEGS — Sturdy, thick, powerful with hooves
        // ============================================================

        var legPositions = [
            { x: 0.55, z: 0.25, front: true, side: 'right' },
            { x: 0.55, z: -0.25, front: true, side: 'left' },
            { x: -0.65, z: 0.25, front: false, side: 'right' },
            { x: -0.65, z: -0.25, front: false, side: 'left' }
        ];

        // Baby legs are proportionally longer
        var legLengthMult = isBaby ? 1.2 : 1.0;

        legPositions.forEach(function(pos, idx) {
            var legGroup = new THREE.Group();
            legGroup.position.set(pos.x * s, 1.15 * s, pos.z * s);
            model.add(legGroup);

            // Upper leg — thick!
            var upperLegGeo = new THREE.CylinderGeometry(0.1 * s, 0.12 * s, 0.5 * s * legLengthMult, 8);
            var upperLeg = new THREE.Mesh(upperLegGeo, legMat);
            upperLeg.position.y = -0.25 * s * legLengthMult;
            legGroup.add(upperLeg);

            // Thigh muscle
            var thighGeo = new THREE.SphereGeometry(0.09 * s, 8, 6);
            var thigh = new THREE.Mesh(thighGeo, legMat);
            thigh.scale.set(1, 1.3, 0.9);
            thigh.position.set(pos.front ? 0.02 * s : -0.02 * s, -0.1 * s, 0);
            legGroup.add(thigh);

            // Lower leg group (knee joint)
            var lowerLegGroup = new THREE.Group();
            lowerLegGroup.position.y = -0.5 * s * legLengthMult;
            legGroup.add(lowerLegGroup);

            // Knee
            var knee = new THREE.Mesh(new THREE.SphereGeometry(0.08 * s, 8, 6), legMat);
            knee.scale.set(1, 0.85, 0.9);
            lowerLegGroup.add(knee);

            // Shin
            var shinGeo = new THREE.CylinderGeometry(0.06 * s, 0.08 * s, 0.45 * s * legLengthMult, 8);
            var shin = new THREE.Mesh(shinGeo, legMat);
            shin.position.y = -0.22 * s * legLengthMult;
            lowerLegGroup.add(shin);

            // Ankle
            var ankle = new THREE.Mesh(new THREE.SphereGeometry(0.05 * s, 6, 6), legMat);
            ankle.position.y = -0.45 * s * legLengthMult;
            lowerLegGroup.add(ankle);

            // Hoof — wide and flat
            var hoofGeo = new THREE.CylinderGeometry(0.065 * s, 0.07 * s, 0.08 * s, 8);
            var hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.position.y = -0.52 * s * legLengthMult;
            lowerLegGroup.add(hoof);

            // Store leg data for animation
            model.userData.legs.push({
                group: legGroup,
                lowerLegGroup: lowerLegGroup,
                isFront: pos.front,
                side: pos.side,
                originalY: 1.15 * s,
                phase: idx % 2 === 0 ? 0 : Math.PI
            });
        });

        // ============================================================
        // TAIL — Short, thick
        // ============================================================

        var tailGroup = new THREE.Group();
        tailGroup.position.set(-1.0 * s, 1.2 * s, 0);
        model.add(tailGroup);
        model.userData.parts.tailGroup = tailGroup;

        var tailBaseGeo = new THREE.CylinderGeometry(0.04 * s, 0.06 * s, 0.2 * s, 8);
        var tailBase = new THREE.Mesh(tailBaseGeo, tailMat);
        tailBase.rotation.z = Math.PI / 2 + 0.7;
        tailBase.position.set(-0.08 * s, -0.02 * s, 0);
        tailGroup.add(tailBase);

        var tailTuftGeo = new THREE.SphereGeometry(0.05 * s, 6, 6);
        var tailTuft = new THREE.Mesh(tailTuftGeo, tailMat);
        tailTuft.scale.set(1, 1.5, 1);
        tailTuft.position.set(-0.2 * s, -0.08 * s, 0);
        tailGroup.add(tailTuft);

        return model;
    }

    /**
     * Build a Deericus Iricus (tiny mountain deer) 3D model.
     * Small furry deer with optional horns (males only).
     * @param {Object} colors - Color scheme
     * @param {boolean} hasHorns - Whether this deer has horns (males only)
     * @param {boolean} isBaby - Whether this is a baby deer
     * @returns {THREE.Group} - The deer model
     */
    function buildDeericusIricusModel(colors, hasHorns = false, isBaby = false) {
        const model = new THREE.Group();

        // Scale factor for babies
        const s = isBaby ? 0.6 : 1.0;

        // Materials
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.85 });
        const bellyMat = new THREE.MeshStandardMaterial({ color: colors.belly, roughness: 0.9 });
        const legMat = new THREE.MeshStandardMaterial({ color: colors.legs });
        const faceMat = new THREE.MeshStandardMaterial({ color: colors.face, roughness: 0.85 });
        const muzzleMat = new THREE.MeshStandardMaterial({ color: colors.muzzle });
        const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eyes });
        const earMat = new THREE.MeshStandardMaterial({ color: colors.ears });
        const earInnerMat = new THREE.MeshStandardMaterial({ color: colors.earInner || 0xFFB6C1 });
        const tailMat = new THREE.MeshStandardMaterial({ color: colors.tail, roughness: 0.9 });

        model.userData.parts = {};

        // ============================================================
        // BODY — Compact torso, slightly sloped back
        // ============================================================

        // Main body (cylinder laid on its side along X)
        const bodyGeo = new THREE.CylinderGeometry(0.28 * s, 0.25 * s, 0.85 * s, 10);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2 + 0.08;  // Slight slope: higher at shoulders
        body.position.set(0, 0.65 * s, 0);
        body.castShadow = true;
        model.add(body);

        // Chest (front bulk — deer have sturdy chests)
        const chestGeo = new THREE.SphereGeometry(0.3 * s, 10, 10);
        const chest = new THREE.Mesh(chestGeo, bodyMat);
        chest.scale.set(0.8, 0.9, 0.75);
        chest.position.set(0.32 * s, 0.7 * s, 0);
        chest.castShadow = true;
        model.add(chest);

        // Rump (back end, slightly lower)
        const rumpGeo = new THREE.SphereGeometry(0.27 * s, 10, 10);
        const rump = new THREE.Mesh(rumpGeo, bodyMat);
        rump.scale.set(0.8, 0.85, 0.8);
        rump.position.set(-0.35 * s, 0.58 * s, 0);
        rump.castShadow = true;
        model.add(rump);

        // Belly (lighter underside)
        const bellyGeo = new THREE.SphereGeometry(0.18 * s, 8, 8);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.scale.set(1.5, 0.5, 0.7);
        belly.position.set(0, 0.5 * s, 0);
        model.add(belly);

        // ============================================================
        // NECK — Graceful, angled upward
        // ============================================================

        const neckGroup = new THREE.Group();
        neckGroup.position.set(0.38 * s, 0.75 * s, 0);
        model.add(neckGroup);
        model.userData.parts.neckGroup = neckGroup;

        const neckGeo = new THREE.CylinderGeometry(0.08 * s, 0.13 * s, 0.45 * s, 8);
        const neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.rotation.z = -0.4;  // Angled forward and up
        neck.position.set(0.1 * s, 0.2 * s, 0);
        neck.castShadow = true;
        neckGroup.add(neck);

        // ============================================================
        // HEAD — Small, narrow deer face on a head group for animation
        // ============================================================

        const headGroup = new THREE.Group();
        headGroup.position.set(0.25 * s, 0.42 * s, 0);
        neckGroup.add(headGroup);
        model.userData.parts.headGroup = headGroup;

        // Skull
        const skullGeo = new THREE.SphereGeometry(0.13 * s, 10, 10);
        const skull = new THREE.Mesh(skullGeo, faceMat);
        skull.scale.set(1.1, 0.9, 0.85);
        skull.castShadow = true;
        headGroup.add(skull);

        // Muzzle — elongated deer snout pointing forward (+X)
        const muzzleGeo = new THREE.CylinderGeometry(0.055 * s, 0.075 * s, 0.16 * s, 8);
        const muzzle = new THREE.Mesh(muzzleGeo, faceMat);
        muzzle.rotation.z = -Math.PI / 2 - 0.15;  // Point forward, slight downward angle
        muzzle.position.set(0.14 * s, -0.03 * s, 0);
        headGroup.add(muzzle);

        // Nose (dark tip)
        const noseGeo = new THREE.SphereGeometry(0.035 * s, 6, 6);
        const nose = new THREE.Mesh(noseGeo, muzzleMat);
        nose.scale.set(1.2, 0.8, 1);
        nose.position.set(0.21 * s, -0.05 * s, 0);
        headGroup.add(nose);

        // Eyes — large, expressive, side-facing (deer hallmark)
        const eyeOuterGeo = new THREE.SphereGeometry(0.035 * s, 8, 8);
        const eyeOuterMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const eyeInnerGeo = new THREE.SphereGeometry(0.02 * s, 8, 8);

        [-1, 1].forEach(side => {
            const eyeOuter = new THREE.Mesh(eyeOuterGeo, eyeOuterMat);
            eyeOuter.position.set(0.06 * s, 0.02 * s, side * 0.1 * s);
            headGroup.add(eyeOuter);

            const eyeInner = new THREE.Mesh(eyeInnerGeo, eyeMat);
            eyeInner.position.set(0.075 * s, 0.025 * s, side * 0.105 * s);
            headGroup.add(eyeInner);
        });

        // Ears — BIG leaf-shaped ears (THE deer signature feature!)
        [-1, 1].forEach(side => {
            const earGroup = new THREE.Group();
            earGroup.position.set(-0.02 * s, 0.11 * s, side * 0.07 * s);

            // Outer ear (tall cone, angled outward)
            const outerEarGeo = new THREE.ConeGeometry(0.055 * s, 0.2 * s, 6);
            const outerEar = new THREE.Mesh(outerEarGeo, earMat);
            outerEar.rotation.x = side * -0.6;   // Splay outward
            outerEar.rotation.z = -0.25;          // Tilt back slightly
            earGroup.add(outerEar);

            // Inner ear (pink, slightly smaller)
            const innerEarGeo = new THREE.ConeGeometry(0.035 * s, 0.15 * s, 6);
            const innerEar = new THREE.Mesh(innerEarGeo, earInnerMat);
            innerEar.rotation.x = side * -0.6;
            innerEar.rotation.z = -0.25;
            innerEar.position.set(0.005 * s, 0, side * 0.005 * s);
            earGroup.add(innerEar);

            headGroup.add(earGroup);
        });

        // ============================================================
        // ANTLERS — Branching deer antlers (adult males only)
        // Real deer antlers branch like little trees!
        // ============================================================

        if (hasHorns && !isBaby) {
            const antlerMat = new THREE.MeshStandardMaterial({ color: colors.horns, roughness: 0.7 });

            [-1, 1].forEach(side => {
                const antlerGroup = new THREE.Group();
                antlerGroup.position.set(-0.02 * s, 0.12 * s, side * 0.05 * s);

                // Main beam (the tall central antler, curves back)
                const beamGeo = new THREE.CylinderGeometry(0.012, 0.022, 0.22, 5);
                const beam = new THREE.Mesh(beamGeo, antlerMat);
                beam.rotation.z = -0.25;
                beam.rotation.x = side * -0.2;
                beam.position.set(-0.01, 0.11, side * 0.015);
                beam.castShadow = true;
                antlerGroup.add(beam);

                // First tine (forward prong, lower)
                const tine1Geo = new THREE.CylinderGeometry(0.008, 0.015, 0.1, 4);
                const tine1 = new THREE.Mesh(tine1Geo, antlerMat);
                tine1.rotation.z = 0.5;
                tine1.rotation.x = side * -0.15;
                tine1.position.set(0.02, 0.1, side * 0.015);
                antlerGroup.add(tine1);

                // Second tine (upper prong, branching backward)
                const tine2Geo = new THREE.CylinderGeometry(0.006, 0.012, 0.08, 4);
                const tine2 = new THREE.Mesh(tine2Geo, antlerMat);
                tine2.rotation.z = -0.7;
                tine2.rotation.x = side * -0.3;
                tine2.position.set(-0.04, 0.19, side * 0.025);
                antlerGroup.add(tine2);

                headGroup.add(antlerGroup);
            });
        }

        // ============================================================
        // LEGS — Long, slender deer legs with hooves
        // Deer have elegant thin legs — much thinner than their body
        // ============================================================

        const legPositions = [
            { x: 0.28, z: -0.11, front: true },   // Front right
            { x: 0.28, z: 0.11, front: true },     // Front left
            { x: -0.28, z: -0.11, front: false },  // Back right
            { x: -0.28, z: 0.11, front: false }    // Back left
        ];

        model.userData.legs = [];
        legPositions.forEach((pos) => {
            // Hip pivot — the whole leg swings from here
            const legGroup = new THREE.Group();
            legGroup.position.set(pos.x * s, 0.32 * s, pos.z * s);

            // Upper leg (thigh)
            const upperGeo = new THREE.CylinderGeometry(0.035 * s, 0.045 * s, 0.28 * s, 6);
            const upper = new THREE.Mesh(upperGeo, legMat);
            upper.position.y = 0;
            upper.castShadow = true;
            legGroup.add(upper);

            // Knee pivot — lower leg bends from here
            const lowerLegGroup = new THREE.Group();
            lowerLegGroup.position.y = -0.14 * s;  // At the bottom of the upper leg
            legGroup.add(lowerLegGroup);

            // Lower leg (shin — thinner, elegant deer legs)
            const lowerGeo = new THREE.CylinderGeometry(0.02 * s, 0.035 * s, 0.22 * s, 6);
            const lower = new THREE.Mesh(lowerGeo, legMat);
            lower.position.y = -0.11 * s;  // Centered below knee pivot
            lower.castShadow = true;
            lowerLegGroup.add(lower);

            // Hoof (small, dark)
            const hoofGeo = new THREE.CylinderGeometry(0.025 * s, 0.03 * s, 0.035 * s, 6);
            const hoofMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a });
            const hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.position.y = -0.23 * s;  // Below shin
            lowerLegGroup.add(hoof);

            model.add(legGroup);
            model.userData.legs.push({
                group: legGroup,               // Hip pivot
                lowerLegGroup: lowerLegGroup,  // Knee pivot
                isFront: pos.front
            });
        });

        // ============================================================
        // TAIL — Small fluffy tail, slightly upright
        // ============================================================

        const tailGroup = new THREE.Group();
        tailGroup.position.set(-0.42 * s, 0.62 * s, 0);
        model.add(tailGroup);

        const tailGeo = new THREE.ConeGeometry(0.035 * s, 0.1 * s, 6);
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.rotation.z = 0.4;  // Angled slightly upward
        tail.position.set(-0.02 * s, 0.02 * s, 0);
        tailGroup.add(tail);
        model.userData.tail = tailGroup;

        // Store model parts for animation
        model.userData.parts.body = body;
        model.userData.parts.tail = tailGroup;

        // Model built facing +X — no initial rotation needed (see docs at top of file)

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
    // Remember: model must face +X, no Math.PI rotation, use -atan2(dz, dx)!

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
        dronglous_cat: buildDronglousCatModel,
        drongulinat_cat: buildDrongulinatCatModel,
        snow_caninon: buildSnowCaninonModel,
        baluban_oxen: buildBalubanOxenModel,
        deericus_iricus: buildDeericusIricusModel
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

        // Convert colors from "#hex" strings to 0xhex numbers (if needed)
        // Data files use "#hex" for VS Code color picker support
        const colors = {};
        for (const key in enemyData.colors) {
            const val = enemyData.colors[key];
            colors[key] = typeof val === 'string' ? parseInt(val.replace('#', ''), 16) : val;
        }

        // Build the 3D model using converted colors
        const isBaby = enemyData.isBaby || false;
        const hasHorns = enemyData.hasHorns || false;
        // Different builders have different signatures — special-case as needed
        var model;
        if (enemyData.type === 'deericus_iricus') {
            model = builder(colors, hasHorns, isBaby);
        } else if (enemyData.type === 'baluban_oxen') {
            model = builder(colors, hasHorns, enemyData.hornSize || 1, isBaby, false);
        } else {
            model = builder(colors, isBaby);
        }

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
            defendsNest: enemyData.defendsNest || false,
            attackRange: enemyData.attackRange || 0,
            immuneToWater: enemyData.immuneToWater || false,
            chaseSpeed: enemyData.chaseSpeed ? enemyData.chaseSpeed + Math.random() * enemyData.speedVariation : 0,
            fleeSpeed: enemyData.fleeSpeed ? enemyData.fleeSpeed + Math.random() * enemyData.speedVariation : 0,
            dodgeChance: enemyData.dodgeChance || 0,
            canStealEggs: enemyData.canStealEggs || false,
            fightsNestGuards: enemyData.fightsNestGuards || false
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

        // Pick random position across the map, avoiding the village
        const worldLimit = CONFIG.WORLD_SIZE * 0.45;
        let ex, ez;
        let attempts = 0;
        do {
            ex = (Math.random() - 0.5) * 2 * worldLimit;
            ez = (Math.random() - 0.5) * 2 * worldLimit;
            attempts++;
        } while (attempts < 20 && Environment.isInVillage && Environment.isInVillage(ex, ez));

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
            // Fallback: leaders use male data if no specific leader entry exists
            if (!ENEMIES.find(e => e.id === enemyId)) {
                enemyId = animalType + '_male';
            }
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
            } else if (animalType === 'deericus_iricus') {
                enemy.userData.lifecycleState = 'idle';
            } else if (animalType === 'snow_caninon') {
                enemy.userData.lifecycleState = 'following';
            } else if (animalType === 'baluban_oxen') {
                enemy.userData.lifecycleState = 'grazing';
                enemy.userData.ignoreGravity = true;
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

        // Get river points to sample near the river instead of randomly across the whole map
        const riverPoints = Environment.getRiverPoints ? Environment.getRiverPoints() : [];

        let spawned = 0;
        let attempts = 0;
        const maxAttempts = count * 50;

        while (spawned < count && attempts < maxAttempts) {
            attempts++;

            let x, z;
            if (riverPoints.length > 1) {
                // Pick a random point along the river and offset to the side (riverbank)
                const idx = Math.floor(Math.random() * (riverPoints.length - 1));
                const p = riverPoints[idx];
                const angle = Math.random() * Math.PI * 2;
                const dist = 10 + Math.random() * 8; // 10-18 units from river center
                x = p.x + Math.cos(angle) * dist;
                z = p.z + Math.sin(angle) * dist;
            } else {
                // Fallback: random position across the map
                const worldSize = CONFIG.WORLD_SIZE;
                x = (Math.random() - 0.5) * worldSize * 0.8;
                z = (Math.random() - 0.5) * worldSize * 0.8;
            }

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

        console.log('Spawned', spawned, 'geese on riverbank (attempts:', attempts, ')');
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
    // SPAWN DRONGULINAT CATS (SNOWY MOUNTAINS BIOME)
    // ========================================================================
    /**
     * Spawn Drongulinat Cats in the snowy mountains.
     * Spawns male/female pairs at random positions.
     * @param {number} count - Total number of cats (spawned as pairs)
     */
    function spawnDrongulinatCats(count) {
        console.log(`=== SPAWNING ${count} DRONGULINAT CATS ===`);

        const maleData = ENEMIES.find(function(e) { return e.id === 'drongulinat_cat_male'; });
        const femaleData = ENEMIES.find(function(e) { return e.id === 'drongulinat_cat_female'; });

        if (!maleData || !femaleData) {
            console.error('Drongulinat cat data not found!');
            return;
        }

        // Spawn in pairs (1 male, 1 female per pair)
        var pairs = Math.ceil(count / 2);

        for (var i = 0; i < pairs; i++) {
            // Random position in the snowy mountains (spread out)
            var angle = Math.random() * Math.PI * 2;
            var radius = 30 + Math.random() * 50;
            var x = Math.cos(angle) * radius;
            var z = Math.sin(angle) * radius;

            // Spawn male
            var male = createEnemy(maleData, x, z);
            male.userData.ignoreGravity = true;  // Skip updateEnemies — we handle movement
            male.userData.matingTimer = Math.random() * 120 + 60; // 1-3 min until first mating
            male.userData.hungerTimer = Math.random() * 60 + 30;  // 0.5-1.5 min until hungry
            male.userData.isRetaliating = false;
            male.userData.wasAttackedByPlayer = false;
            GameState.scene.add(male);
            GameState.enemies.push(male);

            // Spawn female nearby
            var female = createEnemy(femaleData, x + 4, z + 4);
            female.userData.ignoreGravity = true;  // Skip updateEnemies — we handle movement
            female.userData.isPregnant = false;
            female.userData.gestationTimer = 0;
            female.userData.hungerTimer = Math.random() * 60 + 30;
            female.userData.isRetaliating = false;
            female.userData.wasAttackedByPlayer = false;
            GameState.scene.add(female);
            GameState.enemies.push(female);
        }

        console.log('Spawned ' + pairs + ' drongulinat cat pairs');
    }

    // ========================================================================
    // SPAWN SNOW CANINON PACK (SNOWY MOUNTAINS BIOME)
    // ========================================================================
    /**
     * Spawn a pack of Snow Caninon Lartus (XL bully dogs).
     * Each pack: 2 males + 2 females. First male = leader (10% larger).
     * @param {number} packIndex - Which pack number (for spread positioning)
     */
    function spawnSnowCaninonPack(packIndex) {
        console.log('=== SPAWNING SNOW CANINON PACK #' + packIndex + ' ===');

        var maleData = ENEMIES.find(function(e) { return e.id === 'snow_caninon_male'; });
        var femaleData = ENEMIES.find(function(e) { return e.id === 'snow_caninon_female'; });

        if (!maleData || !femaleData) {
            console.error('Snow caninon data not found!');
            return;
        }

        // Pack position — spread packs across the snowy biome
        var packAngles = [0.8, 2.5, 4.2]; // ~120 degrees apart
        var angle = packAngles[packIndex % packAngles.length] + (Math.random() - 0.5) * 0.5;
        var radius = 40 + Math.random() * 30; // 40-70m from center
        var packCenterX = Math.cos(angle) * radius;
        var packCenterZ = Math.sin(angle) * radius;

        var packId = 'snow_pack_' + Date.now() + '_' + packIndex;
        var packMembers = [];
        var leader = null;

        // Convert colors from hex strings
        function convertColors(data) {
            var colors = {};
            for (var key in data.colors) {
                var val = data.colors[key];
                colors[key] = typeof val === 'string' ? parseInt(val.replace('#', ''), 16) : val;
            }
            return colors;
        }

        // Spawn 2 males (first = leader)
        for (var i = 0; i < 2; i++) {
            var x = packCenterX + (Math.random() - 0.5) * 6;
            var z = packCenterZ + (Math.random() - 0.5) * 6;
            var isLeader = (i === 0);

            var colors = convertColors(maleData);
            var model = buildSnowCaninonModel(colors, false, isLeader, false);
            var dog = new THREE.Group();
            dog.add(model);
            dog.scale.set(maleData.size, maleData.size, maleData.size);

            var terrainY = Environment.getTerrainHeight(x, z);
            dog.position.set(x, terrainY + maleData.groundY, z);

            dog.userData = {
                id: maleData.id,
                type: 'snow_caninon',
                entityId: 'snowcaninon_' + Date.now() + '_' + Math.random(),
                gender: 'male',
                isLeader: isLeader,
                speed: maleData.speed + Math.random() * (maleData.speedVariation || 0),
                chaseSpeed: maleData.chaseSpeed || 11,
                damage: isLeader ? maleData.damage + 5 : maleData.damage,
                radius: maleData.radius,
                health: isLeader ? maleData.health + 10 : maleData.health,
                maxHealth: isLeader ? maleData.health + 10 : maleData.health,
                groundY: maleData.groundY,
                friendly: true,
                defensive: false,
                minimapColor: maleData.minimapColor,
                ignoreGravity: true,

                // Pack properties
                packId: packId,
                isPackAnimal: true,
                isBaby: false,

                // Mating (males only)
                matingTimer: 30 + Math.random() * 60, // 30s-90s first attempt

                // Behavior state
                lifecycleState: 'following',
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,
                walkPhase: Math.random() * Math.PI * 2
            };

            GameState.enemies.push(dog);
            GameState.scene.add(dog);
            packMembers.push(dog);

            if (isLeader) {
                leader = dog;
                console.log('Snow Caninon LEADER spawned (10% larger black male)');
            }
        }

        // Spawn 2 females
        for (var j = 0; j < 2; j++) {
            var fx = packCenterX + (Math.random() - 0.5) * 6;
            var fz = packCenterZ + (Math.random() - 0.5) * 6;

            var fcolors = convertColors(femaleData);
            var fmodel = buildSnowCaninonModel(fcolors, false, false, false);
            var fdog = new THREE.Group();
            fdog.add(fmodel);
            fdog.scale.set(femaleData.size, femaleData.size, femaleData.size);

            var fterrainY = Environment.getTerrainHeight(fx, fz);
            fdog.position.set(fx, fterrainY + femaleData.groundY, fz);

            fdog.userData = {
                id: femaleData.id,
                type: 'snow_caninon',
                entityId: 'snowcaninon_' + Date.now() + '_' + Math.random(),
                gender: 'female',
                isLeader: false,
                speed: femaleData.speed + Math.random() * (femaleData.speedVariation || 0),
                chaseSpeed: femaleData.chaseSpeed || 11,
                damage: femaleData.damage,
                radius: femaleData.radius,
                health: femaleData.health,
                maxHealth: femaleData.health,
                groundY: femaleData.groundY,
                friendly: true,
                defensive: false,
                minimapColor: femaleData.minimapColor,
                ignoreGravity: true,

                // Pack properties
                packId: packId,
                isPackAnimal: true,
                isBaby: false,

                // Female-specific
                canGetPregnant: true,
                isPregnant: false,
                gestationTimer: 0,
                isMother: false,
                pups: [],

                // Behavior state
                lifecycleState: 'following',
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,
                walkPhase: Math.random() * Math.PI * 2
            };

            GameState.enemies.push(fdog);
            GameState.scene.add(fdog);
            packMembers.push(fdog);
        }

        // Set leader reference for all pack members
        if (leader) {
            packMembers.forEach(function(member) {
                member.userData.leader = leader;
            });
        }

        // Store pack in GameState
        if (!GameState.snowCaninonPacks) {
            GameState.snowCaninonPacks = [];
        }
        GameState.snowCaninonPacks.push({
            id: packId,
            leader: leader,
            members: packMembers,
            den: null,
            homePosition: { x: packCenterX, z: packCenterZ },
            huntTimer: 300 + Math.random() * 180 // 5-8 min until first hunt
        });

        console.log('Spawned snow caninon pack: ' + packMembers.length + ' members - Pack ID: ' + packId);
    }

    // ========================================================================
    // SNOW CANINON BEHAVIOR UPDATE
    // ========================================================================
    /**
     * Update all Snow Caninon packs each frame.
     * Phase 1: Basic pack following + walking animation.
     */
    function updateSnowCaninonBehavior(delta) {
        if (!GameState.snowCaninonPacks || GameState.snowCaninonPacks.length === 0) return;

        GameState.snowCaninonPacks.forEach(function(pack) {
            // Remove dead members
            pack.members = pack.members.filter(function(dog) {
                return dog.parent && dog.userData.health > 0;
            });

            if (pack.members.length === 0) return;

            // If leader died, promote next male (or any member)
            if (!pack.leader || !pack.leader.parent || pack.leader.userData.health <= 0) {
                var newLeader = pack.members.find(function(m) { return m.userData.gender === 'male' && !m.userData.isBaby; });
                if (!newLeader) newLeader = pack.members.find(function(m) { return !m.userData.isBaby; });
                if (newLeader) {
                    pack.leader = newLeader;
                    newLeader.userData.isLeader = true;
                    pack.members.forEach(function(m) { m.userData.leader = newLeader; });
                }
            }

            // Pack-level: player near den — mother attacks!
            if (pack.den && pack.den.state === 'active' && GameState.peccary) {
                var pdx = GameState.peccary.position.x - pack.den.position.x;
                var pdz = GameState.peccary.position.z - pack.den.position.z;
                var pDenDist = Math.sqrt(pdx * pdx + pdz * pdz);
                if (pDenDist < 3) {
                    // Find the mother
                    var denMother = pack.members.find(function(m) {
                        return m.userData.entityId === pack.den.motherId;
                    });
                    if (denMother && denMother.userData.lifecycleState === 'denning') {
                        // Mother attacks player!
                        denMother.visible = true;
                        denMother.userData.lifecycleState = 'defending';
                        denMother.userData.defendTarget = GameState.peccary;
                        denMother.userData.defendReturnTimer = 12;
                        denMother.position.set(pack.den.entrancePosition.x, 0, pack.den.entrancePosition.z);
                        pack.den.occupants = pack.den.occupants.filter(function(id) {
                            return id !== denMother.userData.entityId;
                        });
                        console.log('Stay away from the den! Mother Snow Caninon attacks!');
                    }
                }
            }

            // Pack-level: hunt timer
            if (pack.huntTimer !== undefined && !pack.currentHunt) {
                pack.huntTimer -= delta;
                if (pack.huntTimer <= 0) {
                    triggerSnowCaninonHunt(pack);
                    pack.huntTimer = 300 + Math.random() * 180; // Reset: 5-8 min
                }
            }

            // Pack-level: active hunt update (eating timer)
            if (pack.currentHunt && pack.currentHunt.state === 'eating') {
                pack.currentHunt.eatTimer -= delta;
                // Eat from carcass
                if (pack.currentHunt.carcass && pack.currentHunt.carcass.parent) {
                    pack.members.forEach(function(m) {
                        if (m.userData.lifecycleState === 'eating' && m.visible !== false) {
                            eatFromCarcass(m, pack.currentHunt.carcass, delta);
                        }
                    });
                }
                if (pack.currentHunt.eatTimer <= 0 || !pack.currentHunt.carcass || !pack.currentHunt.carcass.parent
                    || (pack.currentHunt.carcass.userData && pack.currentHunt.carcass.userData.carcassMeatLeft <= 0)) {
                    // Done eating — return to following
                    endSnowCaninonHunt(pack);
                }
            }

            // Pack-level: standoff with oxen
            if (pack.currentHunt && pack.currentHunt.state === 'standoff') {
                updateOxenHuntStandoff(pack, delta);
            }

            // Pack-level: den digging timer
            if (pack.digTimer !== undefined && pack.digTimer > 0) {
                pack.digTimer -= delta;

                // Grow den mesh over 10 seconds (0.1 -> 1.0 scale)
                if (pack.den && pack.den.mesh) {
                    var progress = Math.max(0, 1 - pack.digTimer / 10);
                    var s = 0.1 + progress * 0.9;
                    pack.den.mesh.scale.set(s, s, s);
                }

                // Digging complete!
                if (pack.digTimer <= 0) {
                    pack.digTimer = undefined;
                    pack.den.state = 'active';
                    pack.den.mesh.scale.set(1, 1, 1);

                    // Mother enters den and gives birth
                    var mother = pack.diggingMother;
                    if (mother && mother.parent) {
                        mother.userData.lifecycleState = 'denning';
                        mother.userData.isPregnant = false;
                        mother.userData.isMother = true;
                        mother.visible = false; // Hide in den
                        mother.userData.den = pack.den;
                        pack.den.occupants.push(mother.userData.entityId);

                        // Spawn 2 pups
                        spawnSnowCaninonPups(mother, pack, pack.den);
                        console.log('Den complete! Mother entered den, 2 pups born.');
                    }

                    // Rest of pack returns to following
                    pack.members.forEach(function(m) {
                        if (m.userData.lifecycleState === 'digging_den') {
                            m.userData.lifecycleState = 'following';
                        }
                    });
                    pack.diggingMother = null;
                }
            }

            // Update each member
            pack.members.forEach(function(dog) {
                if (!dog.parent || dog.userData.health <= 0) return;

                var state = dog.userData.lifecycleState;

                if (state === 'following') {
                    updateSnowCaninonFollowing(dog, pack, delta);

                    // Males: mating timer
                    if (dog.userData.gender === 'male' && !dog.userData.isBaby && dog.userData.matingTimer !== undefined) {
                        dog.userData.matingTimer -= delta;
                        if (dog.userData.matingTimer <= 0) {
                            triggerSnowCaninonMating(pack);
                            dog.userData.matingTimer = 120 + Math.random() * 180; // Reset: 2-5 min
                        }
                    }

                    // Females: pregnancy countdown
                    if (dog.userData.isPregnant) {
                        var prevTimer = dog.userData.gestationTimer;
                        dog.userData.gestationTimer -= delta;
                        // Log every 10 seconds
                        if (Math.floor(prevTimer / 10) !== Math.floor(dog.userData.gestationTimer / 10)) {
                            console.log('Gestation: ' + Math.ceil(dog.userData.gestationTimer) + 's remaining');
                        }
                        if (dog.userData.gestationTimer <= 0) {
                            console.log('Gestation complete! Starting den dig...');
                            initiateSnowCaninonDenDigging(dog, pack);
                        }
                    }

                } else if (state === 'digging_den') {
                    // Move toward dig target, play digging animation
                    updateSnowCaninonDigging(dog, delta);

                } else if (state === 'denning') {
                    // Mother stays hidden in den
                    // Check if all pups have matured -> exit den
                    if (dog.userData.pups && dog.userData.pups.length > 0) {
                        var allMature = dog.userData.pups.every(function(p) {
                            return !p.parent || p.userData.health <= 0 || !p.userData.isBaby;
                        });
                        if (allMature) {
                            // All pups grew up or died — mother exits den
                            dog.visible = true;
                            dog.userData.lifecycleState = 'following';
                            dog.userData.isMother = false;
                            dog.userData.pups = [];
                            dog.position.set(pack.den.entrancePosition.x, 0, pack.den.entrancePosition.z);

                            // Remove den
                            if (pack.den.mesh) GameState.scene.remove(pack.den.mesh);
                            if (GameState.snowCaninonDens) {
                                GameState.snowCaninonDens = GameState.snowCaninonDens.filter(function(d) {
                                    return d.id !== pack.den.id;
                                });
                            }
                            pack.den = null;
                            console.log('All pups matured/gone. Mother exits den, den removed.');
                        }
                    }

                } else if (state === 'pup') {
                    updateSnowCaninonPup(dog, pack, delta);

                } else if (state === 'hunting_chase') {
                    // Leader chases deer, others follow leader
                    updateSnowCaninonHuntChase(dog, pack, delta);

                } else if (state === 'eating') {
                    // Gather at carcass and eat
                    updateSnowCaninonEating(dog, pack, delta);

                } else if (state === 'defending') {
                    // Mother chasing a cat to defend pups
                    var target = dog.userData.defendTarget;
                    var terrainYd = Environment.getTerrainHeight(dog.position.x, dog.position.z);
                    dog.position.y = terrainYd + (dog.userData.groundY || 0.4);

                    dog.userData.defendReturnTimer -= delta;

                    if (!target || !target.parent || target.userData.health <= 0 || dog.userData.defendReturnTimer <= 0) {
                        // Cat gone or timer expired — return to den
                        dog.userData.lifecycleState = 'denning';
                        dog.userData.defendTarget = null;
                        var denRef = dog.userData.den;
                        if (denRef) {
                            dog.visible = false;
                            denRef.occupants.push(dog.userData.entityId);
                        }
                        dog.userData.currentMoveSpeed = 0;
                    } else {
                        // Chase the cat!
                        var ctx = target.position.x - dog.position.x;
                        var ctz = target.position.z - dog.position.z;
                        var ctDist = Math.sqrt(ctx * ctx + ctz * ctz);

                        if (ctDist > 30) {
                            // Too far — give up
                            dog.userData.defendReturnTimer = 0;
                        } else if (ctDist < 1.5) {
                            // Hit the cat!
                            target.userData.health -= dog.userData.damage * delta * 2;
                            target.userData.wasAttackedByPlayer = true; // Makes cat flee
                            dog.userData.currentMoveSpeed = 0;
                        } else {
                            // Chase at high speed
                            var chaseSpd = dog.userData.chaseSpeed || 12;
                            dog.position.x += (ctx / ctDist) * chaseSpd * delta;
                            dog.position.z += (ctz / ctDist) * chaseSpd * delta;
                            dog.rotation.y = -Math.atan2(ctz, ctx);
                            dog.userData.currentMoveSpeed = chaseSpd;
                        }
                    }
                } else if (state === 'carrying_meat') {
                    // Walk back to den with meat chunk in mouth
                    var terrainYm = Environment.getTerrainHeight(dog.position.x, dog.position.z);
                    dog.position.y = terrainYm + (dog.userData.groundY || 0.4);

                    if (pack.den && pack.den.entrancePosition) {
                        var denX = pack.den.entrancePosition.x - dog.position.x;
                        var denZ = pack.den.entrancePosition.z - dog.position.z;
                        var denDist = Math.sqrt(denX * denX + denZ * denZ);

                        if (denDist > 2) {
                            var carrySpeed = dog.userData.speed || 6;
                            dog.position.x += (denX / denDist) * carrySpeed * delta;
                            dog.position.z += (denZ / denDist) * carrySpeed * delta;
                            dog.rotation.y = -Math.atan2(denZ, denX);
                            dog.userData.currentMoveSpeed = carrySpeed;
                        } else {
                            // Arrived at den — drop meat, return to following
                            dog.userData.lifecycleState = 'following';
                            dog.userData.currentMoveSpeed = 0;

                            // Remove meat chunk visual
                            var dogModel = dog.children[0];
                            if (dogModel && dogModel.userData && dogModel.userData.parts && dogModel.userData.parts.headGroup) {
                                var meatChunk = dogModel.userData.parts.headGroup.getObjectByName('meatChunk');
                                if (meatChunk) {
                                    dogModel.userData.parts.headGroup.remove(meatChunk);
                                }
                            }
                            console.log('Dog delivered meat to den!');
                        }
                    } else {
                        // No den — just drop meat and follow
                        dog.userData.lifecycleState = 'following';
                        var dogModel2 = dog.children[0];
                        if (dogModel2 && dogModel2.userData && dogModel2.userData.parts && dogModel2.userData.parts.headGroup) {
                            var meatChunk2 = dogModel2.userData.parts.headGroup.getObjectByName('meatChunk');
                            if (meatChunk2) {
                                dogModel2.userData.parts.headGroup.remove(meatChunk2);
                            }
                        }
                    }
                }

                // Walking animation (skip hidden dogs)
                if (dog.visible !== false) {
                    animateSnowCaninon(dog, delta);
                }
            });
        });
    }

    /**
     * Following behavior: leader wanders, others follow leader.
     */
    function updateSnowCaninonFollowing(dog, pack, delta) {
        var speed = dog.userData.speed;
        var terrainY = Environment.getTerrainHeight(dog.position.x, dog.position.z);
        dog.position.y = terrainY + (dog.userData.groundY || 0.4);

        if (dog.userData.isLeader) {
            // Leader wanders near homePosition
            dog.userData.wanderTime -= delta;
            if (dog.userData.wanderTime <= 0) {
                // Pick new direction, biased toward home
                var homeX = pack.homePosition.x;
                var homeZ = pack.homePosition.z;
                var dx = homeX - dog.position.x;
                var dz = homeZ - dog.position.z;
                var distHome = Math.sqrt(dx * dx + dz * dz);

                if (distHome > 40) {
                    // Too far from home, head back
                    dog.userData.wanderDir.set(dx / distHome, 0, dz / distHome);
                } else {
                    // Random wander with slight home bias
                    var rx = Math.random() - 0.5;
                    var rz = Math.random() - 0.5;
                    if (distHome > 20) {
                        rx += dx / distHome * 0.3;
                        rz += dz / distHome * 0.3;
                    }
                    dog.userData.wanderDir.set(rx, 0, rz).normalize();
                }
                dog.userData.wanderTime = 8 + Math.random() * 12; // 8-20 seconds
            }

            // Move leader at slow wander speed
            var wanderSpeed = speed * 0.2;
            dog.position.x += dog.userData.wanderDir.x * wanderSpeed * delta;
            dog.position.z += dog.userData.wanderDir.z * wanderSpeed * delta;

            // Face movement direction
            if (dog.userData.wanderDir.x !== 0 || dog.userData.wanderDir.z !== 0) {
                dog.rotation.y = -Math.atan2(dog.userData.wanderDir.z, dog.userData.wanderDir.x);
            }

            dog.userData.currentMoveSpeed = wanderSpeed;
        } else {
            // Non-leader: follow the leader loosely
            var leaderRef = dog.userData.leader;
            if (!leaderRef || !leaderRef.parent) {
                dog.userData.currentMoveSpeed = 0;
                return;
            }

            var dlx = leaderRef.position.x - dog.position.x;
            var dlz = leaderRef.position.z - dog.position.z;
            var distToLeader = Math.sqrt(dlx * dlx + dlz * dlz);

            var moveSpeed = 0;

            if (distToLeader > 18) {
                // Too far — sprint to catch up
                moveSpeed = speed * 0.8;
                var ndx = dlx / distToLeader;
                var ndz = dlz / distToLeader;
                dog.position.x += ndx * moveSpeed * delta;
                dog.position.z += ndz * moveSpeed * delta;
                dog.rotation.y = -Math.atan2(ndz, ndx);
            } else if (distToLeader > 10) {
                // Medium distance — walk toward leader
                moveSpeed = speed * 0.4;
                var ndx2 = dlx / distToLeader;
                var ndz2 = dlz / distToLeader;
                dog.position.x += ndx2 * moveSpeed * delta;
                dog.position.z += ndz2 * moveSpeed * delta;
                dog.rotation.y = -Math.atan2(ndz2, ndx2);
            } else {
                // Close enough — gentle wander with leader bias
                dog.userData.wanderTime -= delta;
                if (dog.userData.wanderTime <= 0) {
                    var wrx = Math.random() - 0.5 + dlx / distToLeader * 0.2;
                    var wrz = Math.random() - 0.5 + dlz / distToLeader * 0.2;
                    dog.userData.wanderDir.set(wrx, 0, wrz).normalize();
                    dog.userData.wanderTime = 4 + Math.random() * 6;
                }
                moveSpeed = speed * 0.15;
                dog.position.x += dog.userData.wanderDir.x * moveSpeed * delta;
                dog.position.z += dog.userData.wanderDir.z * moveSpeed * delta;
                if (dog.userData.wanderDir.x !== 0 || dog.userData.wanderDir.z !== 0) {
                    dog.rotation.y = -Math.atan2(dog.userData.wanderDir.z, dog.userData.wanderDir.x);
                }
            }

            dog.userData.currentMoveSpeed = moveSpeed;
        }

        // Keep within world bounds
        var worldLimit = CONFIG.WORLD_SIZE * 0.48;
        dog.position.x = Math.max(-worldLimit, Math.min(worldLimit, dog.position.x));
        dog.position.z = Math.max(-worldLimit, Math.min(worldLimit, dog.position.z));
    }

    /**
     * Simple walking animation for Snow Caninons.
     * Leg swing on rotation.z (model faces +X).
     */
    function animateSnowCaninon(dog, delta) {
        // Find inner model
        var dogModel = dog;
        if (!dog.userData.legs && dog.children.length > 0) dogModel = dog.children[0];
        if (!dogModel.userData || !dogModel.userData.legs) return;

        var legs = dogModel.userData.legs;
        var moveSpeed = dog.userData.currentMoveSpeed || 0;

        if (!dog.userData._walkCycle) dog.userData._walkCycle = 0;

        if (moveSpeed > 0.5) {
            // Walking/running animation
            dog.userData._walkCycle += delta * moveSpeed * 2.5;
            var cycle = dog.userData._walkCycle;

            legs.forEach(function(leg) {
                var phase = leg.isFront ? 0 : Math.PI;
                var sidePhase = leg.side === 'right' ? Math.PI : 0;
                var legCycle = cycle + phase + sidePhase;

                // Forward/backward swing on Z axis (model faces +X)
                leg.group.rotation.z = Math.sin(legCycle) * 0.3;
                if (leg.lowerLegGroup) {
                    leg.lowerLegGroup.rotation.z = Math.max(0, Math.sin(legCycle + 0.5)) * 0.25;
                }
            });

            // Gentle body bob
            dogModel.position.y = Math.sin(dog.userData._walkCycle * 2) * 0.015;
        } else {
            // Idle — slowly return legs to neutral
            legs.forEach(function(leg) {
                leg.group.rotation.z *= 0.9;
                if (leg.lowerLegGroup) leg.lowerLegGroup.rotation.z *= 0.9;
            });
            dogModel.position.y *= 0.9;
        }

        // Tail wag (always)
        if (dogModel.userData.parts && dogModel.userData.parts.tailGroup) {
            var tailSwing = Math.sin(Date.now() * 0.003) * 0.2;
            dogModel.userData.parts.tailGroup.rotation.y = tailSwing;
        }
    }

    /**
     * Digging behavior: move to dig site, face it, bob up and down.
     */
    function updateSnowCaninonDigging(dog, delta) {
        var target = dog.userData.digTarget;
        if (!target) return;

        var terrainY = Environment.getTerrainHeight(dog.position.x, dog.position.z);
        dog.position.y = terrainY + (dog.userData.groundY || 0.4);

        var dx = target.x - dog.position.x;
        var dz = target.z - dog.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 3) {
            // Walk to dig site
            var moveSpeed = dog.userData.speed * 0.5;
            dog.position.x += (dx / dist) * moveSpeed * delta;
            dog.position.z += (dz / dist) * moveSpeed * delta;
            dog.rotation.y = -Math.atan2(dz, dx);
            dog.userData.currentMoveSpeed = moveSpeed;
        } else {
            // At dig site — face the hole and play dig animation
            dog.rotation.y = -Math.atan2(dz, dx);
            dog.userData.currentMoveSpeed = 0;

            // Digging animation: bob body up/down, front legs scratch
            if (!dog.userData._digCycle) dog.userData._digCycle = 0;
            dog.userData._digCycle += delta * 6;

            var dogModel = dog.children[0];
            if (dogModel && dogModel.userData && dogModel.userData.legs) {
                var legs = dogModel.userData.legs;
                legs.forEach(function(leg) {
                    if (leg.isFront) {
                        // Front legs: rapid scratching motion
                        leg.group.rotation.z = Math.sin(dog.userData._digCycle + (leg.side === 'right' ? Math.PI : 0)) * 0.5;
                        if (leg.lowerLegGroup) {
                            leg.lowerLegGroup.rotation.z = Math.abs(Math.sin(dog.userData._digCycle)) * 0.4;
                        }
                    }
                });
                // Body bobs down when legs dig
                dogModel.position.y = Math.sin(dog.userData._digCycle * 2) * 0.02 - 0.02;
            }
        }
    }

    /**
     * Pup behavior: play near den, flee from cats, mature after 3 min.
     */
    function updateSnowCaninonPup(pup, pack, delta) {
        var terrainY = Environment.getTerrainHeight(pup.position.x, pup.position.z);
        pup.position.y = terrainY + (pup.userData.groundY || 0.2);

        // Check maturity
        var currentTime = GameState.timeElapsed || 0;
        if (pup.userData.maturityTime && currentTime >= pup.userData.maturityTime) {
            growSnowCaninonPup(pup, pack);
            return;
        }

        var den = pup.userData.den;
        if (!den) {
            // No den — just follow pack
            pup.userData.lifecycleState = 'following';
            return;
        }

        // Check for nearby drongulinat cats (threat detection)
        var nearestCat = null;
        var nearestCatDist = 15; // Detection range
        GameState.enemies.forEach(function(e) {
            if (e.userData.type === 'drongulinat_cat' && !e.userData.isBaby && e.parent && e.userData.health > 0) {
                var cdx = e.position.x - pup.position.x;
                var cdz = e.position.z - pup.position.z;
                var cdist = Math.sqrt(cdx * cdx + cdz * cdz);
                if (cdist < nearestCatDist) {
                    nearestCat = e;
                    nearestCatDist = cdist;
                }
            }
        });

        if (nearestCat) {
            // FLEE to den!
            var ddx = den.entrancePosition.x - pup.position.x;
            var ddz = den.entrancePosition.z - pup.position.z;
            var ddist = Math.sqrt(ddx * ddx + ddz * ddz);

            if (ddist < 1.5) {
                // Reached den — hide inside!
                pup.visible = false;
                den.occupants.push(pup.userData.entityId);
                pup.userData._hiddenInDen = true;
                pup.userData._hideTimer = 15 + Math.random() * 10; // Stay hidden 15-25 sec

                // Mother defends
                snowCaninonMotherDefend(pup.userData.mother, nearestCat);
            } else {
                // Run toward den
                var fleeSpeed = pup.userData.speed * 1.5;
                pup.position.x += (ddx / ddist) * fleeSpeed * delta;
                pup.position.z += (ddz / ddist) * fleeSpeed * delta;
                pup.rotation.y = -Math.atan2(ddz, ddx);
                pup.userData.currentMoveSpeed = fleeSpeed;
            }
            return;
        }

        // If hidden in den, count down then come out
        if (pup.userData._hiddenInDen) {
            pup.userData._hideTimer -= delta;
            if (pup.userData._hideTimer <= 0) {
                pup.visible = true;
                pup.userData._hiddenInDen = false;
                pup.position.set(den.entrancePosition.x, terrainY + 0.2, den.entrancePosition.z);
                den.occupants = den.occupants.filter(function(id) { return id !== pup.userData.entityId; });
            }
            pup.userData.currentMoveSpeed = 0;
            return;
        }

        // Normal play behavior: wander near den entrance
        pup.userData.wanderTime -= delta;
        if (pup.userData.wanderTime <= 0) {
            pup.userData.wanderDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
            pup.userData.wanderTime = 2 + Math.random() * 3;
        }

        var playSpeed = pup.userData.speed * 0.3;
        pup.position.x += pup.userData.wanderDir.x * playSpeed * delta;
        pup.position.z += pup.userData.wanderDir.z * playSpeed * delta;
        pup.userData.currentMoveSpeed = playSpeed;

        // Stay within 5 units of den entrance
        var toDenX = den.entrancePosition.x - pup.position.x;
        var toDenZ = den.entrancePosition.z - pup.position.z;
        var toDenDist = Math.sqrt(toDenX * toDenX + toDenZ * toDenZ);
        if (toDenDist > 5) {
            pup.userData.wanderDir.set(toDenX / toDenDist, 0, toDenZ / toDenDist);
        }

        if (pup.userData.wanderDir.x !== 0 || pup.userData.wanderDir.z !== 0) {
            pup.rotation.y = -Math.atan2(pup.userData.wanderDir.z, pup.userData.wanderDir.x);
        }
    }

    /**
     * Mother charges out of den to defend pups from a cat.
     */
    function snowCaninonMotherDefend(mother, cat) {
        if (!mother || !mother.parent || mother.userData.health <= 0) return;
        if (mother.userData.lifecycleState === 'defending') return; // Already defending

        // Mother exits den
        mother.visible = true;
        mother.userData.lifecycleState = 'defending';
        mother.userData.defendTarget = cat;
        mother.userData.defendReturnTimer = 8; // Return to den after 8 seconds

        var den = mother.userData.den;
        if (den) {
            mother.position.set(den.entrancePosition.x, 0, den.entrancePosition.z);
            den.occupants = den.occupants.filter(function(id) { return id !== mother.userData.entityId; });
        }

        console.log('Mother Snow Caninon emerges to defend pups!');
    }

    /**
     * Grow a pup into an adult Snow Caninon.
     */
    function growSnowCaninonPup(pup, pack) {
        var isMale = pup.userData.gender === 'male';

        // Get adult data
        var adultData = ENEMIES.find(function(e) {
            return e.id === (isMale ? 'snow_caninon_male' : 'snow_caninon_female');
        });
        if (!adultData) return;

        // Remove old model
        while (pup.children.length > 0) {
            pup.remove(pup.children[0]);
        }

        // Build adult model with adult colors
        var colors = {};
        for (var key in adultData.colors) {
            var val = adultData.colors[key];
            colors[key] = typeof val === 'string' ? parseInt(val.replace('#', ''), 16) : val;
        }
        var newModel = buildSnowCaninonModel(colors, false, false, false);
        pup.add(newModel);

        // Update scale and stats to adult
        pup.scale.set(adultData.size, adultData.size, adultData.size);
        pup.userData.isBaby = false;
        pup.userData.speed = adultData.speed;
        pup.userData.chaseSpeed = adultData.chaseSpeed || 11;
        pup.userData.damage = adultData.damage;
        pup.userData.radius = adultData.radius;
        pup.userData.health = adultData.health;
        pup.userData.maxHealth = adultData.health;
        pup.userData.groundY = adultData.groundY;
        pup.userData.lifecycleState = 'following';
        pup.userData.leader = pack.leader;

        // Males get mating timer
        if (isMale) {
            pup.userData.matingTimer = 120 + Math.random() * 180;
        } else {
            pup.userData.canGetPregnant = true;
            pup.userData.isPregnant = false;
            pup.userData.gestationTimer = 0;
            pup.userData.isMother = false;
            pup.userData.pups = [];
        }

        console.log('Snow Caninon pup matured into adult ' + pup.userData.gender + '!');
    }

    // ========================================================================
    // SNOW CANINON PACK HUNTING
    // ========================================================================
    /**
     * Pack leader finds nearest deer and initiates a chase.
     * Simpler than wild dog hunts — leader chases, kills, pack eats.
     */
    function triggerSnowCaninonHunt(pack) {
        if (pack.currentHunt) return;
        if (!pack.leader || !pack.leader.parent) return;

        // Don't hunt if pack is digging or has other priorities
        var busy = pack.members.some(function(m) {
            return m.userData.lifecycleState === 'digging_den';
        });
        if (busy) return;

        // Find nearest prey within 80 units of leader (deer or oxen)
        var leader = pack.leader;
        var nearestPrey = null;
        var nearestDist = 80;

        GameState.enemies.forEach(function(e) {
            if ((e.userData.type === 'deericus_iricus' || e.userData.type === 'baluban_oxen') &&
                e.parent && e.userData.health > 0 && e.visible !== false &&
                !e.userData.isCarcass && !e.userData.isBaby) {
                var dx = e.position.x - leader.position.x;
                var dz = e.position.z - leader.position.z;
                var dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < nearestDist) {
                    nearestPrey = e;
                    nearestDist = dist;
                }
            }
        });

        if (!nearestPrey) return;

        var isOxen = nearestPrey.userData.type === 'baluban_oxen';

        // Start the hunt!
        pack.currentHunt = {
            target: nearestPrey,
            state: isOxen ? 'surrounding' : 'chasing',
            targetType: isOxen ? 'oxen' : 'deer',
            carcass: null,
            eatTimer: 0,
            nippingTimer: 15 + Math.random() * 15, // 15-30s of nipping before standoff
            nippingDamageTimer: 0
        };

        // All non-baby, non-denning members join the hunt
        var hunters = [];
        pack.members.forEach(function(m) {
            if (!m.userData.isBaby && m.userData.lifecycleState === 'following') {
                m.userData.lifecycleState = 'hunting_chase';
                hunters.push(m);
            }
        });

        // Assign hunt roles for oxen hunt
        if (isOxen && hunters.length >= 3) {
            // Leader gets 'behind' (control direction)
            if (pack.leader && pack.leader.userData.lifecycleState === 'hunting_chase') {
                pack.leader.userData.huntRole = 'behind';
            }
            var roleIndex = 0;
            var sideRoles = ['left', 'right'];
            hunters.forEach(function(h) {
                if (h === pack.leader) return;
                if (roleIndex < 2) {
                    h.userData.huntRole = sideRoles[roleIndex];
                } else {
                    h.userData.huntRole = 'flanker';
                }
                roleIndex++;
            });

            // Make oxen flee
            nearestPrey.userData.lifecycleState = 'being_hunted';
            nearestPrey.userData._huntedByPack = pack;
            nearestPrey.userData._fleeDir = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        } else {
            // Simple deer hunt
            nearestPrey.userData.isFleeing = true;
            nearestPrey.userData.fleeTarget = leader;
        }

        console.log('Snow Caninon hunt started! Target: ' + (isOxen ? 'BALUBAN OXEN' : 'deer'));
    }

    /**
     * Hunt chase state: handles both deer (simple chase) and oxen (surround/nip).
     */
    function updateSnowCaninonHuntChase(dog, pack, delta) {
        var terrainY = Environment.getTerrainHeight(dog.position.x, dog.position.z);
        dog.position.y = terrainY + (dog.userData.groundY || 0.4);

        if (!pack.currentHunt || !pack.currentHunt.target || !pack.currentHunt.target.parent
            || pack.currentHunt.target.userData.health <= 0) {
            endSnowCaninonHunt(pack);
            return;
        }

        var target = pack.currentHunt.target;
        var huntState = pack.currentHunt.state;

        // ---- OXEN HUNT: SURROUNDING / NIPPING / STANDOFF ----
        if (huntState === 'surrounding' || huntState === 'nipping' || huntState === 'standoff') {
            updateDogOxenHunt(dog, pack, target, delta);
            return;
        }

        // ---- DEER HUNT: SIMPLE CHASE ----
        if (dog.userData.isLeader) {
            var dx = target.position.x - dog.position.x;
            var dz = target.position.z - dog.position.z;
            var dist = Math.sqrt(dx * dx + dz * dz);

            if (dist > 60) {
                endSnowCaninonHunt(pack);
                return;
            }

            if (dist < 2) {
                convertToCarcass(target);
                pack.currentHunt.carcass = target;
                pack.currentHunt.state = 'eating';
                pack.currentHunt.eatTimer = 60;

                pack.members.forEach(function(m) {
                    if (m.userData.lifecycleState === 'hunting_chase') {
                        m.userData.lifecycleState = 'eating';
                    }
                });
                console.log('Snow Caninon leader caught deer! Pack feasting.');
                return;
            }

            var chaseSpeed = dog.userData.chaseSpeed || 11;
            dog.position.x += (dx / dist) * chaseSpeed * delta;
            dog.position.z += (dz / dist) * chaseSpeed * delta;
            dog.rotation.y = -Math.atan2(dz, dx);
            dog.userData.currentMoveSpeed = chaseSpeed;
        } else {
            var lx = pack.leader.position.x - dog.position.x;
            var lz = pack.leader.position.z - dog.position.z;
            var ldist = Math.sqrt(lx * lx + lz * lz);

            if (ldist > 2) {
                var followSpeed = (dog.userData.chaseSpeed || 11) * 0.9;
                dog.position.x += (lx / ldist) * followSpeed * delta;
                dog.position.z += (lz / ldist) * followSpeed * delta;
                dog.rotation.y = -Math.atan2(lz, lx);
                dog.userData.currentMoveSpeed = followSpeed;
            } else {
                dog.userData.currentMoveSpeed = 0;
            }
        }
    }

    /**
     * Dog positioning during oxen hunt — surround and nip.
     * Dogs take positions relative to the oxen's direction: left, right, behind.
     */
    function updateDogOxenHunt(dog, pack, target, delta) {
        var chaseSpeed = dog.userData.chaseSpeed || 11;
        var role = dog.userData.huntRole || 'flanker';

        // ---- STANDOFF: Dogs circle the stopped oxen ----
        if (pack.currentHunt.state === 'standoff') {
            // Circle at 4-5 units from oxen
            if (!dog.userData._circleAngle) dog.userData._circleAngle = Math.random() * Math.PI * 2;
            dog.userData._circleAngle += delta * 0.5; // Slow circle

            var circleR = 4.5;
            var cx = target.position.x + Math.cos(dog.userData._circleAngle) * circleR;
            var cz = target.position.z + Math.sin(dog.userData._circleAngle) * circleR;

            var cdx = cx - dog.position.x;
            var cdz = cz - dog.position.z;
            var cDist = Math.sqrt(cdx * cdx + cdz * cdz);

            if (cDist > 0.5) {
                var circleSpeed = 3;
                dog.position.x += (cdx / cDist) * circleSpeed * delta;
                dog.position.z += (cdz / cDist) * circleSpeed * delta;
                dog.userData.currentMoveSpeed = circleSpeed;
            } else {
                dog.userData.currentMoveSpeed = 0.5; // Slow prowl
            }

            // Face the oxen
            var ftx = target.position.x - dog.position.x;
            var ftz = target.position.z - dog.position.z;
            dog.rotation.y = -Math.atan2(ftz, ftx);

            // Terrain
            var tY = Environment.getTerrainHeight(dog.position.x, dog.position.z);
            dog.position.y = tY + (dog.userData.groundY || 0.4);
            return;
        }

        // Oxen's forward direction
        var oxForwardX = Math.cos(-target.rotation.y);
        var oxForwardZ = -Math.sin(-target.rotation.y);

        // Perpendicular (right side of oxen)
        var oxRightX = -oxForwardZ;
        var oxRightZ = oxForwardX;

        // Calculate target position based on role
        var targetX, targetZ;
        var offset = 2.5; // How far from oxen to run

        if (role === 'left') {
            targetX = target.position.x - oxRightX * offset + oxForwardX * 0.5;
            targetZ = target.position.z - oxRightZ * offset + oxForwardZ * 0.5;
        } else if (role === 'right') {
            targetX = target.position.x + oxRightX * offset + oxForwardX * 0.5;
            targetZ = target.position.z + oxRightZ * offset + oxForwardZ * 0.5;
        } else if (role === 'behind') {
            targetX = target.position.x - oxForwardX * offset;
            targetZ = target.position.z - oxForwardZ * offset;
        } else {
            // Flanker — stay near leader
            targetX = pack.leader.position.x + (Math.random() - 0.5) * 4;
            targetZ = pack.leader.position.z + (Math.random() - 0.5) * 4;
        }

        // Move toward target position
        var dx = targetX - dog.position.x;
        var dz = targetZ - dog.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 1) {
            dog.position.x += (dx / dist) * chaseSpeed * delta;
            dog.position.z += (dz / dist) * chaseSpeed * delta;
            dog.rotation.y = -Math.atan2(dz, dx);
            dog.userData.currentMoveSpeed = chaseSpeed;
        } else {
            // In position — match oxen's speed and direction
            var oxSpeed = target.userData.currentMoveSpeed || 4;
            dog.position.x += oxForwardX * oxSpeed * delta;
            dog.position.z += oxForwardZ * oxSpeed * delta;
            dog.userData.currentMoveSpeed = oxSpeed;

            // Face the oxen while running alongside
            var toDeerX = target.position.x - dog.position.x;
            var toDeerZ = target.position.z - dog.position.z;
            dog.rotation.y = -Math.atan2(toDeerZ, toDeerX);
        }

        // ---- NIPPING ----
        if (pack.currentHunt.state === 'nipping') {
            // Periodic nip damage
            if (!dog.userData._nipTimer) dog.userData._nipTimer = 1 + Math.random() * 2;
            dog.userData._nipTimer -= delta;

            if (dog.userData._nipTimer <= 0) {
                dog.userData._nipTimer = 2 + Math.random() * 3;

                // Only nip if close to oxen
                var tox = target.position.x - dog.position.x;
                var toz = target.position.z - dog.position.z;
                var toDist = Math.sqrt(tox * tox + toz * toz);

                if (toDist < 4) {
                    // Nip! Small damage
                    target.userData.health -= 2;

                    // Head turn animation for nip
                    var dogModel = dog.children[0];
                    if (dogModel && dogModel.userData.parts && dogModel.userData.parts.headGroup) {
                        dogModel.userData.parts.headGroup.rotation.y = (role === 'left' ? 0.4 : role === 'right' ? -0.4 : 0.3);
                        setTimeout(function() {
                            if (dogModel.userData.parts && dogModel.userData.parts.headGroup) {
                                dogModel.userData.parts.headGroup.rotation.y = 0;
                            }
                        }, 300);
                    }

                    // Behind dog: leg bite — slows oxen temporarily
                    if (role === 'behind' || role === 'flanker') {
                        if (Math.random() < 0.3) {
                            target.userData._legBitten = true;
                            target.userData._legBiteTimer = 2; // 2 seconds slow
                        }
                    }
                }
            }
        }

        // Transition: surrounding → nipping after all dogs are roughly in position
        if (pack.currentHunt.state === 'surrounding') {
            // Check if enough dogs are near their positions
            var inPosition = 0;
            pack.members.forEach(function(m) {
                if (m.userData.lifecycleState === 'hunting_chase') {
                    var mtx = target.position.x - m.position.x;
                    var mtz = target.position.z - m.position.z;
                    if (Math.sqrt(mtx * mtx + mtz * mtz) < 6) inPosition++;
                }
            });
            if (inPosition >= 2) {
                pack.currentHunt.state = 'nipping';
                console.log('Dogs in position! Nipping phase begins.');
            }
        }
    }

    /**
     * Eating state: gather at carcass location.
     */
    function updateSnowCaninonEating(dog, pack, delta) {
        var terrainY = Environment.getTerrainHeight(dog.position.x, dog.position.z);
        dog.position.y = terrainY + (dog.userData.groundY || 0.4);

        if (!pack.currentHunt || !pack.currentHunt.carcass) {
            dog.userData.lifecycleState = 'following';
            dog.userData.currentMoveSpeed = 0;
            return;
        }

        var carcass = pack.currentHunt.carcass;
        var cx = carcass.position.x - dog.position.x;
        var cz = carcass.position.z - dog.position.z;
        var cdist = Math.sqrt(cx * cx + cz * cz);

        if (cdist > 2.5) {
            // Walk toward carcass
            var walkSpeed = dog.userData.speed * 0.5;
            dog.position.x += (cx / cdist) * walkSpeed * delta;
            dog.position.z += (cz / cdist) * walkSpeed * delta;
            dog.rotation.y = -Math.atan2(cz, cx);
            dog.userData.currentMoveSpeed = walkSpeed;
        } else {
            // At carcass — face it and stay still (eating animation)
            dog.rotation.y = -Math.atan2(cz, cx);
            dog.userData.currentMoveSpeed = 0;

            // Head down eating animation
            var dogModel = dog.children[0];
            if (dogModel && dogModel.userData && dogModel.userData.parts && dogModel.userData.parts.neckGroup) {
                dogModel.userData.parts.neckGroup.rotation.z = 0.3; // Head down
            }
        }
    }

    // ========================================================================
    // OXEN HUNT — STANDOFF + OUTCOMES
    // ========================================================================

    /**
     * Pack-level standoff logic: oxen faces attackers, dogs circle.
     * After 3-5 seconds of tension, an outcome is determined.
     */
    function updateOxenHuntStandoff(pack, delta) {
        if (!pack.currentHunt || !pack.currentHunt.target) return;
        var oxen = pack.currentHunt.target;

        // Initialize standoff timer
        if (!pack.currentHunt.standoffTimer) {
            pack.currentHunt.standoffTimer = 3 + Math.random() * 2; // 3-5 seconds tension
            pack.currentHunt.standoffPhase = 'circling';

            // Oxen faces the nearest dog
            var nearestDog = null;
            var nearestDist = Infinity;
            pack.members.forEach(function(m) {
                if (m.userData.lifecycleState === 'hunting_chase') {
                    var ddx = m.position.x - oxen.position.x;
                    var ddz = m.position.z - oxen.position.z;
                    var dd = Math.sqrt(ddx * ddx + ddz * ddz);
                    if (dd < nearestDist) {
                        nearestDist = dd;
                        nearestDog = m;
                    }
                }
            });
            if (nearestDog) {
                var fx = nearestDog.position.x - oxen.position.x;
                var fz = nearestDog.position.z - oxen.position.z;
                oxen.rotation.y = -Math.atan2(fz, fx);
            }
            console.log('Standoff begins! Dogs circling...');
        }

        pack.currentHunt.standoffTimer -= delta;

        if (pack.currentHunt.standoffTimer <= 0 && pack.currentHunt.standoffPhase === 'circling') {
            // Determine outcome!
            var outcome = determineHuntOutcome(pack, oxen);
            pack.currentHunt.standoffPhase = 'outcome';
            pack.currentHunt.outcomeType = outcome;
            pack.currentHunt.outcomeTimer = 0;
            console.log('Hunt outcome: ' + outcome);
        }

        // Play out the outcome over time
        if (pack.currentHunt.standoffPhase === 'outcome') {
            pack.currentHunt.outcomeTimer += delta;

            if (pack.currentHunt.outcomeType === 'oxen_wins') {
                playOutcomeA_OxenWins(pack, oxen, delta);
            } else if (pack.currentHunt.outcomeType === 'pack_wins_losses') {
                playOutcomeB_PackWinsWithLosses(pack, oxen, delta);
            } else if (pack.currentHunt.outcomeType === 'flawless_kill') {
                playOutcomeC_FlawlessKill(pack, oxen, delta);
            }
        }
    }

    /**
     * Determine which of the 3 outcomes occurs.
     * Based on pack size and oxen HP remaining.
     */
    function determineHuntOutcome(pack, oxen) {
        var hunters = pack.members.filter(function(m) {
            return m.userData.lifecycleState === 'hunting_chase';
        });
        var packSize = hunters.length;
        var hpPercent = oxen.userData.health / (oxen.userData.maxHealth || 60);

        // Base chances:
        // A (oxen wins): ~40% — more likely with fewer dogs or high HP
        // B (pack wins with losses): ~50% — most common
        // C (flawless kill): ~10% — rare, more likely with many dogs + low HP
        var chanceA = 0.4;
        var chanceC = 0.1;

        // Pack size modifiers: more dogs = less chance of oxen winning, more flawless
        if (packSize >= 6) {
            chanceA -= 0.15;
            chanceC += 0.15;
        } else if (packSize >= 4) {
            chanceA -= 0.05;
            chanceC += 0.05;
        } else if (packSize <= 2) {
            chanceA += 0.2;
            chanceC -= 0.05;
        }

        // HP modifiers: low HP oxen = easier kill
        if (hpPercent < 0.3) {
            chanceA -= 0.15;
            chanceC += 0.1;
        } else if (hpPercent > 0.7) {
            chanceA += 0.1;
            chanceC -= 0.05;
        }

        // Clamp
        chanceA = Math.max(0.05, Math.min(0.7, chanceA));
        chanceC = Math.max(0.02, Math.min(0.3, chanceC));

        var roll = Math.random();
        if (roll < chanceA) return 'oxen_wins';
        if (roll < chanceA + chanceC) return 'flawless_kill';
        return 'pack_wins_losses';
    }

    /**
     * Outcome A: Oxen wins — headbutts 1-2 dogs (instant kill), survivors flee.
     */
    function playOutcomeA_OxenWins(pack, oxen, delta) {
        var t = pack.currentHunt.outcomeTimer;

        // Phase 1 (0-1.5s): Oxen charges at nearest dog
        if (t < 1.5) {
            if (!pack.currentHunt._chargeTarget) {
                // Pick 1-2 nearest dogs to headbutt
                var hunters = pack.members.filter(function(m) {
                    return m.userData.lifecycleState === 'hunting_chase';
                });
                hunters.sort(function(a, b) {
                    var dA = Math.pow(a.position.x - oxen.position.x, 2) + Math.pow(a.position.z - oxen.position.z, 2);
                    var dB = Math.pow(b.position.x - oxen.position.x, 2) + Math.pow(b.position.z - oxen.position.z, 2);
                    return dA - dB;
                });
                var killCount = Math.min(hunters.length, 1 + (Math.random() < 0.4 ? 1 : 0));
                pack.currentHunt._chargeTarget = hunters.slice(0, killCount);
                pack.currentHunt._killed = false;

                // Lower head for charge (headbutt)
                var oxModel = oxen.children[0] || oxen;
                if (oxModel.userData && oxModel.userData.parts && oxModel.userData.parts.neckGroup) {
                    oxModel.userData.parts.neckGroup.rotation.z = 0.5; // Head down for charge
                }
            }

            // Charge toward first target
            var chargeTarget = pack.currentHunt._chargeTarget[0];
            if (chargeTarget && chargeTarget.parent) {
                var cx = chargeTarget.position.x - oxen.position.x;
                var cz = chargeTarget.position.z - oxen.position.z;
                var cDist = Math.sqrt(cx * cx + cz * cz);

                if (cDist > 1.5) {
                    var chargeSpeed = 8;
                    oxen.position.x += (cx / cDist) * chargeSpeed * delta;
                    oxen.position.z += (cz / cDist) * chargeSpeed * delta;
                    oxen.rotation.y = -Math.atan2(cz, cx);
                    oxen.userData.currentMoveSpeed = chargeSpeed;
                } else if (!pack.currentHunt._killed) {
                    // HEADBUTT! Kill the targets
                    pack.currentHunt._chargeTarget.forEach(function(victim) {
                        if (victim && victim.parent) {
                            victim.userData.health = 0;
                            convertToCarcass(victim);
                            var vidx = pack.members.indexOf(victim);
                            if (vidx > -1) pack.members.splice(vidx, 1);
                            console.log('Oxen headbutt KILLS a dog!');
                        }
                    });
                    pack.currentHunt._killed = true;

                    // Reset head
                    var oxModel2 = oxen.children[0] || oxen;
                    if (oxModel2.userData && oxModel2.userData.parts && oxModel2.userData.parts.neckGroup) {
                        oxModel2.userData.parts.neckGroup.rotation.z = 0;
                    }
                }
            }
        }

        // Phase 2 (1.5-4s): Survivors flee
        if (t >= 1.5) {
            pack.members.forEach(function(m) {
                if (m.userData.lifecycleState === 'hunting_chase') {
                    // Flee away from oxen
                    var rx = m.position.x - oxen.position.x;
                    var rz = m.position.z - oxen.position.z;
                    var rDist = Math.sqrt(rx * rx + rz * rz);
                    if (rDist > 0.1) {
                        var fleeSpeed = 10;
                        m.position.x += (rx / rDist) * fleeSpeed * delta;
                        m.position.z += (rz / rDist) * fleeSpeed * delta;
                        m.rotation.y = -Math.atan2(rz, rx);
                        m.userData.currentMoveSpeed = fleeSpeed;
                    }

                    var terrainY = Environment.getTerrainHeight(m.position.x, m.position.z);
                    m.position.y = terrainY + (m.userData.groundY || 0.4);
                }
            });

            // After 4s total, end hunt and return oxen to grazing
            if (t >= 4) {
                // Reset oxen
                oxen.userData.lifecycleState = 'grazing';
                oxen.userData._huntedByPack = null;
                oxen.userData._fleeDir = null;
                oxen.userData._legBitten = false;
                oxen.userData.currentMoveSpeed = 0;

                endSnowCaninonHunt(pack);
                console.log('Oxen WINS! Dogs flee.');
            }
        }
    }

    /**
     * Outcome B: Pack wins with losses — 1 dog dies, leader gets neck bite, pack piles on.
     */
    function playOutcomeB_PackWinsWithLosses(pack, oxen, delta) {
        var t = pack.currentHunt.outcomeTimer;

        // Phase 1 (0-1.5s): Oxen headbutts one dog (kills it)
        if (t < 1.5) {
            if (!pack.currentHunt._victimChosen) {
                var hunters = pack.members.filter(function(m) {
                    return m.userData.lifecycleState === 'hunting_chase' && m !== pack.leader;
                });
                if (hunters.length > 0) {
                    pack.currentHunt._victim = hunters[Math.floor(Math.random() * hunters.length)];
                } else {
                    // No non-leader dogs to sacrifice — skip to kill
                    pack.currentHunt._victim = null;
                }
                pack.currentHunt._victimChosen = true;
                pack.currentHunt._victimKilled = false;

                // Head down for charge
                var oxModel = oxen.children[0] || oxen;
                if (oxModel.userData && oxModel.userData.parts && oxModel.userData.parts.neckGroup) {
                    oxModel.userData.parts.neckGroup.rotation.z = 0.5;
                }
            }

            if (pack.currentHunt._victim && !pack.currentHunt._victimKilled) {
                var victim = pack.currentHunt._victim;
                var vx = victim.position.x - oxen.position.x;
                var vz = victim.position.z - oxen.position.z;
                var vDist = Math.sqrt(vx * vx + vz * vz);

                if (vDist > 1.5) {
                    oxen.position.x += (vx / vDist) * 8 * delta;
                    oxen.position.z += (vz / vDist) * 8 * delta;
                    oxen.rotation.y = -Math.atan2(vz, vx);
                    oxen.userData.currentMoveSpeed = 8;
                } else {
                    // Headbutt kills victim
                    victim.userData.health = 0;
                    convertToCarcass(victim);
                    var vidx = pack.members.indexOf(victim);
                    if (vidx > -1) pack.members.splice(vidx, 1);
                    pack.currentHunt._victimKilled = true;
                    console.log('Oxen headbutt kills a dog! But the leader lunges...');

                    // Reset head
                    var oxModel2 = oxen.children[0] || oxen;
                    if (oxModel2.userData && oxModel2.userData.parts && oxModel2.userData.parts.neckGroup) {
                        oxModel2.userData.parts.neckGroup.rotation.z = 0;
                    }
                }
            }
        }

        // Phase 2 (1.5-3s): Leader lunges for neck bite, attaches to oxen
        if (t >= 1.5 && t < 3) {
            if (pack.leader && pack.leader.parent && pack.leader.userData.lifecycleState === 'hunting_chase') {
                // Leader moves to oxen's neck
                var lx = oxen.position.x - pack.leader.position.x;
                var lz = oxen.position.z - pack.leader.position.z;
                var lDist = Math.sqrt(lx * lx + lz * lz);

                if (lDist > 1) {
                    pack.leader.position.x += (lx / lDist) * 12 * delta;
                    pack.leader.position.z += (lz / lDist) * 12 * delta;
                    pack.leader.rotation.y = -Math.atan2(lz, lx);
                    pack.leader.userData.currentMoveSpeed = 12;
                } else {
                    // Attached! Neck bite
                    if (!pack.currentHunt._leaderAttached) {
                        pack.currentHunt._leaderAttached = true;
                        console.log('Pack leader latches onto oxen\'s neck!');
                    }
                    // Stay attached — move with oxen
                    pack.leader.position.x = oxen.position.x + 0.8;
                    pack.leader.position.z = oxen.position.z;
                    pack.leader.userData.currentMoveSpeed = 0;
                }
            }

            // Other dogs pile on
            pack.members.forEach(function(m) {
                if (m !== pack.leader && m.userData.lifecycleState === 'hunting_chase') {
                    var mx = oxen.position.x - m.position.x;
                    var mz = oxen.position.z - m.position.z;
                    var mDist = Math.sqrt(mx * mx + mz * mz);
                    if (mDist > 2) {
                        m.position.x += (mx / mDist) * 10 * delta;
                        m.position.z += (mz / mDist) * 10 * delta;
                        m.rotation.y = -Math.atan2(mz, mx);
                        m.userData.currentMoveSpeed = 10;
                    }
                }
            });

            // Oxen HP drains from neck bite + pack biting
            oxen.userData.health -= 12 * delta;
        }

        // Phase 3 (3-5s): Oxen falls, becomes carcass, pack feasts
        if (t >= 3) {
            if (!pack.currentHunt._oxenDead) {
                // Oxen dies
                oxen.userData.health = 0;
                oxen.userData.lifecycleState = 'dead';
                oxen.userData._huntedByPack = null;

                // Remove from herd
                if (GameState.balubanOxenHerds) {
                    GameState.balubanOxenHerds.forEach(function(herd) {
                        var oIdx = herd.members.indexOf(oxen);
                        if (oIdx > -1) herd.members.splice(oIdx, 1);
                        if (herd.leader === oxen) {
                            var males = herd.members.filter(function(m) {
                                return m.userData.gender === 'male' && !m.userData.isBaby;
                            });
                            if (males.length > 0) {
                                herd.leader = males[0];
                                males[0].userData.isLeader = true;
                                rebuildOxenModel(males[0], true);
                            }
                        }
                    });
                }

                convertToCarcass(oxen);
                pack.currentHunt.carcass = oxen;
                pack.currentHunt.state = 'eating';
                pack.currentHunt.eatTimer = 60;
                pack.currentHunt._oxenDead = true;

                // All hunters eat
                pack.members.forEach(function(m) {
                    if (m.userData.lifecycleState === 'hunting_chase') {
                        m.userData.lifecycleState = 'eating';
                    }
                });

                console.log('Oxen falls! Pack feasts on the carcass.');
            }
        }
    }

    /**
     * Outcome C: Flawless kill — no dog deaths, clean neck bite, fast takedown.
     */
    function playOutcomeC_FlawlessKill(pack, oxen, delta) {
        var t = pack.currentHunt.outcomeTimer;

        // Phase 1 (0-1.5s): Leader gets clean neck bite immediately
        if (t < 1.5) {
            if (pack.leader && pack.leader.parent) {
                var lx = oxen.position.x - pack.leader.position.x;
                var lz = oxen.position.z - pack.leader.position.z;
                var lDist = Math.sqrt(lx * lx + lz * lz);

                if (lDist > 1) {
                    pack.leader.position.x += (lx / lDist) * 14 * delta;
                    pack.leader.position.z += (lz / lDist) * 14 * delta;
                    pack.leader.rotation.y = -Math.atan2(lz, lx);
                    pack.leader.userData.currentMoveSpeed = 14;
                } else {
                    if (!pack.currentHunt._leaderAttached) {
                        pack.currentHunt._leaderAttached = true;
                        console.log('FLAWLESS! Leader lands a clean neck bite!');
                    }
                    pack.leader.position.x = oxen.position.x + 0.8;
                    pack.leader.position.z = oxen.position.z;
                }
            }

            // All other dogs rush in
            pack.members.forEach(function(m) {
                if (m !== pack.leader && m.userData.lifecycleState === 'hunting_chase') {
                    var mx = oxen.position.x - m.position.x;
                    var mz = oxen.position.z - m.position.z;
                    var mDist = Math.sqrt(mx * mx + mz * mz);
                    if (mDist > 1.5) {
                        m.position.x += (mx / mDist) * 12 * delta;
                        m.position.z += (mz / mDist) * 12 * delta;
                        m.rotation.y = -Math.atan2(mz, mx);
                        m.userData.currentMoveSpeed = 12;
                    }
                }
            });

            // Fast HP drain
            oxen.userData.health -= 20 * delta;
        }

        // Phase 2 (1.5s+): Fast takedown → carcass → eat
        if (t >= 1.5) {
            if (!pack.currentHunt._oxenDead) {
                oxen.userData.health = 0;
                oxen.userData.lifecycleState = 'dead';
                oxen.userData._huntedByPack = null;

                // Remove from herd
                if (GameState.balubanOxenHerds) {
                    GameState.balubanOxenHerds.forEach(function(herd) {
                        var oIdx = herd.members.indexOf(oxen);
                        if (oIdx > -1) herd.members.splice(oIdx, 1);
                        if (herd.leader === oxen) {
                            var males = herd.members.filter(function(m) {
                                return m.userData.gender === 'male' && !m.userData.isBaby;
                            });
                            if (males.length > 0) {
                                herd.leader = males[0];
                                males[0].userData.isLeader = true;
                                rebuildOxenModel(males[0], true);
                            }
                        }
                    });
                }

                convertToCarcass(oxen);
                pack.currentHunt.carcass = oxen;
                pack.currentHunt.state = 'eating';
                pack.currentHunt.eatTimer = 60;
                pack.currentHunt._oxenDead = true;

                pack.members.forEach(function(m) {
                    if (m.userData.lifecycleState === 'hunting_chase') {
                        m.userData.lifecycleState = 'eating';
                    }
                });

                console.log('FLAWLESS KILL! No dogs lost. Pack feasts.');
            }
        }
    }

    /**
     * End a snow caninon hunt — reset all members to following.
     */
    function endSnowCaninonHunt(pack) {
        // Check if den has pups — dogs should carry meat back
        var hasDenPups = pack.den && pack.den.state === 'active' && pack.den.occupants && pack.den.occupants.length > 0;

        pack.members.forEach(function(m) {
            if (m.userData.lifecycleState === 'hunting_chase' || m.userData.lifecycleState === 'eating') {
                if (hasDenPups && m.userData.lifecycleState === 'eating' && !m.userData.isBaby) {
                    // Carry meat back to den!
                    m.userData.lifecycleState = 'carrying_meat';
                    m.userData.currentMoveSpeed = 0;

                    // Attach visual meat chunk to head
                    var dogModel = m.children[0];
                    if (dogModel && dogModel.userData && dogModel.userData.parts && dogModel.userData.parts.headGroup) {
                        var meatChunk = new THREE.Mesh(
                            new THREE.SphereGeometry(0.12, 6, 6),
                            new THREE.MeshStandardMaterial({ color: 0x8B2500, roughness: 0.8 })
                        );
                        meatChunk.position.set(0.15, -0.05, 0); // In front of mouth
                        meatChunk.name = 'meatChunk';
                        dogModel.userData.parts.headGroup.add(meatChunk);
                    }
                } else {
                    m.userData.lifecycleState = 'following';
                    m.userData.currentMoveSpeed = 0;
                }

                // Reset neck rotation
                var model = m.children[0];
                if (model && model.userData && model.userData.parts && model.userData.parts.neckGroup) {
                    model.userData.parts.neckGroup.rotation.z = 0;
                }
            }
        });
        pack.currentHunt = null;
        console.log('Snow Caninon hunt ended.' + (hasDenPups ? ' Dogs carrying meat to den!' : ''));
    }

    // ========================================================================
    // SNOW CANINON MATING
    // ========================================================================
    /**
     * Male tries to mate with a female in the same pack.
     * Conditions: prey abundant (deer within 50 units) and no other pregnant female in pack.
     */
    function triggerSnowCaninonMating(pack) {
        // Check conditions: prey anywhere in biome (deer exist)
        var hasPrey = false;
        GameState.enemies.forEach(function(e) {
            if (e.userData.type === 'deericus_iricus' && e.parent) {
                hasPrey = true;
            }
        });
        if (!hasPrey) return;

        // Check conditions: no other pregnant female in pack
        var alreadyPregnant = pack.members.some(function(m) {
            return m.userData.isPregnant;
        });
        if (alreadyPregnant) return;

        // Find eligible female (not pregnant, not mother, not baby)
        var females = pack.members.filter(function(m) {
            return m.userData.gender === 'female' && !m.userData.isBaby
                && !m.userData.isPregnant && !m.userData.isMother;
        });
        if (females.length === 0) return;

        // Pick random female
        var female = females[Math.floor(Math.random() * females.length)];

        // Make her pregnant!
        female.userData.isPregnant = true;
        female.userData.gestationTimer = 60; // 1 minute gestation

        // Rebuild model with pregnancy belly
        var femaleData = ENEMIES.find(function(e) { return e.id === 'snow_caninon_female'; });
        if (femaleData) {
            // Remove old model
            while (female.children.length > 0) {
                female.remove(female.children[0]);
            }
            // Build new model with pregnancy
            var colors = {};
            for (var key in femaleData.colors) {
                var val = femaleData.colors[key];
                colors[key] = typeof val === 'string' ? parseInt(val.replace('#', ''), 16) : val;
            }
            var newModel = buildSnowCaninonModel(colors, false, false, true);
            female.add(newModel);
        }

        console.log('Snow Caninon mating! Female is now pregnant (1 min gestation). Female at:', female.position.x.toFixed(1), female.position.z.toFixed(1));
    }

    // ========================================================================
    // SNOW CANINON DEN DIGGING + BIRTH (Phase 3)
    // ========================================================================
    /**
     * When a female's gestation is complete, the whole pack digs a den.
     * After digging (10 seconds), she gives birth to 2 pups.
     */
    function initiateSnowCaninonDenDigging(mother, pack) {
        if (pack.den) return; // Already have a den

        // Pick den location near pack's home
        var denX = pack.homePosition.x + (Math.random() - 0.5) * 15;
        var denZ = pack.homePosition.z + (Math.random() - 0.5) * 15;

        // All pack members move to dig site
        pack.members.forEach(function(dog) {
            if (!dog.userData.isBaby) {
                dog.userData.lifecycleState = 'digging_den';
                dog.userData.digTarget = { x: denX, z: denZ };
            }
        });

        // Create den (starts tiny, grows during digging)
        var den = createSnowCaninonDen(denX, denZ, pack.id, mother.userData.entityId);
        pack.den = den;
        pack.digTimer = 10; // 10 seconds of digging
        pack.diggingMother = mother;

        console.log('Snow Caninon pack digging den at (' + denX.toFixed(1) + ', ' + denZ.toFixed(1) + ')');
    }

    /**
     * Create a Snow Caninon den — hole in the ground (like deer burrow but bigger).
     */
    function createSnowCaninonDen(x, z, packId, motherId) {
        var denGroup = new THREE.Group();

        // Snow mound around the entrance
        var moundGeo = new THREE.CylinderGeometry(3, 3.5, 0.8, 12);
        var moundMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.9 });
        var mound = new THREE.Mesh(moundGeo, moundMat);
        mound.position.y = 0.4;
        mound.castShadow = true;
        denGroup.add(mound);

        // Dark entrance hole (bigger than deer burrow)
        var holeGeo = new THREE.CylinderGeometry(1.0, 0.8, 0.8, 10);
        var holeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1.0 });
        var hole = new THREE.Mesh(holeGeo, holeMat);
        hole.position.set(1.5, 0.3, 0);
        hole.rotation.x = Math.PI / 6;
        denGroup.add(hole);

        // Dug earth ring
        var ringGeo = new THREE.TorusGeometry(2.5, 0.25, 6, 16);
        var ringMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 1.0 });
        var ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.15;
        denGroup.add(ring);

        var terrainY = Environment.getTerrainHeight(x, z);
        denGroup.position.set(x, terrainY + 0.1, z); // Slight elevation so it sits on snow
        denGroup.scale.set(0.1, 0.1, 0.1); // Starts tiny — grows during digging

        GameState.scene.add(denGroup);

        var denData = {
            mesh: denGroup,
            position: { x: x, z: z },
            entrancePosition: { x: x + 1.5, z: z },
            id: 'caninon_den_' + Date.now(),
            packId: packId,
            motherId: motherId,
            occupants: [],
            state: 'building', // building -> active -> removed
            createdTime: GameState.timeElapsed || 0
        };

        if (!GameState.snowCaninonDens) GameState.snowCaninonDens = [];
        GameState.snowCaninonDens.push(denData);

        return denData;
    }

    /**
     * Spawn 2 snow caninon pups at den entrance.
     */
    function spawnSnowCaninonPups(mother, pack, den) {
        for (var i = 0; i < 2; i++) {
            var isMale = Math.random() < 0.5;

            // Pup colors: lighter versions
            // Male pup = dark grey (like adult female), Female pup = light grey
            var pupColors = {};
            if (isMale) {
                pupColors = {
                    body: 0x3a3a3a, belly: 0x4a4a4a, chest: 0x333333,
                    patches: 0x2a2a2a, muzzle: 0x2a2a2a, nose: 0x000000,
                    eyes: 0xCC8800, eyeGlow: 0x221100, ears: 0x3a3a3a,
                    earInner: 0x4a3030, legs: 0x2a2a2a, paws: 0x3a3a3a,
                    tail: 0x3a3a3a, tailTip: 0x4a4a4a
                };
            } else {
                pupColors = {
                    body: 0x6a6a6a, belly: 0x7a7a7a, chest: 0x5a5a5a,
                    patches: 0x555555, muzzle: 0x555555, nose: 0x1a1a1a,
                    eyes: 0xCC8800, eyeGlow: 0x221100, ears: 0x6a6a6a,
                    earInner: 0x7a5050, legs: 0x555555, paws: 0x6a6a6a,
                    tail: 0x6a6a6a, tailTip: 0x7a7a7a
                };
            }

            var pupModel = buildSnowCaninonModel(pupColors, true, false, false);
            var pup = new THREE.Group();
            pup.add(pupModel);
            // NOTE: Don't scale parent group — buildSnowCaninonModel already uses s=0.5 for babies

            var px = den.entrancePosition.x + (Math.random() - 0.5) * 2;
            var pz = den.entrancePosition.z + (Math.random() - 0.5) * 2;
            var terrainY = Environment.getTerrainHeight(px, pz);
            pup.position.set(px, terrainY + 0.2, pz);

            pup.userData = {
                id: isMale ? 'snow_caninon_male' : 'snow_caninon_female',
                type: 'snow_caninon',
                entityId: 'snowcaninon_pup_' + Date.now() + '_' + Math.random(),
                gender: isMale ? 'male' : 'female',
                isLeader: false,
                isBaby: true,
                speed: 5,
                chaseSpeed: 8,
                damage: 3,
                radius: 0.3,
                health: 12,
                maxHealth: 12,
                groundY: 0.2,
                friendly: true,
                defensive: false,
                minimapColor: isMale ? '#3a3a3a' : '#6a6a6a',
                ignoreGravity: true,

                // Pack properties
                packId: pack.id,
                isPackAnimal: true,

                // Pup properties
                mother: mother,
                den: den,
                maturityTime: (GameState.timeElapsed || 0) + 180, // 3 min to mature

                // Behavior
                lifecycleState: 'pup',
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,
                walkPhase: Math.random() * Math.PI * 2,
                currentMoveSpeed: 0
            };

            GameState.enemies.push(pup);
            GameState.scene.add(pup);
            pack.members.push(pup);
            mother.userData.pups.push(pup);

            console.log('Snow Caninon pup born! (' + (isMale ? 'male - dark grey' : 'female - light grey') + ')');
        }
    }

    // ========================================================================
    // SNOW BALUBAN OXEN — SPAWN + BEHAVIOR (SNOWY MOUNTAINS)
    // ========================================================================
    /**
     * Spawn a herd of Snow Baluban Oxen (musk oxen) in the southern snowy mountains.
     * @param {number} count - Total herd members (18 = 6M + 12F)
     * @param {number} herdIndex - Which herd (0 or 1), used for positioning
     */
    function spawnBalubanOxenHerd(count, herdIndex) {
        var maleData = ENEMIES.find(function(e) { return e.id === 'baluban_oxen_male'; });
        var femaleData = ENEMIES.find(function(e) { return e.id === 'baluban_oxen_female'; });
        if (!maleData || !femaleData) return;

        // Position: south of snowy biome (positive Z), spread apart
        var worldSize = SETTINGS.WORLD_SIZE;
        var herdCenterX = (herdIndex === 0 ? -0.15 : 0.2) * worldSize;
        var herdCenterZ = 0.3 * worldSize + herdIndex * 30;

        var herdId = 'oxen_herd_' + Date.now() + '_' + herdIndex;
        var herdMembers = [];
        var leader = null;

        var numMales = 6;
        var numFemales = count - numMales; // 12

        // Helper: convert color strings to hex numbers
        function convColors(data) {
            var c = {};
            for (var k in data.colors) {
                var v = data.colors[k];
                c[k] = typeof v === 'string' ? parseInt(v.replace('#', ''), 16) : v;
            }
            return c;
        }

        // Spawn males (first = leader)
        for (var i = 0; i < numMales; i++) {
            var mx = herdCenterX + (Math.random() - 0.5) * 20;
            var mz = herdCenterZ + (Math.random() - 0.5) * 20;
            var isLeader = (i === 0);

            var mcolors = convColors(maleData);
            var hornScale = isLeader ? 1.5 : maleData.hornSize || 1;
            var mmodel = buildBalubanOxenModel(mcolors, true, hornScale, false, false);
            var male = new THREE.Group();
            male.add(mmodel);

            var msize = maleData.size * (isLeader ? 1.1 : 1);
            male.scale.set(msize, msize, msize);

            var mterrainY = Environment.getTerrainHeight(mx, mz);
            male.position.set(mx, mterrainY + maleData.groundY, mz);

            male.userData = {
                id: isLeader ? 'baluban_oxen_leader' : 'baluban_oxen_male',
                type: 'baluban_oxen',
                entityId: 'oxen_' + Date.now() + '_' + Math.random(),
                gender: 'male',
                isLeader: isLeader,
                speed: maleData.speed + Math.random() * (maleData.speedVariation || 0),
                chaseSpeed: maleData.chaseSpeed || 7,
                damage: maleData.damage * (isLeader ? 1.1 : 1),
                radius: maleData.radius,
                health: maleData.health * (isLeader ? 1.1 : 1),
                maxHealth: maleData.health * (isLeader ? 1.1 : 1),
                groundY: maleData.groundY,
                friendly: true,
                defensive: true,
                minimapColor: maleData.minimapColor,
                ignoreGravity: true,

                // Herd properties
                herdId: herdId,
                isHerdAnimal: true,
                isBaby: false,
                leader: null, // Set below

                // Mating
                matingTimer: 60 + Math.random() * 120,

                // Behavior
                lifecycleState: 'grazing',
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,
                walkPhase: Math.random() * Math.PI * 2,
                currentMoveSpeed: 0,
                hunger: Math.random() * 30,
                grazeTimer: 5 + Math.random() * 8
            };

            GameState.enemies.push(male);
            GameState.scene.add(male);
            herdMembers.push(male);

            if (isLeader) {
                leader = male;
            }
        }

        // Spawn females
        for (var j = 0; j < numFemales; j++) {
            var fx = herdCenterX + (Math.random() - 0.5) * 20;
            var fz = herdCenterZ + (Math.random() - 0.5) * 20;

            var fcolors = convColors(femaleData);
            var fmodel = buildBalubanOxenModel(fcolors, true, femaleData.hornSize || 0.6, false, false);
            var female = new THREE.Group();
            female.add(fmodel);
            female.scale.set(femaleData.size, femaleData.size, femaleData.size);

            var fterrainY = Environment.getTerrainHeight(fx, fz);
            female.position.set(fx, fterrainY + femaleData.groundY, fz);

            female.userData = {
                id: 'baluban_oxen_female',
                type: 'baluban_oxen',
                entityId: 'oxen_' + Date.now() + '_' + Math.random(),
                gender: 'female',
                isLeader: false,
                speed: femaleData.speed + Math.random() * (femaleData.speedVariation || 0),
                chaseSpeed: femaleData.chaseSpeed || 7,
                damage: femaleData.damage,
                radius: femaleData.radius,
                health: femaleData.health,
                maxHealth: femaleData.health,
                groundY: femaleData.groundY,
                friendly: true,
                defensive: true,
                minimapColor: femaleData.minimapColor,
                ignoreGravity: true,

                // Herd properties
                herdId: herdId,
                isHerdAnimal: true,
                isBaby: false,
                leader: null,

                // Female-specific
                canGetPregnant: true,
                isPregnant: false,
                gestationTimer: 0,
                children: [],

                // Behavior
                lifecycleState: 'grazing',
                wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
                wanderTime: 0,
                walkPhase: Math.random() * Math.PI * 2,
                currentMoveSpeed: 0,
                hunger: Math.random() * 30,
                grazeTimer: 5 + Math.random() * 8
            };

            GameState.enemies.push(female);
            GameState.scene.add(female);
            herdMembers.push(female);
        }

        // Set leader reference for all
        if (leader) {
            herdMembers.forEach(function(m) { m.userData.leader = leader; });
        }

        // Store herd
        if (!GameState.balubanOxenHerds) GameState.balubanOxenHerds = [];
        GameState.balubanOxenHerds.push({
            id: herdId,
            leader: leader,
            members: herdMembers,
            maxSize: 40,
            matingTimer: 0
        });

        console.log('Spawned Baluban Oxen herd: ' + herdMembers.length + ' members (6M + 12F) at (' +
            herdCenterX.toFixed(0) + ', ' + herdCenterZ.toFixed(0) + ')');
    }

    // ========================================================================
    // BALUBAN OXEN BEHAVIOR UPDATE
    // ========================================================================
    /**
     * Update all Baluban Oxen herds each frame.
     */
    function updateBalubanOxenBehavior(delta) {
        if (!GameState.balubanOxenHerds || GameState.balubanOxenHerds.length === 0) return;

        GameState.balubanOxenHerds.forEach(function(herd) {
            // Remove dead members
            herd.members = herd.members.filter(function(ox) {
                return ox.parent && ox.userData.health > 0;
            });
            if (herd.members.length === 0) return;

            // Promote new leader if needed
            if (!herd.leader || !herd.leader.parent || herd.leader.userData.health <= 0) {
                var newLeader = herd.members.find(function(m) { return m.userData.gender === 'male' && !m.userData.isBaby; });
                if (!newLeader) newLeader = herd.members.find(function(m) { return !m.userData.isBaby; });
                if (newLeader) {
                    herd.leader = newLeader;
                    newLeader.userData.isLeader = true;
                    herd.members.forEach(function(m) { m.userData.leader = newLeader; });
                }
            }

            // Update each member
            herd.members.forEach(function(ox) {
                if (!ox.parent || ox.userData.health <= 0) return;

                var state = ox.userData.lifecycleState;

                // Terrain Y update
                var terrainY = Environment.getTerrainHeight(ox.position.x, ox.position.z);
                ox.position.y = terrainY + (ox.userData.groundY || 0.55);

                if (state === 'grazing') {
                    updateOxenGrazing(ox, herd, delta);

                    // Pregnancy countdown (females)
                    if (ox.userData.isPregnant) {
                        ox.userData.gestationTimer -= delta;
                        if (ox.userData.gestationTimer <= 0) {
                            // Birth!
                            ox.userData.isPregnant = false;
                            rebuildOxenWithBelly(ox, false);
                            spawnBabyBalubanOxen(ox, herd);
                        }
                    }
                } else if (state === 'baby') {
                    updateOxenBaby(ox, herd, delta);

                    // Maturity check
                    var currentTime = GameState.timeElapsed || 0;
                    if (ox.userData.maturityTime && currentTime >= ox.userData.maturityTime) {
                        growBabyOxen(ox, herd);
                    }
                } else if (state === 'rutting_approach') {
                    updateOxenRuttingApproach(ox, delta);
                } else if (state === 'rutting_lock') {
                    updateOxenRuttingLock(ox, delta);
                } else if (state === 'seeking_mate') {
                    updateOxenSeekingMate(ox, delta);
                } else if (state === 'being_hunted') {
                    updateOxenBeingHunted(ox, delta);
                } else if (state === 'standoff') {
                    // Standoff handled at pack level (Phase 6)
                    ox.userData.currentMoveSpeed = 0;
                }

                // Walking animation (all visible oxen)
                if (ox.visible !== false) {
                    animateBalubanOxen(ox, delta);
                }
            });
        });
    }

    /**
     * Grazing state: leader wanders slowly, others follow within 50 units.
     * All oxen cycle through: idle wandering → seeking grass → eating → back to idle.
     */
    function updateOxenGrazing(ox, herd, delta) {
        var speed = ox.userData.speed;

        // ---- Hunger system ----
        if (ox.userData.hunger === undefined) ox.userData.hunger = 30;
        ox.userData.hunger += delta * 1.5; // Hunger builds over time
        if (ox.userData.hunger > 100) ox.userData.hunger = 100;

        // ---- Eating state: head down, eating grass ----
        if (ox.userData._isEating) {
            ox.userData.currentMoveSpeed = 0;
            ox.userData.grazeTimer -= delta;

            // Eat from grass tuft periodically
            if (ox.userData.currentGrass && ox.userData.currentGrass.userData.size > 0) {
                ox.userData._eatTick = (ox.userData._eatTick || 0) + delta;
                if (ox.userData._eatTick >= 0.5) {
                    ox.userData._eatTick = 0;
                    Environment.eatGrassTuft(ox.userData.currentGrass, ox);
                }
            }

            // Head-down animation (smooth)
            var oxModel = ox.children[0];
            if (oxModel && oxModel.userData.parts && oxModel.userData.parts.neckGroup) {
                var neckTarget = 0.6; // tilt down
                oxModel.userData.parts.neckGroup.rotation.z += (neckTarget - oxModel.userData.parts.neckGroup.rotation.z) * 0.05;
            }

            // Done eating?
            if (ox.userData.grazeTimer <= 0 || ox.userData.hunger < 15 ||
                !ox.userData.currentGrass || ox.userData.currentGrass.userData.size <= 0) {
                ox.userData._isEating = false;
                ox.userData.currentGrass = null;
                ox.userData.grazeTimer = 8 + Math.random() * 10;
            }
            return;
        }

        // ---- Seeking grass state ----
        if (ox.userData._seekingGrass) {
            var grass = ox.userData._targetGrass;
            if (!grass || grass.userData.size < 0.3) {
                ox.userData._seekingGrass = false;
                ox.userData._targetGrass = null;
                return;
            }

            var gdx = grass.position.x - ox.position.x;
            var gdz = grass.position.z - ox.position.z;
            var gDist = Math.sqrt(gdx * gdx + gdz * gdz);

            if (gDist < 1.5) {
                // Arrived at grass — start eating
                ox.userData._seekingGrass = false;
                ox.userData._isEating = true;
                ox.userData.currentGrass = grass;
                ox.userData.grazeTimer = 5 + Math.random() * 8;
                ox.userData._eatTick = 0;
            } else {
                // Walk toward grass (but not too far from leader)
                var walkSpeed = speed * 0.4;
                ox.position.x += (gdx / gDist) * walkSpeed * delta;
                ox.position.z += (gdz / gDist) * walkSpeed * delta;
                ox.rotation.y = -Math.atan2(gdz, gdx);
                ox.userData.currentMoveSpeed = walkSpeed;

                // If grass is >60 from leader, give up
                if (ox.userData.leader && ox.userData.leader.parent) {
                    var lx = ox.userData.leader.position.x - grass.position.x;
                    var lz = ox.userData.leader.position.z - grass.position.z;
                    if (lx * lx + lz * lz > 60 * 60) {
                        ox.userData._seekingGrass = false;
                        ox.userData._targetGrass = null;
                    }
                }
            }
            return;
        }

        // ---- Hungry? Seek grass ----
        if (ox.userData.hunger > 60) {
            var nearestGrass = findNearestGrassTuft(ox);
            if (nearestGrass) {
                ox.userData._seekingGrass = true;
                ox.userData._targetGrass = nearestGrass;
                return;
            }
        }

        // ---- Normal wandering / following ----
        // Raise head back up (smooth)
        var oxModel2 = ox.children[0];
        if (oxModel2 && oxModel2.userData.parts && oxModel2.userData.parts.neckGroup) {
            oxModel2.userData.parts.neckGroup.rotation.z *= 0.95; // Smoothly return to neutral
        }

        if (ox.userData.isLeader) {
            // Leader: wander slowly
            ox.userData.wanderTime -= delta;
            if (ox.userData.wanderTime <= 0) {
                ox.userData.wanderDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
                ox.userData.wanderTime = 10 + Math.random() * 15;
            }

            var moveSpeed = speed * 0.3;
            ox.position.x += ox.userData.wanderDir.x * moveSpeed * delta;
            ox.position.z += ox.userData.wanderDir.z * moveSpeed * delta;
            ox.userData.currentMoveSpeed = moveSpeed;

            // Stay in the southern half of the biome
            var worldSize = SETTINGS.WORLD_SIZE;
            var halfWorld = worldSize / 2;
            if (ox.position.x < -halfWorld + 20 || ox.position.x > halfWorld - 20 ||
                ox.position.z < 0 || ox.position.z > halfWorld - 20) {
                ox.userData.wanderDir.set(-ox.position.x * 0.01, 0, (0.3 * worldSize - ox.position.z) * 0.01).normalize();
                ox.userData.wanderTime = 5;
            }
        } else {
            // Non-leaders: stay within 50 units of leader
            var leader = ox.userData.leader;
            if (!leader || !leader.parent) {
                ox.userData.currentMoveSpeed = 0;
                return;
            }

            var ldx = leader.position.x - ox.position.x;
            var ldz = leader.position.z - ox.position.z;
            var lDist = Math.sqrt(ldx * ldx + ldz * ldz);

            if (lDist > 50) {
                var sprintSpeed = speed * 1.5;
                ox.position.x += (ldx / lDist) * sprintSpeed * delta;
                ox.position.z += (ldz / lDist) * sprintSpeed * delta;
                ox.userData.currentMoveSpeed = sprintSpeed;
            } else if (lDist > 25) {
                ox.position.x += (ldx / lDist) * speed * 0.5 * delta;
                ox.position.z += (ldz / lDist) * speed * 0.5 * delta;
                ox.userData.currentMoveSpeed = speed * 0.5;
            } else {
                ox.userData.wanderTime -= delta;
                if (ox.userData.wanderTime <= 0) {
                    ox.userData.wanderDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
                    ox.userData.wanderTime = 5 + Math.random() * 10;
                }
                var wanderSpeed = speed * 0.2;
                ox.position.x += ox.userData.wanderDir.x * wanderSpeed * delta;
                ox.position.z += ox.userData.wanderDir.z * wanderSpeed * delta;
                ox.userData.currentMoveSpeed = wanderSpeed;
            }
        }

        // Face movement direction
        if (ox.userData.currentMoveSpeed > 0.3) {
            var targetRot = -Math.atan2(ox.userData.wanderDir.z, ox.userData.wanderDir.x);
            ox.rotation.y += (targetRot - ox.rotation.y) * 0.05;
        }
    }

    /**
     * Baby oxen follow their mother closely.
     */
    function updateOxenBaby(baby, herd, delta) {
        var mother = baby.userData.mother;
        if (!mother || !mother.parent || mother.userData.health <= 0) {
            // Orphan — follow leader instead
            baby.userData.lifecycleState = 'grazing';
            return;
        }

        var mdx = mother.position.x - baby.position.x;
        var mdz = mother.position.z - baby.position.z;
        var mDist = Math.sqrt(mdx * mdx + mdz * mdz);

        if (mDist > 4) {
            // Catch up to mother
            var catchSpeed = baby.userData.speed * 1.2;
            baby.position.x += (mdx / mDist) * catchSpeed * delta;
            baby.position.z += (mdz / mDist) * catchSpeed * delta;
            baby.userData.currentMoveSpeed = catchSpeed;
        } else if (mDist > 2) {
            // Walk toward mother
            baby.position.x += (mdx / mDist) * baby.userData.speed * 0.5 * delta;
            baby.position.z += (mdz / mDist) * baby.userData.speed * 0.5 * delta;
            baby.userData.currentMoveSpeed = baby.userData.speed * 0.5;
        } else {
            // Close — idle near mother
            baby.userData.currentMoveSpeed = 0;
        }

        // Face direction of movement
        if (baby.userData.currentMoveSpeed > 0.2) {
            baby.rotation.y = -Math.atan2(mdz, mdx);
        }
    }

    /**
     * Being hunted: oxen flees from the pack, takes nip damage, kicks back on leg bites.
     * Transitions to 'standoff' when the pack's nipping timer expires or HP is low.
     */
    function updateOxenBeingHunted(ox, delta) {
        var pack = ox.userData._huntedByPack;
        if (!pack || !pack.currentHunt || !pack.currentHunt.target) {
            // Hunt ended — return to grazing
            ox.userData.lifecycleState = 'grazing';
            ox.userData._huntedByPack = null;
            ox.userData._fleeDir = null;
            ox.userData._legBitten = false;
            return;
        }

        // Determine flee direction — away from the 'behind' dog
        var behindDog = null;
        pack.members.forEach(function(m) {
            if (m.userData.huntRole === 'behind' && m.userData.lifecycleState === 'hunting_chase') {
                behindDog = m;
            }
        });

        if (behindDog) {
            // Flee away from behind dog
            var fx = ox.position.x - behindDog.position.x;
            var fz = ox.position.z - behindDog.position.z;
            var fDist = Math.sqrt(fx * fx + fz * fz);
            if (fDist > 0.1) {
                ox.userData._fleeDir = { x: fx / fDist, z: fz / fDist };
            }
        }

        // Apply speed — normal or leg-bitten slow
        var baseSpeed = ox.userData.speed || 4;
        var moveSpeed = baseSpeed * 1.4; // Panicked sprint

        // Leg bite slowdown
        if (ox.userData._legBitten) {
            moveSpeed = baseSpeed * 0.3; // Dramatic slow when bitten
            ox.userData._legBiteTimer -= delta;

            // Kick-back animation — rear legs kick outward
            var oxModel = ox.children[0] || ox;
            if (oxModel.userData && oxModel.userData.legs) {
                oxModel.userData.legs.forEach(function(leg) {
                    if (!leg.isFront) {
                        leg.group.rotation.z = -0.5; // Kick backward
                    }
                });
            }

            if (ox.userData._legBiteTimer <= 0) {
                ox.userData._legBitten = false;
                // Reset leg rotation
                var resetModel = ox.children[0] || ox;
                if (resetModel.userData && resetModel.userData.legs) {
                    resetModel.userData.legs.forEach(function(leg) {
                        if (!leg.isFront) {
                            leg.group.rotation.z = 0;
                        }
                    });
                }
            }
        }

        ox.userData.currentMoveSpeed = moveSpeed;

        // Move in flee direction
        var fleeDir = ox.userData._fleeDir;
        if (fleeDir) {
            ox.position.x += fleeDir.x * moveSpeed * delta;
            ox.position.z += fleeDir.z * moveSpeed * delta;
            ox.rotation.y = -Math.atan2(fleeDir.z, fleeDir.x);
        }

        // Terrain height
        var terrainY = Environment.getTerrainHeight(ox.position.x, ox.position.z);
        ox.position.y = terrainY + (ox.userData.groundY || 0.55);

        // Keep within world bounds
        var half = (window.WORLD_SIZE || 200) / 2;
        ox.position.x = Math.max(-half + 5, Math.min(half - 5, ox.position.x));
        ox.position.z = Math.max(-half + 5, Math.min(half - 5, ox.position.z));

        // Nipping timer countdown (pack level — checked once per frame via the first hunted oxen)
        if (pack.currentHunt.state === 'nipping') {
            pack.currentHunt.nippingTimer -= delta;

            var hpPercent = ox.userData.health / (ox.userData.maxHealth || 60);
            if (pack.currentHunt.nippingTimer <= 0 || hpPercent < 0.5) {
                // Transition to standoff
                pack.currentHunt.state = 'standoff';
                ox.userData.lifecycleState = 'standoff';
                ox.userData.currentMoveSpeed = 0;
                console.log('Oxen enters STANDOFF! HP: ' + ox.userData.health + '/' + (ox.userData.maxHealth || 60));
            }
        }
    }

    /**
     * Walking animation for Baluban Oxen — heavy, lumbering gait.
     */
    function animateBalubanOxen(ox, delta) {
        var oxModel = ox;
        if (!ox.userData.legs && ox.children.length > 0) oxModel = ox.children[0];
        if (!oxModel.userData || !oxModel.userData.legs) return;

        var legs = oxModel.userData.legs;
        var moveSpeed = ox.userData.currentMoveSpeed || 0;

        if (!ox.userData._walkCycle) ox.userData._walkCycle = 0;

        if (moveSpeed > 0.3) {
            // Walking — slow, heavy gait
            ox.userData._walkCycle += delta * moveSpeed * 2.0;
            var cycle = ox.userData._walkCycle;

            legs.forEach(function(leg) {
                var phase = leg.isFront ? 0 : Math.PI;
                var sidePhase = leg.side === 'right' ? Math.PI : 0;
                var legCycle = cycle + phase + sidePhase;

                // Forward/backward swing on Z axis (faces +X)
                leg.group.rotation.z = Math.sin(legCycle) * 0.2; // Smaller swing for heavy animal
                if (leg.lowerLegGroup) {
                    leg.lowerLegGroup.rotation.z = Math.max(0, Math.sin(legCycle + 0.5)) * 0.15;
                }
            });

            // Heavy body bob
            oxModel.position.y = Math.sin(ox.userData._walkCycle * 2) * 0.01;
        } else {
            // Idle — return to neutral
            legs.forEach(function(leg) {
                leg.group.rotation.z *= 0.9;
                if (leg.lowerLegGroup) leg.lowerLegGroup.rotation.z *= 0.9;
            });
            oxModel.position.y *= 0.9;
        }

        // Tail gentle sway
        if (oxModel.userData.parts && oxModel.userData.parts.tailGroup) {
            oxModel.userData.parts.tailGroup.rotation.y = Math.sin(Date.now() * 0.002) * 0.15;
        }
    }

    // ========================================================================
    // BALUBAN OXEN MATING + RUTTING (Phase 3)
    // ========================================================================

    /**
     * Trigger mating season for all oxen herds.
     * Males compete for females through horn-locking ruts.
     */
    function triggerBalubanOxenMating() {
        if (!GameState.balubanOxenHerds) return;

        GameState.balubanOxenHerds.forEach(function(herd) {
            if (herd.members.length < 3) return;

            // Initialize female ownership — leader gets more
            initializeOxenFemaleOwnership(herd);

            // Find challenger (male with fewest females)
            var males = herd.members.filter(function(m) {
                return m.userData.gender === 'male' && !m.userData.isBaby &&
                    m.userData.lifecycleState === 'grazing';
            });
            if (males.length < 2) return;

            // Count females per male
            males.forEach(function(m) {
                m.userData._femaleCount = 0;
            });
            herd.members.forEach(function(f) {
                if (f.userData.owner) f.userData.owner.userData._femaleCount =
                    (f.userData.owner.userData._femaleCount || 0) + 1;
            });

            // Sort: males with fewest females are most eager
            males.sort(function(a, b) { return (a.userData._femaleCount || 0) - (b.userData._femaleCount || 0); });

            var challenger = males[0];
            if (!challenger || challenger.userData.isLeader) return; // Leader won't challenge himself

            // Find a female to fight over (preferably from another male)
            var targetFemale = herd.members.find(function(f) {
                return f.userData.gender === 'female' && !f.userData.isBaby &&
                    !f.userData.isPregnant && f.userData.owner &&
                    f.userData.owner !== challenger;
            });
            if (!targetFemale) return;

            var defender = targetFemale.userData.owner;
            if (!defender || !defender.parent || defender.userData.isBaby) return;

            // Start the rut!
            challenger.userData.lifecycleState = 'rutting_approach';
            challenger.userData.ruttingRival = defender;
            challenger.userData.ruttingFemale = targetFemale;
            challenger.userData.isChallenger = true;

            defender.userData.lifecycleState = 'rutting_approach';
            defender.userData.ruttingRival = challenger;
            defender.userData.ruttingFemale = targetFemale;
            defender.userData.isChallenger = false;

            console.log('Baluban Oxen rutting! Challenger vs ' + (defender.userData.isLeader ? 'Leader' : 'Male'));
        });
    }

    /**
     * Distribute females among males for breeding ownership.
     */
    function initializeOxenFemaleOwnership(herd) {
        var males = herd.members.filter(function(m) {
            return m.userData.gender === 'male' && !m.userData.isBaby;
        });
        var females = herd.members.filter(function(f) {
            return f.userData.gender === 'female' && !f.userData.isBaby;
        });
        if (males.length === 0) return;

        // Leader gets ~50% of females
        var leader = herd.leader;
        var leaderShare = Math.ceil(females.length * 0.5);
        var otherMales = males.filter(function(m) { return m !== leader; });

        females.forEach(function(f, idx) {
            if (idx < leaderShare) {
                f.userData.owner = leader;
            } else if (otherMales.length > 0) {
                f.userData.owner = otherMales[(idx - leaderShare) % otherMales.length];
            }
        });
    }

    /**
     * Rutting approach: two males walk toward each other.
     */
    function updateOxenRuttingApproach(ox, delta) {
        var rival = ox.userData.ruttingRival;
        if (!rival || !rival.parent || rival.userData.health <= 0) {
            ox.userData.lifecycleState = 'grazing';
            ox.userData.ruttingRival = null;
            return;
        }

        var dx = rival.position.x - ox.position.x;
        var dz = rival.position.z - ox.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        ox.rotation.y = -Math.atan2(dz, dx);
        ox.userData.currentMoveSpeed = ox.userData.speed * 0.6;

        if (dist > 3) {
            ox.position.x += (dx / dist) * ox.userData.speed * 0.6 * delta;
            ox.position.z += (dz / dist) * ox.userData.speed * 0.6 * delta;
        } else {
            // Close enough — lock horns!
            ox.userData.lifecycleState = 'rutting_lock';
            ox.userData.ruttingTimer = 10 + Math.random() * 5;
            ox.userData.ruttingPushPhase = 0;

            if (rival.userData.lifecycleState === 'rutting_approach') {
                rival.userData.lifecycleState = 'rutting_lock';
                rival.userData.ruttingTimer = ox.userData.ruttingTimer;
                rival.userData.ruttingPushPhase = 0;
            }
        }
    }

    /**
     * Rutting lock: horns locked, pushing back and forth.
     * Only the challenger processes the logic to avoid double-counting.
     */
    function updateOxenRuttingLock(ox, delta) {
        if (!ox.userData.isChallenger) {
            ox.userData.currentMoveSpeed = 0;
            return; // Defender waits for challenger logic
        }

        var rival = ox.userData.ruttingRival;
        if (!rival || !rival.parent) {
            ox.userData.lifecycleState = 'grazing';
            return;
        }

        ox.userData.ruttingTimer -= delta;
        ox.userData.ruttingPushPhase += delta * 3;

        // Push animation
        var pushAmount = Math.sin(ox.userData.ruttingPushPhase) * 0.3;
        var dx = rival.position.x - ox.position.x;
        var dz = rival.position.z - ox.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.1) dist = 0.1;

        var pushDirX = dx / dist;
        var pushDirZ = dz / dist;

        ox.position.x += pushDirX * pushAmount * delta * 2;
        ox.position.z += pushDirZ * pushAmount * delta * 2;
        rival.position.x -= pushDirX * pushAmount * delta * 2;
        rival.position.z -= pushDirZ * pushAmount * delta * 2;

        // Face each other
        ox.rotation.y = -Math.atan2(dz, dx);
        rival.rotation.y = -Math.atan2(-dz, -dx);

        ox.userData.currentMoveSpeed = 0;
        rival.userData.currentMoveSpeed = 0;

        // Head strain animation
        var oxModel = ox.children[0];
        var rivalModel = rival.children[0];
        if (oxModel && oxModel.userData.parts && oxModel.userData.parts.neckGroup) {
            oxModel.userData.parts.neckGroup.rotation.z = 0.4 + pushAmount * 0.3;
            oxModel.position.y = Math.abs(Math.sin(ox.userData.ruttingPushPhase * 2)) * 0.05;
        }
        if (rivalModel && rivalModel.userData.parts && rivalModel.userData.parts.neckGroup) {
            rivalModel.userData.parts.neckGroup.rotation.z = 0.4 - pushAmount * 0.3;
            rivalModel.position.y = Math.abs(Math.sin(ox.userData.ruttingPushPhase * 2 + Math.PI)) * 0.05;
        }

        // Battle resolved?
        if (ox.userData.ruttingTimer <= 0) {
            // Winner: challenger has 50% chance vs regular, 40% vs leader
            var winChance = rival.userData.isLeader ? 0.4 : 0.5;
            var winner = Math.random() < winChance ? ox : rival;
            var loser = winner === ox ? rival : ox;

            // Find the herd
            var herd = GameState.balubanOxenHerds.find(function(h) {
                return h.members.indexOf(ox) > -1;
            });
            if (herd) handleOxenRuttingOutcome(winner, loser, herd, ox.userData.ruttingFemale);

            // Reset both
            [ox, rival].forEach(function(m) {
                m.userData.lifecycleState = 'grazing';
                m.userData.ruttingRival = null;
                m.userData.ruttingFemale = null;
                m.userData.ruttingTimer = 0;
                m.userData.ruttingPushPhase = 0;
                m.userData.isChallenger = false;
                // Reset neck position
                var mdl = m.children[0];
                if (mdl && mdl.userData.parts && mdl.userData.parts.neckGroup) {
                    mdl.userData.parts.neckGroup.rotation.z = 0;
                }
                mdl.position.y = 0;
            });
        }
    }

    /**
     * Handle the result of an oxen rut.
     */
    function handleOxenRuttingOutcome(winner, loser, herd, contestedFemale) {
        // Transfer loser's females to winner
        herd.members.forEach(function(f) {
            if (f.userData.owner === loser) {
                f.userData.owner = winner;
            }
        });

        // Leadership change?
        if (loser.userData.isLeader) {
            loser.userData.isLeader = false;
            winner.userData.isLeader = true;
            herd.leader = winner;
            herd.members.forEach(function(m) { m.userData.leader = winner; });

            // Rebuild horns: loser gets normal, winner gets big
            rebuildOxenModel(loser, false);
            rebuildOxenModel(winner, true);

            console.log('Oxen leadership change! New leader established.');
        }

        // Contested female mates with winner
        if (contestedFemale && contestedFemale.parent && !contestedFemale.userData.isPregnant &&
            contestedFemale.userData.canGetPregnant) {
            contestedFemale.userData.owner = winner;
            contestedFemale.userData.lifecycleState = 'seeking_mate';
            contestedFemale.userData.targetMate = winner;
        }

        console.log('Rut resolved! Winner: ' + (winner.userData.isLeader ? 'Leader' : 'Male'));
    }

    /**
     * Rebuild an oxen's model (for horn scale change on leadership change).
     */
    function rebuildOxenModel(ox, isLeader) {
        var dataId = ox.userData.gender === 'male' ? 'baluban_oxen_male' : 'baluban_oxen_female';
        var data = ENEMIES.find(function(e) { return e.id === dataId; });
        if (!data) return;

        while (ox.children.length > 0) ox.remove(ox.children[0]);

        var colors = {};
        for (var k in data.colors) {
            var v = data.colors[k];
            colors[k] = typeof v === 'string' ? parseInt(v.replace('#', ''), 16) : v;
        }

        var hornScale = isLeader ? 1.5 : (data.hornSize || 1);
        var newModel = buildBalubanOxenModel(colors, true, hornScale, false, ox.userData.isPregnant || false);
        ox.add(newModel);

        var size = data.size * (isLeader ? 1.1 : 1);
        ox.scale.set(size, size, size);
    }

    /**
     * Seeking mate: female walks toward the winner male.
     */
    function updateOxenSeekingMate(ox, delta) {
        var target = ox.userData.targetMate;
        if (!target || !target.parent) {
            ox.userData.lifecycleState = 'grazing';
            return;
        }

        var dx = target.position.x - ox.position.x;
        var dz = target.position.z - ox.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 2) {
            // Mating happens!
            ox.userData.isPregnant = true;
            ox.userData.gestationTimer = 420; // 7 minutes
            ox.userData.lastMate = target;
            ox.userData.lifecycleState = 'grazing';
            ox.userData.targetMate = null;

            // Rebuild model with pregnancy belly
            rebuildOxenWithBelly(ox, true);

            console.log('Oxen mating! Female pregnant (7 min gestation)');
        } else {
            ox.position.x += (dx / dist) * ox.userData.speed * 0.7 * delta;
            ox.position.z += (dz / dist) * ox.userData.speed * 0.7 * delta;
            ox.rotation.y = -Math.atan2(dz, dx);
            ox.userData.currentMoveSpeed = ox.userData.speed * 0.7;
        }
    }

    /**
     * Rebuild oxen model to show/hide pregnancy belly.
     */
    function rebuildOxenWithBelly(ox, showBelly) {
        var data = ENEMIES.find(function(e) { return e.id === 'baluban_oxen_female'; });
        if (!data) return;

        while (ox.children.length > 0) ox.remove(ox.children[0]);

        var colors = {};
        for (var k in data.colors) {
            var v = data.colors[k];
            colors[k] = typeof v === 'string' ? parseInt(v.replace('#', ''), 16) : v;
        }

        var newModel = buildBalubanOxenModel(colors, true, data.hornSize || 0.6, false, showBelly);
        ox.add(newModel);
    }

    /**
     * Spawn a baby oxen (calf).
     */
    function spawnBabyBalubanOxen(mother, herd) {
        var isMale = Math.random() < 0.5;

        // Baby colors: male = mud brown, female = potato
        var babyColors;
        if (isMale) {
            babyColors = {
                body: 0x8B6914, belly: 0x9B7924, chest: 0x7B5904,
                shoulder: 0x6B4904, rump: 0x8B6914, muzzle: 0x5A3A0A,
                nose: 0x1A1A1A, eyes: 0x1A1A1A, ears: 0x7B5904,
                earInner: 0x9A6A3A, legs: 0x6B4904, hooves: 0x1A1A1A,
                horns: 0x3D2817, tail: 0x6B4904, skirt: 0x5A3A0A
            };
        } else {
            babyColors = {
                body: 0xC4A76C, belly: 0xD4B77C, chest: 0xB4975C,
                shoulder: 0xA48750, rump: 0xC4A76C, muzzle: 0x8A6740,
                nose: 0x1A1A1A, eyes: 0x1A1A1A, ears: 0xB4975C,
                earInner: 0xC4A76C, legs: 0xA48750, hooves: 0x1A1A1A,
                horns: 0x3D2817, tail: 0xA48750, skirt: 0x8A6740
            };
        }

        var babyModel = buildBalubanOxenModel(babyColors, false, 0, true, false);
        var baby = new THREE.Group();
        baby.add(babyModel);
        // Don't scale parent — builder already handles baby size with s=0.5

        var bx = mother.position.x + (Math.random() - 0.5) * 3;
        var bz = mother.position.z + (Math.random() - 0.5) * 3;
        var terrainY = Environment.getTerrainHeight(bx, bz);
        baby.position.set(bx, terrainY + 0.25, bz);

        // Track father for lineage
        var father = mother.userData.lastMate;
        var fatherIsLeader = (father && father.userData.isLeader);

        baby.userData = {
            id: isMale ? 'baluban_oxen_male' : 'baluban_oxen_female',
            type: 'baluban_oxen',
            entityId: 'oxen_baby_' + Date.now() + '_' + Math.random(),
            gender: isMale ? 'male' : 'female',
            isLeader: false,
            speed: 3,
            chaseSpeed: 5,
            damage: 3,
            radius: 0.4,
            health: 15,
            maxHealth: 15,
            groundY: 0.25,
            friendly: true,
            defensive: false,
            minimapColor: isMale ? '#8B6914' : '#C4A76C',
            ignoreGravity: true,

            herdId: herd.id,
            isHerdAnimal: true,
            isBaby: true,
            mother: mother,
            leader: herd.leader,
            fatherWasLeader: fatherIsLeader,

            lifecycleState: 'baby',
            maturityTime: (GameState.timeElapsed || 0) + 360, // 6 min to mature
            wanderDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
            wanderTime: 0,
            walkPhase: Math.random() * Math.PI * 2,
            currentMoveSpeed: 0,
            hunger: 0
        };

        GameState.enemies.push(baby);
        GameState.scene.add(baby);
        herd.members.push(baby);
        if (!mother.userData.children) mother.userData.children = [];
        mother.userData.children.push(baby);

        console.log('Oxen calf born! (' + (isMale ? 'male - mud brown' : 'female - potato') +
            (fatherIsLeader ? ' - LEADER\'S CHILD' : '') + ')');
    }

    // ========================================================================
    // BALUBAN OXEN MATURITY + HERD SPLITTING (Phase 4)
    // ========================================================================

    /**
     * Grow a baby oxen to adult.
     */
    function growBabyOxen(baby, herd) {
        var isMale = baby.userData.gender === 'male';

        // Get adult data
        var dataId = isMale ? 'baluban_oxen_male' : 'baluban_oxen_female';
        var data = ENEMIES.find(function(e) { return e.id === dataId; });
        if (!data) return;

        // Remove old model
        while (baby.children.length > 0) baby.remove(baby.children[0]);

        // Build adult model
        var colors = {};
        for (var k in data.colors) {
            var v = data.colors[k];
            colors[k] = typeof v === 'string' ? parseInt(v.replace('#', ''), 16) : v;
        }

        var hornScale = data.hornSize || (isMale ? 1 : 0.6);
        var newModel = buildBalubanOxenModel(colors, true, hornScale, false, false);
        baby.add(newModel);
        baby.scale.set(data.size, data.size, data.size);

        // Update stats
        baby.userData.id = dataId;
        baby.userData.isBaby = false;
        baby.userData.health = data.health;
        baby.userData.maxHealth = data.health;
        baby.userData.speed = data.speed + Math.random() * (data.speedVariation || 0);
        baby.userData.chaseSpeed = data.chaseSpeed || 7;
        baby.userData.damage = data.damage;
        baby.userData.radius = data.radius;
        baby.userData.groundY = data.groundY;
        baby.userData.minimapColor = data.minimapColor;
        baby.userData.defensive = true;
        baby.userData.lifecycleState = 'grazing';

        if (isMale) {
            baby.userData.matingTimer = 60 + Math.random() * 120;
        } else {
            baby.userData.canGetPregnant = true;
            baby.userData.isPregnant = false;
            baby.userData.gestationTimer = 0;
            baby.userData.children = [];
        }

        console.log('Oxen calf matured to ' + (isMale ? 'male' : 'female') + '!');

        // Leader's son splits to form new herd
        if (isMale && baby.userData.fatherWasLeader) {
            createNewOxenHerdFromSon(baby, herd);
        }
    }

    /**
     * Leader's son takes 1 male + 2 females to form a new herd.
     */
    function createNewOxenHerdFromSon(son, oldHerd) {
        // Need at least 1 other non-leader male and 2 non-pregnant females
        var availableMales = oldHerd.members.filter(function(m) {
            return m !== son && m.userData.gender === 'male' && !m.userData.isBaby &&
                !m.userData.isLeader && m.userData.lifecycleState === 'grazing';
        });
        var availableFemales = oldHerd.members.filter(function(f) {
            return f.userData.gender === 'female' && !f.userData.isBaby &&
                !f.userData.isPregnant && f.userData.lifecycleState === 'grazing';
        });

        if (availableMales.length < 1 || availableFemales.length < 2) {
            console.log('Not enough members for herd split — son stays.');
            return;
        }

        // Pick 1 male and 2 females
        var takenMale = availableMales[Math.floor(Math.random() * availableMales.length)];
        var takenFemales = [];
        var shuffled = availableFemales.sort(function() { return Math.random() - 0.5; });
        takenFemales.push(shuffled[0], shuffled[1]);

        // Remove from old herd
        var toMove = [son, takenMale].concat(takenFemales);
        toMove.forEach(function(m) {
            var idx = oldHerd.members.indexOf(m);
            if (idx > -1) oldHerd.members.splice(idx, 1);
        });

        // Son becomes leader of new herd
        son.userData.isLeader = true;
        son.userData.id = 'baluban_oxen_leader';
        rebuildOxenModel(son, true); // 1.5x horns

        // Position new herd nearby but separate
        var newX = son.position.x + (Math.random() - 0.5) * 60;
        var newZ = Math.max(20, son.position.z + (Math.random() - 0.5) * 40);

        toMove.forEach(function(m) {
            var tx = newX + (Math.random() - 0.5) * 15;
            var tz = newZ + (Math.random() - 0.5) * 15;
            var ty = Environment.getTerrainHeight(tx, tz);
            m.position.set(tx, ty + (m.userData.groundY || 0.55), tz);
            m.userData.leader = son;
        });

        // Create new herd
        var newHerdId = 'oxen_herd_' + Date.now();
        toMove.forEach(function(m) { m.userData.herdId = newHerdId; });

        GameState.balubanOxenHerds.push({
            id: newHerdId,
            leader: son,
            members: toMove,
            maxSize: 40,
            matingTimer: 0
        });

        console.log('New oxen herd formed! Leader\'s son took 1 male + 2 females. Now ' +
            GameState.balubanOxenHerds.length + ' herds.');
    }

    // ========================================================================
    // SPAWN DEERICUS IRICUS HERD (SNOWY MOUNTAINS BIOME)
    // ========================================================================
    /**
     * Spawn a herd of Deericus Iricus deer
     * @param {number} count - Total number of deer (2-8)
     */
    function spawnDeericusIricusHerd(count) {
        console.log(`=== SPAWNING DEER HERD: ${count} members ===`);

        // Determine family composition
        const maleCount = Math.floor(count / 3);     // ~33% males
        const femaleCount = Math.ceil(count / 2);    // ~50% females
        const babyCount = count - maleCount - femaleCount; // Remaining are babies

        console.log(`Family composition: ${maleCount} males, ${femaleCount} females, ${babyCount} babies`);

        // Create unique herd ID
        const herdId = `deer_herd_${Date.now()}_${Math.random()}`;

        // Choose burrow location (avoid center, edges, and other burrows)
        let burrowX, burrowZ;
        let attempts = 0;
        do {
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 25; // 20-45m from center
            burrowX = Math.cos(angle) * radius;
            burrowZ = Math.sin(angle) * radius;
            attempts++;
        } while (attempts < 10 && isTooCloseToOtherBurrows(burrowX, burrowZ, 15));

        // Create burrow entrance
        console.log(`Creating burrow at (${burrowX.toFixed(1)}, ${burrowZ.toFixed(1)})`);
        const burrow = Environment.createBurrowEntrance(burrowX, burrowZ, herdId);
        if (!burrow) {
            console.error('Failed to create burrow entrance!');
            return;
        }
        GameState.deerBurrows.push(burrow);
        console.log('Burrow created successfully');

        // Track herd
        const herd = {
            id: herdId,
            members: [],
            burrow: burrow,
            leader: null, // Will be set to dominant male
            matingTimer: 0
        };

        if (!GameState.deerHerds) GameState.deerHerds = [];
        GameState.deerHerds.push(herd);

        // Spawn deer members
        const spawnRadius = 5; // Spawn near burrow

        // Spawn adult males
        const maleData = ENEMIES.find(e => e.id === 'deericus_iricus_male');
        console.log('Male deer data:', maleData ? 'FOUND' : 'NOT FOUND');
        for (let i = 0; i < maleCount; i++) {
            const deer = createEnemy(maleData,
                burrowX + (Math.random() - 0.5) * spawnRadius,
                burrowZ + (Math.random() - 0.5) * spawnRadius
            );
            if (!deer) {
                console.error(`Failed to create male deer #${i+1}`);
                continue;
            }
            console.log(`Created male deer #${i+1}`);
            deer.userData.herdId = herdId;
            deer.userData.herd = herd;
            deer.userData.homeBurrow = burrow;
            deer.userData.age = 'adult';
            deer.userData.hunger = Math.random() * 30;
            herd.members.push(deer);
            GameState.enemies.push(deer);
            GameState.scene.add(deer);

            // First male becomes leader
            if (!herd.leader) {
                herd.leader = deer;
                deer.userData.isLeader = true;
            }
        }

        // Spawn adult females
        const femaleData = ENEMIES.find(e => e.id === 'deericus_iricus_female');
        for (let i = 0; i < femaleCount; i++) {
            const deer = createEnemy(femaleData,
                burrowX + (Math.random() - 0.5) * spawnRadius,
                burrowZ + (Math.random() - 0.5) * spawnRadius
            );
            if (!deer) continue;
            deer.userData.herdId = herdId;
            deer.userData.herd = herd;
            deer.userData.homeBurrow = burrow;
            deer.userData.age = 'adult';
            deer.userData.hunger = Math.random() * 30;
            deer.userData.canGetPregnant = true;
            herd.members.push(deer);
            GameState.enemies.push(deer);
            GameState.scene.add(deer);
        }

        // Spawn babies (mix of male/female)
        for (let i = 0; i < babyCount; i++) {
            const isMale = Math.random() < 0.5;
            const babyDataId = isMale ? 'deericus_iricus_baby_male' : 'deericus_iricus_baby_female';
            const babyData = ENEMIES.find(e => e.id === babyDataId);
            const deer = createEnemy(babyData,
                burrowX + (Math.random() - 0.5) * spawnRadius,
                burrowZ + (Math.random() - 0.5) * spawnRadius
            );
            if (!deer) continue;
            deer.userData.herdId = herdId;
            deer.userData.herd = herd;
            deer.userData.homeBurrow = burrow;
            deer.userData.age = 'baby';
            deer.userData.hunger = Math.random() * 20;
            deer.userData.maturityTime = GameState.timeElapsed + 180;
            deer.userData.isBaby = true;
            herd.members.push(deer);
            GameState.enemies.push(deer);
            GameState.scene.add(deer);
        }

        console.log(`Spawned deer herd ${herdId}: ${maleCount} males, ${femaleCount} females, ${babyCount} babies`);
    }

    /**
     * Check if position is too close to existing burrows
     */
    function isTooCloseToOtherBurrows(x, z, minDistance) {
        if (!GameState.deerBurrows) return false;

        return GameState.deerBurrows.some(burrow => {
            const dx = burrow.userData.position.x - x;
            const dz = burrow.userData.position.z - z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            return dist < minDistance;
        });
    }

    /**
     * Grow a baby deer into an adult
     * @param {THREE.Mesh} baby - The baby deer to mature
     */
    function growDeerBabyToAdult(baby) {
        const wasMale = baby.userData.id.includes('baby_male');
        const herd = baby.userData.herd;

        // Determine new adult type
        const newType = wasMale ? 'deericus_iricus_male' : 'deericus_iricus_female';

        // Store position and herd data
        const pos = baby.position.clone();
        const herdId = baby.userData.herdId;
        const homeBurrow = baby.userData.homeBurrow;
        const currentState = baby.userData.state;

        // Remove baby
        GameState.scene.remove(baby);
        const idx = GameState.enemies.indexOf(baby);
        if (idx > -1) GameState.enemies.splice(idx, 1);

        if (herd) {
            const herdIdx = herd.members.indexOf(baby);
            if (herdIdx > -1) herd.members.splice(herdIdx, 1);
        }

        // Create adult
        const adultData = ENEMIES.find(e => e.id === newType);
        const adult = createEnemy(adultData, pos.x, pos.z);
        if (!adult) return;

        adult.userData.herdId = herdId;
        adult.userData.herd = herd;
        adult.userData.homeBurrow = homeBurrow;
        adult.userData.age = 'adult';
        adult.userData.justMatured = true;
        adult.userData.state = currentState;

        if (herd) {
            herd.members.push(adult);
        }
        GameState.enemies.push(adult);
        GameState.scene.add(adult);

        // Males may leave to form bachelor herds
        if (wasMale && herd && herd.members.length > 5) {
            // 60% chance male leaves if herd is crowded
            if (Math.random() < 0.6) {
                adult.userData.shouldLeaveToBachelorHerd = true;
                adult.userData.leaveTimer = 30 + Math.random() * 30; // Leave in 30-60 seconds
            }
        }

        // Females can get pregnant
        if (!wasMale) {
            adult.userData.canGetPregnant = true;
        }

        console.log(`Baby deer matured into ${newType}, herd size now ${herd ? herd.members.length : 0}`);
    }

    /**
     * Update baby deer maturation
     * Called from main update loop
     */
    function updateDeerMaturation(delta) {
        GameState.enemies.forEach(enemy => {
            if (enemy.userData.isBaby &&
                enemy.userData.id && enemy.userData.id.includes('deericus_iricus_baby') &&
                enemy.userData.maturityTime) {

                // Check if maturity time reached
                if (GameState.timeElapsed >= enemy.userData.maturityTime) {
                    growDeerBabyToAdult(enemy);
                }
            }
        });
    }

    /**
     * Male deer leaves family herd to form/join bachelor herd
     * @param {THREE.Mesh} male - The male deer leaving
     */
    function leaveToBachelorHerd(male) {
        const oldHerd = male.userData.herd;

        // Remove from family herd
        if (oldHerd) {
            const idx = oldHerd.members.indexOf(male);
            if (idx > -1) oldHerd.members.splice(idx, 1);
            console.log(`Male deer left family herd ${oldHerd.id}, ${oldHerd.members.length} remain`);
        }

        // Find or create bachelor herd
        let bachelorHerd = GameState.deerHerds.find(h => h.isBachelorHerd);

        if (!bachelorHerd) {
            // Create new bachelor herd with new burrow
            const angle = Math.random() * Math.PI * 2;
            const radius = 35 + Math.random() * 15; // Further from center
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const bachelorBurrow = Environment.createBurrowEntrance(x, z, `bachelor_herd_${Date.now()}`);
            GameState.deerBurrows.push(bachelorBurrow);

            bachelorHerd = {
                id: `bachelor_herd_${Date.now()}`,
                members: [],
                burrow: bachelorBurrow,
                isBachelorHerd: true,
                leader: null,
                matingTimer: 0
            };

            GameState.deerHerds.push(bachelorHerd);
            console.log('Created new bachelor herd');
        }

        // Join bachelor herd
        male.userData.herd = bachelorHerd;
        male.userData.herdId = bachelorHerd.id;
        male.userData.homeBurrow = bachelorHerd.burrow;
        bachelorHerd.members.push(male);

        // First male becomes leader
        if (!bachelorHerd.leader) {
            bachelorHerd.leader = male;
            male.userData.isLeader = true;
        }

        male.userData.shouldLeaveToBachelorHerd = false;
        console.log(`Male joined bachelor herd, now ${bachelorHerd.members.length} members`);
    }

    /**
     * Update bachelor herd formation timers
     * Called from main update loop
     */
    function updateBachelorHerdFormation(delta) {
        GameState.enemies.forEach(enemy => {
            if (enemy.userData.shouldLeaveToBachelorHerd && enemy.userData.leaveTimer) {
                enemy.userData.leaveTimer -= delta;

                if (enemy.userData.leaveTimer <= 0) {
                    leaveToBachelorHerd(enemy);
                }
            }
        });
    }

    // ========================================================================
    // DEER MATING, GRAZING AI, AND DEFENSE SYSTEMS
    // ========================================================================

    function triggerDeerMating() {
        if (!GameState.deerHerds || GameState.deerHerds.length === 0) return;

        GameState.deerHerds.forEach(herd => {
            if (herd.isBachelorHerd) return;

            const eligibleFemales = herd.members.filter(m =>
                m.userData.gender === 'female' && m.userData.age === 'adult' &&
                m.userData.canGetPregnant && !m.userData.isPregnant && !m.userData.gestating
            );

            const males = herd.members.filter(m =>
                m.userData.gender === 'male' && m.userData.age === 'adult'
            );

            if (eligibleFemales.length === 0 || males.length === 0) return;

            males.forEach(male => {
                if (eligibleFemales.length === 0) return;
                const isLeader = male === herd.leader;
                const matingChance = isLeader ? 0.8 : 0.4;
                if (Math.random() > matingChance) return;

                const femaleIdx = Math.floor(Math.random() * eligibleFemales.length);
                const female = eligibleFemales[femaleIdx];
                eligibleFemales.splice(femaleIdx, 1);

                if (Math.random() < 0.05 && males.length > 1) {
                    const rivals = males.filter(m => m !== male);
                    const rival = rivals[Math.floor(Math.random() * rivals.length)];
                    male.userData.state = 'rutting_approach';
                    male.userData.ruttingRival = rival;
                    male.userData.ruttingFemale = female;
                    male.userData.ruttingTimer = 10;
                    rival.userData.state = 'rutting_approach';
                    rival.userData.ruttingRival = male;
                    rival.userData.ruttingFemale = female;
                    rival.userData.ruttingTimer = 10;
                } else {
                    male.userData.state = 'mating_display';
                    male.userData.matingPartner = female;
                    male.userData.matingTimer = 5;
                    female.userData.state = 'mating_display';
                    female.userData.matingPartner = male;
                    female.userData.matingTimer = 5;
                }
            });
        });
    }

    function updateDeerMating(delta) {
        GameState.enemies.forEach(enemy => {
            if (!enemy.userData.id || !enemy.userData.id.includes('deericus_iricus')) return;

            if (enemy.userData.state === 'mating_display' && enemy.userData.matingTimer) {
                enemy.userData.matingTimer -= delta;
                if (enemy.userData.matingTimer <= 0) {
                    const partner = enemy.userData.matingPartner;
                    if (enemy.userData.gender === 'male' && partner) {
                        partner.userData.isPregnant = true;
                        partner.userData.gestating = true;
                        partner.userData.gestationTimer = 300;
                        partner.userData.father = enemy;
                        enemy.userData.state = 'idle';
                        partner.userData.state = 'idle';
                    }
                }
            }

            if (enemy.userData.state === 'rutting_approach' && enemy.userData.ruttingTimer) {
                enemy.userData.ruttingTimer -= delta;
                if (enemy.userData.ruttingTimer <= 0) {
                    const rival = enemy.userData.ruttingRival;
                    const female = enemy.userData.ruttingFemale;
                    if (rival && female) {
                        const winner = Math.random() < 0.5 ? enemy : rival;
                        const loser = winner === enemy ? rival : enemy;
                        winner.userData.state = 'mating_display';
                        winner.userData.matingPartner = female;
                        winner.userData.matingTimer = 5;
                        female.userData.state = 'mating_display';
                        female.userData.matingPartner = winner;
                        female.userData.matingTimer = 5;
                        loser.userData.health = Math.max(0, loser.userData.health - 10);
                        loser.userData.state = 'fleeing';
                        loser.userData.fleeTimer = 10;
                    }
                }
            }

            if (enemy.userData.gestating && enemy.userData.gestationTimer) {
                enemy.userData.gestationTimer -= delta;
                if (enemy.userData.gestationTimer <= 0) {
                    const numBabies = 1 + Math.floor(Math.random() * 2);
                    const burrow = enemy.userData.homeBurrow;
                    if (burrow) {
                        for (let i = 0; i < numBabies; i++) {
                            const isMale = Math.random() < 0.5;
                            const babyType = isMale ? 'deericus_iricus_baby_male' : 'deericus_iricus_baby_female';
                            const babyData = ENEMIES.find(e => e.id === babyType);
                            const baby = createEnemy(babyData,
                                burrow.userData.position.x + (Math.random() - 0.5) * 3,
                                burrow.userData.position.z + (Math.random() - 0.5) * 3
                            );
                            if (!baby) continue;

                            baby.userData.herdId = enemy.userData.herdId;
                            baby.userData.herd = enemy.userData.herd;
                            baby.userData.homeBurrow = burrow;
                            baby.userData.age = 'baby';
                            baby.userData.maturityTime = GameState.timeElapsed + 180;
                            baby.userData.isBaby = true;
                            baby.userData.mother = enemy;
                            baby.userData.father = enemy.userData.father;

                            GameState.enemies.push(baby);
                            GameState.scene.add(baby);
                            if (enemy.userData.herd) enemy.userData.herd.members.push(baby);
                        }
                    }
                    enemy.userData.isPregnant = false;
                    enemy.userData.gestating = false;
                    enemy.userData.gestationTimer = null;
                }
            }
        });
    }

    function updateDeerBehavior(deer, delta) {
        if (!deer.userData.id || !deer.userData.id.includes('deericus_iricus')) return;
        const state = deer.userData.state || 'idle';

        switch(state) {
            case 'in_burrow': updateDeerInBurrow(deer, delta); break;
            case 'peeking': updateDeerPeeking(deer, delta); break;
            case 'idle': updateDeerIdle(deer, delta); break;
            case 'seeking_grass': updateDeerSeekingGrass(deer, delta); break;
            case 'grazing': updateDeerGrazing(deer, delta); break;
            case 'returning_home': updateDeerReturningHome(deer, delta); break;
            case 'fleeing': updateDeerFleeing(deer, delta); break;
            case 'fighting': updateDeerFighting(deer, delta); break;
            case 'following_parent': updateDeerFollowingParent(deer, delta); break;
        }

        // Keep deer at correct terrain height (deer are skipped in updateEnemies)
        if (state !== 'in_burrow' && state !== 'peeking') {
            const terrainY = Environment.getTerrainHeight(deer.position.x, deer.position.z);
            deer.userData.groundY_actual = terrainY + (deer.userData.groundY || 0.25);
            deer.position.y = deer.userData.groundY_actual;
        }

        // Walking animation — uses the articulated leg structure from the model
        const deerModel = deer.children[0];
        if (deerModel && deerModel.userData.legs && state !== 'in_burrow' && state !== 'peeking') {
            // Check if the deer actually moved this frame by comparing positions
            if (!deer.userData._lastPos) {
                deer.userData._lastPos = { x: deer.position.x, z: deer.position.z };
            }
            const dx = deer.position.x - deer.userData._lastPos.x;
            const dz = deer.position.z - deer.userData._lastPos.z;
            const moved = (dx * dx + dz * dz) > 0.0001;  // Tiny threshold
            deer.userData._lastPos.x = deer.position.x;
            deer.userData._lastPos.z = deer.position.z;

            if (moved) {
                // Speed-based walk cycle
                const walkSpeed = (state === 'fleeing') ? 8 : 5;

                if (deer.userData.walkPhase === undefined) {
                    deer.userData.walkPhase = 0;
                }
                deer.userData.walkPhase += delta * walkSpeed;

                deerModel.userData.legs.forEach((leg, idx) => {
                    // Diagonal gait: front-right(0) + back-left(3), front-left(1) + back-right(2)
                    const isPairA = (idx === 0 || idx === 3);
                    const phase = isPairA ? deer.userData.walkPhase : deer.userData.walkPhase + Math.PI;

                    const cyclePos = Math.sin(phase);
                    const cycleAbs = Math.abs(cyclePos);

                    // Hip swing (forward/back)
                    const swingAmount = leg.isFront ? 0.4 : 0.5;
                    leg.group.rotation.z = cyclePos * swingAmount;

                    // Knee bend (only when leg is lifting)
                    const kneeAmount = leg.isFront ? 0.5 : 0.7;
                    if (cyclePos > 0) {
                        leg.lowerLegGroup.rotation.z = -cycleAbs * kneeAmount;
                    } else {
                        leg.lowerLegGroup.rotation.z = cycleAbs * 0.1;
                    }
                });

                // Subtle body bob while walking
                const bodyBob = Math.abs(Math.sin(deer.userData.walkPhase * 2)) * 0.015;
                deer.position.y = deer.userData.groundY_actual + bodyBob;

            } else {
                // Standing still — smoothly return legs to neutral
                deerModel.userData.legs.forEach(leg => {
                    leg.group.rotation.z *= 0.9;
                    leg.lowerLegGroup.rotation.z *= 0.9;
                });
            }
        }
    }

    function updateDeerInBurrow(deer, delta) {
        if (!deer.userData.burrowTimer) deer.userData.burrowTimer = 10 + Math.random() * 20;
        deer.userData.burrowTimer -= delta;
        if (deer.userData.burrowTimer <= 0) {
            if (Math.random() < 0.3) {
                Environment.deerPeekFromBurrow(deer);
                deer.userData.peekTimer = 3 + Math.random() * 5;
            } else if ((deer.userData.hunger || 0) > 50) {
                Environment.deerExitBurrow(deer);
                deer.userData.state = 'seeking_grass';
            } else {
                deer.userData.burrowTimer = 10 + Math.random() * 20;
            }
        }
    }

    function updateDeerPeeking(deer, delta) {
        if (!deer.userData.peekTimer) deer.userData.peekTimer = 5;
        deer.userData.peekTimer -= delta;
        if (deer.userData.peekTimer <= 0) {
            const dangerNearby = checkForPredatorsNearDeer(deer, 15);
            if (dangerNearby) {
                Environment.deerEnterBurrow(deer, deer.userData.homeBurrow);
            } else if ((deer.userData.hunger || 0) > 50) {
                Environment.deerExitBurrow(deer);
                deer.userData.state = 'seeking_grass';
            } else {
                Environment.deerEnterBurrow(deer, deer.userData.homeBurrow);
            }
        }
    }

    function updateDeerIdle(deer, delta) {
        deer.userData.hunger = Math.min(100, (deer.userData.hunger || 0) + delta * 2);
        if (deer.userData.isBaby && deer.userData.mother) {
            deer.userData.state = 'following_parent';
            return;
        }
        if (deer.userData.hunger > 60) { deer.userData.state = 'seeking_grass'; return; }
        if (deer.userData.hunger < 20) { deer.userData.state = 'returning_home'; return; }
        if (!deer.userData.wanderTimer) {
            deer.userData.wanderTimer = 2 + Math.random() * 4;
            deer.userData.wanderAngle = Math.random() * Math.PI * 2;
        }
        deer.userData.wanderTimer -= delta;
        const speed = 1.5;
        const dx = Math.cos(deer.userData.wanderAngle) * speed * delta;
        const dz = Math.sin(deer.userData.wanderAngle) * speed * delta;
        deer.position.x += dx;
        deer.position.z += dz;
        deer.rotation.y = -Math.atan2(dz, dx);
    }

    function updateDeerSeekingGrass(deer, delta) {
        const nearestGrass = findNearestGrassTuft(deer);
        if (!nearestGrass) { deer.userData.state = 'returning_home'; return; }
        const dx = nearestGrass.position.x - deer.position.x;
        const dz = nearestGrass.position.z - deer.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist < 1) {
            deer.userData.state = 'grazing';
            deer.userData.currentGrass = nearestGrass;
            deer.userData.grazingTimer = 5 + Math.random() * 5;
            return;
        }
        const angle = Math.atan2(dz, dx);
        const speed = 2.5;
        const moveX = Math.cos(angle) * speed * delta;
        const moveZ = Math.sin(angle) * speed * delta;
        deer.position.x += moveX;
        deer.position.z += moveZ;
        deer.rotation.y = -Math.atan2(moveZ, moveX);
    }

    function updateDeerGrazing(deer, delta) {
        if (!deer.userData.grazingTimer) deer.userData.grazingTimer = 5;
        deer.userData.grazingTimer -= delta;
        if (!deer.userData.lastEatTime) deer.userData.lastEatTime = 0;
        deer.userData.lastEatTime += delta;
        if (deer.userData.lastEatTime >= 0.5) {
            Environment.eatGrassTuft(deer.userData.currentGrass, deer);
            deer.userData.lastEatTime = 0;
        }
        if (deer.userData.head) {
            deer.userData.head.rotation.x = Math.sin(GameState.timeElapsed * 3) * 0.3;
        }
        if (deer.userData.grazingTimer <= 0 || deer.userData.hunger < 20) {
            deer.userData.state = 'returning_home';
            deer.userData.currentGrass = null;
        }
    }

    function updateDeerReturningHome(deer, delta) {
        const burrow = deer.userData.homeBurrow;
        if (!burrow) { deer.userData.state = 'idle'; return; }
        const entrancePos = burrow.userData.entrancePosition;
        const dx = entrancePos.x - deer.position.x;
        const dz = entrancePos.z - deer.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist < 0.5) { Environment.deerEnterBurrow(deer, burrow); return; }
        const angle = Math.atan2(dz, dx);
        const speed = 2;
        const moveX = Math.cos(angle) * speed * delta;
        const moveZ = Math.sin(angle) * speed * delta;
        deer.position.x += moveX;
        deer.position.z += moveZ;
        deer.rotation.y = -Math.atan2(moveZ, moveX);
    }

    function updateDeerFollowingParent(deer, delta) {
        const mother = deer.userData.mother;
        if (!mother || !mother.userData) { deer.userData.state = 'idle'; return; }
        if (mother.userData.state === 'in_burrow') {
            deer.userData.state = 'in_burrow';
            Environment.deerEnterBurrow(deer, deer.userData.homeBurrow);
            return;
        }
        const dx = mother.position.x - deer.position.x;
        const dz = mother.position.z - deer.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist > 2) {
            const angle = Math.atan2(dz, dx);
            const speed = 3;
            const moveX = Math.cos(angle) * speed * delta;
            const moveZ = Math.sin(angle) * speed * delta;
            deer.position.x += moveX;
            deer.position.z += moveZ;
            deer.rotation.y = -Math.atan2(moveZ, moveX);
        }
    }

    function findNearestGrassTuft(deer) {
        if (!GameState.grassTufts) return null;
        let nearest = null;
        let minDist = Infinity;
        GameState.grassTufts.forEach(tuft => {
            if (tuft.userData.size < 0.3) return;
            const dx = tuft.position.x - deer.position.x;
            const dz = tuft.position.z - deer.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist < minDist) { minDist = dist; nearest = tuft; }
        });
        return nearest;
    }

    function checkForPredatorsNearDeer(deer, radius) {
        let nearestPredator = null;
        let minDist = radius;
        GameState.enemies.forEach(enemy => {
            if (enemy.userData.category === 'carnivore') {
                const dx = enemy.position.x - deer.position.x;
                const dz = enemy.position.z - deer.position.z;
                const dist = Math.sqrt(dx*dx + dz*dz);
                if (dist < minDist) { minDist = dist; nearestPredator = enemy; }
            }
        });
        if (GameState.peccary) {
            const dx = GameState.peccary.position.x - deer.position.x;
            const dz = GameState.peccary.position.z - deer.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist < minDist && GameState.peccary.userData.isAttacking) {
                nearestPredator = GameState.peccary;
            }
        }
        return nearestPredator;
    }

    function updateDeerFleeing(deer, delta) {
        if (!deer.userData.fleeTarget) {
            const predator = checkForPredatorsNearDeer(deer, 20);
            if (!predator) { deer.userData.state = 'returning_home'; return; }
            deer.userData.fleeTarget = predator;
        }
        const predator = deer.userData.fleeTarget;
        const dx = deer.position.x - predator.position.x;
        const dz = deer.position.z - predator.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist > 25) {
            deer.userData.state = 'returning_home';
            deer.userData.fleeTarget = null;
            return;
        }
        const angle = Math.atan2(dz, dx);
        const speed = 6;
        const moveX = Math.cos(angle) * speed * delta;
        const moveZ = Math.sin(angle) * speed * delta;
        deer.position.x += moveX;
        deer.position.z += moveZ;
        deer.rotation.y = -Math.atan2(moveZ, moveX);
        if (!deer.userData.zigzagTimer) deer.userData.zigzagTimer = 0;
        deer.userData.zigzagTimer += delta;
        if (deer.userData.zigzagTimer > 1) {
            deer.position.x += (Math.random() - 0.5) * 3;
            deer.position.z += (Math.random() - 0.5) * 3;
            deer.userData.zigzagTimer = 0;
        }
    }

    function updateDeerFighting(deer, delta) {
        const target = deer.userData.fightTarget;
        if (!target || !target.userData) { deer.userData.state = 'fleeing'; return; }
        deer.userData.fightTimer -= delta;
        const dx = target.position.x - deer.position.x;
        const dz = target.position.z - deer.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        deer.rotation.y = -Math.atan2(dz, dx);
        if (dist < 2) {
            if (!deer.userData.lastKickTime) deer.userData.lastKickTime = 0;
            deer.userData.lastKickTime += delta;
            if (deer.userData.lastKickTime >= 1.5) {
                const kickDamage = 15;
                if (target.userData.health) target.userData.health -= kickDamage;
                deer.userData.lastKickTime = 0;
            }
        }
        if (deer.userData.fightTimer <= 0) deer.userData.state = 'fleeing';
    }

    function deerTakeDamage(deer, damage, attacker) {
        deer.userData.health -= damage;
        if (deer.userData.health <= 0) {
            // Convert to carcass (herd removal is handled inside convertToCarcass)
            convertToCarcass(deer);
            return;
        }
        const shouldFight = deer.userData.gender === 'male' && deer.userData.age === 'adult' && Math.random() < 0.4;
        if (shouldFight) {
            deer.userData.state = 'fighting';
            deer.userData.fightTarget = attacker;
            deer.userData.fightTimer = 5;
        } else {
            deer.userData.state = 'fleeing';
            deer.userData.fleeTarget = attacker;
        }
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
    // BEHAVIOR FLAGS — data-driven, defined in js/data/enemies.js
    // ----------------------------------------------------------------
    // friendly: true         — Does NOT attack the player
    // defendsNest: true      — Patrols and attacks hostile animals near nests
    // canStealEggs: true     — Seeks out nests, creeps up, steals eggs, flees
    // fightsNestGuards: true — Fights back when nest-guarding animals attack
    // dodgeChance: 0.15      — % chance to dodge incoming attacks
    // immuneToWater: true    — Not slowed down by water
    // chaseSpeed: N          — Sprint speed when chasing a target
    // fleeSpeed: N           — Sprint speed when fleeing
    // attackRange: N         — Detection range for defendsNest animals
    // ----------------------------------------------------------------
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
                        // Sample near river points for better hit rate
                        const rp = Environment.getRiverPoints ? Environment.getRiverPoints() : [];
                        for (let attempt = 0; attempt < 30; attempt++) {
                            let rx, rz;
                            if (rp.length > 1) {
                                const idx = Math.floor(Math.random() * (rp.length - 1));
                                const p = rp[idx];
                                const angle = Math.random() * Math.PI * 2;
                                const dist = 10 + Math.random() * 8;
                                rx = p.x + Math.cos(angle) * dist;
                                rz = p.z + Math.sin(angle) * dist;
                            } else {
                                rx = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 0.8;
                                rz = (Math.random() - 0.5) * CONFIG.WORLD_SIZE * 0.8;
                            }
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
                                        // Convert to carcass
                                        convertToCarcass(closestEnemy);
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
            // Nest-defending animals that patrol and attack hostile enemies
            else if (enemy.userData.defendsNest) {
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
                                // Convert to carcass
                                convertToCarcass(closestEnemy);
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
                        const dx = enemy.userData.hopTarget.x - enemy.position.x;
                        const dz = enemy.userData.hopTarget.z - enemy.position.z;
                        const targetAngle = -Math.atan2(dz, dx);
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
                    const targetRotation = -Math.atan2(direction.z, direction.x);
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
                                // Convert toad to carcass
                                convertToCarcass(target);
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
                    const targetRotation = -Math.atan2(direction.z, direction.x);
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
                        // For +X facing model: forward = (cos(theta), 0, -sin(theta))
                        direction = new THREE.Vector3(
                            Math.cos(enemy.rotation.y),
                            0,
                            -Math.sin(enemy.rotation.y)
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
                        enemy.rotation.y = -Math.atan2(toRival.z, toRival.x);

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
                        enemy.rotation.y = -Math.atan2(pushDir.z, pushDir.x);
                        rival.rotation.y = -Math.atan2(-pushDir.z, -pushDir.x);

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
                            // Antelope died — convert to carcass
                            convertToCarcass(enemy);
                            var antelopeRewards = CONFIG.KILL_REWARDS || {};
                            var antelopeTier = (enemy.userData.maxHealth || 0) >= 10 ? antelopeRewards.tough : (enemy.userData.maxHealth || 0) >= 5 ? antelopeRewards.medium : antelopeRewards.weak;
                            if (antelopeTier) { GameState.score += antelopeTier.score; GameState.pigCoins += antelopeTier.coins; }
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
                    const targetRotation = -Math.atan2(direction.z, direction.x);
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
                            // Convert to carcass
                            console.log('Wild dog killed a grass viper!');
                            convertToCarcass(target);
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
                        speed = enemy.userData.chaseSpeed || enemy.userData.speed;  // Sprint chase!
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
                    speed = enemy.userData.chaseSpeed || enemy.userData.speed;  // Sprint hunting speed!

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
                    enemy.rotation.y = -Math.atan2(toTarget.z, toTarget.x);

                    // Only leader processes takedown
                    if (enemy === hunt.leader) {
                        hunt.timer += delta;

                        // Takedown complete after 3 seconds
                        if (hunt.timer > 3) {
                            // Kill the antelope!
                            console.log('Wild dogs successfully killed antelope!');

                            // Convert to carcass (herd removal handled inside)
                            convertToCarcass(target);

                            // Transition to eating — track the carcass
                            hunt.state = 'eating';
                            hunt.timer = 0;
                            hunt.killPosition = target.position.clone();
                            hunt.carcass = target;
                            target.userData.carcassBeingEaten = true;
                            target.userData.carcassEater = hunt.leader;
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

                    // All pack members eating consume from the carcass
                    if (hunt.carcass && hunt.carcass.userData && hunt.carcass.userData.isCarcass) {
                        eatFromCarcass(enemy, hunt.carcass, delta);
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
                // Model faces +X, so use -atan2(dz, dx) for correct rotation
                if (direction && (direction.x !== 0 || direction.z !== 0)) {
                    const targetRotation = -Math.atan2(direction.z, direction.x);
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
                    // Model faces +X, so use -atan2(dz, dx) for correct rotation
                    const targetRotation = -Math.atan2(direction.z, direction.x);
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
            // Egg-stealing behavior — any animal with canStealEggs: true
            // (Fox has unique creeping animation, but the decision logic is generic)
            else if (enemy.userData.canStealEggs) {
                // Initialize egg-thief state if needed
                if (!enemy.userData.eggThiefState) {
                    enemy.userData.eggThiefState = 'hunting'; // hunting, creeping, fleeing
                    enemy.userData.targetNest = null;
                    enemy.userData.isCreeping = false;
                    enemy.userData.stolenEgg = false;
                }

                const eggThiefState = enemy.userData.eggThiefState;

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

                // Check if any nest-defending animal is nearby (e.g. geese)
                let nearbyGuard = null;
                let nearbyGuardDist = 15;
                for (const other of GameState.enemies) {
                    if (other !== enemy && other.userData.defendsNest) {
                        const dist = enemy.position.distanceTo(other.position);
                        if (dist < nearbyGuardDist) {
                            nearbyGuardDist = dist;
                            nearbyGuard = other;
                        }
                    }
                }

                // Apply creeping or walking animation
                if (enemy.userData.isCreeping) {
                    // Fox-specific creeping pose (other animals just move slowly)
                    if (enemy.userData.type === 'fox') {
                        const model = enemy.children[0];
                        if (model && model.userData.legs) {
                            model.userData.legs.forEach(leg => {
                                leg.group.rotation.z = Math.PI / 4;
                                leg.lowerLegGroup.rotation.z = -Math.PI / 4;
                            });
                        }
                        const terrainY = Environment.getTerrainHeight(enemy.position.x, enemy.position.z);
                        enemy.position.y = terrainY + (enemy.userData.groundY || 0.3) - 0.15;
                    }
                    speed = enemy.userData.speed * 0.4; // All egg-thieves move slow when creeping
                } else if (enemy.userData.type === 'fox') {
                    // Fox-specific walking/sprinting animation with diagonal gait
                    const model = enemy.children[0];
                    if (model && model.userData.legs) {
                        const isChasing = enemy.userData.isChasing;
                        const cycleSpeed = isChasing ? 18 : 8;
                        const swingAngle = isChasing ? Math.PI / 3 : Math.PI / 4;
                        const kneeIntensity = isChasing ? 0.6 : 0.3;
                        const walkCycle = GameState.clock.elapsedTime * cycleSpeed;

                        model.userData.legs.forEach(leg => {
                            const phase = leg.diagonalPair === 'A' ? 0 : Math.PI;
                            const swing = Math.sin(walkCycle + phase) * swingAngle;

                            leg.group.rotation.z = swing;

                            const kneeBend = Math.max(0, Math.sin(walkCycle + phase + 0.5)) * kneeIntensity;
                            leg.lowerLegGroup.rotation.z = -kneeBend;
                        });
                    }
                    const terrainY = Environment.getTerrainHeight(enemy.position.x, enemy.position.z);
                    const baseY = terrainY + (enemy.userData.groundY || 0.3);
                    const bobSpeed = enemy.userData.isChasing ? 18 : 10;
                    const bobHeight = enemy.userData.isChasing ? 0.12 : 0.04;
                    enemy.position.y = baseY + Math.abs(Math.sin(GameState.clock.elapsedTime * bobSpeed)) * bobHeight;
                }

                if (eggThiefState === 'hunting') {
                    // Look for nests with eggs to steal
                    if (nearestNestWithEgg && nearestNestDist < CONFIG.ENEMY_DETECTION_RANGE) {
                        enemy.userData.targetNest = nearestNestWithEgg;

                        // Start creeping when getting close to nest
                        if (nearestNestDist < 20) {
                            enemy.userData.isCreeping = true;
                            enemy.userData.eggThiefState = 'creeping';
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
                            speed = enemy.userData.chaseSpeed || enemy.userData.speed;
                            enemy.userData.isChasing = true;

                            // Attack baby on contact
                            if (closestBabyDist < enemy.userData.radius + targetBaby.userData.radius) {
                                targetBaby.userData.health -= enemy.userData.damage * delta;
                                if (targetBaby.userData.health <= 0) {
                                    const parent = GameState.enemies.find(e => e.userData.entityId === targetBaby.userData.parentId);
                                    if (parent) parent.userData.hasOffspring = false;
                                    convertToCarcass(targetBaby);
                                }
                            }
                        } else if (distance < CONFIG.ENEMY_DETECTION_RANGE) {
                            // Chase player — sprint!
                            direction = new THREE.Vector3()
                                .subVectors(GameState.peccary.position, enemy.position)
                                .normalize();
                            speed = enemy.userData.chaseSpeed || enemy.userData.speed;
                            enemy.userData.isChasing = true;
                        } else {
                            enemy.userData.isChasing = false;
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
                } else if (eggThiefState === 'creeping') {
                    // Creeping toward nest to steal egg
                    enemy.userData.isCreeping = true;
                    const targetNest = enemy.userData.targetNest;

                    if (targetNest && targetNest.egg && targetNest.egg.exists) {
                        const nestVec = new THREE.Vector3(targetNest.position.x, 0, targetNest.position.z);
                        const distToNest = enemy.position.distanceTo(nestVec);

                        // If a nest guard spots the thief while creeping, flee!
                        if (nearbyGuard && nearbyGuardDist < 10) {
                            enemy.userData.eggThiefState = 'fleeing';
                            enemy.userData.isCreeping = false;
                            enemy.userData.fleeFrom = nearbyGuard;
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
                            enemy.userData.eggThiefState = 'fleeing';
                            enemy.userData.isCreeping = false;

                            // Alert the nest owner that their egg was stolen
                            const nestOwner = GameState.enemies.find(e => e.userData.entityId === targetNest.ownerId);
                            if (nestOwner) {
                                nestOwner.userData.targetEggThief = enemy;
                            }

                            console.log(enemy.userData.id + ' stole an egg from nest!');
                        } else {
                            // Keep creeping toward nest
                            direction = new THREE.Vector3()
                                .subVectors(nestVec, enemy.position)
                                .normalize();
                            speed = enemy.userData.speed * 0.4;
                        }
                    } else {
                        // Nest no longer has egg, go back to hunting
                        enemy.userData.eggThiefState = 'hunting';
                        enemy.userData.isCreeping = false;
                        enemy.userData.targetNest = null;
                    }
                } else if (eggThiefState === 'fleeing') {
                    // Run away from guard or after stealing egg
                    enemy.userData.isCreeping = false;
                    const fleeFrom = enemy.userData.fleeFrom;

                    if (fleeFrom) {
                        // Flee from specific guard
                        direction = new THREE.Vector3()
                            .subVectors(enemy.position, fleeFrom.position)
                            .normalize();
                        speed = enemy.userData.speed * 1.3;

                        const distFromGuard = enemy.position.distanceTo(fleeFrom.position);
                        if (distFromGuard > 30) {
                            // Safe distance, go back to hunting
                            enemy.userData.eggThiefState = 'hunting';
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
                            enemy.userData.eggThiefState = 'hunting';
                            enemy.userData.fleeDir = null;
                            enemy.userData.stolenEgg = false;
                        }
                    }
                }

                // Fight back when attacked by nest guards
                if (nearbyGuard && nearbyGuardDist < enemy.userData.radius + nearbyGuard.userData.radius) {
                    if (enemy.userData.fightsNestGuards) {
                        nearbyGuard.userData.health -= enemy.userData.damage * delta * 0.5;
                        if (nearbyGuard.userData.health <= 0) {
                            convertToCarcass(nearbyGuard);
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
                    speed = enemy.userData.chaseSpeed || enemy.userData.speed; // Sprint when hunting babies
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
                            convertToCarcass(targetBaby);
                        }
                    }
                } else if (distance < CONFIG.ENEMY_DETECTION_RANGE) {
                    // No baby geese nearby, chase player
                    direction = new THREE.Vector3()
                        .subVectors(GameState.peccary.position, enemy.position)
                        .normalize();

                    // Use chaseSpeed from enemy data
                    speed = enemy.userData.chaseSpeed || enemy.userData.speed;

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

            // Skip generic movement + bob for deer and drongulinat cats — they have custom behavior
            if (enemy.userData.type !== 'deericus_iricus' && enemy.userData.type !== 'drongulinat_cat') {
                // Apply water slowdown (50% speed) - unless immune
                if (inWater && !enemy.userData.immuneToWater) {
                    speed *= 0.5;
                }

                // Move enemy
                enemy.position.x += direction.x * speed * delta;
                enemy.position.z += direction.z * speed * delta;

                // Rotate to face movement direction
                const targetRotation = -Math.atan2(direction.z, direction.x);

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
            }

            // --- Separation: push enemy away from player ---
            var separationRadius = enemy.userData.radius + GameState.peccary.userData.radius;
            if (distance < separationRadius && distance > 0.01) {
                var overlap = separationRadius - distance;
                var pushX = (enemy.position.x - GameState.peccary.position.x) / distance;
                var pushZ = (enemy.position.z - GameState.peccary.position.z) / distance;
                enemy.position.x += pushX * overlap * 0.5;
                enemy.position.z += pushZ * overlap * 0.5;
            }

            // --- Separation: push enemies away from each other ---
            for (var j = i + 1; j < GameState.enemies.length; j++) {
                var other = GameState.enemies[j];
                var dx = other.position.x - enemy.position.x;
                var dz = other.position.z - enemy.position.z;
                var enemyDist = Math.sqrt(dx * dx + dz * dz);
                var minDist = enemy.userData.radius + other.userData.radius;
                if (enemyDist < minDist && enemyDist > 0.01) {
                    var overlapAmt = minDist - enemyDist;
                    var nx = dx / enemyDist;
                    var nz = dz / enemyDist;
                    var halfPush = overlapAmt * 0.25;
                    enemy.position.x -= nx * halfPush;
                    enemy.position.z -= nz * halfPush;
                    other.position.x += nx * halfPush;
                    other.position.z += nz * halfPush;
                }
            }

            // Collision with player - only for hostile enemies (damage)
            if (!enemy.userData.friendly && distance < separationRadius) {
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
                    GameState.score += 20;
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

        cats.forEach(cat => {
            if (!cat.userData.homeTree) {
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
        }

        // Check if it's time to look for prey
        if (cat.userData.stateTimer > cat.userData.huntThreshold) {
            // Look for prey within range
            const prey = findCatPrey(cat);
            if (prey) {
                cat.userData.huntTarget = prey;
                cat.userData.lifecycleState = 'descending';
                cat.userData.stateTimer = 0;
                delete cat.userData.huntThreshold; // Reset for next time
            } else {
                // No prey found, try again in a few seconds
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
            if (playerDist <= huntRange) {
                // Player is medium priority prey (priority 3)
                bestPrey = GameState.peccary;
                bestPriority = 3;
            }
        }

        GameState.enemies.forEach(enemy => {
            if (enemy === cat) return;
            const dist = cat.position.distanceTo(enemy.position);
            if (dist > huntRange) return;

            // Check if valid prey using category system
            let priority = 0;
            const category = enemy.userData.category;
            const type = enemy.userData.type;
            const isBaby = enemy.userData.isBaby;

            // Herbivores - Primary prey (gazella, antelope)
            if (category === 'herbivore') {
                priority = isBaby ? 5 : 3; // Baby herbivores top priority, adults ok
            }
            // Omnivores - Good prey (toads, geese)
            else if (category === 'omnivore') {
                priority = isBaby ? 4 : 2; // Baby omnivores very high, adults decent
            }
            // Carnivores - Only hunt babies or small predators when desperate
            else if (category === 'carnivore') {
                if (type === 'wild_dog' && isBaby) {
                    // Only hunt pups if wild dog den is under cat's tree
                    const tree = cat.userData.homeTree;
                    const denNearby = GameState.wildDogDens && GameState.wildDogDens.some(den =>
                        den.position.distanceTo(tree.position) < 10
                    );
                    if (denNearby) {
                        priority = 4; // Pups from nearby den
                    }
                } else if (type === 'grass_viper') {
                    priority = 2; // Vipers (small snake predators)
                } else if (isBaby) {
                    priority = 3; // Baby carnivores (fox, badger, weasel babies)
                } else if (type === 'fox' || type === 'badger' || type === 'weasel') {
                    priority = 1; // Small adult carnivores (only if desperate)
                }
                // Don't hunt adult wild dogs or other adult cats
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
                catModel.rotation.y = -landAngle;
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

                // Convert prey to carcass and start eating it
                convertToCarcass(target);
                cat.userData.eatingCarcass = target;
                target.userData.carcassBeingEaten = true;
                target.userData.carcassEater = cat;

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

        // Eat from carcass if available
        var carcass = cat.userData.eatingCarcass;
        if (carcass && carcass.userData && carcass.userData.isCarcass) {
            var stillEating = eatFromCarcass(cat, carcass, delta);
            if (!stillEating) {
                stopEatingCarcass(carcass);
                cat.userData.eatingCarcass = null;
                cat.userData.lifecycleState = 'ascending';
                cat.userData.stateTimer = 0;
                return;
            }
        }

        // Eating time based on meal size
        const eatTime = 5 + (cat.userData.mealSize || 1) * 3;

        if (cat.userData.stateTimer > eatTime) {
            if (carcass) {
                stopEatingCarcass(carcass);
                cat.userData.eatingCarcass = null;
            }
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

            // Reset model rotation
            const catModel = cat.children[0];
            if (catModel) {
                catModel.rotation.x = 0;
                catModel.rotation.y = 0;
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
            cat.rotation.y = -Math.atan2(dir.z, dir.x);
        } else {
            // Attack! Deal damage
            threat.userData.health = (threat.userData.health || 10) - cat.userData.damage * delta;

            if (threat.userData.health <= 0) {
                // Threat killed
                console.log('Mother cat drove off threat!');
                if (threat !== GameState.peccary) {
                    convertToCarcass(threat);
                }
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
                cat.rotation.y = -Math.atan2(cat.userData.playDir.z, cat.userData.playDir.x);
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
    // DRONGULINAT CAT BEHAVIOR (SNOWY MOUNTAINS)
    // ========================================================================

    /**
     * Main update loop for all Drongulinat Cats.
     * Handles: wandering, mating, pregnancy/birth, hunting deer, retaliation.
     */
    function updateDrongulinatCats(delta) {
        var cats = GameState.enemies.filter(function(e) {
            return e.userData.type === 'drongulinat_cat';
        });

        cats.forEach(function(cat) {
            // --- Baby maturity ---
            if (cat.userData.isBaby && cat.userData.maturityTime) {
                if (GameState.clock.elapsedTime > cat.userData.maturityTime) {
                    growDrongulinatKitten(cat);
                    return; // Skip rest this frame
                }
            }

            // --- Provoked combat: chase player ---
            if (cat.userData.wasAttackedByPlayer) {
                chaseDrongulinatPlayer(cat, delta);
                return; // Combat overrides everything
            }

            // --- Hunting (males and non-pregnant females) ---
            if (!cat.userData.isBaby) {
                cat.userData.hungerTimer -= delta;

                if (cat.userData.isEating) {
                    // Eat from the carcass if we have one
                    var carcass = cat.userData.eatingCarcass;
                    if (carcass && carcass.userData && carcass.userData.isCarcass) {
                        var stillEating = eatFromCarcass(cat, carcass, delta);
                        if (!stillEating) {
                            // Carcass fully consumed
                            stopEatingCarcass(carcass);
                            cat.userData.isEating = false;
                            cat.userData.eatingCarcass = null;
                            cat.userData.hungerTimer = 120 + Math.random() * 60;
                        }
                    } else {
                        // No carcass (maybe it decomposed), just stop eating
                        cat.userData.eatingTimer -= delta;
                        if (cat.userData.eatingTimer <= 0) {
                            cat.userData.isEating = false;
                            cat.userData.eatingCarcass = null;
                            cat.userData.hungerTimer = 120 + Math.random() * 60;
                        }
                    }
                    // Stay still while eating — idle animation (speed 0)
                    animateDrongulinatCat(cat, delta, 0);
                    return;
                }

                if (cat.userData.hungerTimer <= 0 && !cat.userData.isHunting) {
                    // First check for nearby carcasses (free food!)
                    var nearbyCarcass = findNearestCarcass(cat, 25);
                    if (nearbyCarcass) {
                        // Walk to the carcass and eat it
                        var dx = nearbyCarcass.position.x - cat.position.x;
                        var dz = nearbyCarcass.position.z - cat.position.z;
                        var distToCarcass = Math.sqrt(dx * dx + dz * dz);
                        if (distToCarcass < 2) {
                            // Close enough — start eating
                            cat.userData.isEating = true;
                            cat.userData.eatingCarcass = nearbyCarcass;
                            cat.userData.isMoving = false;
                            nearbyCarcass.userData.carcassBeingEaten = true;
                            nearbyCarcass.userData.carcassEater = cat;
                        } else {
                            // Walk toward carcass
                            var walkSpeed = cat.userData.speed;
                            cat.position.x += (dx / distToCarcass) * walkSpeed * delta;
                            cat.position.z += (dz / distToCarcass) * walkSpeed * delta;
                            cat.rotation.y = -Math.atan2(dz, dx);
                            cat.userData.isMoving = true;
                            animateDrongulinatCat(cat, delta, walkSpeed);
                        }
                        return;
                    }

                    // No carcass nearby — try to find a deer to hunt
                    var deer = findNearestDeer(cat, 30);
                    if (deer) {
                        cat.userData.isHunting = true;
                        cat.userData.huntTarget = deer;
                        deer.userData.isFleeing = true;
                        deer.userData.fleeingFrom = cat;
                    }
                }

                if (cat.userData.isHunting) {
                    huntDeer(cat, delta);
                    return;
                }
            }

            // --- Mating (males only) ---
            if (cat.userData.id && cat.userData.id.includes('male') && !cat.userData.id.includes('baby') && !cat.userData.id.includes('female')) {
                cat.userData.matingTimer -= delta;
                if (cat.userData.matingTimer <= 0 && !cat.userData.isMating) {
                    var female = findNearestDrongulinatFemale(cat);
                    if (female) {
                        cat.userData.isMating = true;
                        cat.userData.mateTarget = female;
                    } else {
                        cat.userData.matingTimer = 30; // Try again in 30s
                    }
                }

                if (cat.userData.isMating) {
                    mateDrongulinat(cat, delta);
                    return;
                }
            }

            // --- Pregnancy (females only) ---
            if (cat.userData.isPregnant) {
                cat.userData.gestationTimer -= delta;
                if (cat.userData.gestationTimer <= 0) {
                    giveBirthDrongulinat(cat);
                }
            }

            // --- Default: wander around ---
            wanderDrongulinat(cat, delta);
            var wanderSpeed = (cat.userData.speed || 3) * 0.3;
            animateDrongulinatCat(cat, delta, wanderSpeed);
        });
    }

    /**
     * Walking animation for drongulinat cats.
     * At low speeds: gentle walk (legs only, no spine gallop).
     * At high speeds: full cheetah gallop via shared dronglous animation.
     * @param {number} moveSpeed - Actual movement speed (0 = idle)
     */
    function animateDrongulinatCat(cat, delta, moveSpeed) {
        var terrainY = Environment.getTerrainHeight(cat.position.x, cat.position.z);
        var baseY = terrainY + (cat.userData.groundY || 0.3);
        cat.position.y = baseY;

        // At high speeds (hunting/chasing), use the full gallop animation
        if (moveSpeed >= 6) {
            var animSpeed = 2 + (moveSpeed / 10) * 6;
            animateDronglousCat(cat, delta, true, animSpeed);
            return;
        }

        // At low speeds or idle, do a simple walk with just legs — no spine gallop.
        // Find the inner model with parts/legs
        var catModel = cat;
        if (!cat.userData.parts && cat.children.length > 0) {
            catModel = cat.children[0];
        }
        if (!catModel.userData || !catModel.userData.parts || !catModel.userData.legs) {
            return;
        }

        var parts = catModel.userData.parts;
        var legs = catModel.userData.legs;
        var anim = catModel.userData.animState;

        if (moveSpeed > 0) {
            // Gentle walk cycle — slow, natural stride
            anim.runCycle += delta * moveSpeed * 3;  // Slow cycle: speed 2.4 → 7.2/s
            var cycle = anim.runCycle;

            // Legs: alternating walk pattern (diagonal pairs like a real cat)
            // Model faces +X, legs hang along -Y, so forward/back swing = rotation.z
            legs.forEach(function(leg) {
                // Diagonal pairing: front-left + back-right move together
                var phase = leg.isFront ? 0 : Math.PI;
                var sidePhase = leg.side === 'right' ? Math.PI : 0;
                var legCycle = cycle + phase + sidePhase;

                // Gentle leg swing (forward/backward)
                var swing = Math.sin(legCycle) * 0.35;
                leg.upperLegGroup.rotation.z = swing;

                // Subtle knee bend when lifting
                var knee = Math.max(0, Math.sin(legCycle + 0.5)) * 0.3;
                leg.kneeGroup.rotation.z = knee;

                // Lower leg follows
                leg.lowerLegGroup.rotation.z = Math.sin(legCycle + 1) * 0.15;
                leg.ankleGroup.rotation.z = -Math.sin(legCycle + 1.5) * 0.1;
                leg.pawGroup.rotation.z = 0;

                // Decay any leftover X rotation from gallop
                leg.upperLegGroup.rotation.x *= 0.85;
                leg.kneeGroup.rotation.x *= 0.85;
                leg.lowerLegGroup.rotation.x *= 0.85;
                leg.ankleGroup.rotation.x *= 0.85;
                leg.pawGroup.rotation.x *= 0.85;
            });

            // Very subtle body bob — no spine bending
            parts.frontSpine.rotation.x *= 0.9;
            parts.midSpine.rotation.x *= 0.9;
            parts.rearSpine.rotation.x *= 0.9;
            parts.frontSpine.position.y *= 0.9;
            parts.midSpine.position.y *= 0.9;
            parts.rearSpine.position.y *= 0.9;

            // Gentle head bob
            parts.headGroup.rotation.x = Math.sin(cycle * 2) * 0.03;

            // Gentle tail swish
            if (parts.tailSegments) {
                parts.tailSegments.forEach(function(seg, i) {
                    seg.rotation.x = Math.sin(cycle * 0.8 + i * 0.4) * 0.08;
                    seg.rotation.z = 0.15 + Math.sin(cycle * 0.5 + i * 0.3) * 0.06;
                });
            }
        } else {
            // Idle — use the dronglous idle animation (gentle breathing)
            animateDronglousCat(cat, delta, false, 0);
        }
    }

    /**
     * Wander randomly around the snow.
     */
    function wanderDrongulinat(cat, delta) {
        cat.userData.isMoving = true;

        // Pick a new wander direction periodically
        if (!cat.userData.wanderDir || !cat.userData.wanderTime) {
            cat.userData.wanderDir = new THREE.Vector3(
                Math.random() * 2 - 1, 0, Math.random() * 2 - 1
            ).normalize();
            cat.userData.wanderTime = 3 + Math.random() * 5; // 3-8 seconds
        }

        cat.userData.wanderTime -= delta;
        if (cat.userData.wanderTime <= 0) {
            cat.userData.wanderDir = new THREE.Vector3(
                Math.random() * 2 - 1, 0, Math.random() * 2 - 1
            ).normalize();
            cat.userData.wanderTime = 3 + Math.random() * 5;
        }

        var speed = (cat.userData.speed || 3) * 0.3; // Slow wander
        cat.position.x += cat.userData.wanderDir.x * speed * delta;
        cat.position.z += cat.userData.wanderDir.z * speed * delta;

        // Face movement direction
        var targetRot = -Math.atan2(cat.userData.wanderDir.z, cat.userData.wanderDir.x);
        var diff = targetRot - cat.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        cat.rotation.y += diff * 0.1;

        // Keep within world bounds
        var bound = CONFIG.WORLD_SIZE * 0.6;
        if (Math.abs(cat.position.x) > bound || Math.abs(cat.position.z) > bound) {
            cat.userData.wanderDir = new THREE.Vector3(
                -cat.position.x * 0.1, 0, -cat.position.z * 0.1
            ).normalize();
            cat.userData.wanderTime = 3;
        }
    }

    /**
     * Find nearest non-pregnant female drongulinat cat.
     */
    function findNearestDrongulinatFemale(male) {
        var nearest = null;
        var nearestDist = Infinity;

        GameState.enemies.forEach(function(e) {
            if (e.userData.type === 'drongulinat_cat' &&
                e.userData.id && e.userData.id.includes('female') &&
                !e.userData.id.includes('baby') &&
                !e.userData.isPregnant) {
                var dx = e.position.x - male.position.x;
                var dz = e.position.z - male.position.z;
                var dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < nearestDist && dist < 40) {
                    nearest = e;
                    nearestDist = dist;
                }
            }
        });
        return nearest;
    }

    /**
     * Male runs to female to mate.
     */
    function mateDrongulinat(male, delta) {
        var female = male.userData.mateTarget;
        if (!female || !female.parent) {
            male.userData.isMating = false;
            male.userData.matingTimer = 60 + Math.random() * 60;
            return;
        }

        var dx = female.position.x - male.position.x;
        var dz = female.position.z - male.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 2) {
            // Arrived! Impregnate female
            female.userData.isPregnant = true;
            female.userData.gestationTimer = 300; // 5 minutes
            female.userData.father = male;
            male.userData.isMating = false;
            male.userData.matingTimer = 120 + Math.random() * 60; // 2-3 min
            console.log('Drongulinat cat mating! Gestation: 5 minutes');
        } else {
            // Move toward female at full speed
            var speed = male.userData.speed || 8;
            var dirX = dx / dist;
            var dirZ = dz / dist;
            male.position.x += dirX * speed * delta;
            male.position.z += dirZ * speed * delta;

            var targetRot = -Math.atan2(dirZ, dirX);
            var diff = targetRot - male.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            male.rotation.y += diff * 0.15;
        }

        // Animate — running toward female, or idle if arrived
        var mateSpeed = (dist < 2) ? 0 : (male.userData.speed || 8);
        animateDrongulinatCat(male, delta, mateSpeed);
    }

    /**
     * Female gives birth to 3 kittens.
     */
    function giveBirthDrongulinat(mother) {
        console.log('Drongulinat cat giving birth!');
        mother.userData.isPregnant = false;
        mother.userData.gestationTimer = 0;

        var babyMaleData = ENEMIES.find(function(e) { return e.id === 'drongulinat_cat_baby_male'; });
        var babyFemaleData = ENEMIES.find(function(e) { return e.id === 'drongulinat_cat_baby_female'; });

        for (var i = 0; i < 3; i++) {
            var isMale = Math.random() > 0.5;
            var babyData = isMale ? babyMaleData : babyFemaleData;
            if (!babyData) continue;

            var angle = (Math.PI * 2 / 3) * i;
            var bx = mother.position.x + Math.cos(angle) * 2;
            var bz = mother.position.z + Math.sin(angle) * 2;

            var baby = createEnemy(babyData, bx, bz);
            baby.userData.ignoreGravity = true;  // Skip updateEnemies
            baby.userData.mother = mother;
            baby.userData.maturityTime = GameState.clock.elapsedTime + 180; // 3 minutes
            baby.userData.isBaby = true;
            baby.userData.hungerTimer = 999;
            baby.userData.wasAttackedByPlayer = false;
            baby.userData.isRetaliating = false;
            GameState.scene.add(baby);
            GameState.enemies.push(baby);
        }
        console.log('3 drongulinat kittens born!');
    }

    /**
     * Grow a baby kitten into an adult.
     */
    function growDrongulinatKitten(baby) {
        console.log('Drongulinat kitten growing up!');
        var isMale = baby.userData.id && baby.userData.id.includes('male');
        var adultData = ENEMIES.find(function(e) {
            return e.id === (isMale ? 'drongulinat_cat_male' : 'drongulinat_cat_female');
        });
        if (!adultData) return;

        var adult = createEnemy(adultData, baby.position.x, baby.position.z);
        adult.userData.ignoreGravity = true;  // Skip updateEnemies
        adult.userData.matingTimer = 60 + Math.random() * 60;
        adult.userData.hungerTimer = 30 + Math.random() * 30;
        adult.userData.wasAttackedByPlayer = false;
        adult.userData.isRetaliating = false;
        if (!isMale) {
            adult.userData.isPregnant = false;
            adult.userData.gestationTimer = 0;
        }
        GameState.scene.add(adult);
        GameState.enemies.push(adult);

        // Remove baby
        GameState.scene.remove(baby);
        var idx = GameState.enemies.indexOf(baby);
        if (idx > -1) GameState.enemies.splice(idx, 1);
    }

    /**
     * Find nearest deer to hunt.
     */
    function findNearestDeer(cat, maxRange) {
        var nearest = null;
        var nearestDist = Infinity;

        GameState.enemies.forEach(function(e) {
            if (e.userData.type === 'deericus_iricus') {
                var dx = e.position.x - cat.position.x;
                var dz = e.position.z - cat.position.z;
                var dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < nearestDist && dist < maxRange) {
                    nearest = e;
                    nearestDist = dist;
                }
            }
        });
        return nearest;
    }

    /**
     * Chase and hunt a deer.
     */
    function huntDeer(cat, delta) {
        var deer = cat.userData.huntTarget;

        if (!deer || !deer.parent) {
            cat.userData.isHunting = false;
            cat.userData.huntTarget = null;
            cat.userData.hungerTimer = 30;
            return;
        }

        var dx = deer.position.x - cat.position.x;
        var dz = deer.position.z - cat.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        // Give up if deer is too far
        if (dist > 50) {
            cat.userData.isHunting = false;
            cat.userData.huntTarget = null;
            cat.userData.hungerTimer = 30;
            deer.userData.isFleeing = false;
            deer.userData.fleeingFrom = null;
            return;
        }

        // Chase at high speed
        var speed = 10;
        var dirX = dx / dist;
        var dirZ = dz / dist;
        cat.position.x += dirX * speed * delta;
        cat.position.z += dirZ * speed * delta;

        var targetRot = -Math.atan2(dirZ, dirX);
        var diff = targetRot - cat.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        cat.rotation.y += diff * 0.2;

        // Full gallop animation while chasing prey
        animateDrongulinatCat(cat, delta, 10);

        // Catch the deer!
        if (dist < 1.5) {
            performTakedown(cat, deer);
        }
    }

    /**
     * Dramatic takedown when cat catches a deer.
     */
    function performTakedown(cat, deer) {
        console.log('Drongulinat cat takedown!');

        // Convert deer to carcass instead of removing
        convertToCarcass(deer);

        // Cat enters eating state — now eats from the carcass
        cat.userData.isHunting = false;
        cat.userData.huntTarget = null;
        cat.userData.isEating = true;
        cat.userData.eatingTimer = 30;
        cat.userData.eatingCarcass = deer;  // Track which carcass it's eating
        cat.userData.isMoving = false;

        // Mark carcass as being eaten by this cat
        deer.userData.carcassBeingEaten = true;
        deer.userData.carcassEater = cat;
    }

    /**
     * Chase and attack the player (retaliation).
     */
    function chaseDrongulinatPlayer(cat, delta) {
        var player = GameState.peccary;
        if (!player) return;

        var dx = player.position.x - cat.position.x;
        var dz = player.position.z - cat.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        // Give up if player gets very far away
        if (dist > 40) {
            cat.userData.wasAttackedByPlayer = false;
            cat.userData.isRetaliating = false;
            return;
        }

        // Chase aggressively
        var speed = 10;
        var dirX = dx / dist;
        var dirZ = dz / dist;
        cat.position.x += dirX * speed * delta;
        cat.position.z += dirZ * speed * delta;

        var targetRot = -Math.atan2(dirZ, dirX);
        var diff = targetRot - cat.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        cat.rotation.y += diff * 0.2;

        // Full gallop animation while chasing player
        animateDrongulinatCat(cat, delta, 10);

        // Deal damage on contact
        if (dist < 1.5) {
            Game.takeDamage(cat.userData.damage * delta, 'drongulinat_cat');
        }
    }

    // ========================================================================
    // CARCASS SYSTEM - Dead animals leave bodies that predators eat
    // ========================================================================

    /**
     * Convert a dead enemy into a carcass.
     * The body tips on its side, shrinks as predators eat, and decomposes after 5 min.
     * @param {THREE.Group} enemy - The enemy that just died
     * @param {THREE.Group|null} killer - The predator that killed it (if any)
     */
    function convertToCarcass(enemy) {
        if (!enemy || !enemy.userData) return;

        // Remove from enemies array (no longer alive)
        var idx = GameState.enemies.indexOf(enemy);
        if (idx > -1) GameState.enemies.splice(idx, 1);

        // Remove from herd if it was a deer
        if (enemy.userData.herd) {
            var herd = enemy.userData.herd;
            var hIdx = herd.members.indexOf(enemy);
            if (hIdx > -1) herd.members.splice(hIdx, 1);
            if (herd.leader === enemy) {
                var males = herd.members.filter(function(m) {
                    return m.userData.gender === 'male' && m.userData.age === 'adult';
                });
                if (males.length > 0) { herd.leader = males[0]; males[0].userData.isLeader = true; }
            }
        }

        // Remove from antelope herds if applicable
        if (GameState.antelopeHerds) {
            GameState.antelopeHerds.forEach(function(herd) {
                var aIdx = herd.members.indexOf(enemy);
                if (aIdx > -1) herd.members.splice(aIdx, 1);
            });
        }

        // Remove from baluban oxen herds if applicable
        if (GameState.balubanOxenHerds) {
            GameState.balubanOxenHerds.forEach(function(herd) {
                var oIdx = herd.members.indexOf(enemy);
                if (oIdx > -1) herd.members.splice(oIdx, 1);
                if (herd.leader === enemy) {
                    var males = herd.members.filter(function(m) {
                        return m.userData.gender === 'male' && !m.userData.isBaby;
                    });
                    if (males.length > 0) {
                        herd.leader = males[0];
                        males[0].userData.isLeader = true;
                    }
                }
            });
        }

        // Tip it on its side (rotate 90 degrees around Z axis)
        enemy.rotation.z = Math.PI / 2;

        // Store original colors for the decay stages
        var originalColors = [];
        enemy.traverse(function(child) {
            if (child.isMesh && child.material) {
                child.material = child.material.clone(); // Clone so we can change colors
                originalColors.push({
                    mesh: child,
                    color: child.material.color.getHex()
                });
            }
        });

        // Mark as carcass with all the data we need
        enemy.userData.isCarcass = true;
        enemy.userData.carcassOriginalColors = originalColors;
        enemy.userData.carcassMeatLeft = 1.0;       // 1.0 = full, 0.0 = skeleton
        enemy.userData.carcassOriginalScale = enemy.scale.x;
        enemy.userData.carcassDecomposeTimer = 300;  // 5 min (300 seconds) until decompose
        enemy.userData.carcassBeingEaten = false;     // Is a predator currently eating?
        enemy.userData.carcassEater = null;            // Which predator is eating
        enemy.userData.carcassSinking = false;         // Has it started sinking?
        enemy.userData.carcassAge = 0;                 // How long since death

        // Initialize carcasses array if needed
        if (!GameState.carcasses) GameState.carcasses = [];
        GameState.carcasses.push(enemy);

        console.log('Carcass created:', enemy.userData.type, 'meat:', enemy.userData.carcassMeatLeft);
    }

    /**
     * Update all carcasses — handle color decay, predator eating, and decomposition.
     * Called every frame from the game loop.
     */
    function updateCarcasses(delta) {
        if (!GameState.carcasses || GameState.carcasses.length === 0) return;

        for (var i = GameState.carcasses.length - 1; i >= 0; i--) {
            var carcass = GameState.carcasses[i];
            if (!carcass || !carcass.userData) {
                GameState.carcasses.splice(i, 1);
                continue;
            }

            carcass.userData.carcassAge += delta;

            // === SINKING PHASE ===
            if (carcass.userData.carcassSinking) {
                // Sink into the ground over 3 seconds
                carcass.position.y -= delta * 0.5;
                // Fade opacity
                carcass.traverse(function(child) {
                    if (child.isMesh && child.material) {
                        child.material.transparent = true;
                        child.material.opacity = Math.max(0, child.material.opacity - delta * 0.3);
                    }
                });
                // Fully sunk — remove
                if (carcass.position.y < -2) {
                    GameState.scene.remove(carcass);
                    GameState.carcasses.splice(i, 1);
                }
                continue;
            }

            // === DECOMPOSE TIMER (only counts down when NOT being eaten) ===
            if (!carcass.userData.carcassBeingEaten) {
                carcass.userData.carcassDecomposeTimer -= delta;
                if (carcass.userData.carcassDecomposeTimer <= 0) {
                    // Start sinking into the ground
                    carcass.userData.carcassSinking = true;
                    continue;
                }
            }

            // === UPDATE VISUAL APPEARANCE based on meat left ===
            var meat = carcass.userData.carcassMeatLeft;
            var colors = carcass.userData.carcassOriginalColors;

            // Shrink the body as meat is consumed
            var minScale = carcass.userData.carcassOriginalScale * 0.3; // Don't shrink below 30%
            var currentScale = carcass.userData.carcassOriginalScale * (0.3 + 0.7 * meat);
            carcass.scale.set(currentScale, currentScale, currentScale);

            // Color stages: fresh → raw red → bone grey
            if (colors) {
                for (var c = 0; c < colors.length; c++) {
                    var entry = colors[c];
                    var origR = ((entry.color >> 16) & 0xff) / 255;
                    var origG = ((entry.color >> 8) & 0xff) / 255;
                    var origB = (entry.color & 0xff) / 255;

                    if (meat > 0.5) {
                        // Fresh → Raw: blend toward red
                        var t = 1 - (meat - 0.5) * 2; // 0 at meat=1, 1 at meat=0.5
                        var r = origR + (0.7 - origR) * t;
                        var g = origG + (0.2 - origG) * t;
                        var b = origB + (0.2 - origB) * t;
                        entry.mesh.material.color.setRGB(r, g, b);
                    } else {
                        // Raw → Bone: blend from red toward grey-white
                        var t2 = 1 - meat * 2; // 0 at meat=0.5, 1 at meat=0
                        var r2 = 0.7 + (0.85 - 0.7) * t2;
                        var g2 = 0.2 + (0.82 - 0.2) * t2;
                        var b2 = 0.2 + (0.78 - 0.2) * t2;
                        entry.mesh.material.color.setRGB(r2, g2, b2);
                    }
                }
            }

            // === If fully eaten (meat = 0), start sinking ===
            if (meat <= 0) {
                carcass.userData.carcassSinking = true;
            }
        }
    }

    /**
     * Find the nearest carcass to a predator within a given range.
     * @param {THREE.Group} predator - The hungry predator
     * @param {number} maxRange - Maximum search distance
     * @returns {THREE.Group|null} - Nearest carcass, or null
     */
    function findNearestCarcass(predator, maxRange) {
        if (!GameState.carcasses || GameState.carcasses.length === 0) return null;

        var closest = null;
        var closestDist = maxRange;

        for (var i = 0; i < GameState.carcasses.length; i++) {
            var carcass = GameState.carcasses[i];
            if (!carcass || !carcass.userData) continue;
            if (carcass.userData.carcassSinking) continue;  // Don't eat sinking ones
            if (carcass.userData.carcassBeingEaten && carcass.userData.carcassEater !== predator) continue;  // Someone else is eating it
            if (carcass.userData.carcassMeatLeft <= 0) continue;

            var dx = carcass.position.x - predator.position.x;
            var dz = carcass.position.z - predator.position.z;
            var dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < closestDist) {
                closestDist = dist;
                closest = carcass;
            }
        }
        return closest;
    }

    /**
     * Make a predator eat from a carcass.
     * Bigger predators eat faster (take more meat per second).
     * @param {THREE.Group} predator - The predator eating
     * @param {THREE.Group} carcass - The carcass being eaten
     * @param {number} delta - Time since last frame
     */
    function eatFromCarcass(predator, carcass, delta) {
        if (!carcass || !carcass.userData || carcass.userData.carcassMeatLeft <= 0) return false;

        // Mark carcass as being eaten (pauses decompose timer)
        carcass.userData.carcassBeingEaten = true;
        carcass.userData.carcassEater = predator;

        // Bigger predators eat faster
        // predator size is usually 0.5 (baby) to 1.5 (big cat)
        var predatorSize = predator.userData.size || 1;
        var eatRate = 0.03 * predatorSize * delta;  // ~3% per second for size-1 predator

        carcass.userData.carcassMeatLeft = Math.max(0, carcass.userData.carcassMeatLeft - eatRate);

        // If fully eaten, predator is done
        if (carcass.userData.carcassMeatLeft <= 0) {
            carcass.userData.carcassBeingEaten = false;
            carcass.userData.carcassEater = null;
            return false; // No more meat
        }
        return true; // Still eating
    }

    /**
     * Stop a predator from eating (e.g. if disturbed or full).
     */
    function stopEatingCarcass(carcass) {
        if (!carcass || !carcass.userData) return;
        carcass.userData.carcassBeingEaten = false;
        carcass.userData.carcassEater = null;
    }

    // ========================================================================
    // PLAYER COMBAT - Damage an enemy with a weapon
    // ========================================================================
    /**
     * Deal damage to an enemy from the player's weapon.
     * Handles health reduction, hit flash, death, and rewards.
     * @param {THREE.Group} enemy - The enemy to damage
     * @param {number} amount - Damage amount
     */
    function damageEnemy(enemy, amount) {
        if (!enemy || !enemy.userData) return;

        // Drongulinat cats retaliate when attacked by player
        if (enemy.userData.type === 'drongulinat_cat') {
            enemy.userData.wasAttackedByPlayer = true;
        }

        enemy.userData.health -= amount;

        // Hit flash — turn enemy red briefly
        const meshes = [];
        enemy.traverse(function(child) {
            if (child.isMesh && child.material) {
                meshes.push({ mesh: child, origColor: child.material.color.getHex() });
                child.material = child.material.clone();
                child.material.color.setHex(0xff0000);
            }
        });
        // Restore original colors after 150ms
        setTimeout(function() {
            meshes.forEach(function(entry) {
                if (entry.mesh.material) {
                    entry.mesh.material.color.setHex(entry.origColor);
                }
            });
        }, 150);

        // Check for death
        if (enemy.userData.health <= 0) {
            // Convert to carcass instead of removing
            convertToCarcass(enemy);

            // Give score and coins as reward (tiered by enemy toughness)
            var rewards = CONFIG.KILL_REWARDS || { weak: { score: 10, coins: 5 }, medium: { score: 25, coins: 15 }, tough: { score: 50, coins: 30 } };
            var tier = enemy.userData.maxHealth >= 10 ? rewards.tough : enemy.userData.maxHealth >= 5 ? rewards.medium : rewards.weak;
            GameState.score += tier.score;
            GameState.pigCoins += tier.coins;
            Game.playSound('collect');
            UI.updateUI();
        }
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

        // Deericus Iricus (deer) functions
        spawnDeericusIricusHerd: spawnDeericusIricusHerd,
        updateDeerMaturation: updateDeerMaturation,
        updateBachelorHerdFormation: updateBachelorHerdFormation,
        triggerDeerMating: triggerDeerMating,
        updateDeerMating: updateDeerMating,
        updateDeerBehavior: updateDeerBehavior,
        deerTakeDamage: deerTakeDamage,

        // Drongulinat Cat functions
        spawnDrongulinatCats: spawnDrongulinatCats,
        updateDrongulinatCats: updateDrongulinatCats,

        // Snow Caninon Lartus functions
        spawnSnowCaninonPack: spawnSnowCaninonPack,
        updateSnowCaninonBehavior: updateSnowCaninonBehavior,
        triggerSnowCaninonHunt: triggerSnowCaninonHunt,

        // Baluban Oxen functions
        spawnBalubanOxenHerd: spawnBalubanOxenHerd,
        updateBalubanOxenBehavior: updateBalubanOxenBehavior,
        triggerBalubanOxenMating: triggerBalubanOxenMating,

        // Player combat
        damageEnemy: damageEnemy,

        // Carcass system
        updateCarcasses: updateCarcasses,
        convertToCarcass: convertToCarcass,
        findNearestCarcass: findNearestCarcass,

        // Expose model builders for advanced use
        modelBuilders: modelBuilders
    };
})();
