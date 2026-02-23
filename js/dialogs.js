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
        const vx = CONFIG.VILLAGE_CENTER.x;
        const vz = CONFIG.VILLAGE_CENTER.z;

        CONFIG.VILLAGER_DATA.forEach(data => {
            const villager = createPigVillager(data);
            villager.position.set(vx + data.position.x, 0, vz + data.position.z);
            villager.rotation.y = Math.random() * Math.PI * 2;
            GameState.villagers.push(villager);
            GameState.scene.add(villager);
        });
    }

    /**
     * Update villagers - animations and proximity check.
     */
    function updateVillagers(delta) {
        GameState.nearbyVillager = null;
        const interactPrompt = document.getElementById('interact-prompt');

        GameState.villagers.forEach((villager, index) => {
            villager.children[0].rotation.y = Math.sin(GameState.clock.elapsedTime * 0.5 + index) * 0.1;
            villager.position.y = Math.sin(GameState.clock.elapsedTime * 1.5 + index) * 0.05;

            const dist = villager.position.distanceTo(GameState.peccary.position);

            if (dist < villager.userData.interactRange) {
                GameState.nearbyVillager = villager;
                const dx = GameState.peccary.position.x - villager.position.x;
                const dz = GameState.peccary.position.z - villager.position.z;
                villager.rotation.y = Math.atan2(dx, dz);
            }
        });

        if (GameState.nearbyVillager && !GameState.isDialogOpen) {
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

        dialogName.textContent = `${villager.userData.name} - ${villager.userData.role}`;
        dialogText.textContent = node.text;

        dialogOptions.innerHTML = '';

        node.choices.forEach((choice, index) => {
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
     * Handle selecting a dialog choice.
     *
     * Choices can have effects defined in two ways:
     * 1. NEW WAY: effectData object (from data files) - handled by Effects.execute()
     * 2. OLD WAY: action string (for backwards compatibility)
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
                                   'trade_fail' ||
                                   'heal_fail';
                const failNode = villager.userData.conversationTree.nodes[failNodeId];

                if (failNode) {
                    renderDialogNode(failNode, villager);
                    Game.playSound('hurt');
                    return;
                }
            }
        }

        // ====================================================================
        // OLD ACTION SYSTEM (for backwards compatibility)
        // ====================================================================
        // If choice has an action string, use the old executeDialogAction
        if (choice.action) {
            success = executeDialogAction(choice.action, villager);

            if (!success) {
                const failNode = villager.userData.conversationTree.nodes['trade_fail'] ||
                                 villager.userData.conversationTree.nodes['heal_fail'];
                if (failNode) {
                    renderDialogNode(failNode, villager);
                    Game.playSound('hurt');
                    return;
                }
            }
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
     * Execute a dialog action (trading, healing, etc.)
     */
    function executeDialogAction(actionName, villager) {
        switch (actionName) {
            case 'open_shop':
                UI.openShop();
                return true;

            case 'trade_berries':
                if (GameState.resourceCounts.berries >= 10) {
                    GameState.resourceCounts.berries -= 10;
                    GameState.health = Math.min(100, GameState.health + 20);
                    UI.updateUI();
                    return true;
                }
                return false;

            case 'trade_nuts':
                if (GameState.resourceCounts.nuts >= 5) {
                    GameState.resourceCounts.nuts -= 5;
                    GameState.health = Math.min(100, GameState.health + 15);
                    GameState.score += 50;
                    UI.updateUI();
                    return true;
                }
                return false;

            case 'trade_mushrooms':
                if (GameState.resourceCounts.mushrooms >= 3) {
                    GameState.resourceCounts.mushrooms -= 3;
                    GameState.health = Math.min(100, GameState.health + 30);
                    UI.updateUI();
                    return true;
                }
                return false;

            case 'heal_player':
                if (GameState.health < 100) {
                    GameState.health = 100;
                    UI.updateUI();
                    return true;
                }
                return false;

            default:
                return true;
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
        document.getElementById('dialog-box').classList.add('hidden');
        document.getElementById('dialog-options').innerHTML = '';
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
        executeDialogAction: executeDialogAction
    };
})();
