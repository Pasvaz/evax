/**
 * ============================================================================
 * EFFECTS SYSTEM - Logic File
 * ============================================================================
 *
 * This file is the "brain" that makes effects from data files work.
 * It reads effect objects and executes them.
 *
 * You DON'T need to edit this file to add new effects to the game!
 * Instead, add effects to the data files (villagers.js, recipes.js, etc.)
 *
 * ============================================================================
 * HOW IT WORKS
 * ============================================================================
 *
 * 1. Data files define effects as simple objects:
 *    effect: { type: 'heal', amount: 30 }
 *
 * 2. When the player triggers an effect (crafting, buying, dialog choice),
 *    this file's execute() function is called.
 *
 * 3. The execute() function reads the effect type and does the right thing:
 *    - 'heal' → adds health
 *    - 'give_coins' → adds pig coins
 *    - 'trade' → checks resources, takes cost, gives reward
 *    - etc.
 *
 * ============================================================================
 * SUPPORTED EFFECT TYPES
 * ============================================================================
 *
 * { type: 'heal', amount: 30 }
 *   → Adds 30 health (max 100)
 *
 * { type: 'full_heal' }
 *   → Sets health to 100 (fails if already at 100)
 *
 * { type: 'give_coins', amount: 50 }
 *   → Adds 50 pig coins
 *
 * { type: 'give_score', amount: 100 }
 *   → Adds 100 to score
 *
 * { type: 'open_shop' }
 *   → Opens the shop menu
 *
 * { type: 'trade', cost: {...}, reward: {...} }
 *   → Takes resources from player, gives rewards
 *   → Fails if player doesn't have enough resources
 *
 * { type: 'combo', effects: [...] }
 *   → Executes multiple effects in order
 *
 * ============================================================================
 */

window.Effects = (function() {
    'use strict';

    // ========================================================================
    // MAIN EXECUTE FUNCTION
    // ========================================================================
    /**
     * Execute an effect object.
     *
     * @param {Object} effect - The effect to execute
     * @returns {boolean} - true if successful, false if failed
     *
     * Example:
     *   Effects.execute({ type: 'heal', amount: 30 });
     *   Effects.execute({ type: 'trade', cost: { berries: 5 }, reward: { health: 20 } });
     */
    function execute(effect) {
        // Safety check - make sure we have an effect
        if (!effect || !effect.type) {
            console.warn('Effects.execute: No effect or missing type', effect);
            return true; // Return true so dialog continues
        }

        // Handle each effect type
        switch (effect.type) {

            // ----------------------------------------------------------------
            // HEAL - Add health (up to max 100)
            // ----------------------------------------------------------------
            case 'heal':
                GameState.health = Math.min(100, GameState.health + effect.amount);
                Game.playSound('collect');
                UI.updateUI();
                return true;

            // ----------------------------------------------------------------
            // FULL HEAL - Set health to 100
            // ----------------------------------------------------------------
            case 'full_heal':
                // Fail if already at full health
                if (GameState.health >= 100) {
                    return false;
                }
                GameState.health = 100;
                Game.playSound('collect');
                UI.updateUI();
                return true;

            // ----------------------------------------------------------------
            // GIVE COINS - Add pig coins
            // ----------------------------------------------------------------
            case 'give_coins':
                GameState.pigCoins += effect.amount;
                Game.playSound('collect');
                UI.updateUI();
                return true;

            // ----------------------------------------------------------------
            // GIVE SCORE - Add to score
            // ----------------------------------------------------------------
            case 'give_score':
                GameState.score += effect.amount;
                Game.playSound('collect');
                UI.updateUI();
                return true;

            // ----------------------------------------------------------------
            // OPEN SHOP - Open the shop menu
            // ----------------------------------------------------------------
            case 'open_shop':
                UI.openShop(effect.vendor);
                return true;

            // ----------------------------------------------------------------
            // OPEN GAME - Open a tavern game
            // ----------------------------------------------------------------
            case 'open_game':
                if (effect.game === 'board_game') BoardGame.open();
                else if (effect.game === 'pigon_game') PigonGame.open();
                else if (effect.game === 'card_game') CardGame.open();
                return true;

            // ----------------------------------------------------------------
            // UNLOCK MEEPLE - Add a meeple to the player's collection
            // ----------------------------------------------------------------
            case 'unlock_meeple':
                if (!GameState.unlockedMeeples) GameState.unlockedMeeples = [];
                if (GameState.unlockedMeeples.indexOf(effect.meeple) !== -1) {
                    Game.showBlockedMessage('Already owned!');
                    return false;
                }
                GameState.unlockedMeeples.push(effect.meeple);
                Game.showBlockedMessage('Meeple unlocked: ' + effect.meeple + '!');
                return true;

            // ----------------------------------------------------------------
            // UNLOCK BIOME - Add a biome to the player's collection
            // ----------------------------------------------------------------
            case 'unlock_biome':
                if (!GameState.unlockedBiomes) GameState.unlockedBiomes = [];
                if (GameState.unlockedBiomes.indexOf(effect.biome) !== -1) {
                    Game.showBlockedMessage('Already owned!');
                    return false;
                }
                GameState.unlockedBiomes.push(effect.biome);
                Game.showBlockedMessage('Biome unlocked: ' + effect.biome + '!');
                return true;

            // ----------------------------------------------------------------
            // UNLOCK COLOUR - Add a board game colour
            // ----------------------------------------------------------------
            case 'unlock_colour':
                if (!GameState.unlockedBoardColours) GameState.unlockedBoardColours = [];
                if (GameState.unlockedBoardColours.indexOf(effect.colour) !== -1) {
                    Game.showBlockedMessage('Already owned!');
                    return false;
                }
                GameState.unlockedBoardColours.push(effect.colour);
                Game.showBlockedMessage('Colour unlocked: ' + effect.colour + '!');
                return true;

            // ----------------------------------------------------------------
            // TRADE - Exchange resources for rewards
            // ----------------------------------------------------------------
            case 'trade':
                return executeTrade(effect);

            // ----------------------------------------------------------------
            // COMBO - Execute multiple effects
            // ----------------------------------------------------------------
            case 'combo':
                return executeCombo(effect);

            // ----------------------------------------------------------------
            // ITEM - Give the player an item
            // ----------------------------------------------------------------
            case 'item':
                return executeItem(effect);

            // ----------------------------------------------------------------
            // QUEST CLUE - Track a story clue the player discovered
            // ----------------------------------------------------------------
            case 'quest_clue':
                if (!GameState.questClues) GameState.questClues = [];
                if (!GameState.questClues.includes(effect.clue)) {
                    GameState.questClues.push(effect.clue);
                    Game.playSound('collect');
                    console.log('Quest clue discovered: ' + effect.clue);
                    UI.showToast('New Quest Clue!', 'A new clue has been discovered.', 'Press <b>Q</b> to check your quest log.');
                }
                return true;

            // ----------------------------------------------------------------
            // GIVE RESOURCE - Add resources to player's inventory
            // ----------------------------------------------------------------
            case 'give_resource':
                // One-time gifts: skip if already claimed
                if (effect.once) {
                    if (!GameState.claimedGifts) GameState.claimedGifts = [];
                    if (GameState.claimedGifts.includes(effect.once)) {
                        return true; // Already claimed — succeed silently
                    }
                    GameState.claimedGifts.push(effect.once);
                }
                var resources = effect.resources || {};
                for (var resKey in resources) {
                    if (resources.hasOwnProperty(resKey)) {
                        GameState.resourceCounts[resKey] = (GameState.resourceCounts[resKey] || 0) + resources[resKey];
                    }
                }
                // Also track quest clue if included
                if (effect.clue) {
                    if (!GameState.questClues) GameState.questClues = [];
                    if (!GameState.questClues.includes(effect.clue)) {
                        GameState.questClues.push(effect.clue);
                    }
                }
                Game.playSound('collect');
                UI.updateUI();
                return true;

            // ----------------------------------------------------------------
            // TRIGGER MEMORY - Show a memory flashback from a dialog
            // ----------------------------------------------------------------
            case 'trigger_memory':
                if (effect.memoryId) {
                    // Delay so the dialog closes first
                    setTimeout(function() {
                        UI.showMemoryFlashback(effect.memoryId);
                    }, 500);
                }
                return true;

            // ----------------------------------------------------------------
            // EASTER: Accept a quest from Marshmallow
            // ----------------------------------------------------------------
            case 'easter_accept_quest':
                var questDef = EASTER_QUESTS.find(function(q) { return q.id === effect.questId; });
                if (questDef) {
                    GameState.easterQuest = {
                        id: questDef.id,
                        name: questDef.name,
                        difficulty: questDef.difficulty,
                        reward: questDef.reward,
                        goal: questDef.goal
                    };
                    GameState.easterQuestBunnyCaught = 0;
                    GameState.easterQuestEggsCollected = 0;
                    Game.playSound('collect');
                    UI.showToast('Quest Accepted!', questDef.name + ' (' + questDef.difficulty + ') — ' + questDef.reward + ' chocolate eggs');
                }
                return true;

            // ----------------------------------------------------------------
            // EASTER: Complete a quest and claim reward
            // ----------------------------------------------------------------
            case 'easter_complete_quest':
                if (GameState.easterQuest) {
                    var reward = GameState.easterQuest.reward;
                    GameState.chocolateEggs += reward;
                    UI.showToast('Quest Complete!', 'You earned ' + reward + ' chocolate egg' + (reward !== 1 ? 's' : '') + '!');
                    Game.playSound('collect');
                    GameState.easterQuest = null;
                    GameState.easterQuestBunnyCaught = 0;
                    GameState.easterQuestEggsCollected = 0;
                    UI.updateUI();
                }
                return true;

            // ----------------------------------------------------------------
            // EASTER: Abandon a quest
            // ----------------------------------------------------------------
            case 'easter_abandon_quest':
                GameState.easterQuest = null;
                GameState.easterQuestBunnyCaught = 0;
                GameState.easterQuestEggsCollected = 0;
                UI.showToast('Quest Abandoned', 'Your quest progress has been reset.');
                return true;

            // ----------------------------------------------------------------
            // EASTER: Accept the rare lamb quest (costs 30 petals)
            // ----------------------------------------------------------------
            case 'easter_accept_lamb_quest':
                var petals = GameState.resourceCounts ? (GameState.resourceCounts.cherry_petals || 0) : 0;
                if (petals < 30) {
                    UI.showToast('Not Enough Petals!', 'You need 30 cherry blossom petals. You have ' + petals + '.');
                    // Route to fail node
                    if (typeof Dialogs !== 'undefined' && Dialogs.goToNode) {
                        Dialogs.goToNode('lamb_quest_failed');
                    }
                    return false;
                }
                // Deduct petals
                GameState.resourceCounts.cherry_petals = (GameState.resourceCounts.cherry_petals || 0) - 30;
                // Set quest
                GameState.easterQuest = {
                    id: 'catch_naughty_lamb',
                    name: 'Catch the Naughty Lamb',
                    difficulty: 'RARE',
                    reward: 30,
                    goal: { type: 'catch_lamb', count: 1 }
                };
                // Spawn the lamb!
                if (typeof spawnEasterLamb === 'function') {
                    spawnEasterLamb();
                }
                return true;

            // ----------------------------------------------------------------
            // EASTER: Open Clover's chocolate egg shop
            // ----------------------------------------------------------------
            case 'open_easter_shop':
                UI.openEasterShop();
                return true;

            // ----------------------------------------------------------------
            // UNKNOWN - Log warning but don't break
            // ----------------------------------------------------------------
            default:
                console.warn('Effects.execute: Unknown effect type:', effect.type);
                return true;
        }
    }

    // ========================================================================
    // TRADE EFFECT HANDLER
    // ========================================================================
    /**
     * Handle trade effects - take resources, give rewards.
     *
     * Trade effect structure:
     * {
     *     type: 'trade',
     *     cost: { berries: 5, nuts: 0, mushrooms: 0 },
     *     reward: { health: 20, coins: 0, score: 0 }
     * }
     */
    function executeTrade(effect) {
        // First, check if player can afford it
        if (!canAfford(effect.cost)) {
            Game.playSound('hurt');
            return false;
        }

        // Take the resources (generic loop — works for ALL resource types!)
        if (effect.cost) {
            if (effect.cost.coins) {
                GameState.pigCoins -= effect.cost.coins;
            }
            // Deduct any resource type automatically
            for (var resource in GameState.resourceCounts) {
                if (effect.cost[resource]) {
                    GameState.resourceCounts[resource] -= effect.cost[resource];
                }
            }
        }

        // Give the rewards (generic loop for resources!)
        if (effect.reward) {
            if (effect.reward.health) {
                GameState.health = Math.min(100, GameState.health + effect.reward.health);
            }
            if (effect.reward.coins) {
                GameState.pigCoins += effect.reward.coins;
            }
            if (effect.reward.score) {
                GameState.score += effect.reward.score;
            }
            // Generic resource rewards — works for ALL resource types
            for (var resource in GameState.resourceCounts) {
                if (effect.reward[resource]) {
                    GameState.resourceCounts[resource] += effect.reward[resource];
                }
            }
            // Item reward (e.g. buying a sword from a shop)
            if (effect.reward.item) {
                executeItem({ item: effect.reward.item });
            }
        }

        Game.playSound('collect');
        UI.updateUI();
        return true;
    }

    // ========================================================================
    // COMBO EFFECT HANDLER
    // ========================================================================
    /**
     * Handle combo effects - execute multiple effects in sequence.
     *
     * Combo effect structure:
     * {
     *     type: 'combo',
     *     effects: [
     *         { type: 'heal', amount: 20 },
     *         { type: 'give_score', amount: 50 }
     *     ]
     * }
     */
    function executeCombo(effect) {
        if (!effect.effects || !Array.isArray(effect.effects)) {
            console.warn('Effects.executeCombo: No effects array');
            return true;
        }

        // Execute each effect in order
        // Note: We don't stop on failure - all effects in combo execute
        let allSucceeded = true;
        for (let i = 0; i < effect.effects.length; i++) {
            if (!execute(effect.effects[i])) {
                allSucceeded = false;
            }
        }

        return allSucceeded;
    }

    // ========================================================================
    // ITEM EFFECT HANDLER
    // ========================================================================
    /**
     * Handle item effects - give the player an item.
     *
     * Item effect structure:
     * {
     *     type: 'item',
     *     item: 'saddle'
     * }
     */
    function executeItem(effect) {
        if (!effect.item) {
            console.warn('Effects.executeItem: No item specified');
            return false;
        }

        switch (effect.item) {
            case 'saddle':
                // Check if player already has saddle
                if (GameState.hasSaddle) {
                    console.log('Player already has a saddle!');
                    return false;
                }
                GameState.hasSaddle = true;
                Game.playSound('collect');
                console.log('Player crafted a saddle! Press E near a Saltas Gazella to ride.');
                UI.updateUI();
                return true;

            case 'wood_sword':
            case 'wood_axe':
            case 'barbanit_axe':
            case 'manglecacia_axe':
            case 'seaspray_birch_axe':
            case 'manglecacia_sword':
            case 'seaspray_birch_sword':
            case 'basic_rook_boat':
            case 'arsen_bomb':
            case 'fishing_spear':
            case 'diving_mask':
            case 'pirate_eyepatch':
            case 'fur_coat':
            case 'thunder_scythe':
            case 'thunder_armour':
                // These go into inventory as equippable items
                // Look up name/description from TOOL_STATS if available
                var existing = GameState.inventoryItems.find(function(item) {
                    return item.id === effect.item;
                });
                if (existing) {
                    existing.count++;
                } else {
                    // Try to get info from TOOL_STATS first, fall back to hardcoded
                    var toolInfo = TOOL_STATS.axes[effect.item] || TOOL_STATS.swords[effect.item];
                    var itemName = toolInfo ? toolInfo.name : effect.item;
                    var itemDesc = toolInfo ? toolInfo.description : '';
                    // Special cases for items not in TOOL_STATS
                    if (effect.item === 'basic_rook_boat') {
                        itemName = 'Basic Rook Boat';
                        itemDesc = 'A seaspray birch raft! Select from hotbar, press E to place in water.';
                    }
                    // Special case for arsen bomb (not in TOOL_STATS)
                    if (effect.item === 'arsen_bomb') {
                        itemName = 'Arsen Bomb';
                        itemDesc = 'A toxic bomb. Equip from hotbar, click to throw!';
                    }
                    if (effect.item === 'diving_mask') {
                        itemName = 'Diving Mask';
                        itemDesc = 'Forged glass diving mask. Select from hotbar to swim underwater!';
                    }
                    if (effect.item === 'pirate_eyepatch') {
                        itemName = "Pirate's Eyepatch";
                        itemDesc = 'A fearsome eyepatch! Equip from hotbar, press E — non-hostile animals flee in terror.';
                    }
                    if (effect.item === 'fur_coat') {
                        itemName = 'Fur Coat';
                        itemDesc = 'A warm coat made from hide. Equip from hotbar, press E — protects from the cold in Snowy Mountains!';
                    }
                    GameState.inventoryItems.push({
                        id: effect.item,
                        name: itemName,
                        description: itemDesc,
                        effect: { type: 'item', item: effect.item },
                        count: 1
                    });
                }
                Game.playSound('collect');
                if (GameState.isInventoryOpen) {
                    Inventory.refreshInventory();
                }
                UI.updateUI();
                return true;

            case 'basic_pack':
            case 'rare_pack':
            case 'legendary_pack':
                // Card packs go to inventory, openable later
                var packNames = { basic_pack: 'Basic Card Pack', rare_pack: 'Rare Card Pack', legendary_pack: 'Legendary Card Pack' };
                var packDescs = { basic_pack: '3 cards + 2 energy', rare_pack: '5 cards + 3 energy (better odds)', legendary_pack: '5 cards + 4 energy (guaranteed rare+)' };
                Inventory.addItemToInventory(effect.item, packNames[effect.item], packDescs[effect.item], 'open_card_pack', 1);
                Game.playSound('collect');
                return true;

            default:
                console.warn('Effects.executeItem: Unknown item:', effect.item);
                return false;
        }
    }

    // ========================================================================
    // CAN AFFORD CHECK
    // ========================================================================
    /**
     * Check if player has enough resources for a cost.
     *
     * @param {Object} cost - Resource costs { berries: 5, nuts: 3, mushrooms: 2, seaweed: 10 }
     * @returns {boolean} - true if player can afford it
     *
     * Example:
     *   Effects.canAfford({ berries: 5, nuts: 0, mushrooms: 0 });
     */
    function canAfford(cost) {
        if (!cost) return true;

        // Check coin cost
        if (cost.coins && GameState.pigCoins < cost.coins) {
            return false;
        }

        // Generic resource check — works for ALL resource types!
        // This loops through every resource the player can have and checks
        // if the cost requires more than they have.
        for (var resource in GameState.resourceCounts) {
            if (cost[resource] && GameState.resourceCounts[resource] < cost[resource]) {
                return false;
            }
        }

        return true;
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================
    // These functions can be called from other files

    return {
        /**
         * Execute an effect object.
         * @param {Object} effect - The effect to execute
         * @returns {boolean} - true if successful
         */
        execute: execute,

        /**
         * Check if player can afford a resource cost.
         * @param {Object} cost - Resource costs
         * @returns {boolean} - true if affordable
         */
        canAfford: canAfford
    };

})();
