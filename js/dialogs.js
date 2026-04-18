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

        // Resolve dynamic Easter dialog content
        var resolved = resolveEasterDialog(node, villager);
        var displayText = resolved.text;
        var displayChoices = resolved.choices;

        dialogName.textContent = `${villager.userData.name} - ${villager.userData.role}`;
        dialogText.textContent = displayText;

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

    // Public API
    return {
        createPigVillager: createPigVillager,
        createVillagers: createVillagers,
        updateVillagers: updateVillagers,
        openDialog: openDialog,
        closeDialog: closeDialog,
        advanceDialog: advanceDialog,
        selectDialogChoice: selectDialogChoice
    };
})();
