/**
 * ============================================================================
 * GAME CONFIGURATION - Bridge File
 * ============================================================================
 *
 * This file connects the DATA files to the LOGIC files.
 * It creates a CONFIG object that the game logic uses.
 *
 * ============================================================================
 * WHERE THE DATA COMES FROM
 * ============================================================================
 *
 * To customize the game, edit these data files (NOT this file!):
 *
 *   js/data/settings.js    → Game settings (world size, spawn rates, etc.)
 *   js/data/villagers.js   → Villager characters and dialog trees
 *   js/data/recipes.js     → Crafting recipes
 *   js/data/shop-items.js  → Shop items you can buy
 *   js/data/enemies.js     → Enemy stats and colors
 *
 * ============================================================================
 * HOW IT WORKS
 * ============================================================================
 *
 * 1. Data files load first (they define SETTINGS, VILLAGERS, etc.)
 * 2. This file runs second and creates CONFIG from that data
 * 3. Logic files run third and use CONFIG
 *
 * This way, the game logic doesn't need to change when you edit data!
 *
 * ============================================================================
 */

window.CONFIG = {

    // ========================================================================
    // WORLD SETTINGS
    // ========================================================================
    // These come from js/data/settings.js
    // Edit that file to change world size, village location, etc.

    WORLD_SIZE: SETTINGS.WORLD_SIZE,
    VILLAGE_CENTER: SETTINGS.VILLAGE_CENTER,
    VILLAGE_RADIUS: SETTINGS.VILLAGE_RADIUS,

    // ========================================================================
    // SPAWN RATES
    // ========================================================================
    // How often enemies and resources appear (in milliseconds)
    // Edit js/data/settings.js to make the game easier or harder

    ENEMY_SPAWN_RATE: SETTINGS.ENEMY_SPAWN_RATE,
    RESOURCE_SPAWN_RATE: SETTINGS.RESOURCE_SPAWN_RATE,

    // ========================================================================
    // LIMITS
    // ========================================================================
    // Maximum number of enemies and resources in the world

    MAX_ENEMIES: SETTINGS.MAX_ENEMIES,
    MAX_RESOURCES: SETTINGS.MAX_RESOURCES,

    // ========================================================================
    // ENEMY DETECTION
    // ========================================================================
    // How close you need to be before enemies chase you

    ENEMY_DETECTION_RANGE: SETTINGS.ENEMY_DETECTION_RANGE,

    // ========================================================================
    // RESOURCE PRICES
    // ========================================================================
    // How many pig coins you get when collecting each resource

    RESOURCE_PRICES: SETTINGS.RESOURCE_PRICES,

    // ========================================================================
    // FOOD HEALING
    // ========================================================================
    // How much health each food type restores when eaten

    FOOD_HEALING: SETTINGS.FOOD_HEALING,
    FOOD_HUNGER: SETTINGS.FOOD_HUNGER,

    // ========================================================================
    // RESOURCE SCORES
    // ========================================================================
    // Score points for collecting each resource type

    RESOURCE_SCORES: SETTINGS.RESOURCE_SCORES,

    // ========================================================================
    // KILL REWARDS
    // ========================================================================
    // What the player gets for killing enemies

    KILL_REWARDS: SETTINGS.KILL_REWARDS,

    // ========================================================================
    // PLAYER SETTINGS
    // ========================================================================
    // Starting values and movement speeds

    STARTING_HEALTH: SETTINGS.STARTING_HEALTH,
    STARTING_COINS: SETTINGS.STARTING_COINS,
    STARTING_RESOURCES: SETTINGS.STARTING_RESOURCES,
    PLAYER_WALK_SPEED: SETTINGS.PLAYER_WALK_SPEED,
    PLAYER_SPRINT_SPEED: SETTINGS.PLAYER_SPRINT_SPEED,
    PLAYER_SWIM_SPEED: SETTINGS.PLAYER_SWIM_SPEED,
    PLAYER_JUMP_POWER: SETTINGS.PLAYER_JUMP_POWER,
    GRAVITY: SETTINGS.GRAVITY,

    // ========================================================================
    // SHOP ITEMS
    // ========================================================================
    // These come from js/data/shop-items.js
    // We wrap effects to work with the Effects system

    SHOP_ITEMS: SHOP_ITEMS.map(function(item) {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            icon: item.icon,
            // Convert data effect to executable function
            effect: function() {
                Effects.execute(item.effect);
            }
        };
    }),

    // ========================================================================
    // CRAFTING RECIPES
    // ========================================================================
    // These come from js/data/recipes.js
    // We wrap effects to work with the Effects system

    CRAFT_RECIPES: RECIPES.map(function(recipe) {
        return {
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            cost: recipe.cost,
            effect: recipe.effect,  // Keep the effect data for use in inventory
            requiredScore: recipe.requiredScore || 0,  // Score needed to see this recipe
            // Function to add item to inventory (not use immediately)
            craft: function() {
                // Add to inventory instead of using immediately
                var existing = GameState.inventoryItems.find(function(item) {
                    return item.id === recipe.id;
                });
                if (existing) {
                    existing.count++;
                } else {
                    GameState.inventoryItems.push({
                        id: recipe.id,
                        name: recipe.name,
                        description: recipe.description,
                        effect: recipe.effect,
                        count: 1
                    });
                }
                Game.playSound('collect');
                // Refresh inventory if open
                if (GameState.isInventoryOpen) {
                    Inventory.refreshInventory();
                }
            }
        };
    }),

    // ========================================================================
    // VILLAGER DATA
    // ========================================================================
    // These come from js/data/villagers.js
    // We convert the simplified format to the format dialogs.js expects

    VILLAGER_DATA: VILLAGERS.map(function(villager) {
        // Build the conversation tree in the old format
        var conversationTree = null;

        if (villager.conversation) {
            conversationTree = {
                startNode: villager.conversation.start,
                nodes: {}
            };

            // Convert each dialog node
            for (var nodeId in villager.conversation.nodes) {
                var sourceNode = villager.conversation.nodes[nodeId];

                // Convert choices to the old format
                var convertedChoices = sourceNode.choices.map(function(choice) {
                    var newChoice = {
                        text: choice.text,
                        nextNode: choice.nextNode
                    };

                    // If the choice has an effect, convert it
                    if (choice.effect) {
                        // Store the effect object for the dialog system
                        newChoice.effectData = choice.effect;
                        newChoice.failNode = choice.failNode;
                    }

                    return newChoice;
                });

                conversationTree.nodes[nodeId] = {
                    text: sourceNode.text,
                    choices: convertedChoices
                };
            }
        }

        // Return the villager in the expected format
        return {
            name: villager.name,
            role: villager.role,
            skinColor: villager.skinColor,
            outfitColor: villager.outfitColor,
            hatColor: villager.hatColor,
            position: villager.position,
            conversationTree: conversationTree
        };
    }),

    // ========================================================================
    // ENEMIES (Spawnable Enemy Definitions)
    // ========================================================================
    // These come from js/data/enemies.js
    // Each enemy has a "type" field that determines which 3D model to use,
    // plus stats (speed, damage, health) and colors for the model.
    // You can have multiple enemies sharing the same model type!

    ENEMIES: ENEMIES,

    // ========================================================================
    // ENEMY PRESETS (Difficulty Modifiers)
    // ========================================================================
    // These come from js/data/enemies.js
    // Use these to quickly adjust difficulty.

    ENEMY_PRESETS: ENEMY_PRESETS,

    // ========================================================================
    // PROGRESSION (Score-based Villager Unlocks)
    // ========================================================================
    // These come from js/data/progression.js
    // Milestones define what score you need to unlock each villager.

    PROGRESSION_MILESTONES: PROGRESSION.milestones,

    LOCKED_MESSAGES: PROGRESSION.lockedMessages,

    // Quick lookup: villager name -> required score
    // Built automatically from milestones so you don't have to maintain two lists
    VILLAGER_REQUIRED_SCORE: (function() {
        var lookup = {};
        PROGRESSION.milestones.forEach(function(milestone) {
            if (milestone.villager) {
                lookup[milestone.villager] = milestone.score;
            }
        });
        return lookup;
    })()

};
