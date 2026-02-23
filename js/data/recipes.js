/**
 * ============================================================================
 * CRAFTING RECIPES - Pure Data File
 * ============================================================================
 *
 * This file contains all the crafting recipes for the game.
 * Players can craft these items by pressing TAB to open the crafting menu.
 *
 * ============================================================================
 * HOW TO ADD A NEW RECIPE
 * ============================================================================
 *
 * 1. Copy an existing recipe (everything between { and })
 * 2. Paste it at the end of the RECIPES array
 * 3. Change the id, name, description, cost, and effect
 * 4. Save and refresh!
 *
 * ============================================================================
 * RECIPE STRUCTURE
 * ============================================================================
 *
 * Each recipe needs:
 *   - id: A unique identifier (no spaces, use underscores)
 *   - name: The display name players see
 *   - description: What the recipe does
 *   - cost: How many of each resource it requires
 *   - effect: What happens when crafted
 *
 * ============================================================================
 * EFFECT TYPES
 * ============================================================================
 *
 * HEAL - Restore some health
 *   effect: { type: 'heal', amount: 40 }
 *
 * FULL HEAL - Restore health to maximum (100)
 *   effect: { type: 'full_heal' }
 *
 * GIVE SCORE - Add points to score
 *   effect: { type: 'give_score', amount: 100 }
 *
 * GIVE COINS - Add pig coins
 *   effect: { type: 'give_coins', amount: 50 }
 *
 * COMBO - Do multiple things at once!
 *   effect: {
 *       type: 'combo',
 *       effects: [
 *           { type: 'heal', amount: 20 },
 *           { type: 'give_score', amount: 50 }
 *       ]
 *   }
 *
 * ============================================================================
 */

window.RECIPES = [

    // ========================================================================
    // RECIPE 1: Health Potion
    // ========================================================================
    // A basic healing item - good for beginners
    {
        id: 'health_potion',           // Unique ID (no spaces!)
        name: 'Health Potion',         // Name shown in menu
        description: 'Restore 40 health instantly',

        // What resources are needed to craft this?
        // Set to 0 if that resource isn't needed
        cost: {
            berries: 5,
            nuts: 3,
            mushrooms: 2
        },

        // What happens when you craft it?
        effect: {
            type: 'heal',
            amount: 40
        }
    },

    // ========================================================================
    // RECIPE 2: Energy Boost
    // ========================================================================
    // Gives score points - useful for high scores!
    {
        id: 'energy_boost',
        name: 'Energy Boost',
        description: 'Gain 100 score points',

        cost: {
            berries: 10,
            nuts: 5,
            mushrooms: 0               // 0 = not required
        },

        effect: {
            type: 'give_score',
            amount: 100
        }
    },

    // ========================================================================
    // RECIPE 3: Super Healing Elixir
    // ========================================================================
    // Expensive but fully heals you!
    {
        id: 'super_heal',
        name: 'Super Healing Elixir',
        description: 'Restore health to maximum',

        cost: {
            berries: 15,
            nuts: 10,
            mushrooms: 8
        },

        // Full heal doesn't need an amount - always heals to 100
        effect: {
            type: 'full_heal'
        }
    },

    // ========================================================================
    // RECIPE 4: Fortune Charm
    // ========================================================================
    // Very expensive but gives lots of points!
    {
        id: 'fortune_charm',
        name: 'Fortune Charm',
        description: 'Gain 250 score points',

        cost: {
            berries: 20,
            nuts: 15,
            mushrooms: 10
        },

        effect: {
            type: 'give_score',
            amount: 250
        }
    },

    // ========================================================================
    // RECIPE 5: Survival Kit (COMBO EXAMPLE)
    // ========================================================================
    // Shows how to combine multiple effects!
    {
        id: 'survival_kit',
        name: 'Survival Kit',
        description: 'Heal 25 health AND gain 50 points!',

        cost: {
            berries: 8,
            nuts: 6,
            mushrooms: 4
        },

        // Combo effect - does multiple things!
        effect: {
            type: 'combo',
            effects: [
                { type: 'heal', amount: 25 },
                { type: 'give_score', amount: 50 }
            ]
        }
    },

    // ========================================================================
    // RECIPE 6: Gazella Saddle
    // ========================================================================
    // Craft this to ride the fast Saltas Gazella!
    {
        id: 'gazella_saddle',
        name: 'Gazella Saddle',
        description: 'Craft a saddle to ride the swift Saltas Gazella! (Press E near one)',

        cost: {
            seaweed: 10           // Need 10 seaweed
        },

        // Special 'item' effect - gives the player an item
        effect: {
            type: 'item',
            item: 'saddle'
        }
    },

    // ========================================================================
    // RECIPE 7: Wood Sword
    // ========================================================================
    // Craft a sword from thous pine wood to fight enemies!
    {
        id: 'wood_sword',
        name: 'Wood Sword',
        description: 'Craft a wooden sword to fight enemies! (Select from hotbar)',
        requiredScore: 100,

        cost: {
            thous_pine_wood: 15
        },

        effect: {
            type: 'item',
            item: 'wood_sword'
        }
    },

    // ========================================================================
    // RECIPE 8: Wood Axe
    // ========================================================================
    // Craft an axe from thous pine wood to chop trees!
    {
        id: 'wood_axe',
        name: 'Wood Axe',
        description: 'Craft a wooden axe to chop trees for wood! (Select from hotbar)',
        requiredScore: 100,

        cost: {
            thous_pine_wood: 15
        },

        effect: {
            type: 'item',
            item: 'wood_axe'
        }
    },

    // ========================================================================
    // RECIPE 9: Arsen Bomb
    // ========================================================================
    // A devastating area-of-effect weapon!
    {
        id: 'arsen_bomb',
        name: 'Arsen Bomb',
        description: 'A toxic bomb that creates a poison puddle! (Select from hotbar, click to throw)',
        requiredScore: 450,

        cost: {
            glass: 2,
            seaweed: 1,
            arsenic_mushrooms: 3
        },

        effect: {
            type: 'item',
            item: 'arsen_bomb'
        }
    }

];
