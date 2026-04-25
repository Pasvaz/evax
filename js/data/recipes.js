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
    // ⚔️ WEAPONS & TOOLS — The exciting stuff first!
    // ========================================================================

    {
        id: 'wood_sword',
        name: '⚔️ Wood Sword',
        description: 'Craft a wooden sword to fight enemies! (Select from hotbar)',
        requiredScore: 100,
        cost: { thous_pine_wood: 15 },
        effect: { type: 'item', item: 'wood_sword' }
    },
    {
        id: 'wood_axe',
        name: '🪓 Wood Axe',
        description: 'Craft a wooden axe to chop trees for wood! (Select from hotbar)',
        requiredScore: 100,
        cost: { thous_pine_wood: 15 },
        effect: { type: 'item', item: 'wood_axe' }
    },
    {
        id: 'manglecacia_sword',
        name: '⚔️ Manglecacia Sword',
        description: 'A strong sword that deals 5 damage! (Select from hotbar)',
        requiredScore: 200,
        cost: { manglecacia_wood: 10 },
        effect: { type: 'item', item: 'manglecacia_sword' }
    },
    {
        id: 'manglecacia_axe',
        name: '🪓 Manglecacia Axe',
        description: 'A powerful axe that chops any tree! 5 hits, 3 wood per chop. (Select from hotbar)',
        requiredScore: 200,
        cost: { manglecacia_wood: 10 },
        effect: { type: 'item', item: 'manglecacia_axe' }
    },
    {
        id: 'seaspray_birch_sword',
        name: '⚔️ Seaspray Birch Sword',
        description: 'A mighty sword that deals 8 damage! (Select from hotbar)',
        requiredScore: 300,
        cost: { seaspray_birch_wood: 10 },
        effect: { type: 'item', item: 'seaspray_birch_sword' }
    },
    {
        id: 'seaspray_birch_axe',
        name: '🪓 Seaspray Birch Axe',
        description: 'The ultimate axe! Chops any tree in 3 hits, 7 wood per chop! (Select from hotbar)',
        requiredScore: 300,
        cost: { seaspray_birch_wood: 10 },
        effect: { type: 'item', item: 'seaspray_birch_axe' }
    },
    {
        id: 'arsen_bomb',
        name: '💣 Arsen Bomb',
        description: 'A toxic bomb that creates a poison puddle! (Select from hotbar, click to throw)',
        requiredScore: 450,
        cost: { glass: 2, seaweed: 1, arsenic_mushrooms: 3 },
        effect: { type: 'item', item: 'arsen_bomb' }
    },
    {
        id: 'fishing_spear',
        name: '🔱 Fishing Spear',
        description: 'A spear for catching fish! Equip from hotbar, click on fish to spear them.',
        requiredScore: 300,
        cost: { seaspray_birch_wood: 4, bakka_seal_tooth: 1 },
        effect: { type: 'item', item: 'fishing_spear' }
    },

    // ========================================================================
    // 🧥 SURVIVAL GEAR
    // ========================================================================

    {
        id: 'fur_coat',
        name: '🧥 Fur Coat',
        description: 'A warm coat made from animal hide. Required to survive the Snowy Mountains!',
        requiredScore: 100,
        cost: { hide: 5, seaweed: 2 },
        effect: { type: 'item', item: 'fur_coat' }
    },

    // ========================================================================
    // 🛠️ EQUIPMENT & VEHICLES
    // ========================================================================

    {
        id: 'gazella_saddle',
        name: '🐎 Gazella Saddle',
        description: 'Craft a saddle to ride the swift Saltas Gazella! (Press E near one)',
        cost: { seaweed: 10 },
        effect: { type: 'item', item: 'saddle' }
    },
    {
        id: 'basic_rook_boat',
        name: '⛵ Basic Rook Boat',
        description: 'A seaspray birch raft! Select from hotbar, press E to place in water.',
        requiredScore: 300,
        cost: { seaspray_birch_wood: 40 },
        effect: { type: 'item', item: 'basic_rook_boat' }
    },

    // ========================================================================
    // 🧪 POTIONS & CONSUMABLES
    // ========================================================================

    {
        id: 'health_potion',
        name: '❤️ Health Potion',
        description: 'Restore 40 health instantly',
        cost: { berries: 5, nuts: 3, mushrooms: 2 },
        effect: { type: 'heal', amount: 40 }
    },
    {
        id: 'super_heal',
        name: '💖 Super Healing Elixir',
        description: 'Restore health to maximum',
        cost: { berries: 15, nuts: 10, mushrooms: 8 },
        effect: { type: 'full_heal' }
    },
    {
        id: 'survival_kit',
        name: '🎒 Survival Kit',
        description: 'Heal 25 health AND gain 50 points!',
        cost: { berries: 8, nuts: 6, mushrooms: 4 },
        effect: {
            type: 'combo',
            effects: [
                { type: 'heal', amount: 25 },
                { type: 'give_score', amount: 50 }
            ]
        }
    },

    // ========================================================================
    // ⭐ SCORE & COINS
    // ========================================================================

    {
        id: 'energy_boost',
        name: '⚡ Energy Boost',
        description: 'Gain 100 score points',
        cost: { berries: 10, nuts: 5 },
        effect: { type: 'give_score', amount: 100 }
    },
    {
        id: 'fortune_charm',
        name: '🍀 Fortune Charm',
        description: 'Gain 250 score points',
        cost: { berries: 20, nuts: 15, mushrooms: 10 },
        effect: { type: 'give_score', amount: 250 }
    }

];
