/**
 * ============================================================================
 * SAVE / LOAD SYSTEM
 * ============================================================================
 *
 * Handles saving and loading game state to/from localStorage.
 *
 * Save format version history:
 *   v1 — Initial save system (2025)
 *
 * ============================================================================
 */

window.SaveSystem = (function() {

    var SAVE_VERSION = 1;
    var STORAGE_KEY = 'evax_saves';
    var MAX_SAVES = 10;

    // ========================================================================
    // DEFAULT RESOURCE COUNTS
    // ========================================================================
    // Used to merge saved resourceCounts into, so new resources default to 0
    var DEFAULT_RESOURCES = {
        berries: 0, nuts: 0, mushrooms: 0, seaweed: 0, eggs: 0,
        arsenic_mushrooms: 0, thous_pine_wood: 0, glass: 0,
        manglecacia_wood: 0, seaspray_birch_wood: 0, cinnamon: 0,
        bakka_seal_tooth: 0, hide: 0,
        flour: 0, sugar: 0, butter: 0,
        cherry_petals: 0
    };

    // ========================================================================
    // GATHER SAVE DATA
    // ========================================================================
    /**
     * Snapshot the current GameState into a plain JSON-safe object.
     */
    function gatherSaveData() {
        var now = GameState.timeElapsed;

        // Convert poop queue to deltas
        var poopDeltas = (GameState.poopQueue || []).map(function(entry) {
            return { delta: entry.time - now };
        });

        // Convert pee queue to deltas
        var peeDeltas = (GameState.peeQueue || []).map(function(entry) {
            return {
                delta: entry.time - now,
                duration: entry.duration || 0
            };
        });

        return {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            name: null,  // Filled in by the UI before storing

            // Player stats
            health: GameState.health,
            hunger: GameState.hunger,
            thirst: GameState.thirst,
            score: GameState.score,
            pigCoins: GameState.pigCoins,
            tavernTokens: GameState.tavernTokens || 0,
            unlockedBoardColours: (GameState.unlockedBoardColours || []).slice(),
            animalKills: Object.assign({}, GameState.animalKills || {}),
            tavernWins: Object.assign({}, GameState.tavernWins || { pigston: 0, pigon: 0 }),
            unlockedMeeples: (GameState.unlockedMeeples || []).slice(),
            unlockedBiomes: (GameState.unlockedBiomes || []).slice(),
            timeElapsed: GameState.timeElapsed,

            // Position & biome
            currentBiome: GameState.currentBiome,
            playerPosition: {
                x: GameState.peccary.position.x,
                y: GameState.peccary.position.y,
                z: GameState.peccary.position.z
            },
            playerRotation: GameState.peccary.rotation.y,

            // Resources
            resourceCounts: Object.assign({}, GameState.resourceCounts),

            // Inventory & hotbar
            inventoryItems: (GameState.inventoryItems || []).map(function(item) {
                return { id: item.id, name: item.name, description: item.description, effect: item.effect, count: item.count };
            }),
            hotbarSlots: GameState.hotbarSlots.map(function(slot) {
                if (!slot) return null;
                return { id: slot.id, name: slot.name, description: slot.description, effect: slot.effect, count: slot.count };
            }),
            selectedHotbarSlot: GameState.selectedHotbarSlot,

            // Artifacts
            artifacts: (GameState.artifacts || []).slice(),
            artifactsGiven: (GameState.artifactsGiven || []).slice(),

            // Progression
            unlockedVillagers: (GameState.unlockedVillagers || []).slice(),
            currentLevel: GameState.currentLevel,

            // Flags
            hasSaddle: GameState.hasSaddle || false,

            // Quest
            questClues: (GameState.questClues || []).slice(),
            claimedGifts: (GameState.claimedGifts || []).slice(),

            // Resource bar pins
            pinnedResources: (GameState.pinnedResources || []).slice(),

            // Memory fragments
            memoriesFound: (GameState.memoriesFound || []).slice(),
            introShown: GameState.introShown || false,
            lastMemoryScore: GameState.lastMemoryScore || 0,
            chapter1Shown: GameState.chapter1Shown || false,

            // Discovery tracking
            discoveredAnimals: (GameState.discoveredAnimals || []).slice(),
            discoveredResources: (GameState.discoveredResources || []).slice(),
            discoveredBiomes: (GameState.discoveredBiomes || []).slice(),
            villageNotified: GameState.villageNotified || false,
            gossipHeard: (GameState.gossipHeard || []).slice(),
            gossipDay: GameState.gossipDay || 0,

            // Skin system
            currentSkin: GameState.currentSkin || 'default',
            unlockedSkins: (GameState.unlockedSkins || ['default']).slice(),
            arsenBombsUsed: GameState.arsenBombsUsed || 0,

            // Easter event (bunny count + chocolate eggs persist, event flag does NOT)
            easterBunniesCaught: GameState.easterBunniesCaught || 0,
            chocolateEggs: GameState.chocolateEggs || 0,
            hasFlamingoLicense: GameState.hasFlamingoLicense || false,
            ownedPiglets: (GameState.ownedPiglets || []).slice(),
            easterEggs: GameState.easterEggs || 0,
            larryQuestIndex: GameState.larryQuestIndex || 0,
            completedLarryQuests: (GameState.completedLarryQuests || []).slice(),

            // Coastal chests & eyepatch
            eyepatchEquipped: GameState.eyepatchEquipped || false,
            furCoatEquipped: GameState.furCoatEquipped || false,
            thunderArmourEquipped: GameState.thunderArmourEquipped || false,
            chestRespawnTimer: GameState.chestRespawnTimer || undefined,

            // Card collection
            cardCollection: (GameState.cardCollection || []).slice(),

            // Bathroom deltas
            poopQueue: poopDeltas,
            peeQueue: peeDeltas
        };
    }

    // ========================================================================
    // VALIDATE ITEM
    // ========================================================================
    var _validItemIds = null;       // Lazily-built set of every known item id
    var _registriesMissing = false; // True if a data registry failed to load

    /**
     * Build the set of every item id the game can legitimately grant,
     * pulled from the data registries so new items are accepted automatically.
     */
    function buildValidItemIds() {
        var ids = {};
        _registriesMissing = false;

        // Tools (axes + swords) from data/tools.js
        if (window.TOOL_STATS) {
            Object.keys(TOOL_STATS.axes || {}).forEach(function(id) { ids[id] = true; });
            Object.keys(TOOL_STATS.swords || {}).forEach(function(id) { ids[id] = true; });
        } else {
            _registriesMissing = true;
        }

        // Crafted items are stored in the inventory under their recipe id
        if (window.RECIPES) {
            RECIPES.forEach(function(r) { if (r.id) ids[r.id] = true; });
        } else {
            _registriesMissing = true;
        }

        // Shop items that grant an inventory item (effect: { type: 'item', ... })
        if (window.SHOP_ITEMS) {
            SHOP_ITEMS.forEach(function(s) {
                if (s.effect && s.effect.type === 'item' && s.effect.item) ids[s.effect.item] = true;
            });
        } else {
            _registriesMissing = true;
        }

        // Easter shop items keep their own id in the hotbar/inventory
        if (window.EASTER_SHOP_ITEMS) {
            EASTER_SHOP_ITEMS.forEach(function(s) { if (s.id) ids[s.id] = true; });
        } else {
            _registriesMissing = true;
        }

        // Items granted directly by effects/chests/events
        // (effects.js executeItem, game.js treasure chests, ui.js easter shop)
        [
            'arsen_bomb', 'saddle', 'basic_rook_boat', 'fishing_spear',
            'diving_mask', 'pirate_eyepatch', 'fur_coat',
            'thunder_scythe', 'thunder_armour', 'electric_crossbow',
            'basic_pack', 'rare_pack', 'legendary_pack',
            'catcher_net', 'chocolate_goggles', 'roller_skates', 'flamingo_license'
        ].forEach(function(id) { ids[id] = true; });

        return ids;
    }

    /**
     * Check if an inventory/hotbar item still exists in the current game data.
     * Returns true if the item is recognized, false if it's stale.
     * Fails OPEN (accepts everything) if the data registries didn't load —
     * better to keep an unknown item than delete a player's gear.
     */
    function isValidItem(itemId) {
        if (!itemId || typeof itemId !== 'string') return false;
        if (!_validItemIds) _validItemIds = buildValidItemIds();
        if (_registriesMissing) return true;
        return _validItemIds[itemId] === true;
    }

    // ========================================================================
    // VALIDATE BIOME ACCESS
    // ========================================================================
    /**
     * Check if the player has the right to be in a given biome.
     * Returns 'ok' if allowed, or a reason string if not.
     */
    function validateBiomeAccess(biomeId, saveData) {
        var biome = BIOMES[biomeId];
        if (!biome) return 'biome_not_found';

        // Check score requirement
        if (biome.requiredScore && saveData.score < biome.requiredScore) {
            return 'score_too_low';
        }

        // Check artifact requirement
        if (biome.requiresArtifact) {
            var hasIt = saveData.artifacts && saveData.artifacts.includes(biome.requiresArtifact);
            var gaveIt = saveData.artifactsGiven && saveData.artifactsGiven.includes(biome.requiresArtifact);
            if (!hasIt && !gaveIt) {
                return 'missing_artifact';
            }
        }

        return 'ok';
    }

    // ========================================================================
    // RESTORE SAVE DATA
    // ========================================================================
    /**
     * Apply a save object to GameState and rebuild the world.
     * Returns { success: true } or { success: false, warnings: [...] }
     */
    function restoreSaveData(saveData) {
        var warnings = [];

        // --- Step 1: Run migrations ---
        saveData = migrate(saveData);

        // --- Step 2: Merge resources into defaults (handles new resource types) ---
        var mergedResources = Object.assign({}, DEFAULT_RESOURCES, saveData.resourceCounts || {});

        // --- Step 3: Validate inventory/hotbar items ---
        var validInventory = [];
        (saveData.inventoryItems || []).forEach(function(item) {
            if (!item || typeof item !== 'object' || typeof item.id !== 'string') {
                warnings.push('Removed malformed inventory entry');
                return;
            }
            if (isValidItem(item.id)) {
                // Refresh name/description from current TOOL_STATS
                var toolInfo = window.TOOL_STATS ? (TOOL_STATS.axes[item.id] || TOOL_STATS.swords[item.id]) : null;
                if (toolInfo) {
                    item.name = toolInfo.name;
                    item.description = toolInfo.description;
                }
                validInventory.push(item);
            } else {
                warnings.push('Removed unknown item from inventory: ' + item.id);
            }
        });

        var validHotbar = (saveData.hotbarSlots || []).map(function(slot) {
            if (!slot) return null;
            if (typeof slot !== 'object' || typeof slot.id !== 'string') {
                warnings.push('Removed malformed hotbar entry');
                return null;
            }
            if (isValidItem(slot.id)) {
                var toolInfo = window.TOOL_STATS ? (TOOL_STATS.axes[slot.id] || TOOL_STATS.swords[slot.id]) : null;
                if (toolInfo) {
                    slot.name = toolInfo.name;
                    slot.description = toolInfo.description;
                }
                return slot;
            } else {
                warnings.push('Removed unknown item from hotbar: ' + slot.id);
                return null;
            }
        });

        // Pad hotbar to 9 slots
        while (validHotbar.length < 9) validHotbar.push(null);

        // --- Step 4: Validate biome access ---
        var targetBiome = saveData.currentBiome || 'arboreal';
        var biomeCheck = validateBiomeAccess(targetBiome, saveData);
        if (biomeCheck !== 'ok') {
            warnings.push('Cannot restore biome "' + targetBiome + '" (' + biomeCheck + '). Spawning in village.');
            targetBiome = 'arboreal';
        }

        // --- Step 5: Validate artifacts against current data ---
        var validArtifacts = (saveData.artifacts || []).filter(function(id) {
            if (window.getArtifactData(id)) return true;
            warnings.push('Removed unknown artifact: ' + id);
            return false;
        });
        var validArtifactsGiven = (saveData.artifactsGiven || []).filter(function(id) {
            if (window.getArtifactData(id)) return true;
            warnings.push('Removed unknown given artifact: ' + id);
            return false;
        });

        // --- Step 6: Apply to GameState ---
        GameState.health = saveData.health;
        GameState.hunger = saveData.hunger;
        GameState.thirst = saveData.thirst;
        GameState.score = saveData.score;
        GameState.pigCoins = saveData.pigCoins;
        GameState.tavernTokens = saveData.tavernTokens || 0;
        GameState.unlockedBoardColours = saveData.unlockedBoardColours || [];
        GameState.animalKills = saveData.animalKills || {};
        GameState.tavernWins = saveData.tavernWins || { pigston: 0, pigon: 0 };
        GameState.unlockedMeeples = saveData.unlockedMeeples || [];
        GameState.unlockedBiomes = saveData.unlockedBiomes || [];
        GameState.timeElapsed = saveData.timeElapsed;
        GameState.resourceCounts = mergedResources;
        GameState.inventoryItems = validInventory;
        GameState.hotbarSlots = validHotbar;
        GameState.selectedHotbarSlot = saveData.selectedHotbarSlot || 0;
        GameState.artifacts = validArtifacts;
        GameState.artifactsGiven = validArtifactsGiven;
        GameState.unlockedVillagers = saveData.unlockedVillagers || [];
        GameState.currentLevel = saveData.currentLevel || 'Newborn Peccary';
        GameState.hasSaddle = saveData.hasSaddle || false;
        GameState.questClues = saveData.questClues || [];
        GameState.claimedGifts = saveData.claimedGifts || [];
        GameState.pinnedResources = saveData.pinnedResources || [];
        GameState.memoriesFound = saveData.memoriesFound || [];
        GameState.introShown = saveData.introShown || false;
        GameState.lastMemoryScore = saveData.lastMemoryScore || 0;
        GameState.chapter1Shown = saveData.chapter1Shown || false;
        GameState.discoveredAnimals = saveData.discoveredAnimals || [];
        GameState.discoveredResources = saveData.discoveredResources || [];
        GameState.discoveredBiomes = saveData.discoveredBiomes || [];
        GameState.villageNotified = saveData.villageNotified || false;
        GameState.gossipHeard = saveData.gossipHeard || [];
        GameState.gossipDay = saveData.gossipDay || 0;
        GameState.cardCollection = saveData.cardCollection || [];
        GameState.currentSkin = saveData.currentSkin || 'default';
        GameState.unlockedSkins = saveData.unlockedSkins || ['default'];
        GameState.arsenBombsUsed = saveData.arsenBombsUsed || 0;
        GameState.easterBunniesCaught = saveData.easterBunniesCaught || 0;
        GameState.chocolateEggs = saveData.chocolateEggs || 0;
        GameState.hasFlamingoLicense = saveData.hasFlamingoLicense || false;
        GameState.ownedPiglets = saveData.ownedPiglets || [];
        GameState.easterEggs = saveData.easterEggs || 0;
        GameState.larryQuestIndex = saveData.larryQuestIndex || 0;
        GameState.completedLarryQuests = saveData.completedLarryQuests || [];
        GameState.eyepatchEquipped = saveData.eyepatchEquipped || false;
        GameState.furCoatEquipped = saveData.furCoatEquipped || false;
        GameState.thunderArmourEquipped = saveData.thunderArmourEquipped || false;
        GameState.chestRespawnTimer = saveData.chestRespawnTimer || undefined;
        GameState.dehydrationTimer = 0;

        // --- Step 7: Restore bathroom queues from deltas ---
        var now = GameState.timeElapsed;
        GameState.poopQueue = (saveData.poopQueue || []).map(function(entry) {
            return { time: now + entry.delta };
        });
        GameState.peeQueue = (saveData.peeQueue || []).map(function(entry) {
            return { time: now + entry.delta, duration: entry.duration || 0 };
        });

        // --- Step 8: Rebuild world for the correct biome ---
        // Clear current world first
        Game.clearBiomeContent();

        // Clear arsen bomb puddles
        if (GameState.activePuddles) {
            GameState.activePuddles.forEach(function(puddle) {
                GameState.scene.remove(puddle.mesh);
            });
            GameState.activePuddles = [];
        }

        // Clear bathroom objects in world
        if (GameState.poopsInWorld) {
            GameState.poopsInWorld.forEach(function(p) { GameState.scene.remove(p.mesh); });
            GameState.poopsInWorld = [];
        }
        if (GameState.peesInWorld) {
            GameState.peesInWorld.forEach(function(p) { GameState.scene.remove(p.mesh); });
            GameState.peesInWorld = [];
        }
        GameState.isSquatting = false;
        GameState.drinkingTime = 0;

        GameState.currentBiome = targetBiome;
        Environment.rebuildForBiome(targetBiome);
        document.getElementById('biome-label').textContent = BIOMES[targetBiome].displayName;

        // Spawn all biome-specific content (animals, resources, intervals)
        Game.spawnBiomeContent(targetBiome);

        // Rebuild Pedro with the loaded skin
        Player.rebuildPeccary();
        Player.createBackSword();

        // Re-attach equipped gear AFTER rebuildPeccary (which strips Pedro's children)
        if (GameState.furCoatEquipped) attachFurCoatToPedro();
        if (GameState.eyepatchEquipped) attachEyepatchToPedro();
        if (GameState.thunderArmourEquipped) attachThunderArmourToPedro();

        // --- Step 9: Reposition player ---
        if (biomeCheck === 'ok' && saveData.playerPosition) {
            GameState.peccary.position.set(
                saveData.playerPosition.x,
                saveData.playerPosition.y || 0,
                saveData.playerPosition.z
            );
            if (saveData.playerRotation !== undefined) {
                GameState.peccary.rotation.y = saveData.playerRotation;
            }
        } else {
            // Fallback to village center
            GameState.peccary.position.set(
                CONFIG.VILLAGE_CENTER.x,
                0,
                CONFIG.VILLAGE_CENTER.z
            );
        }

        // --- Step 10: Re-check progression milestones ---
        if (typeof UI !== 'undefined' && UI.checkProgressionUnlocks) {
            UI.checkProgressionUnlocks();
        }

        // --- Step 11: Update all UI ---
        UI.updateUI();
        UI.updateHotbar();

        return { success: true, warnings: warnings };
    }

    // ========================================================================
    // MIGRATION
    // ========================================================================
    /**
     * Run version migrations on a save object.
     * Add new cases here when the save format changes.
     */
    function migrate(saveData) {
        var version = saveData.version || 0;

        // Example migration for future use:
        // if (version < 2) {
        //     saveData.resourceCounts.coral = saveData.resourceCounts.coral || 0;
        //     saveData.version = 2;
        // }

        saveData.version = SAVE_VERSION;
        return saveData;
    }

    // ========================================================================
    // LOCALSTORAGE HELPERS
    // ========================================================================

    /**
     * Get all saved games from localStorage.
     * Returns an array of save objects, sorted newest first.
     */
    function getAllSaves() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            var saves = JSON.parse(raw);
            if (!Array.isArray(saves)) return [];
            // Sort newest first
            saves.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
            return saves;
        } catch (e) {
            console.error('SaveSystem: Failed to read saves', e);
            return [];
        }
    }

    /**
     * Write the saves array to localStorage.
     */
    function writeSaves(saves) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
            return true;
        } catch (e) {
            console.error('SaveSystem: Failed to write saves', e);
            return false;
        }
    }

    /**
     * Save the current game to a slot.
     * @param {number|null} slotIndex - Index to overwrite, or null to create new.
     * @param {string} name - Display name for the save.
     * @returns {boolean} - true if saved successfully.
     */
    function saveGame(slotIndex, name) {
        var saves = getAllSaves();
        var data = gatherSaveData();
        data.name = name || generateSaveName();

        if (slotIndex !== null && slotIndex !== undefined && slotIndex >= 0 && slotIndex < saves.length) {
            // Overwrite existing slot
            saves[slotIndex] = data;
        } else {
            // Add new save
            if (saves.length >= MAX_SAVES) {
                // Remove oldest
                saves.pop();
            }
            saves.unshift(data);
        }

        return writeSaves(saves);
    }

    /**
     * Delete a save at the given index.
     */
    function deleteSave(index) {
        var saves = getAllSaves();
        if (index >= 0 && index < saves.length) {
            saves.splice(index, 1);
            return writeSaves(saves);
        }
        return false;
    }

    /**
     * Load a save by index and apply it.
     * @param {number} index - The save slot index.
     * @returns {Object} - { success, warnings }
     */
    function loadGame(index) {
        var saves = getAllSaves();
        if (index < 0 || index >= saves.length) {
            return { success: false, warnings: ['Save slot not found'] };
        }
        return restoreSaveData(saves[index]);
    }

    /**
     * Get the most recent save (for "Continue" button).
     */
    function getMostRecentSave() {
        var saves = getAllSaves();
        return saves.length > 0 ? saves[0] : null;
    }

    /**
     * Export a save as a JSON string (for debug).
     */
    function exportSave(index) {
        var saves = getAllSaves();
        if (index < 0 || index >= saves.length) return null;
        return JSON.stringify(saves[index], null, 2);
    }

    /**
     * Generate a default save name.
     */
    function generateSaveName() {
        var d = new Date();
        var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
        return GameState.currentLevel + ' — ' +
            pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' ' +
            pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    /**
     * Quick save — saves to slot 0 (most recent) with auto-generated name.
     */
    function quickSave() {
        var data = gatherSaveData();
        data.name = generateSaveName();
        var saves = getAllSaves();

        // Always prepend as newest
        if (saves.length >= MAX_SAVES) saves.pop();
        saves.unshift(data);

        var ok = writeSaves(saves);
        if (ok) {
            showSaveNotification('Game Saved!');
        } else {
            showSaveNotification('Save Failed!');
        }
        return ok;
    }

    /**
     * Show a brief save/load notification on screen.
     */
    function showSaveNotification(message) {
        var el = document.getElementById('save-notification');
        if (!el) return;
        el.textContent = message;
        el.classList.remove('hidden');
        el.classList.add('show');
        setTimeout(function() {
            el.classList.remove('show');
            el.classList.add('hidden');
        }, 2000);
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================
    return {
        gatherSaveData: gatherSaveData,
        restoreSaveData: restoreSaveData,
        getAllSaves: getAllSaves,
        saveGame: saveGame,
        deleteSave: deleteSave,
        loadGame: loadGame,
        getMostRecentSave: getMostRecentSave,
        exportSave: exportSave,
        quickSave: quickSave,
        showSaveNotification: showSaveNotification,
        SAVE_VERSION: SAVE_VERSION,
        MAX_SAVES: MAX_SAVES
    };
})();
