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
                UI.openShop();
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

        // Take the resources
        if (effect.cost) {
            if (effect.cost.berries) {
                GameState.resourceCounts.berries -= effect.cost.berries;
            }
            if (effect.cost.nuts) {
                GameState.resourceCounts.nuts -= effect.cost.nuts;
            }
            if (effect.cost.mushrooms) {
                GameState.resourceCounts.mushrooms -= effect.cost.mushrooms;
            }
            if (effect.cost.eggs) {
                GameState.resourceCounts.eggs -= effect.cost.eggs;
            }
        }

        // Give the rewards
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
    // CAN AFFORD CHECK
    // ========================================================================
    /**
     * Check if player has enough resources for a cost.
     *
     * @param {Object} cost - Resource costs { berries: 5, nuts: 3, mushrooms: 2 }
     * @returns {boolean} - true if player can afford it
     *
     * Example:
     *   Effects.canAfford({ berries: 5, nuts: 0, mushrooms: 0 });
     */
    function canAfford(cost) {
        if (!cost) return true;

        // Check each resource type
        if (cost.berries && GameState.resourceCounts.berries < cost.berries) {
            return false;
        }
        if (cost.nuts && GameState.resourceCounts.nuts < cost.nuts) {
            return false;
        }
        if (cost.mushrooms && GameState.resourceCounts.mushrooms < cost.mushrooms) {
            return false;
        }
        if (cost.eggs && GameState.resourceCounts.eggs < cost.eggs) {
            return false;
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
